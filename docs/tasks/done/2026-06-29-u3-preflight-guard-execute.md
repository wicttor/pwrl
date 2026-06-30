---
unit-id: U3
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: in-progress
created: 2026-06-29
updated: 2026-06-30
dependencies: [U1]
files:
  - /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md
learnings:
  - docs/learnings/pattern/explicit-task-file-movement-critical.md
  - docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md
  - docs/learnings/gotcha/install-path-vs-repo-path-divergence-2026-06-30.md
  - docs/learnings/technical-fix/u3-serial-parallel-move-file-block-gap-2026-06-30.md
---

# U3: Strengthen Transitions in `pwrl-work-execute` and Add Pre-Flight Guard

**Goal:** Make the `in-progress → for-review` transition explicit in all three execution modes (Inline, Serial, Parallel), and forbid the `done` transition.

## Context

The Inline mode of `pwrl-work-execute` has an explicit "CRITICAL: Move task file" block for the `in-progress → for-review` transition. The Serial and Parallel modes only say "Update task status to for-review" without the file move — this is a root cause of the agent skipping the transition in the last session (it interpreted "update status" as just frontmatter, not file move). This unit makes the transition explicit in all three modes, adds a Pre-Flight Guard, and forbids the `done` transition.

## Implementation Steps

1. **Open `/home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md`** and locate the section after the "Interaction Method" block.

2. **Insert a new `## Pre-Flight Guard` section** that states:
   - "Assert that the input task file is in `docs/tasks/in-progress/` (because prepare should have moved it there)."
   - "If the file is in any other folder, refuse to proceed with a recovery message."
   - "Cross-reference: see `pwrl-work/SKILL.md §"Task Lifecycle Contract"`."

3. **Insert a new `## Responsibility Boundary` section** with:
   - Bold heading: "**This skill OWNS the `in-progress → for-review` transition**"
   - Bold heading: "**This skill MUST NOT perform any other transition (especially `→ done`)**"

4. **Strengthen Serial Mode Step 2a "Execute task"**: Replace the existing sentence "Update task status to `for-review`" with the full "**CRITICAL: Move file**" block — **copy the block verbatim from Inline Mode Step 5, do not paraphrase**. The block is:

   ```markdown
   - **CRITICAL: Move file** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
     - Read the task file from `in-progress/` folder
     - Update frontmatter status: `status: in-progress` → `status: for-review`
     - Write the updated file to `docs/tasks/for-review/` with same filename
     - Delete original from `in-progress/`
     - Log: `Task ready for review: docs/tasks/in-progress/[file] → docs/tasks/for-review/[file]`
   ```

5. **Strengthen Parallel Mode Step 2 "Execute all tasks in parallel"**: Add the same "**CRITICAL: Move file**" block as a per-task sub-step called "For each task, on completion" — **also verbatim from Inline Mode Step 5**. Do not paraphrase; the three blocks MUST be character-identical.

6. **Update the existing "Task Status Progression" state-machine diagram** to add a new note below the diagram: "The `for-review → done` transition is the exclusive responsibility of `pwrl-review-report`. This skill MUST NOT mark any task as `done`."

7. **Do not modify** the output execution result schema, subagent constraints, or quality gates.

## Edge Cases

1. **Serial mode has a long dependency chain (5+ tasks)**
   - **Scenario:** Serial mode processes 5 tasks in order; each task needs the same "CRITICAL: Move task file" block.
   - **Handling:** The block is repeated for each task, not lifted out. This matches the Inline mode pattern and makes the per-task responsibility unmissable.
   - **Test:** Verify the block appears in Step 2a as part of the per-task sub-step (not as a pre-step).

2. **Parallel mode has 4+ tasks running concurrently**
   - **Scenario:** All tasks in a parallel group complete around the same time; each needs the file move.
   - **Handling:** The per-task "CRITICAL: Move task file" block runs in each task's own context. The orchestrator does not aggregate the moves.
   - **Test:** Visual inspection of the file move instructions in the parallel section.

3. **Pre-Flight Guard fires when the task is in `for-review/` already**
   - **Scenario:** User re-invokes `/pwrl-work` on a task that's already in `for-review/`.
   - **Handling:** Guard surfaces a recovery message: "Task is already in for-review/. This may indicate the execute phase did not complete. Proceeding will skip the implementation. Confirm to continue or cancel."
   - **Test:** Manual smoke test.

## Testing

### Test Scenarios

- **Structural:** Serial Mode Step 2a now contains the "CRITICAL: Move task file" block (verbatim from Inline Mode).
- **Structural:** Parallel Mode Step 2 now contains the "CRITICAL: Move task file" block as a per-task sub-step.
- **Structural:** The "Task Status Progression" diagram includes the new exclusive-responsibility note.
- **Regression:** The file still produces the same execution result output (no behavioral regression beyond strengthened logging).

