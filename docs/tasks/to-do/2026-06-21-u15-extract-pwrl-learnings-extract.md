---
unit-id: U15
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-learnings-extract/SKILL.md
  - pwrl-learnings-extract/references/
---

# Extract pwrl-learnings-extract (352 → ≤300)

**Goal:** Shrink `pwrl-learnings-extract/SKILL.md` from 352 to ≤300 lines by moving extraction detail to `references/`.

## Implementation Steps

1. `wc -l pwrl-learnings-extract/SKILL.md` (baseline: 352)
2. Identify extractable blocks: candidate-typing detail, examples, verbose step explanations
3. `mkdir -p pwrl-learnings-extract/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Ensure SKILL.md retains `## Input`/`## Workflow`/`## Output` (variants accepted per U3; H1 accepted per U3)
6. `wc -l pwrl-learnings-extract/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-learnings-extract` → no failures

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves

### Verification Commands

```bash
wc -l pwrl-learnings-extract/SKILL.md
npm run validate:skills 2>&1 | grep -A4 pwrl-learnings-extract
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
