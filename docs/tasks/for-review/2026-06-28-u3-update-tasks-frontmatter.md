---
unit-id: U3
plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
status: for-review
created: 2026-06-28
type: PWRL Task
dependencies: [U1]
files:
  - docs/tasks/done/*.md
  - docs/tasks/archived/*.md
  - docs/tasks/INDEX-2026-06-05-plan-slice.md
learnings:
  - docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md
---

# Update Tasks Frontmatter (31 files)

**Goal:** Add `type: PWRL Task` to all ~31 task documents in `docs/tasks/done/` and `docs/tasks/archived/`.

## Context

Task documents already have YAML frontmatter with structured fields (`unit-id`, `plan`, `status`, `created`, `dependencies`, `files`). None currently have a `type` field. They are well-structured and homogeneous, making them ideal for bulk multi-replace.

This task can run in parallel with U2, U4, U5 (all depend only on U1).

## Implementation Steps

### Step 1: Audit current state

```bash
# Count files
ls docs/tasks/done/*.md | wc -l       # ~19
ls docs/tasks/archived/*.md | wc -l   # ~9
ls docs/tasks/INDEX-*.md | wc -l      # 1-2 slice files

# Verify all have frontmatter
for f in docs/tasks/done/*.md; do head -1 "$f" | grep -q "^---$" || echo "MISSING: $f"; done
for f in docs/tasks/archived/*.md; do head -1 "$f" | grep -q "^---$" || echo "MISSING: $f"; done
```

### Step 2: Insert `type: PWRL Task` in done/ tasks (~19 files)

- Action: All done tasks have identical frontmatter structure — insert `type: PWRL Task` after `created` field
- Pattern: Match `created: YYYY-MM-DD\n` and insert `type: PWRL Task\n` after it
- Use single multi-replace call for all 19 files

  **Before:**
  ```yaml
  ---
  unit-id: U1
  plan: docs/plans/...
  status: done
  created: 2026-06-24
  dependencies: []
  files:
    - bin/pwrl.js
  ---
  ```

  **After:**
  ```yaml
  ---
  unit-id: U1
  plan: docs/plans/...
  status: done
  created: 2026-06-24
  type: PWRL Task
  dependencies: []
  files:
    - bin/pwrl.js
  ---
  ```

### Step 3: Insert `type: PWRL Task` in archived/ tasks (~9 files)

- Action: Same pattern as done/, batch separately since archived files may have slightly different structure
- Insert after `created` or after `status` field

### Step 4: Handle index-slice files

- Action: `INDEX-2026-06-05-plan-slice.md` is a meta-document, not a concept. Check if it has frontmatter
- If it does: add `type: PWRL Task Index` (distinguishes from regular task)
- If it doesn't: decide whether to add frontmatter or exclude from OKF compliance

### Step 5: Verify

```bash
# Every done task has type
grep -l "^type: PWRL Task" docs/tasks/done/*.md | wc -l

# Every archived task has type
grep -l "^type: PWRL Task" docs/tasks/archived/*.md | wc -l

# Frontmatter still valid YAML (spot-check 3 files)
head -12 docs/tasks/done/2026-06-24-u1-simplify-init-command.md
head -12 docs/tasks/done/2026-06-21-u5-phase-manifest-schema.md
head -12 docs/tasks/archived/2026-06-05-s1-extract-templates-module.md

# Body unchanged
git diff --stat docs/tasks/done/ docs/tasks/archived/
```

## Edge Cases

1. **Index-slice files not true concepts**
   - Scenario: `INDEX-2026-06-05-plan-slice.md` is an index backup, not a task
   - Handling: Either add `type: PWRL Task Index` or move to `.backups/` directory
   - Default: Add frontmatter with distinct type to keep it OKF-compliant

2. **Different frontmatter structures between done/ and archived/**
   - Scenario: Older archived tasks may have different field ordering
   - Handling: Match on `created:` or `status:` field to find insertion point; test one file first

## Acceptance Criteria

- [ ] All 19+ done task docs have `type: PWRL Task` in frontmatter
- [ ] All 9+ archived task docs have `type: PWRL Task` in frontmatter
- [ ] Existing fields (`unit-id`, `plan`, `status`, `created`, `dependencies`, `files`) preserved
- [ ] Frontmatter remains valid YAML (spot-check 3 files)
- [ ] Body content unchanged
- [ ] Index-slice files handled appropriately

## Dependencies

**Depends on:**
- **U1** ([Define OKF Type Taxonomy & Create Root Index](2026-06-28-u1-okf-type-taxonomy-and-root-index.md))
  - **Reason:** Need `PWRL Task` type value confirmed
  - **Specifically needs:** `docs/OKF-TYPES.md`

## Related Files

- [`docs/tasks/INDEX.md`](../../tasks/INDEX.md): Will be restructured in U6
- U2, U4, U5 can run in parallel

## Notes

- All task files already have frontmatter — no need to add `---` delimiters
- This is the simplest bulk-edit of the migration: homogeneous structure, single insertion point
- Tasks don't use `date` field (they use `created`) — no field rename needed
