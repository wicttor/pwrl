# Workflow Details (pwrl-work)

This reference expands the `/pwrl-work` workflow when you need more structure.

## Execution Modes

| Mode               | When to Use                                       |
| ------------------ | ------------------------------------------------- |
| Inline             | 1-2 small tasks or tasks needing user interaction |
| Serial subagents   | 3+ dependent tasks                                |
| Parallel subagents | 3+ independent tasks with no file overlap         |

Parallel constraints:

- Subagents must not run full suite, stage, or commit.
- Orchestrator reviews, tests, stages, and commits after completion.

## Task Status Transitions (docs/tasks/)

When using task files:

- `to-do` → `in-progress` when starting work
- `in-progress` → `for-review` when verification passes
- `for-review` → `done` after review approval (`/pwrl-review`)

Keep `docs/tasks/INDEX.md` consistent with any status or location changes.

