# Dependency Resolution Guide

This guide explains how pwrl-tasks should identify, parse, and track dependencies between implementation units when generating task files.

---

## Dependency Sources

Dependencies can be discovered from several sources in the plan:

### 1. Explicit Dependency Statements

Look for explicit dependency language in unit descriptions:

```markdown
- U3. **Send Confirmation Email**
  - Depends on: U1 (email validation), U5 (email service)
  - After: U1, U5 must be complete
  - Requires: U5 integration before implementing
  - Blocked by: U5
```

### 2. Implicit Dependencies from Descriptions

Parse unit descriptions for implicit dependencies:

```markdown
- U3. **Send Confirmation Email**
  - Uses the EmailService from U5
  - Calls validateEmail (U1) before sending
  - Extends the signup flow (U2)
```

### 3. Sequential Dependencies

Units listed sequentially may have implicit ordering:

```markdown
- U1. **Create database schema**
- U2. **Add migration scripts** (depends on U1 - needs schema)
- U3. **Seed test data** (depends on U2 - needs migrations)
```

### 4. Technical Dependencies

Analyze technical relationships:

- **File dependencies**: If U2 imports from files modified by U1, U2 depends on U1
- **Data dependencies**: If U2 uses data structures created by U1, U2 depends on U1
- **Test dependencies**: If U2's tests depend on U1's functionality, U2 depends on U1

---

## Dependency Types

### Hard Dependencies

**Must** complete prerequisite before starting dependent task.

**Indicators:**
- "Requires"
- "Depends on"
- "Blocked by"
- "After"
- "Must complete X first"

**Example:**
```markdown
U3 depends on U1, U2
```
Cannot start U3 until both U1 and U2 are done.

### Soft Dependencies

**Should** complete prerequisite first, but not strictly required.

**Indicators:**
- "Ideally after"
- "Preferably after"
- "Could start alongside"
- "Loosely coupled with"

**Example:**
```markdown
U4 preferably after U3
```
Can start U4 before U3 completes, but it's better to wait.

### No Dependencies

Tasks that can start immediately and run in parallel.

**Indicators:**
- No dependency language
- Isolated files
- Independent features
- "Can run in parallel"

---

## Dependency Parsing Algorithm

### Step 1: Extract Explicit Dependencies

Search for dependency keywords in each unit:

```typescript
const dependencyKeywords = [
  'depends on',
  'requires',
  'after',
  'blocked by',
  'needs',
  'prerequisite'
];

function extractExplicitDeps(unitText: string): string[] {
  const deps: string[] = [];

  for (const keyword of dependencyKeywords) {
    const pattern = new RegExp(`${keyword}:?\\s*([U0-9,\\s]+)`, 'gi');
    const match = unitText.match(pattern);

    if (match) {
      // Extract unit IDs: "U1, U2" or "U1 and U2"
      const unitIds = match[1].match(/U\d+/g);
      deps.push(...unitIds);
    }
  }

  return [...new Set(deps)]; // Deduplicate
}
```

### Step 2: Infer Technical Dependencies

Analyze file and code relationships:

```typescript
function inferTechnicalDeps(units: Unit[]): Map<string, string[]> {
  const deps = new Map<string, string[]>();

  for (const unit of units) {
    const unitDeps: string[] = [];

    // Check if this unit's files import from previous units' files
    for (const otherUnit of units) {
      if (otherUnit.id === unit.id) continue;

      if (filesAreRelated(unit.files, otherUnit.files)) {
        unitDeps.push(otherUnit.id);
      }
    }

    deps.set(unit.id, unitDeps);
  }

  return deps;
}

function filesAreRelated(filesA: string[], filesB: string[]): boolean {
  // Check if filesA imports from filesB
  // Check if filesA uses types/classes defined in filesB
  // Check if filesB creates schemas/tables used by filesA
  return checkImportRelationships(filesA, filesB);
}
```

### Step 3: Build Dependency Graph

Create a graph structure:

```typescript
interface DependencyGraph {
  nodes: Map<string, TaskNode>;
  edges: Map<string, string[]>; // unit ID -> dependencies
}

interface TaskNode {
  unitId: string;
  name: string;
  files: string[];
  dependencies: string[];
}

function buildGraph(units: Unit[]): DependencyGraph {
  const graph: DependencyGraph = {
    nodes: new Map(),
    edges: new Map()
  };

  for (const unit of units) {
    const deps = [
      ...extractExplicitDeps(unit.description),
      ...inferTechnicalDeps(unit, units)
    ];

    graph.nodes.set(unit.id, {
      unitId: unit.id,
      name: unit.name,
      files: unit.files,
      dependencies: [...new Set(deps)]
    });

    graph.edges.set(unit.id, [...new Set(deps)]);
  }

  return graph;
}
```

### Step 4: Validate Dependencies

Check for issues:

