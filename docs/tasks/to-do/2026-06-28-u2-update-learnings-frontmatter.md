---
unit-id: U2
plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
status: to-do
created: 2026-06-28
type: PWRL Task
dependencies: [U1]
files:
  - docs/learnings/decision/branch-ready-workflow-over-autoship.md
  - docs/learnings/decision/code-review-fixes-validation-2026-06-10.md
  - docs/learnings/decision/coordinated-versioning-ecosystem-2026-06-13.md
  - docs/learnings/decision/fallback-architecture-design-2026-06-05.md
  - docs/learnings/decision/hybrid-line-gate-strategy-2026-06-21.md
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
  - docs/learnings/decision/rebrand-phase-labels-to-orchestrator-names-2026-06-16.md
  - docs/learnings/decision/remove-agent-attribution-trailer-2026-06-16.md
  - docs/learnings/decision/remove-agent-infrastructure-2026-06-16.md
  - docs/learnings/decision/schema-design-simple-line-parser.md
  - docs/learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md
  - docs/learnings/pattern/end-session-two-phase-pipeline-2026-06-16.md
  - docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md
  - docs/learnings/pattern/explicit-task-file-movement-critical.md
  - docs/learnings/pattern/markdown-blank-line-before-nested-list-2026-06-24.md
  - docs/learnings/pattern/non-destructive-index-regeneration-2026-06-21.md
  - docs/learnings/pattern/phase-manifest-model-agnostic-enforcement-2026-06-21.md
  - docs/learnings/pattern/planning-tier-architecture-2026-06-05.md
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
  - docs/learnings/pattern/skill-integration-testing-micro-skills-2026-06-10.md
  - docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md
  - docs/learnings/pattern/task-state-management-dual-layer-tracking.md
  - docs/learnings/pattern/tdd-red-phase-test-first-spec.md
  - docs/learnings/pattern/validator-regex-relaxation-root-cause-2026-06-21.md
  - docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md
  - docs/learnings/workflow/code-review-4-phase-pipeline.md
  - docs/learnings/workflow/compact-after-every-unit-2026-06-08.md
  - docs/learnings/workflow/cross-reference-integration-single-source-of-truth.md
  - docs/learnings/workflow/cross-skill-terminology-update-2026-06-19.md
  - docs/learnings/workflow/pwrl-documentation-revised-for-work-agent-orchestration-2026-06-08.md
  - docs/learnings/workflow/sample-verification-quality-gate-2026-06-13.md
  - docs/learnings/gotcha/red-tests-as-executable-specification.md
  - docs/learnings/gotcha/validate-skills-exact-match-header-regex-2026-06-21.md
  - docs/learnings/technical-fix/pwrl-init-incorrect-agent-path-2026-06-09.md
  - docs/learnings/plan/pwrl-work-slicing-plan-2026-06-05.md
  - docs/learnings/2026-06-24-wave-2-refactoring-learnings.md
learnings:
  - docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md
  - docs/learnings/decision/yaml-frontmatter-version-placement-2026-06-13.md
---

# Update Learnings Frontmatter (36 files)

**Goal:** Add `type: PWRL Learning` to all ~36 learning concept documents; map `date` → `timestamp`; ensure all have valid YAML frontmatter per OKF v0.1.

## Context

The `docs/learnings/` directory contains 36 concept documents across subdirectories (decision/, pattern/, workflow/, gotcha/, technical-fix/, plan/) plus a few root-level files. Most (~34) already have YAML frontmatter with fields like `title`, `date`, `category`, `tags`, `severity`. However:
- Only ~12 have the required `type` field
- Field `date` should be renamed to `timestamp` per OKF recommendations
- ~2 files lack frontmatter entirely (`2026-06-24-wave-2-refactoring-learnings.md`, `EXTRACTION-SUMMARY-2026-06-13.md`)
- `docs/learnings/.backups/` is excluded from this migration

This task uses the bulk multi-replace pattern to update the majority in one atomic batch, then handles outliers individually.

## Implementation Steps

### Step 1: Audit current state

