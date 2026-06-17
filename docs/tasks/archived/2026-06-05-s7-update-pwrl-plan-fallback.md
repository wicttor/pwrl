---
unit-id: S7
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
status: archived
superseded-by: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md (Units U1-U8)
created: 2026-06-05
archived: 2026-06-10
dependencies: [S1, S2, S3, S4, S5]
files:
  - skills/pwrl-plan/SKILL.md (update with fallback logic)
learnings: []
---

> ⚠️ **ARCHIVED & SUPERSEDED** — 2026-06-10
> 
> This task has been superseded by a comprehensive fix & verification plan:
> **[Fix and Verify PWRL Plan Micro-Skills for Production Readiness](docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md)**
> 
> The implementation from this task (pwrl-plan/SKILL.md fallback routing) is complete and in use.
> However, critical P0/P1 findings from code review require fixes to enable production deployment.
> 
> **Related work:** 
> - Code review: `.context/pwrl-review/pwrl-plan-comprehensive-review/review.md`
> - New plan: `docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md`
> - New tasks: `docs/tasks/to-do/2026-06-10-u*.md`
> 
> ---

# S7: Update pwrl-plan Skill to Support Fallback

## Goal

Modify the original `pwrl-plan/SKILL.md` to detect if agents are available/enabled in the system and route accordingly:
- **If agents available:** Delegate to `pwrl-planner.agent.md` (S6)
- **If agents unavailable:** Run the original monolithic workflow inline as fallback
- Ensure the skill always works regardless of system configuration

## Context

The monolithic `pwrl-plan` skill originally contained all Phase 1-4 logic inline. With micro-skills now extracted, the original skill becomes a smart wrapper that:
1. Detects agent availability (checks if pwrl-planner.agent.md exists and agents are enabled)
2. Routes to agent (recommended path for agent-enabled systems)
3. Falls back to inline monolithic behavior (for systems without agents)

This ensures **zero breaking changes** and backward compatibility.

**Why this matters:** Systems without agent infrastructure must still be able to plan. The fallback ensures planning works everywhere.

**Dependency:** Depends on S1-S5 (micro-skills must exist first). Parallel with S6 (agent creation).

## Related Learnings

- **Learning: Agent Detection Patterns** (if exists at `docs/learnings/agent-detection.md`)
  - *Applicability:* Guides how to detect agent availability; fallback routing patterns.

**Learning Gap:** If no learning for "Fallback Strategy & Agent Detection" exists, create one via `/pwrl-learnings` after S7 completes.

## Implementation Steps

1. **Understand Current pwrl-plan Structure**
   - Read `skills/pwrl-plan/SKILL.md` completely
   - Document all inline logic (Phases 1-4)
   - Identify entry points and decision trees
   - Note existing ask_user tool usage

2. **Design Agent Detection Logic**
   - Detect: Is pwrl-planner.agent.md available?
   - Check: Are agents enabled in system configuration?
   - Determine: Can we call the agent safely?
   - Algorithm:
     ```
     if (pwrl-planner.agent.md exists) AND (agents enabled) {
       delegate to agent
     } else {
       run monolithic fallback
     }
     ```

3. **Create Agent Detection Helper**
   - Function: `canUseAgent()` — returns true/false
   - Check file existence: `agents/pwrl-planner.agent.md`
   - Check config: system agent settings (if available)
   - Return: boolean

4. **Implement Delegation Path**
   - If agents available:
     - Log: "Agent available; delegating to pwrl-planner.agent.md"
     - Call: `invoke("pwrl-planner.agent.md", { task: userInput })`
     - Return: Agent result (plan file path)
   - If delegation fails: catch error, fall back to monolithic

5. **Preserve Monolithic Fallback**
   - Keep all original Phases 1-4 logic in pwrl-plan/SKILL.md
   - Wrap in function: `runMonolithicWorkflow(userInput)`
   - Ensure fallback has feature parity with agent workflow
   - Test fallback independently

6. **Update SKILL.md Documentation**
   - Add section: "Agent vs. Fallback"
   - Document routing logic
   - Explain when each path is used
   - Add examples of both paths
   - Include troubleshooting: "How to debug agent detection"

7. **Add Fallback Indicators**
   - When using fallback, log: "Agents not available; running monolithic workflow"
   - Help user understand which path was taken
   - Suggest: "For agent-enhanced experience, enable agents and ensure pwrl-planner.agent.md exists"

8. **Error Handling**
   - If agent call fails: log error, fall back to monolithic
   - If fallback fails: return clear error (both paths failed)
   - Ensure no silent failures

## Code Patterns

**Example: Agent Detection & Routing (pseudo-code)**

