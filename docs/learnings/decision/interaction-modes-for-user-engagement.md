---
title: "Interaction Modes for User Engagement Control"
timestamp: 2026-06-12
category: decision
type: PWRL Learning
severity: high
tags:
  - user-control
  - automation-philosophy
  - engagement-model
  - workflow-design
domains:
  - pwrl-work
  - user-experience
---

# Interaction Modes for User Engagement Control

## Decision

Offer users two interaction modes at workflow start (Phase 0) to control their level of engagement and approval authority.

## The Two Modes

### Detailed Mode (Step-by-Step)

- Review and confirm at each phase transition: Prepare → Execute → Review → Finalize
- Inspect generated artifacts before proceeding
- Approval gates at every major step
- **Best for:** Complex work, unfamiliar codebases, learning, high-stakes changes
- **Speed:** Slower (user review at each step)
- **Control:** Maximum

### Yolo Mode (Full Automation)

- Fully automated from Phase 1 through Phase 3
- Single review and confirmation only at final step (Phase 4 finalization)
- Faster execution
- **Best for:** Straightforward tasks, well-understood scope, time-sensitive work
- **Speed:** Faster
- **Control:** Lower until end (then final gate)

## Why This Matters

**Problem:** One-size-fits-all automation doesn't work:

- Complex refactoring needs step-by-step validation
- Simple bug fix should be fast and trust-based
- Users have different confidence levels in different codebases
- Context matters (learning phase vs production phase)

**Solution:** Let user choose their engagement level upfront, and workflow adapts.

## Implementation

**Phase 0 (Triage): Ask user for mode selection**

```
How would you like to proceed?

✓ Detailed (Step-by-Step)
  - Review and confirm at each phase
  - Slower but maximum control

✓ Yolo (Full Automation)
  - Automated phases 1-3
  - Review only at end
  - Faster execution
```

**Store in context:** `interactionMode: detailed | yolo`

**Phase 1-3 behavior:**

- If `detailed`: Pause after each phase, show artifacts, ask approval
- If `yolo`: Run all three phases without stopping

**Phase 4 (Finalize):** Both modes merge and ask final confirmation

## Code Example

From `pwrl-work-triage/SKILL.md`:

```yaml
5. Select Interaction Mode

After classifying input, ask user to choose interaction style:

Options:
- Detailed (Step-by-Step): Review at each phase
- Yolo (Full Automation): Full automation with final confirmation only

Store selection in context:
  interactionMode: detailed | yolo
```

## Lessons Learned

1. **User Autonomy**: People want to choose their own pace, not be forced into one
2. **Context Matters**: Same user might want different modes for different tasks
3. **Trust Builds Gradually**: Yolo mode is safer _after_ you've used Detailed mode and trust the system
4. **Transparency Wins**: Showing what would happen (even fast) beats hidden automation
5. **Opt-in Defaults**: Better to ask than assume—let power users opt into speed

## Real-World Example

**Detailed Mode Use Case:**

- Refactoring a critical API
- Unfamiliar codebase
- High stakes (customer-facing)
- Learning how system works

**Yolo Mode Use Case:**

- Fixing a typo in documentation
- Adding a new feature in well-known domain
- You've reviewed similar code 100 times
- Time-sensitive hotfix

## Related Decisions

- See: [Branch-Ready Workflow Over Auto-Ship to Main](#)
- See: [Explicit Task File Movement as Critical Phase Operation](#)
- See: [Pattern: Interaction-Mode Three-Mode Propagation](pattern/interaction-mode-three-mode-propagation-2026-06-29.md) — codifies the canonical three-mode contract, entry-point placement rule, and artifact propagation contract across all 6 core PWRL workflows. The pattern is the formalization of the "Add third mode: Smart" refinement marked done above.

## Future Refinements

- [DONE 2026-06-29] Add third mode: "Smart" (Detailed for complex, Yolo for simple) — see `pattern/interaction-mode-three-mode-propagation-2026-06-29.md` for the v1 implementation. v1 simplification: Smart behaves like Yolo with a single confirmation prompt at workflow start; the full risk-classification taxonomy is a follow-up.
- Add per-phase override (stay in Yolo for Prepare, switch to Detailed for Execute)
- Remember user preference per codebase/domain
- Offer suggested mode based on task complexity analysis
