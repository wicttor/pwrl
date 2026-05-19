---
name: pwrl-work
description: Execute implementation work efficiently while maintaining quality and shipping complete features
argument-hint: "[Task file, plan doc path, or work description. Leave blank to use latest plan/task]"
---

# PWRL Work

Execute implementation work from a plan or prompt with fast feedback loops and clear quality checks.

## Purpose

Transform plans or prompts into working code through systematic execution:

- Test-first discipline ensures correctness
- Incremental verification catches issues early
- Clear quality gates prevent scope drift
- Supports inline, serial, or parallel execution modes based on task complexity

## Usage

```bash
/pwrl-work
/pwrl-work docs/tasks/to-do/2026-05-04-u1-add-validation.md
/pwrl-work docs/plans/2026-05-01-001-auth.md
/pwrl-work "fix flaky test in auth middleware"
```

## Input

<input_document> #$ARGUMENTS </input_document>

## Support Files

- `references/workflow-details.md` — Execution modes, task status transitions, and sync rules

## Workflow

### Phase 1: Triage Input

1. If input is a task file, read frontmatter + body (unit id, files, dependencies, acceptance).
2. If input is a plan file, identify implementation units and convert to a short task list.
3. If input is a bare prompt, determine scope and create a minimal task list for anything non-trivial.

### Phase 2: Prepare to Execute

1. Clarify ambiguities that materially affect implementation.
2. Confirm branch strategy and environment checks (tests/build commands, fixtures, seeds).
3. For task files, move status to `in-progress` and keep `docs/tasks/INDEX.md` consistent (details in `references/workflow-details.md`).

### Phase 3: Implement and Verify

For each task:

1. Implement the smallest correct slice first.
2. Update or add tests for touched behavior.
3. Run relevant checks early and often (prefer targeted over full-suite).
4. Mark the task `for-review` only after verification passes.

### Phase 4: Review and Ship

1. Do a scope check (no unrelated changes).
2. Run final targeted checks and review the diff.
3. Request user approval and optionally chain into `/pwrl-end-session`.

## Quality Criteria

- Requirements from prompt or plan are fully implemented.
- Behavior changes are covered by tests.
- Relevant tests pass after each logical unit.
- Code follows local patterns and conventions.
- No unresolved blockers or ambiguous TODOs left behind.

## Rules

- Clarify material ambiguities before coding; don’t over-plan trivial work.
- Verify incrementally; don’t defer all testing to the end.
- Ship only complete behavior slices (or create explicit follow-up tasks).
- Keep scope tight; get explicit approval before expanding beyond the plan.

## When to Use

- Use when you want disciplined execution from a plan, a task file, or a prompt.
- Prefer `/pwrl-plan` first for large or high-risk work without a clear path.
