---
unit-id: S3
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: for-review
created: 2026-06-05
type: PWRL Task
dependencies: [S1, S2]
files:
  - pwrl-work-prepare/SKILL.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
  - docs/learnings/decision/fallback-architecture-design-2026-06-05.md
---

# Task S3: Extract Environment Setup & Mode Selection (U2)

## Goal

Create the `pwrl-work-prepare` micro-skill that sets up the execution environment, creates task lists, and selects the appropriate execution mode (inline, serial, or parallel). This skill bridges triage output and task execution.

## Context

From S1 analysis, Phase 1 (Prepare) orchestrates:
1. Clarifying ambiguities with the user
2. Setting up branch strategy (new branch vs. direct commit)
3. Creating or updating task lists
4. Detecting execution mode based on task count and dependencies
5. Checking GitHub integration readiness

The key architectural decision is **Execution Mode Selection**: automatically detect if work should run inline (1-2 tasks), serial (3+ dependent), or parallel (3+ independent).

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Multi-skill workflows and state passing
  - Checkpoint patterns (user confirmation after each phase)
  - Applicability: Guides skill structure and user interaction points

- **Fallback Architecture Design** (`docs/learnings/decision/fallback-architecture-design-2026-06-05.md`):
  - Graceful degradation when optional features unavailable
  - Applicability: GitHub integration should be optional; skill works without it

## Implementation Steps

### Step 1: Create Skill Directory and Frontmatter

- Create directory: `pwrl-work-prepare/`
- Create file: `pwrl-work-prepare/SKILL.md`
- Add frontmatter:

```yaml
---
name: pwrl-work-prepare
description: Set up execution environment, create tasks, and select execution mode
argument-hint: "[Classified context from pwrl-work-triage]"
---
```

### Step 2: Document Purpose Section

Add "Purpose" section explaining:
- Environment setup (branch strategy, project state)
- Task creation or update (from task files or plan)
- Execution mode selection (inline/serial/parallel)
- GitHub integration readiness check
- Output: prepared context ready for execution

### Step 3: Implement Branch Strategy Confirmation

Add section for branch setup:

```markdown
#### Branch Strategy

1. Ask user: "Should this work be on a new branch or commit directly to [default branch]?"
   - New branch recommended for non-trivial work (3+ tasks or major changes)
   - Direct commit acceptable only for trivial changes and explicitly confirmed

2. If new branch:
   - Suggest branch name based on work type (e.g., `feat/pwrl-work-agent` for feature, `fix/xyz` for bug)
   - Ask user to confirm or provide custom name
   - Create branch: `git checkout -b <branch-name>`
   - Log branch creation

3. If direct commit:
   - Warn user: "Direct commits bypass branch protection; use only for trivial work"
   - Require explicit confirmation: "I understand this will commit directly"
   - Proceed only if confirmed

4. Output: Branch context object:
   ```
   {
     strategy: "new-branch" | "direct-commit",
     branchName: "feat/xyz" | null,
     created: true | false
   }
   ```
```

### Step 4: Implement Task List Creation for Plan Input

When input is a plan file:

```markdown
#### Create Tasks from Plan

1. Read plan file (from classified context)
2. For each implementation unit (U1, U2, ...):
   - Extract: unit ID, name, files affected, approach, acceptance criteria
   - Create task file in `docs/tasks/to-do/`:
     - Filename: `YYYY-MM-DD-[unit-id]-[slug].md`
     - Frontmatter: unit-id, plan link, status (to-do), dependencies, files, learnings
     - Body: Goal, Context, Implementation Steps, Test Scenarios, Acceptance Criteria
   - Preserve stable unit IDs from plan

3. Create `docs/tasks/INDEX.md` with:
   - List of all tasks (status table)
   - Dependency graph (ASCII or Markdown)
   - Critical path analysis
   - Recommended starting tasks (no dependencies)

4. Output: Task list context:
   ```
   {
     source: "plan",
     planFile: "docs/plans/2026-05-01-plan.md",
     taskCount: 5,
     tasks: [
       { unitId: "U1", file: "docs/tasks/to-do/...", dependencies: [] },
       { unitId: "U2", file: "docs/tasks/to-do/...", dependencies: ["U1"] },
       ...
     ]
   }
   ```
```

### Step 5: Implement Task List Update for Task Input

