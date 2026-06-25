---
title: Blank Line Before Nested Markdown Lists for Proper Rendering
date: 2026-06-24
category: pattern
tags: [markdown, documentation, formatting, pwrl-end-session, style]
severity: low
priority: low
source: commit 16f2763
---

# Blank Line Before Nested Markdown Lists for Proper Rendering

**Pattern:** In Markdown, always add a blank line before a nested list that immediately follows a paragraph to ensure correct rendering across parsers.

## Context

Two `SKILL.md` files (`pwrl-end-session-checkpoint` and `pwrl-end-session-commit`) had nested list items that immediately followed a paragraph without an intervening blank line. While some Markdown renderers handle this gracefully, others (including the parser used for pwrl skill display) may merge the list into the preceding paragraph, breaking the visual structure.

## Pattern

1. After any paragraph that introduces a list, include a blank line before the first list item
2. This applies to both top-level and nested lists
3. Common offenders: "The detailed workflow document contains:" followed by a bullet list

## Concrete Example

**Before (incorrect):**

```markdown
The detailed workflow document contains:
- Working tree detection and file categorization
- Change summary and confirmation flow
```

**After (correct):**

```markdown
The detailed workflow document contains:

- Working tree detection and file categorization
- Change summary and confirmation flow
```

## Why

- Some Markdown parsers treat text followed directly by a list as a single paragraph block
- A blank line signals to the parser that the list is a separate block element
- Ensures consistent rendering across GitHub, VS Code, and other Markdown renderers
- Follows CommonMark specification (blank line separates block-level elements)

## Application

When writing Markdown documentation:

1. Always add a blank line between a paragraph and any following list
2. Use this pattern consistently across all SKILL.md files and documentation
3. Review existing docs for similar formatting issues during edits

## Source

Commit `16f2763` fixed two instances in `pwrl-end-session-checkpoint/SKILL.md` and `pwrl-end-session-commit/SKILL.md` (+1 line each).
