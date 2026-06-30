---
unit-id: U7
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: for-review
created: 2026-06-29
dependencies: [U1, U2, U3, U4, U5, U6]
files:
  - /home/wicttor/Projects/pwrl/CHANGELOG.md
  - /home/wicttor/Projects/pwrl/package.json
  - /home/wicttor/.agents/skills/pwrl-work/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-work-prepare/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-work-review/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-review-report/SKILL.md
learnings:
  - docs/learnings/workflow/bulk-metadata-sync-2026-06-13.md
  - docs/learnings/decision/coordinated-versioning-ecosystem-2026-06-13.md
  - docs/learnings/workflow/sample-verification-quality-gate-2026-06-13.md
---

# U7: CHANGELOG Entry and Version Bump

**Goal:** Record the change in `CHANGELOG.md` under `[Unreleased]` and bump the version to `1.7.0-dev.1` across `package.json` and five SKILL.md frontmatters.

## Context

This unit is the final step that consolidates U1–U6 into a single release. Per the precedent set in plan `2026-06-29-001`, the version bump is MINOR (new user-facing behavior; no breaking changes) and the CHANGELOG entry summarizes the change in 4 bullets. The coordinated version bump follows `docs/learnings/decision/coordinated-versioning-ecosystem-2026-06-13.md` and the bulk-metadata-sync workflow from `bulk-metadata-sync-2026-06-13.md`.

## Implementation Steps

1. **Open `/home/wicttor/Projects/pwrl/CHANGELOG.md`** and locate the existing `[Unreleased]` section.

2. **Add a new `### Added` subsection** under `[Unreleased]` with the following four bullets:
   - "**Task Lifecycle Contract across `pwrl-work` and `pwrl-review`.** Each phase owns exactly one transition (`pwrl-work-prepare`: `to-do → in-progress`; `pwrl-work-execute`: `in-progress → for-review`; `pwrl-work-review`: `for-review → in-progress` for rework; `pwrl-review-report`: `for-review → done` for APPROVED). A new Pre-Flight Guard at the top of each phase refuses to proceed if the task file is not in the expected folder. The contract is documented in `pwrl-work/SKILL.md` §'Task Lifecycle Contract' and `pwrl-work/references/workflow-details.md`."
   - "**`pwrl-review-report` now promotes tasks to `done/` on APPROVED verdicts.** New step 8.5 'Promote Approved Tasks' moves the file and updates the frontmatter; on REQUEST CHANGES the file remains in `for-review/`; on REJECTED the file remains in `for-review/`."
   - "**`pwrl-work-review` now reverts tasks to `in-progress/` on REQUEST CHANGES.** New step 8 'Handle Rework Loop' moves the file back and appends a 'Review Findings' section to the task body. On APPROVED the file remains in `for-review/` (waiting for `pwrl-review-report`)."
   - "**New pattern learning:** `docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md` — codifies the per-skill responsibility boundary and the Pre-Flight Guard pattern."

3. **Add a new `### Changed` subsection** under `[Unreleased]` with one bullet:
   - "Version bump: `1.6.0-dev.2` → `1.7.0-dev.1` (MINOR per semver: new user-facing behavior; no breaking changes)."

4. **Open `/home/wicttor/Projects/pwrl/package.json`** and update the `"version"` field from `"1.6.0-dev.2"` to `"1.7.0-dev.1"`.

5. **Update the `version:` field in the following 5 SKILL.md frontmatters** (if present, per the YAML Frontmatter Version Placement Standard):
   - `/home/wicttor/.agents/skills/pwrl-work/SKILL.md`
   - `/home/wicttor/.agents/skills/pwrl-work-prepare/SKILL.md`
   - `/home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md`
   - `/home/wicttor/.agents/skills/pwrl-work-review/SKILL.md`
   - `/home/wicttor/.agents/skills/pwrl-review-report/SKILL.md`

6. **Use the bulk-metadata-sync workflow** (multi-replace) to make all 6 version edits in a single coordinated commit. Do not make this change in 6 separate commits.

## Edge Cases

1. **A SKILL.md does not have a `version:` field**
   - **Scenario:** Some skill files lack the `version:` field in their frontmatter.
   - **Handling:** Per the YAML Frontmatter Version Placement Standard, the field is required in all skill files. If a file lacks it, add it as part of this unit (not in a separate fix).
   - **Test:** Run `grep -L "version:" /home/wicttor/.agents/skills/pwrl-work*/SKILL.md` and verify the 5 affected files all have the field after the edit.

