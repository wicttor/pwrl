---
unit-id: U8
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U1, U3, U4, U7, U9, U10, U11, U12, U13, U14, U15, U16, U17, U18, U19]
files:
  - tests/pwrl-standards/validate-skills.test.js
---

# Regression test: validate:skills exits 0

**Goal:** Add the final acceptance regression test asserting `npm run validate:skills` exits 0 across all 30 skills — so any future drift (dropped phase, removed section, over-300 lines) fails CI (success criterion #3).

## Context

This is the keystone test. It was written as RED in U2 (step 6) and stays RED until every other unit lands. This task finalizes it: spawn the validator as a child process, assert exit 0, and confirm it's included in `npm test`. Once green, the repo has a permanent guard against standards drift.

## Implementation Steps

1. **Finalize the regression test** (extend the U2 suite)
   - Location: `tests/pwrl-standards/validate-skills.test.js`
   - Test: `it('validate:skills exits 0 across all skills', ...)` spawns `node pwrl-standards/scripts/validate-skills.js` via `child_process.spawnSync`, asserts `status === 0`
   - On failure, print stderr/stdout for diagnosis
2. **Confirm the test is discovered by `npm test`**
   - `npm test` uses glob `tests/**/*.test.js` → `tests/pwrl-standards/validate-skills.test.js` is included
3. **Run the full suite → confirm GREEN**
   - Action: `npm test`
   - Expected: all suites pass, including the regression test
4. **Negative-verification (manual)**
   - Temporarily introduce a regression (e.g., remove a `### Phase` heading from a core skill) → run `npm test` → confirm the regression test fails → restore → confirm green

## Testing

- **Primary:** `npm test` exits 0 with the regression test passing
- **Negative:** artificially break a skill → regression test fails → restore → passes

### Verification Commands

```bash
npm test
npm run validate:skills   # exit 0
```

## Acceptance Criteria

- [ ] Regression test spawns validator and asserts exit code 0
- [ ] Test is included in `npm test` (glob covers it)
- [ ] `npm test` exits 0 (all suites green)
- [ ] Negative verification: breaking a skill fails the test; restoring passes it

## Dependencies

**Depends on:** U1, U3, U4, U7, U9–U19 — all units that make `validate:skills` green must land first. This is the final acceptance gate.

## Notes

- This test is the success criterion #3 of the plan. It must stay green forever after.
- If it fails on a future change, that change introduced standards drift and must be fixed before merge.
