---
title: PWL-Work Workflow Examples
description: Complete execution workflows for inline, serial, and parallel modes in the pwrl-work skill pipeline.
type: PWRL Example
timestamp: 2026-06-05
tags: [pwrl-work, workflow, examples, inline, serial, parallel]
---

# PWL-Work Workflow Examples

Complete execution workflows for inline, serial, and parallel modes.

## Inline Execution (1-2 Tasks)

For small work with 1-2 tasks — direct execution without subagents.

**When to use:** One task file, small scope, user interaction expected.

**Example: Execute a single analysis task**
```
$ /pwrl-work docs/tasks/to-do/2026-06-05-s1-analyze-pwrl-work.md

[START] /pwrl-work
  Input: docs/tasks/to-do/2026-06-05-s1-analyze-pwrl-work.md

[Triage] Classifying input...
  Type: task | Unit ID: S1 | Complexity: small

[Prepare] Setting up environment...
  Branch: feat/pwrl-work (new) | Tasks: 1 | Mode: Inline | GitHub: Enabled

[Execute] Running task S1...
  → Reading target files (pwrl-work skill, learnings)
  → Creating analysis document
  → Documenting phase breakdown and state flow
  ✓ Task complete → for-review

[Review] Checking quality...
  → No duplications found
  → System checks pass
  ✓ Ready for shipping

[Ship] Finalizing work...
  ✓ Tests pass | ✓ No lint errors | ✓ Diff clean
  ✓ Commit: "S1: Analyze pwrl-work structure & dependencies"
  ✓ Pushed to feat/pwrl-work
```

**Key characteristics:**
- No subagents spawned
- Direct implementation in main flow
- Task-by-task progress shown
- Commit after each task

## Serial Execution (3+ Dependent Tasks)

For multi-task work with dependencies — subagents spawned sequentially.

**When to use:** Multiple tasks with dependencies (A → B → C), or file conflicts detected.

**Example: Execute 5 dependent tasks**
```
$ /pwrl-work docs/plans/2026-06-05-002-plan.md

[START] /pwrl-work
  Input: docs/plans/2026-06-05-002-plan.md

[Triage] Classifying input...
  Type: plan | Units: 5 | Complexity: medium

[Prepare] Setting up environment...
  Branch: feat/pwrl-work (new) | Tasks: 5 | Mode: Serial | GitHub: Enabled
  Dependency graph: S1 → S2 → S3, S4 → S5

[Execute] Running 5 tasks sequentially...
  [1/5] Spawning subagent for task S1...
  ✓ Subagent S1 complete → for-review

  [2/5] Spawning subagent for task S2 (depends on S1)...
  ✓ Subagent S2 complete → for-review

  [3/5] Spawning subagent for task S3 (depends on S2)...
  ✓ Subagent S3 complete → for-review

  [4/5] Spawning subagent for task S4...
  ✓ Subagent S4 complete → for-review

  [5/5] Spawning subagent for task S5 (depends on S4)...
  ✓ Subagent S5 complete → for-review

  [Post] Running full targeted test suite...
  ✓ All 127 tests pass
  ✓ Creating commit: "Implement S1-S5: [summary]"
  ✓ Pushed to feat/pwrl-work

[Review] Checking quality...
  → Duplications consolidated: 2
  → Helpers extracted: 1
  → System checks: all pass
  ✓ Ready for shipping

[Ship] Finalizing...
  ✓ Final commit: "feat(pwrl-work): implement micro-skills"
  ✓ Pushed to feat/pwrl-work
```

**Key characteristics:**
- Subagents spawned one at a time (sequentially)
- Dependency order respected (A before B)
- Main agent runs final integration tests
- Main agent stages, commits, pushes

## Parallel Execution (3+ Independent Tasks)

For independent tasks with no file overlap — subagents spawned concurrently.

**When to use:** 3+ tasks with no dependencies and no file conflicts (verified by prepare phase).

**Example: Execute 4 independent tasks in parallel**
```
$ /pwrl-work docs/plans/2026-06-05-003-plan.md --parallel

[START] /pwrl-work
  Input: docs/plans/2026-06-05-003-plan.md

[Triage] Classifying input...
  Type: plan | Units: 4 | Complexity: medium

[Prepare] Setting up environment...
  Branch: feat/independent-tasks (new) | Tasks: 4 | Mode: Parallel
  File conflict check: PASS — no overlapping files
  GitHub: Enabled

[Execute] Running 4 tasks in parallel...
  [Spawning] Starting 4 subagents simultaneously...
    [U1] Starting... [U2] Starting... [U3] Starting... [U4] Starting...

  [U1] Reading files... Implementing... Testing... ✓ Complete
  [U2] Reading files... Implementing... Testing... ✓ Complete
  [U3] Reading files... Implementing... Testing... ✓ Complete
  [U4] Reading files... Implementing... Testing... ✓ Complete

  [Aggregating] All subagents complete
    ✓ 4 completed, 0 failed

  [Post] Running full integration test suite...
  ✓ All integration tests pass

  [Commit] Main agent creating commit...
  ✓ Commit: "Implement U1, U2, U3, U4"
  ✓ Pushed to feat/independent-tasks

[Review] Checking quality...
  → No cross-task duplication
  → System checks: all pass
  ✓ Ready for shipping

[Ship] Finalizing...
  ✓ Shipped successfully
```

**Key characteristics:**
- Subagents spawned simultaneously (concurrent)
- Only for tasks with no dependencies and no file conflicts
- Main agent waits for all to complete
- Main agent runs integration tests (subagents must not)
- Main agent stages, commits, pushes (subagents must not)

## Mode Selection Reference

| Condition | Recommended Mode | Why |
|---|---|---|
| 1-2 tasks | **Inline** | No subagent overhead needed |
| 3+ tasks with dependencies | **Serial** | Dependencies must be respected |
| 3+ tasks with file conflicts | **Serial** (forced) | Parallel would cause race conditions |
| 3+ independent tasks, no conflicts | **Parallel** | Fastest execution |
| User wants manual control | **Inline** | Subagents reduce interactivity |
| Complex integration testing needed | **Serial** | Easier to debug integration issues |
