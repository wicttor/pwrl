---
title: Validator Regex Relaxation as Root-Cause Fix
timestamp: 2026-06-21
category: pattern
type: PWRL Learning
tags: [validate-skills, regex, root-cause, hasSection, relaxation]
severity: medium
priority: high
source: plan 2026-06-21-001 U3; pwrl-standards/scripts/validate-skills.js
---

# Validator Regex Relaxation as Root-Cause Fix

**Pattern:** When many files fail a structural gate because they use a common, valid variant of the expected form, relax the validator's regex to accept the variant rather than rewriting all the files.

## Context

`pwrl-standards/scripts/validate-skills.js` used `hasSection()` with an exact-match regex `^##\s+Output\s*$`. 18 skills legitimately use `## Output: <ArtifactName>` (a more-specific form of the same section). The validator flagged all 18 as "Missing required completion section" — a false failure.

## Anti-Pattern (Avoid)

Rewriting 50+ section headers across 24 skill files to match the strict regex. This is high-effort, high-regression-risk, and throws away the descriptive suffixes that aid readability.

## Pattern (Apply Instead)

Relax the regex in `hasSection()` to accept the section name as a prefix:

```js
// Before (strict — rejects ## Output: Foo)
new RegExp(`^##\\s+${escaped}\\s*$`, 'm')

// After (relaxed — accepts ## Output, ## Output: Foo, ## Output Artifact)
new RegExp(`^##\\s+${escaped}([:\\s].*)?$`, 'm')
```

Same approach for H1: accept `# PWRL <Title>` OR `# pwrl-<slug> — <Desc>` (case-insensitive slug).

## Result

- 18 completion-section failures cleared with zero skill-file edits
- 10 `## Input:` failures cleared
- 20 H1 failures cleared
- SCHEMA.md intent ("title matches skill name") preserved — both forms satisfy it

## When to Apply

- Many files fail a gate using a consistent, valid variant
- The variant is a *more specific* form of the expected header (e.g., `## Output: <Name>` is a specific `## Output`)
- The standard's intent is satisfied by the variant

## When NOT to Apply

- Failures are genuine (missing section entirely) — fix the file, not the validator
- The variant violates the standard's intent (e.g., wrong section, not just a suffix)

## Cross-References

- Underlying gotcha: `gotcha/validate-skills-exact-match-header-regex-2026-06-21.md`
- Related decision: `decision/hybrid-line-gate-strategy-2026-06-21.md` (complementary validator relaxation)