1. List all learning files to confirm count (36)
2. Identify which already have `type` (spot-check: `grep -l "^type:" docs/learnings/**/*.md`)
3. Identify which lack frontmatter entirely: `head -1 docs/learnings/2026-06-24-wave-2-refactoring-learnings.md`
4. Categorize files into batch groups:
   - **Group A** (~22): Files with frontmatter + `category` field but no `type` → insert `type: PWRL Learning`
   - **Group B** (~12): Files with frontmatter + already have `type` → add `type` if missing, verify
   - **Group C** (~2): Files without frontmatter → add full YAML frontmatter block

### Step 2: Apply `date` → `timestamp` rename (all files with frontmatter)

- Action: Use multi-replace to rename `date:` to `timestamp:` in all 34 files with frontmatter
- Pattern: Replace `^date:` with `timestamp:` (only in YAML frontmatter block between `---` delimiters)
- This is safe: no body content uses `date:` at line start in these files
- Batch this as a single parallel multi-replace across all files

### Step 3: Insert `type: PWRL Learning` (Group A, ~22 files)

- Action: For files with a `category:` field, insert `type: PWRL Learning` immediately after the `category` line
- Example transformation:

  **Before:**
  ```yaml
  ---
  title: "Branch-Ready Workflow Over Auto-Ship to Main"
  date: 2026-06-12
  category: decision
  severity: high
  tags:
    - workflow-design
  ---
  ```

  **After:**
  ```yaml
  ---
  title: "Branch-Ready Workflow Over Auto-Ship to Main"
  timestamp: 2026-06-12
  category: decision
  type: PWRL Learning
  severity: high
  tags:
    - workflow-design
  ---
  ```
- Use multi-replace: match `category: <value>\n` and append `type: PWRL Learning\n`
- Batch all Group A files in a single multi-replace call

### Step 4: Handle files without `category` field (Group B, ~12 files)

- Action: Insert `type: PWRL Learning` after `title` or after `description` if present
- For files that already have `type` but with wrong value (e.g., `type: decision`), replace with `type: PWRL Learning` and preserve the old value as a custom field or note
- Check each file individually since frontmatter structure varies

### Step 5: Add frontmatter to files lacking it (Group C, ~2 files)

- Action: Read each file, extract title from first `#` heading, derive description from first paragraph
- Prepend YAML frontmatter block:

  ```yaml
  ---
  title: <extracted from # heading>
  description: <extracted from first paragraph>
  type: PWRL Learning
  timestamp: <date from filename or 2026-06-28>
  tags: []
  ---
  ```
- Insert before the existing `#` heading; ensure blank line between `---` and heading

### Step 6: Verify

- Spot-check 5 files across all categories:
  1. A decision file (e.g., `branch-ready-workflow-over-autoship.md`)
  2. A pattern file (e.g., `end-session-two-phase-pipeline-2026-06-16.md`)
  3. A workflow file (e.g., `bulk-metadata-sync-2026-06-13.md`)
  4. A file that previously lacked frontmatter
  5. A gotcha file
- Verify each has: `type: PWRL Learning`, `timestamp` (not `date`), parseable YAML, body unchanged

```bash
# Quick verification commands
grep "^type:" docs/learnings/decision/*.md | wc -l  # Should be 10
grep "^type:" docs/learnings/pattern/*.md | wc -l   # Should be 11
grep "^type:" docs/learnings/workflow/*.md | wc -l  # Should be 6
grep "^timestamp:" docs/learnings/decision/*.md | wc -l  # Should match file count
grep "^date:" docs/learnings/**/*.md 2>/dev/null     # Should be empty (all renamed)
```

## Code Patterns

### Multi-Replace Batch Pattern

Use the pattern from `bulk-metadata-sync` learning:
1. Build array of `{filePath, oldString, newString}` for all files in the batch
2. Execute single multi-replace call
3. Verify 3-5 samples
4. Commit if all pass

### Frontmatter Semantic Grouping

