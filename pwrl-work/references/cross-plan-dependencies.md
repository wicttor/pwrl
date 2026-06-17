# Cross-Plan Dependencies: User Guide

## What Are Cross-Plan Dependencies?

In pwrl, a **cross-plan dependency** occurs when a task in one plan depends on a task in a different plan.

**Example:**

```
Plan A (Backend):
  S1: Implement user authentication API

Plan B (Frontend):
  U1: Login page (depends on S1 API)
```

When U1 executes, it must wait for S1 to complete first, even though they're in different plans.

## When to Use Cross-Plan Dependencies

### ✅ Good Use Cases

- **Frontend depends on backend**: UI tasks wait for API implementation
- **Infrastructure first**: Database schema defined before app code
- **Sequential feature rollout**: Phase 1 (backend) → Phase 2 (frontend) → Phase 3 (mobile)
- **Multi-team coordination**: Team A completes their plan, Team B starts theirs
- **Layered architecture**: Data layer → Service layer → UI layer

### ❌ Avoid These Patterns

- **Circular dependencies**: Don't create S1 → U1 → S1
- **Over-fragmented plans**: Consider merging tightly-coupled tasks
- **Unnecessary serialization**: If tasks are independent, don't create false dependencies
- **Mismatched scopes**: Dependency points should be at task level, not plan level

## How to Define Cross-Plan Dependencies

### Step 1: Identify Task Dependencies

When creating a task, list all its dependencies in the `dependencies` field:

```yaml
---
unit-id: U1
plan: docs/plans/2026-06-05-002-frontend.md
status: to-do
dependencies: [S1]  # U1 depends on S1 (from another plan)
files:
  - src/pages/login.tsx
  - src/api-client.ts
---

## Goal
Implement login page that calls the user authentication API

## Context
Task S1 (from backend plan) provides the authentication API endpoint.
This task builds the UI to consume that API.
```

**Key points:**

- Use unit-id format: `S1`, `U1`, `T1` (matches unit-id in other plan)
- Include unit-ids from other plans in `dependencies` list
- No plan-qualified format needed; pwrl discovers which plan each unit belongs to

### Step 2: Verify No Circular Dependencies

Before executing, pwrl automatically detects circular dependencies across all plans:

```
If you define:
  S1 → U1 → S1

pwrl will ERROR and prevent execution:
  "Circular dependency: S1 (plan-A) → U1 (plan-B) → S1 (plan-A)"
```

If this happens:

1. Review the dependencies
2. Remove the circular link
3. Retry

### Step 3: Set Up Plans

Ensure all referenced plans exist in `docs/plans/`:

```
docs/plans/
  ├─ 2026-06-05-001-backend-plan.md (contains S1, S2, S3)
  ├─ 2026-06-05-002-frontend-plan.md (contains U1, U2, U3)
  └─ 2026-06-05-003-database-plan.md (contains T1)
```

## Execution with Cross-Plan Dependencies

### Mode Selection

pwrl automatically chooses the best execution mode:

| Scenario                         | Mode                       | Behavior                                                            |
| -------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| **1–2 tasks**                    | INLINE                     | Direct execution; no special handling                               |
| **3+ tasks, no cross-plan deps** | SERIAL or PARALLEL         | Depending on file conflicts                                         |
| **3+ tasks, cross-plan deps**    | **PARALLEL (group-based)** | Parallelizes independent clusters; sequences across plan boundaries |

### Group-Based Execution (New!)

When you have cross-plan dependencies, pwrl organizes tasks into **groups**:

```
Example Setup:
  Plan A: S1 → S2 → S3
  Plan B: U1 → U2
  Plan C: T1

  Cross-plan: S1 depends on T1
              U2 depends on S2

Pwrl Grouping:
  Group 0: [T1]         (no deps)
  Group 1: [S1, U1]     (both depend only on Group 0)
  Group 2: [S2, U2]     (both ready after Group 1)
  Group 3: [S3]         (depends on Group 2)

Execution:
  T1 runs alone
  ↓ [Sync Point: validate & commit]
  S1 && U1 run in parallel
  ↓ [Sync Point: validate & commit]
  S2 && U2 run in parallel
  ↓ [Sync Point: validate & commit]
  S3 runs alone

Time saved: ~40% faster than sequential execution
```

