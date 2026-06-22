---
unit-id: U1
plan: docs/plans/2026-06-21-001-skills-standards-remediation.md
status: to-do
created: 2026-06-21
dependencies: []
files: []
---

# Remove orphaned pwrl-extension/ directory

**Goal:** Delete the empty `pwrl-extension/` directory so the validator no longer reports a missing SKILL.md there (skill count 31 → 30).

## Context

`npm run validate:skills` fails for `pwrl-extension` with "Missing file: pwrl-extension/SKILL.md". The directory exists but is empty (0 files, orphaned). The validator auto-discovers `pwrl-*` dirs, so removing the directory clears the failure automatically — no validator change needed. Decided in plan scope: remove rather than implement.

## Implementation Steps

1. **Verify directory is empty**
   - Action: `ls -la pwrl-extension/`
   - Confirm 0 files (only `.` and `..`)
2. **Remove the directory**
   - Action: `rmdir pwrl-extension`
   - Use `rmdir` (fails if non-empty — safety check); do NOT use `rm -rf`
3. **Confirm validator no longer reports it**
   - Action: `npm run validate:skills 2>&1 | grep pwrl-extension`
   - Expected: no output

## Testing

- **Verify:** `npm run validate:skills` failure count drops by 1 (the missing-file failure gone)
- **Verify:** `ls pwrl-extension/` → "No such file or directory"

## Acceptance Criteria

- [ ] `pwrl-extension/` no longer exists
- [ ] `npm run validate:skills` does not report `pwrl-extension` missing
- [ ] No content lost (directory was empty)

## Dependencies

None. Can start immediately.

## Notes

- Use `rmdir`, not `rm -rf`, as a safety guard against removing a non-empty dir.