When input is a task file:

```markdown
#### Update Task Status for Single Task

1. For the provided task file:
   - Update status in frontmatter: `status: in-progress`
   - Move file from `docs/tasks/to-do/` to `docs/tasks/in-progress/` (if using directory organization)

2. Verify dependencies:
   - Check if all blocking tasks are completed (status: done)
   - If not, ask user: "Task has blocking dependencies. Proceed anyway or wait?"
   - If proceeding: warn about manual dependency management

3. Update `docs/tasks/INDEX.md`:
   - Move task to in-progress section
   - Update status column

4. Output: Task list context:
   ```
   {
     source: "task",
     taskFile: "docs/tasks/in-progress/2026-06-05-u1-task.md",
     taskCount: 1,
     tasks: [
       { unitId: "U1", file: "...", dependencies: ["U2"], blockedBy: [...] }
     ]
   }
   ```
```

### Step 6: Implement Execution Mode Detection

Add automatic mode selection logic:

```markdown
#### Execution Mode Selection

1. Count tasks:
   - 1-2 tasks: Recommend **Inline** mode
   - 3+ tasks: Check for dependencies and file conflicts

2. For 3+ tasks, build dependency graph:
   - Parse `dependencies` field from each task
   - Identify independent task sets (no dependencies between them)
   - Identify serial dependencies (A → B → C chains)

3. For potentially parallel tasks, check file overlap:
   - Build file-to-task map: for each file, which tasks modify it
   - If any file is touched by 2+ tasks: mark as conflict
   - If files don't conflict: parallel execution is safe

4. Decision tree:

   ```
   if taskCount <= 2:
     mode = INLINE
   else if hasDependencies:
     mode = SERIAL (dependencies must be respected)
   else if hasFileConflicts:
     mode = SERIAL (force safety; parallel would race)
   else:
     mode = PARALLEL (independent, non-conflicting tasks)
   ```

5. Document mode choice and reasoning:
   ```
   {
     executionMode: "inline" | "serial" | "parallel",
     taskCount: 5,
     hasFileLevelConflicts: false | true,
     conflictingFiles: [...], // if any
     parallelSafetyGate: "safe" | "forced-serial" | "not-applicable",
     reasoning: "5 independent tasks, no file conflicts detected"
   }
   ```

6. For parallel mode, document subagent constraints:
   - Subagents must not run full test suite (only targeted tests)
   - Subagents must not stage or commit (orchestrator does)
   - Subagents report results to main agent for aggregation
```

### Step 7: Implement GitHub Integration Check

Add GitHub readiness section:

```markdown
#### GitHub Integration Check

1. Read `.pwrlrc.json` to check if GitHub Issues integration is enabled:
   - Look for `integrations.githubIssues: true`
   - If not present or false: skip GitHub syncing, log "GitHub integration disabled"

2. If GitHub enabled AND task file has `github-issue` field:
   - Verify issue number is valid (numeric)
   - Prepare to sync status: mark as ready for S4 (sync-status skill)

3. If GitHub enabled AND creating tasks from plan:
   - Plan should define if issues should be created for each task
   - For now: note that issues will be created during task creation (S4 called by S5)

4. Output: GitHub readiness context:
   ```
   {
     githubEnabled: true | false,
     tasksWithIssues: ["U1", "U3"],
     readyForSync: true | false,
     reason: "GitHub disabled" | "No issues linked" | "Ready to sync"
   }
   ```
```

### Step 8: Add User Confirmation Checkpoint

Before proceeding to execution:

```markdown
#### Phase Completion Checkpoint

Summarize prepared context and ask user for confirmation:

**Summary to User:**
- Branch strategy: [new-branch: feature/xyz] or [direct commit]
- Task count: [5 tasks]
- Task list: [U1 → U2 → U3] (dependency graph)
- Execution mode: [Serial] (5 dependent tasks)
- GitHub sync: [Enabled, 3 tasks linked to issues]

**Ask User:**
"Ready to begin execution? Confirm to proceed to Phase 2 (Execute)."

**Options:**
- ✅ Yes, proceed to execution
- 🔄 Review branch strategy
- 📋 Review task list
- ❌ Cancel work
```

### Step 9: Add Error Handling

Document failure modes:

