---
unit-id: S8
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: done
created: 2026-06-05
dependencies: [S2, S3, S4, S5, S6, S7]
files:
  - agents/pwrl-work.agent.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S8: Create pwrl-work.agent.md Orchestrator

## Goal

Create the `pwrl-work.agent.md` agent file that orchestrates all micro-skills (S2-S7) in sequence, managing state and user confirmations at each checkpoint.

## Context

After all micro-skills are implemented (S2-S7), we need an orchestrator agent that:
1. Calls skills in proper sequence (triage → prepare → execute → review → ship)
2. Passes state between skills (context objects)
3. Manages user confirmations at key checkpoints
4. Handles skill failures and recovery
5. Coordinates GitHub syncing (S4 utility)

This mirrors the successful pattern established in `pwrl-planner.agent.md`.

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Agent orchestration pattern: sequential skill calling
  - Checkpoint pattern: user confirmations between phases
  - State passing: context objects between skills
  - Applicability: Defines orchestration structure, checkpoints, state schema

## Implementation Steps

### Step 1: Create Agent File

- Create file: `agents/pwrl-work.agent.md`
- Add frontmatter with agent metadata (name, description, inputs, outputs)

```yaml
---
name: pwrl-work
description: Orchestrate work execution from triage through shipping
role: execution-orchestrator
entry-point: triage-input
---
```

### Step 2: Document Agent Overview

Add overview section explaining:
- Agent purpose: coordinate pwrl-work-* micro-skills
- Workflow phases: 5 (triage → prepare → execute → review → ship)
- Checkpoints: user confirmations at each phase
- State management: context object flow
- Error handling: skill failures and recovery

### Step 3: Define Phase 1: Triage

Document triage orchestration:

```markdown
## Phase 1: Triage Input

**Skill Call:** `pwrl-work-triage`

**Input:**
- User-provided input: task file path, plan file path, or bare prompt
- User preferences (optional flags)

**Process:**
1. Call skill: `/pwrl-work-triage <input>`
2. Receive classified context:
   ```
   {
     inputType: "task" | "plan" | "prompt",
     complexity: "trivial" | "small" | "medium" | "large",
     ... (type-specific fields)
   }
   ```

**Checkpoint:**
- For large complexity: ask user confirmation
  "Complexity estimated as [large]. Planning is recommended. Continue anyway? (y/n)"
- If no: offer `/pwrl-plan` workflow instead

**State for Phase 2:**
- Save classified context in memory
- Mark phase complete
- Proceed to Phase 2
```

### Step 4: Define Phase 2: Prepare

Document prepare orchestration:

```markdown
## Phase 2: Prepare Environment

**Skill Call:** `pwrl-work-prepare`

**Input:**
- Classified context from Phase 1

**Process:**
1. Call skill: `/pwrl-work-prepare <context>`
2. Receive prepared context:
   ```
   {
     branchStrategy: "new-branch" | "direct-commit",
     branchName: "feat/xyz" | null,
     taskList: { ... },
     executionMode: "inline" | "serial" | "parallel",
     githubIntegration: { enabled: true/false, readyForSync: true/false }
   }
   ```

**Checkpoint:**
- Ask user confirmation at phase end:
  "Branch: [branch-name], Tasks: [count], Mode: [inline/serial/parallel]"
  "Ready to execute? (y/n/review)"
  - If review: show task list again, ask confirmation
  - If no: cancel work
- User confirms: proceed to Phase 3

**State for Phase 3:**
- Save prepared context
- Mark phase complete
- Proceed to Phase 3
```

### Step 5: Define Phase 3: Execute

Document execute orchestration:

```markdown
## Phase 3: Execute Tasks

**Skill Call:** `pwrl-work-execute`

**Input:**
- Prepared context from Phase 2
- Execution mode (inline/serial/parallel)

**Process:**
1. Call skill: `/pwrl-work-execute <prepared-context>`
2. Skill internally:
   - For inline mode: execute tasks in skill flow
   - For serial mode: spawn subagents sequentially
   - For parallel mode: spawn subagents in parallel
3. Receive execution results:
   ```
   {
     mode: "inline" | "serial" | "parallel",
     taskCount: N,
     tasksCompleted: N,
     tasksFailed: 0,
     testsPassed: true,
     results: [ { unitId: "U1", status: "for-review", ... }, ... ],
     commitHash: "abc123" | null
   }
   ```

**During Execution:**
- Display progress to user (task count, status, test results)
- If task fails: ask user "Continue with remaining tasks or stop?"
- If task blocked: ask user to resolve or skip

**Checkpoint:**
- If any tasks failed/blocked: ask user confirmation
  "Some tasks not completed. Review and retry? (y/n/review)"
  - If yes: can re-execute or move to review as-is
  - If no: cancel remaining work
- If all tasks completed: proceed to Phase 4

**State for Phase 4:**
- Save execution results
- Mark phase complete
- Proceed to Phase 4
```

