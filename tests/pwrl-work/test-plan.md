# PWL-Work Integration Test Plan

Comprehensive testing for sliced pwrl-work micro-skills (S2-S7), orchestrator agent (S8), fallback mechanism (S9), and documentation (S10).

## Test Strategy

| Tier | Type | Scope | Count |
|---|---|---|---|
| T1 | Unit | Each micro-skill independently | 38 tests |
| T2 | Integration | Agent orchestration + skill interactions | 18 tests |
| T3 | System | Full workflows (all modes, agent/fallback) | 12 tests |
| T4 | Regression | No breaking changes to original behavior | 7 tests |
| T5 | Edge Case | Error scenarios, boundaries, recovery | 10 tests |
| **Total** | | | **85 tests** |

---

## T1: Unit Tests — Micro-Skills

### pwrl-work-triage (7 tests)

| # | Test | Input | Expected | Acceptance |
|---|---|---|---|---|
| T1.1 | Classify task file | Valid task with unit-id, deps, files | Frontmatter extracted: unit-id, plan, deps, files | All fields correct |
| T1.2 | Classify plan file | Plan file with 5 units | 5 units extracted, complexity: medium | Unit list complete |
| T1.3 | Classify bare prompt | "Add email validation" | Complexity: small/medium, codebase scanned | Estimation reasonable |
| T1.4 | Missing dependencies | Task depends on non-existent U2 | blockedBy: [U2], warning logged | Missing dep detected |
| T1.5 | Circular dependencies | A→B→A | Error: circular detected | Cycle caught |
| T1.6 | Missing task file | Non-existent path | Error with guidance | User guided to resolution |
| T1.7 | Empty input | No input provided | Ask user for input | Graceful handling |

### pwrl-work-prepare (8 tests)

| # | Test | Input | Expected | Acceptance |
|---|---|---|---|---|
| T2.1 | Branch strategy: new branch | User confirms new branch | Branch created, context updated | Branch exists locally |
| T2.2 | Branch strategy: direct commit | User confirms direct commit | Warning logged, no branch | Strategy documented |
| T2.3 | Create tasks from plan | Plan with 5 units | 5 task files in to-do/ | Files created correctly |
| T2.4 | Update single task | Task file, confirmed | status: in-progress, file moved | Status updated |
| T2.5 | Execution mode: inline | 1 task | Mode: inline | Correct detection |
| T2.6 | Execution mode: serial | 5 dependent tasks | Mode: serial | Dependencies respected |
| T2.7 | Execution mode: parallel | 4 independent, no conflicts | Mode: parallel, safety: safe | Safety constraints clear |
| T2.8 | Execution mode: forced serial | 3 tasks with file conflict | Mode: serial (forced), conflict logged | Safety prevents parallelism |

### pwrl-work-sync-status (6 tests)

| # | Test | Input | Expected | Acceptance |
|---|---|---|---|---|
| T3.1 | GitHub check: enabled | Config with githubIssues: true | Sync proceeds | Ready to sync |
| T3.2 | GitHub check: disabled | Config with githubIssues: false | action: skipped, no API calls | Graceful skip |
| T3.3 | Label update | to-do → in-progress | Labels: add in-progress, remove to-do | Labels correct |
| T3.4 | Status comment | for-review transition | Comment posted with summary | Comment informative |
| T3.5 | Issue not found | Invalid issue number | Warning: "Issue not found" | Graceful handling |
| T3.6 | Dry-run mode | --dry-run flag | Preview only, no API calls | Safe preview |

### pwrl-work-execute (9 tests)

| # | Test | Input | Expected | Acceptance |
|---|---|---|---|---|
| T4.1 | Inline mode: 1 task | Single task, inline mode | Task executed, status: for-review | No subagents |
| T4.2 | Inline mode: 2 tasks | 2 independent tasks | Both executed, both for-review | Sequential inline |
| T4.3 | Serial mode: 5 tasks | 5 dependent tasks | Sequential execution, tests pass | Order respected |
| T4.4 | Parallel mode: 4 tasks | 4 independent, no conflicts | Concurrent execution, all complete | Safety constraints enforced |
| T4.5 | Quality gate: test fails | Task with failing test | status: blocked, failure shown | Gate blocks correctly |
| T4.6 | Quality gate: pattern warn | Non-standard code | Warning, user can accept/reject | User decision |
| T4.7 | GitHub sync during exec | Task with github-issue | Labels updated at each transition | End-to-end sync |
| T4.8 | Subagent timeout | Hanging subagent (>1hr) | Subagent killed, task failed | Timeout detected |
| T4.9 | Commit after execution | All tasks complete | Commit created with unit IDs | Commit correct |

