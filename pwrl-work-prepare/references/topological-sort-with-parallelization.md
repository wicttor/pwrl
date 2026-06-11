# Topological Sort with Parallelization Groups

## Purpose

Generate task execution groups that maximize parallelization while respecting dependencies and file conflicts. Each group contains independent tasks that can run in parallel; groups must execute sequentially with sync points between them.

## Algorithm: Modified Kahn's Topological Sort

### Overview

Standard topological sort produces a linear ordering. This variant produces groups:

```
Standard: [T1, T2, T3, T4, T5] (all sequential)

Modified: [
  Group 0: [T1, T2],      # Can run in parallel (no deps, no conflicts)
  Group 1: [T3, T4],      # Depends on Group 0; can parallelize within group
  Group 2: [T5]           # Depends on Group 1; single task
]
```

### Pseudocode

```pseudocode
topologicalSortWithGroups(tasks, dependencies, fileConflicts):
  inDegree = computeInDegrees(tasks, dependencies)
  groups = []

  while remainingTasks > 0:
    # Find all tasks with inDegree == 0 (ready to execute)
    readyTasks = [t for t in tasks if inDegree[t] == 0 and not processed[t]]

    if NOT readyTasks:
      return ERROR("Circular dependency or all tasks processed")

    # Build current group: add ready tasks that don't conflict
    currentGroup = []
    for task in readyTasks:
      canAdd = true

      # Check for file conflicts with tasks already in group
      for existingTask in currentGroup:
        if hasFileConflict(task, existingTask, fileConflicts):
          canAdd = false
          break

      if canAdd:
        currentGroup.append(task)

    # Add group to result
    groups.append(currentGroup)

    # Update inDegree for next iteration
    for task in currentGroup:
      processed[task] = true
      for dependent in getDependents(task, dependencies):
        inDegree[dependent] -= 1

  return {
    parallelGroups: groups,
    syncPoints: [0, 1, 2, ...],  # One per group
    totalGroups: len(groups)
  }
```

### Detailed Steps

#### Step 1: Compute In-Degrees

```pseudocode
computeInDegrees(tasks, dependencies):
  inDegree = {}
  for task in tasks:
    inDegree[task] = count(dependencies where dep -> task)
  return inDegree
```

**Example:**

```
Dependencies: S1→S2, S1→U1, U1→U2
inDegree: {
  S1: 0,  # No dependencies
  S2: 1,  # S1 depends on it
  U1: 1,  # S1 depends on it
  U2: 1   # U1 depends on it
}
```

#### Step 2: Identify Ready Tasks (inDegree == 0)

```pseudocode
readyTasks = [t for t in tasks if inDegree[t] == 0 and not processed[t]]
```

**Initial iteration:**

```
tasks: [S1, S2, U1, U2]
inDegree: {S1: 0, S2: 1, U1: 1, U2: 1}
readyTasks: [S1]  # Only S1 has inDegree 0
```

#### Step 3: Detect File Conflicts

```pseudocode
hasFileConflict(task1, task2, fileConflicts):
  files1 = fileConflicts[task1]
  files2 = fileConflicts[task2]
  intersection = files1 ∩ files2
  return len(intersection) > 0
```

**Example:**

```
fileConflicts: {
  S1: [src/api.ts, src/routes.ts],
  S2: [src/api.ts, src/types.ts],
  U1: [src/ui.ts],
  U2: [src/state.ts]
}

hasFileConflict(S1, S2): true   # Both modify src/api.ts
hasFileConflict(S1, U1): false  # No overlap
hasFileConflict(U1, U2): false  # No overlap
```

#### Step 4: Build Current Group

```pseudocode
currentGroup = []
for task in readyTasks:
  canAdd = not any(hasFileConflict(task, t) for t in currentGroup)
  if canAdd:
    currentGroup.append(task)
```

**Example:**

```
readyTasks: [S1, U1, U2]  (all have inDegree 0 in iteration 2)

Attempt to add S1:
  currentGroup = []
  canAdd(S1) = true (no conflicts with empty group)
  currentGroup = [S1]

Attempt to add U1:
  canAdd(U1) = not hasFileConflict(U1, S1) = not false = true
  currentGroup = [S1, U1]

Attempt to add U2:
  canAdd(U2) = not (hasFileConflict(U2, S1) or hasFileConflict(U2, U1))
             = not (false or false) = true
  currentGroup = [S1, U1, U2]

Result: Group 1 = [S1, U1, U2]
```

