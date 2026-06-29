---
unit-id: U6
plan: docs/plans/2026-06-28-001-okf-compliance-migration.md
status: to-do
created: 2026-06-28
type: PWRL Task
dependencies: [U2, U3]
files:
  - docs/learnings/INDEX.md
  - docs/tasks/INDEX.md
learnings:
  - docs/learnings/pattern/non-destructive-index-regeneration-2026-06-21.md
  - docs/learnings/pattern/markdown-blank-line-before-nested-list-2026-06-24.md
---

# Restructure INDEX.md Files to OKF §6

**Goal:** Update `docs/learnings/INDEX.md` and `docs/tasks/INDEX.md` to follow OKF §6 index structure: no frontmatter, heading-grouped bullet lists with descriptions.

## Context

OKF §6 specifies that `index.md` files must NOT contain YAML frontmatter (except the root `docs/index.md` which may have only `okf_version`). They should use heading-grouped bullet lists with `[Title](url) — description` entries.

The current INDEX files have frontmatter-like metadata and a narrative/summary format. This task restructures them to OKF §6 format while preserving all entries. The non-destructive index regeneration pattern (backup before overwrite) applies.

**Important:** This task depends on U2 and U3 being complete because the restructured indexes will source `description` text from each concept's frontmatter.

## Implementation Steps

### Step 1: Backup existing indexes

```bash
cp docs/learnings/INDEX.md docs/learnings/.backups/INDEX-2026-06-28-pre-okf.md
mkdir -p docs/tasks/.backups
cp docs/tasks/INDEX.md docs/tasks/.backups/INDEX-2026-06-28-pre-okf.md
```

### Step 2: Restructure learnings INDEX.md

**Current format:** Narrative with session headers, commit references, key learnings summaries, themes.

**Target OKF §6 format:**

```markdown
# Learnings Index

*Generated: 2026-06-28 | Source plan: [OKF Compliance Migration](../plans/2026-06-28-001-okf-compliance-migration.md)*

## Decisions

* [Branch-Ready Workflow Over Auto-Ship](decision/branch-ready-workflow-over-autoship.md) — Decision to use branch-ready workflow over auto-shipping to main.
* [Code Review Fixes Validation](decision/code-review-fixes-validation-2026-06-10.md) — Validation approach for code review fixes from 2026-06-10.
...

## Patterns

* [End-Session Two-Phase Pipeline](pattern/end-session-two-phase-pipeline-2026-06-16.md) — Two-phase micro-skill pipeline for end-session workflow.
...

## Workflows

* [Bulk Metadata Sync](workflow/bulk-metadata-sync-2026-06-13.md) — Pattern for atomic bulk metadata synchronization across many files.
...

## Gotchas

* [Red Tests as Executable Spec](gotcha/red-tests-as-executable-specification.md) — Red-phase tests serve as executable specifications.
...

## Technical Fixes

* [PWRL Init Incorrect Agent Path](technical-fix/pwrl-init-incorrect-agent-path-2026-06-09.md) — Fix for incorrect agent path in pwrl-init.
...

## Plans

* [PWRL Work Slicing Plan](plan/pwrl-work-slicing-plan-2026-06-05.md) — Plan for slicing pwrl-work into micro-skills.
...

## Wave Summaries

* [Wave 2 Refactoring Learnings](../2026-06-24-wave-2-refactoring-learnings.md) — Summary of learnings from Wave 2 refactoring work.

## Session Log

### 2026-06-24 — Wave 2 Refactoring
* Updated learnings from wave-2-u3-u4-u6 refactoring (commit 334da40)

### 2026-06-24 — End-session formatting fix
* Fixed blank line before nested lists in SKILL files (commit 16f2763)
...
```

**Rules:**
- Group by `category` subdirectory (decision → Decisions, pattern → Patterns, etc.)
- Source description from each concept's `description` frontmatter field; fall back to first sentence of body
- Preserve session log entries at bottom as OKF §7-style log
- No YAML frontmatter anywhere in the file

### Step 3: Restructure tasks INDEX.md

**Current format:** Has frontmatter-like structure with plan references.

**Target OKF §6 format:**

