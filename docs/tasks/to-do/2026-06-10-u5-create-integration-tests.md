---
unit-id: U5
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: [U1, U4]
created: 2026-06-10
files:
  - agents/__tests__/pwrl-planner-orchestration.test.md (new)
  - agents/__tests__/pwrl-planner-fallback.test.md (new)
learnings: []
---

# U5: Create Integration Test for Agent Orchestration

## Goal

Test full planning workflow end-to-end: agent → S2 scope → S3 research → S4 design → S5 generate.

## Context

**Dependency:** U1 (state passing protocol) and U4 (unit tests) must be complete.

Unit tests verify each skill works independently, but integration tests verify they work **together** via agent orchestration. This is critical for:
- Verifying state flows correctly between skills
- Catching assumptions about state format/structure
- Testing fallback routing in isolation

## Implementation Steps

### Step 1: Create Full Workflow Integration Test

File: `agents/__tests__/pwrl-planner-orchestration.test.md`

```markdown
# PWR Planner Agent — Integration Tests

## Test: Full Planning Workflow (Happy Path)

**Setup:**
- User input: "Plan extraction of triage logic from pwrl-work into a micro-skill"
- Agent file exists at `.agents/agents/pwrl-planner.agent.md`
- Agents enabled: `PI_AGENTS_ENABLED=true`

**Execution:**
1. User invokes: `/pwrl-plan "Plan extraction of triage logic from pwrl-work..."`
2. pwrl-plan detects agents available
3. pwrl-plan delegates to pwrl-planner.agent.md
4. Agent calls pwrl-plan-scope with user input
5. Scope skill returns scoped context
6. Agent calls pwrl-plan-research with scoped context (auto-detected from .scope/)
7. Research skill returns research findings
8. Agent calls pwrl-plan-design with context + findings (auto-detected)
9. Design skill returns implementation units
10. Agent calls pwrl-plan-generate with all 3 inputs (auto-detected)
11. Generate skill saves plan to docs/plans/

**Verification:**
- ✓ Agent detects and logs "Agents detected"
- ✓ All 4 skills called in sequence
- ✓ State files written: .scope/, .research/, .design/
- ✓ Final plan file written to docs/plans/
- ✓ Plan includes all components: goal, units, learnings
- ✓ No user re-prompts for context (state passed correctly)
- ✓ Total workflow completes without errors

**Expected Output:**
```
ℹ️  Agents detected — delegating to pwrl-planner.agent.md

📋 Phase 1: Scope Gathering
[...user prompts and confirmations...]
✅ Phase 1 complete

📋 Phase 2: Research & Findings
[...research output...]
✅ Phase 2 complete

📋 Phase 3: Design & Implementation Units
[...unit definitions...]
✅ Phase 3 complete

📋 Phase 4: Plan Generation
[...plan preview...]
✅ Plan generated successfully!
Path: docs/plans/2026-06-10-NNN-extract-triage-logic.md
```

---

## Test: Checkpoint Navigation

**Setup:**
- Same as above

**Execution:**
1. User completes Phase 1
2. At Phase 1 checkpoint, user chooses "Adjust context"
3. Agent re-runs Phase 1 with refined input
4. User confirms new context
5. Workflow continues to Phase 2

**Verification:**
- ✓ Phase 1 re-runs without errors
- ✓ Prior Phase 1 state discarded
- ✓ Phase 2 uses new context
- ✓ Workflow continues without reset

---

## Test: Checkpoint Cancellation

**Setup:**
- Same as full workflow

**Execution:**
1. User completes Phase 2
2. At Phase 2 checkpoint, user chooses "Cancel planning"
3. Agent exits gracefully

**Verification:**
- ✓ State cleaned up or archived
- ✓ No partial plan created
- ✓ User can re-run /pwrl-plan to start over

---
```

### Step 2: Create Fallback Routing Test

File: `agents/__tests__/pwrl-planner-fallback.test.md`

