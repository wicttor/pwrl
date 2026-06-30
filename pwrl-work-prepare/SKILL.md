---
name: pwrl-work-prepare
description: Set up execution environment, create task lists, and select execution mode
argument-hint: "[Classified context from pwrl-work-triage]"
version: 1.7.0-dev.1
---

# pwrl-work-prepare — Environment Setup & Mode Selection

## Interaction Method

- Use platform's `ask_user_question`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "Is the work environment ready? Review and confirm the repository state, branch setup, and dependencies."
- Provide clear recovery suggestions when errors occur

## Pre-Flight Guard

Assert that the input task file is currently in `docs/tasks/to-do/`.

If the file is in any other folder, log: "Task is not in to-do/. Lifecycle contract violation. Current location: [path]. Refusing to proceed." and ask the user to either move the file back to `to-do/` or cancel.

If the file is in `docs/tasks/done/` already, surface an extra warning: "Task is already done. Skipping prepare." and ask the user to confirm or cancel.

**Cross-reference:** see [`pwrl-work/SKILL.md` §"Task Lifecycle Contract"](../pwrl-work/SKILL.md#task-lifecycle-contract).

## Responsibility Boundary

**This skill OWNS the `to-do → in-progress` transition.**

**This skill MUST NOT perform any other transition (especially `→ done`).** The `for-review → done` transition is the exclusive responsibility of `pwrl-review-report`.

For the canonical ownership table, see [`pwrl-work/references/workflow-details.md` §"Task Status Transitions"](../pwrl-work/references/workflow-details.md#task-status-transitions-docstasks).

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

1. **CRITICAL: Move task file** `docs/tasks/to-do/` → `docs/tasks/in-progress/`
   - Read the task file from `to-do/` folder
   - Update frontmatter status: `status: to-do` → `status: in-progress`
   - Write the updated file to `docs/tasks/in-progress/` with same filename
   - Delete original from `to-do/`
   - Log: `Task moved: docs/tasks/to-do/[file] → docs/tasks/in-progress/[file]`

   **Forbidden actions in this step (lifecycle contract):**
   - Do not mark `status: done`
   - Do not move the file to `done/`
   - Do not skip the `for-review/` intermediate state by writing `status: done` in the frontmatter only.

2. Verify dependencies:
   - Check `docs/tasks/INDEX.md` (or `INDEX-S*.md`) for each dependency's status
   - If any dependency is `to-do` or `in-progress`: warn user
   - Offer options: "Proceed anyway (manual dependency management) or wait?"

3. Update `docs/tasks/INDEX.md`:
   - Update status table to reflect new location and status
   - Update cross-references if needed

**Status Transition:**

```
to-do/ (status: to-do) → in-progress/ (status: in-progress)
```

#### 2C. From Bare Prompt

When triage output is a bare prompt:

1. Create a minimal inline task list (structured locally, no files)
2. For 1-2 tasks: structure as simple checklist
3. For 3+ tasks or non-trivial: recommend creating task files
4. Present to user for approval before proceeding

### 3. Detect Execution Mode

Before detecting mode, validate task status transitions. Then apply the automatic mode selection decision tree. Full algorithm, decision tree, validation rules, conflict-detection heuristic, critical-path analysis, and parallel execution constraints are documented in [`references/mode-detection-algorithm.md`](references/mode-detection-algorithm.md).

**Summary of rules:**

- 1–2 tasks → INLINE; 3+ tasks → check dependencies and file conflicts.
- Dependencies or file conflicts → SERIAL (forced).
- No conflicts and independent tasks → PARALLEL with topological grouping (see §3.5 below).
- Idempotent status transitions allowed; cross-plan unit-id uniqueness enforced.

**Output:**

```yaml
executionMode: serial
executionModeReasoning: "5 tasks with sequential dependency chain (S1→S2→S3→S5→S6→S7)"
hasFileLevelConflicts: false
conflictingFiles: []
parallelSafetyGate: not-applicable
criticalPathMultiPlan: false
```

### 3.5 Topological Sort with Parallelization Groups (if parallel mode selected)

Generate task parallelization clusters for parallel/cross-plan execution. Full algorithm (Modified Kahn's Topological Sort), sync-point logic, and output schema are in [`references/mode-detection-algorithm.md` §"Topological Sort with Parallelization Groups"](references/mode-detection-algorithm.md#topological-sort-with-parallelization-groups-when-parallel-mode-selected).

---

### 4. Locate or Update Task Files (updated for cross-plan)

**Step 1 — Multi-plan task discovery:**

1. Glob pattern: `docs/tasks/**/*.md` (all plans)
2. For each file found, extract frontmatter `unit-id` and `plan` field
3. If `unit-id` matches current task → found existing task
4. If duplicate `unit-id` found in different plan → error "Duplicate unit-id: S1 in plans A and B"
5. Load task file with parent plan attribution

**Step 2 — Cross-reference validation:**

- Verify `plan` field in task frontmatter matches the plan we're executing
- Warn if plan reference mismatch

**Step 3 — Status field validation:**

- Apply task status state machine validation (from step 3)
- Update status if needed (e.g., from `to-do` → `in-progress`)

---

### 5. User Confirmation Checkpoint

Before proceeding to execution, present a summary and ask for confirmation:

---

**📋 Preparation Summary**

| Item       | Value                           |
| ---------- | ------------------------------- |
| **Branch** | `feat/slice-pwrl-work` (new)    |
| **Tasks**  | 5 tasks: S1 → S2 → S3 → S5 → S6 |
| **Mode**   | Serial (dependent chain)        |
| **GitHub** | Enabled, 3 tasks linked         |

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

| Scenario                             | Handling                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| Branch creation fails                | Log git error; ask user: "Resolve git state manually or retry?"               |
| Malformed task frontmatter           | Log details; ask user to fix and retry                                        |
| Circular dependencies detected       | Fail; ask user to resolve circular references                                 |
| User cancels at checkpoint           | Exit gracefully; preserve current state                                       |
| Blocking dependencies exist          | Warn; ask user: "Proceed anyway or wait for dependencies?"                    |
| GitHub integration check fails       | Log warning; continue without sync                                            |
| Task file doesn't exist              | Offer to create from plan; ask user: "Create task or provide different path?" |
| INDEX.md is missing                  | Create automatically; warn user                                               |
| No tasks in task list                | Block execution; ask user to review and confirm task list                     |
| Execution mode indeterminate         | Ask user to specify preferred mode                                            |
| Dependency chain >5 deep             | Flag for review; user can accept or simplify                                  |
| File conflicts detected              | Force serial mode; inform user                                                |
| GitHub sync skipped (missing issues) | Log warning; continue without sync                                            |

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
