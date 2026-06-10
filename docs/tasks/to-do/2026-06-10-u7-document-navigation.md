---
unit-id: U7
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: []
created: 2026-06-10
files:
  - agents/pwrl-planner.agent.md (modify)
learnings: []
---

# U7: Document Backward Navigation in Agent

## Goal

Clarify agent behavior for backward navigation and state management when users want to refine prior decisions.

## Context

Agent checkpoints offer "Adjust context (refine scope)" but don't document:
- Can user go back from Phase 2 to Phase 1?
- If yes, does entire workflow reset or just Phase 1?
- What happens to Phase 2+ state?

UX confusion arises if navigation behavior is not explicit.

## Implementation Steps

### Step 1: Define Navigation Model

Decide on navigation strategy:
- **Option A (Forward-only):** User can refine at current phase but cannot go back
  - Pros: Simpler state management, fewer edge cases
  - Cons: User can't easily change Phase 1 after seeing Phase 2
- **Option B (Full backward navigation):** User can go back to any prior phase
  - Pros: Flexible, better UX
  - Cons: Complex state rollback, potential confusion

Recommendation: **Option A (Forward-only)** — simpler, less confusion

### Step 2: Define State Management Rules

For chosen navigation model:

**Forward-only (Option A):**
- User can refine at Phase 1 checkpoint:
  - Choose "Yes, proceed" → continue to Phase 2
  - Choose "Adjust context" → re-run Phase 1 with refined input, then auto-proceed to Phase 2
  - Choose "Cancel planning" → exit, no plan created
- User cannot go back from Phase 2/3/4 to Phase 1
- If user wants to change Phase 1 after Phase 2:
  - Exit current planning (`Ctrl+C` or "Cancel")
  - Run `/pwrl-plan` again with refined input
  - Start fresh from Phase 1

### Step 3: Add Navigation Model Section to Agent

Modify `agents/pwrl-planner.agent.md`:

Add new section after "State Management":

```markdown
## Navigation Model

### Forward-Only Design

This agent uses a **forward-only navigation** model:

- **At each checkpoint**, user can:
  - ✅ Yes, proceed to next phase
  - ✅ Refine current phase (go back within phase, not to prior phase)
  - ✅ Cancel planning (exit entire workflow)
- **Cannot go backward** from Phase 2 → Phase 1, Phase 3 → Phase 2, etc.
- **Rationale:** Keeps state linear, prevents complex rollback logic, simpler UX

### What Happens When User Refines?

**Example: User adjusts scope at Phase 1 checkpoint**
```
Phase 1: Scope Gathering
  [Scoped context displayed]
  Ready to proceed? (yes/refine/cancel)
  → User chooses "refine"
  
Phase 1 (retry): Scope Gathering
  [Re-run Phase 1 with refined input]
  [New scoped context generated]
  Ready to proceed? (yes/refine/cancel)
  → User chooses "yes"
  
Phase 2: Research & Findings [continues with NEW scope]
  [Prior Phase 2 state discarded if it existed]
```

### What If User Needs to Change Phase 1 After Phase 2?

```
Example: User realizes they missed a requirement after seeing research findings

Option 1: Exit and restart
  Phase 2 checkpoint: (user frustrated about scope)
  → Choose "Cancel planning"
  → Exit agent
  → Run /pwrl-plan "Plan something" [with refined input]
  → Start fresh from Phase 1

Option 2: Continue with current scope
  → Accept research findings despite imperfect scope
  → Complete Phase 3 and 4
  → Create learning gap: "Scope gathering needs [specific refinement]"
  → After implementation: Document learning via /pwrl-learnings
  → Next time, run planning with better scope understanding
```

### Checkpoint Decision Tree

```
At each checkpoint, user chooses:

Phase 1: Scope Gathering
  ├─ Yes, proceed to Phase 2
  ├─ Refine scope [Phase 1 re-runs]
  └─ Cancel planning [exit]

