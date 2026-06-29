---
unit-id: U5
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: done
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-learnings-extract/SKILL.md
learnings:
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
---

# U5: Add Mode Ask to `pwrl-learnings-extract`

**Goal:** Make Phase 1 of `pwrl-learnings` ask the user to choose Detailed / Smart / Yolo.

## Context

`pwrl-learnings-extract` is the entry-point sub-skill for the learnings workflow. Its current "Interaction Method" section says "Minimal interaction; primarily automated scanning and extraction." This contradicts the new design where users explicitly choose their engagement level. The mode affects Phase 2 (classification confirmations) and Phase 4 (dedup resolution), not the actual scanning — so users in Yolo mode still get fast extraction, but those in Detailed mode can intervene on ambiguous classifications.

## Implementation Steps

1. **Open `pwrl-learnings-extract/SKILL.md`** and locate the "Interaction Method" section + the "Validation" step.
2. **Replace the "Minimal interaction; primarily automated scanning and extraction." sentence** with the canonical three-mode template from U1.
3. **Add a new Step 1.5 "Select Interaction Mode"** that uses the template.
4. **Extend the Output Extraction Artifact schema** to include `interactionMode: detailed | smart | yolo`.
5. **Add a mode-aware-behavior note** explaining that Detailed pauses for ambiguous classifications and dedup decisions; Smart pauses only for high-confidence-low-applicability entries; Yolo auto-resolves everything.
6. **Update the "Ready for Classification" output block** to include `interactionMode: [chosen-value]`.

## Edge Cases

- **"Minimal interaction" sentence removal:** This is the key behavior change. Removing it is a soft breaking change for any user who relied on the no-prompt default. Mitigate by adding a one-line note: "In Yolo mode (the default for users who skip the prompt), the workflow proceeds as before."
- **Scanning is not gated:** The actual learning-signal scanning (FIXME, HACK, commit message analysis) is the same in all three modes. The mode affects confirmations, not extraction logic.
- **Schema migration:** The `interactionMode` field is new; downstream phases (classify, structure, dedup, save) must read it from the artifact. U8 will update the orchestrator to document this.

## Testing

### Verification Commands

```bash
# Verify the new step exists
grep -n "Select Interaction Mode" /home/wicttor/.agents/skills/pwrl-learnings-extract/SKILL.md

# Verify the old "minimal interaction" line is removed
grep -n "Minimal interaction" /home/wicttor/.agents/skills/pwrl-learnings-extract/SKILL.md || echo "Old line correctly removed"

# Verify three options are present
grep -E "Detailed.*Smart.*Yolo" /home/wicttor/.agents/skills/pwrl-learnings-extract/SKILL.md

# Verify the schema includes interactionMode
grep -n "interactionMode" /home/wicttor/.agents/skills/pwrl-learnings-extract/SKILL.md
```

### Manual Review

- Read the new step end-to-end. Confirm the wording matches the U1 template.
- Confirm the mode-aware-behavior note is clear.

## Acceptance Criteria

- [ ] A step titled "Select Interaction Mode" appears in the workflow.
- [ ] Detailed / Smart / Yolo are offered as three options.
- [ ] The extraction artifact YAML schema includes `interactionMode`.
- [ ] The "Minimal interaction" line is removed.
- [ ] A mode-aware-behavior note is present.

## Dependencies

**Depends on:**

- **U1** ([Define Interaction-Mode Schema in Standards](2026-06-29-u1-define-interaction-mode-schema.md)): Need the canonical template.

## Related Files

- [`/home/wicttor/.agents/skills/pwrl-learnings-extract/SKILL.md`](/home/wicttor/.agents/skills/pwrl-learnings-extract/SKILL.md): The target file.
- [`/home/wicttor/.agents/skills/pwrl-learnings/SKILL.md`](/home/wicttor/.agents/skills/pwrl-learnings/SKILL.md): The orchestrator — already has an "Interaction Mode Propagation" section (U8 will update it to mention Smart mode).

## Notes

- Run in parallel with U2, U3, U4, U6, U7 after U1 lands.
