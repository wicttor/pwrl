---
unit-id: U20
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U8, U9, U10, U11, U12, U13, U14, U15, U16, U17, U18, U19]
files:
  - package.json
  - CHANGELOG.md
---

# Final verification + version bump 1.3.0 → 1.4.0

**Goal:** Confirm all success criteria met, bump version to 1.4.0, update CHANGELOG, and verify a clean clone passes both `npm run validate:skills` and `npm test`.

## Context

This is the plan's finalization unit. It runs only after U8 (regression test green) and all extractions (U9–U19) are done. Version bump is minor (1.3.0 → 1.4.0): standards hardening + new enforcement mechanism — backward compatible.

## Implementation Steps

1. **Run full validation**
   - Action: `npm run validate:skills`
   - Expected: exit 0, 0/30 failures
2. **Run full test suite**
   - Action: `npm test`
   - Expected: exit 0, all suites green (including `tests/pwrl-standards/validate-skills.test.js`)
3. **Bump version**
   - File: `package.json`
   - Change: `"version": "1.3.0"` → `"version": "1.4.0"`
4. **Update CHANGELOG.md**
   - Add `[1.4.0] - 2026-06-21` entry above `[Unreleased]` / `[1.3.0]`
   - Summarize: validator header/H1 regex relaxation; line-count gate 80–300; phase-manifest enforcement for 5 core skills; 11 skill extractions to ≤300 lines; `pwrl-extension/` removal; new `tests/pwrl-standards/` test suite; SCHEMA.md §3 update
5. **Verify version + changelog**
   - `grep '"version"' package.json` → 1.4.0
   - `grep '\[1.4.0\]' CHANGELOG.md` → match
6. **Clean-clone verification** (optional but recommended)
   - `rm -rf node_modules && npm ci && npm run validate:skills && npm test` → all green
7. **Stage and commit** (via `/pwrl-end-session` or direct commit)
   - Include `package.json`, `CHANGELOG.md`, and any residual changes

## Testing

- **Verify:** `npm run validate:skills` exit 0 (0/30)
- **Verify:** `npm test` exit 0
- **Verify:** version 1.4.0 in package.json; `[1.4.0]` in CHANGELOG.md

### Verification Commands

```bash
npm run validate:skills && echo "VALIDATE OK"
npm test && echo "TEST OK"
grep '"version"' package.json
grep '\[1.4.0\]' CHANGELOG.md
```

## Acceptance Criteria

- [ ] `npm run validate:skills` exits 0, 0/30 failures (success criterion #1)
- [ ] `npm test` exits 0, all suites green (success criterion #3)
- [ ] `package.json` version bumped to 1.4.0
- [ ] `CHANGELOG.md` has `[1.4.0]` entry summarizing the changes
- [ ] Clean-clone verification passes (if performed)
- [ ] All changes committed

## Dependencies

**Depends on:** U8 (regression test green) + U9–U19 (all skills within 300 lines). This is the final unit.

## Notes

- Minor version bump (1.3.0 → 1.4.0): backward-compatible standards hardening + new enforcement.
- If any verification fails, do NOT bump — return to the failing unit and fix first.
