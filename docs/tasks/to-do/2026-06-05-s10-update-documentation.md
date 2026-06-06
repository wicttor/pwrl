---
unit-id: S10
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: to-do
created: 2026-06-05
dependencies: [S2, S3, S4, S5, S6, S7, S8, S9]
files:
  - docs/examples/work-workflow.md
  - docs/examples/pwrl-work-agent-example.md
  - docs/examples/github-integration-example.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S10: Update Documentation & Examples

## Goal

Create comprehensive documentation for the sliced pwrl-work micro-skills, pwrl-work.agent.md orchestrator, fallback mechanism, and execution modes. Provide clear examples for all execution paths.

## Context

After implementing all micro-skills (S2-S7), orchestrator agent (S8), and fallback logic (S9), users need:
1. Clear documentation of each micro-skill's purpose and usage
2. Agent orchestration pattern explanation
3. Fallback strategy documentation
4. Examples for inline, serial, and parallel execution modes
5. GitHub integration workflow examples
6. Troubleshooting guide

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Multi-skill orchestration patterns
  - Checkpoint interactions
  - State passing between skills
  - Applicability: Documents overall architecture and workflow

## Implementation Steps

### Step 1: Update pwrl-work-triage SKILL.md Documentation

Ensure `pwrl-work-triage/SKILL.md` has:
- Clear purpose statement
- Input/output schema documentation
- Complexity estimation heuristic documented
- Dependency resolution logic explained
- Error handling documented
- Usage examples

### Step 2: Update pwrl-work-prepare SKILL.md Documentation

Ensure `pwrl-work-prepare/SKILL.md` has:
- Clear purpose statement
- Branch strategy options explained
- Execution mode selection heuristic documented
- File-conflict detection logic explained
- GitHub integration check documented
- Checkpoint confirmation flow explained
- Usage examples

### Step 3: Update pwrl-work-sync-status SKILL.md Documentation

Ensure `pwrl-work-sync-status/SKILL.md` has:
- Clear purpose statement (utility, reusable)
- GitHub integration check logic
- Status-to-label mapping documented
- Comment templates documented
- Dry-run mode explained
- Error handling documented
- Usage examples

### Step 4: Update pwrl-work-execute SKILL.md Documentation

Ensure `pwrl-work-execute/SKILL.md` has:
- Clear purpose statement
- Inline execution mode explained with examples
- Serial execution mode explained with examples
- Parallel execution mode explained with examples
- Subagent constraints documented
- Quality gate explanations
- Test running strategy
- Progress reporting examples
- Usage examples for all modes

### Step 5: Update pwrl-work-review SKILL.md Documentation

Ensure `pwrl-work-review/SKILL.md` has:
- Clear purpose statement
- Duplication detection examples
- Helper extraction patterns
- System check explanations (events, mocks, idempotency, entry points)
- Design spec comparison process
- Refactoring scope control rules
- Output summary format
- Usage examples

### Step 6: Update pwrl-work-ship SKILL.md Documentation

Ensure `pwrl-work-ship/SKILL.md` has:
- Clear purpose statement
- Final test suite documentation
- Linting/formatting verification
- Diff review process
- User approval checkpoint
- Commit message format
- Push and branch management
- End-session offer
- Error handling guide
- Usage examples

### Step 7: Create Work Workflow Examples (`docs/examples/work-workflow.md`)

Document complete workflows with examples:

```markdown
# PWL-Work Workflow Examples

## Overview

This document covers execution workflows for the sliced pwrl-work skill and micro-skills.
Learn about inline, serial, and parallel execution modes with real examples.

## Quick Start

### Inline Execution (1-2 Tasks)

```
$ /pwrl-work docs/tasks/to-do/2026-06-05-s1-analyze-pwrl-work.md

[START] /pwrl-work
  Input: docs/tasks/to-do/2026-06-05-s1-analyze-pwrl-work.md

[Triage] Classifying input...
  Type: task
  Unit ID: S1
  Complexity: small

[Prepare] Setting up environment...
  Branch: feat/pwrl-work-agent (new)
  Task Count: 1
  Mode: Inline (1-2 tasks, no subagents)
  GitHub: Enabled

Ready to execute? (y/n): y

