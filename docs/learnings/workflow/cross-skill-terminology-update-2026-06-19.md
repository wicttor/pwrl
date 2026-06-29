---
title: Cross-Skill Terminology Update Workflow
timestamp: 2026-06-19
category: workflow
type: PWRL Learning
severity: medium
tags:
  - documentation
  - terminology
  - search-and-replace
  - version-bump
  - changelog
  - skill-docs
domain: pwrl-infrastructure
status: documented
source: rename-ask-user-to-ask-user-questions
related:
  - workflow/bulk-metadata-sync-2026-06-13.md
  - workflow/sample-verification-quality-gate-2026-06-13.md
---

# Cross-Skill Terminology Update Workflow

## Context

Renamed the user interaction mechanism reference from `ask_user` tool to `ask_user_question` extension across the PWRL skill ecosystem. The change was triggered by a real platform correction: the interaction method is an _extension_, not a built-in tool, and the docs should reflect accurate naming.

Affected 14 files in a single coordinated change:

- 6 main SKILL.md files (`pwrl-plan`, `pwrl-plan-scope`, `pwrl-plan-research`, `pwrl-plan-design`, `pwrl-plan-generate`, `pwrl-review-scope`)
- 4 references/ files (`edge-cases.md` × 2, `external-research-guidance.md`, `scope-context-protocol.md`, `research-discovery-protocol.md`)
- 1 standards doc (`pwrl-standards/SCHEMA.md`)
- 1 task index (`docs/tasks/INDEX.md`)
- 1 package manifest (`package.json` — version bump)
- 1 changelog (`CHANGELOG.md`)

## Problem

Updating a term across a multi-skill documentation ecosystem is easy to do partially:

- Main SKILL.md files get updated, but `references/` subdirectories get missed
- The canonical standards doc (`pwrl-standards/SCHEMA.md`) is forgotten
- Markdown table cells render broken when text length changes (alignment drift)
- CHANGELOG and version bump are skipped because the change "feels" minor
- Cross-references in task indexes and READMEs drift out of sync

## Solution: Six-Phase Cross-Skill Update

### Phase 1: Discovery (broad grep)

```bash
# Find ALL occurrences across the docs tree
grep -rn "old-term" --include="*.md" .
```

Do **not** restrict to `pwrl-*/SKILL.md` only — references, standards, and indexes must be in scope.

### Phase 2: Categorize Affected Files

Group matches by location:

| Location pattern    | Examples                                                    |
| ------------------- | ----------------------------------------------------------- |
| Main skill files    | `pwrl-*/SKILL.md`                                           |
| Reference files     | `pwrl-*/references/*.md`                                    |
| Standards/canonical | `pwrl-standards/SCHEMA.md`                                  |
| Task & plan indexes | `docs/tasks/INDEX.md`, `docs/plans/INDEX.md`                |
| Root docs           | `README.md`, `INSTALLATION.md`, `QUICKSTART.md`, `GUIDE.md` |

### Phase 3: Apply Replacements

Edit each file individually (or via batch tool). Keep replacements small and contextual — use 2-3 lines of surrounding context to avoid ambiguous matches in skill files that have multiple references to the same term.

### Phase 4: Check Markdown Table Alignment

Term renames often change string length, which breaks pipe-aligned markdown tables. After all edits, run:

```bash
git diff -- '*.md' | grep -E '^\+.*\|' | head
```

If new rows no longer align with the table delimiter row, manually fix spacing in the table.

### Phase 5: Bump Version and Update CHANGELOG

Even "small" terminology changes are user-visible. Follow the standard version-bump workflow:

1. Update `package.json` (`1.2.4` → `1.2.5` in this case)
2. Add a `## [X.Y.Z] - YYYY-MM-DD` entry to `CHANGELOG.md` under `## [Unreleased]`
3. Categorize the change as `### Changed` (term updates are not new features, not fixes)

### Phase 6: Verify with `pwrl-end-session`

The end-session checkpoint naturally catches missing files: it lists all unstaged changes and asks for confirmation, which gives a final review surface for "did I miss anything?"

## Quality Gates Applied

1. **Pre-execution grep** — Listed all 14 affected files before editing
2. **Table alignment check** — Caught and fixed docs/tasks/INDEX.md column drift
3. **End-session checkpoint** — Surfaced 14 modified files for final review
4. **CHANGELOG + version** — Updated in the same commit for atomicity

## Lessons Learned

### ✅ Do

- Cast a wide net with grep: include `references/`, standards, indexes, and root docs
- Use precise context (2-3 lines) in oldText matches to avoid wrong replacements
- Bump version and update CHANGELOG even for "small" terminology changes — they affect user-facing docs
- Run a markdown table alignment check after string-length-changing renames
- Bundle the version bump, CHANGELOG entry, and doc changes in a single commit for atomicity

### ❌ Don't

- Restrict grep to `pwrl-*/SKILL.md` only — references/ and standards/ will be missed
- Skip the version bump because the change "feels" minor — terminology changes affect user trust
- Trust pipe-aligned markdown tables to remain aligned after renames
- Mix terminology changes with unrelated edits in the same commit

## Related Patterns

- **Bulk Metadata Sync** (`workflow/bulk-metadata-sync-2026-06-13.md`) — Covers YAML frontmatter-only changes; this learning extends the pattern to content-term renames
- **Sample Verification** (`workflow/sample-verification-quality-gate-2026-06-13.md`) — Apply after the cross-skill rename to spot-check 3-5 files for correctness
- **Coordinated Versioning** (`decision/coordinated-versioning-ecosystem-2026-06-13.md`) — Versioning rationale that supports the version-bump-on-doc-change rule

## Metrics

- **Files changed:** 14 source + 1 CHANGELOG = 15 files in 1 commit
- **Discovery time:** <1 minute (single grep)
- **Edit time:** ~5 minutes
- **Verification time:** ~2 minutes (table alignment + end-session checkpoint)
- **Total cycle time:** ~8 minutes

---

**Extracted:** 2026-06-19
**Category:** Workflow / Documentation Maintenance
**Applicability:** High — Any cross-skill term rename, deprecation, or naming-convention shift
**Confidence:** Proven in this session
