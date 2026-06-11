# Cross-Plan Task Coordination

## Purpose

Implement the sync point protocol that ensures correct execution of cross-plan parallelized tasks. Sync points are orchestrator-level gates that validate consistency before committing groups of tasks atomically.

## Sync Point Protocol

### Phase 1: Pre-Sync Validation (Before Group Executes)

```pseudocode
preSyncValidation(group, groupId):
  # Validate task status state machine
  for task in group:
    if NOT validateTaskStatusTransition(task, newStatus="in-progress"):
      return ERROR("Status machine violation for {task.unitId}")

  # Verify all dependencies in previous groups are met
  for task in group:
    for dep in task.dependencies:
      depGroup = findGroupContainingTask(dep)
      if depGroup.syncPointId >= groupId:
        # Dependency is in this group or later
        return ERROR("Dependency {dep} not available before group {groupId}")

      if NOT isTaskStatus(dep, ["done", "for-review", "in-progress"]):
        return ERROR("Dependency {dep} has invalid status")

  # Verify file conflict constraints
  fileMap = buildFileMap(group)
  for file, tasks in fileMap.items():
    if len(tasks) > 1:
      return ERROR("File conflict in group: {file} in {tasks}")

  return SUCCESS
```

### Phase 2: Atomic Execution Window

**During group execution:**

1. Subagents run in parallel (isolated; no coordination)
2. Each subagent:
   - Reads task file and context
   - Implements work
   - Runs targeted tests
   - Saves changes to working directory
   - Updates task frontmatter (status: for-review)
   - Does NOT commit or push

3. Orchestrator polls for completion

### Phase 3: Sync Point - Validation & Commit

**Immediately after all subagents in group complete:**

```pseudocode
executeSyncPoint(groupId, syncPointId, groupResults):
  LOG("Entering sync point {syncPointId} (after group {groupId})")

  # Step 1: Validate all tasks completed
  for task in group:
    if NOT groupResults.contains(task.unitId):
      LOG("Task {task.unitId} missing from results")
      return FAILURE("Task {task.unitId} did not complete")

    result = groupResults[task.unitId]
    if result.status == FAILED:
      return FAILURE("Task {task.unitId} failed: {result.error}")

  # Step 2: File conflict validation
  LOG("Validating file conflicts across group...")
  allModifiedFiles = []
  fileToTasks = {}

  for task in group:
    result = groupResults[task.unitId]
    modifiedFiles = result.files_modified  # From subagent result
    allModifiedFiles.extend(modifiedFiles)

    for file in modifiedFiles:
      if file NOT in fileToTasks:
        fileToTasks[file] = []
      fileToTasks[file].append(task.unitId)

  # Check for conflicts
  for file, tasks in fileToTasks.items():
    if len(tasks) > 1:
      LOG("✗ File conflict: {file} modified by {tasks}")
      return FAILURE("File conflict detected in sync point")

  # Step 3: Git state validation
  LOG("Validating git state...")
  gitStatus = runCommand("git status --porcelain")

  # Count modified files
  modifiedByUs = 0
  for line in gitStatus.split("\n"):
    if line.startswith(" M ") or line.startswith("M  "):
      file = line[3:]
      if NOT file in allModifiedFiles:
        # File modified but not by our tasks
        LOG("✗ Unexpected file modified: {file}")
        return FAILURE("Unexpected changes in working directory")
      modifiedByUs += 1

  if modifiedByUs != len(allModifiedFiles):
    LOG("✗ File count mismatch: expected {len(allModifiedFiles)}, found {modifiedByUs}")
    return FAILURE("File count mismatch")

  # Step 4: Task status validation
  LOG("Validating task statuses...")
  for task in group:
    frontmatter = readTaskFrontmatter(task.file)
    if frontmatter.status != "for-review":
      LOG("✗ Task {task.unitId} status is {frontmatter.status}, expected for-review")
      return FAILURE("Task status not for-review")

  # Step 5: Run targeted test suite (group scope)
  LOG("Running targeted test suite...")
  testResult = runTargetedTests(allModifiedFiles)

  if NOT testResult.passed:
    LOG("✗ Tests failed: {testResult.failures}")
    return FAILURE("Test suite failed in sync point")

  # All validations passed!
  LOG("✓ All validations passed; proceeding to commit")
  return SUCCESS
```

