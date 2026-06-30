---
unit-id: U5
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: to-do
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-review-report/SKILL.md
learnings:
  - docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md
  - docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md
---

# U5: Add "Promote Approved Tasks" Step to `pwrl-review-report`

**Goal:** Make `pwrl-review-report` the only skill that performs the `for-review → done` transition, and implement that transition for the `APPROVED` verdict.

## Context

The `explicit-review-verdict-flow-2026-06-16.md` pattern learning documents that an APPROVED verdict should move the file from `for-review/` to `done/` and update the frontmatter, but `pwrl-review-report` currently emits a report artifact and stops. This is the root cause of the last session's failure: the `done` transition was documented in a pattern learning but never implemented in any skill, so the agent fell back to the (wrong) behavior of moving the file directly. This unit implements the missing step and adds the Pre-Flight Guard and Responsibility Boundary that makes this skill the only writer to `done/`.

## Implementation Steps

1. **Open `/home/wicttor/.agents/skills/pwrl-review-report/SKILL.md`** and locate the section after the "Interaction Method" block.

2. **Insert a new `## Pre-Flight Guard` section** that states:
   - "Assert that there is at least one task file in `docs/tasks/for-review/` associated with the review scope (matched by `unit-id` or branch name)."
   - "If no matching file is found, log: 'No task files found in for-review/. Lifecycle contract violation: review without a corresponding task file.' and ask the user how to proceed (continue without promotion, cancel, or attach a different task file)."
   - "Cross-reference: see `pwrl-work/SKILL.md §"Task Lifecycle Contract"`."

3. **Insert a new `## Responsibility Boundary` section** with:
   - Bold heading: "**This skill OWNS the `for-review → done` transition (APPROVED verdict)**"
   - Bold heading: "**This skill MUST NOT promote tasks on REQUEST CHANGES or REJECTED verdicts. Those are handled by `pwrl-work-review` (rework) or left in `for-review/` (rejected).**"

4. **Add a new Step 8.5 "Promote Approved Tasks"** between Step 8 "Generate Report Artifact" and the existing "Error Handling & Testing" section. The step must:
   - Read the verdict from the report artifact produced in Step 8
   - If `verdict: approved`:
     - For each task file in `for-review/` associated with this review (matched by `unit-id` from the analyze artifact or by file content search):
       - **CRITICAL: Move task file** `for-review/` → `done/`
       - Update frontmatter: `status: for-review` → `status: done`
       - Update frontmatter: add `verdict: approved` and `approvedAt: <ISO timestamp>` fields
       - Update `docs/tasks/INDEX.md` to reflect the new location and status
       - Log: "Task promoted to done: docs/tasks/for-review/[file] → docs/tasks/done/[file]"
       - Call `pwrl-work-sync-status` with the new `done` status (when GitHub integration is enabled)
   - If `verdict: request-changes`: do nothing (the file remains in `for-review/`; the next `pwrl-work` loop will move it to `in-progress/` per U4)
   - If `verdict: rejected`: do nothing (file remains in `for-review/` per the existing pattern)

5. **Update Step 8 "Generate Report Artifact"** to add a new output field `tasksPromoted: [list of unit-ids that were moved to done/]` so the orchestrator can confirm what was done.

6. **Do not modify** the existing steps 1–7 (verify artifact, generate sections, calculate score, determine verdict, generate rationale, display report, request user approval).

## Edge Cases

1. **Multiple tasks in the same review**
   - **Scenario:** The review covers 3 tasks (U1, U2, U3); all three are approved.
   - **Handling:** Step 8.5 iterates over all matching task files and moves each one. The `tasksPromoted` list contains all three unit-ids.
   - **Test:** Manual smoke test with a multi-task review.

2. **GitHub integration is disabled**
   - **Scenario:** `.pwrlrc.json` has `integrations.githubIssues: false`.
   - **Handling:** The `pwrl-work-sync-status` call is skipped per the existing utility's behavior. The local file move and frontmatter update still happen.
   - **Test:** Verify Step 8.5 still completes the file move even when GitHub sync is disabled.

