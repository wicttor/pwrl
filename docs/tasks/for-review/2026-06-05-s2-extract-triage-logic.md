---
unit-id: S2
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: for-review
created: 2026-06-05
dependencies: [S1]
files:
  - pwrl-work-triage/SKILL.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S2: Extract Input Classification & Triage Logic (U1)

## Goal

Create the `pwrl-work-triage` micro-skill that classifies input types and extracts foundational context for execution. This is the first step in the work execution workflow.

## Context

From S1 analysis, Phase 0 (Triage) handles three input types:
1. **Task file** (path contains `unit-id` in frontmatter)
2. **Plan file** (path with no `unit-id`)
3. **Bare prompt** (description text)

Each requires different extraction logic but ultimately produces a classified context object for the next phase (S3).

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Single-responsibility boundary: input classification only
  - State object format for passing to next skill
  - Applicability: Guides SKILL.md structure and output schema

## Implementation Steps

### Step 1: Create Skill Directory and Frontmatter

- Create directory: `pwrl-work-triage/`
- Create file: `pwrl-work-triage/SKILL.md`
- Add frontmatter (name, description, argument-hint):

```yaml
---
name: pwrl-work-triage
description: Classify work input and extract foundational context for execution
argument-hint: "[Task file path, plan path, or bare prompt. Leave blank to use latest task]"
---
```

### Step 2: Document Purpose Section

Add "Purpose" section explaining:
- Input classification (task/plan/prompt)
- Context extraction for Phase 1
- Complexity estimation
- Dependency resolution

### Step 3: Implement Task File Classification

When input contains `docs/tasks/` and appears to be a task file path:

```markdown
#### Classify Task File

1. Read file frontmatter to extract:
   - `unit-id`: Stable identifier (e.g., "U1")
   - `plan`: Path to linked plan file
   - `status`: Current status (to-do, in-progress, for-review, done)
   - `dependencies`: List of other task IDs this depends on
   - `files`: List of primary affected files
   - `github-issue`: GitHub issue number (if linked)

2. Load linked plan file for broader context:
   - Read plan overview for understanding "why"
   - Extract relevant technical decisions affecting this task
   - Note non-goals to avoid scope drift

3. Resolve dependency chain:
   - For each dependency listed, check `docs/tasks/INDEX.md` to verify it exists
   - If dependency is blocked or missing, mark in output and warn user
   - Build dependency chain: what must complete before this task?

4. Output: Classified context object:
   ```
   {
     inputType: "task",
     taskFile: "path/to/task.md",
     unitId: "U1",
     plan: "docs/plans/2026-05-01-plan.md",
     status: "to-do",
     dependencies: ["U2", "U3"],
     files: ["src/utils.ts", "src/api.ts"],
     githubIssue: 123 | null,
     complexity: "medium",
     blockedBy: [] | ["U2"] // if dependencies aren't met
   }
   ```
```

### Step 4: Implement Plan File Classification

When input is a plan file path (no `unit-id`):

```markdown
#### Classify Plan File

1. Read plan frontmatter:
   - `id`: Plan identifier
   - `tier`: Fast/Standard/Deep
   - `status`: active/draft/archived
   - `created`: Creation date

2. Extract implementation units:
   - Parse plan body to find all unit headers (U1, U2, etc.)
   - For each unit, extract: scope, files affected, approach
   - Build unit list with descriptions

3. Detect complexity from unit count:
   - 1-2 units: trivial or small → Inline execution expected
   - 3-5 units: medium → Serial execution recommended
   - 6+ units or cross-cutting: large → Serial with possible parallel subsets

4. Output: Classified context object:
   ```
   {
     inputType: "plan",
     planFile: "docs/plans/2026-05-01-plan.md",
     planId: "2026-05-01-001",
     tier: "Standard",
     planStatus: "active",
     units: [
       { unitId: "U1", name: "...", files: [...], approach: "..." },
       { unitId: "U2", name: "...", files: [...], approach: "..." }
     ],
     complexity: "medium",
     estimatedTasks: 5
   }
   ```
```

### Step 5: Implement Bare Prompt Classification

When input is a freeform text description:

```markdown
#### Classify Bare Prompt

1. Estimate complexity by keyword scanning:
   - Trivial: Single file, no behavior change (rename, config)
   - Small: 1-2 files, clear bounded scope
   - Medium: 3-5 files, moderate logic, test scenarios
   - Large: 10+ files, architectural, security, performance, sensitive areas

2. Scan codebase for relevant context:
   - Look for existing tests related to keywords from prompt
   - Find related modules or utilities
   - Identify similar patterns in codebase

3. Warn if complexity is large:
   - Recommend planning with `/pwrl-plan` first
   - Ask user to confirm understanding of risks if skipping planning

4. Output: Classified context object:
   ```
   {
     inputType: "prompt",
     prompt: "user description text",
     complexity: "medium",
     complexity_signals: ["affects 3-5 files", "behavior changes", "tests needed"],
     relatedPatterns: ["...existing pattern..."],
     planningRecommended: true | false
   }
   ```
```

