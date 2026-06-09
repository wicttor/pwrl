---
title: Compact After Every Unit — Task-Granular Commits
date: 2026-06-08
category: workflow
tags:
  - pwrl-work
  - commits
  - git-workflow
  - reviewability
  - execution
severity: medium
context: PWL-Work execution of S1-S11 slicing plan; each unit committed independently
---

# Compact After Every Unit — Task-Granular Commits

## Context

While executing the S1-S11 slicing plan for pwrl-work, we needed a strategy for committing progress that balanced:
- **Reviewability:** Each commit should tell a clear story
- **Safety:** Ability to revert individual units without cascading
- **Pacing:** Natural checkpoints to pause and reflect

Committing only at the end (after all 11 tasks) would create a massive, opaque diff. Committing on every file change would create noise.

## The Practice

**Commit after every task unit completes, with structured messages.**

1. Complete one task unit end-to-end (implement, test, mark for-review)
2. Stage all changes: `git add -A`
3. Commit with a structured message:

```
S[N]: [Short task description]

- [List of key changes made in this unit]
- [Files created or modified]

New: path/to/new/file.md
Updated: path/to/updated/file.md
```

4. Move to the next unit

### Example from S1-S11 Execution

```
S1: Analyze pwrl-work structure & dependencies
S2: Extract triage logic (pwrl-work-triage)
S3: Extract prepare logic (pwrl-work-prepare)
S4: Create GitHub sync utility (pwrl-work-sync-status)
S5: Extract execute logic (pwrl-work-execute)
S6: Extract review logic (pwrl-work-review)
S7: Extract ship logic (pwrl-work-ship)
S8: Create orchestrator agent (pwrl-work.agent.md)
S9: Update pwrl-work fallback logic
S10: Update documentation & examples
S11: Integration testing & validation
```

Each commit: ~3-6 files changed, 300-400 lines added, 2-4 lines removed, representing exactly one task's worth of work.

### What NOT to do

- ❌ Don't bundle multiple units into one commit (loses granularity)
- ❌ Don't commit partial work mid-unit (breaks tests)
- ❌ Don't commit after every edit (too noisy)
- ❌ Don't squash at the end (loses history)

## Why It Helps

- **Clean, reviewable history:** Each commit is one logical unit, easy to review and understand
- **Safe rollbacks:** Reverting S5 doesn't lose S1-S4 work
- **Natural checkpoints:** The commit boundary is a natural pause point to assess progress
- **Clear accountability:** Each commit message explains exactly what was done in that unit
- **Parallel-friendly:** Units committed independently can be cherry-picked into other branches
- **INDEX alignment:** Each commit corresponds to exactly one row in the task INDEX

## How to Apply

1. **Define units first** — Task files in `docs/tasks/` define clear unit boundaries
2. **One unit, one commit** — Complete the unit entirely before committing
3. **Structure commit messages** — Unit ID prefix, description, bullet list of changes
4. **Stage comprehensively** — `git add -A` ensures nothing is missed
5. **Push when batch is done** — Can push multiple commits at once (e.g., after 3-5 units)

### Commit Message Template

```
S[N]: [Short description]

[Optional additional context]

- [Bullet of key change 1]
- [Bullet of key change 2]

New: path/to/new/file.md
Updated: path/to/updated/file.md
```

## Examples

```
S5: Extract execute logic (pwrl-work-execute)

- Created pwrl-work-execute micro-skill — the core execution engine
- Inline mode: 1-2 tasks, direct TDD execution
- Serial mode: 3+ dependent tasks, sequential subagent spawning
- Parallel mode: 3+ independent tasks, concurrent subagents with safety
- Quality gates: test verification, code patterns, system checks
- Task status progression (to-do -> in-progress -> for-review/blocked)

New: pwrl-work-execute/SKILL.md
```

```
S10: Update documentation & examples

- Created work-workflow.md — inline/serial/parallel mode examples
- Created pwrl-work-agent-example.md — agent orchestration walkthroughs
- Created github-integration-example.md — GitHub Issues lifecycle

New: docs/examples/work-workflow.md
New: docs/examples/pwrl-work-agent-example.md
New: docs/examples/github-integration-example.md
```

## Related

- [Skill Decomposition & Agent Orchestration Pattern](../pattern/skill-decomposition-agent-orchestration-2026-06-05.md) — The decomposition approach that defines unit boundaries
- [PWL-Work Slicing Plan](../plan/pwrl-work-slicing-plan-2026-06-05.md) — The plan that defined S1-S11 units
- `docs/tasks/INDEX-S1-S11.md` — Task index where each row maps to one commit