[Execute] Running task S1...
  → Reading target files...
  → Creating analysis document...
  → Documenting phase breakdown...
  ✓ Task complete

[Review] Checking quality...
  → No duplications found
  → System checks pass ✓
  Ready for shipping

[Ship] Finalizing work...
  ✓ Tests pass
  ✓ No lint errors
  ✓ Diff clean
  
Ready to ship? (y/n): y
  → Staging changes...
  → Creating commit...
  ✓ Commit: a1b2c3d "docs: Analyze pwrl-work structure (S1)"
  → Pushing...
  ✓ Pushed to feat/pwrl-work-agent

Use /pwrl-end-session? (y/n): y
```

### Serial Execution (3+ Dependent Tasks)

```
$ /pwrl-work docs/plans/2026-06-05-002-slice-pwrl-work-skill.md

[START] /pwrl-work
  Input: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md

[Triage] Classifying input...
  Type: plan
  Complexity: standard (11 units)

[Prepare] Setting up environment...
  Branch: feat/pwrl-work-agent (new)
  Tasks: 11 (S1-S11 with dependencies)
  Mode: Serial (dependencies detected)
  GitHub: Enabled

Ready to execute? (y/n): y

[Execute] Running tasks sequentially...
  [1/11] Spawning subagent for S1 (no dependencies)...
  [1/11] S1 complete ✓
  [2/11] Spawning subagent for S2 (depends on S1)...
  [2/11] S2 complete ✓
  [3/11] Spawning subagent for S3 (depends on S1, S2)...
  [3/11] S3 complete ✓
  ...
  [11/11] S11 complete ✓
  
  Running full test suite...
  ✓ 127 tests pass

[Review] Checking quality...
  → Duplication detected (2 instances)
  → Consolidating validators...
  → Extracted validateInput() helper
  → System checks pass ✓

[Ship] Finalizing work...
  ✓ Tests pass
  ✓ No lint errors
  ✓ Formatting ok
  
Ready to ship? (y/n): y
  → Staging changes...
  → Creating commit...
  ✓ Commit: abc1234 "feat: Slice pwrl-work into micro-skills (S1-S11)"
  → Pushing...
  ✓ Pushed to feat/pwrl-work-agent

Use /pwrl-end-session? (y/n): y
```

### Parallel Execution (Independent Tasks)

```
$ /pwrl-work docs/plans/2026-06-04-parallel-features.md --parallel

[START] /pwrl-work
  Input: docs/plans/2026-06-04-parallel-features.md

[Triage] Classifying input...
  Type: plan
  Complexity: standard (4 independent features)

[Prepare] Setting up environment...
  Branch: feat/parallel-work
  Tasks: 4 (no dependencies, no file conflicts)
  Mode: Parallel (independent tasks safe)
  GitHub: Enabled

Ready to execute? (y/n): y

[Execute] Running tasks in parallel...
  Spawning 4 subagents...
  [F1] Feature 1 started...
  [F2] Feature 2 started...
  [F3] Feature 3 started...
  [F4] Feature 4 started...
  
  [F1] Subagent complete ✓
  [F2] Subagent complete ✓
  [F3] Subagent complete ✓
  [F4] Subagent complete ✓
  
  Aggregating results: 4 completed, 0 failed
  Running full integration test suite...
  ✓ 95 tests pass (no integration issues)

[Review] Checking quality...
  → No duplications found
  → System checks pass ✓

[Ship] Finalizing work...
  ✓ Tests pass
  ✓ All features integrated
  
Ready to ship? (y/n): y
  → Staging all changes...
  → Creating commit...
  ✓ Commit: def5678 "feat: Add parallel features (F1-F4)"
  → Pushing...
  ✓ Pushed to feat/parallel-work

Use /pwrl-end-session? (y/n): y
```

## Execution Mode Comparison

| Aspect                 | Inline          | Serial                | Parallel             |
| ---------------------- | --------------- | --------------------- | -------------------- |
| Best For               | 1-2 tasks       | 3+ tasks, dependencies | 3+ independent tasks |
| Subagents              | None            | Sequential spawning   | Concurrent spawning  |
| Test Suite             | Targeted        | Full after all tasks  | Full integration test |
| Parallelism            | N/A             | Sequential            | Concurrent           |
| Complexity             | Simple          | Moderate              | High (more moving parts) |
| Failure Recovery       | Retry task      | Retry from task       | Retry failed subagent |
| Git Commits            | Main agent      | Main agent            | Main agent           |
| Recommended            | Dev/debugging   | Most workflows        | Large independent features |

## Common Workflows

### Workflow 1: Single Bug Fix

```
# Simple fix to one file, one test

