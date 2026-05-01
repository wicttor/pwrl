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

## Usage

```bash
/pwrl-refresh-learnings [scope]        # Review learnings in scope
/pwrl-refresh-learnings                 # Prompt for scope
```

**Scope examples:**

- `authentication` — Review learnings tagged or mentioning authentication
- `technical-fix` — Review all technical fix learnings
- `2026-04` — Review learnings from April 2026
- `async-patterns` — Review learnings about async patterns
- `file:async-race-condition-2026-04-30.md` — Review specific file

## Workflow

### 1. Define Scope

If not provided, ask the user what to review:

- **Specific file** — Review one learning document
- **Category** — Review all learnings in a category (technical-fix, pattern, etc.)
- **Tag/keyword** — Review learnings matching a topic
- **Date range** — Review learnings from a time period
- **All** — Review entire learning collection (use sparingly)

### 2. Find Candidate Learnings

Search `docs/learnings/` based on scope:

```bash
# For category scope
find docs/learnings/[category]/ -name "*.md"

# For tag/keyword scope
grep -r "tags:.*[keyword]" docs/learnings/
grep -r "[keyword]" docs/learnings/  # also search content

# For date range
find docs/learnings/ -name "*-[YYYY-MM]*.md"
```

Limit to relevant files only — typically 3-10 documents. If scope is too broad (>15 files), ask user to narrow it.

### 3. Load and Analyze

For each candidate learning:

**Read the full document** including:

- YAML frontmatter (date, category, tags, severity)
- All content sections
- Code examples
- Related links

**Assess freshness** by checking:

- Is the information still accurate?
- Are code examples current?
- Do newer learnings contradict this?
- Have APIs, tools, or practices changed?
- Are related links still valid?

**Check for duplication**:

- Search for learnings with similar titles, tags, or content
- Identify overlap in problem, solution, or topic
- Note which doc has better/fresher content

**Identify gaps**:

- Missing prevention tips?
- Could use better examples?
- Missing cross-references?
- Related newer learnings not linked?

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

Based on user choice:

**For updates** (🟡):

1. Read the existing doc
2. Identify what needs updating (examples, links, prevention tips)
3. Make targeted edits preserving structure
4. Add `last_updated: [YYYY-MM-DD]` to frontmatter

**For superseded docs** (🟠):

1. Add notice at top: `> ⚠️ This learning is superseded by [link]. See that doc for current approach.`
2. Add `superseded_by: [path]` to frontmatter
3. Add `last_updated: [YYYY-MM-DD]`
4. Optionally add `archived: true` to frontmatter

**For consolidations** (🔴):

1. Identify which doc has better foundation (usually newer)
2. Merge unique content from both docs
3. Combine tags, examples, and cross-references
4. Update frontmatter: add both sets of tags, update date
5. Archive or delete the merged-in doc
6. Update any docs linking to the old one

**For archives** (⚫):

1. Create `docs/learnings/archive/` if needed
2. Move file: `mv docs/learnings/[category]/[file] docs/learnings/archive/`
3. Add `archived: true` and `archive_reason: [reason]` to frontmatter
4. Update any docs linking to it

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
```

## Refresh Triggers

Run this skill when:

- ✅ Recent work contradicts or improves on older learnings
- ✅ Major refactor or migration happened
- ✅ Dependencies were upgraded (breaking changes)
- ✅ You notice duplicative learnings accumulating
- ✅ Quarterly knowledge base maintenance
- ✅ After documenting several learnings in same area

Don't run when:

- ❌ Right after documenting one learning (unless obvious duplicate)
- ❌ No evidence of staleness
- ❌ Collection is small (<10 docs)

## Guidelines

### Update vs Consolidate

**Update** when:

- Doc is fundamentally sound but incomplete
- Just needs fresher examples or links
- Single targeted addition makes it better

**Consolidate** when:

- Two docs solve the same problem differently
- Substantial content overlap (>50%)
- Combined doc would be clearer than two separate ones
- Both docs are referenced and should remain findable (keep the better filename, add redirect note in archived doc)

### Archive vs Delete

**Archive** (preferred):

- Keep file in `docs/learnings/archive/`
- Preserves history and links
- Searchable but marked obsolete
- Can reference in "what we used to do" contexts

**Delete** (rare):

- True duplicate with no unique content
- Incorrectly documented learning
- Sensitive content that should be removed

### Batch vs Targeted

**Targeted** (preferred):

- Update 1-3 specific learnings
- Focused scope and clear intent
- Preserves context and accuracy

**Batch**:

- Only when many docs obviously need same update
- Example: dependency upgrade affects many docs
- Review each change even in batch mode

## Best Practices

- **Preserve intent** — Don't change the original learning's purpose
- **Add, don't replace** — When updating, add new insights alongside old (mark what's superseded)
- **Link forward and back** — When superseding, link both directions
- **Tag consolidations** — Add `consolidated: true` to frontmatter of merged docs
- **Be conservative** — When in doubt, leave it alone or ask user

## Related

Complements [pwrl-learnings](../pwrl-learnings/SKILL.md) — that skill creates learnings, this one maintains them.
