---
name: pwrl-learnings
description: Document a recently solved problem or insight while context is fresh
---

# /pwrl-learnings

Capture learnings, problems solved, and insights in a structured format for future reference.

## Purpose

Document solutions, patterns, and insights while context is fresh. Creates structured documentation in `docs/learnings/` with frontmatter for searchability.

**Why document learnings?** The first time you solve a problem takes research. Document it, and the next occurrence takes minutes. Knowledge compounds.

## Usage

```bash
/pwrl-learnings                    # Document the current solution/insight
/pwrl-learnings [brief context]    # Provide additional context hint
```

## Support Files

- `references/schema.yaml` — frontmatter fields and valid categories
- `references/categories.md` — category descriptions and when to use each
- `assets/templates.md` — markdown templates for different learning types

## Workflow

### 1. Extract from Conversation

Review the conversation history to identify:

- What problem was solved or insight gained
- The approach taken and what worked
- What didn't work and why
- Key code examples or patterns

### 2. Classify the Learning

Read `references/schema.yaml` to determine:

- **Learning type**: Which category best fits this learning?
  - `technical-fix` — Bugs, errors, or issues that were debugged and resolved
  - `pattern` — Reusable code patterns or architecture decisions
  - `workflow` — Process improvements, tooling setups, or development practices
  - `gotcha` — Non-obvious behaviors, edge cases, or "things I wish I knew"
  - `concept` — Understanding gained about a technology, framework, or domain
  - `decision` — Why a particular approach was chosen over alternatives

- **Severity/Impact**: How significant is this learning?
  - `high` — Critical knowledge that prevents major issues
  - `medium` — Important but not critical
  - `low` — Nice to know, minor optimization

### 3. Structure the Content

Read `assets/templates.md` and choose the appropriate template based on the learning type.

**For technical fixes** (bugs/errors):

- What was the problem?
- What were the symptoms?
- What didn't work?
- What was the solution?
- Why does it work?
- How to prevent it?

**For patterns/concepts**:

- What is it?
- Why does it matter?
- When to use it?
- Examples showing it in action

**For gotchas/decisions**:

- What's the situation?
- What's non-obvious?
- What should you do instead?
- Why does this matter?

### 4. Generate Metadata

Create YAML frontmatter with:

- `title` — Clear, descriptive title (50 chars or less)
- `date` — Today's date (YYYY-MM-DD)
- `category` — One of the types from step 2
- `tags` — 3-5 searchable keywords
- `severity` — Impact level (high/medium/low)

Read `references/schema.yaml` for validation rules.

### 5. Suggest Filename

Pattern: `[sanitized-slug]-[YYYY-MM-DD].md`

- Lowercase, hyphenated
- Date suffix helps with chronology
- Example: `async-state-race-condition-2026-04-30.md`

### 6. Check for Existing Docs

Search `docs/learnings/` for related content:

- Use grep/search tools to find similar titles, tags, or topics
- If a very similar learning exists, consider updating it instead of creating a new one
- Note any related learnings to cross-reference

### 7. Write the File

- Create directory if needed: `mkdir -p docs/learnings/[category]/`
- Write the complete markdown file
- Validate YAML frontmatter
- Confirm file path with user

### 8. Completion Summary

Provide:

- File path created
- Brief 1-line description
- Suggestion: any related learnings to cross-reference or update

### 9. Consider Refresh (Optional)

After documenting the new learning, evaluate whether related learnings might need updates.

**Run `/pwrl-refresh-learnings` when:**

- ✅ This learning **contradicts or supersedes** an older documented approach
- ✅ You found a **better solution** to a previously documented problem
- ✅ This fix involved a **refactor, migration, or upgrade** that likely affected other docs
- ✅ Step 6 found **similar/overlapping** learnings that might benefit from consolidation
- ✅ The new learning fills a gap that makes an older doc **incomplete or outdated**

**Skip refresh when:**

- ❌ No related learnings were found in step 6
- ❌ Related learnings are still consistent and current
- ❌ This is a completely new topic area
- ❌ The overlap is superficial (different problems, just same general area)

**How to suggest refresh:**

If refresh is warranted, suggest it with a **specific scope** based on what was found:

```
💡 Consider running a targeted refresh:

/pwrl-refresh-learnings [scope]

Reason: [brief explanation of why refresh makes sense]
```

**Scope examples:**

- `/pwrl-refresh-learnings file:old-async-solution-2025-11-15.md` — when one specific doc is superseded
- `/pwrl-refresh-learnings async-patterns` — when multiple related docs might be affected
- `/pwrl-refresh-learnings technical-fix` — after a broad refactor affecting many fixes
- `/pwrl-refresh-learnings authentication` — when the topic area has evolved

**Let the user decide** — suggest with rationale, don't auto-invoke. The user knows whether they have time/context for maintenance now.

## What It Captures

Depending on learning type:

**Technical fixes:**

- Problem symptoms and error messages
- Investigation attempts (what didn't work)
- Root cause analysis
- Working solution with code examples
- Prevention strategies

**Patterns & concepts:**

- Core idea or pattern
- When and why to use it
- Examples and usage
- Tradeoffs or alternatives

**Gotchas & decisions:**

- Non-obvious behavior
- Context and impact
- Recommended approach
- Rationale

## Output Structure

```
docs/learnings/
  technical-fix/
    async-state-race-condition-2026-04-30.md
  pattern/
    service-object-pattern-2026-04-15.md
  workflow/
    local-dev-setup-2026-03-10.md
  gotcha/
    date-timezone-parsing-2026-02-22.md
  concept/
    understanding-closure-scope-2026-01-18.md
  decision/
    why-postgres-over-mysql-2025-12-05.md
```

## Best Practices

- **Capture while fresh**: Document right after solving, while context is loaded
- **Be specific**: Include exact error messages, file paths, code snippets
- **Explain why**: Future you won't have the context you have now
- **Tag liberally**: Use 3-5 tags that you'd actually search for
- **Link related learnings**: Reference other docs that connect
- **Update > duplicate**: If a similar doc exists, enhance it rather than creating a new one