### Sync Points (Internal Mechanism)

Between each group, pwrl inserts a **sync point**:

```
What happens at a sync point:
  1. Wait for all tasks in group to complete
  2. Validate no file conflicts between tasks
  3. Run tests to verify integration
  4. Commit all changes atomically (single commit for whole group)
  5. Signal dependent tasks in next group to proceed

Purpose: Ensures correctness and atomic commits
```

From the user's perspective, this is transparent—you just provide dependencies, and pwrl handles the rest.

## Real-World Scenario: 3-Plan Project

### Setup

```yaml
Plan A: Backend API (3 units, 20 min total)
  S1: Database schema (5 min) — no deps
  S2: User API (8 min) — depends on S1
  S3: Error handling (7 min) — depends on S2

Plan B: Frontend (3 units, 18 min total)
  U1: Login page (6 min) — depends on S2 (user API)
  U2: Dashboard (8 min) — depends on U1
  U3: Error display (4 min) — depends on U2

Plan C: DevOps (1 unit, 5 min)
  T1: CI/CD setup (5 min) — no deps
```

### Cross-Plan Dependencies

```yaml
S1: dependencies: []
S2: dependencies: [S1]
S3: dependencies: [S2]

U1: dependencies: [S2]    # ← Cross-plan: U1 waits for API
U2: dependencies: [U1]
U3: dependencies: [U2]

T1: dependencies: []
```

### Pwrl Execution Plan

```
Group 0: [T1, S1]       (parallel; both no deps)
  Sync: Commit CI setup + DB schema

Group 1: [S2, U1]       (parallel; both ready after Group 0)
  S2 depends on S1 ✓
  U1 depends on S2 ✓
  Sync: Commit API + Login page

Group 2: [S3, U2]       (parallel; both ready after Group 1)
  S3 depends on S2 ✓
  U2 depends on U1 ✓
  Sync: Commit Error handling + Dashboard

Group 3: [U3]           (single task)
  U3 depends on U2 ✓
  Sync: Commit Error display

Total execution time:
  Sequential: 5 + 8 + 7 + 6 + 8 + 4 = 38 minutes
  With pwrl: 5 + 8 + 8 + 4 = 25 minutes (1.5x faster!)
```

## Handling Failures

### Scenario 1: One Task Fails

```
Group 1: [S2, U1] executing...
  S2 completes ✓
  U1 fails ✗

Action:
  1. S2 is NOT committed (group fails atomically)
  2. S2 and U1 marked as blocked
  3. User prompted: "Retry Group 1 or abort?"
  4. After fix: Retry Group 1 (S2 and U1 both re-execute)
```

### Scenario 2: File Conflict

```
Group 2: [S3, U2] executing...
  S3 modifies src/api.ts
  U2 modifies src/api.ts  ← Conflict!

Detection:
  Sync point validation detects conflict
  Group fails; both tasks rolled back

Resolution:
  1. Separate into sequential groups:
     Group 2a: [S3]
     Group 2b: [U2]
  2. Retry with sequential mode
```

### Scenario 3: Circular Dependency

```
User defines:
  S1 → U1 → S1

Pwrl error during plan discovery:
  "ERROR: Circular dependency detected"
  "Path: S1 (plan-A) → U1 (plan-B) → S1 (plan-A)"

User action:
  1. Review dependencies
  2. Remove the link (e.g., U1 doesn't depend on S1)
  3. Retry execution
```

## Viewing Execution Status

### Before Execution

