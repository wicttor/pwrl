# Edge Cases — Design Phase

This file documents seven edge cases encountered during the design phase (S4) and recommended handling for each.

## Edge Case 1: Non-Software Domain

**Condition:** The task domain is `non-software` (e.g., organizational planning, event planning).

**Handling:**
1. Note that units will be generic, not code-focused
2. Skip file-related fields (Create, Modify, Test files)
3. Use generic fields instead:
   - **Stakeholders Involved:** Who needs to participate
   - **Resources:** People, budget, tools needed
   - **Timeline:** Duration estimate
4. Complexity hint: Typically `fast` for non-software work (simpler decomposition)
5. Skip Mermaid diagram (not applicable for non-code work)
6. Proceed normally with Step 4 (Create Each Unit) using adapted approach

**Example non-software unit:**
```
U1: Stakeholder Alignment
- Scope: Gather requirements from key stakeholders
- Stakeholders: Product, Engineering, Design leads
- Resources: 2 hours meeting time
- Approach: 1:1 interviews followed by group discussion
- Acceptance Criteria:
  - All stakeholders aligned on priorities
  - Risk factors documented
```

---

## Edge Case 2: User Wants Fewer/More Units Than Estimated

**Condition:** User requests unit count adjustment after initial estimation in Step 2.

**Handling:**
1. Adjust flexibly; re-present the adjusted scope for confirmation
2. If user wants many fewer units (1-2 instead of 8+):
   - Combine units; each unit covers broader scope
   - Ensure each unit still has clear acceptance criteria
   - Complexity hint will be `fast` (fewer units = simpler)
3. If user wants many more units (20+ instead of estimated count):
   - Offer to split into sub-plans (multiple plans)
   - Ask: "This looks like multiple planning projects. Should we split this into sub-plans?"
   - If yes: Create separate plans for each sub-project
   - If no: Proceed with large unit count but note complexity

**Example dialogue:**
```
You: "Based on the scope, I estimate 6-8 units."
User: "That seems too many; can we do 3 big units?"
You: "Sure. That means each unit covers more scope. Let's combine related work..."
```

---

## Edge Case 3: Unit Deleted — ID Retired

**Condition:** User removes a unit during definition (e.g., deletes U2).

**Handling:**
1. Retire the U-ID; do NOT renumber remaining units
2. Present updated list: "U1, U3, U4, U5 (U2 retired)"
3. If user adds a new unit: Assign next available ID (U6, not U2)
4. Document in output: "U2 was deleted — ID retired (never reassigned)"
5. Include retirement note in Mermaid diagram or unit list

**For details on U-ID stability rules, see [u-id-generator.md](u-id-generator.md)**

---

## Edge Case 4: Circular Dependencies

**Condition:** After all units are defined, the dependency graph has a cycle (e.g., U3 → U4 → U3).

**Handling:**
1. Detect cycles after Step 5 (Assign Dependencies)
2. Explain the cycle to user: "U3 depends on U4 while U4 depends on U3. This creates a cycle."
3. Ask user: "Can you break this cycle by choosing one direction? (U3 → U4, or U4 → U3)"
4. Options:
   - Remove the dependency in one direction
   - Merge the two units (U3 + U4 into U3)
   - Add a third unit that breaks the cycle
5. Iterate until dependency graph is a DAG (directed acyclic graph)

**Prevention:** Prompt during Step 4 to ensure dependencies follow logical order.

---

## Edge Case 5: User Unsure About Approach for a Unit

**Condition:** When defining a unit's approach (Step 4), user is uncertain about technical direction.

**Handling:**
1. Offer to add a "Research Note" or "Spike Required" marker:
   ```
   U4: Data Migration
   - Scope: Migrate 100M records from old to new schema
   - Approach: TBD — spike research needed on performance optimization
   - Research Note: Determine optimal batch size and parallel processing strategy
   ```
2. Suggest revisiting the approach during implementation
3. Add a learning gap: "Document optimal migration strategy via /pwrl-learnings"
4. Mark unit with ⚠️ symbol or "requires investigation" label
5. Pass to downstream skills with this caveat

---

## Edge Case 6: Very Large Plan (16+ Units)

**Condition:** Decomposition results in 16 or more units, making the plan overwhelming.

**Handling:**
1. Suggest splitting into sub-plans:
   ```
   "This effort has 18 units across multiple systems. Should we create separate plans for:
    - Plan A: User service integration (U1-U6)
    - Plan B: Payment system overhaul (U7-U12)
    - Plan C: Monitoring and ops (U13-U18)?"
   ```
2. If user agrees:
   - Create separate design phases for each sub-plan
   - Document relationships between plans
   - Use parent/child naming: "2026-06-05-001-auth-plan" (parent) and "2026-06-05-001-auth-login-subplan" (child)
3. If user declines:
   - Proceed with large plan
   - Add a note: "Large plan (18 units); consider phasing during implementation"
   - Group units by theme in presentation for clarity

---

## Edge Case 7: User Declines Mermaid Diagram

**Condition:** User is asked in Step 7 whether to generate a Mermaid diagram and declines.

**Handling:**
1. Proceed without diagram
2. Set `diagram: null` or `diagram: declined` in output
3. Offer alternative: "Would a textual description of the workflow be helpful instead?"
4. If yes: Provide ASCII text representation of unit flow:
   ```
   U1 (Create schema)
     ↓
   U2 (Add validation) → U3 (Build API)
     ↓                    ↓
   U4 (Write tests) ← ← ←
   ```
5. If no: Proceed to Step 8 (Confirm) without additional visualization

---

## Summary

| Edge Case                        | Key Decision                           | Blocker? |
| -------------------------------- | -------------------------------------- | -------- |
| Non-software domain              | Adapt approach; use generic fields     | No       |
| User wants more/fewer units      | Adjust scope and re-present            | No       |
| Unit deleted — ID retired        | Retire U-ID; don't reassign            | No       |
| Circular dependencies            | Break cycle or merge units             | Yes*     |
| User unsure about approach       | Add research note; mark as TBD         | No       |
| Very large plan (16+ units)      | Suggest sub-plans or note for phasing  | No       |
| User declines diagram            | Offer textual alternative              | No       |

*Circular dependencies are a blocker until resolved; cannot proceed to Step 8 with cycles present.

---

## Integration Notes

- These edge cases are part of the design workflow (S4 in `pwrl-plan-design/SKILL.md`)
- Edge case decisions are documented in the Implementation Units object
- Units (including edge case notes) are passed to S5 (generate)
