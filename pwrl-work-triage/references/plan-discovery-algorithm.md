# Plan Discovery Algorithm

## Purpose

Scan the workspace for all active plans, extract task dependencies, and build a global dependency graph that enables cross-plan task coordination.

## Algorithm Overview

```pseudocode
discoverPlans():
  plans = []
  unitIdMap = {}  # unit-id -> plan-file, for duplicate detection
  globalGraph = {}  # unit-id -> [dependencies]

  # Step 1: Scan for all plans
  for planFile in glob("docs/plans/*.md"):
    if planFile.contains("id:", "status:", "tier:"):  # Is a plan, not intermediate
      plans.append(planFile)

  # Step 2: Extract units from each plan
  for plan in plans:
    units = extractUnits(plan)  # Parse plan body for U-ID headers

    for unit in units:
      unitId = unit.id

      # Check for global duplicates
      if unitId in unitIdMap:
        previousPlan = unitIdMap[unitId]
        ERROR("Duplicate unit-id: {unitId} found in {plan} and {previousPlan}")
        return FAILURE

      unitIdMap[unitId] = plan

      # Extract dependencies for this unit
      deps = unit.dependencies  # From plan's dependency list
      globalGraph[unitId] = deps

  # Step 3: Annotate cross-plan edges
  crossPlanEdges = []
  for unitId, deps in globalGraph.items():
    for dep in deps:
      if unitIdMap[dep] != unitIdMap[unitId]:
        # This is a cross-plan edge
        fromPlan = unitIdMap[unitId]
        toPlan = unitIdMap[dep]
        crossPlanEdges.append({
          from: unitId,
          fromPlan: fromPlan,
          to: dep,
          toPlan: toPlan
        })

  return {
    plans: plans,
    globalGraph: globalGraph,
    unitIdMap: unitIdMap,
    crossPlanEdges: crossPlanEdges,
    planCount: len(plans),
    unitCount: len(unitIdMap),
    crossPlanEdgeCount: len(crossPlanEdges)
  }
```

## Implementation Details

### Plan File Detection

**Criteria for active plan:**

- File path matches `docs/plans/*.md` (not in `.scope/`, `.research/`, `.design/`, `.archive/`)
- Contains frontmatter with `id:`, `status:`, `tier:` fields
- Status is not "archived"

**Exclude:**

- Intermediate files (in `.scope/`, `.research/`, `.design/` directories)
- Archived files (status: "archived")
- Non-markdown files

### Unit Extraction

**Parse each plan to extract units:**

1. Read plan body (markdown content, not frontmatter)
2. Search for unit headers (regex: `^### (U\d+|S\d+)|^## .*`)
3. For each unit, extract:
   - `unit-id` (e.g., "U1", "S2")
   - `dependencies` (field in unit scope or inferred from text)
   - `files` (list of files affected)
   - `approach` (brief description)

### Cross-Plan Edge Annotation

**Example:**

```
Plan A (file: docs/plans/2026-06-05-001-backend.md):
  Unit S1: Input Validation
    Dependencies: []

Plan B (file: docs/plans/2026-06-05-002-frontend.md):
  Unit U1: API Integration
    Dependencies: [S1]  # Cross-plan dependency on S1 from Plan A
```

**Annotation result:**

```
crossPlanEdges: [
  {
    from: "U1",
    fromPlan: "docs/plans/2026-06-05-002-frontend.md",
    to: "S1",
    toPlan: "docs/plans/2026-06-05-001-backend.md"
  }
]
```

## Error Handling

| Scenario                                   | Action                                         |
| ------------------------------------------ | ---------------------------------------------- |
| Duplicate unit-id across plans             | ERROR: Report duplicate; request resolution    |
| Circular dependency detected               | ERROR: Report cycle path; request resolution   |
| Plan file missing/unreadable               | WARN: Skip plan; continue with others          |
| Invalid frontmatter                        | WARN: Skip plan; continue with others          |
| No plans found                             | OK: Return empty graph                         |
| Missing dependency (target unit not found) | ERROR: Dangling dependency; request resolution |

## Performance Considerations

- **Glob operation**: O(n) where n = number of files in docs/plans/
- **Plan parsing**: O(m) per plan where m = lines in plan
- **Cycle detection**: O(V + E) DFS where V = units, E = dependencies
- **Overall**: O(n·m + V + E), acceptable for typical workspace sizes

## Testing

### Test Cases

1. **Single plan, no cross-plan deps** → Returns plan with local graph only
2. **Two plans, no cross-plan deps** → Returns both plans; globalGraph is union of local graphs
3. **Two plans, one cross-plan dep (A→B)** → crossPlanEdges contains A→B annotation
4. **Two plans, circular cross-plan (A→B→A)** → ERROR: Circular dependency detected
5. **Duplicate unit-id (S1 in both plans)** → ERROR: Duplicate unit-id
6. **Empty workspace (no plans)** → Returns empty graph gracefully
7. **Plan with missing target dependency** → ERROR: Dangling dependency

### Example Execution

```
Input: Workspace with 3 plans (A, B, C)
  A: units [S1, S2]
  B: units [U1, U2], U1 depends on S1 (cross-plan)
  C: units [T1], T1 depends on U1 (cross-plan)

Output:
  plans: 3
  units: 6
  globalGraph: {
    S1: [], S2: [], U1: [S1], U2: [], T1: [U1]
  }
  crossPlanEdges: [
    {from: U1, fromPlan: B, to: S1, toPlan: A},
    {from: T1, fromPlan: C, to: U1, toPlan: B}
  ]

Result: Multi-plan dependency chain: S1 (A) → U1 (B) → T1 (C)
```