### pwrl-work-review (5 tests)

| # | Test | Input | Expected | Acceptance |
|---|---|---|---|---|
| T5.1 | Detect duplication | 2 tasks with identical logic | Duplication identified | Clear detection |
| T5.2 | Extract helper | User confirms extraction | Helper created, tests pass | Duplication eliminated |
| T5.3 | System check: events | Feature with event emission | Event flow verified | Check passes |
| T5.4 | System check: idempotency | Delete operation | Retry safe, cleanup verified | Check passes |
| T5.5 | Scope control | Unrelated file in diff | Warn user about scope drift | Scope enforced |

### pwrl-work-ship (6 tests)

| # | Test | Input | Expected | Acceptance |
|---|---|---|---|---|
| T6.1 | All checks pass | Ready tasks | Final tests pass, commit created | Shipping succeeds |
| T6.2 | Test failure | Failing test | Shipping stopped, error shown | Test blocks ship |
| T6.3 | Lint violations | Non-linted code | Violations detected, auto-fix offered | Quality check works |
| T6.4 | Scope drift | Unrelated file | Warning, user can remove | Scope enforced |
| T6.5 | User cancels | Cancel at approval | No commit, work preserved | Graceful cancel |
| T6.6 | End-session offered | Successful ship | End-session offered | Workflow complete |

---

## T2: Integration Tests — Agent Orchestration

### pwrl-work.agent.md (8 tests)

| # | Test | Input | Expected | Acceptance |
|---|---|---|---|---|
| T7.1 | Full workflow: plan input | Plan file | All 5 phases execute, final commit | End-to-end success |
| T7.2 | Full workflow: task input | Single task file | Phases 1-5, inline mode | All phases complete |
| T7.3 | Full workflow: bare prompt | Description text | Triage → stages → ship | Complete workflow |
| T7.4 | Cancel at prepare checkpoint | User cancels at Phase 2 | Work halted, no execution | Graceful cancel |
| T7.5 | Task execution failure | 1 of 5 tasks fails | User prompted: retry/skip/stop | Recovery offered |
| T7.6 | Parallel → serial downgrade | Conflicts detected at runtime | Mode downgraded, safe execution | Safety enforced |
| T7.7 | GitHub sync throughout | All tasks linked to issues | Labels/comments at each transition | End-to-end sync |
| T7.8 | Skill failure with retry | Network error on skill call | Retry up to 3x, then manual | Resilient to transient errors |

### Cross-Skill State Passing (4 tests)

| # | Test | What It Verifies | Acceptance |
|---|---|---|---|
| T8.1 | Triage → Prepare state | Classified context passed correctly | All fields present |
| T8.2 | Prepare → Execute state | Task list + mode passed correctly | Execution matches prepare output |
| T8.3 | Execute → Review state | Results + test status passed | Review uses execution results |
| T8.4 | Review → Ship state | Readiness + recommendations passed | Ship uses review output |

### GitHub Integration Flow (3 tests)

| # | Test | Input | Expected |
|---|---|---|---|
| T9.1 | Full lifecycle sync | Task: to-do → in-progress → for-review → done | Each transition triggers correct label/comment |
| T9.2 | Disabled integration | GitHub disabled in config | All syncs skipped, no API calls |
| T9.3 | Partial sync (some tasks linked) | 3 tasks with issues, 2 without | Linked tasks synced, others skipped |

---

## T3: System Tests — Full Workflows

### Execution Mode Verification (6 tests)

| # | Test | Setup | Expected |
|---|---|---|---|
| T10.1 | Inline execution | 1 simple task | No subagents, task completes |
| T10.2 | Inline execution | 2 independent tasks | Both complete, no subagents |
| T10.3 | Serial execution | 3 tasks: A→B→C | Sequential, order respected |
| T10.4 | Serial execution | 5 tasks with mixed deps | Complex chain, all respected |
| T10.5 | Parallel execution | 4 independent tasks, no conflicts | Concurrent, all pass |
| T10.6 | Parallel safety: forced serial | 3 tasks with file overlap | Downgrade detected, safe execution |

