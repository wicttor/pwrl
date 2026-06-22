---
unit-id: U4
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: [U2]
files:
  - pwrl-standards/scripts/validate-skills.js
  - pwrl-standards/SCHEMA.md
---

# Relax line-count gate 80–170 → 80–300

**Goal:** Change the validator line-count bounds to 80–300 and update SCHEMA.md §3 to match, so only the 11 skills genuinely over 300 lines need extraction (deferred tightening to a future plan).

## Context

22 skills exceed the current 170-line limit (max 553). Full enforcement = 22 content-extraction tasks. User-confirmed hybrid decision (A4-relaxed-to-300): relax the gate to 80–300 now, extract only the 11 skills still over 300 (U9–U19), and defer incremental tightening (300 → 250 → … → 170) to a future plan. This balances effort vs. discipline and gets the repo green fast.

## Implementation Steps

1. **Update validator line-count bounds**
   - Location: `pwrl-standards/scripts/validate-skills.js` → `validateSkillDir()`
   - Current: `if (lineCount < 80 || lineCount > 170)`
   - New: `if (lineCount < 80 || lineCount > 300)`
2. **Add U2 test assertions** (if not already written in U2)
   - Assert a 250-line fixture passes the line gate
   - Assert a 301-line fixture fails the line gate
   - Assert a 79-line fixture fails (lower bound unchanged)
3. **Update SCHEMA.md §3 Right-Sized**
   - Location: `pwrl-standards/SCHEMA.md` → "### 3. Right-Sized"
   - Change: target 100–150 → 100–250; acceptable 80–170 → 80–300
   - Add a note: "Upper bound relaxed to 300 in v1.1 (2026-06-21) to enable incremental right-sizing; a future plan will tighten toward 170. Skills exceeding 300 must extract content to `references/`."
4. **Run U2 suite → confirm GREEN for line-count tests**
   - Action: `node --test tests/pwrl-standards/validate-skills.test.js`
   - Expected: line-count tests pass
5. **Run full validator → confirm only 11 over-300 skills fail line gate**
   - Action: `npm run validate:skills 2>&1 | grep "Line count" | wc -l`
   - Expected: 11

## Testing

- **U2 line-count tests: GREEN**
- **Validator reports exactly 11 line-count failures** (the extraction targets U9–U19)

### Verification Commands

```bash
node --test tests/pwrl-standards/validate-skills.test.js
npm run validate:skills 2>&1 | grep "Line count" | wc -l   # expect 11
```

## Acceptance Criteria

- [ ] Validator enforces `80 <= lineCount <= 300`
- [ ] SCHEMA.md §3 updated with new bounds + rationale note
- [ ] U2 line-count tests pass (Green)
- [ ] Exactly 11 skills fail the line gate (the U9–U19 targets)

## Dependencies

**Depends on:** U2 (line-count tests define the target)

## Related Files

- [`pwrl-standards/SCHEMA.md`](../../../pwrl-standards/SCHEMA.md) §3 — canonical right-sizing standard

## Notes

- Document the deferral explicitly in SCHEMA.md so future maintainers know 300 is a temporary ceiling, not the goal.
- Do NOT extract skill content here — that's U9–U19.