```typescript
function validateDependencies(graph: DependencyGraph): ValidationResult {
  const errors: string[] = [];

  // Check for circular dependencies
  const cycles = findCycles(graph);
  if (cycles.length > 0) {
    errors.push(`Circular dependencies detected: ${cycles.join(', ')}`);
  }

  // Check for missing dependencies
  for (const [unitId, deps] of graph.edges) {
    for (const depId of deps) {
      if (!graph.nodes.has(depId)) {
        errors.push(`Unit ${unitId} depends on non-existent unit ${depId}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function findCycles(graph: DependencyGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(unitId: string, path: string[]): void {
    if (recursionStack.has(unitId)) {
      // Found a cycle
      const cycleStart = path.indexOf(unitId);
      cycles.push(path.slice(cycleStart).concat(unitId));
      return;
    }

    if (visited.has(unitId)) return;

    visited.add(unitId);
    recursionStack.add(unitId);
    path.push(unitId);

    const deps = graph.edges.get(unitId) || [];
    for (const dep of deps) {
      dfs(dep, [...path]);
    }

    recursionStack.delete(unitId);
  }

  for (const unitId of graph.nodes.keys()) {
    if (!visited.has(unitId)) {
      dfs(unitId, []);
    }
  }

  return cycles;
}
```

---

## Execution Order

### Topological Sort

Determine execution order from dependency graph:

```typescript
function topologicalSort(graph: DependencyGraph): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();

  function visit(unitId: string): void {
    if (visited.has(unitId)) return;

    visited.add(unitId);

    // Visit dependencies first
    const deps = graph.edges.get(unitId) || [];
    for (const dep of deps) {
      visit(dep);
    }

    sorted.push(unitId);
  }

  for (const unitId of graph.nodes.keys()) {
    visit(unitId);
  }

  return sorted;
}
```

**Example Output:**
```
Input: U3 depends on [U1, U2], U2 depends on [U1]
Output: [U1, U2, U3]
```

### Parallel Execution Groups

Identify tasks that can run in parallel:

```typescript
function findParallelGroups(graph: DependencyGraph): string[][] {
  const groups: string[][] = [];
  const processed = new Set<string>();

  while (processed.size < graph.nodes.size) {
    const readyTasks: string[] = [];

    // Find tasks with all dependencies satisfied
    for (const [unitId, deps] of graph.edges) {
      if (processed.has(unitId)) continue;

      const allDepsSatisfied = deps.every(dep => processed.has(dep));
      if (allDepsSatisfied) {
        readyTasks.push(unitId);
      }
    }

    if (readyTasks.length === 0) {
      throw new Error('No ready tasks - circular dependency?');
    }

    groups.push(readyTasks);
    readyTasks.forEach(t => processed.add(t));
  }

  return groups;
}
```

**Example Output:**
```
Input:
  U1: []
  U2: [U1]
  U3: [U1]
  U4: [U2, U3]

Output:
  Group 1: [U1]        # Can start immediately
  Group 2: [U2, U3]    # Can run in parallel after U1
  Group 3: [U4]        # Runs after U2 and U3
```

### Critical Path

Identify the longest dependency chain:

```typescript
function findCriticalPath(graph: DependencyGraph): string[] {
  let longestPath: string[] = [];

  function dfs(unitId: string, path: string[]): void {
    const newPath = [...path, unitId];

    const deps = graph.edges.get(unitId) || [];
    if (deps.length === 0) {
      // Leaf node
      if (newPath.length > longestPath.length) {
        longestPath = newPath;
      }
    } else {
      for (const dep of deps) {
        dfs(dep, newPath);
      }
    }
  }

  // Find leaf nodes (tasks with no dependents)
  const leafNodes = Array.from(graph.nodes.keys()).filter(unitId => {
    return !Array.from(graph.edges.values()).some(deps => deps.includes(unitId));
  });

  for (const leaf of leafNodes) {
    dfs(leaf, []);
  }

  return longestPath.reverse();
}
```

---

## Task File Dependency Representation

### Frontmatter Format

```yaml
---
dependencies: [U1, U2, U5]  # Unit IDs this task depends on
---
```

### Body Section

Explain **why** each dependency exists:

```markdown
## Dependencies

**Depends on:**
- **U1** ([Add Email Validation](2026-05-04-u1-add-email-validation.md))
  - **Reason:** Need `validateEmail` function to validate addresses before sending
  - **Specifically needs:** Exported `validateEmail` function from `src/utils/validators.ts`

- **U5** ([Integrate Email Service](2026-05-04-u5-integrate-email-service.md))
  - **Reason:** Need `EmailService` class to send emails
  - **Specifically needs:** Instantiated `EmailService` with working SendGrid connection
```

---

## Handling Dependency Issues

### Circular Dependencies

**Detection:**
```markdown
U2 depends on U3
U3 depends on U4
U4 depends on U2
```

**Resolution:**
1. Identify the cycle
2. Report to user: "Circular dependency detected: U2 → U3 → U4 → U2"
3. Suggest breaking the cycle:
   - Extract common functionality into new unit (U5)
   - Remove unnecessary dependency
   - Refactor approach to eliminate circular reference

**In Task File:**
```markdown
## ⚠️ Dependency Issue

