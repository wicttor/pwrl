---
unit-id: U3
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: for-review
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

---

## Review Findings (2026-06-22, pwrl-review)

**Scope:** U3 implementation in `pwrl-standards/scripts/validate-skills.js` (diff: +18/-5 lines)
**Reviewer:** MiniMax-M3, single-pass review
**Verdict:** ✅ **APPROVED** (0 critical, 0 major, 2 minor / info)

### Scope Check

- ✅ U3 task files in scope: `pwrl-standards/scripts/validate-skills.js` only — no skill file edits
- ⚠ P3 — `git status` shows additional unrelated deletions (old `2026-06-05-s*` for-review tasks, `2026-06-10-u*` to-do tasks, `INDEX-S1-S11.md`) bundled in the same working tree. These are not skill files and not in U3 scope, but they bloat the diff. Recommend splitting cleanup into a separate commit before merge.

### Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| `hasSection()` accepts colon/space-suffixed header variants | ✅ Pass | `validate-skills.js:71` regex now `^##\s+<hdr>([\s:;].*)?$`; fixture `## Output: Classification Artifact` matches; `## Core Workflow: Four-Phase Pipeline` matches |
| H1 check accepts both `# pwrl-<slug> …` and `# PWRL <Title> …` (case-insensitive) | ✅ Pass | `validate-skills.js:75-83` `h1MatchesSkill()` returns true for both `pwrl-work-execute/SKILL.md` H1 (`# pwrl-work-execute — Task Execution Engine`) and `pwrl-learnings/SKILL.md` H1 (`# PWRL Learnings Orchestrator`) |
| U2 header/H1 tests pass | ✅ Pass | `node --test tests/pwrl-standards/validate-skills.test.js` → 19/19 pass |
| No skill files edited | ✅ Pass | `git diff --name-only` shows no `pwrl-*/SKILL.md` changes; only `validate-skills.js` |
| `npm run validate:skills` header-only failures cleared | ✅ Pass | Validator now reports 14 failures (down from 24+); remaining are line-count (>300) and missing `## Usage`/`## Workflow` sections, not header strictness |

### Findings

#### P2 — Minor

- **`hasSection` regex accepts semicolon suffix (`[\s:;]`)** — `validate-skills.js:71`
  - The U3 task spec only mentioned colon/space suffixes. The implementation also accepts `;` (e.g., `## Output; Foo` would match). Harmless extension, but diverges from spec wording. **Suggestion:** drop `;` from the character class to match the stated spec, or update the task spec to document the broader acceptance. **Lowest-priority fix — acceptable as-is.**

- **H1 matcher is permissive — accepts any suffix after the title prefix** — `validate-skills.js:78-82`
  - The H1 `# PWRL Reviewer Notes` (for skill `pwrl-review`) would currently match because `\b` only requires a word boundary, not a known suffix. This is a pre-existing concern of the relaxation, not a bug per se. **Acceptable per task spec** ("relax to accept common variants"), but worth noting that this weakens the H1 contract to "starts with PWRL <name>" rather than "equals `# PWRL <name> <description>`".

#### P3 — Info

- **U2 test suite does not exercise the production validator** — `tests/pwrl-standards/validate-skills.test.js`
  - The U2 tests compare in-test `target*` (relaxed) vs `strict*` (current) implementations defined inside the test file. They will pass regardless of whether `validate-skills.js` is actually updated. The only test that imports the real validator is the U8 regression placeholder (which only checks the file exists, not its output).
  - **Impact:** U3's implementation correctness is verified only by manual `npm run validate:skills` runs and visual diff review. **Suggestion for U8 (out of U3 scope):** add a test that imports the real `h1MatchesSkill`/`hasSection` and asserts the relaxed behavior on a fixture skill. This is a known gap, already documented in U8's "REGRESSION test" placeholder.

### Integration Check

- ✅ Validator still discovers 30 skills (no `pwrl-extension/`; U1 cleanup is in place)
- ✅ Header regex changes do not affect line-count, manifest, or frontmatter gates
- ✅ All 30 skills' H1s still pass (verified by reading the 30 H1s — all start with `# PWRL …` or `# pwrl-<slug> …`)
- ⚠ Pre-existing test failures in `tests/pwrl-work/skills.test.js` and `tests/lib/` are unrelated to U3 (missing agent files, context-extraction tests). Tracked separately.

### Verdict

**APPROVED** — U3 implementation meets all acceptance criteria. No blocking issues for this unit.

**Post-merge action (out of U3 scope):** Address the cleanup deletions in a separate commit, or move the `2026-06-05-s*` and `2026-06-10-u*` tasks to `docs/tasks/archived/` rather than deleting them. This keeps the U3/U4/U6 PR focused on the standards remediation.