### Step 6: Implement Dependency Resolution

Add a helper function `resolveAndValidateDependencies`:

```markdown
#### Resolve Dependencies

For task and plan inputs:

1. Read `docs/tasks/INDEX.md` for task status
2. For each dependency:
   - Check if dependent task exists
   - Check if dependent task is completed (status: done)
   - If blocked: add to `blockedBy` list and warn
3. Build full dependency chain (transitively)
4. Return: {dependencies: [...], blockedBy: [...], chain: [...]}
```

### Step 7: Create Complexity Estimation Heuristic

Add a helper function `estimateComplexity`:

```markdown
#### Complexity Estimation Rules

Apply these rules in order:

**Trivial:**
- Single file affected
- No behavior change (rename, config, styling)

**Small:**
- 1-2 files affected
- Clear, bounded scope
- Existing patterns cover the work
- Tests cover the scenario

**Medium:**
- 3-5 files affected
- Moderate logic or behavior change
- Some design decisions needed
- Multiple test scenarios

**Large (triggers planning recommendation):**
- 6+ files affected, OR
- Cross-cutting architectural work, OR
- Sensitive areas (security, payments, auth, core systems), OR
- Requires external research, OR
- Backend implementation in complex subsystems
```

### Step 8: Add Error Handling

Handle these cases:

```markdown
#### Error Cases

1. **Task file not found:**
   - Log error
   - Ask user for correct path or offer to create task

2. **Plan file not found:**
   - Log error
   - Ask user for correct path or recommend `/pwrl-plan`

3. **Circular dependencies detected:**
   - Log warning
   - Mark as blockedBy: "circular"
   - Ask user to resolve

4. **Dependency missing:**
   - Log warning
   - Add to blockedBy list
   - Proceed but warn at Phase 1
```

### Step 9: Document Input/Output Schema

Add section documenting the context object shape:

```markdown
### Input

One of:
- Task file path: `docs/tasks/to-do/2026-05-01-u1-task.md`
- Plan file path: `docs/plans/2026-05-01-plan.md`
- Bare prompt: "Add email validation to user signup"

### Output

Classified context object (shape varies by input type):
```
{
  inputType: "task" | "plan" | "prompt",
  complexity: "trivial" | "small" | "medium" | "large",
  blockedBy: [...],
  // Additional fields depend on inputType
}
```
```

### Step 10: Add Quality Gates

Document when triage should fail or escalate:

```markdown
### Quality Gates

❌ **Fail if:**
- Input is ambiguous and user can't clarify
- Circular dependencies prevent execution
- Blocked by missing dependencies (unless user accepts risk)

⚠️ **Warn but continue if:**
- Complexity is "large" without prior planning (confirm user intent)
- Dependencies not yet completed (offer to wait or proceed with manual dependency check)
- Task file references non-existent plan

✅ **Proceed if:**
- Input successfully classified
- Complexity estimated
- Dependencies resolved (or user acknowledged blockers)
- No circular dependencies
```

## Test Scenarios

**Test 1: Classify Task File**
- Input: Valid task file path with unit-id, dependencies, files
- Expected: Extract all frontmatter fields; resolve dependencies; estimate complexity
- Acceptance: Context object has all required fields

**Test 2: Classify Plan File**
- Input: Valid plan file path with units
- Expected: Parse units; estimate complexity from unit count
- Acceptance: Units extracted; complexity reasonable; task count estimated

**Test 3: Classify Bare Prompt**
- Input: Freeform text (e.g., "Add email validation")
- Expected: Scan codebase; estimate complexity; warn if large
- Acceptance: Complexity estimated; planning recommendation clear

**Test 4: Handle Missing Task File**
- Input: Non-existent task file path
- Expected: Error with guidance
- Acceptance: User offered alternatives (create task, check path)

**Test 5: Detect Blocked Dependencies**
- Input: Task with dependencies not yet completed
- Expected: Add to blockedBy; warn user
- Acceptance: Warning clear; offer to proceed or wait

**Test 6: Detect Circular Dependencies**
- Input: Task A depends on B, B depends on A
- Expected: Detect cycle; fail with clear error
- Acceptance: Error explains cycle; asks user to fix

## Acceptance Criteria

✅ Skill successfully classifies task files (extract frontmatter, resolve dependencies)  
✅ Skill successfully classifies plan files (parse units, estimate complexity)  
✅ Skill successfully classifies bare prompts (keyword analysis, codebase scanning)  
✅ Complexity estimation heuristic is documented and accurate  
✅ Dependency resolution handles blocking and cycles correctly  
✅ All error cases handled gracefully (no crashes)  
✅ Output context object is complete and well-documented  
✅ Ready for integration with S3 (pwrl-work-prepare)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Unit U1 definition)
- **Source Code:** Current `pwrl-work/SKILL.md` Phase 0 (from S1 analysis)
- **Design:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md` (from S1)
