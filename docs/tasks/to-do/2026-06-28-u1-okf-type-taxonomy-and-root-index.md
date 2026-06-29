---
unit-id: U1
plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
status: to-do
created: 2026-06-28
type: PWRL Task
dependencies: []
files:
  - docs/OKF-TYPES.md
  - docs/index.md
---

# Define OKF Type Taxonomy & Create Root Index

**Goal:** Establish standard `type` values for all PWRL document categories and create the bundle root `docs/index.md` for progressive disclosure.

## Context

Before any frontmatter can be updated on existing documents, we need a canonical set of OKF `type` values for each PWRL document category. OKF requires every concept document to have a `type` field, but does not prescribe what values to use — producers pick descriptive, self-explanatory values. We also need a root `index.md` so the bundle is navigable (OKF §6 progressive disclosure).

This task creates two new reference files. No existing files are modified.

## Implementation Steps

1. **Survey PWRL document categories**
   - Action: List all directories under `docs/` that contain concept documents
   - Categories: learnings, tasks, analysis, guides, examples, plans, test-plans
   - Confirm `docs/OKF.md` already has a `type` field and is OKF-compliant (no changes needed)

2. **Define type taxonomy**
   - Action: Create `docs/OKF-TYPES.md` with a table mapping each category to its OKF `type` value
   - Type values: `PWRL Learning`, `PWRL Task`, `PWRL Analysis`, `PWRL Guide`, `PWRL Example`, `PWRL Plan`, `PWRL Test Plan`
   - Include field mapping table: PWRL field → OKF field (`date` → `timestamp`, etc.)
   - Document the taxonomy rationale (why `PWRL X` prefix)

3. **Create root index**
   - Action: Create `docs/index.md` as the bundle root index
   - Include frontmatter with only `okf_version: "0.1"` (the sole place OKF permits frontmatter in an index)
   - Structure per OKF §6: sections grouping subdirectories, bullet list entries with `[Title](path) — description`
   - List subdirectories: `learnings/`, `tasks/`, `analysis/`, `guides/`, `examples/`, `plans/`, `test-plans/`
   - Include descriptions for each subdirectory

## Code Patterns

These documents themselves must be OKF-compliant from the start.

### OKF-TYPES.md Frontmatter Pattern

```yaml
---
type: PWRL Reference
title: OKF Type Taxonomy for PWRL Documents
description: Canonical type values and field mappings for PWRL-generated documents in the Open Knowledge Format.
tags: [okf, standard, metadata]
timestamp: 2026-06-28T00:00:00Z
---
```

### Root index.md Pattern (OKF §6)

```markdown
---
okf_version: "0.1"
---

# PWRL Documentation Bundle

* [Learnings](learnings/) — Patterns, decisions, workflows, and gotchas extracted from development sessions.
* [Tasks](tasks/) — Granular implementation task files sliced from plans.
...
```

## Edge Cases

1. **Root index frontmatter**
   - Scenario: Root `index.md` is the only index that may have frontmatter
   - Handling: Only include `okf_version: "0.1"`; no `type` field on index files
   - Verify: Confirm YAML is parseable and contains only `okf_version`

2. **OKF.md already compliant**
   - Scenario: `docs/OKF.md` already has a `type` field
   - Handling: Leave it untouched; note in taxonomy that OKF.md is self-referential

## Testing

### Verification Steps

1. **Taxonomy completeness**: `docs/OKF-TYPES.md` lists all 7 PWRL document categories with type values
2. **Root index structure**: `docs/index.md` lists all subdirectories with descriptions
3. **OKF §6 compliance**: Root index has no `type` field, only `okf_version` in frontmatter
4. **YAML validity**: Both files have parseable YAML frontmatter

```bash
# Check frontmatter in new files
head -10 docs/OKF-TYPES.md
head -10 docs/index.md

# Verify type values are present and non-empty
grep "^type:" docs/OKF-TYPES.md
grep "^okf_version:" docs/index.md
```

## Acceptance Criteria

- [ ] `docs/OKF-TYPES.md` created with all 7 category-to-type mappings
- [ ] `docs/OKF-TYPES.md` includes field mapping table (PWRL → OKF)
- [ ] `docs/index.md` created with `okf_version: "0.1"` frontmatter
- [ ] `docs/index.md` lists all subdirectories with descriptions per OKF §6
- [ ] Both files have valid YAML frontmatter
- [ ] No existing files modified

## Dependencies

**Depends on:** None — this is the foundation task.

## Related Files

- [`docs/OKF.md`](../../OKF.md): The OKF spec itself — reference for `type` requirements and `index.md` structure
- [`docs/learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md`](../../learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md): Frontmatter field ordering conventions

## Notes

- Type values use `PWRL X` prefix to avoid collisions if non-PWRL documents are added to the same bundle
- The root `index.md` is the only index that may have frontmatter per OKF §6; all subdirectory indexes must not
- This task is the prerequisite for all other OKF migration tasks (U2-U7)
