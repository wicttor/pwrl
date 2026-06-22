---
unit-id: U10
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-work-execute/SKILL.md
  - pwrl-work-execute/references/
---

# Extract pwrl-work-execute (516 → ≤300)

**Goal:** Shrink `pwrl-work-execute/SKILL.md` from 516 to ≤300 lines by moving detailed execution/gate content to `references/`, keeping SKILL.md as the imperative workflow.

## Context

Second-longest skill file. After U3/U4, the validator fails it on the 300-line gate. Preserve all content by moving to `references/`.

## Implementation Steps

1. `wc -l pwrl-work-execute/SKILL.md` (baseline: 516)
2. Identify extractable blocks: detailed quality-gate tables, execution examples, verbose step explanations, debug/remediation guidance
3. `mkdir -p pwrl-work-execute/references` (if absent)
4. Move blocks into `references/*.md` (e.g., `references/quality-gates.md`, `references/execution-examples.md`)
5. Replace moved blocks with 1–2 line pointers in SKILL.md
6. Ensure SKILL.md retains `## Input`, `## Workflow`, `## Output` (variants accepted per U3)
7. `wc -l pwrl-work-execute/SKILL.md` → confirm ≤300
8. Diff review: confirm no content lost
9. `npm run validate:skills 2>&1 | grep pwrl-work-execute` → no failures

## Testing

- **Verify:** SKILL.md ≤300 lines; `npm run validate:skills` passes; diff review confirms moves

### Verification Commands

```bash
wc -l pwrl-work-execute/SKILL.md
npm run validate:skills 2>&1 | grep -A4 pwrl-work-execute
```

## Acceptance Criteria

- [ ] SKILL.md ≤300 lines
- [ ] Extracted content in `references/` and linked
- [ ] Required sections retained
- [ ] `npm run validate:skills` passes
- [ ] No content lost

## Dependencies

**Depends on:** U3, U4

## Notes

- Move, never delete.
