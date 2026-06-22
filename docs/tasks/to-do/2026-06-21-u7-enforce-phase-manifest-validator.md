---
unit-id: U7
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U2, U5, U6]
files:
  - pwrl-standards/scripts/validate-skills.js
  - tests/pwrl-standards/validate-skills.test.js
---

# Enforce phase manifest in validator (GREEN for U2 manifest tests)

**Goal:** Extend `validate-skills.js` to parse each core skill's `references/phases.yaml` and verify declared phase headings + step keywords are present in SKILL.md — model-agnostic mechanical enforcement (core ask #2).

## Context

Currently the validator checks only structural headers, not phase-step content. After U5 (schema) and U6 (manifests written), the validator can enforce that core skills actually contain their declared phases and steps. This makes the gates deterministic: any agent/model that edits a core skill and drops a phase heading or step keyword will fail `validate:skills`. Enforcement is file-content-only → model-agnostic. Non-core skills without a manifest are unaffected.

## Implementation Steps

1. **Add a manifest parser** (mirror `parseFrontmatter` style)
   - Location: `pwrl-standards/scripts/validate-skills.js`
   - New function: `parsePhaseManifest(skillDir)` → reads `references/phases.yaml` if present, returns `{ workflow, phases: [{ number, name, required_steps }] }` or `null`
   - Parse with a small line-based reader (no YAML dep): handle `key: value`, `- number: N` / `- name: "X"` / `- required_steps:` followed by `  - "keyword"` lines, 2-space indent
2. **Define the set of core skills requiring a manifest**
   - Constant: `const CORE_SKILLS = new Set(['pwrl-review', 'pwrl-work', 'pwrl-plan', 'pwrl-tasks', 'pwrl-learnings'])`
3. **Add manifest enforcement in `validateSkillDir`**
   - If `CORE_SKILLS.has(skillDirName)` and no manifest → push error "Missing required references/phases.yaml for core skill"
   - If manifest present → for each phase:
     - Check a `### Phase <number>:` heading exists in SKILL.md (prefix match, case-insensitive on name)
     - If missing → push error `Phase <number> "<name>" heading not found in SKILL.md`
     - Extract the section text (from the phase heading to the next `### ` or `## ` heading)
     - For each `required_steps` keyword: if not found in section text → push error `Phase <number> missing required step keyword: "<keyword>"`
4. **Extend U2 test suite with manifest tests** (Red first, then Green)
   - Test: a core skill with a phase heading removed → validator reports it
   - Test: a core skill with a step keyword removed → validator reports it
   - Test: a non-core skill without manifest → not flagged
   - Use fixture skills under `tests/pwrl-standards/fixtures/` (create small synthetic skill dirs) to avoid mutating real skills during tests
5. **Run U2 suite → confirm GREEN for manifest tests**
6. **Run full validator → confirm the 5 core skills pass manifest enforcement**
   - Action: `npm run validate:skills 2>&1 | grep -E "phases.yaml|phase.*heading|step keyword"`
   - Expected: no output (all 5 core skills pass)

## Edge Cases

1. **Phase heading has a suffix** — `### Phase 1: Scope Validation (review)`
   - Handling: match on `^### Phase <number>:` prefix only
2. **Keyword appears in a code block in a different phase**
   - Handling: only search within the declared phase's section bounds
3. **Manifest present but skill is non-core**
   - Handling: still enforce it (manifest opted in) — OR ignore. Decision: enforce if present regardless (manifest = explicit contract). Document this.
4. **Malformed manifest**
   - Handling: push error "Malformed phases.yaml: <detail>" rather than crashing

## Testing

### Test-First Approach

1. Write fixture-driven tests in U2 suite (Red): core skill missing heading → fail; missing keyword → fail
2. Implement parser + enforcement (Green)
3. Confirm real core skills pass

### Verification Commands

```bash
node --test tests/pwrl-standards/validate-skills.test.js
npm run validate:skills
```

## Acceptance Criteria

- [ ] `parsePhaseManifest()` loads `references/phases.yaml` when present
- [ ] Core skills without a manifest are flagged (missing required file)
- [ ] For each manifest phase: `### Phase N:` heading presence verified
- [ ] For each declared step keyword: presence in the phase section verified
- [ ] U2 manifest tests pass (Green)
- [ ] All 5 real core skills pass manifest enforcement
- [ ] Non-core skills without manifests are not flagged
- [ ] Enforcement is model-agnostic (file content only, no runtime/agent assumptions)

## Dependencies

**Depends on:** U2 (test suite), U5 (schema), U6 (manifests written)

## Related Files

- [`pwrl-standards/references/phase-manifest-schema.md`](../../../pwrl-standards/references/phase-manifest-schema.md) — U5 schema
- [`pwrl-standards/scripts/validate-skills.js`](../../../pwrl-standards/scripts/validate-skills.js) — `parseFrontmatter` to mirror

## Notes

- Create test fixtures under `tests/pwrl-standards/fixtures/` rather than mutating real skills — keeps tests deterministic and isolated.
- Keep the parser defensive: malformed manifests should produce a clear error, not a crash.
