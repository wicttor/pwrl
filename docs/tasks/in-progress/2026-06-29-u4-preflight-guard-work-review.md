---
unit-id: U4
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: in-progress
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-work-review/SKILL.md
learnings:
  - docs/learnings/pattern/explicit-review-verdict-flow-2026-06-16.md
  - docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md
---

# U4: Add Pre-Flight Guard, Responsibility Boundary, and REQUEST CHANGES Revert Logic to `pwrl-work-review`

**Goal:** Document that this skill OWNS the `for-review → in-progress` (rework) transition for REQUEST CHANGES, and that it MUST NOT mark tasks as `done`.

## Context

`pwrl-work-review` currently produces a `readyForShipping` flag and stops. The `explicit-review-verdict-flow-2026-06-16.md` pattern learning states that REQUEST CHANGES should move the file back to `in-progress/`, but the skill does not implement that transition. This unit adds the missing rework-loop logic, plus a Pre-Flight Guard and a Responsibility Boundary that explicitly forbids the `done` transition (which is the exclusive responsibility of `pwrl-review-report` per U5).

## Implementation Steps

1. **Open `/home/wicttor/.agents/skills/pwrl-work-review/SKILL.md`** and locate the section after the "Interaction Method" block.

2. **Insert a new `## Pre-Flight Guard` section** that states:
   - "Assert that the input task file is in `docs/tasks/for-review/`."
   - "If the file is in any other folder, refuse to proceed with a recovery message."
   - "Cross-reference: see `pwrl-work/SKILL.md §"Task Lifecycle Contract"`."

3. **Insert a new `## Responsibility Boundary` section** with:
   - Bold heading: "**This skill OWNS the `for-review → in-progress` transition (rework loop)**"
   - Bold heading: "**This skill MUST NOT perform the `for-review → done` transition. That is the exclusive responsibility of `pwrl-review-report`.**"

4. **Add a new Step 8 "Handle Rework Loop"** between the current Step 7 "Produce Review Summary" and the existing "Optional Deep Review Mode" section. The step must:
   - Read the current `Review Summary` artifact
   - If `changesRequested: true` is present (set by the user during review):
     - **CRITICAL: Move task file** `for-review/` → `in-progress/`
     - Update frontmatter: `status: for-review` → `status: in-progress`
     - Add a "Review Findings" section to the task body listing the action items
     - Log: "Task returned for rework: docs/tasks/for-review/[file] → docs/tasks/in-progress/[file]"
   - If `approved: true` is present: do nothing (the next pipeline step, `pwrl-review-report`, will handle the `done` transition)
   - If neither flag is set: ask the user "Did the review approve, request changes, or reject?"

5. **Update the existing Step 7 "Produce Review Summary" output** to add two new flags: `approved: true | false` and `changesRequested: true | false` to the YAML block, so the new Step 8 can branch on them.

6. **Do not modify** the existing steps 1–6 (file identification, duplication detection, helper extraction, system checks, design comparison, scope control).

## Edge Cases

1. **User rejects the review outright**
   - **Scenario:** The verdict is REJECTED (unfixable issues, scope creep).
   - **Handling:** Per the `explicit-review-verdict-flow-2026-06-16.md` pattern, REJECTED leaves the file in `for-review/` with an explanation. The new Step 8 should not move the file; it should add a "Review Findings" section explaining why.
   - **Test:** Add a new flag `rejected: true` to the Step 7 output and handle it in Step 8.

2. **User provides neither approval nor change request**
   - **Scenario:** The review summary has no `approved` or `changesRequested` flag.
   - **Handling:** Step 8 asks the user to clarify before taking action.
   - **Test:** Manual smoke test with a neutral review summary.

3. **Pre-Flight Guard fires when the task is in `in-progress/` already**
   - **Scenario:** User invokes `/pwrl-work-review` on a task that's still being worked on.
   - **Handling:** Guard refuses to proceed: "Task is not in for-review/. Lifecycle contract violation. Refusing to review."
   - **Test:** Manual smoke test.

## Testing

### Test Scenarios

