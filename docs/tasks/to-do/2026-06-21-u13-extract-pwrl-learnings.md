---
unit-id: U13
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-learnings/SKILL.md
  - pwrl-learnings/references/
---

# Extract pwrl-learnings (411 → ≤300)

**Goal:** Shrink the `pwrl-learnings` orchestrator SKILL.md from 411 to ≤300 lines by extracting per-phase detail to `references/`, preserving the phase pipeline diagram and phase summaries.

## Implementation Steps

1. `wc -l pwrl-learnings/SKILL.md` (baseline: 411)
2. Identify extractable blocks: per-micro-skill detailed descriptions, test-coverage tables, verbose examples
3. `mkdir -p pwrl-learnings/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Preserve in SKILL.md: the orchestrator pipeline diagram, the phase list with one-line summaries, `## Usage`, `## Workflow`, `## Output`
6. `wc -l pwrl-learnings/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-learnings` → no failures (H1 gate cleared by U3)

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves; phase pipeline preserved in SKILL.md

### Verification Commands

```bash
wc -l pwrl-learnings/SKILL.md
npm run validate:skills 2>&1 | grep -A4 "^- pwrl-learnings/SKILL"
```

## Acceptance Criteria

- [ ] SKILL.md ≤300 lines
- [ ] Extracted content in `references/` and linked
- [ ] Orchestrator pipeline diagram + phase summaries retained in SKILL.md
- [ ] Required sections retained
- [ ] `npm run validate:skills` passes
- [ ] No content lost

## Dependencies

**Depends on:** U3, U4

## Notes

- This is the orchestrator (not a micro-skill). Preserve the high-level pipeline view in SKILL.md; extract per-phase depth.
- U6 will add `references/phases.yaml` here — ensure your extraction doesn't conflict with that file.
