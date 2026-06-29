---
unit-id: U7
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: to-do
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-end-session-checkpoint/SKILL.md
  - /home/wicttor/.agents/skills/pwrl-end-session/SKILL.md
learnings:
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
---

# U7: Add Mode Ask to `pwrl-end-session-checkpoint`

**Goal:** Make Phase 1 of `pwrl-end-session` ask the user for the mode (it controls whether Phase 2 commit draft is shown for approval or auto-generated).

## Context

`pwrl-end-session-checkpoint` is the first sub-skill the user actually invokes in the session-end workflow. The mode it sets controls:
- **Detailed:** User sees the draft commit message in `pwrl-end-session-commit` and edits it before approval.
- **Smart:** User sees a pre-flight summary (files, line counts, version-bump check) and approves with one click.
- **Yolo:** Entire session-end (checkpoint + commit) auto-runs and only reports the final SHA.

Without this ask, every session-end runs in Detailed mode (since that's the implicit default), forcing users to step through commit-message approval even for routine work.

## Implementation Steps

1. **Open `pwrl-end-session-checkpoint/SKILL.md`** and locate the "Workflow" section.
2. **Add a new Step 1.5 "Select Interaction Mode"** after the "Verify Working Tree" step, using the canonical "Required Interaction Section Template" from U1.
3. **Extend the Checkpoint artifact schema** to include `interactionMode: detailed | smart | yolo`.
4. **Add mode-aware-behavior documentation** describing how the mode changes the subsequent `pwrl-end-session-commit` flow.
5. **Update `pwrl-end-session/SKILL.md`** to add an "Interaction Mode Propagation" section in the architecture description (mirroring `pwrl-plan` and `pwrl-learnings` orchestrators).
6. **Verify** the new step's options list exactly matches the three modes from U1.

## Edge Cases

- **Empty working tree:** If there are no changes, `pwrl-end-session-checkpoint` exits early per its existing rules. The mode ask should still fire (or be skipped — design decision). Default: skip the ask if there are no changes, since there's nothing to commit anyway.
- **CHANGELOG version bump detection:** The mode doesn't affect whether a version bump is detected; it only affects how the commit-message body is drafted and approved.
- **Learnings chaining (Phase 3):** The mode ask in U7 only affects checkpoint and commit. The optional `/pwrl-learnings` chain in Phase 3 has its own mode ask (U5). Document this in the propagation section.

## Testing

### Verification Commands

```bash
# Verify the new step exists in checkpoint
grep -n "Select Interaction Mode" /home/wicttor/.agents/skills/pwrl-end-session-checkpoint/SKILL.md

# Verify three options are present
grep -E "Detailed.*Smart.*Yolo" /home/wicttor/.agents/skills/pwrl-end-session-checkpoint/SKILL.md

# Verify the schema includes interactionMode
grep -n "interactionMode" /home/wicttor/.agents/skills/pwrl-end-session-checkpoint/SKILL.md

# Verify the orchestrator has the propagation section
grep -n "Interaction Mode Propagation" /home/wicttor/.agents/skills/pwrl-end-session/SKILL.md
```

### Manual Review

- Read the new step end-to-end. Confirm the wording matches the U1 template.
- Confirm the orchestrator's propagation section names the checkpoint and commit sub-skills.

## Acceptance Criteria

- [ ] A step titled "Select Interaction Mode" appears in the checkpoint workflow.
- [ ] Detailed / Smart / Yolo are offered as three options.
- [ ] The Checkpoint artifact schema includes `interactionMode`.
- [ ] Mode-aware behavior is documented for the commit flow.
- [ ] The orchestrator `pwrl-end-session/SKILL.md` has an "Interaction Mode Propagation" section.

## Dependencies

**Depends on:**

- **U1** ([Define Interaction-Mode Schema in Standards](2026-06-29-u1-define-interaction-mode-schema.md)): Need the canonical template.

## Related Files

- [`/home/wicttor/.agents/skills/pwrl-end-session-checkpoint/SKILL.md`](/home/wicttor/.agents/skills/pwrl-end-session-checkpoint/SKILL.md): Target file 1.
- [`/home/wicttor/.agents/skills/pwrl-end-session/SKILL.md`](/home/wicttor/.agents/skills/pwrl-end-session/SKILL.md): Target file 2 (orchestrator update).

## Notes

- Run in parallel with U2, U3, U4, U5, U6 after U1 lands.
- Two files are modified in this unit (unusual); keep both edits in the same commit for atomicity.