### Phase 4: Atomic Commit

```pseudocode
atomicCommit(groupId, syncPointId, group, allModifiedFiles):
  LOG("Starting atomic commit for sync point {syncPointId}...")

  try:
    # Step 1: Stage all modified files
    LOG("Staging {len(allModifiedFiles)} files...")
    for file in allModifiedFiles:
      runCommand("git add '{file}'")

    # Verify staged correctly
    stagedOutput = runCommand("git diff --cached --name-only")
    stagedFiles = stagedOutput.split("\n")
    if len(stagedFiles) != len(allModifiedFiles):
      return ERROR("Staged file count mismatch")

    # Step 2: Create commit message
    unitIds = ",".join([t.unitId for t in group])
    filesChanged = len(allModifiedFiles)
    summary = summarizeGroupWork(group)  # 1-line summary

    commitMessage = multiline(
      "[GROUP-{groupId}] {unitIds}",
      "",
      summary,
      "",
      "Sync point: {syncPointId}",
      "Tasks: {len(group)}",
      "Files: {filesChanged}",
      "Cross-plan: {hasCrossPlanDeps(group)}"
    )

    LOG("Commit message:\n{commitMessage}")

    # Step 3: Commit atomically
    LOG("Committing...")
    commitResult = runCommand("git commit -m '{commitMessage}'")
    commitHash = extractCommitHash(commitResult)

    LOG("✓ Commit created: {commitHash}")

    # Step 4: Push to branch
    LOG("Pushing to branch...")
    pushResult = runCommand("git push origin {currentBranch}")
    LOG("✓ Pushed successfully")

    # Step 5: Update task INDEX
    LOG("Updating task INDEX.md...")
    updateTaskIndex(group, "done")

    # Step 6: GitHub sync (if enabled)
    if githubEnabled:
      LOG("Syncing status to GitHub Issues...")
      for task in group:
        if task.githubIssue:
          syncGitHubStatus(task.githubIssue, "done", commitHash)

    # Success!
    return {
      success: true,
      syncPointId: syncPointId,
      commitHash: commitHash,
      filesCommitted: len(allModifiedFiles),
      tasksCompleted: len(group),
      timestamp: now()
    }

  catch Exception as e:
    LOG("✗ Commit failed: {e.message}")
    return {
      success: false,
      error: e.message,
      needsManualRecovery: true
    }
```

### Phase 5: Handle Sync Point Failure

If any validation fails or commit fails:

```pseudocode
handleSyncPointFailure(groupId, syncPointId, error):
  LOG("✗ Sync point {syncPointId} failed: {error.message}")

  # Step 1: Rollback working directory
  LOG("Rolling back working directory...")
  runCommand("git checkout .")  # Discard all changes
  runCommand("git clean -fd")   # Remove untracked files
  LOG("✓ Working directory cleaned")

  # Step 2: Stash subagent results
  LOG("Stashing results for manual inspection...")
  for task in group:
    backupDir = "docs/tasks/.failed-backup/{groupId}/{task.unitId}"
    copyModifiedFiles(task.files_modified, backupDir)
  LOG("✓ Results backed up")

  # Step 3: Mark tasks as blocked
  LOG("Marking tasks as blocked...")
  for task in group:
    updateTaskStatus(task, "blocked")
    addTaskComment("Blocked by sync point failure: {error.message}")

  # Step 4: Ask user
  userAction = promptUser({
    title: "Sync Point Failed",
    message: "Sync point {syncPointId} failed with error: {error.message}",
    options: [
      "Retry group",
      "Skip group (mark tasks as done manually)",
      "Abort workflow"
    ],
    recommendation: "Investigate error; retry after fixing issues"
  })

  return userAction
```

