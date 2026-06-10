---
name: pwrl-work-prepare
description: Set up execution environment, create task lists, and select execution mode
argument-hint: "[Classified context from pwrl-work-triage]"
---

# pwrl-work-prepare — Environment Setup & Mode Selection

**Purpose:** Bridges triage output and task execution. Confirms branch strategy, creates or updates task lists, detects the appropriate execution mode (inline/serial/parallel), checks GitHub integration readiness, and produces a prepared context ready for execution.

## Input

Accepts a classified context object from `pwrl-work-triage`:
- Task file context (with `unit-id`, `dependencies`, `files`, etc.)
- Plan file context (with `units`, `complexity`, etc.)
- Bare prompt context (with `prompt`, `complexity`, etc.)

## Output: Prepared Context

```yaml
branchStrategy: new-branch | direct-commit
branchName: feat/xyz | null
taskList:
  source: plan | task | prompt
  taskCount: 5
  tasks:
    - unit-id: S1
      file: docs/tasks/in-progress/2026-06-05-s1-task.md
      dependencies: []
      status: in-progress
executionMode: inline | serial | parallel
executionModeReasoning: "3+ tasks with dependencies → serial"
githubIntegration:
  enabled: true | false
  tasksLinked: 3
  readyForSync: true | false
```

---

## Workflow

### 1. Confirm Branch Strategy

Ask user and document the branch approach:

**Prompt:** "Should this work be on a new branch or commit directly to the current branch (`[current-branch]`)?

**Rules:**
- New branch recommended for non-trivial work (3+ tasks or significant changes)
- Direct commit acceptable only for trivial/small changes (1-2 tasks, no cross-cutting impact)

**If new branch:**
1. Suggest a name: `feat/<short-description>` or `fix/<short-description>`
2. Ask user to confirm or provide a custom name
3. Create branch: `git checkout -b <name>`
4. Log: `Branch created: <name>`

**If direct commit:**
1. Warn: "Direct commits bypass branch protection; use only for trivial/small work"
2. Require explicit confirmation: "I understand and will commit directly"
3. Only proceed if confirmed

**Output:**
```yaml
branchStrategy: new-branch
branchName: feat/slice-pwrl-work
branchCreated: true
```

### 2. Create or Update Task List

#### 2A. From Plan File (Multiple Tasks)

When the triage output is from a plan file:

1. For each implementation unit in the plan's `units` list:
   - Derive slug from unit name (lowercase, hyphenated)
   - Create task file at `docs/tasks/to-do/YYYY-MM-DD-[unitId]-[slug].md`
   - Set frontmatter:

```yaml
---
unit-id: U1
plan: docs/plans/YYYY-MM-DD-NNN-plan.md
status: to-do
created: YYYY-MM-DD
dependencies: [list from plan]
files: [list from plan]
---
```

2. Populate task body with:
   - **Goal:** From plan unit scope
   - **Context:** From plan unit description
   - **Implementation Steps:** Decomposed from plan unit approach
   - **Test Scenarios:** From plan verification sections
   - **Acceptance Criteria:** From plan unit acceptance

3. Create or update `docs/tasks/INDEX.md`:
   - Status table (unit ID, task, status, dependencies, files)
   - Dependency graph (ASCII or markdown)
   - Critical path analysis
   - Recommended starting tasks

4. **Important:** If task files already exist (detected by matching `unitId` in frontmatter), skip creation and use existing files

#### 2B. From Single Task File

When triage output is a single task file:

1. Update task frontmatter: `status: to-do` → `status: in-progress`
2. Move file: `docs/tasks/to-do/` → `docs/tasks/in-progress/`
3. Verify dependencies:
   - Check `docs/tasks/INDEX.md` (or `INDEX-S*.md`) for each dependency's status
   - If any dependency is `to-do` or `in-progress`: warn user
   - Offer options: "Proceed anyway (manual dependency management) or wait?"
4. Update `docs/tasks/INDEX.md` to reflect status change

#### 2C. From Bare Prompt

When triage output is a bare prompt:

1. Create a minimal inline task list (in agent memory, no files)
2. For 1-2 tasks: structure as simple checklist
3. For 3+ tasks or non-trivial: recommend creating task files
4. Present to user for approval before proceeding

### 3. Detect Execution Mode

Apply automatic mode selection based on task count, dependencies, and file conflicts:

**Decision tree:**

