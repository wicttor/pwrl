---
unit-id: U5
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: done
created: 2026-06-21
started: 2026-06-22
dependencies: []
files:
  - pwrl-standards/references/phase-manifest-schema.md
  - pwrl-standards/SCHEMA.md
---

# Design phase-manifest schema for core skills

**Goal:** Define a machine-readable YAML manifest format listing each core skill's required phases and per-phase step keywords, so the validator (U7) can mechanically enforce that core skills follow their declared steps — model-agnostic.

## Context

The user's core ask #2: ensure core skills follow their phase steps regardless of agent/model. `pwrl-phase-checkpoint` defines phase schemas in `references/phase-schemas.md`, but nothing checks that a core skill's SKILL.md actually contains the steps for each declared phase. A phase manifest is a machine-readable contract: the validator parses it and verifies each declared phase has a `### Phase N:` heading in SKILL.md and that each declared step keyword appears in that section. This is file-content-only → model-agnostic. Manifest is REQUIRED for the 5 core orchestrators (review, work, plan, tasks, learnings), OPTIONAL elsewhere.

## Implementation Steps

1. **Create the schema doc**
   - File: `pwrl-standards/references/phase-manifest-schema.md` (new)
   - Define the manifest format as YAML, constrained to simple `key: value` and nested lists parseable by the validator's existing frontmatter-style line parser (no external YAML dependency)
2. **Define the manifest structure**
   - Top-level fields: `workflow` (string, matches skill dir name), `phases` (ordered list)
   - Each phase: `number` (int), `name` (string, matches the `### Phase N: Name` heading), `required_steps` (list of keyword strings that must appear in that phase's section text)
   - Example manifest:
     ```yaml
     workflow: pwrl-review
     phases:
       - number: 1
         name: "Scope Validation"
         required_steps: ["scope_verdict", "files_analyzed", "interaction_mode", "user_confirmed"]
       - number: 2
         name: "Prepare Review"
         required_steps: ["diff_summary", "review_scope", "tools_configured"]
     ```
3. **Define validation rules** (to be implemented in U7)
   - For each phase: a `### Phase <number>: <name>` heading must exist in SKILL.md (name match is case-insensitive, colon optional per U3 relax)
   - For each `required_steps` keyword: the keyword string must appear in the section text between this phase heading and the next `### ` or `## ` heading
4. **Document REQUIRED vs OPTIONAL**
   - REQUIRED: `pwrl-review`, `pwrl-work`, `pwrl-plan`, `pwrl-tasks`, `pwrl-learnings` (must have `references/phases.yaml`)
   - OPTIONAL: all other skills (manifest ignored if absent, no failure)
5. **Update SCHEMA.md**
   - Add a new subsection under "Document Structure" → "Phase Manifest (core workflow skills)"
   - Cross-reference `pwrl-phase-checkpoint/references/phase-schemas.md` as the source of phase definitions and quality gates
6. **Keep format parseable by simple line parser**
   - Constraint: no YAML anchors, no multi-line strings, no quoting tricks — just `key: value`, `- item`, and 2-space indentation. The validator will parse with a small hand-rolled reader (consistent with `parseFrontmatter` in `validate-skills.js`).

## Edge Cases

1. **Phase heading uses a suffix** — `### Phase 1: Scope Validation (review)`
   - Handling: match on `### Phase <number>:` prefix + keyword presence, tolerate suffix
2. **Step keyword appears in a different phase's section**
   - Handling: only count keyword presence within the declared phase's section bounds (next `###`/`##` heading)
3. **Core skill with no manifest**
   - Handling: validator fails it with "missing required phases.yaml for core skill"

## Testing

- **Verify:** schema doc is unambiguous and a small Node snippet can parse the example manifest using only line-based logic
- Manual review: walk through `parseFrontmatter`-style parsing on the example

## Acceptance Criteria

- [ ] `pwrl-standards/references/phase-manifest-schema.md` exists and defines the format unambiguously
- [ ] Format is parseable by a simple line-based Node parser (no external deps)
- [ ] SCHEMA.md documents the manifest as REQUIRED for the 5 core skills, OPTIONAL elsewhere
- [ ] Cross-reference to `pwrl-phase-checkpoint/references/phase-schemas.md` included

## Dependencies

None. Can start immediately (parallel with U1, U2).

## Related Files

- [`pwrl-phase-checkpoint/references/phase-schemas.md`](../../../pwrl-phase-checkpoint/references/phase-schemas.md) — source of phase definitions
- [`pwrl-standards/scripts/validate-skills.js`](../../../pwrl-standards/scripts/validate-skills.js) — `parseFrontmatter` parser to mirror

## Notes

- This task defines the contract only; U6 fills in manifests, U7 implements enforcement.
- Keep the format deliberately simple — the validator must parse it without a YAML library.
