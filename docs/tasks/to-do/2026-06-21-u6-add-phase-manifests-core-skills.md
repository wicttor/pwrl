---
unit-id: U6
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U5]
files:
  - pwrl-review/references/phases.yaml
  - pwrl-work/references/phases.yaml
  - pwrl-plan/references/phases.yaml
  - pwrl-tasks/references/phases.yaml
  - pwrl-learnings/references/phases.yaml
---

# Add phase manifests to the 5 core skills

**Goal:** Write a `references/phases.yaml` manifest for each core skill (review, work, plan, tasks, learnings) matching its existing `### Phase N:` headings and key step keywords, ready for U7 enforcement.

## Context

U5 defined the manifest format. This task populates manifests for the 5 core orchestrators so U7 can enforce them. The manifests must match the phase headings already in each SKILL.md and use step keywords that already appear in those sections (no aspirational keywords — enforcement must pass immediately on current content).

## Implementation Steps

1. **For each core skill, extract phase headings**
   - Action: `grep -E '^### Phase' pwrl-review/SKILL.md` (repeat for work, plan, tasks, learnings)
   - Record the phase numbers and names exactly as written
2. **For each phase, identify 2–5 key step keywords**
   - Read the phase section text; pick keywords that must be present for the phase to be considered "followed" (e.g., for review Phase 1: `scope_verdict`, `files_analyzed`, `interaction_mode`, `user_confirmed`)
   - Source the canonical required fields from `pwrl-phase-checkpoint/references/phase-schemas.md` (each phase's "Required Fields" + "Quality Gates")
3. **Write `references/phases.yaml` for each skill**
   - Use the format from U5
   - Ensure `mkdir -p pwrl-<skill>/references` exists first
4. **Verify manifest phase count == SKILL.md heading count**
   - Action: for each skill, `grep -c '^### Phase' pwrl-<skill>/SKILL.md` == `phases` list length in manifest
5. **Verify each step keyword appears in its phase section**
   - Manual or scripted: for each keyword, confirm it appears between its phase heading and the next `###`/`##` heading in SKILL.md
   - This is critical — U7 will fail the skill if a keyword is missing, so manifests must be accurate now

## Testing

- **Verify:** for each of the 5 skills, manifest phase count == `### Phase` heading count
- **Verify:** every declared `required_steps` keyword is present in the corresponding SKILL.md phase section
- Script check (optional): a quick `grep -q "<keyword>" <phase-section>` for each

### Verification Commands

```bash
for s in pwrl-review pwrl-work pwrl-plan pwrl-tasks pwrl-learnings; do
  echo "$s: $(grep -c '^### Phase' $s/SKILL.md) headings"
  cat $s/references/phases.yaml
done
```

## Acceptance Criteria

- [ ] Each of the 5 core skills has `references/phases.yaml`
- [ ] Manifest phase count == SKILL.md `### Phase` heading count (per skill)
- [ ] Every `required_steps` keyword appears in its phase's section in SKILL.md
- [ ] Manifests follow the U5 format exactly (simple YAML, no anchors/quotes tricks)

## Dependencies

**Depends on:** U5 (schema format must be defined first)

## Related Files

- [`pwrl-phase-checkpoint/references/phase-schemas.md`](../../../pwrl-phase-checkpoint/references/phase-schemas.md) — canonical required fields per phase
- Each core skill's `SKILL.md` — source of phase headings + step text

## Notes

- Do NOT enforce manifests here — that's U7. This task only writes accurate manifests.
- If a phase section in a core skill is missing a keyword you want to declare, either pick a keyword that's present OR (out of scope here) note it for the extraction tasks to fix. Prefer accurate-on-current-content manifests.
- `pwrl-plan`, `pwrl-review`, `pwrl-learnings` are also extraction targets (U17, U18, U13) — ensure manifests reference content that survives extraction (phase headings + key terms, not prose that will move to `references/`).
