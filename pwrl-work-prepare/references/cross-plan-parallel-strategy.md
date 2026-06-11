# Cross-Plan Parallel Execution Strategy

## Overview

This document describes the complete orchestration strategy for executing tasks in parallel across multiple plans, with atomic sync points between execution groups.

## Core Concept: Group-Based Parallelization

Instead of a flat linear execution or simple "parallel vs serial" choice, we use a **group-based** approach:

```
Plan A: [S1] → [S2] → [S3]
Plan B: [U1] → [U2]
Plan C: [T1]

Dependency: S1 depends on U1
            S2 depends on T1

Grouping:
  Group 0: [U1]         # No dependencies; must run first
  Sync 0
  Group 1: [S1, T1]     # Both depend only on Group 0 tasks; can parallelize
  Sync 1
  Group 2: [S2, U2]     # Both depend only on Group 1 tasks; can parallelize
  Sync 2
  Group 3: [S3]         # Depends on Group 2
  Sync 3

Execution:
  U1 alone (5 min)
  ↓ [Sync: validate, commit]
  S1 || T1 parallel (S1: 3 min, T1: 2 min → wall-clock 3 min)
  ↓ [Sync: validate, commit]
  S2 || U2 parallel (S2: 4 min, U2: 2 min → wall-clock 4 min)
  ↓ [Sync: validate, commit]
  S3 alone (2 min)

Total: 5 + 3 + 4 + 2 = 14 minutes (vs 22 minutes sequential)
```

## Why Sync Points?

Sync points are essential for **correctness** when tasks span multiple plans:

1. **Atomic commits**: All tasks in a group commit together (all-or-nothing)
2. **Cross-plan consistency**: Verify no conflicts between tasks from different plans
3. **Single point of truth**: One commit per group = clear audit trail
4. **Error isolation**: If one task in a group fails, entire group rolled back

## Execution Flow (Detailed)

### Phase 1: Plan Discovery & Grouping

1. Scan `docs/plans/*.md` for all plans
2. Extract all units and dependencies (including cross-plan)
3. Detect cycles (fail fast if found)
4. Generate parallelization groups using topological sort algorithm
5. Output: list of groups with sync points

### Phase 2: Pre-Execution Validation

**Before spawning any subagents:**

1. Verify all task status transitions are valid (state machine check)
2. Verify all dependencies are resolvable
3. Verify no duplicate unit-ids globally
4. Verify all required files exist (task files, plan files)
5. Check GitHub integration status (if enabled)
6. Confirm branch strategy with user

**If any validation fails**: Stop, report errors, ask user to fix and retry

### Phase 3: Group-by-Group Execution

**For each parallelization group:**

#### Step 3a: Pre-Group Validation

```pseudocode
validateGroup(group, globalGraph, allTasks):
  # Check dependencies met
  for task in group:
    deps = globalGraph[task.unitId]
    for dep in deps:
      depTask = findTask(dep)
      if depTask.status not in ["done", "for-review", "in-progress"]:
        ERROR("Dependency not ready: {dep} is {depTask.status}")
        return FAILURE

  # Check file conflicts
  fileMap = buildFileMap(group)
  for file, tasksModifying in fileMap.items():
    if len(tasksModifying) > 1:
      ERROR("File conflict in group: {file} modified by {tasksModifying}")
      return FAILURE

  return SUCCESS
```

#### Step 3b: Spawn Parallel Subagents

```pseudocode
spawnGroup(group, groupId, syncPointId):
  subagents = []

  for task in group:
    # Spawn subagent with cross-plan awareness
    subagent = spawnSubagent({
      taskFile: task.file,
      taskUnitId: task.unitId,
      groupId: groupId,
      syncPointId: syncPointId,
      constraints: {
        noFullTestSuite: true,
        noCommit: true,
        reportConflicts: true
      }
    })
    subagents.append(subagent)

  return subagents
```

**Subagent Constraints:**

- Must NOT run full test suite (only targeted tests)
- Must NOT commit changes (orchestrator handles commits)
- Must report any file conflicts detected during execution
- Must report test failures
- Must save all changes to working directory

#### Step 3c: Wait for Group Completion

```pseudocode
waitForGroupCompletion(subagents, timeoutSeconds=3600):
  startTime = now()
  results = {}

  while any(s not in [DONE, FAILED] for s in subagents):
    for subagent in subagents:
      if subagent.status == DONE:
        results[subagent.taskId] = subagent.result
      elif subagent.status == FAILED:
        LOG("Task {subagent.taskId} failed")

      if (now() - startTime) > timeoutSeconds:
        KILL_ALL_SUBAGENTS(subagents)
        return ERROR("Timeout")

    sleep(1)  # Poll every second

  return results
```

#### Step 3d: Sync Point - Validation

```pseudocode
syncPointValidation(group, results):
  # Check each task completed
  for task in group:
    if task.unitId not in results:
      return ERROR("Task {task.unitId} did not complete")
    if results[task.unitId].status == FAILED:
      return ERROR("Task {task.unitId} failed")

  # Check file conflicts (second validation)
  filesModified = collectAllModifiedFiles(results)
  fileMap = buildFileMap(filesModified)
  for file, tasksModifying in fileMap.items():
    if len(tasksModifying) > 1:
      return ERROR("File conflict detected: {file} modified by {tasksModifying}")

  # Check git state (nothing uncommitted outside this group)
  gitStatus = getGitStatus()
  if gitStatus.hasUncommittedChanges:
    return ERROR("Uncommitted changes outside of group")

  # Validate all task statuses updated correctly
  for task in group:
    if task.status != EXPECTED_STATUS:
      return ERROR("Task {task.unitId} status mismatch")

  return SUCCESS
```