$ /pwrl-work docs/tasks/to-do/2026-06-05-fix-email-validation.md

→ Inline mode (1 task)
→ Test first: write failing test
→ Implement fix
→ Tests pass ✓
→ Shipped
```

### Workflow 2: Feature Implementation

```
# Multi-part feature (3-5 tasks with dependencies)

$ /pwrl-work docs/plans/2026-06-05-add-user-auth.md

→ Serial mode (5 dependent tasks)
→ Create task list
→ Execute sequentially: Auth → Validation → UI → Docs → Tests
→ All tests pass ✓
→ Shipped
```

### Workflow 3: Large Feature Set

```
# Multiple independent features (4+ tasks, no dependencies)

$ /pwrl-work docs/plans/2026-06-05-independent-improvements.md --parallel

→ Parallel mode (4 independent features)
→ Spawn 4 subagents concurrently
→ All complete without file conflicts ✓
→ Integration tests verify no regressions
→ Shipped
```

## Troubleshooting

[Common issues and solutions...]
```

### Step 8: Create Agent Example (`docs/examples/pwrl-work-agent-example.md`)

Document agent-specific usage:

```markdown
# PWL-Work Agent Examples

## Overview

This document covers the `pwrl-work.agent.md` orchestrator agent specifically.
Learn how the agent manages micro-skills and checkpoints.

## Agent Architecture

```
Input
  ↓ (Triage Skill: classify input)
  ↓ CHECKPOINT 1: Confirm triage result
  ↓ (Prepare Skill: setup environment)
  ↓ CHECKPOINT 2: Confirm branch/tasks/mode
  ↓ (Execute Skill: run tasks)
  ↓ CHECKPOINT 3: Confirm execution results
  ↓ (Review Skill: consolidate code)
  ↓ CHECKPOINT 4: Confirm review findings
  ↓ (Ship Skill: finalize and commit)
  ↓ CHECKPOINT 5: Final approval
  ↓
Output
```

## Agent Invocation

### Direct Agent Call

```
/pwrl-work docs/plans/2026-06-05-002-slice-pwrl-work-skill.md

[When agents enabled, agent is called directly]

→ Agent orchestrates all phases
→ Agent manages checkpoints
→ Agent coordinates subagents
→ Agent returns final results
```

### Fallback to Monolithic (Agents Disabled)

```
/pwrl-work docs/plans/2026-06-05-002-slice-pwrl-work-skill.md

[When agents disabled or agent file missing]

→ Monolithic pwrl-work skill executes
→ All phases run inline
→ Same checkpoints maintained
→ Same results returned
```

## Checkpoint Flow

### Checkpoint 1: Triage Results

```
Triaged Input: plan file
Complexity: standard
Units: 11 (S1-S11)
Planning recommended: No

Proceed? (y/n): y
```

### Checkpoint 2: Environment Setup

```
Branch Strategy: New branch (feat/pwrl-work-agent)
Task Count: 11
Task List: S1 → S2 → ... → S11 (dependencies shown)
Execution Mode: Serial (dependencies detected)
GitHub Integration: Enabled, 11 tasks can be synced

Ready to execute? (y/n/review): y
```

### Checkpoint 3: Execution Results

```
Execution Mode: Serial
Tasks Executed: 11
Tasks Completed: 11
Tasks Failed: 0
Tests Passed: 127
Coverage: 92%

All tasks complete? (y/n): y
```

### Checkpoint 4: Review Findings

```
Review Complete:
  Duplications found: 2
  Duplications consolidated: 2
  Helpers extracted: 1 (validateInput)
  System checks: All pass
  Ready for shipping: YES

Proceed to shipping? (y/n): y
```

### Checkpoint 5: Final Approval

```
Final Checks:
  Tests: 127 passed ✓
  Linting: No errors ✓
  Formatting: No violations ✓
  Diff: Clean (12 files, +450 LOC) ✓

Ready to ship? (y/n): y

