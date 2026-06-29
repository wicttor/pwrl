---
unit-id: U3
plan: docs/plans/2026-06-29-003-pwrl-work-task-lifecycle-contract.md
status: to-do
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md
learnings:
  - docs/learnings/pattern/explicit-task-file-movement-critical.md
  - docs/learnings/pattern/task-state-machine-enforcement-2026-06-29.md
---

# U3: Strengthen Transitions in `pwrl-work-execute` and Add Pre-Flight Guard

**Goal:** Make the `in-progress → for-review` transition explicit in all three execution modes (Inline, Serial, Parallel), and forbid the `done` transition.

## Context

The Inline mode of `pwrl-work-execute` has an explicit "CRITICAL: Move task file" block for the `in-progress → for-review` transition. The Serial and Parallel modes only say "Update task status to for-review" without the file move — this is a root cause of the agent skipping the transition in the last session (it interpreted "update status" as just frontmatter, not file move). This unit makes the transition explicit in all three modes, adds a Pre-Flight Guard, and forbids the `done` transition.

## Implementation Steps

1. **Open `/home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md`** and locate the section after the "Interaction Method" block.

2. **Insert a new `## Pre-Flight Guard` section** that states:
   - "Assert that the input task file is in `docs/tasks/in-progress/` (because prepare should have moved it there)."
   - "If the file is in any other folder, refuse to proceed with a recovery message."
   - "Cross-reference: see `pwrl-work/SKILL.md §"Task Lifecycle Contract"`."

3. **Insert a new `## Responsibility Boundary` section** with:
   - Bold heading: "**This skill OWNS the `in-progress → for-review` transition**"
   - Bold heading: "**This skill MUST NOT perform any other transition (especially `→ done`)**"

4. **Strengthen Serial Mode Step 2a "Execute task"**: Replace the existing sentence "Update task status to `for-review`" with the full "CRITICAL: Move task file" block (read from in-progress, write status for-review, write to for-review, delete from in-progress, log message) — copy the block verbatim from Inline Mode Step 5.

5. **Strengthen Parallel Mode Step 2 "Execute all tasks in parallel"**: Add the same "CRITICAL: Move task file" block as a per-task sub-step called "For each task, on completion" — also verbatim from Inline Mode Step 5.

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
grep -A 1 "## Pre-Flight Guard" /home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md

# Verify the strengthened Serial mode
grep -B 1 "CRITICAL: Move task file" /home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md | wc -l
# Expect: at least 3 matches (Inline + Serial + Parallel)

# Verify the new note in the state machine diagram
grep "exclusive responsibility" /home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md
```

## Acceptance Criteria

- [ ] `pwrl-work-execute/SKILL.md` has a new `## Pre-Flight Guard` section
- [ ] `pwrl-work-execute/SKILL.md` has a new `## Responsibility Boundary` section
- [ ] Serial Mode Step 2a contains the "CRITICAL: Move task file" block (verbatim from Inline)
- [ ] Parallel Mode Step 2 contains the "CRITICAL: Move task file" block as a per-task sub-step
- [ ] The "Task Status Progression" diagram has the new exclusive-responsibility note
- [ ] No behavior regression beyond strengthened logging
- [ ] Line count in `pwrl-work-execute/SKILL.md` stays within the standard (≤ 500 lines, current: ~430)

## Dependencies

**Depends on:**

- **U1** ([Canonical Task Lifecycle Contract](2026-06-29-u1-canonical-task-lifecycle-contract.md)) — The MUST NOT rule and the cross-reference to the contract come from U1.

**Reason:** The Serial/Parallel modes need to know what they may and may not do, which is defined in U1.

## Related Files

- `/home/wicttor/.agents/skills/pwrl-work-execute/SKILL.md` — Skill to update
- `/home/wicttor/.agents/skills/pwrl-work/SKILL.md` — Cross-reference source (U1)

## Notes

- This is the most code-touching unit. Be careful when copying the "CRITICAL: Move task file" block from Inline Mode — any drift between the three modes will re-introduce the bug.
- Consider using a `git diff` after the edit to verify the three blocks are character-identical.
