---
unit-id: U2
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: in-progress
created: 2026-06-29
updated: 2026-06-30
dependencies: [U1]
files:
  - /home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md
learnings:
  - docs/learnings/pattern/explicit-task-file-movement-critical.md
  - docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md
  - docs/learnings/gotcha/install-path-vs-repo-path-divergence-2026-06-30.md
---

# U2: Add Pre-Flight Guard and Responsibility Boundary to `pwrl-work-prepare`

**Goal:** Reinforce the `to-do → in-progress` transition as the single responsibility of this skill; refuse to proceed if the task is not in `to-do/`.

## Context

`pwrl-work-prepare` is the only skill that may move a task from `to-do/` to `in-progress/`. The current `SKILL.md` documents the move in Step 2B but does not (a) state that this is the skill's exclusive responsibility, (b) forbid premature `done` transitions, or (c) refuse to start work on a task that is already in the wrong folder. This unit adds a Pre-Flight Guard at the top and a Responsibility Boundary section that cross-references the contract from U1.

## Implementation Steps

1. **Open `/home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md`** and locate the section after the "Interaction Method" block (the new Pre-Flight Guard goes near the top, after the "Interaction Method" block and before "Purpose" or "Input").

2. **Insert a new `## Pre-Flight Guard` section** that states:
   - "Assert that the input task file is currently in `docs/tasks/to-do/`."
   - "If the file is in any other folder, log: 'Task is not in to-do/. Lifecycle contract violation. Current location: [path]. Refusing to proceed.' and ask the user to either move the file back to `to-do/` or cancel."
   - "Cross-reference: see `pwrl-work/SKILL.md §"Task Lifecycle Contract"`."

3. **Insert a new `## Responsibility Boundary` section** before the existing "Workflow" section with:
   - Bold heading: "**This skill OWNS the `to-do → in-progress` transition**"
   - Bold heading: "**This skill MUST NOT perform any other transition (especially `→ done`)**"
   - A one-line reference to the canonical table in `pwrl-work/references/workflow-details.md`

4. **Strengthen Step 2B (From Single Task File)** by adding a "Forbidden actions in this step:" list right after the existing "CRITICAL: Move task file" block, enumerating:
   - "Do not mark `status: done`"
   - "Do not move the file to `done/`"
   - "Do not skip the `for-review/` intermediate state by writing `status: done` in the frontmatter only."

5. **Do not modify** the existing output context schema, branch strategy, or execution-mode logic.

## Edge Cases

1. **Task file is in `done/` already**
   - **Scenario:** User invokes `/pwrl-work` on a task that's already completed.
   - **Handling:** Pre-Flight Guard surfaces an extra warning: "Task is already done. Skipping prepare." and asks the user to confirm or cancel.
   - **Test:** Manual smoke test with a sample task in `done/`.

2. **No task file path provided (bare prompt)**
   - **Scenario:** User passes a freeform prompt instead of a task file.
   - **Handling:** Pre-Flight Guard does not apply (the existing flow handles bare prompts separately in 2C). The guard only runs in 2B.
   - **Test:** Verify the guard is invoked only inside Step 2B, not at the top of the workflow.

## Testing

### Test Scenarios

- **Structural:** Section "Pre-Flight Guard" is found in `pwrl-work-prepare/SKILL.md` near the top.
- **Structural:** Section "Responsibility Boundary" is found with both the OWNS and MUST NOT sub-headings.
- **Structural:** Step 2B "Forbidden actions" list contains the three forbidden actions listed above.
- **Regression:** The file still produces the same output context (no behavioral regression in non-guard paths).

### Verification Commands

```bash
# Verify Pre-Flight Guard section
grep -A 1 "## Pre-Flight Guard" /home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md

# Verify Responsibility Boundary
grep -B 1 "OWNS the" /home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md
```

## Acceptance Criteria

- [ ] `pwrl-work-prepare/SKILL.md` (in the repo, not the install) has a new `## Pre-Flight Guard` section near the top
- [ ] `pwrl-work-prepare/SKILL.md` has a new `## Responsibility Boundary` section
- [ ] Step 2B has a "Forbidden actions" list with the three items above
- [ ] The guard refuses to proceed when the task is not in `to-do/`
- [ ] The output context schema is unchanged
- [ ] Line count in `pwrl-work-prepare/SKILL.md` stays within the OKF acceptable range (per `pwrl-standards/SCHEMA.md` §Document Structure: 80–300 lines)
- [ ] **If the file exceeds 300 lines, extract content to `pwrl-work-prepare/references/` to bring it within range** — see `docs/learnings/decision/line-count-standard-self-reference-2026-06-30.md`

## Dependencies

**Depends on:**

- **U1** ([Canonical Task Lifecycle Contract](2026-06-29-u1-canonical-task-lifecycle-contract.md)) — The guard and boundary section cross-reference the contract text from U1.

**Reason:** The "MUST NOT" rule is only meaningful if the canonical contract is defined.

## Related Files

- `/home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md` — Skill to update
- `/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md` — Cross-reference source (U1)

## Notes

- This unit can be developed in parallel with U3, U4, U5, U6 (all depend on U1, none depend on each other).
- The Pre-Flight Guard is a documentation-level guard. No script is required; the agent reading the SKILL.md should internalize the rule and self-check.

## Review Findings (2026-06-30)

**Verdict: REJECTED**

**Critical:** The implementation was applied to `/home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md` instead of `/home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md`. The repo file has **zero** occurrences of "Pre-Flight Guard" or "Responsibility Boundary". The Pre-Flight Guard, Responsibility Boundary, and Step 2B "Forbidden actions" list are all missing from the published file.

**Major:** The line count standard changed on 2026-06-21 (relaxed from 170 → 300). This task's acceptance criterion says `≤ 350 lines`; the actual OKF standard is `≤ 300 lines`. Repo file is currently 431 lines — already over both thresholds. U2 cannot fix this in isolation; the agent must also extract content to `references/`.

**Action required for re-execution:**

1. Update `files:` frontmatter to point at `/home/wicttor/Projects/pwrl/pwrl-work-prepare/SKILL.md`.
2. Sync the installed changes into the repo.
3. After sync, extract enough content to `pwrl-work-prepare/references/` so the SKILL.md is ≤ 300 lines.
4. Update the line-count acceptance criterion to `≤ 300 lines` per current OKF standard.
