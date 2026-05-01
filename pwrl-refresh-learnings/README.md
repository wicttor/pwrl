# pwrl-refresh-learnings

Keep your learning collection current through targeted reviews and updates.

## Purpose

Identifies and fixes:

- 📅 **Outdated content** — old approaches, deprecated APIs
- ⚠️ **Contradictions** — conflicts with newer learnings
- 📋 **Duplicates** — multiple docs covering same topic
- 🔍 **Gaps** — missing context or examples

## Quick Start

```bash
# Review specific area
/pwrl-refresh-learnings authentication

# Review category
/pwrl-refresh-learnings technical-fix

# Review recent docs
/pwrl-refresh-learnings 2026-04

# Review specific file
/pwrl-refresh-learnings file:async-race-condition-2026-04-30.md
```

## Workflow

1. **Define scope** — What area to review?
2. **Find candidates** — Search learnings in scope
3. **Analyze freshness** — Check accuracy, duplication, gaps
4. **Categorize** — Current / Update / Superseded / Consolidate / Archive
5. **Present findings** — Show assessment to user
6. **Get direction** — User chooses which actions to take
7. **Execute** — Update, consolidate, or archive as directed
8. **Summary** — Report changes made

## Assessment Categories

| Status         | Meaning               | Action                    |
| -------------- | --------------------- | ------------------------- |
| 🟢 Current     | Still accurate        | No action                 |
| 🟡 Update      | Needs enhancement     | Add examples, links, tips |
| 🟠 Superseded  | Outdated by newer doc | Add superseded notice     |
| 🔴 Consolidate | Duplicative           | Merge into one doc        |
| ⚫ Archive     | No longer relevant    | Move to archive/          |

## When to Use

✅ **Good times to refresh:**

- **Suggested by pwrl-learnings** — after documenting a learning that supersedes or contradicts older ones
- After major refactor or migration
- When you notice duplicates
- After documenting several learnings in same area
- Quarterly maintenance
- Dependency upgrades

❌ **Skip when:**

- Collection is small (<10 docs)
- No evidence of staleness
- No related learnings found

## Example Session

```
You: /pwrl-refresh-learnings async-patterns

Agent: Searching docs/learnings/ for async-related learnings...

📊 Refresh Assessment: async-patterns

Found: 5 learnings reviewed

🟢 Current (no action): 2
  - promise-chaining-2025-11-15.md
  - async-await-errors-2026-01-10.md

🟡 Update: 2
  - async-race-condition-2026-04-30.md: could add AbortController example
  - parallel-async-calls-2025-12-03.md: missing link to newer Promise.all pattern

🔴 Consolidate: 1
  - callback-hell-2025-10-20.md + promise-migration-2025-11-15.md:
    both cover callback→promise migration, merge into one doc

What would you like to do?
1. Update the 2 yellow docs
2. Consolidate the red pair
3. Both updates and consolidation
4. Review only (no changes)

You: 3

Agent: [Executes updates and consolidation]

✅ Refresh Complete: async-patterns

Updated: 2 docs
  - async-race-condition-2026-04-30.md: added AbortController example
  - parallel-async-calls-2025-12-03.md: linked to Promise.all pattern

Consolidated: 1 pair
  - callback-hell + promise-migration → promise-migration-2025-11-15.md
  - callback-hell-2025-10-20.md moved to archive/

No action: 2 docs (current)
```

## Tips

- **Start narrow** — Review specific topics, not entire collection
- **Consolidate carefully** — Only merge when truly duplicative
- **Preserve history** — Archive rather than delete
- **Link bidirectionally** — Connect superseded docs to replacements
- **Review batches** — Even in batch mode, verify each change

## Complements

Works with:

- [pwrl-learnings](../pwrl-learnings/SKILL.md) — Creates learnings and suggests refresh when appropriate

**Typical flow:**

1. Use `/pwrl-learnings` to document a new learning
2. If it supersedes or relates to older docs, you'll get a suggestion like:
   ```
   💡 Consider running: /pwrl-refresh-learnings async-patterns
   ```
3. Run the suggested refresh to update related learnings

## File Structure

```
pwrl-refresh-learnings/
  SKILL.md      # Main workflow
  README.md     # This file
```

Simple, focused, effective.
