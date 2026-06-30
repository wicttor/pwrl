# Mode Detection Algorithm (pwrl-work-prepare)

Reference for `pwrl-work-prepare` Step 3 (Detect Execution Mode). This file holds the detailed state-machine validation, the decision tree, and the topological-sort algorithm that the SKILL.md references. Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

## Task Status State Machine & Validation

Before detecting mode, validate task status transitions:

```
State Diagram:
  to-do → in-progress → for-review → done
    ↑                                    │
    └────────────── blocked ◄────────────┘
```

### Transition Validation Rules

- Can't mark `done` if any dependencies not `done` → Error: "Cannot mark done: S2 still in-progress"
- Can't mark `in-progress` if already `for-review` → Error: "Review must complete before re-entering in-progress"
- Idempotent transitions allowed (stay in same state)
- Global unit-id uniqueness: Error if same unit-id in multiple plans

### Validation pseudocode

```
validateTransition(taskId, newStatus):
  currentStatus = taskCurrentStatus(taskId)

  if currentStatus == newStatus:
    return OK  # Idempotent

  # Get dependencies from globalDependencyGraph
  deps = graph.getDependencies(taskId)

  if newStatus == "done":
    for dep in deps:
      if dep.status != "done" and dep.status != "for-review":
        return ERROR("Cannot mark done: {dep.unit-id} still {dep.status}")

  return OK
```

### Apply to all tasks in taskList

1. For each task, validate its status transition
2. If any validation fails, report error with task ID and reason
3. Ask user: "Resolve status issues and retry?"

---

## Automatic Mode Selection

Apply automatic mode selection based on task count, dependencies, and file conflicts.

### Decision tree (updated for cross-plan)

```
taskCount = number of tasks in taskList

if taskCount <= 2:
    → INLINE (direct execution, no subagents needed)

if taskCount >= 3:
    → Check dependency graph (including cross-plan edges)
    → Build file-to-task map from each task's `files` field
    → Detect any file conflicts (same file touched by 2+ tasks)

    if any dependencies exist between tasks:
        IF critical path spans multiple plans:
            → SERIAL (forced; need sync points between groups)
        ELSE:
            → Check for file conflicts
            if file conflicts detected:
                → SERIAL (forced; parallel would create race conditions)
            else:
                → PARALLEL with topological grouping (see step 5 below)
    else if any file conflicts detected:
        → SERIAL (forced; parallel would create race conditions)
    else:
        → PARALLEL (independent tasks with no file overlap; use parallelization groups)
```

### File conflict detection heuristic

1. Collect all file paths from each task's `files` field
2. Create a map: file → [taskId1, taskId2, ...]
3. If any file appears in more than one task's files → conflict
4. Document all conflicting files and tasks

### Critical path analysis for cross-plan

1. Find longest dependency chain in globalDependencyGraph
2. If chain includes tasks from multiple plans → critical path spans plans
3. Set flag: `criticalPathMultiPlan: true/false`

### Parallel execution constraints

- Only targeted tests run during implementation (not full suite)
- Staging and committing deferred to review phase
- Results aggregated before final quality gates
- **NEW**: For cross-plan parallel: sync points between groups (see step 5)

---

## Topological Sort with Parallelization Groups (when parallel mode selected)

**Purpose**: Generate task parallelization clusters for parallel/cross-plan execution.

### Algorithm (Modified Kahn's Topological Sort)

```pseudocode
topologicalSortWithGroups(tasks, dependencies):
  inDegree = computeInDegrees(tasks, dependencies)
  groups = []
  current_group = []

  while tasks_remaining:
    # Find all tasks with inDegree == 0 (no remaining dependencies)
    ready_tasks = [t for t in tasks if inDegree[t] == 0]

    if NOT ready_tasks:
      return ERROR("Circular dependency detected")

    # Check for file conflicts within ready_tasks
    for task in ready_tasks:
      # If task conflicts with any already in current_group, start new group
      if hasFileConflict(task, current_group):
        if current_group:
          groups.append(current_group)
        current_group = [task]
      else:
        current_group.append(task)

    # Move to next level
    for task in ready_tasks:
      inDegree[task] = -1  # Mark as processed
      for dependent in dependencies[task]:
        inDegree[dependent] -= 1

  if current_group:
    groups.append(current_group)

  return { parallelGroups: groups, syncPoints: [after-group-N for N in 1..len(groups)] }
```

### Output format

```yaml
parallelGroups:
  - group: 0
    tasks: [S1, U1, U2] # These can run parallel (no file conflicts)
    duration_estimate: "5 min"
  - group: 1
    tasks: [S2, U3] # Depends on group 0; can run parallel within group
    duration_estimate: "3 min"
  - group: 2
    tasks: [S3] # Single task
    duration_estimate: "2 min"

syncPoints:
  - syncPoint: 0
    after_group: 0
    validation: "No file conflicts; commit atomically"
  - syncPoint: 1
    after_group: 1
    validation: "No file conflicts; commit atomically"

execution_strategy: "Parallel within groups; serial between groups; atomic commits per sync point"
cross_plan_groups:
  { group_0: ["plan-A", "plan-B"], group_1: ["plan-A"], group_2: ["plan-A"] }
```