```
pwrl-work <plan-file>

User sees:
  Detected cross-plan dependencies:
    ✓ S1 (plan-A) → S2 (plan-A) → S3 (plan-A)
    ✓ U1 (plan-B) → U2 (plan-B) → U3 (plan-B)
    ✓ S2 → U1 (cross-plan edge)

  Parallelization groups:
    Group 0: [T1]
    Group 1: [S1, U1]
    Group 2: [S2, U2]
    Group 3: [S3]
    Group 4: [U3]

  Execution time estimate: 22 minutes (vs 38 sequential)

  Proceed? [Yes / Edit dependencies / Cancel]
```

### During Execution

```
[GROUP 0] T1
  ✓ T1 completed
  Sync point 0: Validating...
  ✓ Commit abc1234 (1 file)

[GROUP 1] S1, U1 (parallel)
  ✓ S1 completed
  ✓ U1 completed
  Sync point 1: Validating...
  ✓ Commit def5678 (5 files)

[GROUP 2] S2, U2 (parallel)
  ⏱ S2 executing...
  ⏱ U2 executing...
```

### After Execution

```
Execution completed successfully!

Summary:
  Groups completed: 5 / 5
  Tasks completed: 8 / 8
  Commits: 5
  Total time: 22 minutes

Breakdown:
  Group 0: 5 min
  Group 1: 8 min
  Group 2: 8 min
  Group 3: 7 min
  Group 4: 4 min

All tasks ready for review. Run pwrl-review to simplify code.
```

## Tips & Best Practices

### ✅ DO

- **Keep plans focused**: Each plan should have a clear scope
- **Document dependencies**: Add comments explaining why U1 depends on S2
- **Test incrementally**: Write tests before cross-plan dependencies execute
- **Monitor first execution**: Watch the first cross-plan execution closely

### ❌ DON'T

- **Create unnecessary cross-plan links**: Keep dependencies minimal
- **Define ambiguous unit-ids**: Use `S1`, `U1`, not `step1`, `unit1`
- **Mix architectural layers**: Don't have frontend task depend on frontend task from different plan
- **Skip testing**: Always run tests; sync points validate but aren't replacements for proper testing

## Advanced: Customizing Group Strategy

If you want more control over parallelization:

```yaml
# In .pwrlrc.json
{ "crossPlanDependencies": {
      "enabled": true,
      "parallelizationStrategy": "automatic", # or "conservative" or "aggressive"
      "maxParallelGroups": 4, # Limit concurrency
      "enableSyncPoints": true,
    } }
```

**Strategies:**

- **automatic** (default): Balance parallelization with safety
- **conservative**: Fewer groups, more sequential (safer for risky changes)
- **aggressive**: Maximize parallelization (faster but higher risk)

## Troubleshooting

| Problem                              | Solution                                               |
| ------------------------------------ | ------------------------------------------------------ |
| "Duplicate unit-id: S1 in two plans" | Rename one task to have unique ID (S1a, S1b)           |
| "Circular dependency detected"       | Review dependencies; remove circular link              |
| "File conflict in group X"           | Check which tasks modify same file; move to sequential |
| "Task timeout"                       | Increase timeout in config; check if task is stuck     |
| "Sync point failed"                  | Check git state; manually clean if needed; retry       |

## Migration: Single-Plan → Multi-Plan

If you're currently using single plans and want to adopt cross-plan dependencies:

```
Step 1: Create new plans for each domain
  Plan A: Backend tasks
  Plan B: Frontend tasks

Step 2: Create task files for each unit

Step 3: Define cross-plan dependencies in task frontmatter
  U1: dependencies: [S2]  # Frontend depends on backend

Step 4: Run pwrl-work with multi-plan setup
  pwrl-work docs/plans/2026-06-05-001-backend.md

Step 5: Pwrl automatically:
  - Discovers all plans
  - Builds global dependency graph
  - Generates parallelization groups
  - Executes with sync points
```

No changes needed to your existing workflow—pwrl handles the complexity internally!
