---
unit-id: U4
plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
status: for-review
created: 2026-06-28
type: PWRL Task
dependencies: [U1]
files:
  - docs/analysis/2026-06-05-pwrl-work-structure-analysis.md
  - docs/analysis/2026-06-24-pwrl-review-github-integration-analysis.md
  - docs/analysis/AUDIT-2026-06-24-skills-orphaned-outdated.md
  - docs/analysis/pwrl-review-comprehensive-analysis.md
  - docs/guides/ARCHITECTURE-REFACTORING-GUIDE.md
  - docs/guides/MICRO-SKILL-COMPOSITION-PATTERNS.md
  - docs/guides/SKILL-DOCUMENTATION-UPDATES.md
  - docs/guides/architecture-refactoring.md
  - docs/guides/micro-skill-patterns.md
  - docs/guides/migration-checklist.md
---

# Update Analysis & Guides Frontmatter (10 files)

**Goal:** Add OKF-compliant frontmatter with `type` to all 4 analysis and 6 guide documents. Most currently lack frontmatter entirely.

## Context

Analysis and guide documents are the most "bare" in the PWRL docs — only 2 of 4 analysis docs have frontmatter, and all 6 guide docs start directly with `#` headings. This task requires individual attention: for each file, extract metadata from content and wrap it in a YAML frontmatter block.

## Implementation Steps

### Step 1: Handle analysis docs (4 files)

**Files with existing frontmatter (add `type` only):**
1. `docs/analysis/pwrl-review-comprehensive-analysis.md` — has frontmatter with `title`, `date`, `analysis_type`, `scope`, `focus_areas`
2. `docs/analysis/2026-06-24-pwrl-review-github-integration-analysis.md` — check if it has frontmatter

- Action: Insert `type: PWRL Analysis` into existing frontmatter; rename `date` → `timestamp`

**Files without frontmatter (add full block):**
3. `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md` — starts with `# PWL-Work Structure Analysis`
4. `docs/analysis/AUDIT-2026-06-24-skills-orphaned-outdated.md`

For each, prepend:
```yaml
---
title: <from # heading>
description: <from first paragraph after heading>
type: PWRL Analysis
timestamp: <date from filename or file mtime>
tags: [analysis, pwrl]
---
```

### Step 2: Handle guide docs (6 files)

All 6 guides lack frontmatter. For each, extract metadata and prepend YAML block.

| File | Title (from # heading) |
|------|----------------------|
| `ARCHITECTURE-REFACTORING-GUIDE.md` | Architecture Refactoring Guide: From Agent Routing to Micro-Skill Pipelines |
| `MICRO-SKILL-COMPOSITION-PATTERNS.md` | (read first heading) |
| `SKILL-DOCUMENTATION-UPDATES.md` | (read first heading) |
| `architecture-refactoring.md` | Architecture Refactoring Guide... |
| `micro-skill-patterns.md` | (read first heading) |
| `migration-checklist.md` | (read first heading) |

**Procedure per file:**
1. Read the file
2. Extract `title` from first `#` heading (strip the `#` prefix)
3. Extract `description` from first non-empty paragraph after the heading (sentence or two)
4. Extract `timestamp` from filename date pattern or file modification date
5. Determine relevant `tags` from content keywords (e.g., `architecture`, `refactoring`, `guide`)
6. Prepend frontmatter block with blank line after closing `---`

### Step 3: Verify

```bash
# All analysis docs have type
grep -l "^type: PWRL Analysis" docs/analysis/*.md | wc -l  # Should be 4

# All guide docs have type
grep -l "^type: PWRL Guide" docs/guides/*.md | wc -l       # Should be 6

# Frontmatter is parseable (spot-check)
head -10 docs/analysis/2026-06-05-pwrl-work-structure-analysis.md
head -10 docs/guides/architecture-refactoring.md

# Body content unchanged — headings/paragraphs preserved after ---
git diff docs/analysis/ docs/guides/
```

## Edge Cases

1. **Guides with same title but different filenames**
   - Scenario: `ARCHITECTURE-REFACTORING-GUIDE.md` and `architecture-refactoring.md` may have similar content
   - Handling: Use exact first heading for `title`; let filenames distinguish them
   - Note: This is a pre-existing duplication, not introduced by this migration

2. **Analysis doc with complex YAML frontmatter**
   - Scenario: `pwrl-review-comprehensive-analysis.md` has nested YAML lists (`focus_areas`)
   - Handling: Insert `type: PWRL Analysis` as a simple scalar field; existing nesting preserved
   - Verify: YAML parses correctly after insertion

## Acceptance Criteria

- [ ] All 4 analysis docs have `type: PWRL Analysis` in frontmatter
- [ ] All 6 guide docs have `type: PWRL Guide` in frontmatter
- [ ] `title` extracted from first `#` heading for files that lacked it
- [ ] `description` extracted from first paragraph for files that lacked it
- [ ] `timestamp` set to document date where available
- [ ] All 10 frontmatter blocks are valid YAML, properly delimited by `---`
- [ ] Body content unchanged (original first heading/paragraph still present after `---`)

## Dependencies

**Depends on:**
- **U1** ([Define OKF Type Taxonomy & Create Root Index](2026-06-28-u1-okf-type-taxonomy-and-root-index.md))
  - **Reason:** Need `PWRL Analysis` and `PWRL Guide` type values confirmed

## Notes

- This task requires individual attention per file (10 total) — not a bulk multi-replace
- Run in parallel with U2, U3, U5 after U1 completes
- The two analysis files with existing frontmatter are the easiest; the 8 files without frontmatter need manual metadata extraction
