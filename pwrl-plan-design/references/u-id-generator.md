# U-ID Generator — Implementation & Stability Rules

This file documents the Unit Identification (U-ID) system used in implementation design, including the generator implementation pattern and stability rules that prevent U-ID churn.

## U-ID System Overview

Each implementation unit receives a stable, sequential identifier: U1, U2, U3, ..., UX.

**Key principle:** Once assigned, a U-ID never changes or is reused, even if a unit is deleted. This stability allows teams to reference units consistently throughout the planning and implementation process (e.g., "Based on the plan, we need to fix U7").

## Implementation Pattern

### Initialize Generator

```javascript
current_id = 1
retired_ids = []  // Track deleted units
active_units = []  // Map of U-ID → Unit object
```

### Assign New Unit ID

```javascript
function assign_unit_id() {
  const id = "U" + current_id
  current_id++
  return id
}
```

### Delete Unit (Retire ID)

```javascript
function retire_unit_id(u_id) {
  const unit_number = parseInt(u_id.substring(1))
  retired_ids.push(unit_number)
  active_units.delete(u_id)

  // Log for audit trail
  console.log(`Retired ${u_id} — ID will never be reassigned`)
}
```

### Final Unit List

After all units are defined and some may be deleted, the final list might look like:

```
U1 — Create database schema
U2 — (RETIRED — was deleted)
U3 — Add authentication layer
U4 — Build API endpoints
U5 — Write tests
U6 — (RETIRED — merged into U5)
```

The final plan shows: U1, U3, U4, U5 (not U1, U2, U3, U4).

## Stability Rules

### Rule 1: Sequential Assignment

- Always assign U-IDs in sequential order: U1, U2, U3, ...
- Never skip numbers or assign out of order
- Current ID always increments, never decrements

### Rule 2: Never Reassign Retired IDs

Once a U-ID is retired (unit deleted), it can NEVER be reassigned to another unit:

**WRONG:**
```
U1 — Create schema
U2 — Add auth (DELETED)
U2 — Build API (NEW)  ← WRONG! U2 is retired
```

**CORRECT:**
```
U1 — Create schema
U3 — Build API (NEW)  ← Correct; next available ID
```

### Rule 3: Immutability After Confirmation

Once a unit is confirmed in the plan (Step 8: Present and Confirm), its U-ID is immutable:

- Before confirmation: Unit can be added, removed, or renumbered if needed
- After confirmation: Unit cannot be removed (if needed, must create a new plan or amendment)

**Rationale:** Once teams begin implementation based on a confirmed plan, changing U-IDs breaks all team communications about work ("We're on U7").

### Rule 4: Audit Trail

Every retirement must be logged with:
- **U-ID:** The retired identifier
- **Reason:** Why it was retired (deleted, merged with another, etc.)
- **Date:** When it was retired
- **Plan version:** Which plan version it applies to

**Example:**
```
## Unit Retirement Log
- U2: Deleted (duplicate of U1) — 2026-06-05
- U6: Merged into U5 — 2026-06-05
```

### Rule 5: Cross-Plan Uniqueness

Within a single date/plan, U-IDs are unique. Across multiple plans (or on different dates), U-IDs may repeat (e.g., another plan can also have U1, U2, U3).

## Edge Cases

### Case 1: Unit Deletion During Planning

**Scenario:** User deletes U3 during Step 4-8 (before confirmation).

**Handling:**
1. Remove the unit from the list
2. Mark U3 as retired
3. Do NOT renumber remaining units
4. Present to user: "U3 has been deleted. Remaining units are: U1, U2, U4, U5 (U3 is retired)"
5. If user adds new unit: Next ID is U6, not U3

### Case 2: Unit Merge

**Scenario:** User decides U3 and U4 should be combined into a single unit.

**Handling:**
1. Combine the scope, files, and criteria
2. Keep the lower ID (U3)
3. Retire the higher ID (U4)
4. Final units: U1, U2, U3, U5 (U4 is retired)
5. Document reason: "U4 merged into U3 — related work"

### Case 3: Unit Split (Advanced)

**Scenario:** User decides U5 is too large and should be split into two units.

**Handling:**
1. Keep U5 with reduced scope
2. Create a new unit with ID U{current_id++} (next available)
3. Do NOT use a retired ID or renumber
4. Example: U5 split into U5 (part 1) and U7 (part 2)
5. Rationale: Splitting units doesn't require retiring IDs; it just adds a new one

### Case 4: Major Plan Restructuring

**Scenario:** After presentation, user wants to completely restructure units (add, remove, reorder).

**Handling:**
1. If plan was already confirmed: Create a NEW plan (new scope-id, research-id, design-id)
2. Do NOT modify confirmed plan's U-IDs
3. New plan will have its own U-ID sequence (U1, U2, U3, etc.)
4. Document relationship: "Plan [NEW-ID] supersedes Plan [OLD-ID]"

## Best Practices

### Best Practice 1: Assign Early

Assign U-IDs as soon as each unit is defined (Step 4), not at the end. This prevents confusion and allows users to reference units by ID during planning.

### Best Practice 2: Use for Communication

Once assigned, use U-IDs consistently in all documentation:
- "U3 depends on U1 and U2"
- "Implementation team will start with U1 and U2 in parallel"
- "U5 is the highest-risk unit; needs senior review"

### Best Practice 3: Document Rationale

When retiring a U-ID, document why:
- ✅ "U4 retired — merged with U3 (related work)"
- ❌ "U4 deleted"

### Best Practice 4: Communicate Changes

If units are deleted or retired before confirmation, inform the team:
- "Updated plan structure: retired U4 (merged with U3). New sequence: U1, U2, U3, U5, U6"

## Integration Notes

- U-IDs are assigned during Step 3 of `pwrl-plan-design/SKILL.md`
- Units are presented and confirmed in Step 8
- U-IDs are passed to `pwrl-plan-generate` (S5) for rendering in the final plan
- U-IDs remain immutable throughout implementation
