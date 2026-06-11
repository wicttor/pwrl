# Error Recovery & Rollback

## Overview

This document defines error handling and recovery strategies for both the pwrl-planner and pwrl-work agents. Recovery is designed to be safe, transparent to the user, and minimize data loss.

## General Principles

1. **Fail fast**: Detect errors early; don't proceed with invalid state
2. **Preserve state**: Save intermediate work before cleanup
3. **Ask user**: Don't make recovery decisions unilaterally
4. **Retry capability**: Most operations can be retried after fixing root cause
5. **Audit trail**: Log all failures and recovery actions

## Phase-Level Error Recovery

### Planner Agent (pwrl-plan)

#### Phase 1: Scope (pwrl-plan-scope)

**Failure modes:**

- Input not found or unreadable
- Domain validation fails (non-software task)
- Learnings lookup fails

**Recovery:**

```
If input error:
  → Ask user: "Provide different input file or skip scoping?"
  → Option 1: Provide alternate path; retry
  → Option 2: Continue with empty scope (not recommended)
  → Option 3: Cancel

If domain validation fails:
  → Ask user: "This appears to be non-software work. Continue anyway?"
  → If yes: Proceed (may get suboptimal results)
  → If no: Exit; user can reformulate as software task

If learnings lookup fails:
  → Warn: "Could not access learnings; continuing without them"
  → Continue with empty learnings list
```

**Retry limit:** 3 attempts, then ask user to fix manually

#### Phase 2: Research (pwrl-plan-research)

**Failure modes:**

- Local codebase search fails or returns no results
- External research unavailable (network error, API rate limit)
- Findings are contradictory or ambiguous

**Recovery:**

```
If local search fails:
  → Warn: "Could not scan codebase for patterns"
  → Continue with external research only

If external research unavailable:
  → Warn: "External research unavailable (network error)"
  → Continue with local research only
  → Option: User can manually provide research findings

If high-risk detected but unclear:
  → Ask user: "High-risk area detected. Proceed to design or get clarification?"
  → Options: Proceed / Clarify / Skip this area
```

#### Phase 3: Design (pwrl-plan-design)

**Failure modes:**

- Unit extraction fails (malformed plan structure)
- Dependency cycle detected
- Too many units (>20) or too few (<1)

**Recovery:**

```
If unit extraction fails:
  → Show: "Could not extract units from plan. Showing raw plan."
  → Option: Ask user to provide manual unit list
  → Retry with manual input

If cycle detected:
  → Show: "Circular dependency: {cycle path}"
  → Ask user: "Fix cycle manually or redesign?"
  → After fix: Retry cycle detection

If too many/few units:
  → Warn: "Plan has {N} units (optimal: 3–8)"
  → Ask user: "Proceed anyway or redesign?"
  → If proceed: Apply complexity adjustment
```

#### Phase 4: Generate (pwrl-plan-generate)

**Failure modes:**

- Template loading fails
- Filename collision (plan already exists with same date+number)
- Learnings lookup fails
- File write fails

**Recovery:**

```
If template missing:
  → Use inline fallback template
  → Warn: "Using fallback template (some formatting may differ)"
  → Continue

If filename collision:
  → Auto-increment NNN: 001 → 002 → 003
  → Inform user: "Using filename: {new_filename}"
  → Continue

If learnings unavailable:
  → Skip learnings embedding
  → Warn: "Learnings section will be empty"
  → Continue

If file write fails:
  → Ask user: "Save failed. Check disk space and permissions."
  → Options: Retry / Save to alternate location / Cancel
  → On retry: Verify permissions and retry
```

### Work Agent (pwrl-work)

#### Phase 1: Triage

**Failure modes:**

- Input not found or unreadable
- Circular dependency detected
- Task references non-existent plan

**Recovery:**

```
If input not found:
  → Ask user: "File not found. Provide different path or list recent tasks?"
  → Option 1: Provide new path; retry
  → Option 2: List recent tasks; user picks one
  → Option 3: Cancel

If circular dependency:
  → Show: "Circular dependency: {cycle path}"
  → Ask user: "Fix dependencies before retry?"
  → After fix: Retry

If plan reference missing:
  → Warn: "Task references non-existent plan"
  → Ask user: "Continue anyway (risky) or cancel?"
```

