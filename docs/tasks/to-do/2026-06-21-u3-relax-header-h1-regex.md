---
unit-id: U3
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U2]
files:
  - pwrl-standards/scripts/validate-skills.js
---

# Relax validator header/H1 regexes (GREEN for U2 header tests)

**Goal:** Loosen `hasSection()` and the H1 check in `validate-skills.js` to accept common variants (`## Output: <Name>`, `# pwrl-<slug> — <Desc>`) so ~24 header-related failures clear with zero skill-file edits.

## Context

Root cause of most failures is validator regex over-strictness, not broken skills. 18 skills use `## Output: <Name>` (colon suffix), 10 use `## Input: <Name>`, `pwrl-plan` uses `## Core Workflow: …`, and 20 use H1s like `# pwrl-work-execute — …` or `# PWRL Learnings Orchestrator`. SCHEMA.md's intent ("title matches skill name") is satisfied by both H1 forms. Decision B1 (user-confirmed): relax the validator rather than rewrite 50+ skill headers.

## Implementation Steps

1. **Relax `hasSection()` regex**
   - Location: `pwrl-standards/scripts/validate-skills.js` → `hasSection(markdownText, header)`
   - Current: `new RegExp(\`^##\\s+${escaped}\\s*$\`, 'm')` (exact match only)
   - New: accept exact match OR colon/space suffix: `new RegExp(\`^##\\s+${escaped}([:\\s].*)?$\`, 'm')`
   - This makes `## Output`, `## Output: Foo`, `## Output Artifact` all match `## Output`
2. **Relax the H1 check**
   - Location: `validateSkillDir()` → the `h1.line !== expected` comparison
   - Current: requires exact `# PWRL <TitleCase>`
   - New: accept H1 if it starts with either `# PWRL <TitleCase>` OR `# pwrl-<slug>` (case-insensitive on the slug), allowing any suffix after
   - Implement a helper `h1MatchesSkill(h1Line, skillDirName)` returning boolean; use `expectedH1()` for the strict form and a second regex `^#\\s+pwrl-<slug>\\b` (case-insensitive) for the slug form
3. **Run U2 suite → confirm GREEN for header/H1 tests**
   - Action: `node --test tests/pwrl-standards/validate-skills.test.js`
   - Expected: header + H1 tests pass; line-count + manifest + regression tests still RED (those are U4/U7/U8)
4. **Run full validator → confirm header-only failures cleared**
   - Action: `npm run validate:skills 2>&1 | tail -3`
   - Expected: failure count drops (from 24 toward ~11 line-count-only failures + pwrl-extension)

## Edge Cases

1. **Header with trailing whitespace** — `## Output ` (trailing space)
   - Handling: regex `\\s*$` anchor already tolerates trailing whitespace
2. **H1 with no suffix** — `# PWRL Work Execute` (strict form)
   - Handling: must still pass (backward compatible) — the strict `expectedH1` path remains
3. **H1 with em-dash suffix** — `# pwrl-work-execute — Task Execution Engine`
   - Handling: slug-prefix regex `^#\s+pwrl-work-execute\b` matches regardless of suffix

## Testing

- **U2 header/H1 tests: GREEN** (primary acceptance)
- **No skill-file edits made** (verify `git status` shows only `validate-skills.js` changed)

### Verification Commands

```bash
node --test tests/pwrl-standards/validate-skills.test.js
npm run validate:skills
```

## Acceptance Criteria

- [ ] `hasSection()` accepts colon-suffixed and space-suffixed header variants
- [ ] H1 check accepts both `# pwrl-<slug> …` and `# PWRL <Title> …` (case-insensitive on slug)
- [ ] U2 header/H1 tests pass (Green)
- [ ] No skill files edited in this task (`git status` shows only the validator script)
- [ ] `npm run validate:skills` header-only failures cleared

## Dependencies

**Depends on:** U2 (tests define the target behavior)

## Related Files

- [`pwrl-standards/SCHEMA.md`](../../../pwrl-standards/SCHEMA.md) — §1 Title & Purpose, §2 Usage, §4 Output patterns (intent these satisfy)
- [`tests/pwrl-standards/validate-skills.test.js`](../../../tests/pwrl-standards/validate-skills.test.js) — U2 test suite

## Notes

- Keep backward compatibility: strict-form headers/H1s still pass.
- Do NOT touch line-count or manifest logic here — those are U4 and U7.
