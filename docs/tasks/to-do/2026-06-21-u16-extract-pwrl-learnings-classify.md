---
unit-id: U16
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-learnings-classify/SKILL.md
  - pwrl-learnings-classify/references/
---

# Extract pwrl-learnings-classify (342 → ≤300)

**Goal:** Shrink `pwrl-learnings-classify/SKILL.md` from 342 to ≤300 lines by moving classification detail to `references/`.

## Implementation Steps

1. `wc -l pwrl-learnings-classify/SKILL.md` (baseline: 342)
2. Identify extractable blocks: type/domain/priority taxonomy tables, examples, verbose step explanations
3. `mkdir -p pwrl-learnings-classify/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Ensure SKILL.md retains `## Input`/`## Workflow`/`## Output` (variants accepted per U3; H1 accepted per U3)
6. `wc -l pwrl-learnings-classify/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-learnings-classify` → no failures

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves

### Verification Commands

```bash
wc -l pwrl-learnings-classify/SKILL.md
npm run validate:skills 2>&1 | grep -A4 pwrl-learnings-classify
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
