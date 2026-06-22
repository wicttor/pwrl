---
unit-id: U6
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: for-review
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

---

## Review Findings (2026-06-22, pwrl-review)

**Scope:** U6 implementation: 5 new `references/phases.yaml` files (pwrl-review, pwrl-work, pwrl-plan, pwrl-tasks, pwrl-learnings)
**Reviewer:** MiniMax-M3, single-pass review
**Verdict:** ⚠️ **REQUEST CHANGES** (0 critical, 2 major, 2 minor)

The manifests are well-structured and accurately enumerate the 4–8 phases per skill. However, two structural issues in `pwrl-plan/references/phases.yaml` will block U7's enforcement from working correctly. These are fixable in-place.

### Scope Check

- ✅ U6 task files in scope: 5 new `references/phases.yaml` files only — no SKILL.md edits, no validator changes
- ✅ Phase count per skill == `### Phase` heading count in corresponding SKILL.md (verified by grep)

### Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Each of the 5 core skills has `references/phases.yaml` | ✅ Pass | All 5 files exist |
| Manifest phase count == SKILL.md `### Phase` heading count | ✅ Pass | pwrl-review 4=4, pwrl-work 4=4, pwrl-plan 8=8, pwrl-tasks 3=3, pwrl-learnings 5=5 |
| Every `required_steps` keyword appears in its phase's section in SKILL.md | ❌ **Fail** | 1 case-sensitivity miss in pwrl-plan P#4 (see P1) |
| Manifests follow the U5 format exactly (simple YAML, no anchors/quotes tricks) | ✅ Pass | All 5 use simple `key: value` + `- item` + 2-space indent; no anchors/aliases/multi-line strings |

### Findings

#### P1 — Major (must fix before U7)

- **pwrl-plan manifest has duplicate phase numbers (1, 2, 3, 4 each appear twice)** — `pwrl-plan/references/phases.yaml`
  - The manifest declares 8 phases: 4 main (`Scope`, `Research`, `Design`, `Generate` with numbers 1–4) plus 4 error sub-phases (`(Scope) Errors`, `(Research) Errors`, `(Design) Errors`, `(Generate) Errors` with **the same numbers 1–4**).
  - **Why it matters:** The U5 phase-manifest schema ([`phase-manifest-schema.md`](../../../pwrl-standards/references/phase-manifest-schema.md)) describes validation as "scan for `### Phase <number>:` prefix and verify the name appears". If U7 looks up by `number`, it will only find the first occurrence (`### Phase 1: Scope (pwrl-plan-scope)`), and the `### Phase 1 (Scope) Errors` section will never be checked. **The error sub-phases will silently skip keyword enforcement.**
  - **Suggested fix (options, pick one):**
    1. **(Recommended)** Renumber the error sub-phases to 5–8 in both manifest and SKILL.md headings (e.g., `### Phase 5: Scope Errors` and manifest `number: 5, name: "Scope Errors"`). Cleanest.
    2. Make the manifest number a string and use unique identifiers (e.g., `number: "1-errors"`, `name: "Scope Errors"`). Requires U5 schema extension.
    3. Drop the 4 error sub-phases from the manifest entirely; enforce them via the main phase's `required_steps` instead. Smallest manifest, but loses per-error granularity.
  - **Acceptance criterion "Every `required_steps` keyword appears in its phase's section" is technically not met** because the validator's number-based lookup will pick the wrong section for the error sub-phases.

- **Case-sensitive keyword mismatch: `plan document` vs `Plan document`** — `pwrl-plan/references/phases.yaml` Phase 4
  - Manifest declares `required_steps: - plan document` (lowercase). SKILL.md line 157 contains `**Output:** Plan document saved to file...` (capitalized P).
  - **Why it matters:** The U5 schema says "Substring match within the section's text" but doesn't specify case sensitivity. The current `validate-skills.js` uses `content.includes()` which is case-sensitive. U7 will fail this keyword check. **However, the keyword IS present case-insensitively** — so the intent is met, only the literal text is wrong.
  - **Suggested fix:** change manifest to `Plan document` (capitalize to match the SKILL.md text). One-line fix.

#### P2 — Minor

- **Manifest `name` field for `pwrl-plan` error sub-phases diverges from the SCHEMA's "name matches heading text" rule** — `pwrl-plan/references/phases.yaml` lines 28, 33, 38, 43
  - Manifest has `name: "(Scope) Errors"` (parens-first format). SKILL.md heading is `### Phase 1 (Scope) Errors` (parens contain the phase name, not first). The U5 schema says: name is "case-insensitive match" with "suffix tolerance", so this is technically allowed. But the convention established by the main phases (`name: "Scope"`, heading `### Phase 1: Scope (pwrl-plan-scope)`) is to put the simple name first.
  - **Suggested fix:** if you keep the error sub-phases, rename to `name: "Scope Errors"` and update SKILL.md heading to `### Phase 5: Scope Errors` (or whatever new number). This requires the renumbering fix from P1, so fold them together.

