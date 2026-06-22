---
unit-id: U19
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-review-analyze/SKILL.md
  - pwrl-review-analyze/references/
---

# Extract pwrl-review-analyze (324 → ≤300)

**Goal:** Shrink `pwrl-review-analyze/SKILL.md` from 324 to ≤300 lines by moving analysis detail to `references/`.

## Implementation Steps

1. `wc -l pwrl-review-analyze/SKILL.md` (baseline: 324)
2. Identify extractable blocks: analysis-category detail, severity-rules tables, examples
3. `mkdir -p pwrl-review-analyze/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Ensure SKILL.md retains `## Input`/`## Workflow`/`## Output` (variants accepted per U3; H1 accepted per U3)
6. `wc -l pwrl-review-analyze/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-review-analyze` → no failures (at 324, post-U4 only 24 lines over — light extraction)

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves

### Verification Commands

```bash
wc -l pwrl-review-analyze/SKILL.md
npm run validate:skills 2>&1 | grep -A4 pwrl-review-analyze
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

- At 324 lines, post-U4 only 24 lines over — light extraction. Verify post-U4 first.
- Move, never delete.