#### Step 3e: Atomic Commit (Sync Point Action)

```pseudocode
atomicCommit(group, groupId, syncPointId, results):
  try:
    # Stage all changes from all tasks in group
    stagedFiles = collectAllModifiedFiles(results)
    for file in stagedFiles:
      git.add(file)

    # Create commit message
    unitIds = [task.unitId for task in group]
    summary = summarizeChanges(results)
    message = "[GROUP-{groupId}] {unitIds.join(", ")}: {summary}"

    # Commit atomically
    commitHash = git.commit(message)

    # Push to branch
    git.push()

    # Log
    LOG("✓ Sync point {syncPointId} completed: {len(group)} tasks, {len(stagedFiles)} files, commit {commitHash}")

    return {
      success: true,
      commitHash: commitHash,
      filesChanged: len(stagedFiles),
      taskCount: len(group)
    }

  catch Error as e:
    LOG("✗ Sync point {syncPointId} failed: {e.message}")
    return {
      success: false,
      error: e.message
    }
```

#### Step 3f: Handle Sync Point Failure

```pseudocode
handleSyncPointFailure(groupId, results):
  # Rollback working directory to pre-group state
  git.stash()  # Save changes
  LOG("Changes stashed; working directory rolled back")

  # Mark all tasks in group as blocked
  for task in group:
    task.status = "blocked"
    updateTaskFrontmatter(task)

  # Ask user
  userChoice = ask({
    title: "Sync point {syncPointId} failed",
    options: ["Retry group", "Skip group", "Abort workflow"],
    message: "Error: {errorMessage}"
  })

  if userChoice == "Retry":
    return RETRY
  else if userChoice == "Skip":
    return SKIP
  else:
    return ABORT
```

### Phase 4: After All Groups Complete

1. Run full test suite (not just targeted tests)
2. Verify no integration issues across all groups
3. Update task INDEX.md
4. Call GitHub sync-status if enabled
5. Return execution results summary

## Atomicity Guarantees

**Per-group atomicity:**

- All tasks in group commit together or all rollback
- No partial commits within a group

**Between-group ordering:**

- Groups execute strictly sequentially
- Group N+1 starts only after Group N syncs successfully
- If Group N fails, Group N+1 is not attempted

**Cross-plan consistency:**

- Tasks from Plan A and Plan B in same group commit as one unit
- Impossible for Git to be in partially committed state

## Error Handling

| Scenario                    | Handling                                            |
| --------------------------- | --------------------------------------------------- |
| Pre-group validation fails  | Stop group; ask user to fix; retry or skip          |
| Subagent timeout            | Kill subagent; mark task as failed; ask user        |
| Subagent crashes            | Detect missing results; ask user to retry           |
| Sync point validation fails | Rollback; ask user to retry, skip, or abort         |
| Commit fails (git error)    | Rollback; ask user to resolve git issue; retry      |
| File conflict in group      | Rollback; fail group; force sequential re-execution |
| Test failure in group       | Rollback; mark tasks as blocked; ask user           |

## Practical Example: Real Multi-Plan Scenario

**Workspace setup:**

```
Plan A (Backend): 3 units (S1, S2, S3)
  S1: User authentication → src/auth.ts
  S2: User API endpoints → src/api.ts, src/models.ts
  S3: Error handling → src/errors.ts
  Dependencies: S1 → S2 → S3

Plan B (Frontend): 3 units (U1, U2, U3)
  U1: Login page → src/pages/login.tsx, src/components/form.tsx
  U2: Dashboard → src/pages/dashboard.tsx, src/api-client.ts
  U3: Error display → src/components/error.tsx
  Dependencies: U1 → U2 → U3
  Cross-plan: U2 depends on S2 (needs user API)

Plan C (Database): 1 unit (T1)
  T1: User schema → src/db/schema.sql
  Dependencies: none
  Cross-plan: S1 depends on T1 (needs database)
```

**Execution plan generated:**

```
Group 0: [T1]              # No deps
Sync 0
Group 1: [S1, U1]          # Both depend only on T1
Sync 1
Group 2: [S2, U2]          # S2 depends on S1; U2 depends on S1+U1
Sync 2
Group 3: [S3, U3]          # S3 depends on S2; U3 depends on U2
Sync 3

Timeline:
  T1 (5 min)
  ↓ [Sync]
  S1 || U1 (max 5 min)
  ↓ [Sync]
  S2 || U2 (max 7 min)
  ↓ [Sync]
  S3 || U3 (max 4 min)

Total: 5 + 5 + 7 + 4 = 21 minutes
(vs 38 minutes if fully sequential)
```

## Performance Benefits

For the example above:

| Approach             | Duration        |
| -------------------- | --------------- |
| Fully sequential     | 38 minutes      |
| Group-based parallel | 21 minutes      |
| **Speedup**          | **1.8x faster** |

The speedup increases with:

- More independent plans
- Longer execution times
- More tasks per group
