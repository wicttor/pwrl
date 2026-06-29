---
title: Explicit Three-Tier Verdict Flow for Code Review (APPROVED / REQUEST CHANGES / REJECTED)
timestamp: 2026-06-16
category: pattern
type: PWRL Learning
tags:
  - code-review
  - verdict
  - task-management
  - workflow
  - pwrl-review
severity: medium
context: Updated pwrl-review/SKILL.md to replace binary approve/deny with three explicit verdicts
---

# Explicit Three-Tier Verdict Flow for Code Review

## What It Is

A structured review verdict system where code review produces one of three explicit outcomes, each with defined task file management actions:

| Verdict | Meaning | Task Action |
|---------|---------|-------------|
| **APPROVED** | No bugs, issues, or remaining tasks found | Move from `for-review/` → `done/` |
| **REQUEST CHANGES** | Fixable issues found; needs rework | Move from `for-review/` → `in-progress/` |
| **REJECTED** | Unfixable issues or scope creep | Leave in `for-review/` with explanation |

## Why It Matters

The previous binary model (approve/deny) was too simplistic:

1. **"Deny" was ambiguous** — Did it mean "fix these specific things" or "this entire approach is wrong"?
2. **No task state management** — Each verdict now maps to explicit file operations
3. **No accountability** — REJECTED now requires explanation; APPROVED is explicit

## When to Use

- **Any code review workflow** that manages task files
- **Projects with formal review gates** before merge
- **Multi-developer environments** where review outcomes must be unambiguous

## The Pattern

### Phase 1: Analyze Code

Perform the review analysis (quality, security, tests, docs, integration).

### Phase 2: Assign Verdict

**APPROVED — Ready to merge:**
- Move task file from `docs/tasks/for-review/` to `docs/tasks/done/`
- Update frontmatter: `status: for-review` → `status: done`
- Update GitHub Issue status to "Done" (if integration enabled)

**REQUEST CHANGES — Fixable issues found:**
- Move task file back from `docs/tasks/for-review/` to `docs/tasks/in-progress/`
- Update frontmatter: `status: for-review` → `status: in-progress`
- Add review findings (P0/P1 issues) to task body as required fixes
- Update GitHub Issue status to "In Progress" (if integration enabled)

**REJECTED — Unfixable issues or scope creep:**
- Leave task file in `docs/tasks/for-review/`
- Add findings to task body with explanation
- Request user clarification before proceeding

### State Machine

```
in-progress → for-review → APPROVED → done
                            REQUEST CHANGES → in-progress (rework loop)
                            REJECTED → for-review (stalled, needs clarification)
```

## Example

```yaml
# Task frontmatter before review
status: for-review
verdict: pending

# After APPROVED
status: done
verdict: approved

# After REQUEST CHANGES
status: in-progress
verdict: changes-requested
findings:
  - P0: Missing null check at user.service.js:142
  - P1: Unclear variable name `data` at user.service.js:88

# After REJECTED
status: for-review
verdict: rejected
findings:
  - "Scope creep: PR includes unrelated API changes"
  - "This should be split into separate PRs"
```

## Tradeoffs

**Pros:**
- Clear, unambiguous outcomes
- Task file state always reflects true review status
- Rework loop is explicit and tracked
- REJECTED requires explanation, preventing silent blockers

**Cons:**
- More complex than binary approve/deny
- Requires task file system integration
- REJECTED tasks can stall without user action

## Related

- `decision/remove-agent-infrastructure-2026-06-16.md` — This change was made as part of the same session
- `pattern/explicit-task-file-movement-critical.md` — Related pattern about task file movement as explicit operation
