---
unit-id: U3
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: to-do
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-work-triage/SKILL.md
learnings:
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
---

# U3: Upgrade `pwrl-work-triage` to Three Modes

**Goal:** Replace the existing two-mode Step 5 in `pwrl-work-triage` with the canonical three-mode template (Detailed / Smart / Yolo).

## Context

`pwrl-work-triage` is the only sub-skill in the entire PWRL ecosystem that actually implements the interaction mode ask. Its current implementation offers only two modes (Detailed / Yolo), which matches the original 2026-06-12 decision. This task upgrades it to the three-mode model by replacing Step 5's content with the canonical template from U1 — preserving the existing `interactionMode: detailed | yolo` field comment but updating it to `detailed | smart | yolo`.

## Implementation Steps

1. **Open `pwrl-work-triage/SKILL.md`** and locate Step 5 "Select Interaction Mode" (currently has two modes).
2. **Replace Step 5's `ask_user_question` content** with the canonical three-mode template from U1 (copy-paste verbatim).
3. **Update the `interactionMode: detailed | yolo` field comment** to `interactionMode: detailed | smart | yolo`.
4. **Add a "Smart mode" note** explaining the v1 semantics: Smart mode behaves like Yolo with a single confirmation prompt at workflow start (the full risk-gating logic is a future enhancement flagged in the U8 pattern learning).
5. **Update the storage-in-context example** to use the three-value field comment.
6. **Verify all other mentions of "Detailed" or "Yolo"** in the file remain consistent (no contradictory "Detailed only" or "no Yolo" claims).

## Edge Cases

- **Backward compatibility:** If any downstream consumer (other sub-skills, plan artifacts) reads `interactionMode` and assumes a 2-value enum, the new "smart" value will be unexpected. The fix: add a short backward-compat note saying "downstream phases should treat any legacy `yolo` value as still valid" (no code change needed in this plan).
- **Field comment vs. real schema:** The current comment is illustrative; there is no JSON Schema or TypeScript enum. The comment is the contract. Update it carefully.
- **Step numbering:** Step 5 stays Step 5 (no renumbering needed).

## Testing

### Verification Commands

```bash
# Verify three options are present
grep -E "Detailed.*Smart.*Yolo" /home/wicttor/.agents/skills/pwrl-work-triage/SKILL.md

# Verify the field comment is updated
grep -n "interactionMode: detailed | smart | yolo" /home/wicttor/.agents/skills/pwrl-work-triage/SKILL.md

# Verify the old two-value comment is gone
grep -n "interactionMode: detailed | yolo$" /home/wicttor/.agents/skills/pwrl-work-triage/SKILL.md || echo "Old comment correctly removed"
```

### Manual Review

- Read Step 5 end-to-end. Confirm the new wording matches the U1 template.
- Confirm the "Smart mode" note is clear and points to the future enhancement.

## Acceptance Criteria

- [ ] Step 5's `ask_user_question` offers Detailed, Smart, Yolo (three options).
- [ ] `interactionMode: detailed | smart | yolo` field comment is present.
- [ ] Old `detailed | yolo` (without smart) is no longer the canonical comment.
- [ ] A "Smart mode v1 semantics" note is present.
- [ ] No other Steps renumbered.

## Dependencies

**Depends on:**

- **U1** ([Define Interaction-Mode Schema in Standards](2026-06-29-u1-define-interaction-mode-schema.md)): Need the canonical template.

**Reason:** Same as U2 — must use the canonical wording.

## Related Files

- [`/home/wicttor/.agents/skills/pwrl-work-triage/SKILL.md`](/home/wicttor/.agents/skills/pwrl-work-triage/SKILL.md): The target file.

## Notes

- This is the only `pwrl-work` sub-skill change in this plan. U8 will update the orchestrator's missing "Interaction Mode Propagation" section.
- Run in parallel with U2, U4, U5, U6, U7 after U1 lands.
