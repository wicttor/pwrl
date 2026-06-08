---
name: pwrl-work-triage
description: Classify work input and extract foundational context for execution
argument-hint: "[Task file path, plan path, or bare prompt. Leave blank to use latest task]"
---

# pwrl-work-triage — Input Classification & Context Extraction

**Purpose:** Entry point to the work execution workflow. Classifies the input (task file, plan file, or bare prompt), extracts relevant context, estimates complexity, resolves dependencies, and returns a structured context object for downstream skills.

## Input

<input_document> #$ARGUMENTS </input_document>

### Supported Input Types

| Type | Detection | Example |
|---|---|---|
| **Task file** | Contains `unit-id` in YAML frontmatter | `docs/tasks/to-do/2026-06-05-u1-task.md` |
| **Plan file** | No `unit-id` in frontmatter, points to `docs/plans/` | `docs/plans/2026-06-05-001-plan.md` |
| **Bare prompt** | Neither of the above | `"Add email validation to user signup"` |

## Output: Classified Context

After triage, produce a context object (in agent memory or as markdown) with fields varying by input type:

```yaml
inputType: task | plan | prompt
complexity: trivial | small | medium | large
blockedBy: []
# Type-specific fields below
```

Detailed shape per input type is documented in each classification section.

---

## Workflow

### 1. Classify Input

Determine the input type:

- **If input path contains `docs/tasks/` and points to a file with `unit-id` in frontmatter** → Task file
- **Else if input path points to `docs/plans/` or contains `plan` in filename** → Plan file
- **Otherwise** → Bare prompt

### 2. Classify Task File

When input is a task file path:

**Step 1 — Read frontmatter:**

Extract these fields from the YAML frontmatter:

| Field | Required | Description |
|---|---|---|
| `unit-id` | Yes | Stable task identifier (e.g., `S1`, `U1`) |
| `plan` | Yes | Relative path to linked plan file |
| `status` | Yes | Current status: `to-do`, `in-progress`, `for-review`, `done` |
| `dependencies` | No | List of task unit-ids this depends on |
| `files` | No | List of primary files affected by this task |
| `github-issue` | No | GitHub issue number (if linked to an issue) |
| `created` | No | Creation date |

**Step 2 — Load linked plan file:**

- Read the plan file specified in the `plan` field
- Extract: plan overview, technical decisions, non-goals, implementation units
- Use this context to understand the broader rationale

**Step 3 — Resolve dependencies:**

1. Read `docs/tasks/INDEX.md` (or `INDEX-S*.md`) to check each dependency's status
2. For each dependency listed in frontmatter:
   - If status is `done` or `for-review` → dependency met
   - If status is `to-do` or `in-progress` → add to `blockedBy` list
   - If task not found in INDEX → add to `blockedBy` as "missing"
3. Build transitive dependency chain (dependencies of dependencies)
4. Check for circular dependencies: if A depends on B and B depends on A → fail

**Step 4 — Estimate complexity (from task scope):**
- Based on `files` count and task body length
- 1 file, no behavior change → `trivial`
- 1-2 files, bounded scope → `small`
- 3-5 files, moderate logic → `medium`
- 6+ files or cross-cutting → `large`

**Output context:**

```yaml
inputType: task
taskFile: docs/tasks/to-do/2026-06-05-u1-task.md
unitId: S1
plan: docs/plans/2026-06-05-002-plan.md
status: to-do
dependencies: [S2, S3]
files: [src/utils.ts, src/api.ts]
githubIssue: 123  # or null if absent
complexity: medium
blockedBy: []
dependencyChain: [S2 → S3 → S4]
```

### 3. Classify Plan File

When input is a plan file path (no `unit-id`):

**Step 1 — Read plan frontmatter:**

| Field | Description |
|---|---|
| `id` | Plan identifier (e.g., `2026-06-05-002`) |
| `tier` | Planning tier: `Fast`, `Standard`, `Deep` |
| `status` | `active`, `draft`, `archived` |
| `created` | Creation date |
| `updated` | Last update date |

**Step 2 — Extract implementation units:**

