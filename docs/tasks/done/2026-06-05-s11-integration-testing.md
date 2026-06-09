---
unit-id: S11
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: done
created: 2026-06-05
dependencies: [S8, S9, S10]
files: []
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S11: Integration Testing & Validation

## Goal

Comprehensively test the sliced pwrl-work micro-skills, orchestrator agent, and fallback mechanism across all execution modes. Verify backward compatibility and that both paths (agent and fallback) produce equivalent results.

## Context

After all components are implemented (S2-S10), comprehensive testing ensures:
1. Each micro-skill works independently and correctly
2. Agent orchestration works end-to-end
3. Fallback mechanism works when agents unavailable
4. Both paths produce equivalent results
5. All three execution modes (inline, serial, parallel) work correctly
6. GitHub integration works properly
7. Edge cases and error scenarios handled gracefully

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Multi-skill testing patterns
  - Integration testing between skills
  - State passing verification
  - Applicability: Guides test design and coverage strategy

## Implementation Steps

### Step 1: Plan Test Coverage

Document test strategy:

```markdown
## Test Strategy

**Test Tiers:**
1. **Unit Tests:** Each micro-skill independently
2. **Integration Tests:** Skills working together (agent orchestration)
3. **System Tests:** Full workflows (agent vs. fallback, all modes)
4. **Regression Tests:** Verify no breaking changes to original behavior
5. **Edge Case Tests:** Error scenarios, boundary conditions

**Test Organization:**
- Create `tests/pwrl-work/` directory structure
- Unit tests: `tests/pwrl-work/skills/` (one file per skill)
- Integration tests: `tests/pwrl-work/agent/`
- System tests: `tests/pwrl-work/system/`
- Regression tests: `tests/pwrl-work/regression/`

**Test Data:**
- Sample task files in `tests/pwrl-work/fixtures/tasks/`
- Sample plan files in `tests/pwrl-work/fixtures/plans/`
- Sample GitHub responses in `tests/pwrl-work/fixtures/github/`
```

### Step 2: Unit Tests for pwrl-work-triage

Test skill S2 independently:

```markdown
## Unit Tests: pwrl-work-triage

**Test File:** `tests/pwrl-work/skills/triage.test.ts`

### Test 1: Classify Task File
```
Input: Valid task file path with unit-id, dependencies, files
Expected: Extract frontmatter correctly
  - unit-id: "U1"
  - dependencies: ["U2", "U3"]
  - files: ["src/utils.ts"]
  - complexity: "small"
Acceptance: Context object has all expected fields
```

### Test 2: Classify Plan File
```
Input: Plan file with 5 units
Expected: Parse units, extract structure
  - unit count: 5
  - complexity: "medium"
  - first unit: {name: "...", files: [...]}
Acceptance: Units list complete and accurate
```

### Test 3: Classify Bare Prompt
```
Input: "Add email validation to user signup"
Expected: Scan codebase, estimate complexity
  - complexity: "small" (keyword analysis)
  - related patterns found
  - planning recommended: false
