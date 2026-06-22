---
unit-id: U11
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-work-prepare/SKILL.md
  - pwrl-work-prepare/references/
---

# Extract pwrl-work-prepare (462 → ≤300)

**Goal:** Shrink `pwrl-work-prepare/SKILL.md` from 462 to ≤300 lines by moving environment-setup detail to `references/`.

## Implementation Steps

1. `wc -l pwrl-work-prepare/SKILL.md` (baseline: 462)
2. Identify extractable blocks: detailed env-check lists, ambiguity-resolution examples, verbose step explanations
3. `mkdir -p pwrl-work-prepare/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Ensure SKILL.md retains `## Input`/`## Workflow`/`## Output` (variants accepted per U3)
6. `wc -l pwrl-work-prepare/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-work-prepare` → no failures

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves

### Verification Commands

```bash
wc -l pwrl-work-prepare/SKILL.md
npm run validate:skills 2>&1 | grep -A4 pwrl-work-prepare
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