```
taskCount = number of tasks in taskList

if taskCount <= 2:
    → INLINE (direct execution, no subagents needed)

if taskCount >= 3:
    → Check dependency graph
    → Build file-to-task map from each task's `files` field
    → Detect any file conflicts (same file touched by 2+ tasks)

    if any dependencies exist between tasks:
        → SERIAL (dependencies must be respected)
    else if any file conflicts detected:
        → SERIAL (forced; parallel would create race conditions)
    else:
        → PARALLEL (independent tasks with no file overlap)
```

**File conflict detection heuristic:**
1. Collect all file paths from each task's `files` field
2. Create a map: file → [taskId1, taskId2, ...]
3. If any file appears in more than one task's files → conflict
4. Document all conflicting files and tasks

**Parallel subagent constraints:**
- Subagents must not run full test suite (only targeted tests)
- Subagents must not stage or commit (orchestrator handles this)
- Subagents report results to orchestrator for aggregation

**Output:**
```yaml
executionMode: serial
executionModeReasoning: "5 tasks with sequential dependency chain (S1→S2→S3→S5→S6→S7)"
hasFileLevelConflicts: false
conflictingFiles: []
parallelSafetyGate: not-applicable
```

### 4. Check GitHub Integration Readiness

**Step 1 — Read `.pwrlrc.json`:**
```json
{
  "integrations": {
    "githubIssues": true
  }
}
```

**Step 2 — Evaluate:**
- If `githubIssues` is `true` → GitHub integration enabled
- Otherwise → skip GitHub syncing

**Step 3 — If enabled, check each task for `github-issue` field:**
- Build list of tasks that have linked issues
- Validate issue numbers are numeric
- Mark `readyForSync: true` if any tasks have issues

**Step 4 — If disabled, log and continue:**
```yaml
githubEnabled: false
readyForSync: false
reason: "GitHub Issues integration disabled in .pwrlrc.json"
```

### 5. User Confirmation Checkpoint

Before proceeding to execution, present a summary and ask for confirmation:

---

**📋 Preparation Summary**

| Item | Value |
|---|---|
| **Branch** | `feat/slice-pwrl-work` (new) |
| **Tasks** | 5 tasks: S1 → S2 → S3 → S5 → S6 |
| **Mode** | Serial (dependent chain) |
| **GitHub** | Enabled, 3 tasks linked |

**Ready to begin execution?**
- ✅ **Yes, proceed** — Begin Phase 2 (Execute)
- 🔄 **Review branch** — Change branch strategy
- 📋 **Review tasks** — Adjust task list or dependencies
- ❌ **Cancel** — Halt all work

---

**If cancelled:**
- Log: `Work cancelled by user at preparation checkpoint`
- No tasks marked as `in-progress`
- User can re-invoke with updated parameters

---

## Error Handling

| Scenario | Handling |
|---|---|
| Branch creation fails | Log git error; ask user: "Resolve git state manually or retry?" |
| Malformed task frontmatter | Log details; ask user to fix and retry |
| Circular dependencies detected | Fail; ask user to resolve circular references |
| User cancels at checkpoint | Exit gracefully; preserve current state |
| Blocking dependencies exist | Warn; ask user: "Proceed anyway or wait for dependencies?" |
| GitHub integration check fails | Log warning; continue without sync |
| Task file doesn't exist | Offer to create from plan; ask user: "Create task or provide different path?" |
| INDEX.md is missing | Create automatically; warn user |
| No tasks in task list | Block execution; ask user to review and confirm task list |
| Execution mode indeterminate | Ask user to specify preferred mode |
| Dependency chain >5 deep | Flag for review; user can accept or simplify |
| File conflicts detected | Force serial mode; inform user |
| GitHub sync skipped (missing issues) | Log warning; continue without sync |

**Retry limit:** 3 attempts per operation, then ask user to fix manually.

**Fallback:** If all retries fail, log the error and ask user: "Retry, skip, or abort?"

---

## Dependencies

- **pwrl-work-triage** — Consumes classified context from this skill
- **`.pwrlrc.json`** — For GitHub integration check
- **Git** — For branch operations
- **File system** — For task file creation and movement
- **User input** — For branch strategy, task approval, and checkpoint confirmation

## References

- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **S2 Skill:** `pwrl-work-triage/SKILL.md`
- **Source Phase 1:** Installed `pwrl-work` skill (Phase 1: Prepare Context, lines 49-121)
- **Next Skill:** `pwrl-work-execute` (consumes prepared context)
- **Sibling Skill:** `pwrl-work-sync-status` (called for GitHub sync if enabled)
