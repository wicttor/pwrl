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

Canonical contract — see also `pwrl-work/SKILL.md` §"Task Lifecycle Contract" and `docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md`.

| Status | Folder | Owner Skill | Transition Trigger | Action |
|---|---|---|---|---|
| `to-do` | `docs/tasks/to-do/` | (initial) | Task created | Move + update frontmatter |
| `in-progress` | `docs/tasks/in-progress/` | `pwrl-work-prepare` | Prepare phase starts work | Move + update frontmatter |
| `for-review` | `docs/tasks/for-review/` | `pwrl-work-execute` | Execute phase completes verification | Move + update frontmatter |
| `done` | `docs/tasks/done/` | `pwrl-review-report` | Review verdict is `APPROVED` | Move + update frontmatter |
| (rework) `in-progress` | `docs/tasks/in-progress/` | `pwrl-work-review` | Review verdict is `REQUEST CHANGES` | Move + update frontmatter + append "Review Findings" section to task body |

**MUST NOT:** Only the owner skill listed above may perform the corresponding transition. A skill that owns a transition is the only one allowed to write the new `status` value in the frontmatter AND move the file to the new folder.

Keep `docs/tasks/INDEX.md` consistent with any status or location changes.

