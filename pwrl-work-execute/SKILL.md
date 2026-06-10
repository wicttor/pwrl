---
name: pwrl-work-execute
description: Execute tasks with quality gates (inline, serial, or parallel modes)
argument-hint: "[Task list context from pwrl-work-prepare, execution mode]"
---

# pwrl-work-execute — Task Execution Engine

**Purpose:** Core execution engine that coordinates task implementation across three modes (inline, serial, parallel), enforces quality gates, manages task status progression, and integrates GitHub status syncing. Orchestrator agents call this skill after preparation.

## Input

Accepts prepared context from `pwrl-work-prepare`:

```yaml
taskList:
  source: plan | task | prompt
  taskCount: 5
  tasks:
    - unit-id: S1
      file: docs/tasks/in-progress/2026-06-05-s1-task.md
      dependencies: []
      status: in-progress
executionMode: inline | serial | parallel
executionModeReasoning: "..."
githubIntegration:
  enabled: true | false
  tasksLinked: 3
  readyForSync: true | false
```

## Output: Execution Results

```yaml
mode: serial
taskCount: 5
tasksCompleted: 5
tasksFailed: 0
testsPassed: true
commitHash: abc1234
results:
  - unit-id: S1
    taskFile: docs/tasks/for-review/2026-06-05-s1-task.md
    status: for-review
    testsPassed: true
    summary: "Implemented feature X"
```

---

## Execution Modes

### Inline Mode (1-2 Tasks)

Direct execution without subagents, suitable for small work.

**When used:** 1-2 tasks, user interaction expected, small scope.

**Per-task flow:**

1. **Read context:**
   - Load task file and extract goal, implementation steps, test scenarios, acceptance criteria
   - Read files listed in task's `files` field
   - Check existing tests related to task scope
   - Identify codebase patterns and conventions

2. **Mark in-progress:**
   - Update task frontmatter: `status: in-progress`
   - If using directory org: move `to-do/` → `in-progress/`
   - Call S4 (pwrl-work-sync-status) if GitHub enabled

3. **Implement test-first (TDD):**
   - Write failing test for new behavior
   - Confirm test fails (red)
   - Implement minimal code to pass test (green)
   - Run test to confirm it passes
   - Refactor for clarity (refactor)
   - Repeat for each behavior slice

4. **Run quality gates:**
   - Run affected tests (not full suite)
   - Verify code follows project patterns
   - Run system checks (callbacks, events, failure paths, alternate entry points)

5. **Mark for-review on success:**
   - Update frontmatter: `status: for-review`
   - Move `in-progress/` → `for-review/`
   - Update `docs/tasks/INDEX.md`
   - Call S4 for GitHub sync if enabled

6. **Return result:**

```yaml
mode: inline
taskCount: 1
tasksCompleted: 1
tasksFailed: 0
testsPassed: true
results:
  - unit-id: U1
    status: for-review
    testsPassed: true
    summary: "Implemented email validation"
```

---

### Serial Mode (3+ Dependent Tasks)

Sequential subagent execution for tasks with dependencies.

**When used:** 3+ tasks, dependencies exist between tasks, or file conflicts detected.

**Flow:**

1. **Determine execution order:**
   - Parse dependency graph from task list
   - Topological sort: tasks with no dependencies first, then their dependents
   - Build ordered execution queue

2. **For each task (sequentially):**

   **a) Spawn subagent:**
   - Pass: task file path, task context, constraint flags
   - Wait for subagent to complete

   **b) Collect results:**
   - Read subagent execution result (test status, verification summaries)
   - Verify task status is `for-review` or `blocked`

   **c) Check progress:**
   - Log: `[N/M] Task [unitId] completed: [status] ✓`
   - If blocked: pause, ask user to resolve, retry or skip

3. **After all tasks complete:**

   **a) Run full targeted test suite (orchestrator):**
   - Run test suite covering all files modified by all tasks
   - Verify no integration issues between sequentially executed tasks
   - If tests fail: investigate, mark affected tasks as blocked

   **b) Stage and commit (orchestrator responsibility):**
   - Stage all changes
   - Create commit message with unit IDs and summary
   - Push to branch
   - Log commit hash