### Step 6: Define Phase 4: Review

Document review orchestration:

```markdown
## Phase 4: Review & Simplify

**Skill Call:** `pwrl-work-review`

**Input:**
- Execution results from Phase 3
- Reviewed/simplified code state

**Process:**
1. Call skill: `/pwrl-work-review <execution-results>`
2. Skill internally:
   - Detects duplication
   - Consolidates helpers
   - Runs system checks
   - Compares UI specs (if applicable)
3. Receive review results:
   ```
   {
     duplicationFound: true/false,
     duplicationsConsolidated: N,
     helpersExtracted: M,
     systemChecks: { ... },
     readyForShipping: true/false,
     recommendations: [ "...", ... ]
   }
   ```

**Checkpoint:**
- If not ready for shipping: show recommendations
  "Review identified [issues]. Address before shipping? (y/n)"
  - If yes: can continue Phase 3 for rework
  - If no: accept risks and proceed to Phase 5
- If ready: proceed to Phase 5

**State for Phase 5:**
- Save review results
- Mark phase complete
- Proceed to Phase 5
```

### Step 7: Define Phase 5: Ship

Document ship orchestration:

```markdown
## Phase 5: Ship & Finalize

**Skill Call:** `pwrl-work-ship`

**Input:**
- Review results from Phase 4
- Final code state

**Process:**
1. Call skill: `/pwrl-work-ship <review-results>`
2. Skill internally:
   - Runs final tests
   - Verifies formatting/linting
   - Reviews diff
   - Requests user approval
   - Creates and pushes commit
3. Receive shipping results:
   ```
   {
     success: true/false,
     status: "shipped" | "failed",
     commitHash: "abc123",
     commitMessage: "...",
     nextSteps: [ "...", ... ]
   }
   ```

**Checkpoint:**
- Before final commit: user approval (handled by skill)
  "Ready to ship? (y/n)"
  - If no: cancel shipping, offer to revert or save as draft
  - If yes: proceed to commit
- After successful ship: offer end-session
  "Use `/pwrl-end-session` to create summary commit? (y/n)"
  - If yes: call end-session skill
  - If no: complete agent

**State on Completion:**
- Mark all phases complete
- Return final results
- Agent completes
```

### Step 8: Implement State Management

Document state flow:

```markdown
## State Management

**State Object (flows through all phases):**

```json
{
  "session": {
    "startTime": "2026-06-05T10:00:00Z",
    "branch": "feat/pwrl-work-agent",
    "githubEnabled": true
  },
  "phases": {
    "triage": {
      "complete": true,
      "input": { inputType: "plan", ... },
      "classified": { complexity: "standard", ... }
    },
    "prepare": {
      "complete": true,
      "taskList": { count: 11, tasks: [...] },
      "executionMode": "serial"
    },
    "execute": {
      "complete": true,
      "tasksCompleted": 11,
      "testsPassed": true,
      "commitHash": "abc123"
    },
    "review": {
      "complete": true,
      "duplicationsConsolidated": 2,
      "readyForShipping": true
    },
    "ship": {
      "complete": true,
      "shipped": true,
      "finalCommitHash": "def456"
    }
  }
}
```

**State Passing:**
- Store state in memory or lightweight markdown
- Pass state to each skill call
- Each skill enriches state
- Final state returned to user
```

### Step 9: Implement Error Handling and Recovery

Document failure handling:

```markdown
## Error Handling & Recovery

**Skill Failure Scenarios:**

| Scenario              | Handling                                           |
| --------------------- | -------------------------------------------------- |
| Skill fails (error)   | Catch error, log, offer retry or user manual fix   |
| User cancels phase    | Log cancellation, offer to resume or abort         |
| Dependency not met    | Check state, warn user, ask to proceed anyway      |
| Network error         | Retry up to 3 times, then ask user to retry manually |
| Git error             | Show error, ask user to resolve git state, retry   |

**Recovery Options:**
1. **Retry:** Re-run failed phase from beginning
2. **Manual Fix:** User fixes issue manually, then resume from phase
3. **Abort:** Cancel current work, preserve state for later
4. **Rollback:** Revert to last known good state (use git)

**Implementation:**
- Wrap each skill call in try-catch
- Log errors with context
- Offer user recovery options
- Allow resumption from any phase (if possible)
```

### Step 10: Document Checkpoint Interactions

Document all user confirmations:

```markdown
## Checkpoint Interactions

### Phase 1 → Phase 2 Checkpoint
```
Triaged Input: [type: plan]
Complexity: [standard]