```markdown
# PWR Planner Agent — Fallback Routing Tests

## Test: Agent File Missing → Fallback to Monolithic

**Setup:**
- User input: "Plan something"
- Agent file does NOT exist at `.agents/agents/pwrl-planner.agent.md`
- `PI_AGENTS_ENABLED=true` (agents enabled but file missing)

**Execution:**
1. User invokes: `/pwrl-plan "Plan something"`
2. pwrl-plan checks for agent file → not found
3. pwrl-plan logs "Agent file not found — running monolithic planning workflow"
4. pwrl-plan runs all 4 phases inline (monolithic fallback)
5. Final plan generated

**Verification:**
- ✓ Agent file missing detected
- ✓ Log message appears
- ✓ Monolithic fallback runs
- ✓ Final plan created successfully

---

## Test: Agents Disabled → Fallback to Monolithic

**Setup:**
- User input: "Plan something"
- Agent file exists
- `PI_AGENTS_ENABLED=false` (agents explicitly disabled)

**Execution:**
1. User invokes: `/pwrl-plan "Plan something"`
2. pwrl-plan checks PI_AGENTS_ENABLED → false
3. pwrl-plan logs "Agents disabled (PI_AGENTS_ENABLED=false) — running monolithic planning workflow"
4. pwrl-plan runs monolithic fallback
5. Final plan generated

**Verification:**
- ✓ Config check performed
- ✓ Log message appears
- ✓ Monolithic fallback runs
- ✓ Final plan created successfully

---

## Test: Agent Invocation Fails → Fallback to Monolithic

**Setup:**
- User input: "Plan something"
- Agent file exists
- Agent has syntax error (unparseable)

**Execution:**
1. User invokes: `/pwrl-plan "Plan something"`
2. pwrl-plan detects agent available and tries to invoke
3. Agent invocation fails (parse error or timeout)
4. pwrl-plan logs error and falls back to monolithic
5. Final plan generated

**Verification:**
- ✓ Error detected and logged
- ✓ Fallback triggered automatically
- ✓ Monolithic workflow completes
- ✓ Final plan created successfully

---
```

### Step 3: Create Fixtures and Test Setup

Create test fixtures (if needed):
- Sample scope files: `agents/__tests__/fixtures/scope.md`
- Sample research files: `agents/__tests__/fixtures/research.md`
- Sample design files: `agents/__tests__/fixtures/design.md`

### Step 4: Document Test Execution Process

Add to each test file:
```markdown
## How to Run These Tests

### Option 1: Manual Verification (now)
1. Set up environment: `export PI_AGENTS_ENABLED=true` (or false for fallback test)
2. Run the test input (e.g., `/pwrl-plan "Plan extraction..."`)
3. Follow workflow, confirming at each checkpoint
4. Verify outputs match expected results

### Option 2: Automation (future)
- Tests can be converted to .js/.ts/.py automation
- Each test block → 1 test function
- Mocked user input for ask_user prompts
```

## Edge Cases

1. **Agent hangs or times out**
   - Solution: Add timeout (30 seconds); log and fall back
2. **State files from prior runs interfere**
   - Solution: Archive old state files or use session IDs
3. **User interrupts mid-workflow**
   - Solution: Document state cleanup behavior

## Testing

- [ ] Full workflow test runs successfully
- [ ] Checkpoint navigation tested
- [ ] Agent file missing tested (fallback triggered)
- [ ] Agents disabled tested (fallback triggered)
- [ ] Agent error tested (fallback triggered)
- [ ] Final plan verified in all tests

## Acceptance Criteria

✅ 2 integration test files created (orchestration + fallback)  
✅ Full workflow test covers all 4 phases  
✅ Checkpoint tests verify navigation and state handling  
✅ Fallback tests verify graceful degradation  
✅ All verification points checked  
✅ Tests executable and verifiable  

## References

- Agent: agents/pwrl-planner.agent.md
- Fallback routing: pwrl-plan/references/agent-routing.md (from U3)
- State passing: pwrl-plan/references/state-passing-protocol.md (from U1)
