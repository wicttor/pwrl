---
unit-id: U7
plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
status: for-review
created: 2026-06-28
type: PWRL Task
dependencies: [U2, U3, U4, U5, U6]
files:
  - docs/learnings/decision/okf-compliance-migration-2026-06-28.md
  - docs/learnings/INDEX.md
---

# Validate OKF Conformance & Capture Learnings

**Goal:** Run a full conformance check of all ~85 PWRL documents against OKF v0.1; fix any gaps found; document the migration as a new decision learning.

## Context

This is the final quality gate task. All frontmatter updates (U2-U5) and index restructuring (U6) must be complete. This task validates the entire bundle, fixes any remaining issues, and captures the migration experience as a learning for future reference.

## Implementation Steps

### Step 1: Pass 1 — Type Field Check

Verify every non-reserved `.md` file in `docs/` has parseable YAML frontmatter with a non-empty `type` field.

```bash
# Find all non-reserved concept docs (exclude index.md, INDEX.md, .backups/)
find docs -name "*.md" \
  ! -name "index.md" \
  ! -name "INDEX.md" \
  ! -path "*/.backups/*" \
  -print0 | while IFS= read -r -d '' f; do
    type_val=$(sed -n '/^---$/,/^---$/p' "$f" 2>/dev/null | grep "^type:" | head -1)
    if [ -z "$type_val" ]; then
      echo "MISSING TYPE: $f"
    fi
done
```

**Action if failures found:** For each file missing `type`, determine the correct value from U1's taxonomy and add it.

### Step 2: Pass 2 — Index Structure Check

Verify all `index.md` / `INDEX.md` files follow OKF §6:

```bash
# Check no frontmatter on subdirectory indexes
for idx in $(find docs -name "index.md" -o -name "INDEX.md" | grep -v "^docs/index.md$"); do
  if head -1 "$idx" | grep -q "^---$"; then
    echo "HAS FRONTMATTER (should not): $idx"
  fi
done

# Check root index has okf_version
grep "^okf_version:" docs/index.md || echo "MISSING okf_version in root index"

# Check indexes use section headings and bullet lists
for idx in docs/index.md docs/learnings/INDEX.md docs/tasks/INDEX.md; do
  sections=$(grep -c "^## " "$idx" 2>/dev/null || echo 0)
  entries=$(grep -c "^* \[" "$idx" 2>/dev/null || echo 0)
  echo "$idx: $sections sections, $entries entries"
done
```

### Step 3: Pass 3 — Cross-Link Scan

Check internal markdown links for obvious breakage (tolerate not-yet-written links per OKF §5.3):

```bash
# Find all internal links (relative or bundle-absolute)
grep -roh '\[.*\](\(\./[^)]*\|/[^)]*\))' docs/ --include="*.md" | \
  sed 's/.*(\(.*\)).*/\1/' | sort -u | while read link; do
    # Resolve relative to docs/
    target="docs/${link#/}"
    if [ ! -f "$target" ] && [ ! -d "$target" ]; then
      echo "BROKEN LINK: $link (referenced but not found)"
    fi
done
```

**Action:** For newly broken links (caused by this migration), fix them. For pre-existing broken links, leave them (OKF §5.3 tolerates not-yet-written knowledge).

### Step 4: Fix any gaps found

Address each validation failure from Passes 1-3:
- Missing `type`: add correct value from taxonomy
- Index with frontmatter: remove YAML block, convert to prose/heading
- Broken links introduced by migration: fix paths
- YAML parse errors: fix syntax

### Step 5: Create migration learning

Create `docs/learnings/decision/okf-compliance-migration-2026-06-28.md` with:

```yaml
---
title: OKF Compliance Migration for PWRL Documents
description: Batch migration of 85+ PWRL-generated documents to Open Knowledge Format v0.1 compliance, including type taxonomy design, bulk frontmatter updates, and index restructuring.
type: PWRL Learning
category: decision
timestamp: 2026-06-28T00:00:00Z
tags: [okf, migration, metadata, documentation, standards]
severity: medium
status: documented
---

# OKF Compliance Migration for PWRL Documents

## Context
[Why the migration was needed — summary from the plan]

## Decision
[Key decisions made: type taxonomy, field mapping, bulk vs individual, non-destructive index update]

## Implementation
[Summary of the 7-unit migration: what was done, patterns used]

## Results
- 85+ concept documents updated with OKF-compliant frontmatter
- 3 index files restructured to OKF §6
- 0 content changes — metadata enrichment only
- Validated: 100% OKF v0.1 conformance

## Lessons Learned
[What went well, what was challenging, what to do differently next time]

## Related
- Plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
- Taxonomy: docs/OKF-TYPES.md
```

