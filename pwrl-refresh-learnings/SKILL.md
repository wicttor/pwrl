---
name: pwrl-refresh-learnings
description: Review and update existing learnings to keep knowledge current
---

# /pwrl-refresh-learnings

Review existing learnings for staleness, consolidation opportunities, or needed updates.

## Purpose

Keeps your learning collection current by identifying and updating docs that may be:

- **Outdated** — References old approaches, deprecated APIs, or superseded solutions
- **Contradicted** — Conflicts with newer learnings or current practices
- **Duplicative** — Multiple docs covering essentially the same learning
- **Incomplete** — Missing important context discovered since creation

Also keeps `docs/learnings/INDEX.md` accurate so every learning has a short, current description.

## Usage

```bash
/pwrl-refresh-learnings [scope]        # Review learnings in scope
/pwrl-refresh-learnings                 # Prompt for scope
```

**Scope examples:** `authentication`, `technical-fix`, `2026-04`, `async-patterns`, `file:specific-doc.md`

## Support Files

- `references/assessment-criteria.md` — Detailed assessment methodology and update procedures
- `docs/learnings/INDEX.md` — Canonical index to audit and sync

## Workflow

### 1. Define Scope

If not provided, ask the user what to review:

- **Specific file** — Review one learning document
- **Category** — Review all learnings in a category (technical-fix, pattern, etc.)
- **Tag/keyword** — Review learnings matching a topic
- **Date range** — Review learnings from a time period
- **All** — Review entire learning collection (use sparingly)

### 2. Find Candidate Learnings

Search `docs/learnings/` based on scope using find/grep:

- Category: `find docs/learnings/[category]/ -name "*.md"`
- Tag/keyword: `grep -r "tags:.*[keyword]" docs/learnings/`
- Date range: `find docs/learnings/ -name "*-[YYYY-MM]*.md"`

Always load `docs/learnings/INDEX.md` first (or create it if missing) and use it as the starting candidate list when possible.

Limit to relevant files (typically 3-10 documents). If scope too broad (>15 files), ask user to narrow.

### 3. Load and Analyze

For each candidate learning, read the full document and assess:

- **Freshness**: Is information still accurate? Code examples current? APIs/tools changed?
- **Duplication**: Similar titles, tags, or content with other learnings?
- **Gaps**: Missing prevention tips, examples, or cross-references?

**See `references/assessment-criteria.md` for detailed assessment methodology.**

### 4. Categorize Findings

Group learnings into:

**🟢 Current** — No action needed

- Still accurate and relevant
- Code examples work
- Links valid

**🟡 Update** — Needs enhancement

- Generally accurate but could be improved
- Missing recent insights
- Could add better examples
- Should link to newer related learnings

**🟠 Superseded** — Outdated by newer learning

- A newer doc covers this better
- Approach is no longer recommended
- Should reference the newer approach

**🔴 Consolidate** — Merge with similar doc

- Substantial overlap with another learning
- Would be clearer as one doc
- Duplicative content

**⚫ Archive** — No longer relevant

- Deprecated technology
- Obsolete approach
- No longer applicable

### 5. Present Findings

Show user the assessment:

```
📊 Refresh Assessment: [scope]

Found: [N] learnings reviewed

🟢 Current (no action): [N]
  - [filename]: [brief note]

🟡 Update: [N]
  - [filename]: [what needs updating]

🟠 Superseded: [N]
  - [filename]: superseded by [newer doc]

🔴 Consolidate: [N]
  - [file1] + [file2]: [consolidation rationale]

⚫ Archive: [N]
  - [filename]: [why obsolete]
```

### 6. Get User Direction

Ask which actions to take:

- **Update specific docs** — Apply enhancements
- **Consolidate specific pairs** — Merge into one doc
- **Archive specific docs** — Move to archive/
- **Update all yellow/orange** — Batch update mode
- **Review only** — No changes, just the report

### 7. Execute Updates

Based on user choice, execute updates according to category:

- **Updates (🟡)**: Make targeted edits preserving structure; add `last_updated` to frontmatter
- **Superseded (🟠)**: Add superseded notice at top; add `superseded_by` to frontmatter; link bidirectionally
- **Consolidations (🔴)**: Merge unique content into base doc; archive merged-in docs; update incoming links
- **Archives (⚫)**: Move to `docs/learnings/archive/`; add `archived: true` and `archive_reason` to frontmatter

After each content update, sync `docs/learnings/INDEX.md`:

- Update short descriptions to reflect current guidance
- Remove or mark archived/superseded entries appropriately
- Add missing entries for unindexed learning files
- Ensure each active learning has exactly one index row

**See `references/assessment-criteria.md` for detailed update procedures and decision guidelines.**

### 8. Summary

Report what was done:

```
✅ Refresh Complete: [scope]

Updated: [N] docs
  - [filename]: [what changed]

Consolidated: [N] pairs
  - [file1] + [file2] → [result]

Archived: [N] docs
  - [filename]

No action: [N] docs (current)

Index updates:
  - Added: [N]
  - Updated: [N]
  - Archived/Removed: [N]
```

## When to Use

✅ **Run this skill when:**

- Recent work contradicts or improves on older learnings
- Major refactor or migration happened
- Dependencies were upgraded (breaking changes)
- You notice duplicative learnings accumulating
- After documenting several learnings in same area

❌ **Skip when:**

- Right after documenting one learning (unless obvious duplicate)
- No evidence of staleness
- Collection is small (<10 docs)

## Best Practices

- **Preserve intent**: Don't change the original learning's purpose
- **Add, don't replace**: When updating, add new insights alongside old (mark what's superseded)
- **Link bidirectionally**: When superseding, link both directions (old → new and new → old)
- **Be conservative**: When in doubt, ask user before making changes; prefer Archive over Delete
- **Targeted over batch**: Update 1-3 specific learnings at a time; batch only for mechanical updates
- **Test links**: After updates, verify all internal links and cross-references still work
