# Assessment and Update Procedures

Detailed guidance for assessing learning freshness and executing updates during pwrl-refresh-learnings workflow.

---

## Assessment Methodology

### Freshness Assessment Criteria

When analyzing each candidate learning, evaluate across these dimensions:

**Accuracy:**

- Is the core information still correct?
- Do code examples still work with current versions?
- Are API signatures, function names, or patterns still valid?

**Currency:**

- Have newer learnings contradicted or superseded this approach?
- Have tools, frameworks, or dependencies been updated since this was written?
- Are there better solutions available now?

**Completeness:**

- Is important context missing that we now understand?
- Could examples be clearer or more comprehensive?
- Are newer related learnings not cross-referenced?

**Validity:**

- Are external links still accessible?
- Are referenced files, paths, or commands still correct?
- Do error messages match current versions?

### Duplication Detection

**Substantial overlap criteria:**

- Same problem statement or error condition
- Same root cause or solution approach
- More than 50% content similarity
- Same tags or category

**Which doc to keep:**

- Prefer the more recent one (if both are current)
- Prefer the more comprehensive one (better examples, more detail)
- Prefer the one with better cross-references
- Consider which has more incoming links from other docs

### Gap Identification

**Missing prevention tips:**

- Could this learning include "how to avoid this in future"?
- Are there linting rules, tests, or practices that prevent recurrence?

**Missing examples:**

- Would a before/after code comparison help?
- Could error message examples make this more searchable?
- Would a diagram or screenshot clarify the concept?

**Missing cross-references:**

- Are there related learnings that should link here?
- Should this link to newer related learnings?
- Are there complementary patterns worth referencing?

---

## Update Execution Procedures

### For Updates (🟡)

**Goal:** Enhance doc without changing its core purpose.

**Steps:**

1. **Read existing doc completely**
   - Understand original intent and scope
   - Note sections that are still accurate
   - Identify specific gaps or outdated content

2. **Identify updates needed**
   - List specific additions (examples, tips, links)
   - Note outdated content to revise (but preserve original context)
   - Find related learnings to cross-reference

3. **Make targeted edits**
   - Add new content in appropriate sections
   - Update code examples to current syntax/APIs
   - Revise outdated explanations (mark what changed and why if significant)
   - Add cross-references to related learnings
   - Preserve original structure and voice

4. **Update frontmatter**
   - Add `last_updated: [YYYY-MM-DD]` field
   - Update `tags` if new relevant keywords emerged
   - Don't change `date` (original creation date) or `category`

5. **Verify**
   - Read updated doc end-to-end
   - Ensure original intent preserved
   - Check all links are valid
   - Validate YAML frontmatter syntax

**Example:**

Original:

```markdown
## Solution

Use `async/await` to handle promises sequentially.
```

Updated:

```markdown
## Solution

Use `async/await` to handle promises sequentially.

**Update (2026-05-01):** With ES2022, you can also use top-level await
for module initialization, eliminating the need for wrapper async functions
in some cases.
```

---

### For Superseded Docs (🟠)

**Goal:** Mark doc as outdated and point to current approach.

**Steps:**

1. **Add superseded notice at top of doc**

   ```markdown
   > ⚠️ **Superseded:** This learning is superseded by [new-approach-2026-05-01.md](../category/new-approach-2026-05-01.md). See that doc for the current recommended approach.
   ```

2. **Update frontmatter**
   - Add `superseded_by: "path/to/newer/doc.md"` (repo-relative path)
   - Add `last_updated: [YYYY-MM-DD]`
   - Optionally add `archived: true` (if fully obsolete)

3. **Update newer doc (bi-directional link)**
   - In the newer doc, add note: `> **Supersedes:** This approach supersedes [old-approach-2025-11-15.md](../category/old-approach-2025-11-15.md).`

4. **Leave content intact**
   - Don't delete the old doc (preserves history and incoming links)
   - Content remains readable (useful for "what we used to do" context)

5. **Update incoming links** (optional)
   - Search for docs linking to this one
   - Update links to point to newer doc
   - Or add note next to link: "Note: superseded, see [newer doc]"

**Example frontmatter:**

```yaml
---
title: Async State Management with Callbacks
date: 2025-11-15
category: pattern
tags: [async, state, callbacks]
severity: medium
superseded_by: "pattern/async-state-with-promises-2026-05-01.md"
last_updated: 2026-05-01
archived: true
---
```

---

### For Consolidations (🔴)

**Goal:** Merge two or more docs into one comprehensive learning.

**Steps:**

1. **Choose base document**
   - Usually the newer one
   - Or the one with better structure
   - Or the one with more comprehensive content
   - Consider incoming links (keep the more-linked one as base)

2. **Extract unique content from other doc(s)**
   - Identify sections not in base doc
   - Note unique examples, edge cases, or insights
   - Capture unique tags or cross-references

3. **Merge content into base doc**
   - Add unique sections from other doc
   - Combine examples (mark source if helpful: "Alternative approach:")
   - Integrate unique insights inline where relevant
   - Combine all tags (deduplicate)
   - Merge all cross-references

4. **Update base doc frontmatter**
   - Add tags from both docs
   - Update `last_updated` to today
   - Add `consolidated: true` flag
   - Optionally add `consolidated_from: ["path/to/doc1.md", "path/to/doc2.md"]`

5. **Handle merged-in doc(s)**
   - **Option A (preferred):** Move to `docs/learnings/archive/`
     - Add `archived: true` and `archive_reason: "Consolidated into [base-doc.md]"`
     - Add superseded notice at top pointing to consolidated doc
   - **Option B (rare):** Delete if truly duplicate with no unique content
     - Only if there are no incoming links
     - Only if content was 100% duplicative