- **Structural:** Section "Pre-Flight Guard" is found.
- **Structural:** Section "Responsibility Boundary" is found with both sub-headings.
- **Structural:** Step 8 "Handle Rework Loop" contains the "CRITICAL: Move task file" block.
- **Structural:** The output YAML now includes `approved` and `changesRequested` fields.
- **Behavioral:** When `changesRequested: true`, the task is moved back to `in-progress/`.
- **Behavioral:** When `approved: true`, the task stays in `for-review/` (waiting for `pwrl-review-report`).
- **Behavioral:** When neither flag is set, the skill asks the user to clarify.

### Verification Commands

```bash
# Verify Pre-Flight Guard section
grep -A 1 "## Pre-Flight Guard" /home/wicttor/.agents/skills/pwrl-work-review/SKILL.md

# Verify Step 8 exists
grep -A 1 "Handle Rework Loop" /home/wicttor/.agents/skills/pwrl-work-review/SKILL.md

# Verify the output YAML has the new flags
grep -E "(approved|changesRequested):" /home/wicttor/.agents/skills/pwrl-work-review/SKILL.md
```

## Acceptance Criteria

- [ ] `pwrl-work-review/SKILL.md` has a new `## Pre-Flight Guard` section
- [ ] `pwrl-work-review/SKILL.md` has a new `## Responsibility Boundary` section with both sub-headings
- [ ] Step 8 "Handle Rework Loop" contains the "CRITICAL: Move task file" block (verbatim from U3 Inline pattern)
- [ ] The output YAML includes `approved` and `changesRequested` fields
- [ ] On `changesRequested: true`: task moves to `in-progress/` with "Review Findings" section appended
- [ ] On `approved: true`: task stays in `for-review/`
- [ ] On neither flag: skill asks the user to clarify
- [ ] Line count in `pwrl-work-review/SKILL.md` stays within the standard (≤ 350 lines, current: ~290)

## Dependencies

**Depends on:**

- **U1** ([Canonical Task Lifecycle Contract](2026-06-29-u1-canonical-task-lifecycle-contract.md)) — The MUST NOT rule and the rework-loop transition come from the contract.

**Reason:** The rework-loop logic implements the `for-review → in-progress` transition defined in the contract.

## Related Files

- `/home/wicttor/.agents/skills/pwrl-work-review/SKILL.md` — Skill to update
- `/home/wicttor/.agents/skills/pwrl-work/SKILL.md` — Cross-reference source (U1)

## Notes

- The "CRITICAL: Move task file" block in Step 8 should be character-identical to the one in `pwrl-work-execute` Inline Mode (U3) to avoid drift. Consider using a single canonical block in a reference file that both skills reference, but for this plan, copying verbatim is acceptable.
- The user-facing prompt "Did the review approve, request changes, or reject?" should be a 4-option `ask_user_question` (Approve / Request changes / Reject / Defer) to make the verdict explicit.

## Review Findings (2026-06-30)

**Verdict: REJECTED**

**Critical:** The implementation was applied to `/home/wicttor/.agents/skills/pwrl-work-review/SKILL.md` instead of `/home/wicttor/Projects/pwrl/pwrl-work-review/SKILL.md`. The repo file has **zero** occurrences of "Pre-Flight Guard", "Responsibility Boundary", "Handle Rework Loop", or the new `approved` / `changesRequested` output fields. The Pre-Flight Guard, Responsibility Boundary, and Step 8 "Handle Rework Loop" are all missing from the published file. The entire rework-loop logic is absent in the repo.

**Action required for re-execution:**

1. Update `files:` frontmatter to point at `/home/wicttor/Projects/pwrl/pwrl-work-review/SKILL.md`.
2. Sync the installed changes into the repo.
3. Verify with: `grep -c "Handle Rework Loop\|Pre-Flight Guard\|Responsibility Boundary" /home/wicttor/Projects/pwrl/pwrl-work-review/SKILL.md` returns `≥ 3`.
4. Verify the output YAML in Step 7 contains both `approved:` and `changesRequested:` fields.