### Verification Commands

```bash
# Verify Pre-Flight Guard section
grep -A 1 "## Pre-Flight Guard" /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md

# Verify the strengthened Serial mode
grep -B 1 "CRITICAL: Move task file" /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md | wc -l
# Expect: at least 3 matches (Inline + Serial + Parallel)

# Verify the new note in the state machine diagram
grep "exclusive responsibility" /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md
```

## Acceptance Criteria

- [ ] `pwrl-work-execute/SKILL.md` (in the repo, not the install) has a new `## Pre-Flight Guard` section
- [ ] `pwrl-work-execute/SKILL.md` has a new `## Responsibility Boundary` section
- [ ] **Inline Mode Step 5 contains the "**CRITICAL: Move file**" block** (with 5 sub-steps: read, update frontmatter, write, delete, log)
- [ ] **Serial Mode Step 2a contains the same block, verbatim from Inline** (do not paraphrase — drift is the bug)
- [ ] **Parallel Mode Step 2 contains the same block as a per-task sub-step, verbatim from Inline**
- [ ] The "Task Status Progression" diagram has the new exclusive-responsibility note
- [ ] No behavior regression beyond strengthened logging
- [ ] Line count in `pwrl-work-execute/SKILL.md` stays within the OKF acceptable range (per `pwrl-standards/SCHEMA.md` §Document Structure: 80–300 lines)
- [ ] **If the file exceeds 300 lines, extract content to `pwrl-work-execute/references/` to bring it within range**
- [ ] **Verify drift-free: `diff` the three "CRITICAL: Move file" blocks across the three modes — they MUST be character-identical**
- [ ] **Verify with `grep -c "CRITICAL: Move file" /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md` returns `≥ 3`**

> **CRITICAL bug to fix in this unit:** The previous attempt applied the "CRITICAL: Move file" block to Inline mode only. Serial and Parallel modes still said only "Update task status to `for-review`" — which the agent interpreted as frontmatter-only, skipping the file move. This is the exact bug U3 was supposed to fix. See `docs/learnings/technical-fix/u3-serial-parallel-move-file-block-gap-2026-06-30.md` and `docs/learnings/gotcha/asymmetric-action-descriptions-across-execution-modes-2026-06-29.md`.

## Dependencies

**Depends on:**

- **U1** ([Canonical Task Lifecycle Contract](2026-06-29-u1-canonical-task-lifecycle-contract.md)) — The MUST NOT rule and the cross-reference to the contract come from U1.

**Reason:** The Serial/Parallel modes need to know what they may and may not do, which is defined in U1.

## Related Files

- `/home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md` — Skill to update
- `/home/wicttor/Projects/pwrl/pwrl-work/SKILL.md` — Cross-reference source (U1)

## Notes

- This is the most code-touching unit. Be careful when copying the "CRITICAL: Move task file" block from Inline Mode — any drift between the three modes will re-introduce the bug.
- Consider using a `git diff` after the edit to verify the three blocks are character-identical.

## Review Findings (2026-06-30)

**Verdict: REJECTED**

**Critical (×2):**

1. The implementation was applied to `/home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md` instead of `/home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md`. The repo file has **zero** occurrences of "Pre-Flight Guard" or "Responsibility Boundary". The Pre-Flight Guard and Responsibility Boundary sections are missing from the published file.

2. **Even in the installed file, the task is incomplete.** The "CRITICAL: Move file" block appears only in **Inline Mode Step 5 (line 95)**. Serial Mode Step 2a and Parallel Mode Step 2 still say only "Update task status to `for-review`" without the full file-move block. Acceptance criteria #3 ("Serial Mode Step 2a now contains the 'CRITICAL: Move task file' block") and #4 ("Parallel Mode Step 2 now contains the 'CRITICAL: Move task file' block") are **not met** even in the installed version.

**Major:** Repo file is 516 lines (vs. OKF standard ≤ 300). U3 cannot fix this in isolation; content must be extracted to `pwrl-work-execute/references/`.

**Action required for re-execution:**

1. Update `files:` frontmatter to point at `/home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md`.
2. Copy the "CRITICAL: Move file" block from Inline Mode into Serial Mode Step 2a and Parallel Mode Step 2 (verbatim from Inline) — this is missing in BOTH the installed and repo files.
3. Sync the installed changes into the repo.
4. Extract content to `pwrl-work-execute/references/` to bring SKILL.md ≤ 300 lines.
5. Verify with: `grep -c "CRITICAL: Move file" /home/wicttor/Projects/pwrl/pwrl-work-execute/SKILL.md` returns `≥ 3` (Inline + Serial + Parallel).