#### Step 5: Update In-Degrees

```pseudocode
for task in currentGroup:
  processed[task] = true
  for dependent in getDependents(task, dependencies):
    inDegree[dependent] -= 1
```

**Example:**

```
currentGroup: [S1]
getDependents(S1): [S2, U1]

inDegree[S2] -= 1  # was 1, now 0
inDegree[U1] -= 1  # was 1, now 0

Next iteration, readyTasks: [S2, U1]
```

### Full Example Execution

**Input:**

```
tasks: [S1, S2, U1, U2, S3]
dependencies: S1→S2, S1→U1, U1→U2, S2→S3
fileConflicts: {
  S1: [src/api.ts],
  S2: [src/utils.ts],
  U1: [src/ui.ts],
  U2: [src/state.ts],
  S3: [src/app.ts]
}
```

**Execution:**

```
Iteration 1:
  inDegree: {S1: 0, S2: 1, U1: 1, U2: 1, S3: 1}
  readyTasks: [S1]
  currentGroup = [S1]
  groups = [[S1]]

  Update: inDegree[S2] = 0, inDegree[U1] = 0

Iteration 2:
  inDegree: {S2: 0, U1: 0, U2: 1, S3: 1}
  readyTasks: [S2, U1]

  Build group:
    Add S2: canAdd = true, currentGroup = [S2]
    Add U1: canAdd = true (no conflict S2 ↔ U1), currentGroup = [S2, U1]

  currentGroup = [S2, U1]
  groups = [[S1], [S2, U1]]

  Update: inDegree[S3] = 0, inDegree[U2] = 0

Iteration 3:
  inDegree: {S3: 0, U2: 0}
  readyTasks: [S3, U2]

  Build group:
    Add S3: canAdd = true, currentGroup = [S3]
    Add U2: canAdd = true (no conflict), currentGroup = [S3, U2]

  currentGroup = [S3, U2]
  groups = [[S1], [S2, U1], [S3, U2]]

  Update: all processed

Result:
  parallelGroups: [[S1], [S2, U1], [S3, U2]]
  syncPoints: [0, 1, 2]
  execution_order: "S1 → {S2, U1} → {S3, U2}"
```

**Execution Timeline:**

```
Time:   0s    5s   10s   15s   20s
       S1 ───S1
             ├─ S2────────S2
             └─ U1────────U1
                    ├─ S3────────S3
                    └─ U2────────U2
Sync:  │     │         │           │
       0     1         2           done
```

## Output Format

```yaml
parallelGroups:
  - groupId: 0
    tasks: [S1]
    duration_estimate: "5 min"

  - groupId: 1
    tasks: [S2, U1]
    duration_estimate: "8 min"

  - groupId: 2
    tasks: [S3, U2]
    duration_estimate: "6 min"

syncPoints:
  - syncPointId: 0
    afterGroup: 0
    validation: "File conflicts check"

  - syncPointId: 1
    afterGroup: 1
    validation: "File conflicts check"

  - syncPointId: 2
    afterGroup: 2
    validation: "Final commit"

executionStrategy: "Parallel within groups; atomic commits per sync point"
totalGroups: 3
estimatedTotalTime: "19 min (5 + 8 + 6)"
```

## Edge Cases

| Case                            | Handling                                      |
| ------------------------------- | --------------------------------------------- |
| Circular dependency             | Return ERROR before grouping                  |
| Single task                     | Groups = [[task]]                             |
| All independent tasks           | Groups = [[all tasks]] (single group)         |
| Chain dependencies              | Groups = [[T1], [T2], [T3], ...] (sequential) |
| File conflict prevents grouping | Force into separate groups                    |
| Empty task list                 | Return empty groups                           |
| Task with self-loop             | ERROR: Circular dependency                    |

## Performance

- **Time**: O(V + E + C) where V=tasks, E=dependencies, C=file conflict checks
- **Space**: O(V + E)
- **Practical**: <100ms for 100+ tasks

## Testing

Test scenarios and expected outputs are defined in test cases within the pwrl project's test suite.