2. **The CHANGELOG has multiple `[Unreleased]` sections**
   - **Scenario:** A previous plan left two `[Unreleased]` sections in the file.
   - **Handling:** Consolidate them before adding the new bullets. Per the existing pattern, only one `[Unreleased]` section is allowed.
   - **Test:** `grep -c "## \[Unreleased\]" /home/wicttor/Projects/pwrl/CHANGELOG.md` should return 1 after the edit.

3. **The `1.6.0-dev.2` is not the current version**
   - **Scenario:** Another plan bumped the version in parallel.
   - **Handling:** This is unlikely (single developer, single plan at a time) but the task should verify the current version before bumping. If the current version is different, bump from whatever the current version is, and document the discrepancy in the CHANGELOG.
   - **Test:** `grep "version" /home/wicttor/Projects/pwrl/package.json` should show `1.6.0-dev.2` before the edit.

## Testing

### Test Scenarios

- **Structural:** `CHANGELOG.md` `[Unreleased]` section contains the four `### Added` bullets and the one `### Changed` bullet.
- **Structural:** `package.json` `"version"` field equals `"1.7.0-dev.1"`.
- **Structural:** All five affected SKILL.md frontmatters show `version: 1.7.0-dev.1` (or have it added if missing).
- **Coordinated:** The version bump is a single commit touching all 6 files (not 6 separate commits).
- **Quality gate:** Use the Sample Verification pattern from `docs/learnings/workflow/sample-verification-quality-gate-2026-06-13.md` to spot-check 3 of the 6 files post-edit.

### Verification Commands

```bash
# Verify CHANGELOG
grep -A 1 "## \[Unreleased\]" /home/wicttor/Projects/pwrl/CHANGELOG.md

# Verify package.json
grep "version" /home/wicttor/Projects/pwrl/package.json

# Verify all 5 SKILL.md frontmatters
for f in /home/wicttor/.agents/skills/pwrl-work/SKILL.md \
         /home/wicttor/.agents/skills/pwrl-work-prepare/SKILL.md \
         /home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md \
         /home/wicttor/.agents/skills/pwrl-work-review/SKILL.md \
         /home/wicttor/.agents/skills/pwrl-review-report/SKILL.md; do
  echo "=== $f ==="
  grep -m 1 "^version:" "$f"
done

# Verify single commit
git log --oneline -1
# Should show "Plan 2026-06-29-003: ..." with all 6+ files changed
```

## Acceptance Criteria

- [ ] `CHANGELOG.md` `[Unreleased]` section contains the four `### Added` bullets and the one `### Changed` bullet
- [ ] `package.json` `"version"` field equals `"1.7.0-dev.1"`
- [ ] All 5 affected SKILL.md frontmatters reflect the new version
- [ ] The version bump is in a single commit (not 6 separate commits)
- [ ] Sample verification: 3 of 6 files spot-checked and confirmed
- [ ] No breaking changes introduced (semver: MINOR bump is correct)

## Dependencies

**Depends on:**

- **U1** ([Canonical Task Lifecycle Contract](2026-06-29-u1-canonical-task-lifecycle-contract.md))
- **U2** ([Add Pre-Flight Guard and Responsibility Boundary to `pwrl-work-prepare`](2026-06-29-u2-preflight-guard-prepare.md))
- **U3** ([Strengthen Transitions in `pwrl-work-execute`](2026-06-29-u3-preflight-guard-execute.md))
- **U4** ([Add Pre-Flight Guard, Responsibility Boundary, and REQUEST CHANGES Revert Logic to `pwrl-work-review`](2026-06-29-u4-preflight-guard-work-review.md))
- **U5** ([Add "Promote Approved Tasks" Step to `pwrl-review-report`](2026-06-29-u5-promote-approved-tasks.md))
- **U6** ([Create New Pattern Learning](2026-06-29-u6-new-pattern-learning.md))

**Reason:** The CHANGELOG entry describes U1–U6; the version bump applies to all five affected skill files. All upstream units must be complete before this unit.

## Related Files

- `/home/wicttor/Projects/pwrl/CHANGELOG.md` — Changelog entry
- `/home/wicttor/Projects/pwrl/package.json` — Version bump
- 5 SKILL.md frontmatters — Version bump (listed above)

## Notes

- This is the last unit to execute. After U7 lands, the lifecycle contract is in effect.
- Consider adding a "Migration Notes" section to the CHANGELOG entry that calls out: "No action required for existing task files. The Pre-Flight Guard will surface any desync between frontmatter status and folder location on the next `/pwrl-work` invocation."
- The commit message should follow the established format from the previous plans (e.g., "Plan 2026-06-29-003: Enforce task lifecycle contract across pwrl-work and pwrl-review (#NNN)").
