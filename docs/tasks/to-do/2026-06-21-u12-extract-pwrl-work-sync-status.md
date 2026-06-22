---
unit-id: U12
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-work-sync-status/SKILL.md
  - pwrl-work-sync-status/references/
---

# Extract pwrl-work-sync-status (425 → ≤300)

**Goal:** Shrink `pwrl-work-sync-status/SKILL.md` from 425 to ≤300 lines by moving GitHub-sync detail to `references/`.

## Implementation Steps

1. `wc -l pwrl-work-sync-status/SKILL.md` (baseline: 425)
2. Identify extractable blocks: GitHub Issues API detail, sync examples, verbose step explanations
3. `mkdir -p pwrl-work-sync-status/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Ensure SKILL.md retains `## Usage`/`## Workflow`/`## Output` (variants accepted per U3; H1 accepted per U3)
6. `wc -l pwrl-work-sync-status/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-work-sync-status` → no failures

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves

### Verification Commands

```bash
wc -l pwrl-work-sync-status/SKILL.md
npm run validate:skills 2>&1 | grep -A4 pwrl-work-sync-status
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

- Move, never delete. This skill currently also fails the H1 gate (post-U3 it should pass — verify).
