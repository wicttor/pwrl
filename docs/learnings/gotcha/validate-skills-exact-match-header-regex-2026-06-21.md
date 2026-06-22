---
title: validate-skills.js Exact-Match Header Regex Gotcha
date: 2026-06-21
category: gotcha
tags: [validate-skills, hasSection, regex, exact-match, gotcha]
severity: medium
priority: high
source: pwrl-standards/scripts/validate-skills.js; pwrl-phase-checkpoint fix
---

# validate-skills.js Exact-Match Header Regex Gotcha

**Gotcha:** `pwrl-standards/scripts/validate-skills.js` uses an **exact-match** regex for required sections. A header like `## Quality Gates by Workflow` does **NOT** satisfy the `## Quality Criteria` gate, and `## Output: Foo` does **NOT** satisfy `## Output`. The header text must match exactly, or the validator reports a false "Missing required section" failure.

## Symptom

`npm run validate:skills` reports:

```
- pwrl-phase-checkpoint/SKILL.md
  - Missing required completion section: "## Output" or "## Acceptance Criteria" or "## Quality Criteria"
```

even though the skill clearly has a `## Quality Gates by Workflow` section and a `## Standards Compliance` section.

## Root Cause

```js
// hasSection() uses an exact-match regex:
const headerRegex = new RegExp(`^##\\s+${header.replace(...)}\\s*$`, 'm');
```

`^##\s+Output\s*$` matches only a line that is *exactly* `## Output` (plus trailing whitespace). It does **not** match:
- `## Output: Foo` (colon suffix)
- `## Output Artifact` (space suffix)
- `## Quality Gates by Workflow` (different words entirely)

## Fix

Either:

1. **Relax the regex** (preferred — see `pattern/validator-regex-relaxation-root-cause-2026-06-21.md`):
   ```js
   new RegExp(`^##\\s+${escaped}([:\\s].*)?$`, 'm')
   ```
2. **Rename the header** to an exact match (e.g., `## Output` instead of `## Output: Foo`)

## Discovery

Hit while fixing `pwrl-phase-checkpoint/SKILL.md` this session: it had `## Quality Gates by Workflow` and `## Standards Compliance` but no exact `## Output`/`## Acceptance Criteria`/`## Quality Criteria`. Adding a `## Output` section and relaxing the regex both contributed to the fix.

## Lesson

When a validator reports "missing section" but the section clearly exists, check whether the validator uses exact-match or prefix-match regex. A colon or space suffix on a header is a common, valid convention that strict regexes reject.

## Cross-References

- Fix pattern: `pattern/validator-regex-relaxation-root-cause-2026-06-21.md`
- Validator source: `pwrl-standards/scripts/validate-skills.js` `hasSection()`