4. **Return aggregated result:**

```yaml
mode: serial
taskCount: 5
tasksCompleted: 5
tasksFailed: 0
testsPassed: true
commitHash: abc1234
results:
  - unit-id: S1, status: for-review, testsPassed: true
  - unit-id: S2, status: for-review, testsPassed: true
  - ...
```

---

### Parallel Mode (3+ Independent Tasks)

Concurrent subagent execution for independent tasks.

**When used:** 3+ tasks, no dependencies, no file conflicts (verified by S3).

**Safety constraints (MUST verify before proceeding):**

- No task depends on another task's output
- No file appears in more than one task's `files` list
- If conflicts found at runtime → downgrade to serial mode

**Flow:**

1. **Verify safety (pre-spawn):**
   - Re-check file-to-task map for conflicts
   - If any overlap found: log warning, fall back to serial mode
   - If safe: proceed to parallel spawning

2. **Runtime conflict detection (during spawn):**
   - As subagents initialize, verify no file conflicts emerge
   - If during spawn phase a conflict is detected:
     - **Pause all spawning** — Do not start new subagents
     - **Kill already-running subagents** — Clean termination with SIGTERM (5s timeout, then SIGKILL)
     - **Log conflict details** — Which tasks share which files
     - **Ask user:** "File conflicts detected during parallel execution. Retry in serial mode or abort?"
     - **If user chooses serial:** Re-queue all tasks (including completed ones) for serial re-execution
     - **If user chooses abort:** Mark all tasks as blocked, return partial results

3. **Spawn all subagents in parallel:**
   - For each task: spawn subagent with task file and constraint flags
   - Pass flags: `--no-full-suite`, `--no-commit`
   - Track subagent process IDs

4. **Wait for completion:**
   - Poll subagent status
   - Timeout after suggested limit (e.g., 1 hour)
   - If timeout: kill subagent, mark task as failed
   - Collect results as each subagent finishes

5. **Aggregate results:**

```yaml
parallelTasksSpawned: 4
parallelTasksCompleted: 4
parallelTasksFailed: 0
tasks:
  - unit-id: U1, status: for-review, testsPassed: true
  - unit-id: U2, status: for-review, testsPassed: true
  - ...
```

6. **Run full targeted test suite (orchestrator only):**
   - All modified files are now in working directory
   - Run test suite covering all affected areas
   - Verify no integration issues between parallel work
   - If integration tests fail: identify which task(s) caused the issue

7. **Stage and commit (orchestrator only):**
   - Same as serial mode finalization
   - Commit message includes all unit IDs

8. **Return result:**
   - Same structure as serial mode result

---

## Quality Gates

### Test Verification

- ✅ Tests pass for all affected test files
- ✅ New tests cover the new behavior
- ✅ Existing tests still pass (no regressions)
- ❌ **Fail if:** Tests don't pass after implementation

### Code Pattern Verification

- No magic numbers or strings (use constants)
- No unused imports or dead code
- Functions are small and focused
- Names are meaningful (no `$data`, `$result`)
- Follows language-specific style guides
- ❌ **Fail if:** Significant pattern deviations found

### System Check

For each task, verify:

1. **Callbacks/middleware/observers/events:**
   - Are all expected callbacks triggered?
   - Are middleware chains complete?

2. **Test coverage depth:**
   - Do tests cover real interactions (not only mocks)?
   - Are edge cases covered (empty, null, error)?

3. **Failure paths:**
   - Are failure paths idempotent (can retry safely)?
   - Are cleanup handlers in place (finally blocks, teardown)?

4. **Consistency:**
   - Is behavior consistent across alternate entry points?
   - Are error messages consistent with project conventions?

### Failure Handling

| Gate Failure | Action |
|---|---|
| Test fails | Mark task `blocked`, show test output, offer retry/skip |
| Pattern deviation | Warn, ask user: accept or revise |
| System check fails | Mark task `blocked`, log details, offer retry |
| Subagent timeout (parallel) | Kill subagent, mark task failed, other tasks unaffected |
| Integration test fails (post-execution) | Mark offending task blocked, revert if needed |

---

## Task Status Progression

State machine for each task:

