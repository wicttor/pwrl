---
unit-id: U4
plan: docs/plans/2026-06-29-001-restore-interaction-mode-ask.md
status: to-do
created: 2026-06-29
dependencies: [U1]
files:
  - /home/wicttor/.agents/skills/pwrl-review-scope/SKILL.md
learnings:
  - docs/learnings/decision/interaction-modes-for-user-engagement.md
---

# U4: Add Mode Ask to `pwrl-review-scope`

**Goal:** Make Phase 1 of `pwrl-review` ask the user to choose Detailed / Smart / Yolo.

## Context

`pwrl-review-scope` is the entry-point sub-skill for the code review workflow. Today, the skill's "Interaction Method" section says "Use the platform's `ask_user_question` extension for all user-facing decisions" but never actually asks for the engagement mode. Without this ask, all five review phases (scope, prepare, analyze, report, sync-status) run with no engagement preference.

## Implementation Steps

1. **Open `pwrl-review-scope/SKILL.md`** and locate Step 1 "Identify Source & Requirements".
2. **Insert a new Step 0 "Select Interaction Mode"** before the existing Step 1, using the canonical "Required Interaction Section Template" from U1.
3. **Extend the Output Scope Artifact schema** in the skill to include `interactionMode: detailed | smart | yolo`.
4. **Add a cross-phase note** documenting that `pwrl-review-prepare`, `pwrl-review-analyze`, `pwrl-review-report`, and `pwrl-review-sync-status` must read the value from the scope artifact (matches the propagation contract documented in `pwrl-plan` and `pwrl-learnings` orchestrators).
5. **Renumber the existing steps** to Step 1, Step 2, ... (since a new Step 0 is added at the top).

## Edge Cases

- **Step renumbering risk:** Adding Step 0 at the top forces renumbering of all subsequent steps. Use the edit tool to renumber 1 → 0a, 2 → 1, 3 → 2 etc., OR keep the new step unnumbered and label it "Step 1.5" (less invasive). Prefer the Step 0 approach for clarity.
- **Cross-references to "Step N" elsewhere:** If any reference document (e.g., `pwrl-review-report` SKILL.md) says "see Step 1 of `pwrl-review-scope`", that link will break. Search for such references first.
- **Yolo mode + report verdict:** The `pwrl-review-report` skill currently always asks the user to approve / request changes. After this plan, in Yolo mode, it should auto-approve unless CRITICAL issues exist — but this behavior change is out of scope. Document this in the Smart mode note.

## Testing

### Verification Commands

```bash
# Verify the new step exists
grep -n "Select Interaction Mode" /home/wicttor/.agents/skills/pwrl-review-scope/SKILL.md

# Verify three options are present
grep -E "Detailed.*Smart.*Yolo" /home/wicttor/.agents/skills/pwrl-review-scope/SKILL.md

# Verify the schema includes interactionMode
grep -n "interactionMode" /home/wicttor/.agents/skills/pwrl-review-scope/SKILL.md

# Search for any external "Step N" references that need updating
grep -rn "pwrl-review-scope.*Step [0-9]" /home/wicttor/.agents/skills/ 2>/dev/null || echo "No external references"
```

### Manual Review

- Read the new step end-to-end. Confirm the wording matches the U1 template.
- Confirm downstream sub-skill propagation note is clear and complete.

## Acceptance Criteria

- [ ] A step titled "Select Interaction Mode" appears at the top of the workflow.
- [ ] Detailed / Smart / Yolo are offered as three options.
- [ ] The Scope Artifact YAML schema lists `interactionMode` as a required field.
- [ ] A cross-phase note documents that downstream sub-skills must read the value.
- [ ] No broken "Step N" cross-references.

## Dependencies

**Depends on:**

- **U1** ([Define Interaction-Mode Schema in Standards](2026-06-29-u1-define-interaction-mode-schema.md)): Need the canonical template.

## Related Files

- [`/home/wicttor/.agents/skills/pwrl-review-scope/SKILL.md`](/home/wicttor/.agents/skills/pwrl-review-scope/SKILL.md): The target file.
- [`/home/wicttor/.agents/skills/pwrl-review/SKILL.md`](/home/wicttor/.agents/skills/pwrl-review/SKILL.md): The orchestrator — does not yet have an "Interaction Mode Propagation" section (U8 will add it).

## Notes

- Run in parallel with U2, U3, U5, U6, U7 after U1 lands.
