---
unit-id: U17
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U3, U4]
files:
  - pwrl-plan/SKILL.md
  - pwrl-plan/references/
---

# Extract pwrl-plan (327 → ≤300)

**Goal:** Shrink the `pwrl-plan` orchestrator SKILL.md from 327 to ≤300 lines by extracting error handling, FAQs, and architecture notes to `references/`, preserving the four-phase pipeline diagram and phase summaries.

## Implementation Steps

1. `wc -l pwrl-plan/SKILL.md` (baseline: 327)
2. Identify extractable blocks: "Error Handling & Recovery" section, "Frequently Asked Questions", "Architecture: No Agent Routing" detail, "Testing & Validation" detail
3. `mkdir -p pwrl-plan/references` (if absent)
4. Move blocks into `references/*.md` (e.g., `references/error-handling.md`, `references/architecture.md`, `references/faq.md`); replace with pointers in SKILL.md
5. Preserve in SKILL.md: the four-phase pipeline diagram, phase list with one-line summaries, `## Usage`, `## Core Workflow` (accepted per U3), `## Key Outputs`
6. `wc -l pwrl-plan/SKILL.md` → ≤300
7. Diff review: no content lost
8. `npm run validate:skills 2>&1 | grep pwrl-plan` → no failures

## Testing

- **Verify:** ≤300 lines; validator passes; diff confirms moves; pipeline diagram preserved

### Verification Commands

```bash
wc -l pwrl-plan/SKILL.md
npm run validate:skills 2>&1 | grep -A4 "^- pwrl-plan/SKILL"
```

## Acceptance Criteria

- [ ] SKILL.md ≤300 lines
- [ ] Extracted content in `references/` and linked
- [ ] Four-phase pipeline diagram + phase summaries retained in SKILL.md
- [ ] Required sections retained (`## Usage`, `## Core Workflow`, `## Key Outputs`)
- [ ] `npm run validate:skills` passes
- [ ] No content lost

## Dependencies

**Depends on:** U3, U4

## Notes

- This is an orchestrator and a core skill (U6 adds `references/phases.yaml` here). Ensure extraction doesn't conflict with the manifest file.
- Preserve the pipeline overview in SKILL.md; extract depth to `references/`.