→ Commit created
→ Pushed to feat/pwrl-work-agent

Use /pwrl-end-session? (y/n): y
```

## Advanced: Parallel Execution via Agent

```
/pwrl-work docs/plans/2026-06-04-features.md --parallel

[Agent orchestrates parallel execution]

Phase 1-2: Triage & Prepare
  → Detect: 4 independent tasks, no dependencies
  → Detect: No file conflicts
  → Select: Parallel mode

Phase 3: Execute (Parallel)
  → Spawn 4 subagents concurrently
  → Subagent 1: Task A (files: src/a.ts)
  → Subagent 2: Task B (files: src/b.ts)
  → Subagent 3: Task C (files: src/c.ts)
  → Subagent 4: Task D (files: src/d.ts)
  
  → All subagents complete
  → Main agent runs full integration tests
  → Verify no conflicts or regressions
  → All tasks marked for-review

Phase 4-5: Review & Ship
  → Consolidate results
  → Create combined commit
  → Push all changes
```

[More examples...]
```

### Step 9: Create GitHub Integration Example (`docs/examples/github-integration-example.md`)

Document GitHub workflow:

```markdown
# GitHub Integration Examples

## Overview

This document covers GitHub Issues integration with pwrl-work.
Learn how tasks sync with GitHub and maintain status.

## GitHub Integration Features

- **Automatic Issue Creation:** Tasks create GitHub issues when enabled
- **Status Syncing:** Task status synced to issue labels
- **Comment Posting:** Progress updates posted as comments
- **Assignee Management:** Issues assigned to current user
- **Label Management:** Status labels added/removed automatically

## Enable GitHub Integration

First, initialize GitHub integration:

```
/pwrl init
? Use GitHub Issues? Yes
? GitHub username: wicttor
? GitHub repository: pwrl
```

This creates `.pwrlrc.json`:

```json
{
  "integrations": {
    "githubIssues": true,
    "github": {
      "owner": "wicttor",
      "repo": "pwrl"
    }
  }
}
```

## Workflow Example: Task with GitHub Issue

### 1. Create Tasks from Plan

```
$ /pwrl-work docs/plans/2026-06-05-add-user-auth.md

[Prepare] Creating 5 task files...
  → docs/tasks/to-do/2026-06-05-u1-setup-auth.md
  → docs/tasks/to-do/2026-06-05-u2-add-password-hash.md
  → docs/tasks/to-do/2026-06-05-u3-add-login-endpoint.md
  → docs/tasks/to-do/2026-06-05-u4-add-tests.md
  → docs/tasks/to-do/2026-06-05-u5-add-docs.md

[GitHub] Creating GitHub issues...
  → Issue #42: U1 Setup authentication (to-do)
  → Issue #43: U2 Add password hashing (to-do)
  → Issue #44: U3 Add login endpoint (to-do)
  → Issue #45: U4 Add tests (to-do)
  → Issue #46: U5 Add documentation (to-do)

[GitHub] Updated task frontmatter:
  github-issue: 42 (U1)
  github-issue: 43 (U2)
  github-issue: 44 (U3)
  github-issue: 45 (U4)
  github-issue: 46 (U5)
```

### 2. Work on Task

```
$ /pwrl-work docs/tasks/to-do/2026-06-05-u1-setup-auth.md

[Execute] Running task U1...

[GitHub] Syncing status to-do → in-progress
  ✓ Issue #42: Removed label 'to-do', added label 'in-progress'
  ✓ Issue #42: Posted comment:
    "🚀 Started work on this task
     Task file: docs/tasks/in-progress/2026-06-05-u1-setup-auth.md
     Started at: 2026-06-05T10:30:00Z
     Branch: feat/add-auth"

[Implementation] Writing code...
  → Created src/auth/setup.ts
  → Running tests...
  ✓ Tests pass

[GitHub] Syncing status in-progress → for-review
  ✓ Issue #42: Removed label 'in-progress', added label 'for-review'
  ✓ Issue #42: Posted comment:
    "🔍 Ready for review
     Implementation summary: Set up auth module with config
     Commits: abc1234e5f6789
     Changed files: src/auth/setup.ts, tests/auth.spec.ts"

Task complete! Status: for-review
```

### 3. View on GitHub

**GitHub Issue #42 After Work:**

```
[U1] Setup authentication