```
to-do
  ↓ (execution starts)
in-progress
  ├→ (all gates pass)
  │   ↓
  │ for-review  ← Ready for review phase (S6)
  └→ (gate failure)
      ↓
    blocked  ← User must resolve, then retry
```

**Actions at each transition:**

| Transition | File Ops | Index Update | GitHub Sync |
|---|---|---|---|
| `to-do` → `in-progress` | Move to `in-progress/` | Update status | Add `in-progress` label, post comment |
| `in-progress` → `for-review` | Move to `for-review/` | Update status | Add `for-review` label, post comment |
| `in-progress` → `blocked` | Stay in `in-progress/` + note | Update status | Add `blocked` label, post reason |
| `blocked` → `in-progress` (retry) | Keep in `in-progress/` | Update status | Add `in-progress`, remove `blocked` |

---

## Subagent Constraints

**Subagents MUST NOT:**
1. Run full test suite (only targeted tests for changed files)
2. Stage or commit changes (orchestrator does this)
3. Push to remote (orchestrator does this)
4. Modify branch or stash (orchestrator manages branches)
5. Update `docs/tasks/INDEX.md` directly (orchestrator aggregates)

**Subagents CAN:**
1. Read and modify source files
2. Run targeted tests for changed files
3. Update task file frontmatter (status field)
4. Move task file between directories
5. Call S4 (pwrl-work-sync-status) for GitHub sync

**Enforcement:**
- Pass constraint flags when spawning: `--no-full-suite`, `--no-commit`
- Subagent checks flags at startup and refuses violations
- Orchestrator validates after each subagent completes

---

## Error Handling & Recovery

| Scenario | Handling | Recovery |
|---|---|---|
| Task execution crashes | Catch error, mark `blocked`, log stack trace | Retry task after fix |
| Test failure | Mark `blocked`, show failing test output | Fix tests or implementation, retry |
| Quality gate fails | Mark `blocked`, show gate reason | Address issue, retry |
| Subagent timeout (parallel) | Kill subagent, mark failed | Re-run as serial or fix |
| Git error during commit | Log error, show git state | Fix git state, retry commit |
| Parallel safety violation | Downgrade to serial, warn | Continue safely in serial |

**User prompts for blocked tasks:**
- "Task [unitId] is blocked due to [reason]. Would you like to retry, skip, or investigate?"
- Retry: Re-execute the task
- Skip: Mark as skipped (add to backlog)
- Investigate: Provide details for manual intervention

---

## Progress Reporting

**Inline:**
```
[1/2] Executing task U1: Add email validation
  → Reading target files...
  → Writing test first... ✓ FAIL (expected)
  → Implementing feature...
  → Running tests... ✓ PASS
  → Task complete: for-review
```

**Serial:**
```
[1/5] Spawning subagent for task U1...
[2/5] Subagent U1 completed: for-review ✓
[3/5] Spawning subagent for task U2 (depends on U1)...
[4/5] Subagent U2 completed: for-review ✓
[5/5] Running full test suite...
[✓] All tests pass
[✓] Creating commit: "Implement U1, U2: Add user validation"
```

**Parallel:**
```
[1/4] Spawning 4 parallel subagents...
  [U1] Starting... [U2] Starting... [U3] Starting... [U4] Starting...
[✓] All subagents complete
[✓] Aggregating results: 4 completed, 0 failed
[✓] Running full integration test suite...
[✓] All tests pass
[✓] Creating commit: "Implement U1, U2, U3, U4"
```

---

## Dependencies

- **pwrl-work-prepare** — Consumes prepared task list and execution mode
- **pwrl-work-sync-status (S4)** — Called for GitHub sync at status transitions
- **File system** — Task file management, source file reading/writing
- **Test framework** — Running targeted and integration tests
- **Git** — Staging and committing (orchestrator only)
- **Subagent infrastructure** — For serial/parallel spawning

## References

- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **S3 Skill:** `pwrl-work-prepare/SKILL.md`
- **S4 Skill:** `pwrl-work-sync-status/SKILL.md`
- **Source Phase 2:** Installed `pwrl-work` skill (Phase 2: Execute, lines 122-172)
- **Next Skill:** `pwrl-work-review` (S6)
