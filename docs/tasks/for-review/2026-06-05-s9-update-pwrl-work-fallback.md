---
unit-id: S9
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: for-review
created: 2026-06-05
dependencies: [S1, S8]
files:
  - pwrl-work/SKILL.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
  - docs/learnings/decision/fallback-architecture-design-2026-06-05.md
---

# Task S9: Update pwrl-work Skill to Support Fallback

## Goal

Modify the existing `pwrl-work/SKILL.md` to detect agent availability and delegate to `pwrl-work.agent.md` when available, or run the monolithic fallback behavior when agents are unavailable.

## Context

After creating all micro-skills (S2-S7) and the orchestrator agent (S8), we need to update the original `pwrl-work` skill to act as an intelligent wrapper:

1. **Detect agents:** Check if `agents/pwrl-work.agent.md` exists and agents are enabled
2. **Delegate:** If agents available, delegate to agent for orchestration
3. **Fallback:** If agents unavailable, run original monolithic workflow inline
4. **Transparency:** Document both paths so users understand what's happening

This mirrors the successful pattern established in `pwrl-plan` skill.

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Delegation pattern: detect and delegate to agent when available
  - Checkpoint pattern: maintain same user experience in both paths
  - Applicability: Guides wrapper implementation and delegation logic

- **Fallback Architecture Design** (`docs/learnings/decision/fallback-architecture-design-2026-06-05.md`):
  - Graceful degradation: full functionality when agents unavailable
  - Zero breaking changes: identical I/O regardless of path
  - Applicability: Ensures planning always works, user experience transparent

## Implementation Steps

### Step 1: Analyze Current pwrl-work Structure

From S1 analysis, `pwrl-work/SKILL.md` currently has:
- Phase 0: Triage Input (classify input type)
- Phase 1: Prepare Context & Environment (setup, create tasks)
- Phase 2: Execute (inline/serial/parallel execution)
- Phase 3: Simplify & Review (consolidate, system checks)
- Phase 4: Ship (final checks, approve, commit, push)

All phases are implemented inline. We need to preserve this structure as the fallback path.

### Step 2: Add Agent Detection Logic at Skill Entry Point

Add detection check before processing input:

```markdown
## Workflow

### Phase 0a: Detect Agent Availability (NEW)

**Check if agents are available:**

1. Check system configuration:
   - Read system agent settings (are agents enabled?)
   - If agents disabled: skip to monolithic fallback

2. Check if agent file exists:
   - Look for file: `agents/pwrl-work.agent.md`
   - If file missing: log info, continue to monolithic fallback
   - If file exists: attempt agent delegation

3. Decision:
   ```
   if (agents_enabled && agent_file_exists) {
     log("ℹ️  Agents detected — delegating to pwrl-work.agent.md")
     try {
       call_agent("/pwrl-work <input>")
     } catch (error) {
       log("❌ Agent call failed: " + error)
       log("ℹ️  Falling back to monolithic workflow")
       fall_through_to_monolithic()
     }
   } else {
     log("ℹ️  Agents not available — running monolithic planning workflow")
     run_monolithic_fallback()
   }
   ```

4. If agents available AND agent call succeeds:
   - Agent orchestrates all phases (S2-S7)
   - Return agent output
   - Skill completes (agent owns orchestration)

5. If agents unavailable OR agent call fails:
   - Continue to Phase 0 (existing monolithic workflow)
   - Run all phases inline in this skill
   - Return results as before
```

### Step 3: Document Agent Delegation Path

Add section explaining agent path:

```markdown
### Agent Delegation Path

**When agents are available and enabled:**

```
Input → Agent Detection → Agent Available? YES → Call pwrl-work.agent.md
  ↓
  Agent orchestrates:
    Phase 1: Triage (pwrl-work-triage skill)
    Phase 2: Prepare (pwrl-work-prepare skill)
    Phase 3: Execute (pwrl-work-execute skill)
    Phase 4: Review (pwrl-work-review skill)
    Phase 5: Ship (pwrl-work-ship skill)
  ↓
  Agent returns results
  ↓
  Skill exits (delegation complete)
```

**Advantages:**
- Cleaner separation of concerns (each skill has single responsibility)
- Each skill independently testable
- Parallel execution support (parallel subagents managed by execute skill)
- GitHub integration decoupled (sync-status utility)

**User Experience:**
- Same input/output as monolithic path
- Clear logging: "Delegating to pwrl-work.agent.md"
- Same checkpoints and confirmations (handled by agent)
```

### Step 4: Document Monolithic Fallback Path

Add section explaining fallback path:

```markdown
### Monolithic Fallback Path

**When agents are unavailable or agent call fails:**

```
Input → Agent Detection → Agent Available? NO → Run Monolithic Fallback
  ↓
  Phase 0: Triage Input (classify, check dependencies)
    ↓
  Phase 1: Prepare Environment (setup branch, create tasks)
    ↓
  Phase 2: Execute (inline/serial/parallel modes)
    ↓
  Phase 3: Simplify & Review (consolidate, system checks)
    ↓
  Phase 4: Ship (final checks, commit, push)
  ↓
  Skill returns results (no agent involved)