6. **Update incoming links**
   - Search for docs linking to merged-in doc
   - Update links to point to consolidated doc

7. **Verify consolidated doc**
   - Read end-to-end for coherence
   - Ensure no contradictions between merged sections
   - Check that examples don't conflict
   - Validate all links

**Example consolidated frontmatter:**

```yaml
---
title: Async State Race Conditions - Comprehensive Guide
date: 2026-04-30
category: technical-fix
tags: [async, race-condition, state, locking, promises, concurrent-updates]
severity: high
last_updated: 2026-05-01
consolidated: true
consolidated_from:
  [
    "technical-fix/async-race-simple-2025-12-10.md",
    "technical-fix/concurrent-updates-2026-03-15.md",
  ]
---
```

---

### For Archives (⚫)

**Goal:** Mark doc as no longer relevant but preserve for history.

**Steps:**

1. **Create archive directory** (if doesn't exist)

   ```bash
   mkdir -p docs/learnings/archive
   ```

2. **Move file to archive**

   ```bash
   mv docs/learnings/[category]/[file].md docs/learnings/archive/
   ```

3. **Update frontmatter**
   - Add `archived: true`
   - Add `archive_reason: "[why it's obsolete]"`
     - Examples: "Deprecated technology", "Obsolete approach", "Framework no longer used"
   - Add `last_updated: [YYYY-MM-DD]`

4. **Update incoming links**
   - Search for docs linking to this one
   - Either remove links or add note: "(archived, no longer relevant)"

5. **Leave content intact**
   - Don't modify the learning content itself
   - Preserve as historical record
   - Still searchable if someone looks for old approaches

**Example archived frontmatter:**

```yaml
---
title: Using Bower for Package Management
date: 2024-03-10
category: workflow
tags: [bower, package-management, deprecated]
severity: low
archived: true
archive_reason: "Project migrated to npm; Bower is deprecated"
last_updated: 2026-05-01
---
```

---

## Decision Guidelines

### Update vs Consolidate

**Choose Update when:**

- Doc is fundamentally sound, just incomplete
- A single targeted addition improves it significantly
- Only fresher examples or updated links are needed
- The doc's scope and purpose remain valid

**Choose Consolidate when:**

- Two docs solve the same problem with different approaches
- Substantial content overlap (>50% similar)
- Combined doc would be clearer than two separate ones
- Both contain unique insights worth preserving together
- Users would benefit from seeing approaches side-by-side

**Example scenarios:**

| Situation                                                 | Action      | Rationale                                          |
| --------------------------------------------------------- | ----------- | -------------------------------------------------- |
| Two docs on same race condition, different code examples  | Consolidate | Same problem, examples complement each other       |
| One doc on auth basics, another on advanced auth patterns | Keep both   | Different scopes, both remain useful               |
| Old doc on callbacks, new doc on promises (same use case) | Supersede   | Better approach replaces older one                 |
| Doc missing recent API additions                          | Update      | Core content valid, just needs new examples        |
| Three docs on similar state management bugs               | Consolidate | Likely duplicative, merge into comprehensive guide |
| Doc on testing strategy, needs new framework example      | Update      | Add example without changing core principles       |

---

### Archive vs Delete

**Choose Archive (preferred) when:**

- Content was valid at time of writing
- Preserves history ("what we used to do")
- May have incoming links from other docs
- Someone might search for old approaches
- Technology was commonly used (even if deprecated now)

**Choose Delete (rare) when:**

- True duplicate with zero unique content
- Learning was incorrectly documented (factually wrong)
- Sensitive content that shouldn't be preserved (credentials, PII)
- Content was never useful (test/placeholder doc)

**Archive is the default.** When in doubt, archive instead of deleting.

---

### Batch vs Targeted Updates

**Choose Targeted (preferred) when:**

- Updating 1-3 specific learnings
- Focused scope with clear intent
- Time to carefully review each change
- Changes are nuanced or require judgment

**Choose Batch when:**

- Many docs need identical/similar update
- Update is mechanical (e.g., update dependency version in all examples)
- After framework upgrade affecting many docs
- Pattern change applies uniformly across category

**Batch update safety:**

- Review each change even in batch mode
- Don't blindly apply updates without context
- Stop if you encounter edge cases or exceptions
- Document batch update reason in commit message

---

## Best Practices Summary

**Preserve Intent:**

- Don't change the original learning's core purpose
- When updating, explain why the update is needed
- Respect the author's original framing

**Add, Don't Replace:**

- When information is outdated but still instructive, mark it as outdated rather than deleting
- Example: "Original approach: [X]. Updated approach: [Y]. Why it changed: [Z]."
- Preserves learning journey and decision context

**Link Bidirectionally:**

- When superseding, link both directions (old → new and new → old)
- When consolidating, update all incoming links
- When cross-referencing, ensure both docs link to each other

**Tag Consolidations:**

- Add `consolidated: true` to frontmatter
- Optionally add `consolidated_from: [list of source docs]`
- Helps track merge history

**Be Conservative:**

- When in doubt, ask user before making changes
- Prefer "Update" over "Consolidate" if unclear
- Prefer "Archive" over "Delete" if uncertain
- It's easier to consolidate later than to recover deleted content

**Test Links:**

- After any update, verify all internal links work
- Check that cross-references are still valid
- Ensure moved/archived docs update incoming links

**Document Changes:**

- Use `last_updated` field consistently
- Add inline notes for significant updates
- Commit messages should explain why refresh was done
