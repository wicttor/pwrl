---
unit-id: S5
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: to-do
created: 2026-06-05
dependencies: [S1, S2, S3, S4]
files:
  - pwrl-work-execute/SKILL.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S5: Extract Task Execution Logic (U4)

## Goal

Create the `pwrl-work-execute` micro-skill that coordinates task execution across three modes (inline, serial, parallel), manages quality gates, and integrates GitHub status syncing.

## Context

From S1 analysis, Phase 2 (Execute) is the core engine:
1. Executes tasks based on selected mode (inline/serial/parallel)
2. Runs tests and manages quality gates (tests must pass)
3. Updates task status (in-progress → for-review)
4. Syncs status to GitHub (via S4 utility)

This is the most complex micro-skill, with three distinct execution paths.

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Orchestration patterns: sequential subagent spawning, parallel subagent management
  - Subagent constraints: no full suite runs, no commits by subagents
  - State aggregation from parallel subagents
  - Applicability: Guides subagent spawning, result aggregation, main orchestrator responsibilities

## Implementation Steps

### Step 1: Create Skill Directory and Frontmatter

- Create directory: `pwrl-work-execute/`
- Create file: `pwrl-work-execute/SKILL.md`
- Add frontmatter:

```yaml
---
name: pwrl-work-execute
description: Execute tasks with quality gates (inline, serial, or parallel modes)
argument-hint: "[Task list context from pwrl-work-prepare, execution mode]"
---
```

### Step 2: Document Purpose Section

Add "Purpose" section explaining:
- Multi-mode execution (inline/serial/parallel)
- Quality gates (tests must pass, code patterns verified)
- Task status progression (in-progress → for-review)
- GitHub integration (call S4 for sync)
- Output: execution results with test status and verification summaries

### Step 3: Implement Inline Execution Mode

For 1-2 tasks, execute directly without subagents:

```markdown
#### Inline Execution Mode

**When used:**
- Task count: 1-2
- No subagent spawning; execute in main skill flow

**For each task:**

1. Read task file and extract implementation details:
   - Goal: What should this task accomplish?
   - Implementation Steps: Detailed actions to take
   - Test Scenarios: How to verify correctness
   - Acceptance Criteria: Conditions for completion

2. Read target files and understand current state:
   - Load files mentioned in task `files` list
   - Check existing tests related to task
   - Identify patterns and conventions from codebase

3. Implement changes test-first (TDD):
   - First: Write failing test(s) for new behavior
   - Then: Implement code to make test(s) pass
   - Then: Run tests to confirm pass
   - Finally: Refactor for clarity if needed

4. Run tests:
   - Run affected test suite (not full suite)
   - Verify all tests pass
   - If tests fail: iterate on implementation until tests pass

5. Update task status:
   - Update task frontmatter: `status: for-review`
   - Move task file from `in-progress/` to `for-review/` (if using directory org)
   - Update `docs/tasks/INDEX.md`

6. Call GitHub sync (via S4):
   - If GitHub integration enabled: call `pwrl-work-sync-status`
   - Pass: task file path, new status (for-review), summary
   - Log sync result

7. Return execution result:
   ```
   {
     mode: "inline",
     taskCount: 1,
     tasksCompleted: 1,
     tasksFailed: 0,
     testsPassed: true,
     results: [
       {
         unitId: "U1",
         taskFile: "docs/tasks/for-review/u1-task.md",
         status: "for-review",
         testsPassed: true,
         summary: "Implemented email validation"
       }
     ]
   }
   ```
```

### Step 4: Implement Serial Execution Mode

For 3+ dependent tasks, spawn subagents sequentially:

```markdown
#### Serial Execution Mode

**When used:**
- Task count: 3+
- Dependencies exist (A → B → C)
- Main agent orchestrates and manages commits

**Flow:**

1. Determine execution order from dependency graph:
   - Start with tasks that have no dependencies
   - After task completes, unlock dependent tasks
   - Continue until all tasks complete

2. For each task (sequentially):
   - Spawn subagent for that task
   - Pass: task file path, task context
   - Wait for subagent to complete
   - Collect result: execution status, test results, summary

3. After subagent completes:
   - Verify tests passed in subagent output
   - Check task status updated (should be in-progress or for-review)
   - Aggregate results

4. After all tasks complete:
   - Run full targeted test suite (orchestrator, not subagents)
   - Verify no integration issues between tasks
   - If tests pass: mark all tasks for-review
   - If tests fail: investigate and re-run affected tasks

5. Stage and commit (main agent responsibility):
   - Stage all changes: `git add .`
   - Create commit message with unit IDs: "Implement S1, S2, S3: [brief description]"
   - Push to branch
   - Log commit hash

6. Return execution result:
   ```
   {
     mode: "serial",
     taskCount: 5,
     tasksCompleted: 5,
     tasksFailed: 0,
     testsPassed: true,
     commitHash: "abc1234",
     results: [
       { unitId: "U1", status: "for-review", testsPassed: true, ... },
       { unitId: "U2", status: "for-review", testsPassed: true, ... },
       ...
     ]
   }
   ```
```

