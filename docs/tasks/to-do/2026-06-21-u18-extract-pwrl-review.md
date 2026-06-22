---
unit-id: U18
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-review/SKILL.md
  - pwrl-review/references/
---

# Extract pwrl-review (326 → ≤300)

**Goal:** Shrink the `pwrl-review` orchestrator SKILL.md from 326 to ≤300 lines by extracting per-phase detail to `references/`, preserving the phase pipeline and phase summaries.

## Implementation Steps

1. `wc -l pwrl-review/SKILL.md` (baseline: 326)
2. Identify extractable blocks: per-micro-skill detailed descriptions, quality-assessment detail, examples
3. `mkdir -p pwrl-review/references` (if absent)
4. Move blocks into `references/*.md`; replace with pointers in SKILL.md
5. Preserve in SKILL.md: the orchestrator pipeline, phase list with one-line summaries, `## Usage`, `## Workflow`, `## Output`
6. `wc -l pwrl-review/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-review` → no failures (only the line-count gate currently fails it; U4 raises to 300 so this may pass without extraction — verify, then extract only if still >300)

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves

### Verification Commands

```bash
wc -l pwrl-review/SKILL.md
npm run validate:skills 2>&1 | grep -A4 "^- pwrl-review/SKILL"
```

## Acceptance Criteria

- [ ] SKILL.md ≤300 lines
- [ ] Extracted content in `references/` and linked (if any moved)
- [ ] Required sections retained
- [ ] `npm run validate:skills` passes
- [ ] No content lost

## Dependencies

**Depends on:** U3, U4

## Notes

- At 326 lines, after U4 raises the gate to 300 this skill is only 26 lines over — a light extraction. Verify post-U4 first; extract only what's needed.
- This is a core skill (U6 adds `references/phases.yaml` here).
