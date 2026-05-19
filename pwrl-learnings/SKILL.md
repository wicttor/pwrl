---
name: pwrl-learnings
description: Document a recently solved problem or insight while context is fresh
---

# /pwrl-learnings

Capture learnings, problems solved, and insights in a structured format for future reference.

## Purpose

Document solutions, patterns, and insights while context is fresh. Creates structured documentation in `docs/learnings/` with frontmatter for searchability and keeps `docs/learnings/INDEX.md` updated.

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
- `docs/learnings/INDEX.md` — canonical index of all learnings with short descriptions

## Workflow

### 1. Extract from Conversation

Review the conversation history to identify:

- What problem was solved or insight gained
- The approach taken and what worked
- What didn't work and why
- Key code examples or patterns

### 2. Classify the Learning

Read `references/schema.yaml` and `references/categories.md` to determine:

- **Learning type**: Which category fits this learning? (technical-fix, pattern, workflow, gotcha, concept, decision)
- **Severity/Impact**: How significant is this learning? (high, medium, low)

### 3. Structure the Content

Read `assets/templates.md` and choose the appropriate template based on the learning type.

- Template structure varies by category (technical-fix, pattern, workflow, etc.)
- Follow template sections for chosen category
- Include code examples and concrete details

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

### 7. Update Learnings Index

Update `docs/learnings/INDEX.md` as part of the same workflow.

- If index does not exist, create it using the standard table format
- Add one row for the learning with: date, category, title, path, and short description
- **Short description requirement**: 1 sentence, concrete, and searchable (target 80-140 chars)
- If learning already exists in index, update the existing row instead of duplicating
- Keep entries sorted newest-first by date

### 8. Write the File

- Create directory if needed: `mkdir -p docs/learnings/[category]/`
- Write the complete markdown file
- Validate YAML frontmatter
- Confirm file path with user

### 9. Completion Summary

Provide:

- File path created
- Brief 1-line description
- Index row added/updated in `docs/learnings/INDEX.md`
- Suggestion: any related learnings to cross-reference or update

### 10. Consider Refresh (Optional)

After documenting the new learning, evaluate whether related learnings might need updates.

**Suggest `/pwrl-refresh-learnings [scope]` when:**

- This learning contradicts or supersedes an older documented approach
- A better solution was found for a previously documented problem
- Similar/overlapping learnings were found in step 6 that could benefit from consolidation
- This fills a gap that makes an older doc incomplete or outdated

**Skip refresh when:** No related learnings found, or existing docs are still current and consistent.

**How to suggest:** Provide specific scope based on findings (e.g., file:specific-doc.md, topic-name, or category). Let user decide whether to run refresh now.

## Output

Creates categorized learning document in `docs/learnings/[category]/[slug]-[date].md` with:

- YAML frontmatter (title, date, category, tags, severity)
- Structured content following category template
- Code examples and concrete details
- Cross-references to related learnings

Also updates `docs/learnings/INDEX.md` so every learning has a short description entry.

**Directory structure example:**

- `docs/learnings/technical-fix/` — Bug fixes and error resolutions
- `docs/learnings/pattern/` — Reusable patterns and architecture
- `docs/learnings/workflow/` — Process improvements and tooling
- `docs/learnings/gotcha/` — Non-obvious behaviors and edge cases
- `docs/learnings/concept/` — Technology and framework understanding
- `docs/learnings/decision/` — Why specific approaches were chosen

## Best Practices

- **Capture while fresh**: Document right after solving, while context is loaded
- **Be specific**: Include exact error messages, file paths, code snippets
- **Explain why**: Future you won't have the context you have now
- **Tag liberally**: Use 3-5 tags that you'd actually search for
- **Link related learnings**: Reference other docs that connect
- **Update > duplicate**: If a similar doc exists, enhance it rather than creating a new one