```javascript
async function pwrlPlan(userInput) {
  // Step 1: Check if agent is available
  const canUseAgent = () => {
    try {
      // Check if pwrl-planner.agent.md exists
      const agentFile = "/agents/pwrl-planner.agent.md";
      if (!fileExists(agentFile)) return false;
      
      // Check if agents are enabled in config
      if (!isAgentEnabled()) return false;
      
      return true;
    } catch (e) {
      console.log("Agent detection failed:", e.message);
      return false;
    }
  };

  // Step 2: Route to agent or fallback
  if (canUseAgent()) {
    console.log("ℹ️  Using pwrl-planner.agent.md for planning workflow");
    try {
      return await invokeAgent("pwrl-planner.agent.md", { 
        task: userInput 
      });
    } catch (agentError) {
      console.warn("Agent failed, falling back to monolithic workflow");
      return runMonolithicWorkflow(userInput);
    }
  } else {
    console.log("ℹ️  Agents not available; running monolithic planning workflow");
    return runMonolithicWorkflow(userInput);
  }
}

// Monolithic fallback function
async function runMonolithicWorkflow(userInput) {
  // Phase 1: Scope Gathering
  const scopedContext = await phase1_ScopeGathering(userInput);
  
  // Checkpoint
  const scopeConfirmed = await askUser("Is scope correct?", {
    options: ["Yes", "Adjust", "Cancel"]
  });
  if (scopeConfirmed !== "Yes") return;
  
  // Phase 2: Research
  const researchFindings = await phase2_Research(scopedContext);
  
  // Phase 3: Design
  const units = await phase3_Design(scopedContext, researchFindings);
  
  // Phase 4: Generate
  const planPath = await phase4_GeneratePlan(scopedContext, researchFindings, units);
  
  return { success: true, planPath };
}
```

**Example: SKILL.md Addition (Documentation)**

```markdown
## Agent vs. Fallback Routing

This skill intelligently routes between two paths:

### Path 1: Agent-Enhanced (Recommended)
- **Condition:** `pwrl-planner.agent.md` exists AND agents enabled
- **Behavior:** Delegates to agent; provides interactive phase-by-phase workflow
- **Log:** "Using pwrl-planner.agent.md for planning workflow"
- **Checkpoint:** User can adjust each phase before proceeding

### Path 2: Monolithic Fallback
- **Condition:** Agents unavailable or agent file missing
- **Behavior:** Runs original Phase 1-4 logic inline
- **Log:** "Running monolithic planning workflow"
- **Checkpoint:** Same checkpoints, all in-skill

### How to Enable Agent Path
1. Ensure `agents/pwrl-planner.agent.md` exists
2. Enable agents in system configuration
3. Call `/pwrl-plan [task]` — should detect and use agent
4. If still using fallback, check system agent settings

### Troubleshooting
- Q: Always running fallback. Why?
  - A: Check if pwrl-planner.agent.md exists; check if agents are enabled
  - Run: `ls -la agents/pwrl-planner.agent.md` to verify
  
- Q: Agent call failed; got fallback error too?
  - A: Both paths failed. Check error logs for details.
  - This is rare; contact support if persistent.
```

## Edge Cases

1. **pwrl-planner.agent.md exists but agents are disabled**
   - Solution: Detect correctly; use fallback
   - Document: "Agent exists but disabled. Enable agents to use agent path."

2. **Agent exists but has syntax errors**
   - Solution: Catch agent invocation error; fall back gracefully
   - Log: "Agent invocation failed: [error]; falling back"

3. **Agent times out**
   - Solution: Set timeout; if exceeded, fall back
   - Document: "Agent timeout; used fallback. Try with simpler task."

4. **Fallback also fails**
   - Solution: Return clear error; don't hide failures
   - Suggest: "Both agent and fallback failed. Please check logs."

5. **User runs skill multiple times; wants to switch paths**
   - Solution: Skill auto-detects on each call; path may change
   - Example: Enable agents between calls → agent path is used

## Testing

### Unit Test: Agent Detection

- **Input:** pwrl-planner.agent.md exists (or doesn't exist)
- **Verification:**
  - `canUseAgent()` returns true when agent exists
  - `canUseAgent()` returns false when agent missing
  - Config settings are respected

### Unit Test: Agent Delegation

- **Input:** Agents available + user task
- **Verification:**
  - Skill calls agent (not monolithic)
  - Agent receives task correctly
  - Agent output is returned to user

### Unit Test: Fallback Execution**

- **Input:** Agents unavailable + user task
- **Verification:**
  - Skill runs monolithic workflow (not agent)
  - All Phase 1-4 steps execute
  - Plan is generated correctly
  - Output matches agent path output

### Unit Test: Agent Failure & Fallback

- **Input:** Agent exists but fails; user task
- **Verification:**
  - Agent is called first
  - Agent fails (simulated)
  - Skill catches error and falls back
  - Fallback generates plan successfully
  - User is informed: "Agent failed; used fallback"

### Integration Test: Full Workflows (Both Paths)**

- **Input:** Same user task; run twice (once with agents, once without)
- **Verification:**
  - Agent path: produces plan via agent
  - Fallback path: produces plan via monolithic
  - Both plans are structurally identical
  - Output paths differ (agent may include agent metadata)

## Acceptance Criteria

✅ `skills/pwrl-plan/SKILL.md` updated with agent detection logic  
✅ Agent detection function exists and works correctly  
✅ Delegation to agent path works (if agent exists)  
✅ Fallback to monolithic path works (if agent unavailable)  
✅ Both paths produce identical plan output  
✅ Error handling: agent failure → graceful fallback  
✅ User is informed which path is being used (log messages)  
✅ Troubleshooting guide added to SKILL.md documentation  
✅ All Phase 1-4 logic is preserved in fallback  
✅ Zero breaking changes: original skill behavior maintained  
✅ Backward compatible: existing workflows still work  

## References

- Source: `skills/pwrl-plan/SKILL.md` (original monolithic logic preserved)
- Agent: `agents/pwrl-planner.agent.md` (S6 — optional path)
- Fallback: Monolithic workflow (inline in pwrl-plan/SKILL.md)
- Related: S2-S5 (micro-skills that agent calls)