Per `yaml-frontmatter-version-placement` learning, group fields semantically:
```yaml
title          # Identity
description    # Purpose (if present)
category       # Classification (PWRL custom)
type           # OKF required
timestamp      # OKF recommended
tags           # OKF recommended
severity       # PWRL custom (preserved)
domain         # PWRL custom (preserved)
status         # PWRL custom (preserved)
source         # PWRL custom (preserved)
```

## Edge Cases

1. **File already has `type` with different value**
   - Scenario: Some files use `type: decision` or `type: pattern` as a content classification
   - Handling: Rename old `type` to a custom field (e.g., `content_type: decision`), then add `type: PWRL Learning`
   - Verify: Both fields present, YAML valid

2. **Missing title field**
   - Scenario: A file has frontmatter but no `title`
   - Handling: Extract from first `#` heading, add to frontmatter
   - Verify: `title` field present with correct value

3. **YAML special characters in body**
   - Scenario: Body contains `---` which could break frontmatter parsing
   - Handling: Only modify frontmatter block (first `---` to second `---`); never touch body
   - Verify: Body content unchanged via `diff` with git

4. **File with EXTRACTION-SUMMARY in name**
   - Scenario: `EXTRACTION-SUMMARY-2026-06-13.md` may be a meta-document, not a learning concept
   - Handling: Treat as a learning concept; add frontmatter with `type: PWRL Learning`
   - Verify: Same as other Group C files

## Testing

### Pre-Check
```bash
# Count files before
find docs/learnings -name "*.md" ! -path "*/.backups/*" ! -name "INDEX.md" | wc -l

# Check current type presence
grep -r "^type:" docs/learnings/ --include="*.md" | wc -l
```

### Verification Commands
```bash
# Post-migration: every learning doc has type
grep -rl "^type: PWRL Learning" docs/learnings/ --include="*.md" | wc -l

# Post-migration: no 'date:' remains in frontmatter
grep -rl "^date:" docs/learnings/ --include="*.md" 2>/dev/null | wc -l

# Spot-check YAML parseability (sample 1 file)
python3 -c "import yaml; f=open('docs/learnings/decision/branch-ready-workflow-over-autoship.md'); 
lines=[]; in_fm=False; 
for l in f: 
  if l.strip()=='---': 
    if not in_fm: in_fm=True; continue
    else: break
  if in_fm: lines.append(l)
print(yaml.safe_load(''.join(lines)))"
```

## Acceptance Criteria

- [ ] All 36 learning docs have `type: PWRL Learning` in frontmatter
- [ ] `date` field renamed to `timestamp` in all files that had it
- [ ] No `date:` field remains in any learning frontmatter
- [ ] Files that lacked frontmatter now have valid YAML frontmatter with `type`
- [ ] `title`, `tags`, `category`, `severity`, `domain`, `status`, `source` fields preserved
- [ ] Body content unchanged (verified via `git diff` — only frontmatter lines changed)
- [ ] 5 spot-checked files pass manual YAML and content review

## Dependencies

**Depends on:**
- **U1** ([Define OKF Type Taxonomy & Create Root Index](2026-06-28-u1-okf-type-taxonomy-and-root-index.md))
  - **Reason:** Need the `type` value `PWRL Learning` from the taxonomy defined in U1
  - **Specifically needs:** `docs/OKF-TYPES.md` with confirmed type values

## Related Files

- [`docs/OKF-TYPES.md`](../../OKF-TYPES.md): Type taxonomy (created by U1)
- [`docs/learnings/INDEX.md`](../../learnings/INDEX.md): Will be restructured in U6 after this task completes
- [`docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md`](../../learnings/workflow/bulk-metadata-sync-2026-06-13.md): The bulk edit pattern to follow
- [`docs/learnings/.backups/`](../../learnings/.backups/): Excluded from migration

## Notes

- U2, U3, U4, U5 can all run in parallel after U1 completes — they touch different directories
- The `date` → `timestamp` rename is a field name change only; ISO 8601 values are already correct
- Existing `type` values in some files (e.g., `type: decision`) are content classifications, not OKF types — they get preserved under a different field name