#### Phase 2: Prepare

**Failure modes:**

- Branch creation fails (git error)
- Task file creation fails
- GitHub integration check fails
- Malformed task frontmatter

**Recovery:**

```
If branch creation fails:
  → Ask user: "Git error. Resolve manually and retry? Or commit directly?"
  → After manual fix: Retry branch creation
  → If direct commit: Skip branch creation, proceed

If task file fails:
  → Log error with details
  → Ask user: "Create task files manually or skip?"
  → If skip: Proceed with inline task list

If GitHub integration fails:
  → Warn: "GitHub sync unavailable; continuing without sync"
  → Continue (non-critical failure)

If frontmatter malformed:
  → Show: Task file details and error
  → Ask user: "Fix frontmatter manually and retry?"
  → After fix: Retry
```

#### Phase 3: Execute

**Failure modes:**

- Subagent crashes
- Test suite fails
- File conflict detected during parallel execution
- Timeout
- Circular dependency in cross-plan graph

**Recovery:**

```
If subagent crashes:
  → Log stack trace
  → Ask user: "Subagent crashed. Retry with same task?"
  → Retry options: Retry inline mode / Retry with smaller scope / Skip task / Abort

If test fails:
  → Show: Test failure details
  → Ask user: "Fix code and retry? Or skip to review?"
  → If fix: User makes changes; retry tests

If file conflict (parallel mode):
  → Pause all running subagents
  → Show: Which tasks conflict
  → Ask user: "Retry in serial mode or abort?"
  → If serial: Kill parallel subagents; restart in SERIAL mode

If timeout:
  → Show: "Subagent did not complete within time limit"
  → Ask user: "Increase timeout and retry / Skip task / Abort?"
  → If retry: Kill previous subagent; spawn new one with longer timeout

If circular dependency:
  → Show: Cycle path with plan annotations
  → Ask user: "Fix dependencies before retry?"
  → After fix: Restart triage and planning
```

#### Phase 4: Review

**Failure modes:**

- Code pattern analysis fails
- Duplication detection fails
- System checks fail

**Recovery:**

```
If pattern analysis fails:
  → Warn: "Could not analyze patterns; skipping pattern verification"
  → Continue to next check

If duplication detection fails:
  → Warn: "Duplication check skipped"
  → Continue (user can manually review)

If system checks fail:
  → Show: Which checks failed and why
  → Ask user: "Proceed anyway or retry with fixes?"
  → If proceed: Mark as manual review needed
```

#### Phase 5: Ship

**Failure modes:**

- Commit fails (git error)
- Push fails (network, auth)
- GitHub sync fails
- Branch cleanup fails

**Recovery:**

```
If commit fails:
  → Ask user: "Git commit failed. Resolve manually?"
  → Options: Fix and retry / Skip commit / Abort
  → After fix: Retry

If push fails:
  → Warn: "Could not push to remote"
  → Ask user: "Retry push? Manual push later?"
  → If retry: Retry with exponential backoff

If GitHub sync fails:
  → Warn: "Could not update GitHub Issues"
  → Ask user: "Update manually later? Continue anyway?"
  → Continue (non-critical failure)

If branch cleanup fails:
  → Warn: "Could not delete feature branch"
  → Log branch name for manual cleanup
  → Continue (non-critical)
```

## Checkpoints: User Approval at Each Phase

After each major phase, prompt user to proceed or adjust:

### Planner Checkpoints

```
After S1 Scope:
  "Scoped context:"
  - Problem: ...
  - Domain: ...
  - Criteria: ...

  [Proceed to Research / Adjust scope / Cancel]

After S2 Research:
  "Research findings:"
  - Patterns: ...
  - Risk level: ...

  [Proceed to Design / Additional research / Cancel]

After S3 Design:
  "Implementation units (5 units):"
  - U1: ...
  - U2: ...
  - (etc)

  [Proceed to Generation / Adjust units / Cancel]

After S4 Generate:
  "Plan saved: docs/plans/2026-06-10-002-plan.md"

  [Execute with /pwrl-work / Create tasks / Review plan / Done]
```