### Agent vs Fallback Equivalence (3 tests)

| # | Test | Setup | Expected |
|---|---|---|---|
| T11.1 | Agent path | Agents enabled, same task | Output matches fallback |
| T11.2 | Fallback path | Agents disabled, same task | Output matches agent |
| T11.3 | Equivalent: tests pass | Both paths on same input | Same test results, same files modified |

### Fallback Behavior (3 tests)

| # | Test | Setup | Expected |
|---|---|---|---|
| T12.1 | Agents disabled | System config: agents=false | Monolithic workflow runs |
| T12.2 | Agent file missing | No agents/pwrl-work.agent.md | Fallback runs automatically |
| T12.3 | Agent call fails | Agent file has errors | Error caught, fallback runs |

---

## T4: Regression Tests — Backward Compatibility

| # | Test | What It Verifies | Acceptance |
|---|---|---|---|
| T13.1 | Input format unchanged | Same args work as before | All input types accepted |
| T13.2 | Output format unchanged | Same result structure | Output compatible |
| T13.3 | Task status management | Files created/moved the same | Same directory structure |
| T13.4 | User experience | Same confirmations/checkpoints | Same interaction flow |
| T13.5 | GitHub sync behavior | Same labels/comments | Same GitHub interaction |
| T13.6 | INDEX.md consistent | Same file format | All tasks tracked correctly |
| T13.7 | No new dependencies | Original skill still standalone | Fallback has no new deps |

---

## T5: Edge Case Tests

| # | Test | Input | Expected |
|---|---|---|---|
| T14.1 | Empty task list | From plan with 0 units | Error: no tasks to execute |
| T14.2 | All tasks blocked | All deps missing | Error: all tasks blocked |
| T14.3 | Git conflict | Staged changes conflict with task | Warning: resolve git state |
| T14.4 | Very large task list | 50+ tasks | Mode: serial, chunks recommended |
| T14.5 | Network failure (GitHub) | GitHub API down during sync | Sync: failed, continue without |
| T14.6 | Branch name conflict | Branch already exists | Offer: force or use different name |
| T14.7 | Invalid frontmatter | Malformed YAML in task | Error: parse failure |
| T14.8 | Task file with no unit-id | File without frontmatter | Classify as plan (fallback) |
| T14.9 | Unicode/special chars in prompt | Emoji, non-ASCII | Handled without errors |
| T14.10 | Concurrent agent calls | Two agents run simultaneously | No file conflicts (both fallback) |

---

## Test Execution

### Setup
```bash
# Create test fixtures
mkdir -p tests/pwrl-work/fixtures/tasks
mkdir -p tests/pwrl-work/fixtures/plans

# Sample task file for testing
cat > tests/pwrl-work/fixtures/tasks/sample-task.md << 'EOF'
---
unit-id: TEST-1
plan: tests/pwrl-work/fixtures/plans/sample-plan.md
status: to-do
created: 2026-06-08
dependencies: []
files: [src/test.ts]
---
# Test Task
Goal: Verify task classification
EOF

# Sample plan file for testing
cat > tests/pwrl-work/fixtures/plans/sample-plan.md << 'EOF'
---
id: 2026-06-08-TEST
status: active
tier: Standard
---
# Test Plan
## Units
### U1: First Unit
Files: [src/a.ts]
Approach: Implement A
EOF
```

### Run Tests
```bash
# Unit tests (skill-level)
# Run each skill's documentation against test fixtures

# Integration tests (agent orchestration)
# Test full workflow with test fixtures

# System tests (full workflows)
# Compare agent vs fallback output
```

---

## Success Criteria

- ✅ All 85 tests documented and categorized
- ✅ Test fixtures created (sample task, plan, GitHub response)
- ✅ Unit tests verify each micro-skill independently
- ✅ Integration tests verify agent orchestration end-to-end
- ✅ System tests verify all execution modes
- ✅ Regression tests verify backward compatibility
- ✅ Edge case tests verify error handling
- ✅ Agent and fallback paths produce equivalent results
- ✅ GitHub integration works correctly (when enabled)
- ✅ Testing documented for future maintenance
