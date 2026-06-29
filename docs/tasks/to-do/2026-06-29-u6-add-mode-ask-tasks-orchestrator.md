---
unit-id: U6
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: to-do
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-tasks/SKILL.md
learnings:
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
---

# U6: Add Mode Ask to `pwrl-tasks` (Orchestrator)

**Goal:** Make `pwrl-tasks` ask the user for the mode at workflow start (it has no entry-point sub-skill, so the ask lives in the orchestrator itself).

## Context

Unlike the other core skills, `pwrl-tasks` is a single-file orchestrator — there is no `pwrl-tasks-X` sub-skill. The mode ask must therefore live in the orchestrator `SKILL.md` itself. Without this ask, the entire task-slicing workflow (locate plan → generate task files → generate index) runs with no engagement preference, which can be jarring for users who want to review each generated task before it's written.

## Implementation Steps

1. **Open `pwrl-tasks/SKILL.md`** and locate the "Workflow" section.
2. **Add a new "Phase 0: Select Interaction Mode"** at the very top, before the existing Phase 1 "Locate and Read the Plan". Use the canonical "Required Interaction Section Template" from U1.
3. **Document mode-aware behavior** in the existing Phase 2 (Generate Task Files) and Phase 3 (Generate Index and Report):
   - **Detailed:** Show each generated task file to the user before writing; pause for ambiguous dependency resolutions.
   - **Smart:** Write all task files automatically; pause only for ambiguous dependency resolutions.
   - **Yolo:** Write all task files automatically; auto-resolve dependencies with conservative defaults.
4. **Add an "Interaction Mode Propagation" section** (mirroring `pwrl-plan` and `pwrl-learnings`) describing how the mode value is used.
5. **Verify** no existing steps are renumbered (the new Phase 0 is purely additive).

## Edge Cases

- **No sub-skill to delegate to:** The ask must be in the orchestrator. If the user runs `pwrl-tasks`, the model reads the orchestrator and immediately does the ask.
- **Mode persistence across runs:** A future enhancement could read the mode from `.pwrlrc.json`. Out of scope for this plan; document in the Future Refinements section.
- **Single-file vs. multi-file scope:** The orchestrator is small (~80-120 lines). Adding Phase 0 should not push it over the 170-line target. Confirm after editing.

## Testing

### Verification Commands

```bash
# Verify the new phase exists
grep -n "Phase 0: Select Interaction Mode" /home/wicttor/.agents/skills/pwrl-tasks/SKILL.md

# Verify three options are present
grep -E "Detailed.*Smart.*Yolo" /home/wicttor/.agents/skills/pwrl-tasks/SKILL.md

# Verify the propagation section exists
grep -n "Interaction Mode Propagation" /home/wicttor/.agents/skills/pwrl-tasks/SKILL.md

# Verify the file is still within the 170-line target
wc -l /home/wicttor/.agents/skills/pwrl-tasks/SKILL.md
```

### Manual Review

- Read the new Phase 0 end-to-end. Confirm the wording matches the U1 template.
- Confirm the mode-aware behavior notes in Phase 2 and Phase 3 are clear.

## Acceptance Criteria

- [ ] A "Phase 0: Select Interaction Mode" section appears at the top of the workflow.
- [ ] Detailed / Smart / Yolo are offered as three options.
- [ ] Mode-aware behavior is documented for Phase 2 and Phase 3.
- [ ] An "Interaction Mode Propagation" section is present.
- [ ] File remains under 170 lines (if it exceeds, extract to references/).

## Dependencies

**Depends on:**

- **U1** ([Define Interaction-Mode Schema in Standards](2026-06-29-u1-define-interaction-mode-schema.md)): Need the canonical template.

## Related Files

- [`/home/wicttor/.agents/skills/pwrl-tasks/SKILL.md`](/home/wicttor/.agents/skills/pwrl-tasks/SKILL.md): The target file.

## Notes

- Run in parallel with U2, U3, U4, U5, U7 after U1 lands.
- U8 will not modify this file (the propagation section is added here in U6, not U8).