- Scan plan body for unit headers (e.g., `### U1`, `### S1`, `**U1:**`)
- For each unit extract: unit ID, name/scope, files affected, approach
- Build a unit list with descriptions

**Step 3 — Estimate complexity from unit count:**

| Units | Complexity | Expected Mode |
|---|---|---|
| 1-2 | `trivial` / `small` | Inline execution |
| 3-5 | `medium` | Serial execution |
| 6+ | `large` | Serial with possible parallel subsets |

**Output context:**

```yaml
inputType: plan
planFile: docs/plans/2026-06-05-002-plan.md
planId: 2026-06-05-002
tier: Standard
planStatus: active
units:
  - unitId: U1
    name: Input Triage
    files: [pwrl-work-triage/SKILL.md]
    approach: Extract Phase 0 logic
  - unitId: U2
    name: Environment Setup
    files: [pwrl-work-prepare/SKILL.md]
    approach: Extract Phase 1 logic
complexity: medium
estimatedTasks: 5
```

### 4. Classify Bare Prompt

When input is a freeform text description:

**Step 1 — Estimate complexity by heuristic:**

Apply rules in order:

| Signal | Complexity |
|---|---|
| Single file, no behavior change (rename, config, styling) | `trivial` |
| 1-2 files, clear bounded scope, no cross-cutting concerns | `small` |
| 3-5 files, moderate logic, behavior change, tests needed | `medium` |
| 6+ files, architectural work, security, payments, auth, core systems | `large` |

**Step 2 — Scan codebase for context:**

- Search for existing tests related to keywords in prompt
- Find related modules or utilities via filename patterns
- Identify similar patterns already in codebase

**Step 3 — Warn if complexity is large:**

If complexity is `large`:
- Recommend planning with `/pwrl-plan` workflow first
- Ask user: "This work appears large/complex. Understanding risks and tradeoffs, do you want to proceed without formal planning?"
- Only proceed if user expressly confirms

**Output context:**

```yaml
inputType: prompt
prompt: "Add email validation to user signup"
complexity: medium
complexitySignals:
  - "Affects 3-5 files"
  - "Behavior changes to existing logic"
  - "Multiple test scenarios needed"
relatedPatterns:
  - "src/validators/phone.ts"  # similar validation pattern
planningRecommended: false
```

---

## Error Handling

### Task File Not Found
- Log: `Task file not found at [path]`
- Ask user: "The file `[path]` does not exist. Would you like to provide a different path, or create a new task?"

### Plan File Not Found
- Log: `Plan file not found at [path]`
- Ask user: "The plan at `[path]` does not exist. Would you like to provide a different path or create a new plan with `/pwrl-plan`?"

### Circular Dependencies
- Detect: Walk dependency tree; if a unit-id appears twice → circular
- Fail with: `Circular dependency detected: [A → B → C → A]`
- Ask user to resolve the circular reference before proceeding

### Missing Dependencies
- Log: `Dependency [unit-id] not found in INDEX`
- Add to `blockedBy` as `missing: [unit-id]`
- Warn: "Task depends on [unit-id] which was not found in the task index. Proceeding may cause ordering issues."

---

## Quality Gates

**❌ Fail if:**
- Input is completely empty (ask user for input)
- Circular dependencies prevent safe execution
- Task file cannot be read or frontmatter is malformed
- Plan file cannot be read or frontmatter is missing

**⚠️ Warn but continue if:**
- Complexity is `large` without prior planning (require user confirmation)
- Dependencies are not yet completed (offer to wait or proceed with manual dependency check)
- Task file references a non-existent plan file

**✅ Proceed if:**
- Input successfully classified
- Complexity estimated with confidence
- Dependencies resolved (or user acknowledged and accepted blockers)
- No circular dependencies
- User confirmed for large work (prompt mode)

---

## Dependencies

- **File system** — Reading task files, plan files, INDEX files
- **`.pwrlrc.json`** — For GitHub integration check (though actual syncing happens in pwrl-work-sync-status)

## References

- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **Source Phase 0:** Installed `pwrl-work` skill (Phase 0: Triage Input, lines 26-48)
- **Next Skill:** `pwrl-work-prepare` (consumes this skill's output context)