### Step 6: Update learnings INDEX.md

Add the new learning entry to `docs/learnings/INDEX.md` under the Decisions section, following OKF §6 format:

```markdown
* [OKF Compliance Migration](decision/okf-compliance-migration-2026-06-28.md) — Batch migration of 85+ PWRL-generated documents to Open Knowledge Format v0.1 compliance.
```

### Step 7: Final conformance report

Generate a summary:

```markdown
## OKF v0.1 Conformance Report — 2026-06-28

**Plan:** docs/plans/2026-06-28-001-okf-compliance-migration.md
**Bundle:** docs/

### Results

| Check | Pass | Fail |
|-------|------|------|
| Type field present | N | 0 |
| Index OKF §6 structure | 3 | 0 |
| YAML parseable | N | 0 |
| Cross-links valid | N | M (pre-existing, tolerated) |

**Status: ✅ CONFORMANT**
```

## Edge Cases

1. **Pre-existing broken links**
   - Scenario: Links that were broken before this migration
   - Handling: Note but do not fix (OKF §5.3 explicitly tolerates broken links)
   - Note: Only fix links broken by this migration

2. **YAML parse error in frontmatter**
   - Scenario: A frontmatter block has invalid YAML (e.g., unquoted colon in value)
   - Handling: Fix the YAML syntax; common fixes: quote strings with special chars, fix indentation
   - Priority: Fix all parse errors before declaring conformance

## Acceptance Criteria

- [ ] 100% of non-reserved `.md` files in `docs/` have parseable frontmatter with non-empty `type`
- [ ] All 3 `index.md`/`INDEX.md` files follow OKF §6
- [ ] Root `docs/index.md` has `okf_version: "0.1"` frontmatter
- [ ] No YAML parse errors in any frontmatter block
- [ ] Migration learning created at `docs/learnings/decision/okf-compliance-migration-2026-06-28.md`
- [ ] `docs/learnings/INDEX.md` updated with new learning entry
- [ ] Conformance report shows 100% pass (or documents tolerated exceptions)

## Dependencies

**Depends on:**
- **U2** ([Update Learnings Frontmatter](2026-06-28-u2-update-learnings-frontmatter.md))
  - **Reason:** Learnings must have `type` field for validation to pass
- **U3** ([Update Tasks Frontmatter](2026-06-28-u3-update-tasks-frontmatter.md))
  - **Reason:** Tasks must have `type` field for validation to pass
- **U4** ([Update Analysis & Guides Frontmatter](2026-06-28-u4-update-analysis-guides-frontmatter.md))
  - **Reason:** Analysis and guides must have `type` field for validation to pass
- **U5** ([Update Examples, Plans & Test-Plans Frontmatter](2026-06-28-u5-update-examples-plans-testplans-frontmatter.md))
  - **Reason:** Examples, plans, test-plans must have `type` field for validation to pass
- **U6** ([Restructure INDEX.md Files](2026-06-28-u6-restructure-index-files.md))
  - **Reason:** Indexes must follow OKF §6 for validation to pass; descriptions sourced from U2/U3 frontmatter

## Related Files

- [`docs/OKF.md`](../../OKF.md): The conformance specification to validate against
- [`docs/OKF-TYPES.md`](../../OKF-TYPES.md): Type taxonomy (from U1) — reference for expected type values
- [`docs/plans/2026-06-28-001-okf-compliance-migration.md`](../../plans/2026-06-28-001-okf-compliance-migration.md): The source plan

## Notes

- This is the final task — it gates the entire migration
- All previous tasks (U2-U6) must be fully complete before starting validation
- The conformance report should be included in the migration learning document, not as a separate file
