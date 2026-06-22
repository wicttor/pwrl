---
unit-id: U14
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-review-report/SKILL.md
  - pwrl-review-report/references/
---

# Extract pwrl-review-report (384 → ≤300)

**Goal:** Shrink `pwrl-review-report/SKILL.md` from 384 to ≤300 lines by moving report-format detail to `references/`.

## Implementation Steps

1. `wc -l pwrl-review-report/SKILL.md` (baseline: 384)
2. Identify extractable blocks: report templates, verdict-rules detail, examples
3. `mkdir -p pwrl-review-report/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Ensure SKILL.md retains `## Input`/`## Workflow`/`## Output` (variants accepted per U3; H1 accepted per U3)
6. `wc -l pwrl-review-report/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-review-report` → no failures

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves

### Verification Commands

```bash
wc -l pwrl-review-report/SKILL.md
npm run validate:skills 2>&1 | grep -A4 pwrl-review-report
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