```

**Advantages:**
- Works without agent infrastructure
- Entirely self-contained in one skill
- No external dependencies
- Identical functionality to agent path

**User Experience:**
- Same input/output as agent path
- Transparent: logging indicates "running monolithic workflow"
- Same checks, same confirmations, same results
```

### Step 5: Preserve All Original Logic

Document that all original Phase 0-4 logic is preserved:

```markdown
### Backward Compatibility

**All original functionality preserved in fallback path:**

- Phase 0: Triage Input logic unchanged
  - Input classification, complexity estimation, dependency resolution
  - All original methods and helpers preserved

- Phase 1: Prepare Environment logic unchanged
  - Branch strategy, task creation, execution mode selection
  - GitHub readiness check
  - All original logic intact

- Phase 2: Execute logic unchanged
  - Inline, serial, parallel execution modes all supported
  - Test running, quality gates, status updates
  - All original logic intact

- Phase 3: Simplify & Review logic unchanged
  - Duplication detection, helper extraction, system checks
  - Design spec comparison, scope control
  - All original logic intact

- Phase 4: Ship logic unchanged
  - Final tests, lint/format, diff review, user approval
  - Staging, committing, pushing
  - End-session offer
  - All original logic intact

**No breaking changes:**
- Input format unchanged
- Output format unchanged
- User experience unchanged
- All features available in both paths (agent and fallback)
```

### Step 6: Add Agent Detection Configuration

Document how agent detection works:

```markdown
### Agent Detection Configuration

**How the skill detects agents:**

1. **Agent File Presence:**
   - Checks for: `agents/pwrl-work.agent.md`
   - Can optionally check for alternate agent names (if configured)

2. **Agent Enablement:**
   - Checks system configuration for agents enabled flag
   - Different systems have different config methods:
     - GitHub Copilot: Native agent support
     - Claude/Cursor: Requires explicit agent enable
     - Other platforms: Manual agent configuration

3. **Try-Catch on Agent Call:**
   - Agent call wrapped in error handling
   - If agent throws error: log error, fall back to monolithic
   - If agent call times out: log timeout, fall back
   - If agent returns invalid result: log error, fall back

**Configuration Check Method:**

```markdown
#### Pseudo-Code

```javascript
function shouldDelegateToAgent() {
  // Check system configuration
  const agentsEnabled = checkSystemConfig("agents.enabled");
  if (!agentsEnabled) {
    log("Agents disabled in system config");
    return false;
  }
  
  // Check agent file exists
  const agentFileExists = fileExists("agents/pwrl-work.agent.md");
  if (!agentFileExists) {
    log("Agent file not found at agents/pwrl-work.agent.md");
    return false;
  }
  
  return true; // Ready to delegate
}

function executeWork(input) {
  if (shouldDelegateToAgent()) {
    try {
      log("ℹ️  Agents detected — delegating to pwrl-work.agent.md");
      return callAgent("/pwrl-work", input);
    } catch (error) {
      log("❌ Agent call failed: " + error.message);
      log("ℹ️  Falling back to monolithic workflow");
      // Continue to fallback...
    }
  }
  
  log("ℹ️  Agents not available — running monolithic workflow");
  return runMonolithicFallback(input);
}
```
```

### Step 7: Update Skill Frontmatter

Update skill header to document both paths:

```yaml
---
name: pwrl-work
description: Execute implementation work efficiently (delegates to agent when available, falls back to monolithic workflow)
argument-hint: "[Task file, plan doc path, or work description. Leave blank to use latest plan/task]"
dual-path: true
agent-optional: pwrl-work.agent.md
fallback-available: true
---
```

### Step 8: Add Operational Logging

Document logging for both paths:

```markdown
### Operational Logging

**Logging at Key Decision Points:**

```
[START] /pwrl-work <input>
  Input: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
  Input type: plan

[DETECT] Checking agent availability...
  System agents enabled: true
  Agent file exists: agents/pwrl-work.agent.md ✓
  
[DELEGATE] Agents available — delegating to pwrl-work.agent.md
  → Agent called...
  ← Agent returned results

[COMPLETE] Work execution successful
  Branch: feat/pwrl-work-agent
  Commit: abc1234e5f6789
  Status: shipped ✓
```

**If fallback:**

```
[START] /pwrl-work <input>
  Input: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
  Input type: plan

[DETECT] Checking agent availability...
  System agents enabled: false (or agent file missing)
  
[FALLBACK] Agents not available — running monolithic workflow
  → Phase 0: Triage Input...
  → Phase 1: Prepare Environment...
  → Phase 2: Execute Tasks...
  → Phase 3: Simplify & Review...
  → Phase 4: Ship...

[COMPLETE] Work execution successful
  Branch: feat/pwrl-work-agent
  Commit: abc1234e5f6789
  Status: shipped ✓
```