Continue? (y/n): _
```

### Phase 2 → Phase 3 Checkpoint
```
Environment Prepared:
  Branch: feat/pwrl-work-agent
  Tasks: 11 (S1-S11)
  Mode: Serial (dependencies present)
  GitHub: Enabled

Ready to execute? (y/n/review): _
```

### Phase 3 → Phase 4 Checkpoint
```
Execution Summary:
  Tasks: 11 completed, 0 failed
  Tests: 127 passed ✓
  Mode: Serial

Ready for review? (y/n): _
```

### Phase 4 → Phase 5 Checkpoint
```
Review Summary:
  Duplications consolidated: 2
  Helpers extracted: 1
  System checks: All pass
  Ready for shipping: YES

Proceed to shipping? (y/n): _
```

### Phase 5 → End Checkpoint (within skill)
```
[From pwrl-work-ship]
All checks pass:
  Tests: 127 passed ✓
  Linting: No errors ✓
  Formatting: No violations ✓

Ready to ship? (y/n): _

[After successful ship]
Use /pwrl-end-session? (y/n): _
```
```

### Step 11: Document Example Usage

Add examples showing agent invocation:

```markdown
## Usage Examples

### Example 1: Execute from Plan File
```
/pwrl-work docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
```

Flow:
1. Triage: Classify plan file
2. Prepare: Create 11 tasks, select serial mode
3. Execute: Run S1-S11 sequentially, all tests pass
4. Review: Consolidate 2 duplications, all checks pass
5. Ship: Commit and push
6. End: Offer end-session

### Example 2: Execute from Task File
```
/pwrl-work docs/tasks/to-do/2026-06-05-s1-analyze-pwrl-work.md
```

Flow:
1. Triage: Classify task file, resolve dependencies
2. Prepare: Update task status, select inline mode (1 task)
3. Execute: Run S1 directly (no subagents)
4. Review: Check for duplication (none found)
5. Ship: Commit and push
6. End: Offer end-session

### Example 3: Parallel Execution (Independent Tasks)
```
/pwrl-work docs/plans/2026-06-05-002-slice-pwrl-work-skill.md --parallel
```

Flow:
1. Triage: Classify plan file
2. Prepare: Detect 11 tasks, check for file conflicts
   - Find: Tasks have dependencies, cannot parallelize
   - Recommend: Serial mode instead
3. Execute: Run serially (forced safety)
```
```

## Test Scenarios

**Test 1: Full Workflow Execution**
- Input: Plan file with 11 units
- Expected: All phases execute, user confirmations at checkpoints
- Acceptance: Final commit created, pushed, all phases logged

**Test 2: User Cancels at Prepare Checkpoint**
- Input: Plan file, user selects "Cancel" at prepare checkpoint
- Expected: Work halted gracefully, no execution starts
- Acceptance: No tasks modified, no commits

**Test 3: Task Execution Fails**
- Input: Serial execution, 1 of 5 tasks fails
- Expected: Failure caught, user asked to retry or continue
- Acceptance: User can retry, fix, or skip to review

**Test 4: Parallel Forced to Serial**
- Input: Parallel mode selected, file conflicts detected at execute start
- Expected: Mode downgraded to serial, safety enforced
- Acceptance: Execution continues safely in serial mode

**Test 5: End-Session Offered**
- Input: Successful shipping complete
- Expected: End-session workflow offered to user
- Acceptance: User can accept to run end-session or decline

**Test 6: Skill Failure with Retry**
- Input: Skill encounters network error
- Expected: Error caught, retry offered, can succeed on retry
- Acceptance: Workflow resilient to transient failures

**Test 7: Agent Fallback (S9)**
- Input: Call `/pwrl-work` skill when agents disabled
- Expected: Skill detects agents unavailable, runs monolithic fallback
- Acceptance: Work executes successfully via fallback path

## Acceptance Criteria

✅ Agent orchestrates all micro-skills (S2-S7) in correct sequence  
✅ Agent passes state between skills correctly  
✅ Agent provides user confirmations at all 5 checkpoints  
✅ Agent handles skill failures and offers recovery options  
✅ Agent integrates GitHub syncing (S4) throughout  
✅ Agent supports inline/serial/parallel execution modes  
✅ All error scenarios handled gracefully (no crashes)  
✅ Final commit includes unit IDs and clear message  
✅ End-session workflow offered after successful ship  
✅ Ready for integration with S9 (fallback wrapper)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Architecture)
- **Micro-Skills:** S2-S7 (implemented via separate tasks)
- **Learning:** `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`
- **Related Agent:** `agents/pwrl-planner.agent.md` (orchestration pattern reference)
