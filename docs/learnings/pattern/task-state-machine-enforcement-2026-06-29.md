---
title: "Task State Machine Enforcement — Per-Skill Responsibility Boundaries"
description: "Codifies the four per-skill transition owners and the Pre-Flight Guard that enforces them. Closes the audit gap where the agent skipped the for-review/ intermediate state."
type: PWRL Learning
timestamp: 2026-06-29T19:30:00Z
tags: [task-lifecycle, state-machine, pwrl-work, pwrl-review, pre-flight-guard]
category: pattern
severity: high
domains: [pwrl-work, pwrl-review, task-management]
---

# Task State Machine Enforcement — Per-Skill Responsibility Boundaries

## Context

Codified in response to a 2026-06-29 session where the agent moved task files from `to-do/` directly to `done/`, skipping `for-review/`, and did not transition to `in-progress/` when starting work. The fix is a strict per-skill responsibility boundary plus a Pre-Flight Guard at the top of each phase that owns a transition.

Before this contract, the task lifecycle was documented in three scattered places — prose in `pwrl-work/references/workflow-details.md`, the pattern learning `explicit-task-file-movement-critical.md`, and the pattern learning `explicit-review-verdict-flow-2026-06-16.md` — but was not enforced or prominently mentioned in any `SKILL.md` the agent reads when executing. This scattered documentation meant the agent could interpret "Update task status" as a frontmatter-only change and skip the file move entirely.

## Problem Solved

**Before:** The task lifecycle was described in prose across multiple documents with no ownership, no enforcement, and no single source of truth. The agent could (and did) bypass the `for-review/` intermediate state, mark tasks as `done` from any phase, and skip the `in-progress/` transition.

**After:** Each transition has a single owning skill, enforced by a Pre-Flight Guard at the top of each skill's `SKILL.md`. The canonical contract lives in the orchestrator (`pwrl-work/SKILL.md` §"Task Lifecycle Contract") and every downstream skill cross-references it. An agent reading any skill file sees the guard first — before any implementation steps — and refuses to proceed if the task file is not in the expected folder.

## The Contract

The canonical task lifecycle contract, defined in `pwrl-work/SKILL.md` §"Task Lifecycle Contract" and detailed in `pwrl-work/references/workflow-details.md` §"Task Status Transitions":

| Transition | Owner |
|---|---|
| `to-do → in-progress` | `pwrl-work-prepare` |
| `in-progress → for-review` | `pwrl-work-execute` |
| `for-review → in-progress` (REQUEST CHANGES) | `pwrl-work-review` |
| `for-review → done` (APPROVED) | `pwrl-review-report` |

**MUST NOT:** No skill other than the owner listed in the table above may perform the corresponding transition. A skill that owns a transition is the only one allowed to write the new `status` value in the frontmatter AND move the file to the new folder.

## Pre-Flight Guard Pattern

Each skill that owns a transition opens with a Pre-Flight Guard section (near the top of `SKILL.md`, after the Interaction Method block). The guard asserts that the input task file is in the expected source folder for that phase. If the file is in any other folder, the skill refuses to proceed and surfaces a recovery message.

**Structure of every guard:**

```markdown
## Pre-Flight Guard

Assert that the input task file is in `docs/tasks/<expected-folder>/`.
If the file is in any other folder, refuse to proceed with a recovery message.

Cross-reference: see `pwrl-work/SKILL.md` §"Task Lifecycle Contract".
```

**Per-skill expected folders:**

| Skill | Expected Source Folder |
|---|---|
| `pwrl-work-prepare` | `docs/tasks/to-do/` |
| `pwrl-work-execute` | `docs/tasks/in-progress/` |
| `pwrl-work-review` | `docs/tasks/for-review/` |
| `pwrl-review-report` | `docs/tasks/for-review/` (at least one matching task) |

## Responsibility Boundary

Each owning skill also declares its responsibility boundary with two bold headings:

```markdown
## Responsibility Boundary

**This skill OWNS the `<source> → <target>` transition.**

**This skill MUST NOT perform any other transition (especially `→ done`).**
```

This makes the boundary explicit at the skill level. Combined with the Pre-Flight Guard, it creates a defense-in-depth against lifecycle violations: the guard catches tasks arriving from the wrong folder; the boundary prevents the skill from accidentally progressing a task past its authorized range.

## Consequences of Violation

### 1. GitHub Issues Desync

If a task is marked `done` without going through `for-review/`, the `pwrl-work-sync-status` utility never adds the `done` label or closes the corresponding GitHub Issue. The issue stays open after the code is merged, creating a gap between the VCS state and the issue tracker.

### 2. Lost Audit Trail

If the `for-review/` folder is skipped, reviewers cannot tell which tasks were reviewed vs. which were "completed" without review. The `for-review/` folder becomes a graveyard of orphaned tasks, and the `done/` folder contains tasks with no review verdict in their frontmatter. Audit compliance (e.g., SOC 2, ISO 27001) requires a traceable review trail for every code change.

### 3. Double-Promotion

If two agents (or two phases within the same agent) both try to move the same task, the frontmatter `status` and the folder location can diverge. For example, one agent moves the file to `done/` while another updates the frontmatter to `status: for-review`. The dual-layer tracking (file location + frontmatter) becomes inconsistent, making automated tooling unreliable.

## Related Patterns

- [Explicit Task File Movement as Critical Phase Operation](explicit-task-file-movement-critical.md) — Establishes that moving a task file between folders is a critical, explicitly documented operation at each phase boundary.
- [Task State Management — Dual-Layer Tracking](task-state-management-dual-layer-tracking.md) — Use dual-layer state tracking: file location (directory) + frontmatter status (YAML) for human and machine readability.
- [Explicit Three-Tier Verdict Flow for Code Review](explicit-review-verdict-flow-2026-06-16.md) — Structured review verdict system with three explicit outcomes (APPROVED / REQUEST CHANGES / REJECTED) and defined task file actions.
- [Cross-Skill Contract Enforcement — Ownership, Pre-Flight Guard, and Centralization](cross-skill-contract-enforcement-2026-06-29.md) — Sibling pattern that codifies the three structural ingredients required for a multi-skill contract to be enforced reliably: per-transition ownership, per-skill Pre-Flight Guards, and a single canonical contract in the orchestrator's SKILL.md. This learning applies that pattern to the task lifecycle; the sibling applies it more broadly.

## When NOT to Use

This is a core invariant. There is no scenario where the contract should be relaxed. All task files in `docs/tasks/` follow this lifecycle; there is no opt-out.

## Future Work

Three deferred items from the plan:

1. **Validator script** — A `validate-lifecycle.sh` that checks every task file in `docs/tasks/` and reports any file whose frontmatter `status` does not match its folder location.
2. **Visual state diagram** — A Mermaid diagram in `pwrl-work/references/workflow-details.md` showing the full state machine with transition owners and triggers.
3. **No-load detection** — A check in `pwrl-work-execute`'s Pre-Flight Guard that detects when a task is in `for-review/` but the review was never performed (e.g., the agent skipped from execute to done).