🏷️  Labels: pwrl-task, for-review

💬 Comments:
  🚀 Started work on this task
     Task file: docs/tasks/in-progress/2026-06-05-u1-setup-auth.md
     Started at: 2026-06-05T10:30:00Z
     Branch: feat/add-auth
  
  🔍 Ready for review
     Implementation summary: Set up auth module with config
     Commits: abc1234e5f6789
     Changed files: src/auth/setup.ts, tests/auth.spec.ts
```

### 4. Multiple Tasks in Parallel

```
$ /pwrl-work docs/plans/2026-06-05-add-user-auth.md --parallel

[GitHub] Syncing 4 tasks to-do → in-progress
  ✓ Issue #43: Label added 'in-progress'
  ✓ Issue #44: Label added 'in-progress'
  ✓ Issue #45: Label added 'in-progress'
  ✓ Issue #46: Label added 'in-progress'

[Execute] Running 4 subagents in parallel...
  [U2] Subagent started...
  [U3] Subagent started...
  [U4] Subagent started...
  [U5] Subagent started...

  [U2] Subagent complete ✓
  [U3] Subagent complete ✓
  [U4] Subagent complete ✓
  [U5] Subagent complete ✓

[GitHub] Syncing 4 tasks in-progress → for-review
  ✓ Issue #43: Labels updated
  ✓ Issue #44: Labels updated
  ✓ Issue #45: Labels updated
  ✓ Issue #46: Labels updated
```

## Disable GitHub Integration

To skip GitHub sync:

1. Edit `.pwrlrc.json` and set `githubIssues: false`
2. Or run: `/pwrl-work <input> --no-github`

Tasks will still execute normally, but no GitHub updates will occur.

[More examples...]
```

### Step 10: Create Micro-Skills Quick Reference

Create a summary document linking to all micro-skills:

```markdown
# PWL-Work Micro-Skills Reference

## Architecture Overview

The monolithic `pwrl-work` skill has been decomposed into focused micro-skills:

| Skill                        | Phase | Purpose                                    |
| ---------------------------- | ----- | ------------------------------------------ |
| `pwrl-work-triage`           | 0     | Classify input, estimate complexity        |
| `pwrl-work-prepare`          | 1     | Setup environment, select execution mode   |
| `pwrl-work-sync-status`      | Util  | Sync task status to GitHub Issues          |
| `pwrl-work-execute`          | 2     | Execute tasks (inline/serial/parallel)     |
| `pwrl-work-review`           | 3     | Review code, consolidate duplication       |
| `pwrl-work-ship`             | 4     | Final checks, approve, commit, push        |

## Micro-Skills

### Phase 0: pwrl-work-triage

**Location:** `pwrl-work-triage/SKILL.md`

**Purpose:** Input classification and context extraction

**Input:** Task/plan path or bare prompt

**Output:** Classified context (type, complexity, dependencies)

**Key Functions:**
- Classify input type (task file, plan file, prompt)
- Estimate complexity (trivial, small, medium, large)
- Resolve and validate dependencies
- Detect circular dependencies

**Example:**
```
/pwrl-work-triage docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
→ Output: {inputType: "plan", complexity: "standard", units: 11}
```

### Phase 1: pwrl-work-prepare

**Location:** `pwrl-work-prepare/SKILL.md`

**Purpose:** Environment setup and execution mode selection

**Input:** Classified context from triage

**Output:** Prepared context (branch, tasks, mode, GitHub ready)

**Key Functions:**
- Confirm branch strategy
- Create/update task files
- Detect execution mode (inline/serial/parallel)
- Verify file-conflict safety
- Check GitHub integration

**Example:**
```
/pwrl-work-prepare <triage-context>
→ Output: {branch: "feat/xyz", tasks: 11, mode: "serial", githubReady: true}
```

### Utility: pwrl-work-sync-status

**Location:** `pwrl-work-sync-status/SKILL.md`

**Purpose:** GitHub Issues synchronization

**Input:** Task file, new status, summary (optional)

**Output:** Sync result (success/failed)

**Key Functions:**
- Check GitHub integration enabled
- Update issue labels
- Post status comments
- Handle errors gracefully

**Example:**
```
/pwrl-work-sync-status docs/tasks/in-progress/u1-task.md in-progress
→ Output: {success: true, issueNumber: 42, labelsUpdated: true}
```

### Phase 2: pwrl-work-execute

**Location:** `pwrl-work-execute/SKILL.md`

**Purpose:** Task execution with quality gates

**Input:** Prepared context with task list

**Output:** Execution results (tasks completed, tests passed, commit hash)

**Key Functions:**
- Execute tasks (inline mode: direct, serial mode: sequential subagents, parallel mode: concurrent subagents)
- Run tests after each logical unit
- Manage quality gates
- Update task status
- Sync to GitHub

**Example:**
```
/pwrl-work-execute <prepared-context>
→ Output: {mode: "serial", tasksCompleted: 11, testsPassed: true, commitHash: "abc123"}
```

### Phase 3: pwrl-work-review

**Location:** `pwrl-work-review/SKILL.md`

**Purpose:** Code consolidation and system checks

**Input:** Execution results with code changes

**Output:** Review summary (consolidations, recommendations, readiness)

**Key Functions:**
- Detect duplication
- Extract helpers
- Run system checks (events, mocks, idempotency, entry points)
- Compare UI to design specs
- Control refactoring scope

**Example:**
```
/pwrl-work-review <execution-results>
→ Output: {duplicationsFound: 2, consolidationsMade: 2, readyForShipping: true}
```

### Phase 4: pwrl-work-ship

**Location:** `pwrl-work-ship/SKILL.md`

**Purpose:** Finalization, approval, and shipping

**Input:** Review results with final code

**Output:** Shipping status (commit hash, pushed to remote)

**Key Functions:**
- Run final test suite
- Verify linting/formatting
- Review diff for regressions
- Request user approval
- Stage, commit, push
- Offer end-session

**Example:**
```
/pwrl-work-ship <review-results>
→ Output: {shipped: true, commitHash: "def456", pushed: true}
```

## Orchestration

When agents are enabled, `pwrl-work.agent.md` orchestrates these skills:

```
triage → [checkpoint 1] → prepare → [checkpoint 2] → execute → [checkpoint 3] → review → [checkpoint 4] → ship → [checkpoint 5]
```

## Usage

### Direct Skill Calls

```
/pwrl-work-triage docs/tasks/to-do/u1.md
/pwrl-work-prepare <context>
/pwrl-work-execute <context>
/pwrl-work-review <context>
/pwrl-work-ship <context>
```

### Via Orchestrator Agent

```
/pwrl-work docs/tasks/to-do/u1.md  [agents enabled → delegates to agent]
/pwrl-work docs/plans/plan.md      [agents disabled → runs monolithic fallback]
```

### Via Monolithic Fallback

```
/pwrl-work docs/tasks/to-do/u1.md  [agents unavailable → monolithic fallback]
```

[More reference info...]
```

## Test Scenarios

**Test 1: Skill Documentation Complete**
- Verify each micro-skill has complete SKILL.md
- Verify clear purpose, input/output, examples
- Acceptance: All skills documented

**Test 2: Example Workflows Clear**
- Inline, serial, parallel examples provided
- Checkpoints documented
- Troubleshooting guide included
- Acceptance: Examples are clear and executable

**Test 3: GitHub Integration Documented**
- Status syncing flow explained
- Issue creation process documented
- Label management documented
- Error handling shown
- Acceptance: Users can enable and use GitHub integration

**Test 4: Quick Reference Complete**
- All micro-skills listed with purposes
- Quick commands provided
- Link to detailed docs
- Acceptance: Users can quickly understand architecture

## Acceptance Criteria

✅ All micro-skill SKILL.md files complete and clear  
✅ pwrl-work.agent.md documented with orchestration flow  
✅ Fallback mechanism explained transparently  
✅ Inline/serial/parallel execution examples provided  
✅ GitHub integration workflow documented  
✅ Checkpoint flow explained with examples  
✅ Troubleshooting guide for common issues  
✅ Quick reference for all micro-skills  
✅ Examples are executable and realistic  
✅ Ready for S11 (integration testing)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md`
- **Agent:** `agents/pwrl-work.agent.md`
- **Micro-Skills:** `pwrl-work-*/SKILL.md` (all 6 skills)