- **Manifest `name` for `pwrl-plan` main phases is too short (drops the skill name suffix)** — `pwrl-plan/references/phases.yaml` lines 3, 11, 19, 27
  - Manifest has `name: "Scope"`, but the SKILL.md heading is `### Phase 1: Scope (pwrl-plan-scope)`. The U5 schema says name match is case-insensitive and suffix-tolerant, so this works. But it diverges from the convention in other manifests (e.g., `pwrl-review` uses full names like `"Validate Scope"` matching heading `### Phase 1: Validate Scope`).
  - **Suggested fix (optional):** rename to `name: "Scope (pwrl-plan-scope)"` for consistency. Not blocking.

### Keyword Presence Audit (per skill, all phases)

Verified by extracting each phase's section text and substring-matching every declared keyword:

| Skill | Phase | All keywords present? | Notes |
|-------|-------|----------------------|-------|
| pwrl-review | 1 Validate Scope | ✅ | `scope_verdict`, `interaction_mode`, `files modified`, `user approval` all in section |
| pwrl-review | 2 Prepare Review | ✅ | `review_scope`, `tools_configured`, `Gather diff`, `analysis tools` all in section |
| pwrl-review | 3 Analyze Code | ✅ | `Code Quality`, `Security`, `Tests`, `Documentation`, `Integration` all in section |
| pwrl-review | 4 Generate Report | ✅ | `verdict`, `approved`, `user approval`, `report artifact` all in section |
| pwrl-work | 0 Triage Input | ✅ | all 4 keywords present |
| pwrl-work | 1 Prepare Environment | ✅ | all 4 keywords present |
| pwrl-work | 2 Execute Implementation | ✅ | all 4 keywords present |
| pwrl-work | 3 Review & Simplify | ✅ | all 4 keywords present |
| pwrl-plan | 1 Scope | ✅ | all 5 keywords present |
| pwrl-plan | 2 Research | ✅ | all 4 keywords present |
| pwrl-plan | 3 Design | ✅ | all 5 keywords present |
| pwrl-plan | 4 Generate | ❌ | `plan document` case-mismatch (see P1 above); other 3 keywords OK |
| pwrl-plan | 1 (Scope) Errors | ✅ (per section) | All 3 keywords present in `### Phase 1 (Scope) Errors` section — but U7 won't reach this section due to duplicate number (P1) |
| pwrl-plan | 2 (Research) Errors | ✅ (per section) | Same situation |
| pwrl-plan | 3 (Design) Errors | ✅ (per section) | Same situation |
| pwrl-plan | 4 (Generate) Errors | ✅ (per section) | Same situation |
| pwrl-tasks | 1 Locate and Read the Plan | ✅ | all 3 keywords present |
| pwrl-tasks | 2 Generate Task Files | ✅ | all 3 keywords present |
| pwrl-tasks | 3 Generate Index and Report | ✅ | all 3 keywords present |
| pwrl-learnings | 1 Extract Learnings | ✅ | all 4 keywords present |
| pwrl-learnings | 2 Classify Learnings | ✅ | all 4 keywords present |
| pwrl-learnings | 3 Structure Learnings | ✅ | all 3 keywords present |
| pwrl-learnings | 4 Deduplicate Learnings | ✅ | all 3 keywords present |
| pwrl-learnings | 5 Save Learnings | ✅ | all 4 keywords present |

**Net:** 24/25 phase keyword sets pass when the section is correctly located. The single failure is the case-sensitivity issue; the structural problem (duplicate numbers) is separate.

### Format Compliance (per U5 schema)

- ✅ All 5 manifests use simple `key: value` + `- item` + 2-space indent
- ✅ No anchors, aliases, merge keys, multi-line strings, or JSON structures
- ✅ `workflow` field matches skill directory name in all 5
- ✅ `phases` is an ordered list
- ✅ Each phase has `number` (int), `name` (string), `required_steps` (list)
- ⚠ `number` uniqueness is implicit in U5 schema examples; not explicitly required. pwrl-plan violates the implicit rule (P1 above).

### Integration Check

- ✅ Manifests reference content that currently exists in SKILL.md
- ⚠ The 3 error sub-phases in pwrl-plan will need to survive U17's content extraction (the task notes flag this risk). Renumbering to 5–8 (P1 fix) is robust to extraction because the headings themselves are short and the keywords are short.
- ✅ Manifests are in the correct location (`<skill>/references/phases.yaml`)
- ✅ Manifests will be picked up by the U5/U7 schema expectation (file name and location match)

### Verdict

**REQUEST CHANGES** — Two fixable issues in `pwrl-plan/references/phases.yaml`:

1. **(P1)** Renumber the 4 error sub-phases from 1–4 to 5–8 (in both manifest and SKILL.md headings).
2. **(P1)** Capitalize the Phase 4 keyword `plan document` → `Plan document` to match SKILL.md text.

The other 4 manifests (`pwrl-review`, `pwrl-work`, `pwrl-tasks`, `pwrl-learnings`) are APPROVED as-is.

**Post-fix verification:**
```bash
# Verify all 5 manifests parse and all keywords are case-sensitively present
node -e "<verification snippet>"
npm run validate:skills  # After U7 lands, should report 0 manifest errors for these 5 skills
```