```markdown
#### Error Handling

❌ **Fail if:**
- Branch creation fails (git error)
- Blocked by non-resolvable dependency
- Task file format is invalid (can't read frontmatter)

⚠️ **Warn but continue if:**
- Task has blocking dependencies (user confirms to proceed)
- GitHub integration check fails (continue without sync)
- Task file doesn't exist (offer to create)

✅ **Proceed if:**
- Environment setup complete
- Task list created/updated
- Execution mode selected
- User confirms at checkpoint
```

### Step 10: Document State Object

Add schema documentation:

```markdown
### Output Context (Passed to Phase 2: Execute)

```json
{
  "branchStrategy": "new-branch",
  "branchName": "feat/pwrl-work-agent",
  "taskList": {
    "source": "plan",
    "planFile": "docs/plans/2026-06-05-002-slice-pwrl-work-skill.md",
    "taskCount": 11,
    "tasks": [
      {
        "unitId": "S1",
        "file": "docs/tasks/in-progress/2026-06-05-s1-analyze.md",
        "dependencies": [],
        "files": [],
        "status": "in-progress"
      }
    ]
  },
  "executionMode": "serial",
  "executionModeReasoning": "11 tasks with sequential dependencies",
  "githubIntegration": {
    "enabled": true,
    "tasksLinked": 11,
    "readyForSync": true
  }
}
```
```

## Test Scenarios

**Test 1: Plan-Based Task Creation**
- Input: Classified context from plan file (5 units)
- Expected: Create 5 task files in to-do; create INDEX.md; recommend serial mode
- Acceptance: Task files created; dependencies correct; mode = serial

**Test 2: Task File Preparation**
- Input: Classified context from single task file
- Expected: Update status to in-progress; move file; verify dependencies
- Acceptance: Task status updated; file moved; dependencies verified

**Test 3: Execution Mode: Inline (1-2 Tasks)**
- Input: Task list with 2 independent tasks
- Expected: Mode = inline; no subagents needed
- Acceptance: Mode correctly identified

**Test 4: Execution Mode: Serial (Dependent)**
- Input: Task list with 5 tasks, chain A → B → C, D → E
- Expected: Mode = serial; dependencies respected
- Acceptance: Mode = serial; dependency chain documented

**Test 5: Execution Mode: Parallel Safe**
- Input: 4 independent tasks, no file conflicts
- Expected: Mode = parallel; safety gate = safe
- Acceptance: Mode = parallel; parallel constraints documented

**Test 6: Execution Mode: Parallel Forced to Serial (File Conflict)**
- Input: 3 tasks, all modify `src/utils.ts`
- Expected: Mode = serial (despite independence); file conflict documented
- Acceptance: Mode downgraded; reason explained

**Test 7: GitHub Integration Enabled**
- Input: Tasks linked to GitHub issues; GitHub enabled
- Expected: GitHub readiness = true; prepare for sync
- Acceptance: Issues identified; ready for S4

**Test 8: GitHub Integration Disabled**
- Input: Tasks linked to GitHub issues; GitHub disabled
- Expected: GitHub readiness = false; skip syncing
- Acceptance: Skipped gracefully

**Test 9: Branch Strategy Confirmation**
- Input: User chooses new-branch
- Expected: Branch created; name documented in context
- Acceptance: Branch exists; context has branch name

**Test 10: User Cancels at Checkpoint**
- Input: User selects "Cancel" at confirmation
- Expected: Work halted gracefully; no tasks marked in-progress
- Acceptance: No side effects; user can retry

## Acceptance Criteria

✅ Skill successfully creates task files from plan (with dependencies, files, learnings)  
✅ Skill successfully updates single task file status and verifies dependencies  
✅ Execution mode detection is accurate (inline/serial/parallel)  
✅ File-conflict detection prevents unsafe parallelism  
✅ GitHub integration check works (enabled/disabled)  
✅ Branch strategy confirmed with user; branch created  
✅ INDEX.md generated with dependency graph and critical path  
✅ User confirmation checkpoint prevents accidental execution  
✅ All error cases handled (no crashes)  
✅ State object passed to S5 (Execute) is complete and well-formed  
✅ Ready for integration with S4 (GitHub sync) and S5 (Execute)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Unit U2 definition)
- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **S2 Output:** Classified context from `pwrl-work-triage`
- **Design:** Execution mode selection heuristic from plan
