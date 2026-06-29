---
title: OKF Compliance Bulk-Migration Pattern
date: 2026-06-28
category: pattern
type: PWRL Learning
timestamp: 2026-06-28T23:30:00Z
tags:
  - okf
  - migration
  - frontmatter
  - bulk-edit
  - documentation
  - metadata
severity: medium
domain: documentation
status: documented
source: commit 723702a
---

# OKF Compliance Bulk-Migration Pattern

**Pattern:** Migrate a large collection of markdown documents to OKF v0.1 compliance by defining a type taxonomy, batch-updating frontmatter by document category, restructuring indexes, and validating conformance — all without touching body content.

## Context

The PWRL project needed to migrate ~85 concept documents across 7 categories (learnings, tasks, analysis, guides, examples, plans, test-plans) plus 2 index files to OKF v0.1 compliance. Documents had inconsistent frontmatter: some lacked it entirely, most lacked the required `type` field, and field names didn't align with OKF conventions (e.g., `date` instead of `timestamp`).

## Pattern

### 1. Define Type Taxonomy First

Before touching any documents, establish canonical `type` values for each document category. This is the foundation that all subsequent steps depend on.

- Create a reference document (`OKF-TYPES.md`) mapping categories to type values
- Use descriptive, self-explanatory values as OKF recommends
- Consider namespace prefixes if bundle may contain non-PWRL documents (`PWRL Learning` vs generic `Learning`)

### 2. Batch Frontmatter Updates by Document Category

Group documents by their category/directory and process each group independently:

| Group | Category | Count | Approach |
|-------|----------|-------|----------|
| A | Learnings | 36 | Bulk multi-replace (most have frontmatter) |
| B | Tasks | 31 | Single multi-replace (homogeneous structure) |
| C | Analysis + Guides | 10 | Individual edits (most lack frontmatter) |
| D | Examples + Plans + Test-Plans | 7 | Individual edits (all lack frontmatter) |

**For groups with homogeneous frontmatter** (Group A, B): Use bulk multi-replace pattern — single `edit` call with 20-30 parallel replacements. This is atomic, fast, and verifiable.

**For groups with heterogeneous or missing frontmatter** (Group C, D): Individual edits per file. Extract `title` from first `#` heading, `description` from first paragraph, `timestamp` from filename date or file mtime.

### 3. Field Mapping Convention

Map existing fields to OKF-recommended names:

| PWRL Field | OKF Field | Action |
|------------|-----------|--------|
| `date` | `timestamp` | Rename (ISO 8601 values preserved) |
| `category` | (custom) | Preserve as producer-defined extension |
| `title` | `title` | Keep as-is |
| `tags` | `tags` | Keep as-is |
| `severity` | (custom) | Preserve |
| — | `type` | **Add** (required) |
| — | `description` | **Add** where missing |

### 4. Restructure Indexes to OKF §6

OKF §6 specifies that `index.md` files must NOT have YAML frontmatter (except root-level, which may have only `okf_version`). Indexes use heading-grouped bullet lists:

```markdown
# Section Name

* [Title 1](relative-url-1.md) — Short description of item 1
* [Title 2](relative-url-2.md) — Short description of item 2
```

**Before restructuring:** Back up existing indexes (non-destructive index regeneration pattern).

**Description sourcing:** Pull `description` from each concept's frontmatter (now populated from step 2). Fall back to first sentence of body.

### 5. Validate Conformance

Three-pass validation:
1. **Type check:** Every non-reserved `.md` has parseable frontmatter with non-empty `type`
2. **Index check:** All `index.md` follow §6 structure
3. **Cross-link check:** Internal links resolve (pre-existing broken links tolerated per OKF §5.3)

### 6. Capture Learnings

After validation passes, document the migration as a decision learning. Include: context, decisions made (taxonomy, field mapping, batch strategy), implementation summary, results (pass/fail counts), and lessons learned.

## Dependency Graph

```
U1: Define Taxonomy ──┬── U2: Learnings Frontmatter ──┬── U6: Restructure Indexes ── U7: Validate
                      ├── U3: Tasks Frontmatter ──────╯
                      ├── U4: Analysis/Guides ────────────────────────────────────────┤
                      └── U5: Examples/Plans/Test ─────────────────────────────────────┤
                                                                                       │
                      U2, U3, U4, U5 are parallel (independent directories) ──────────╯
```

## Why

- **No content risk:** Body content is never touched — only frontmatter changes and index restructuring
- **Git-reversible:** Every change is in version control; rollback is a single `git revert`
- **Parallelizable:** Category isolation means 4 of 7 units can execute concurrently
- **Verifiable:** Three-pass validation gives confidence in 100% conformance
- **Self-documenting:** The migration itself produces a learning that captures the pattern

## Application

When migrating any collection of markdown documents to OKF compliance:

1. Audit current state (count files, check frontmatter presence, identify gaps)
2. Define type taxonomy (document categories → type values)
3. Batch updates by category (homogeneous = bulk, heterogeneous = individual)
4. Restructure indexes (backup first, source descriptions from frontmatter)
5. Validate (type check → index check → cross-link check)
6. Capture learnings (document the migration pattern itself)

## Concrete Example

This pattern was applied to the PWRL `docs/` bundle:

```bash
# Before: 0% OKF compliance
grep -rl "^type:" docs/ | wc -l   # ~12 of 85

# After: 100% OKF compliance
# Every non-reserved .md has type field
# All indexes follow OKF §6
# Root index has okf_version: "0.1"
```

## Cross-References

- Plan: `docs/plans/2026-06-28-001-okf-compliance-migration.md`
- Taxonomy: `docs/OKF-TYPES.md` (to be created)
- OKF Spec: `docs/OKF.md`
- Related: `bulk-metadata-sync-2026-06-13.md` (multi-replace batch pattern)
- Related: `non-destructive-index-regeneration-2026-06-21.md` (backup-before-overwrite)

---

**Extracted:** 2026-06-28
**Category:** Pattern / Documentation Migration
**Applicability:** High — Any batch migration of documents to a format specification
**Confidence:** Established in planning; implementation pending