### Step 5: Implement Parallel Execution Mode

For independent tasks with no file conflicts, spawn subagents in parallel:

```markdown
#### Parallel Execution Mode

**When used:**
- Task count: 3+
- No dependencies between tasks
- No file conflicts (verified by S3)

**Flow:**

1. Verify safety constraints (from S3):
   - No file conflicts detected
   - Tasks are truly independent
   - If any conflict found: fail with error, recommend serial mode

2. Spawn all subagents in parallel:
   - For each task: spawn subagent with task file
   - Pass constraint flags: `--no-full-suite`, `--no-commit`
   - Collect subagent process IDs

3. Wait for all subagents to complete:
   - Poll subagent status
   - Timeout if any subagent exceeds time limit (suggested: 1 hour)
   - If timeout: kill subagent, mark task as failed

4. Collect and aggregate results:
   - For each completed subagent: read execution results
   - Build aggregated result object:
     ```
     {
       parallelTasksSpawned: 4,
       parallelTasksCompleted: 4,
       parallelTasksFailed: 0,
       tasks: [
         { unitId: "U1", status: "for-review", testsPassed: true },
         { unitId: "U2", status: "for-review", testsPassed: true },
         ...
       ]
     }
     ```

5. Run full targeted test suite (main agent):
   - All files modified by all tasks are now in working directory
   - Run test suite covering all modified files
   - Verify no integration issues between parallel tasks
   - If tests fail: log failures, investigate which task(s) caused issue

6. If all tests pass:
   - All tasks are for-review
   - Main agent stages and commits
   - Parallel constraints enforced: subagents didn't commit

7. Return execution result (same structure as serial):
   ```
   {
     mode: "parallel",
     taskCount: 4,
     tasksCompleted: 4,
     tasksFailed: 0,
     testsPassed: true,
     commitHash: "abc1234",
     results: [...]
   }
   ```
```

### Step 6: Implement Quality Gates

Define quality gate checks:

```markdown
#### Quality Gates

**After each task (inline/serial modes):**

1. Test Verification:
   - ❌ Fail if: tests don't pass, new tests added but not run
   - ✅ Pass if: all affected tests pass

2. Code Pattern Verification:
   - Check for obvious anti-patterns (magic numbers, long functions, unused variables)
   - Compare to codebase conventions
   - Warn if significant deviations detected

3. System Check:
   - Are callbacks/middleware/observers triggered correctly?
   - Do tests cover real interactions (not only mocks)?
   - Are failure paths idempotent and cleanup-safe?
   - Is behavior consistent across alternate entry points?

**Failure Handling:**
- If quality gate fails: ❌ Mark task as blocked
- Log failure reason
- Ask user: "Quality gate failed. Review and retry, or skip and proceed?"
- If skip: add comment to task for later review

**For parallel mode (after all tasks):**
- Run full targeted test suite
- If integration tests fail: identify which task(s) caused issue
- Mark those tasks as needing rework
- Revert and re-execute in serial mode if needed
```

### Step 7: Implement Task Status Progression

Track and update task status correctly:

```markdown
#### Task Status Progression

**State machine:**

```
to-do
  ↓ (execution starts)
in-progress
  ├→ (tests pass, quality gates pass)
  │   ↓
  │ for-review
  └→ (tests fail, quality gate fails)
      ↓
    blocked
```

**Implementation:**

1. When task execution starts:
   - Update task frontmatter: `status: in-progress`
   - Move file to `docs/tasks/in-progress/`
   - Call S4 (GitHub sync) if GitHub enabled

2. During execution:
   - Run tests
   - Run quality gates
   - Log progress

3. When task execution completes:
   - If tests pass AND quality gates pass:
     - Update frontmatter: `status: for-review`
     - Move file to `docs/tasks/for-review/`
     - Call S4 (GitHub sync)
   - If tests fail OR quality gates fail:
     - Update frontmatter: `status: blocked`
     - Add blockage reason to frontmatter: `blocked-reason: "Test failures in src/utils.spec.ts"`
     - Call S4 (GitHub sync)
     - Ask user to resolve before retrying

4. Update `docs/tasks/INDEX.md` after every status change
```

### Step 8: Implement Error Handling and Recovery

Handle execution failures gracefully:

```markdown
#### Error Scenarios

| Scenario                           | Handling                                              |
| ---------------------------------- | ----------------------------------------------------- |
| Task execution fails (exception)   | Catch error, mark task blocked, log stack trace      |
| Test fails                         | Mark task blocked, show failing test output           |
| Quality gate fails                 | Mark task blocked, show gate failure reason           |
| Subagent times out (parallel)      | Kill subagent, mark task failed, investigate timeout  |
| Subagent crashes (serial/parallel) | Catch subagent failure, mark task blocked, retry prompt |
| Git error during commit            | Log error, ask user to resolve git state, retry commit |

**Recovery:**
- User can retry blocked task by re-running with task file path
- User can skip quality gate (not recommended) with explicit flag
- User can investigate and fix task issues manually, then rerun execution
```

### Step 9: Document Subagent Constraints

