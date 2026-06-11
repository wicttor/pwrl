# Circular Dependency Detection (Multi-Plan)

## Purpose

Detect cycles in the global dependency graph that spans multiple plans. Prevents impossible task orderings and catches errors early.

## Algorithm: Depth-First Search (DFS) with Cycle Detection

### High-Level Approach

```pseudocode
detectCycles(globalGraph):
  visited = {}      # unit-id -> UNVISITED | VISITING | VISITED
  recursionStack = {}  # unit-id -> position in call stack (for cycle path)

  for unitId in globalGraph.keys():
    if visited[unitId] == UNVISITED:
      cycle = dfs(unitId, globalGraph, visited, recursionStack, [])
      if cycle:
        return CYCLE_FOUND(cycle)

  return NO_CYCLES
```

### Detailed DFS Implementation

```pseudocode
dfs(currentUnit, graph, visited, recursionStack, path):
  # Mark as currently visiting
  visited[currentUnit] = VISITING
  recursionStack[currentUnit] = len(path)
  path.append(currentUnit)

  # Visit all dependencies
  for dependencyUnit in graph[currentUnit]:
    if visited[dependencyUnit] == UNVISITED:
      # Recurse into unvisited dependency
      cycle = dfs(dependencyUnit, graph, visited, recursionStack, path)
      if cycle:
        return cycle

    else if visited[dependencyUnit] == VISITING:
      # Back edge found! Cycle detected
      cycleStartIndex = recursionStack[dependencyUnit]
      cyclePath = path[cycleStartIndex:] + [dependencyUnit]
      return CYCLE_DETECTED(cyclePath)

  # Mark as fully visited
  visited[currentUnit] = VISITED
  path.pop()
  return NO_CYCLE
```

### Time Complexity

- **Worst case**: O(V + E) where V = units, E = dependencies
- **Space**: O(V) for recursion stack
- **Acceptable for**: 1000+ units with complex dependency graphs

## Cycle Detection Examples

### Example 1: Simple Cycle (within single plan)

```
Graph:
  S1 → S2
  S2 → S3
  S3 → S1  (cycle!)

Execution:
  dfs(S1, ..., [])
    path = [S1], visit S1 dependencies
    dfs(S2, ..., [S1])
      path = [S1, S2], visit S2 dependencies
      dfs(S3, ..., [S1, S2])
        path = [S1, S2, S3], visit S3 dependencies
        S1 is VISITING (back edge found!)
        → CYCLE: S1 → S2 → S3 → S1

Output: ERROR "Circular dependency: S1 → S2 → S3 → S1"
```

### Example 2: Cross-Plan Cycle

```
Plan A:  S1 → S2
Plan B:  U1 → U2
Cross:   S2 → U1, U2 → S1

Execution:
  dfs(S1, ..., [])
    path = [S1], visit S1 dependencies
    dfs(S2, ..., [S1])
      path = [S1, S2], visit S2 dependencies
      dfs(U1, ..., [S1, S2])  # Cross-plan
        path = [S1, S2, U1], visit U1 dependencies
        dfs(U2, ..., [S1, S2, U1])
          path = [S1, S2, U1, U2], visit U2 dependencies
          S1 is VISITING (back edge!)
          → CYCLE: S1 → S2 → U1 → U2 → S1

Output: ERROR "Circular dependency: S1 (plan-A) → S2 (plan-A) → U1 (plan-B) → U2 (plan-B) → S1 (plan-A)"
```

### Example 3: No Cycle (valid multi-plan)

```
Plan A:  S1, S2
Plan B:  U1 → S1, U2 → U1
Plan C:  T1 → U2

Execution:
  dfs(S1, ..., [])
    path = [S1], no dependencies → mark VISITED
  dfs(S2, ..., [])
    path = [S2], no dependencies → mark VISITED
  dfs(U1, ..., [])
    path = [U1], visit dependencies
    dfs(S1, ..., [U1])
      S1 already VISITED → continue
    mark U1 as VISITED
  dfs(U2, ..., [])
    path = [U2], visit dependencies
    dfs(U1, ..., [U2])
      U1 already VISITED → continue
    mark U2 as VISITED
  dfs(T1, ..., [])
    path = [T1], visit dependencies
    dfs(U2, ..., [T1])
      U2 already VISITED → continue
    mark T1 as VISITED

Output: OK "No cycles detected"
```

## Error Reporting

### Cycle Error Message

When a cycle is detected, report:

```
ERROR: Circular dependency detected

Cycle path: S1 (plan-A) → S2 (plan-A) → U1 (plan-B) → U2 (plan-B) → S1 (plan-A)

Involved plans:
  - docs/plans/2026-06-05-001-backend.md (units: S1, S2)
  - docs/plans/2026-06-05-002-frontend.md (units: U1, U2)

Action: Resolve circular dependencies before execution. Options:
  1. Remove dependency from U2 → S1
  2. Split tasks to break the cycle
  3. Merge tasks in the cycle into single task

User prompt: "Resolve cycle and retry?"
```

## Performance Optimizations

### Memoization

Store results of DFS for each unit to avoid redundant traversals:

```
visitedCache = {}
cycle = dfs(unitId)
if unitId in visitedCache:
  return visitedCache[unitId]  # Return cached result
else:
  result = dfs(unitId, ...)
  visitedCache[unitId] = result
  return result
```

### Early Termination

Stop as soon as first cycle is detected; don't search for all cycles:

```
for unitId in graph.keys():
  cycle = dfs(unitId, ...)
  if cycle:
    return cycle  # Stop immediately
```

## Testing

| Case                     | Input                  | Expected Output             |
| ------------------------ | ---------------------- | --------------------------- |
| Simple cycle             | A→B→A                  | CYCLE: A→B→A                |
| Cross-plan cycle         | S1→U1→U2→S1            | CYCLE with plan annotations |
| Self-loop                | A→A                    | CYCLE: A→A                  |
| No cycle (chain)         | A→B→C                  | NO_CYCLE                    |
| No cycle (diamond)       | A→B, A→C, B→D, C→D     | NO_CYCLE                    |
| Empty graph              | {}                     | NO_CYCLE                    |
| Large graph (100+ units) | Complex dependency web | Completes in <100ms         |