3. **Task file is missing or unreadable**
   - **Scenario:** The review scope matches a `unit-id` but the corresponding file in `for-review/` is missing.
   - **Handling:** Log a warning and skip the missing file. Continue with the remaining files. At the end, if no files were promoted, ask the user how to proceed.
   - **Test:** Manual smoke test with a phantom unit-id in the review scope.

4. **The verdict is `approved` but the user later realizes they want changes**
   - **Scenario:** User approves the review, then realizes they want to request changes after the fact.
   - **Handling:** Per the contract, once a task is in `done/`, the next rework loop requires manually moving it back to `in-progress/` and adding a "Reopened" note. The skill should not silently undo the promotion.
   - **Test:** Document the manual recovery procedure in the Responsibility Boundary section.

## Testing

### Test Scenarios

- **Structural:** Section "Pre-Flight Guard" is found.
- **Structural:** Section "Responsibility Boundary" is found with both sub-headings.
- **Structural:** Step 8.5 contains the "CRITICAL: Move task file" block (verbatim from U3 Inline pattern).
- **Structural:** The output YAML now includes `tasksPromoted: [list]`.
- **Behavioral:** When the verdict is `approved`, the matching task files are moved to `done/`.
- **Behavioral:** When the verdict is `request-changes` or `rejected`, the files remain in `for-review/`.
- **Behavioral:** `pwrl-work-sync-status` is called for the `done` transition (when GitHub integration is enabled).

### Verification Commands

```bash
# Verify Pre-Flight Guard section
grep -A 1 "## Pre-Flight Guard" /home/wicttor/.agents/skills/pwrl-review-report/SKILL.md

# Verify Step 8.5 exists
grep -A 1 "Promote Approved Tasks" /home/wicttor/.agents/skills/pwrl-review-report/SKILL.md

# Verify the output YAML has the new field
grep "tasksPromoted" /home/wicttor/.agents/skills/pwrl-review-report/SKILL.md
```

## Acceptance Criteria

- [ ] `pwrl-review-report/SKILL.md` has a new `## Pre-Flight Guard` section
- [ ] `pwrl-review-report/SKILL.md` has a new `## Responsibility Boundary` section
- [ ] Step 8.5 "Promote Approved Tasks" contains the "CRITICAL: Move task file" block
- [ ] The output YAML includes `tasksPromoted: [list]`
- [ ] On `verdict: approved`: matching task files move to `done/` with frontmatter updated
- [ ] On `verdict: request-changes`: files remain in `for-review/`
- [ ] On `verdict: rejected`: files remain in `for-review/`
- [ ] `pwrl-work-sync-status` is called for the `done` transition
- [ ] Line count in `pwrl-review-report/SKILL.md` stays within the standard (≤ 350 lines, current: ~290)

## Dependencies

**Depends on:**

- **U1** ([Canonical Task Lifecycle Contract](2026-06-29-u1-canonical-task-lifecycle-contract.md)) — The Pre-Flight Guard and Responsibility Boundary cross-reference the contract.

**Reason:** Step 8.5 implements the `for-review → done` transition defined in the contract. This is the unit that makes the contract executable end-to-end.

## Related Files

- `/home/wicttor/.agents/skills/pwrl-review-report/SKILL.md` — Skill to update
- `/home/wicttor/.agents/skills/pwrl-work/SKILL.md` — Cross-reference source (U1)
- `/home/wicttor/.agents/skills/pwrl-work-sync-status/SKILL.md` — Called for GitHub sync

## Notes

- This is the only unit that actually moves a task to `done/`. Every other unit in this plan reinforces the rule that this is the only place that can do so.
- The `pwrl-work-sync-status` call should use the existing `done` status mapping from the utility (adds `done` label, removes `for-review`, posts "Task complete" comment, optionally closes the issue).
- Consider adding a "Sample Verification" smoke test that runs the full pipeline on a sample task (U1 itself) to verify the contract end-to-end. This is the same pattern used in plan `2026-06-29-001`.