```markdown
# Task Index

*Generated: 2026-06-28 | Source plan: [OKF Compliance Migration](../plans/2026-06-28-001-okf-compliance-migration.md)*

## To Do

* [U1: Define OKF Type Taxonomy & Create Root Index](to-do/2026-06-28-u1-okf-type-taxonomy-and-root-index.md) — Establish standard type values for all PWRL document categories.
* [U2: Update Learnings Frontmatter](to-do/2026-06-28-u2-update-learnings-frontmatter.md) — Add type field to 36 learning concept documents.
...

## Done

* [U1: Simplify Init Command](done/2026-06-24-u1-simplify-init-command.md) — Simplified the pwrl init command.
...

## Archived

* [S1: Extract Templates Module](archived/2026-06-05-s1-extract-templates-module.md) — Extracted templates module from pwrl-plan.
...
```

**Rules:**
- Group by status directory (to-do, done, archived)
- Source description from task frontmatter `## Goal` or frontmatter `description`
- No YAML frontmatter
- Include dependency graph section at bottom (Mermaid or text-based)

### Step 4: Verify

```bash
# No frontmatter in either INDEX.md
head -1 docs/learnings/INDEX.md   # Should NOT be "---"
head -1 docs/tasks/INDEX.md       # Should NOT be "---"

# Both follow OKF §6 structure (heading + bullet with link + description)
grep "^## " docs/learnings/INDEX.md | wc -l   # Should have multiple sections
grep -c "^* \[" docs/learnings/INDEX.md       # Should have many entries

# All links work
# Manual: spot-check 5 random links in each index

# Backups exist
ls -la docs/learnings/.backups/INDEX-2026-06-28-pre-okf.md
ls -la docs/tasks/.backups/INDEX-2026-06-28-pre-okf.md
```

## Edge Cases

1. **Missing description in frontmatter**
   - Scenario: A concept has no `description` field (not all files will have it yet from U2/U3)
   - Handling: Fall back to first sentence of body content
   - Note: Descriptions should be available since U2 and U3 complete before U6

2. **Blank line before nested lists (Markdown formatting)**
   - Scenario: OKF §6 index entries use bullet lists; paragraphs before lists need blank lines
   - Handling: Follow `markdown-blank-line-before-nested-list` pattern — ensure blank line between sections and their first entry
   - Verify: Render in markdown viewer to confirm

3. **Entries without clear description**
   - Scenario: Some task files use minimal template with no description
   - Handling: Derive from filename or unit goal statement in the plan

## Acceptance Criteria

- [ ] `docs/learnings/INDEX.md` follows OKF §6 (sections + bullet lists with descriptions)
- [ ] `docs/tasks/INDEX.md` follows OKF §6 (sections + bullet lists with descriptions)
- [ ] No YAML frontmatter on either subdirectory index file
- [ ] Previous indexes backed up with dated filenames
- [ ] All existing entries preserved with working relative links
- [ ] Descriptions sourced from concept frontmatter where available
- [ ] Session log / update history preserved in prose form

## Dependencies

**Depends on:**
- **U2** ([Update Learnings Frontmatter](2026-06-28-u2-update-learnings-frontmatter.md))
  - **Reason:** Need descriptions from learning frontmatter for the index entries
  - **Specifically needs:** `description` fields in all learning concept frontmatter
- **U3** ([Update Tasks Frontmatter](2026-06-28-u3-update-tasks-frontmatter.md))
  - **Reason:** Need descriptions from task frontmatter for the index entries
  - **Specifically needs:** `description` fields in all task concept frontmatter

## Related Files

- [`docs/learnings/pattern/non-destructive-index-regeneration-2026-06-21.md`](../../learnings/pattern/non-destructive-index-regeneration-2026-06-21.md): Backup-before-overwrite pattern
- [`docs/learnings/pattern/markdown-blank-line-before-nested-list-2026-06-24.md`](../../learnings/pattern/markdown-blank-line-before-nested-list-2026-06-24.md): Markdown formatting for lists

## Notes

- This task must wait for U2 and U3 to complete — the descriptions it sources will be added by those tasks
- The `docs/index.md` root index was already created in U1 with `okf_version` frontmatter — do not modify it here
- OKF §7 (log files) is optional; the session log entries at the bottom of learnings INDEX are prose, not a formal `log.md`
