---
name: pwrl-work-execute
description: Execute tasks with quality gates (inline, serial, or parallel modes)
argument-hint: "[Task list context from pwrl-work-prepare, execution mode]"
version: 1.7.0-dev.1
---

# pwrl-work-execute — Task Execution Engine

## Interaction Method

- Use platform's `ask_user_question`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "What tasks should be executed? Confirm the execution parameters and verify the environment is ready."
- Provide clear recovery suggestions when errors occur

## Pre-Flight Guard

Assert that the input task file is in `docs/tasks/in-progress/` (because `pwrl-work-prepare` should have moved it there).

If the file is in any other folder, refuse to proceed with a recovery message.

If the file is in `docs/tasks/for-review/` already, surface: "Task is already in for-review/. This may indicate the execute phase did not complete. Proceeding will skip the implementation. Confirm to continue or cancel."

**Cross-reference:** see [`pwrl-work/SKILL.md` §"Task Lifecycle Contract"](../pwrl-work/SKILL.md#task-lifecycle-contract).

## Responsibility Boundary

**This skill OWNS the `in-progress → for-review` transition.**

**This skill MUST NOT perform any other transition (especially `→ done`).** The `for-review → done` transition is the exclusive responsibility of `pwrl-review-report`.

For the canonical ownership table, see [`pwrl-work/references/workflow-details.md` §"Task Status Transitions"](../pwrl-work/references/workflow-details.md#task-status-transitions-docstasks).

**Purpose:** Core execution engine that coordinates task implementation across three modes (inline, serial, parallel), enforces quality gates, manages task status progression, and integrates GitHub status syncing.

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

**Per-task flow (6 steps):** Read context → Mark in-progress → Implement test-first (TDD) → Run quality gates → Mark for-review on success → Return result. The full 6-step flow with sub-bullets and output schema is documented in [`references/inline-mode-flow.md`](references/inline-mode-flow.md).

**Status Transition:** `in-progress/ (status: in-progress) → for-review/ (status: for-review)`.

**Step 5 — Mark for-review on success:**

- **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
  - Read the task file from `in-progress/` folder
  - Update frontmatter status: `status: in-progress` → `status: for-review`
  - Write the updated file to `docs/tasks/for-review/` with same filename
  - Delete original from `in-progress/`
  - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`

---

### Serial Mode (3+ Dependent Tasks)

Sequential execution for tasks with dependencies. **When used:** 3+ tasks, dependencies exist, or file conflicts detected. The full per-task flow (Determine execution order → For each task: Execute / Collect results / Check progress → After all: Run full suite → Stage and commit) is in [`references/serial-and-parallel-mode-flows.md` §"Serial Mode"](references/serial-and-parallel-mode-flows.md#serial-mode-3-dependent-tasks).

**Step 2a — For each task, on completion:**

- **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
  - Read the task file from `in-progress/` folder
  - Update frontmatter status: `status: in-progress` → `status: for-review`
  - Write the updated file to `docs/tasks/for-review/` with same filename
  - Delete original from `in-progress/`
  - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`

### Parallel Mode (3+ Independent Tasks)

Concurrent execution for independent tasks. **When used:** 3+ tasks, no dependencies, no file conflicts (verified by prepare phase). The full flow (Verify safety → Execute all in parallel → Runtime conflict detection → Collect results → Run full suite → Stage and commit) is in [`references/serial-and-parallel-mode-flows.md` §"Parallel Mode"](references/serial-and-parallel-mode-flows.md#parallel-mode-3-independent-tasks).

**Safety constraints (MUST verify before proceeding):** No task depends on another's output; no file in more than one task's `files` list; if conflicts found at runtime, downgrade to serial mode.

**Step 2 — For each task, on completion:**

- **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
  - Read the task file from `in-progress/` folder
  - Update frontmatter status: `status: in-progress` → `status: for-review`
  - Write the updated file to `docs/tasks/for-review/` with same filename
  - Delete original from `in-progress/`
  - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`

---

### Cross-Plan Parallel Execution (with Sync Points)

For multi-plan cross-plan parallel execution: full per-group cycle (pre-execution validation, parallel execution, sync point validation, atomic commit, dependent task signaling, group failure rollback), the cross-group atomicity guarantee, and the per-execution output schema are documented in [`references/cross-plan-parallel-execution.md`](references/cross-plan-parallel-execution.md).

---

## Quality Gates

Full quality-gate criteria (test verification, code pattern verification, system check, and failure handling table) are in [`references/quality-gates.md`](references/quality-gates.md).

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

> **Exclusive responsibility note:** The `for-review → done` transition is the exclusive responsibility of `pwrl-review-report`. This skill MUST NOT mark any task as `done`.

**Actions at each transition:**

| Transition                        | File Ops                      | Index Update  | GitHub Sync                           |
| --------------------------------- | ----------------------------- | ------------- | ------------------------------------- |
| `to-do` → `in-progress`           | Move to `in-progress/`        | Update status | Add `in-progress` label, post comment |
| `in-progress` → `for-review`      | Move to `for-review/`         | Update status | Add `for-review` label, post comment  |
| `in-progress` → `blocked`         | Stay in `in-progress/` + note | Update status | Add `blocked` label, post reason      |
| `blocked` → `in-progress` (retry) | Keep in `in-progress/`        | Update status | Add `in-progress`, remove `blocked`   |

---

## Subagent Constraints

Full subagent MUST NOT / CAN lists and enforcement policy (constraint flags, validation) are in [`references/subagent-constraints.md`](references/subagent-constraints.md).

---

## Error Handling & Recovery

Full error-handling table and user-prompt patterns for blocked tasks are in [`references/progress-reporting-and-error-handling.md`](references/progress-reporting-and-error-handling.md#error-handling--recovery).

---

## Progress Reporting

Inline / Serial / Parallel progress report formats are in [`references/progress-reporting-and-error-handling.md`](references/progress-reporting-and-error-handling.md#progress-reporting).

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
