---
title: "Cross-Skill Contract Enforcement — Ownership, Pre-Flight Guard, and Centralization"
timestamp: 2026-06-29T19:45:00Z
category: pattern
type: PWRL Learning
severity: high
tags:
  - contract-enforcement
  - multi-skill
  - ownership-boundary
  - pre-flight-guard
  - centralization
domains:
  - pwrl-work
  - pwrl-review
  - task-management
  - skill-architecture
---

# Cross-Skill Contract Enforcement — Ownership, Pre-Flight Guard, and Centralization

## Pattern

A contract that spans multiple micro-skills is enforced reliably when three rules are applied together: (1) each transition in the contract has a **single owner** skill that is the only one allowed to perform it; (2) each skill that participates in the contract opens with a **Pre-Flight Guard** that asserts the pre-conditions for the transition; (3) the contract's canonical text lives in the **orchestrator's** SKILL.md as a top-level section, with sub-skills cross-referencing the orchestrator rather than restating the contract.

## Problem Solved

When a contract is documented only in a reference file or a pattern learning, the agent reading the per-skill SKILL.md files has no reminder of the contract. The agent then either:

- **Skips transitions** that are documented in a pattern learning but not implemented in any skill (e.g., the `for-review → done` transition in the last session — it was in `explicit-review-verdict-flow-2026-06-16.md` but no skill had a step for it).
- **Performs incomplete transitions** by interpreting "Update status" as just frontmatter changes, missing the file move (e.g., `pwrl-work-execute` Serial/Parallel modes said "Update task status to for-review" without the explicit file move that Inline mode had).
- **Violates the contract** by performing transitions owned by other skills (e.g., a downstream skill marking a task as `done` when only the review-report skill should do that).

Documenting the contract in a reference file is not enough. The contract must be visible at every point where the agent might act on it.

## Implementation

### Rule 1: Single Owner per Transition

For each transition in the contract, exactly one skill owns it. The owner:

- Performs the file move (read from old folder, write to new folder, delete from old folder, log)
- Updates the frontmatter (`status:` field)
- Updates the `docs/tasks/INDEX.md` (if applicable)
- Calls the GitHub sync utility (if applicable)

Every other skill has a "MUST NOT perform this transition" rule in its Responsibility Boundary section.

**Example (from the task lifecycle contract):**

| Transition | Owner |
|---|---|
| `to-do → in-progress` | `pwrl-work-prepare` |
| `in-progress → for-review` | `pwrl-work-execute` |
| `for-review → in-progress` (REQUEST CHANGES) | `pwrl-work-review` |
| `for-review → done` (APPROVED) | `pwrl-review-report` |

### Rule 2: Pre-Flight Guard at the Top of Each Owner Skill

Each owner skill opens with a Pre-Flight Guard section that:

- Asserts the input task file is in the folder the phase expects (e.g., `pwrl-work-execute` asserts the file is in `in-progress/` because prepare should have moved it there)
- Refuses to proceed if the assertion fails, with a recovery message
- Cross-references the orchestrator's contract section

**Example (Pre-Flight Guard in `pwrl-work-execute`):**

```markdown
## Pre-Flight Guard

- Assert that the input task file is in `docs/tasks/in-progress/`.
- If the file is in any other folder, refuse to proceed with a recovery message.
- Cross-reference: see `pwrl-work/SKILL.md §"Task Lifecycle Contract"`.
```

The guard is documentation-level, not code-level. The agent reading the SKILL.md should internalize the rule and self-check. No script is required.

### Rule 3: Centralize the Contract in the Orchestrator

The canonical contract (transition table, ownership rules, MUST NOT rules) lives in the orchestrator's SKILL.md as a top-level section, between the Phase Summary and the Quality Criteria. Sub-skills cross-reference the orchestrator's section rather than restating the contract.

**Why the orchestrator:** the agent reads the orchestrator first to understand the pipeline. The orchestrator is the right place for the contract because it has the highest signal-to-noise ratio at the point the agent is forming its mental model.

**Why cross-reference instead of restate:** if each sub-skill restates the contract, drift is inevitable. One place to update, many places to reference.

## When to Use

- Any time a state machine spans multiple skills (task lifecycle, session lifecycle, learning lifecycle, etc.)
- Any time a skill's behavior depends on a contract with other skills
- Any time a transition is described in documentation but not implemented in any skill

## When NOT to Use

- Single-skill workflows (no cross-skill contract)
- Pure documentation workflows (no state machine)
- Workflows where the contract is owned by an external system (e.g., GitHub Issues labels) and the agent only mirrors that system

## Trade-offs

**Pros:**
- Contract violations are visible at the start of each phase, not after
- Single source of truth (the orchestrator) eliminates drift
- Per-skill ownership makes the audit trail unambiguous
- Documentation-level enforcement is cheap to add (no validator script required)

**Cons:**
- More SKILL.md content per skill (Pre-Flight Guard + Responsibility Boundary sections)
- The orchestrator gets longer (the contract section adds ~15 lines)
- Agents that don't read the orchestrator first will still miss the contract
- The pattern doesn't catch violations that the agent performs without reading the relevant skill

## Related Patterns

- `explicit-task-file-movement-critical.md` — Foundation: make file movement a critical, explicit step. The Pre-Flight Guard extends this with phase-ownership.
- `task-state-management-dual-layer-tracking.md` — The dual-layer (folder + frontmatter) state model. The contract assumes this model.
- `explicit-review-verdict-flow-2026-06-16.md` — Three-tier verdict flow that depends on a `for-review → in-progress` rework transition; this learning shows how to enforce that transition via the ownership rule.
- `interaction-mode-three-mode-propagation-2026-06-29.md` — Analogous pattern for propagating the `interactionMode` value across skills. Both patterns use a centralized definition + cross-references in sub-skills.

## Lessons Learned

1. **The agent reads SKILL.md, not pattern learnings.** A contract documented only in a pattern learning is effectively invisible. The contract must be in the SKILL.md the agent reads when executing.
2. **Reference files are advisory, not enforceable.** A transition described in `workflow-details.md` is not enforced by anything; the agent may or may not perform it. The contract must be in the per-skill SKILL.md to be enforced.
3. **The orchestrator is the right place for the canonical contract.** Sub-skills are too narrow; they each see only their slice. The orchestrator sees the whole pipeline.
4. **Pre-Flight Guards are documentation-level enforcement.** This is fine. The agent reading the SKILL.md should internalize the rule. Adding a script-based validator is a future enhancement (see `task-state-machine-enforcement-2026-06-29.md` §"Future Work").
5. **Ownership boundaries are absolute, not advisory.** "MUST NOT" is the right word. "Should not" lets the agent rationalize skipping the rule when convenient.