### Work Checkpoints

```
After Triage:
  "Input classified:"
  - Type: Task file
  - Unit: S1
  - Dependencies: []

  [Proceed / Adjust / Cancel]

After Prepare:
  "Ready to execute:"
  - Branch: feat/pwrl-work
  - Tasks: 3
  - Mode: Serial

  [Proceed / Review tasks / Change mode / Cancel]

After Execute:
  "Tasks completed:"
  - S1: ✓ done
  - S2: ✓ done
  - S3: ✓ done
  - Tests: ✓ passed

  [Proceed to review / Retry failed / Cancel]

After Review:
  "Code review complete:"
  - Duplication found: 2 helpers extracted
  - Pattern issues: 0
  - System checks: ✓ all pass

  [Ship / Retry / Cancel]

After Ship:
  "Shipped successfully!"
  - Commit: abc1234
  - Branch: feat/pwrl-work

  [End session / Review commits / New task]
```

## Rollback Procedures

### Agent-Level Rollback

If user cancels at checkpoint:

```pseudocode
rollback(phase):
  if phase == "scope":
    # Nothing to roll back; just exit
    return

  else if phase == "research":
    # Delete research intermediate file (if persisted)
    delete("docs/plans/.research/...")

  else if phase == "design":
    # Delete design intermediate file
    delete("docs/plans/.design/...")

  else if phase == "generate":
    # Delete generated plan file (if user cancels before confirming)
    delete("docs/plans/...")

  elif phase == "triage":
    # Nothing to roll back
    return

  elif phase == "prepare":
    # Delete created task files (if any)
    for taskFile in createdTasks:
      delete(taskFile)
    # Delete branch (if created)
    if branchCreated:
      git checkout original_branch
      git branch -D feat_branch

  elif phase == "execute":
    # Kill any running subagents
    killAllSubagents()
    # Rollback working directory
    git checkout .
    git clean -fd
    # Mark all tasks as blocked
    for task in group:
      updateTaskStatus(task, "blocked")

  LOG("Rolled back from phase: {phase}")
```

## Emergency Fallback

If normal recovery fails:

```
1. Save current state to backup directory:
   cp -r docs/plans docs/plans.backup-{timestamp}
   cp -r docs/tasks docs/tasks.backup-{timestamp}

2. Clean up git:
   git stash
   git reset --hard HEAD

3. Provide user with recovery summary:
   "Manual intervention required. Saved state in:
   - docs/plans.backup-2026-06-10-14-30-45/
   - docs/tasks.backup-2026-06-10-14-30-45/"

4. Ask user: "Review backup and manually restore if needed"
```

## Testing Error Scenarios

| Scenario            | Test Approach                                               |
| ------------------- | ----------------------------------------------------------- |
| File not found      | Move file; attempt operation; verify recovery prompt        |
| Git error           | Corrupt .git; attempt branch creation; verify recovery      |
| Network timeout     | Disable network; attempt external research; verify recovery |
| Circular dependency | Manually create cycle; verify detection and rollback        |
| File conflict       | Two tasks modify same file; verify conflict detection       |
| Test failure        | Intentionally break test; verify handling                   |
| Timeout             | Long-running subagent; wait for timeout; verify recovery    |

## Logging Error Recovery

All error recovery actions logged with timestamps:

```
[2026-06-10T14:35:22Z] ERROR: Subagent crashed (task S1)
[2026-06-10T14:35:23Z] RECOVERY: Asked user to retry
[2026-06-10T14:35:45Z] INFO: User chose to retry
[2026-06-10T14:35:46Z] ACTION: Spawning new subagent for S1
[2026-06-10T14:35:50Z] SUCCESS: S1 completed after retry
```

Log file: `.pwrl-debug.log` (for reference by developers)
