---
unit-id: U9
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-learnings-structure/SKILL.md
  - pwrl-learnings-structure/references/
---

# Extract pwrl-learnings-structure (553 → ≤300)

**Goal:** Shrink `pwrl-learnings-structure/SKILL.md` from 553 to ≤300 lines by moving detailed schema/format guidance and examples into `references/`, keeping SKILL.md as the imperative workflow.

## Context

This is the longest skill file in the repo (553 lines) and the top extraction target. The validator (after U3/U4) will fail it on the 300-line gate until extracted. Preserve all content — move, don't delete — and keep required sections (`## Usage`/`## Workflow`/`## Output`) in SKILL.md, linked to `references/`.

## Implementation Steps

1. `wc -l pwrl-learnings-structure/SKILL.md` (baseline: 553)
2. Identify extractable blocks: detailed field schemas, full examples, verbose decision trees, long step explanations
3. `mkdir -p pwrl-learnings-structure/references` (if absent)
4. Move identified blocks into `references/*.md` files (e.g., `references/structure-schema.md`, `references/examples.md`)
5. Replace moved blocks in SKILL.md with 1–2 line pointers: `See [references/structure-schema.md](references/structure-schema.md) for field definitions.`
6. Ensure SKILL.md retains: `## Usage` (or `## Input`), `## Workflow`, `## Output` (variants accepted per U3)
7. `wc -l pwrl-learnings-structure/SKILL.md` → confirm ≤300
8. Diff review: confirm no content lost (moved to references, linked from SKILL.md)
9. `npm run validate:skills 2>&1 | grep pwrl-learnings-structure` → no failures

## Testing

- **Verify:** SKILL.md ≤300 lines
- **Verify:** `npm run validate:skills` passes for this skill
- **Verify:** diff review confirms all moved content is present in `references/` and linked

### Verification Commands

```bash
wc -l pwrl-learnings-structure/SKILL.md          # <= 300
npm run validate:skills 2>&1 | grep -A4 pwrl-learnings-structure
```

## Acceptance Criteria

- [ ] SKILL.md ≤300 lines
- [ ] Extracted content lives in `references/*.md` and is linked from SKILL.md
- [ ] Required sections (`## Usage`/`## Input`, `## Workflow`, `## Output`) retained in SKILL.md
- [ ] `npm run validate:skills` passes for `pwrl-learnings-structure`
- [ ] No content lost (diff review confirms moves)

## Dependencies

**Depends on:** U3, U4 (validator must accept header variants + 300-line gate before this is meaningful)

## Notes

- Move, never delete. If unsure whether to move a block, move it — `references/` is the right home for detail.
- If this skill is `pwrl-learnings` (the orchestrator, U13) vs `pwrl-learnings-structure` (micro-skill) — confirm you're editing the right one (this task is the micro-skill).
