---
title: "A Transition Documented in a Pattern Learning but Not Implemented in Any Skill is Effectively Invisible"
timestamp: 2026-06-29T19:45:00Z
category: decision
type: PWRL Learning
severity: high
tags:
  - documentation-vs-implementation
  - pattern-learnings
  - contract-enforcement
  - audit-trail
domains:
  - pwrl-work
  - pwrl-review
  - documentation
  - skill-architecture
---

# A Transition Documented in a Pattern Learning but Not Implemented in Any Skill is Effectively Invisible

## Decision

For each transition described in a pattern learning, there must be at least one skill with an explicit step that performs it. If a transition is documented but not implemented in any skill, treat it as a bug: either implement it in a skill or remove it from the pattern learning.

## Why

The agent reads SKILL.md files, not pattern learnings. A pattern learning is a document the human reads to understand the system. The agent's primary source of truth is the per-skill SKILL.md that describes what to do at each step.

This means:

- A transition described in a pattern learning but with no step in any skill is **invisible** to the agent. The agent will either skip the transition or perform it incorrectly.
- A transition described in a pattern learning **and** implemented in a skill is **enforced**. The agent reads the SKILL.md, sees the step, and performs it.
- A transition described only in a SKILL.md (no pattern learning) is also **enforced** but lacks the rationale. Future readers won't know *why* the transition exists.

The ideal is both: a pattern learning explains the *why*, and a SKILL.md implements the *how*. A pattern learning without a SKILL.md implementation is a documentation-only contract that the agent can't fulfill.

## The Failure Mode

In the last session, the `for-review → done` transition was:

- ✅ Described in `explicit-review-verdict-flow-2026-06-16.md`: "Move task file from `docs/tasks/for-review/` to `docs/tasks/done/`"
- ❌ Not implemented in any skill: `pwrl-work-review` produced a `readyForShipping` flag and stopped; `pwrl-review-report` emitted a report artifact and stopped

The agent, asked to handle the transition, fell back to its own interpretation: move the file directly from `to-do/` to `done/`, skipping `for-review/` and `in-progress/`. The result was a state machine violation that went undetected because no Pre-Flight Guard was in place.

The transition was effectively invisible. The pattern learning described it; the SKILL.md files did not implement it; the agent's behavior was the gap.

## How to Detect

Symptoms of this gap:

- A pattern learning describes an action (e.g., "Move file from X to Y")
- Searching the SKILL.md files for the action's keywords (e.g., "move file from X to Y") returns no match
- The transition is described in conversation but the agent skips it
- A reviewer finds that an action is documented in a learning but not in any code/skill

## How to Audit

For each pattern learning, list every action it describes. For each action, grep the SKILL.md files for keywords that would indicate an implementation. Mismatches are gaps to fix.

**Example audit (for the task lifecycle contract):**

| Action in learning | Skill that should implement it | Found in SKILL.md? |
|---|---|---|
| Move `to-do → in-progress` | `pwrl-work-prepare` | ✅ Yes (Inline only) |
| Move `in-progress → for-review` | `pwrl-work-execute` | ⚠️ Partial (Inline has it; Serial/Parallel don't) |
| Move `for-review → in-progress` (REQUEST CHANGES) | `pwrl-work-review` | ❌ No |
| Move `for-review → done` (APPROVED) | `pwrl-review-report` | ❌ No |

The audit reveals three gaps. All three are fixed in plan 2026-06-29-003 (U3, U4, U5).

## How to Fix

For each gap:

1. **Implement the transition in the appropriate skill.** Add a "CRITICAL: Move file" block to the skill that owns the transition.
2. **Add a Pre-Flight Guard** to the skill so future violations are caught.
3. **Update the pattern learning** to cite the skill that implements the transition (so future readers know where to look for the implementation).

If a transition cannot be implemented in any skill (e.g., it's purely conceptual), remove it from the pattern learning to avoid the agent treating it as actionable.

## When This Decision Applies

- Any pattern learning that describes a state transition, a file move, a code change, or any other agent-actionable step
- Any architectural decision documented in a learning but not reflected in the code
- Any contract described in a design doc but with no implementation in the codebase

## When This Decision Doesn't Apply

- Pattern learnings that describe background knowledge (e.g., "Why we use snake_case for field names")
- Pattern learnings that describe non-actionable concepts (e.g., "The dual-layer state model has folder and frontmatter")
- Decisions documented in `docs/learnings/decision/` (these are *not* transitions; they are reasons)

## Related Patterns

- `explicit-review-verdict-flow-2026-06-16.md` — The pattern learning that described the `done` transition but was not implemented. This decision is the corrective.
- `cross-skill-contract-enforcement-2026-06-29.md` — The enforcement pattern that prevents this gap from recurring.
- `explicit-task-file-movement-critical.md` — The pattern that makes individual file moves explicit. This decision extends that to the audit process.
