# Serial & Parallel Mode Flows (pwrl-work-execute)

Reference for `pwrl-work-execute` §"Serial Mode" and §"Parallel Mode". The full per-task flows are documented here. Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

## Serial Mode (3+ Dependent Tasks)

Sequential execution for tasks with dependencies.

**When used:** 3+ tasks, dependencies exist between tasks, or file conflicts detected.

### Flow

1. **Determine execution order:**
   - Parse dependency graph from task list
   - Topological sort: tasks with no dependencies first, then their dependents
   - Build ordered execution queue

2. **For each task (sequentially):**

   **a) Execute task:**
   - Load task file and extract goal, implementation steps, test scenarios, acceptance criteria
   - Implement following test-first discipline
   - Run affected tests and quality gates
   - **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
     - Read the task file from `in-progress/` folder
     - Update frontmatter status: `status: in-progress` → `status: for-review`
     - Write the updated file to `docs/tasks/for-review/` with same filename
     - Delete original from `in-progress/`
     - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`

   **b) Collect results:**
   - Capture test status, verification summaries, implementation summary
   - Verify task status is `for-review` or `blocked`

   **c) Check progress:**
   - Log: `[N/M] Task [unitId] completed: [status] ✓`
   - If blocked: pause, ask user to resolve, retry or skip

3. **After all tasks complete:**

   **a) Run full targeted test suite:**
   - Run test suite covering all files modified by all tasks
   - Verify no integration issues between sequentially executed tasks
   - If tests fail: investigate, mark affected tasks as blocked

   **b) Stage and commit:**
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

## Parallel Mode (3+ Independent Tasks)

Concurrent execution for independent tasks.

**When used:** 3+ tasks, no dependencies, no file conflicts (verified by prepare phase).

**Safety constraints (MUST verify before proceeding):**

- No task depends on another task's output
- No file appears in more than one task's `files` list
- If conflicts found at runtime → downgrade to serial mode

### Flow

1. **Verify safety (pre-execution):**
   - Re-check file-to-task map for conflicts
   - If any overlap found: log warning, fall back to serial mode
   - If safe: proceed to parallel execution

2. **Execute all tasks in parallel:**
   - For each task: execute implementation independently
   - Each task runs: load → implement → verify → status update
   - Run targeted tests for each task (not full suite)
   - Track execution progress and results

   **For each task, on completion:**
   - **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
     - Read the task file from `in-progress/` folder
     - Update frontmatter status: `status: in-progress` → `status: for-review`
     - Write the updated file to `docs/tasks/for-review/` with same filename
     - Delete original from `in-progress/`
     - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`

3. **Runtime conflict detection (during execution):**
   - Monitor file access for conflicts
   - If conflicts detected:
     - **Pause new task starts** — Do not begin new parallel tasks
     - **Wait for in-flight tasks** — Allow running tasks to complete
     - **Log conflict details** — Which tasks share which files
     - **Ask user:** "File conflicts detected during parallel execution. Retry in serial mode or abort?"
     - **If user chooses serial:** Re-queue all tasks for serial re-execution
     - **If user chooses abort:** Mark all tasks as blocked, return partial results

4. **Collect results:**
   - Aggregate all task results as execution completes
   - Track completion time per task

```yaml
parallelTasksStarted: 4
parallelTasksCompleted: 4
parallelTasksFailed: 0
tasks:
  - unit-id: U1, status: for-review, testsPassed: true, duration: "5m"
  - unit-id: U2, status: for-review, testsPassed: true, duration: "3m"
  - ...
```

5. **Run full targeted test suite:**
   - All modified files collected from all tasks
   - Run test suite covering all affected areas
   - Verify no integration issues between parallel work
   - If integration tests fail: identify which task(s) caused the issue

6. **Stage and commit:**
   - Stage all changes from all completed tasks
   - Create commit message with all unit IDs
   - Push to branch
   - Log commit hash

7. **Return result:**
   - Same structure as serial mode result