**Log all decisions for troubleshooting:**
- Agent availability check result
- Agent call success/failure
- All phase completions
- Any fallback reasons
```

### Step 9: Document Troubleshooting

Add troubleshooting guide:

```markdown
### Troubleshooting

| Problem                          | Cause                                | Solution                         |
| -------------------------------- | ------------------------------------ | -------------------------------- |
| Always runs fallback             | Agent file missing                   | Create `agents/pwrl-work.agent.md` |
| Always runs fallback             | Agents disabled in config            | Enable agents in system config     |
| Agent fails; fallback runs       | Agent has errors                     | Check agent file for bugs          |
| Agent times out                  | Subagent hangs or network slow       | Retry; check subagent logs         |
| Both paths fail                  | Invalid input or system state        | Check error logs; validate input   |
| Monolithic workflow broken       | S1 analysis incomplete               | Re-run S1 analysis, update logic   |

**To Force Specific Path:**

- **Force fallback:** Disable agents temporarily, or rename agent file
- **Force agent:** Ensure agent file exists, agents enabled, call succeeds
```

### Step 10: Add Integration Test Coverage

Document test scenarios for both paths:

```markdown
### Test Scenarios

**Test 1: Agent Delegation (Happy Path)**
- Condition: Agents enabled, agent file exists
- Expected: Skill detects agents, delegates to agent, returns agent result
- Validation: Log shows "Delegating to agent...", agent orchestrates all phases

**Test 2: Fallback Path (Agents Disabled)**
- Condition: Agents disabled in config, or agent file missing
- Expected: Skill detects unavailability, runs monolithic workflow
- Validation: Log shows "Running monolithic workflow", all phases execute inline

**Test 3: Agent Call Failure (Fallback Triggered)**
- Condition: Agents available but agent call throws error
- Expected: Skill catches error, falls back to monolithic
- Validation: Log shows error + fallback, then monolithic phases execute

**Test 4: Agent Timeout (Fallback Triggered)**
- Condition: Agent call hangs/times out
- Expected: Skill timeouts after [configured limit], falls back
- Validation: Log shows timeout + fallback, monolithic executes

**Test 5: Equivalent Output (Both Paths)**
- Condition: Same input run on both agent and fallback paths
- Expected: Both produce identical (or nearly identical) results
- Validation: Final commit, test results, shipping status all match

**Test 6: Backward Compatibility**
- Condition: Fallback path on system without agent infrastructure
- Expected: Monolithic workflow executes successfully, no missing features
- Validation: All 5 phases complete, shipping succeeds, no errors
```

## Test Scenarios

**Test 1: Agent Detection Works**
- Condition: Agent file exists, agents enabled
- Expected: Skill detects agents correctly
- Acceptance: Log shows "Agents detected"

**Test 2: Agent Delegation Works**
- Condition: Agent detection successful, agent file valid
- Expected: Agent called and returns results
- Acceptance: Skill delegates, returns agent result

**Test 3: Fallback Triggered (Agents Disabled)**
- Condition: Agents disabled in config
- Expected: Fallback runs, all phases execute
- Acceptance: All 5 phases complete, work shipped

**Test 4: Fallback Triggered (Agent File Missing)**
- Condition: Agent file deleted or missing
- Expected: Fallback runs automatically
- Acceptance: Monolithic workflow executes successfully

**Test 5: Fallback Triggered (Agent Error)**
- Condition: Agent file exists but has errors
- Expected: Agent call fails, fallback runs
- Acceptance: Fallback completes successfully, error logged

**Test 6: Equivalent Results (Agent vs. Fallback)**
- Condition: Same work executed on both paths
- Expected: Identical results (commits, tests, shipping status)
- Acceptance: Both paths produce same output, tests pass in both

**Test 7: No Breaking Changes**
- Condition: Fallback path tested without agent infrastructure
- Expected: All original functionality works
- Acceptance: All phases execute, no missing features

## Acceptance Criteria

✅ Skill detects agent availability correctly (enabled + file exists)  
✅ Skill delegates to agent when available  
✅ Skill falls back to monolithic when agents unavailable  
✅ Skill catches agent errors and falls back gracefully  
✅ All original Phase 0-4 logic preserved in fallback  
✅ Logging shows which path is taken (agent or fallback)  
✅ Troubleshooting guide clear and accurate  
✅ Equivalent results from both paths (or documented differences)  
✅ Zero breaking changes (backward compatible)  
✅ Ready for S10 (documentation) and S11 (testing)

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Fallback Strategy)
- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **S8 Agent:** `agents/pwrl-work.agent.md`
- **Related Pattern:** `agents/pwrl-planner.agent.md` (agent detection pattern reference)
- **Learning:** `docs/learnings/decision/fallback-architecture-design-2026-06-05.md`
