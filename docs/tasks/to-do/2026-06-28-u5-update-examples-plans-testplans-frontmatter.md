---
unit-id: U5
plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
status: to-do
created: 2026-06-28
type: PWRL Task
dependencies: [U1]
files:
  - docs/examples/github-integration-example.md
  - docs/examples/planner-workflow.md
  - docs/examples/pwrl-planner-agent-example.md
  - docs/examples/pwrl-work-agent-example.md
  - docs/examples/work-workflow.md
  - docs/plans/2026-06-24-001-update-docs-and-installation.md
  - docs/test-plans/TEST-REPORT.md
---

# Update Examples, Plans & Test-Plans Frontmatter (7 files)

**Goal:** Add OKF-compliant frontmatter with correct `type` to 5 examples, 1 plan, and 1 test-plan document.

## Context

These 7 documents span 3 different directories and all lack frontmatter (except possibly the existing plan file which may have pwrl-plan-generate frontmatter). They need individual attention to extract titles, descriptions, and dates.

## Implementation Steps

### Step 1: Handle example docs (5 files)

All 5 example docs in `docs/examples/` lack frontmatter. Extract metadata for each:

| File | Expected Title |
|------|---------------|
| `github-integration-example.md` | (from first `#` heading) |
| `planner-workflow.md` | (from first `#` heading) |
| `pwrl-planner-agent-example.md` | (from first `#` heading) |
| `pwrl-work-agent-example.md` | (from first `#` heading) |
| `work-workflow.md` | (from first `#` heading) |

**Procedure per file:**
1. Read the file
2. Extract `title` from first `#` heading
3. Extract `description` from first paragraph
4. Set `timestamp` from file modification date (no date in filename)
5. Add `tags: [example, pwrl]` plus domain-specific tags
6. Prepend YAML frontmatter with `type: PWRL Example`

### Step 2: Handle plan doc (1 file)

`docs/plans/2026-06-24-001-update-docs-and-installation.md` may already have frontmatter from the pwrl-plan-generate pipeline.

- **If it has frontmatter:** Insert `type: PWRL Plan` into existing YAML block; rename `date` → `timestamp` if present
- **If no frontmatter:** Add full block with `type: PWRL Plan`, `title` from heading, `timestamp` from filename date

### Step 3: Handle test-plan doc (1 file)

`docs/test-plans/TEST-REPORT.md` lacks frontmatter.

- Extract `title` from first `#` heading
- Extract `description` from first paragraph
- Set `type: PWRL Test Plan`, `timestamp` from file date
- Add `tags: [testing, test-report]`

### Step 4: Verify

```bash
# All examples have type
grep -l "^type: PWRL Example" docs/examples/*.md | wc -l  # Should be 5

# Plan has type
grep "^type: PWRL Plan" docs/plans/2026-06-24-001-update-docs-and-installation.md

# Test plan has type
grep "^type: PWRL Test Plan" docs/test-plans/TEST-REPORT.md

# YAML parseability spot-check
head -8 docs/examples/planner-workflow.md
head -8 docs/test-plans/TEST-REPORT.md

# Body unchanged
git diff docs/examples/ docs/plans/2026-06-24-001*.md docs/test-plans/
```

## Edge Cases

1. **Existing plan has complex frontmatter**
   - Scenario: The plan file already has `id`, `status`, `tier`, `created`, `updated` from pwrl-plan-generate
   - Handling: Insert `type: PWRL Plan` among existing fields; do not overwrite plan-specific fields
   - Placement: After `tier` field (semantic grouping: identity → tier → type)

2. **Examples with outdated agent references**
   - Scenario: Examples reference "pwrl-planner-agent" which has been removed from PWRL architecture
   - Handling: Do not modify body content. The examples remain as-is (historical artifacts). They still need a `type` for OKF compliance.

## Acceptance Criteria

- [ ] All 5 example docs have `type: PWRL Example` in frontmatter
- [ ] The plan doc has `type: PWRL Plan` in frontmatter
- [ ] The test-plan doc has `type: PWRL Test Plan` in frontmatter
- [ ] All 7 frontmatter blocks are valid YAML with proper `---` delimiters
- [ ] `title` and `description` extracted from content where missing
- [ ] `timestamp` set based on document date or file mtime
- [ ] Body content unchanged

## Dependencies

**Depends on:**
- **U1** ([Define OKF Type Taxonomy & Create Root Index](2026-06-28-u1-okf-type-taxonomy-and-root-index.md))
  - **Reason:** Need `PWRL Example`, `PWRL Plan`, `PWRL Test Plan` type values confirmed

## Notes

- Run in parallel with U2, U3, U4 after U1 completes
- The existing plan file's frontmatter must be carefully merged — do not lose plan-specific fields