Acceptance: Estimation reasonable given prompt
```

### Test 4: Detect Missing Dependencies
```
Input: Task with dependencies on U2, U3 (U2 doesn't exist)
Expected: Mark blockedBy and warn
  - blockedBy: ["U2"]
  - warning logged
Acceptance: Missing dependency detected and reported
```

### Test 5: Detect Circular Dependencies
```
Input: Task A depends on B, B depends on A
Expected: Error with clear message
  - Error: "Circular dependency detected: A → B → A"
Acceptance: Circular case caught before execution
```

### Test 6: Handle Missing Task File
```
Input: Non-existent task file path
Expected: Error with guidance
  - Error: "Task file not found: ..."
  - Suggestion: "Create with /pwrl-tasks" or check path
Acceptance: User guided to resolution
```

[More tests...]
```

### Step 3: Unit Tests for pwrl-work-prepare

Test skill S3 independently:

```markdown
## Unit Tests: pwrl-work-prepare

**Test File:** `tests/pwrl-work/skills/prepare.test.ts`

### Test 1: Branch Strategy Confirmation
```
Input: User confirms new branch
Expected: Branch created and tracked in context
  - branchStrategy: "new-branch"
  - branchName: "feat/test"
Acceptance: Branch exists locally
```

### Test 2: Create Tasks from Plan (5 units)
```
Input: Plan with 5 units
Expected: Create 5 task files in to-do directory
  - File count: 5
  - Files in: docs/tasks/to-do/
  - Frontmatter: unit-id, status: to-do, dependencies
Acceptance: All task files created correctly
```

### Test 3: Execution Mode: Inline (1 task)
```
Input: Task list with 1 task
Expected: Mode = "inline"
  - No subagents needed
  - Reasoning: "1-2 tasks, no subagents"
Acceptance: Mode correctly identified
```

### Test 4: Execution Mode: Serial (5 dependent)
```
Input: Task list with 5 tasks (A→B→C, D→E)
Expected: Mode = "serial"
  - Dependencies respected
  - Reasoning: "Dependencies detected"
Acceptance: Mode correctly identified, chain documented
```

### Test 5: Execution Mode: Parallel (4 independent)
```
Input: Task list with 4 independent tasks, no file conflicts
Expected: Mode = "parallel"
  - Safety gate: "safe"
  - Subagent constraints documented
Acceptance: Mode correctly identified, safety constraints clear
```

### Test 6: Execution Mode: Parallel → Serial (File Conflict)
```
Input: 4 tasks claiming independent, but 2 modify same file
Expected: Mode = "serial" (forced)
  - Detected: File conflict in src/utils.ts
  - Reason: "File conflict detected, forcing serial"
Acceptance: Safety gate prevents unsafe parallelism
```

### Test 7: GitHub Integration Check (Enabled)
```
Input: GitHub integration enabled in config
Expected: GitHub readiness = true
  - githubReady: true
  - tasksLinked: count of tasks with github-issue
Acceptance: GitHub integration flagged as ready
```

### Test 8: GitHub Integration Check (Disabled)
```
Input: GitHub integration disabled in config
Expected: GitHub readiness = false, no API calls
  - githubEnabled: false
  - tasksLinked: 0
Acceptance: Graceful skip, no errors
```

[More tests...]
```

### Step 4: Unit Tests for pwrl-work-sync-status

Test skill S4 (utility) independently:

```markdown
## Unit Tests: pwrl-work-sync-status

**Test File:** `tests/pwrl-work/skills/sync-status.test.ts`

### Test 1: GitHub Check (Enabled)
```
Input: .pwrlrc.json with githubIssues: true
Expected: Sync proceeds
  - Check passes
  - Ready to sync
Acceptance: No errors, sync can proceed
```

### Test 2: GitHub Check (Disabled)
```
Input: .pwrlrc.json with githubIssues: false
Expected: Sync skipped silently
  - Result: "skipped"
  - No API calls
Acceptance: Graceful skip, no errors
```

### Test 3: Update Issue Labels (to-do → in-progress)
```
Input: Issue #42, status: in-progress
Expected: Labels updated
  - Add: "in-progress"
  - Remove: "to-do"
Acceptance: GitHub issue labels correct
```

### Test 4: Post Status Comment
```
Input: Task status changed to for-review
Expected: Comment posted
  - Comment includes: task summary, commits
Acceptance: Comment on GitHub issue visible
```

### Test 5: Handle Missing Issue
```
Input: Task with invalid github-issue number
Expected: Error with guidance
  - Log: "Issue not found"
  - Continue gracefully
Acceptance: Non-critical, execution continues
```

### Test 6: Dry-Run Mode
```
Input: --dry-run flag
Expected: No actual changes, preview only
  - Output shows what would be synced
  - No API calls made
Acceptance: Safe to preview before applying
```

[More tests...]
```

### Step 5: Unit Tests for pwrl-work-execute

Test skill S4 (core) independently:

```markdown
## Unit Tests: pwrl-work-execute

**Test File:** `tests/pwrl-work/skills/execute.test.ts`

### Test 1: Inline Execution (1 task)
```
Input: 1 task in inline mode
Expected: Execute without subagents
  - Task completes
  - Tests pass
  - Status: for-review
Acceptance: No subagents spawned, tests pass
```

### Test 2: Serial Execution (3 dependent tasks)
```
Input: 3 tasks with dependencies
Expected: Execute sequentially
  - U1 completes, then U2, then U3
  - Tests pass after each
Acceptance: Dependency order respected, all pass
```

### Test 3: Parallel Execution (4 independent tasks)
```
Input: 4 independent tasks
Expected: Spawn 4 subagents in parallel
  - All subagents complete
  - No file conflicts
  - Integration tests pass
Acceptance: All subagents complete, no conflicts
```

### Test 4: Quality Gate: Test Failure
```
Input: Task with failing test
Expected: Task blocked
  - Status: "blocked"
  - Reason documented
Acceptance: Failed task clearly blocked
```

### Test 5: Quality Gate: Code Pattern Deviation
```
Input: Code violates patterns
Expected: Warning logged
  - User can accept or reject
Acceptance: Warning clear, choice offered
```

### Test 6: GitHub Sync During Execution
```
Input: GitHub integration enabled
Expected: Status synced at key points
  - to-do → in-progress (sync called)
  - in-progress → for-review (sync called)
Acceptance: Status synced correctly to GitHub
```

### Test 7: Parallel Mode Forced to Serial (Safety)
```
Input: File conflicts detected at runtime
Expected: Mode downgrade
  - Switch to serial
  - Warning logged
Acceptance: Safety enforced
```

### Test 8: Subagent Timeout (Parallel)
```
Input: Subagent hangs for >1 hour
Expected: Timeout and kill
  - Task marked failed
  - Execution continues
Acceptance: Timeout handled gracefully
```

[More tests...]
```

### Step 6: Unit Tests for pwrl-work-review

Test skill S6 independently:

```markdown
## Unit Tests: pwrl-work-review

**Test File:** `tests/pwrl-work/skills/review.test.ts`

### Test 1: Detect Duplication
```
Input: 2 functions with identical logic
Expected: Duplication detected
  - Identified: "Both validate email regex"
  - Proposed: Extract validateEmail()
Acceptance: Duplication clearly identified
```

### Test 2: Extract Helper
```
Input: User confirms helper extraction
Expected: Helper created and call sites updated
  - Helper created: src/validation.ts
  - Call sites updated: 2
  - Tests still pass
Acceptance: Duplication eliminated, tests pass
```

### Test 3: System Check: Event Triggering
```
Input: Code emits event
Expected: Verify event in tests
  - Check: "Events tested?"
  - Result: "Yes, 3 tests cover event"
Acceptance: Event triggering verified
```

### Test 4: System Check: Idempotency
```
Input: Delete operation
Expected: Verify idempotency
  - Check: "Retry safe?"
  - Test: "1st delete OK, 2nd returns 404"
  - Result: Pass
Acceptance: Idempotency confirmed
```

### Test 5: Refactoring Scope Control
```
Input: Diff includes unrelated file
Expected: Warn about scope
  - Warning: "Why was README.md modified?"
Acceptance: Scope violations caught
```

### Test 6: Design Spec Comparison
```
Input: UI component with design specs
Expected: Compare to specs
  - Match? Yes/No for each aspect
  - Deltas? List any mismatches
Acceptance: Spec compliance verified
```

[More tests...]
```

### Step 7: Unit Tests for pwrl-work-ship

Test skill S7 independently:

```markdown
## Unit Tests: pwrl-work-ship

**Test File:** `tests/pwrl-work/skills/ship.test.ts`

### Test 1: Final Test Suite Run
```
Input: Affected test files
Expected: Tests run and pass
  - Tests executed
  - All pass
  - Coverage adequate
Acceptance: Final tests successful
```

### Test 2: Linting Check
```
Input: Code with lint violations
Expected: Violations detected
  - Violations listed
  - Auto-fix offered
Acceptance: Lint violations caught
```

### Test 3: Formatting Check
```
Input: Code with formatting issues
Expected: Format issues detected
  - Issues listed
  - User can auto-fix or decline
Acceptance: Format checked
```

### Test 4: Diff Review
```
Input: Diff of changes
Expected: Review for scope drift
  - Scope drift? No
  - Regressions? No
Acceptance: Diff reviewed and clean
```

### Test 5: User Cancels at Approval
```
Input: User selects "Cancel"
Expected: Shipping halted
  - No commit created
  - No push
Acceptance: Cancellation handled gracefully
```

### Test 6: Successful Commit and Push
```
Input: User approves shipping
Expected: Commit created and pushed
  - Commit hash returned
  - Push successful
Acceptance: Commit in git log, on remote
```

### Test 7: Git Error Handling
```
Input: Git push fails (network error)
Expected: Error caught, retry offered
  - Error logged
  - Retry option provided
Acceptance: Error handled gracefully
```

[More tests...]
```

### Step 8: Integration Tests (Agent Orchestration)

Test agent calling all skills in sequence:

```markdown
## Integration Tests: Agent Orchestration

**Test File:** `tests/pwrl-work/agent/orchestration.test.ts`

### Test 1: Full Workflow (Plan Input)
```
Input: Plan file with 5 units
Expected: Agent orchestrates all phases
  - Phase 1: Triage completes
  - Phase 2: Prepare completes, serial mode selected
  - Phase 3: Execute completes, tasks for-review
  - Phase 4: Review completes
  - Phase 5: Ship completes
  - Final commit created
Acceptance: All phases orchestrated correctly
```

### Test 2: Full Workflow (Task Input)
```
Input: Single task file
Expected: Agent orchestrates inline execution
  - Phase 1: Triage (single task)
  - Phase 2: Prepare (inline mode)
  - Phase 3: Execute inline
  - Phase 4: Review
  - Phase 5: Ship
  - Commit created
Acceptance: All phases orchestrated, inline mode
```

### Test 3: Checkpoint Interactions
```
Input: User interactions at each checkpoint
Expected: Checkpoints work correctly
  - Checkpoint 1: Confirm triage
  - Checkpoint 2: Confirm prepare
  - Checkpoint 3: Confirm execute results
  - Checkpoint 4: Confirm review
  - Checkpoint 5: Final approval
Acceptance: All checkpoints work
```

### Test 4: State Passing Between Skills
```
Input: Full workflow
Expected: State flows correctly
  - Triage output → Prepare input ✓
  - Prepare output → Execute input ✓
  - Execute output → Review input ✓
  - Review output → Ship input ✓
Acceptance: State passing verified
```

### Test 5: Error Recovery
```
Input: Skill fails during orchestration
Expected: Error handled, recovery offered
  - Error caught
  - User options: Retry/Manual/Abort
Acceptance: Error recovery works
```

[More tests...]
```

### Step 9: System Tests (Agent vs. Fallback)

Test both execution paths produce equivalent results:

```markdown
## System Tests: Agent vs. Fallback

**Test File:** `tests/pwrl-work/system/agent-vs-fallback.test.ts`

### Test 1: Equivalent Execution (Inline)
```
Input: Same single-task input, run on both paths
Condition: Agent path (agents enabled), Fallback path (agents disabled)
Expected: Identical results
  - Both execute inline
  - Both pass tests
  - Both produce same commit
Acceptance: Results equivalent
```

### Test 2: Equivalent Execution (Serial)
```
Input: Same 5-task plan, run on both paths
Condition: Agent path (agents enabled), Fallback path (agents disabled)
Expected: Identical results
  - Both select serial mode
  - Both execute sequentially
  - Both produce same commit
Acceptance: Results equivalent
```

### Test 3: Equivalent Execution (Parallel)
```
Input: Same 4-task independent plan, run on both paths
Condition: Agent path (agents enabled), Fallback path (agents disabled)
Expected: Identical results
  - Both select parallel mode
  - Both execute in parallel
  - Both produce same commit
Acceptance: Results equivalent
```

### Test 4: Agent Unavailable Falls Back Gracefully
```
Input: Agent file exists but agents disabled
Expected: Automatic fallback
  - No agent call attempted
  - Monolithic workflow runs
  - Execution succeeds
Acceptance: Fallback triggered automatically
```

### Test 5: Agent File Missing Falls Back Gracefully
```
Input: Agent file deleted/missing
Expected: Automatic fallback
  - Agent detection fails
  - Monolithic workflow runs
  - Execution succeeds
Acceptance: Fallback triggered automatically
```

### Test 6: Agent Error Falls Back Gracefully
```
Input: Agent file exists but has errors
Expected: Agent call fails, fallback triggered
  - Agent error caught
  - Monolithic workflow runs
  - Execution succeeds
Acceptance: Fallback triggered on agent error
```

[More tests...]
```

### Step 10: Mode-Specific System Tests

Test all three execution modes end-to-end:

```markdown
## System Tests: Execution Modes

**Test File:** `tests/pwrl-work/system/execution-modes.test.ts`

### Test 1: Inline Mode End-to-End (1 task)
```
Workflow: Full execution with 1 task
Expected: All phases complete in inline mode
  - No subagents spawned
  - Tests run inline
  - Commit created
Acceptance: Inline mode works end-to-end
```

### Test 2: Serial Mode End-to-End (3 dependent tasks)
```
Workflow: Full execution with 3 tasks (A→B→C)
Expected: All phases, sequential execution
  - Subagents spawned sequentially
  - Dependencies respected (A→B→C order)
  - All tests pass
  - Commit created
Acceptance: Serial mode works end-to-end
```

### Test 3: Parallel Mode End-to-End (4 independent tasks)
```
Workflow: Full execution with 4 independent tasks
Expected: All phases, parallel execution
  - 4 subagents spawned concurrently
  - No file conflicts
  - Integration tests pass
  - Commit created
Acceptance: Parallel mode works end-to-end
```

### Test 4: Parallel Mode Safety (File Conflict Detection)
```
Workflow: Try parallel with 3 tasks, 2 modify same file
Expected: Automatic downgrade to serial
  - Conflict detected
  - Mode switched to serial
  - Execution continues safely
Acceptance: Safety gate prevents race condition
```

[More tests...]
```

### Step 11: GitHub Integration System Tests

Test GitHub syncing end-to-end:

```markdown
## System Tests: GitHub Integration

**Test File:** `tests/pwrl-work/system/github-integration.test.ts`

### Test 1: Create Issues from Plan
```
Input: Plan with 5 units, GitHub enabled
Expected: 5 GitHub issues created
  - Issue titles: "U1: ...", "U2: ...", etc.
  - Labels: "pwrl-task", "to-do"
  - Task frontmatter updated with issue numbers
Acceptance: Issues created, frontmatter updated
```

### Test 2: Sync Status During Execution
```
Workflow: Execute task U1
Expected: GitHub issue updated
  - Status: to-do → in-progress → for-review
  - Labels updated at each step
  - Comments posted
Acceptance: Status synced correctly
```

### Test 3: Multiple Tasks Parallel Sync
```
Workflow: Execute 4 tasks in parallel
Expected: 4 issues synced
  - All get in-progress label
  - All get for-review label (when complete)
  - All have progress comments
Acceptance: All issues synced correctly
```

### Test 4: GitHub Disabled (Graceful Skip)
```
Input: GitHub disabled in config
Expected: No GitHub syncing
  - No API calls
  - Execution proceeds normally
  - Tasks complete without GitHub updates
Acceptance: Graceful skip, no errors
```

[More tests...]
```

### Step 12: Regression Tests (Backward Compatibility)

Test that original pwrl-work functionality is preserved:

```markdown
## Regression Tests: Backward Compatibility

**Test File:** `tests/pwrl-work/regression/backward-compatibility.test.ts`

### Test 1: Original Input/Output Format Preserved
```
Input: Original `/pwrl-work` skill invocation
Expected: Output format unchanged
  - Accepts same inputs (task, plan, prompt)
  - Returns same results
  - Checkpoints same
Acceptance: No breaking changes to I/O
```

### Test 2: All Original Phases Still Work
```
Input: Full workflow via fallback
Expected: All 5 phases execute correctly
  - Phase 0: Triage (original logic)
  - Phase 1: Prepare (original logic)
  - Phase 2: Execute (original logic)
  - Phase 3: Review (original logic)
  - Phase 4: Ship (original logic)
Acceptance: All phases work as before
```

### Test 3: Inline/Serial/Parallel Modes Still Work
```
Input: Each mode on original skill
Expected: All modes work
  - Inline: 1-2 tasks
  - Serial: 3+ dependent tasks
  - Parallel: 3+ independent tasks
Acceptance: All modes work as before
```

[More tests...]
```

### Step 13: Edge Case Tests

Test error scenarios and boundary conditions:

```markdown
## Edge Case Tests

**Test File:** `tests/pwrl-work/edge-cases.test.ts`

### Test 1: Large Task Count (100+ tasks)
```
Input: Plan with 100+ units
Expected: Handle gracefully
  - Mode selection works
  - Serial execution manages all
  - Memory usage reasonable
Acceptance: Scales to large workflows
```

### Test 2: Deep Dependency Chain (A→B→C→...→Z)
```
Input: 26 tasks with linear dependency chain
Expected: Execute correctly
  - Respect full dependency chain
  - No deadlocks
  - All pass
Acceptance: Deep chains handled correctly
```

### Test 3: Complex Dependency Graph
```
Input: Highly interconnected dependencies
Expected: Detect order correctly
  - No circular dependencies
  - Parallel subsets identified
  - Execution order correct
Acceptance: Complex graphs handled
```

### Test 4: Very Long Task Execution
```
Input: Task that takes 1+ hour
Expected: Handle gracefully
  - No timeouts
  - Progress reported
  - Completes successfully
Acceptance: Long tasks handled
```

[More tests...]
```

### Step 14: Performance Tests

Test performance and resource usage:

```markdown
## Performance Tests

**Test File:** `tests/pwrl-work/performance/performance.test.ts`

### Test 1: Inline Execution Time
```
Benchmark: Single task execution time
Target: <5 seconds (excluding implementation time)
Expected: Overhead < 2 seconds
Acceptance: Performance acceptable
```

### Test 2: Serial Execution Time
```
Benchmark: 5-task serial execution time (including tests)
Target: <2 minutes
Expected: Minimal overhead between tasks
Acceptance: Performance acceptable
```

### Test 3: Parallel Execution Time
```
Benchmark: 4-task parallel execution time
Comparison: Serial 4-task execution time
Expected: Parallel is 40-60% of serial (accounting for test overhead)
Acceptance: Parallelism provides benefit
```

### Test 4: Memory Usage
```
Benchmark: Memory used during execution
Limit: <500 MB for typical workflow
Expected: Scales linearly with task count
Acceptance: Memory usage reasonable
```

[More tests...]
```

### Step 15: Test Execution and Reporting

Document how to run tests:

```markdown
## Running Tests

### Run All Tests
```
npm test
```

### Run Specific Test Suite
```
npm test -- tests/pwrl-work/skills/execute.test.ts
npm test -- tests/pwrl-work/agent/orchestration.test.ts
```

### Run with Coverage
```
npm test -- --coverage
```

### Run Performance Tests
```
npm test -- tests/pwrl-work/performance/
```

## Test Report

After running all tests, verify:

- ✅ All unit tests pass (S2-S7 micro-skills)
- ✅ All integration tests pass (agent orchestration)
- ✅ All system tests pass (both execution paths, all modes)
- ✅ GitHub integration tests pass (when enabled)
- ✅ Regression tests pass (backward compatibility)
- ✅ Edge cases handled (large workflows, complex dependencies)
- ✅ Performance tests pass (timing and memory)
- ✅ Code coverage > 90% for core functionality
- ✅ No broken tests in existing codebase
```

## Test Scenarios Summary

| Test Category              | Count | Status |
| -------------------------- | ----- | ------ |
| Unit Tests (S2-S7)         | 40+   | TODO   |
| Integration Tests (Agent)  | 5+    | TODO   |
| System Tests (Modes)       | 10+   | TODO   |
| GitHub Integration Tests   | 5+    | TODO   |
| Regression Tests           | 5+    | TODO   |
| Edge Case Tests            | 5+    | TODO   |
| Performance Tests          | 4+    | TODO   |
| **Total**                  | **75+** | TODO |

## Acceptance Criteria

✅ All 75+ tests defined and implemented  
✅ All tests pass consistently  
✅ Code coverage > 90% for micro-skills  
✅ Agent and fallback paths produce equivalent results  
✅ All three execution modes (inline/serial/parallel) verified  
✅ GitHub integration tested (enabled/disabled)  
✅ Edge cases handled gracefully  
✅ Performance meets targets  
✅ No regressions in original pwrl-work behavior  
✅ Ready for project release

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md`
- **Micro-Skills:** `pwrl-work-*/SKILL.md`
- **Agent:** `agents/pwrl-work.agent.md`
- **Test Framework:** Jest or equivalent
- **Related:** `/pwrl-review` skill for code review