## Error Recovery Strategies

### Strategy 1: Retry (Recommended)

**Preconditions:**

- Rollback completed successfully
- Working directory is clean
- Git state is valid

**Action:**

```
1. Ask user to fix any issues (if needed)
2. Reset all tasks in group to "to-do" status
3. Spawn subagents again
4. Retry sync point
```

### Strategy 2: Skip Group

**Preconditions:**

- User explicitly chooses to skip
- Prior groups completed successfully

**Action:**

```
1. Mark all tasks in group as "done" (manually)
2. Create manual commit with message: "[GROUP-{groupId}] SKIPPED (manual)"
3. Continue to next group
4. (Note: Creates gap in work; not recommended for production)
```

### Strategy 3: Abort

**Action:**

```
1. Mark all remaining tasks as blocked
2. Create session summary document
3. Save all partial results for manual recovery
4. Exit workflow
5. User can manually fix and retry later
```

## Rollback Procedures

### Complete Rollback (Group-Level)

```pseudocode
rollbackGroup(groupId):
  # Discard all changes in working directory
  git checkout .
  git clean -fd

  # Reset all task statuses to pre-group values
  for task in group:
    task.status = "to-do"
    updateTaskFrontmatter(task)

  # Delete any partially created files
  deletePartialFiles(groupId)

  # Verify clean state
  gitStatus = git status --porcelain
  if gitStatus != "":
    ERROR("Rollback incomplete; manual intervention needed")

  return SUCCESS
```

### Partial Rollback (Emergency)

If rollback fails:

```
1. Manual git commands: git reset --hard HEAD
2. Force clean: git clean -xfd (DANGEROUS - removes untracked)
3. Manual file cleanup
4. Report to user; ask for manual verification
```

## Sync Point Logging

Every sync point produces a detailed log entry:

```yaml
syncPoint:
  id: 2
  groupId: 1
  timestamp: 2026-06-10T14:35:22Z
  status: SUCCESS # or FAILED

  validations:
    tasksCompleted: 3
    testsPass: true
    fileConflicts: 0
    gitState: CLEAN
    taskStatusesValid: true

  commit:
    hash: abc1234def5678
    message: "[GROUP-1] S2,U2,T1: Implemented API endpoints"
    filesChanged: 5
    linesAdded: 247
    linesRemoved: 12

  timing:
    preValidation: 2.3s
    commit: 1.1s
    push: 3.5s
    totalTime: 6.9s

  tasks:
    - unitId: S2
      status: done
      filesModified: [src/api.ts, src/routes.ts]
      testsPassed: 12

    - unitId: U2
      status: done
      filesModified: [src/pages/dashboard.tsx, src/api-client.ts]
      testsPassed: 8

    - unitId: T1
      status: done
      filesModified: [docs/schema.md]
      testsPassed: 0 # (non-code)

  github:
    issuesUpdated: 2
    commentPosted: "Deployed in commit abc1234"
```

## Testing Sync Points

### Test Case 1: Successful Sync (Happy Path)

```
Setup:
  - 2 tasks in group (no file conflicts)
  - All dependencies met
  - Tests pass

Validation:
  ✓ All tasks completed
  ✓ No file conflicts
  ✓ Git state valid
  ✓ Tests pass

Result:
  ✓ Commit created
  ✓ Push successful
  ✓ Tasks marked done
```

### Test Case 2: File Conflict in Group

```
Setup:
  - 2 tasks both modify src/api.ts

Validation:
  ✗ File conflict: src/api.ts modified by [S1, S2]

Handling:
  ✓ Rollback completed
  ✓ Tasks marked blocked
  → Ask user to retry with sequential mode
```

### Test Case 3: Test Failure at Sync

```
Setup:
  - Tasks complete but tests fail

Validation:
  ✓ All tasks completed
  ✓ No file conflicts
  ✗ Tests failed: 3 failures

Handling:
  ✓ Rollback completed
  ✓ Tasks marked blocked
  → User can retry after fixing tests
```
