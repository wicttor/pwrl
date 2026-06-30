---
title: "Task Acceptance Criteria Should Reference the Current OKF Line-Count Standard, Not a Hard-Coded Number"
timestamp: 2026-06-30T00:50:00Z
category: decision
type: PWRL Learning
severity: medium
tags:
  - process
  - standards
  - line-count
  - okf
  - self-reference
domains:
  - pwrl-standards
  - pwrl-work
  - documentation
---

# Task Acceptance Criteria Should Reference the Current OKF Line-Count Standard, Not a Hard-Coded Number

## Decision

When a task's acceptance criteria specify a line-count threshold (e.g., "SKILL.md stays within the standard (≤ 350 lines)"), the criterion should reference the **standard by name or path**, not by a hard-coded number. For example:

```markdown
# Preferred: references the standard
- [ ] Line count in `pwrl-work/SKILL.md` stays within the OKF acceptable range
  per `pwrl-standards/SCHEMA.md` §Document Structure

# Acceptable: hard-coded, but with a citation
- [ ] Line count in `pwrl-work/SKILL.md` ≤ 300 lines
  (per `pwrl-standards/SCHEMA.md` §Document Structure, relaxed 2026-06-21)

# Not preferred: hard-coded, no citation
- [ ] Line count in `pwrl-work/SKILL.md` ≤ 350 lines
```

The preferred form makes the criterion self-updating when the standard changes. The acceptable form works but requires manual updates when the standard changes. The not-preferred form is a maintenance trap: when the standard changes, every task that hard-codes the old number becomes silently wrong.

## Why

The OKF line-count standard was relaxed from 170 → 300 on 2026-06-21. Tasks U2/U3/U4 of plan 2026-06-29-003 use the pre-relaxation thresholds (`≤ 350`, `≤ 500`). The current standard is `≤ 300`. As a result, U2's file (431 lines) and U3's file (516 lines) are over both the old (350) and the new (300) standards — but the task says they're "within standard" by the old threshold.

A future relax (e.g., 300 → 400) would make this worse: more tasks would be silently wrong, and the agent would either pass them (false negative) or fail them (false positive) depending on which threshold it reads.

## How to Implement

### For new tasks

Use the preferred form (reference the standard by name or path).

### For existing tasks

Run a one-time audit to find tasks with hard-coded line-count thresholds. Replace the hard-coded number with a reference to the standard, or add a parenthetical citation that points to the current value.

### For the standard

`pwrl-standards/SCHEMA.md` already exposes the line-count range as a markdown bullet ("Acceptable range: 80-300 lines"). Optionally, expose it as a queryable value:

- A script (`get-line-count-limit.js`) that reads the standard and prints the current acceptable range
- A JSON file (`pwrl-standards/limits.json`) that the standard document and the tasks both reference

Either approach lets tasks and the standard stay in sync automatically.

## When This Decision Applies

- Any task with a line-count acceptance criterion
- Any standard that may be relaxed in the future (line counts, file sizes, test coverage thresholds, etc.)
- Any cross-reference between a task and a standard doc

## When This Decision Doesn't Apply

- Hard thresholds that are not expected to change (e.g., "must not exceed 10MB")
- Standards that are externally imposed and not under our control
- One-off tasks where the criterion is unlikely to be reused

## Trade-offs

**Pros:**
- Self-updating: when the standard changes, tasks automatically reflect the new threshold
- Single source of truth: the standard is the only place the threshold is defined
- Easier to audit: the validator can check that tasks reference the standard rather than hard-coding a number

**Cons:**
- Requires the standard to be discoverable (a file path or name)
- The hard-coded form is more readable at a glance (no need to look up the standard)
- The script-based approach adds an indirection (the task now depends on a script)

## Related Learnings

- `decision/hybrid-line-gate-strategy-2026-06-21.md` — the strategy that produced the 300-line standard
- `docs/tasks/in-progress/2026-06-29-u2-preflight-guard-prepare.md` — a task that uses a stale threshold (350)
- `docs/tasks/in-progress/2026-06-29-u3-preflight-guard-execute.md` — a task that uses a stale threshold (500)

## Lessons Learned

1. **A threshold is a contract.** If the contract is hard-coded in N places, all N must be updated when the contract changes. A self-referencing contract reduces N to 1.
2. **Standards drift.** Any standard that is not enforced by an automated check will drift over time as authors copy-paste old thresholds.
3. **A reference is cheaper than a number.** A reference can be updated in one place; a number must be hunted down in every task.