This task has a circular dependency with U4. Suggested resolution:
1. Extract shared logic into U5
2. Make both U2 and U4 depend on U5
3. Remove direct dependency between U2 and U4
```

### Missing Dependencies

**Detection:**
```markdown
U3 depends on U7, but U7 doesn't exist in plan
```

**Resolution:**
1. Report to user: "Unit U3 references non-existent unit U7"
2. Ask user to clarify:
   - Is U7 missing from plan?
   - Should U3 depend on a different unit?
   - Is the dependency reference incorrect?

**In Task File:**
```yaml
---
dependencies: [U7]  # ⚠️ U7 not found in plan
status: blocked
---
```

### Ambiguous Dependencies

**Detection:**
```markdown
U3: "Uses email validation"
Could refer to U1 or U2 (both involve email validation)
```

**Resolution:**
1. Analyze file paths and imports to disambiguate
2. If still unclear, mark both as soft dependencies
3. Note ambiguity in task file

**In Task File:**
```markdown
## Dependencies

**Likely depends on:**
- **U1** (Email Validation): Most likely dependency based on file overlap
- **U2** (Client-Side Validation): Possible dependency if using client-side patterns

⚠️ **Clarification needed:** Confirm which validation this task uses.
```

---

## Example Dependency Analysis

### Input Plan

```markdown
- U1. **Create User Model**
  - Files: `src/models/user.ts`
  - Approach: Define TypeScript interface and Prisma schema

- U2. **Add Database Migration**
  - Files: `prisma/migrations/001_create_users.sql`
  - Approach: Generate migration from schema
  - Depends on: U1

- U3. **Create User Repository**
  - Files: `src/repositories/user.ts`
  - Approach: CRUD operations using Prisma client
  - Uses User model from U1

- U4. **Add Authentication Service**
  - Files: `src/services/auth.ts`
  - Approach: Implement login/logout using User repository
  - After U3

- U5. **Add User Endpoints**
  - Files: `src/api/users.ts`
  - Approach: REST endpoints for user operations
  - Needs auth service (U4) and user repository (U3)
```

### Extracted Dependencies

```typescript
{
  U1: [],              // No dependencies
  U2: [U1],            // Explicit: "Depends on: U1"
  U3: [U1, U2],        // Explicit: "Uses User model from U1"
                       // Inferred: Needs migration (U2) before repository
  U4: [U3],            // Explicit: "After U3"
  U5: [U3, U4]         // Explicit: "Needs auth service (U4) and user repository (U3)"
}
```

### Execution Order

**Topological Sort:** `[U1, U2, U3, U4, U5]`

**Parallel Groups:**
- Group 1: `[U1]`
- Group 2: `[U2]`
- Group 3: `[U3]`
- Group 4: `[U4]`
- Group 5: `[U5]`

*(No parallelization possible due to linear dependency chain)*

**Critical Path:** `U1 → U2 → U3 → U4 → U5` (5 tasks)

### Task File Output

**2026-05-04-u5-add-user-endpoints.md:**
```yaml
---
unit-id: U5
dependencies: [U3, U4]
status: to-do
---
```

```markdown
## Dependencies

**Depends on:**
- **U3** ([Create User Repository](2026-05-04-u3-create-user-repository.md))
  - **Reason:** Endpoints call repository methods for data access
  - **Specifically needs:** `UserRepository` class with `findById`, `create`, `update`, `delete` methods

- **U4** ([Add Authentication Service](2026-05-04-u4-add-auth-service.md))
  - **Reason:** Endpoints require authentication middleware
  - **Specifically needs:** `requireAuth` middleware function

**Execution Note:** Both U3 and U4 must be complete before starting this task. U3 and U4 can be developed in parallel since they're independent.
```

---

## Best Practices

1. **Be Explicit**: Always document dependencies in task frontmatter AND body
2. **Explain Why**: Don't just list dependencies; explain what's needed from each
3. **Validate Early**: Check for cycles and missing dependencies before generating all tasks
4. **Provide Guidance**: Suggest execution order and parallel opportunities
5. **Handle Ambiguity**: When uncertain, mark as soft dependency and note for clarification
6. **Update on Changes**: If tasks are reordered, regenerate dependency information

---

## Anti-patterns

❌ **Unstated Dependencies**: Task uses functionality from another task without declaring dependency
❌ **Over-specification**: Declaring dependencies that don't actually affect execution (e.g., documentation tasks depending on implementation tasks unnecessarily)
❌ **Ignoring Cycles**: Not checking for circular dependencies leads to execution deadlocks
❌ **Vague Dependencies**: "Depends on earlier tasks" without specifics
❌ **Duplicate Dependencies**: Listing same dependency multiple times through different paths