When spawning subagents, enforce safety constraints:

```markdown
#### Subagent Constraints

**Subagents MUST NOT:**
1. Run full test suite (only targeted tests for changed files)
2. Stage or commit changes (main agent does this)
3. Push to remote (main agent does this)
4. Modify branch or stash (main agent manages branches)

**Subagents CAN:**
1. Modify files and write code
2. Run targeted tests for changed files
3. Update task status file (frontmatter)
4. Call GitHub sync (S4 utility)

**Enforcement:**
- When spawning: pass flags `--no-full-suite`, `--no-commit`
- Subagent checks flags and refuses to violate constraints
- If subagent violates constraints: main agent detects and errors
```

### Step 10: Add Progress Reporting

Report execution progress to user:

```markdown
#### Progress Reporting

During execution, log:

**Inline Mode:**
```
[1/2] Executing task U1: Add email validation
  → Reading target files...
  → Writing test first...
  → Running tests... ✓ PASS
  → Implementing feature...
  → Running tests... ✓ PASS
  → Task complete: for-review
```

**Serial Mode:**
```
[1/5] Spawning subagent for task U1...
[2/5] Subagent U1 completed: for-review ✓
[3/5] Spawning subagent for task U2 (depends on U1)...
[4/5] Subagent U2 completed: for-review ✓
[5/5] Running full test suite...
[✓] All tests pass
[✓] Creating commit: "Implement U1, U2: Add user validation"
```

**Parallel Mode:**
```
[1/4] Spawning 4 parallel subagents...
  [U1] Starting...
  [U2] Starting...
  [U3] Starting...
  [U4] Starting...
[✓] All subagents complete
[✓] Aggregating results: 4 completed, 0 failed
[✓] Running full integration test suite...
[✓] All tests pass
[✓] Creating commit: "Implement U1, U2, U3, U4: [description]"
```
```

## Test Scenarios

**Test 1: Inline Mode (1 Task)**
- Input: Inline mode, 1 task (U1)
- Expected: Execute inline, tests pass, task → for-review
- Acceptance: Task status updated; no subagents spawned

**Test 2: Inline Mode (2 Tasks)**
- Input: Inline mode, 2 independent tasks
- Expected: Execute both inline, both → for-review
- Acceptance: Both tasks complete; no subagents

**Test 3: Serial Mode (Dependent Tasks)**
- Input: Serial mode, 5 tasks with dependencies (U1 → U2 → U3, U4 → U5)
- Expected: Execute sequentially respecting dependencies, all → for-review
- Acceptance: Tasks execute in correct order; all tests pass

**Test 4: Parallel Mode (Independent Tasks)**
- Input: Parallel mode, 4 independent tasks (no dependencies, no file conflicts)
- Expected: Spawn 4 subagents in parallel, all complete, all → for-review
- Acceptance: Subagents run in parallel; no safety violations; all tests pass

**Test 5: Quality Gate: Test Failure**
- Input: Task with failing test
- Expected: Test runs, fails, task → blocked
- Acceptance: Task marked blocked; user shown failure reason

**Test 6: Quality Gate: Code Pattern Deviation**
- Input: Task implementing feature with non-standard pattern
- Expected: Quality gate warns; user can accept or reject
- Acceptance: Warning clear; user can override if intentional

**Test 7: GitHub Sync During Execution**
- Input: Task with github-issue field, GitHub integration enabled
- Expected: Task status synced to GitHub as it progresses
- Acceptance: Issue labels updated; comments posted at each status change

**Test 8: Parallel Mode Forced to Serial (Safety)**
- Input: Parallel mode selected, but file conflicts detected at runtime
- Expected: Detect conflict, switch to serial, warn user
- Acceptance: Execution continues safely; file conflict logged

**Test 9: Subagent Timeout (Parallel)**
- Input: Parallel mode, 1 subagent hangs for >1 hour
- Expected: Timeout detected, subagent killed, task marked failed
- Acceptance: Other subagents unaffected; overall execution fails gracefully

**Test 10: Commit Creation After Execution**
- Input: Serial mode, 3 tasks complete, all tests pass
- Expected: Main agent creates and pushes commit
- Acceptance: Commit exists; commit message includes unit IDs; pushed to branch

## Acceptance Criteria

✅ Inline mode executes tasks without subagents (1-2 tasks)  
✅ Serial mode spawns subagents sequentially, respects dependencies  
✅ Parallel mode spawns subagents in parallel, enforces safety constraints  
✅ Quality gates verify tests pass and code patterns followed  
✅ Task status progresses correctly (to-do → in-progress → for-review/blocked)  
✅ GitHub integration syncs status at each phase (via S4)  
✅ All error scenarios handled gracefully (no crashes)  
✅ Execution progress reported clearly to user  
✅ Commits created and pushed after successful execution  
✅ Subagent constraints enforced (no full suite, no commits by subagents)  
✅ Ready for integration with S8 (orchestrator agent)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Unit U4 definition)
- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **S3 Output:** Execution mode selected, task list with dependencies
- **S4:** GitHub sync utility (called during execution)