Phase 2: Research & Findings
  ├─ Yes, proceed to Phase 3
  ├─ Additional research [optional research step added]
  └─ Cancel planning [exit]

Phase 3: Design & Implementation Units
  ├─ Yes, proceed to Phase 4
  ├─ Adjust units [Phase 3 re-runs with same scope/research]
  └─ Cancel planning [exit]

Phase 4: Plan Generation
  ├─ Save plan [success, exit]
  ├─ Edit sections [iterate on specific sections]
  └─ Cancel planning [discard]
```

### State Rollback Rules

```
If user refines at a checkpoint:

Scenario 1: Refine Phase 1
  → Phase 1 state reset
  → Phase 2-4 state discarded (if they existed)
  → Workflow continues from Phase 1

Scenario 2: Refine Phase 2
  → Phase 2 state reset
  → Phase 3-4 state discarded (if they existed)
  → Workflow continues from Phase 2

Scenario 3: Refine Phase 3
  → Phase 3 state reset
  → Phase 4 state discarded (if it exists)
  → Workflow continues from Phase 3

Scenario 4: Edit Phase 4 (no rollback)
  → User can edit specific sections in preview
  → No state rollback needed
  → Plan saved when user confirms
```
```

### Step 4: Add Examples

Add examples showing navigation in action:

```markdown
## Navigation Examples

### Example 1: Smooth Forward Flow (No Adjustments)

```
/pwrl-plan "Create email notification system"
✅ Phase 1 complete. Proceed to Phase 2? → Yes
✅ Phase 2 complete. Proceed to Phase 3? → Yes
✅ Phase 3 complete. Proceed to Phase 4? → Yes
✅ Phase 4: Plan preview
   Ready to save? → Yes
✅ Plan saved: docs/plans/2026-06-10-001-create-email-notification.md
```

### Example 2: Refinement Within Phase (Go Back Within Phase)

```
/pwrl-plan "Create email notification system"
✅ Phase 1 complete. Scoped context:
   Problem: Create email notification system...
   Domain: software
   ...
   Ready to proceed? → Refine

Phase 1 (retry): Let's refine the scope
  What should we clarify? → User adjusts domain validation, success criteria
  
✅ Phase 1 (refined) complete. Proceed to Phase 2? → Yes
✅ Phase 2 complete. Proceed to Phase 3? → Yes
...
```

### Example 3: User Exits Mid-Workflow

```
/pwrl-plan "Create email notification system"
✅ Phase 1 complete. Proceed to Phase 2? → Yes
✅ Phase 2 complete. Proceed to Phase 3? → Yes
Phase 3: Design & Implementation Units
  [User realizes they need to reconsider Phase 1 scope]
  Ready to proceed? → Cancel

Planning cancelled. No plan was created.

[Later: User runs planning again with refined input]
/pwrl-plan "Create email notification system (with auth requirements)..."
✅ Phase 1 (fresh) complete...
```
```

## Edge Cases

1. **User adjusts same checkpoint twice**
   - Allowed; each adjustment re-runs that phase
2. **User exits after Phase 3 without generating plan**
   - Allowed; state files saved in .scope/.research/.design/ for debugging
   - User can continue planning later if needed

## Testing

- [ ] Smooth forward flow tested (no adjustments)
- [ ] Phase 1 refinement tested (scope changed, continues to Phase 2)
- [ ] Phase 2 additional research tested
- [ ] Phase 3 adjustment tested (units refined)
- [ ] Exit mid-workflow tested (no plan created)
- [ ] Re-run after exit tested (fresh state)

## Acceptance Criteria

✅ Navigation model documented (forward-only chosen)  
✅ State management rules clear for each phase  
✅ Checkpoint decision tree added  
✅ State rollback rules documented  
✅ Examples show forward-only navigation  
✅ Users understand how to adjust scope/research/units  
✅ No confusion about "going back" (not supported)  

## References

- Current agent: agents/pwrl-planner.agent.md
- Phase checkpoint logic: agents/pwrl-planner.agent.md (Phase 1-4 sections)
