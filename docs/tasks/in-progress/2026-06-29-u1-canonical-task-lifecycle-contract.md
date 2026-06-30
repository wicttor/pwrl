---
unit-id: U1
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: in-progress
created: 2026-06-29
updated: 2026-06-30
dependencies: []
files:
  - /home/wicttor/Projects/pwrl/pwrl-work/SKILL.md
  - /home/wicttor/Projects/pwrl/pwrl-work/references/workflow-details.md
learnings:
  - docs/learnings/pattern/explicit-task-file-movement-critical.md
  - docs/learnings/pattern/task-state-management-dual-layer-tracking.md
  - docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md
  - docs/learnings/gotcha/install-path-vs-repo-path-divergence-2026-06-30.md
---

# U1: Add Canonical Task Lifecycle Contract to `pwrl-work` Orchestrator

**Goal:** Make the task lifecycle state machine visible at the orchestrator level so the agent reads it before any phase-specific skill.

## Context

The contract for the task status state machine (`to-do → in-progress → for-review → done`) is currently documented in three scattered places — `pwrl-work/references/workflow-details.md` (prose), `docs/learnings/pattern/explicit-task-file-movement-critical.md`, and `docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md` — but is not enforced or even prominently mentioned in any `SKILL.md` the agent reads when executing. This is why the agent moved tasks `to-do → done` and skipped `in-progress` in the last session. This unit establishes the contract at the orchestrator level so every downstream skill (U2–U5) can cross-reference a single source of truth.

## Implementation Steps

1. **Open `/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md`** and locate the section between the existing "Phase Summary" and "Quality Criteria" sections.

2. **Insert a new `## Task Lifecycle Contract` section** with the following content:
   - A four-row table mapping transition → owning skill:
     | Transition | Owner |
     |---|---|
     | `to-do → in-progress` | `pwrl-work-prepare` |
     | `in-progress → for-review` | `pwrl-work-execute` |
     | `for-review → in-progress` (REQUEST CHANGES) | `pwrl-work-review` |
     | `for-review → done` (APPROVED) | `pwrl-review-report` |
   - A bold **MUST NOT** rule: "No skill other than the owner listed in the table above may perform the corresponding transition. A skill that owns a transition is the only one allowed to write the new `status` value in the frontmatter AND move the file to the new folder."
   - A reference to `pwrl-work/references/workflow-details.md` for the canonical one-screen table.

3. **Open `/home/wicttor/Projects/pwrl/pwrl-work/references/workflow-details.md`** and locate the existing "Task Status Transitions" prose section.

4. **Replace the prose with a copy-pasteable table** containing: status, folder, owner skill, transition trigger, and a single "Move + update frontmatter" action column. Remove the prose bullets that the table now subsumes.

5. **Do not renumber or remove** any other section in either file.

## Edge Cases

1. **Other skills already link to the old prose section**
   - **Scenario:** A skill or doc links to "Task Status Transitions" by anchor name.
   - **Handling:** Keep the section heading text "Task Status Transitions" in `workflow-details.md` so existing anchors still resolve. Only the content (prose → table) changes.
   - **Test:** `grep -r "Task Status Transitions" /home/wicttor/Projects/pwrl/` shows references still resolve.

2. **The orchestrator gets long**
   - **Scenario:** Adding a new section to `pwrl-work/SKILL.md` pushes it over the line-count standard.
   - **Handling:** The contract is short (one table + one MUST NOT line + one cross-reference); expected +15 lines. If the file still violates the line-count standard, split the table into the reference file and only keep the MUST NOT rule in the orchestrator.
   - **Test:** Count lines in `pwrl-work/SKILL.md` after the edit; should be ≤ 220 lines (current: ~205).

## Testing

### Test Scenarios

- **Structural:** `pwrl-work/SKILL.md` contains a section titled "Task Lifecycle Contract" with all four statuses, four owners, and the MUST NOT rule.
- **Cross-link:** `pwrl-work/references/workflow-details.md` "Task Status Transitions" section is now a table (not prose).
- **Grep:** `grep -l "Task Lifecycle Contract" /home/wicttor/Projects/pwrl/pwrl-work*/SKILL.md` returns at least one match.
- **Regression:** No other section in either file is removed or renumbered.

### Verification Commands

```bash
# Verify contract section exists
grep -A 2 "## Task Lifecycle Contract" /home/wicttor/Projects/pwrl/pwrl-work/SKILL.md

# Verify table is present in reference
grep -c "to-do" /home/wicttor/Projects/pwrl/pwrl-work/references/workflow-details.md
```

## Acceptance Criteria

- [ ] `pwrl-work/SKILL.md` (in the repo, not the install) has a new `## Task Lifecycle Contract` section with the four-row owner table and the MUST NOT rule
- [ ] `pwrl-work/references/workflow-details.md` (in the repo) "Task Status Transitions" is now a table, not prose
- [ ] Both files cross-reference each other
- [ ] No other sections removed or renumbered
- [ ] Line count in `pwrl-work/SKILL.md` stays within the OKF acceptable range (per `pwrl-standards/SCHEMA.md` §Document Structure: 80–300 lines)
- [ ] **Verify with `grep` against the repo path, not the install** — see `docs/learnings/gotcha/verify-against-repo-not-install-2026-06-30.md`

## Dependencies

**Depends on:** None (foundational)

**Reason:** Every other unit (U2–U7) cross-references the contract text this unit establishes.

## Related Files

- `/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md` — Orchestrator where the contract lives
- `/home/wicttor/Projects/pwrl/pwrl-work/references/workflow-details.md` — Canonical table

## Notes

- This is the foundational unit. U2–U5 will fail their pre-flight guard checks if this contract is not in place.
- The wording in the MUST NOT rule is intentionally absolute. Future relaxations should be additive (explicit per-skill allowlist) rather than relaxing the rule.

## Review Findings (2026-06-30)

**Verdict: REJECTED**

**Critical:** The implementation was applied to `/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md` and `/home/wicttor/Projects/pwrl/pwrl-work/references/workflow-details.md` (the user's local install) instead of the repository paths `/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md` and `/home/wicttor/Projects/pwrl/pwrl-work/references/workflow-details.md`. The repo's `pwrl-work/SKILL.md` contains **zero** occurrences of "Task Lifecycle Contract". The work is not in the published package and will be lost on any `npm install`.

**Action required for re-execution:**

1. Update the `files:` frontmatter in this task to point at repo paths (`/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md` and `/home/wicttor/Projects/pwrl/pwrl-work/references/workflow-details.md`).
2. Sync the installed changes back into the repo before re-running the acceptance-criteria verification.
3. Verify the repo's `pwrl-work/SKILL.md` ends with `## Task Lifecycle Contract` containing the four-row ownership table and the `MUST NOT` rule, and that `wc -l pwrl-work/SKILL.md` is within the OKF standard (≤ 300 lines).
