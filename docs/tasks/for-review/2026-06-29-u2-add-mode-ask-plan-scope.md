---
unit-id: U2
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: for-review
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-plan-scope/SKILL.md
learnings:
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
  - docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md
---

# U2: Add Mode Ask to `pwrl-plan-scope`

**Goal:** Make Phase 1 of `pwrl-plan` ask the user to choose Detailed / Smart / Yolo at the start.

## Context

`pwrl-plan-scope` is the entry-point sub-skill for the entire planning workflow. Without an explicit mode ask here, all four plan phases (scope, research, design, generate) run with no engagement preference, defaulting to whatever the model chooses. This task adds the ask at the right place — between the existing-plan check and the domain-validation step — and propagates the choice into the Scoped Context artifact.

## Implementation Steps

1. **Open `pwrl-plan-scope/SKILL.md`** and locate Step 1 (Check for Existing Plan) and Step 2 (Domain Validation).
2. **Insert a new Step 1.5 "Select Interaction Mode"** between them, using the canonical "Required Interaction Section Template" from U1 verbatim.
3. **Update the Scoped Context output schema** in the skill to include `interactionMode: detailed | smart | yolo` as a new field.
4. **Add a propagation note** explaining that the value flows into `pwrl-plan-research`, `pwrl-plan-design`, and `pwrl-plan-generate` artifacts (matches the existing "Interaction Mode Propagation" section in `pwrl-plan/SKILL.md`).
5. **Verify** the new step's options list exactly matches the three modes from U1 (Detailed, Smart, Yolo — no typos, no missing option).

## Edge Cases

- **Step renumbering risk:** Inserting a "Step 1.5" rather than renumbering all subsequent steps preserves the existing structure. Verify no subsequent "Step 2", "Step 3", etc. is accidentally duplicated.
- **Existing plan path:** If the user has an existing plan, the mode ask should still fire (the choice applies to the current session, not the historical plan).
- **Smart mode semantics:** The first version of Smart mode behaves like Yolo with a single confirmation prompt at workflow start. Document this in the step.

## Testing

### Verification Commands

```bash
# Verify the new step exists
grep -n "Select Interaction Mode" /home/wicttor/.agents/skills/pwrl-plan-scope/SKILL.md

# Verify three options are present
grep -E "Detailed.*Smart.*Yolo" /home/wicttor/.agents/skills/pwrl-plan-scope/SKILL.md

# Verify the schema includes interactionMode
grep -n "interactionMode" /home/wicttor/.agents/skills/pwrl-plan-scope/SKILL.md
```

### Manual Review

- Read the new step end-to-end. Confirm the wording matches the U1 template.
- Confirm the propagation note names all three downstream sub-skills.

## Acceptance Criteria

- [ ] A step titled "Select Interaction Mode" appears in the workflow between Step 1 and Step 2.
- [ ] The `ask_user_question` lists "Detailed (Step-by-Step)", "Smart (Risk-gated automation)", "Yolo (Full automation)" as three options.
- [ ] The Scoped Context output schema includes the `interactionMode` field.
- [ ] A propagation note documents the value flowing into research, design, generate.

## Dependencies

**Depends on:**

- **U1** ([Define Interaction-Mode Schema in Standards](2026-06-29-u1-define-interaction-mode-schema.md)): Need the canonical template before pasting into this skill.

**Reason:** The mode-ask wording must match the standards-doc template exactly. Inventing the wording here would defeat the canonical-template goal of U1.

## Related Files

- [`/home/wicttor/.agents/skills/pwrl-plan-scope/SKILL.md`](/home/wicttor/.agents/skills/pwrl-plan-scope/SKILL.md): The target file.
- [`/home/wicttor/.agents/skills/pwrl-plan/SKILL.md`](/home/wicttor/.agents/skills/pwrl-plan/SKILL.md): The orchestrator — already has an "Interaction Mode Propagation" section (U8 will update the wording).

## Notes

- Run in parallel with U3, U4, U5, U6, U7 after U1 lands (no inter-dependencies between U2–U7).
