# Agent Routing and Fallback Logic

This document explains how pwrl-plan detects and routes between agent-enhanced and monolithic fallback paths.

---

## Detection Logic

On each invocation, pwrl-plan checks two conditions:

1. **File Existence:** `.agents/agents/pwrl-planner.agent.md` exists
2. **System Configuration:** Agents are enabled in system settings

```
if (.agents/agents/pwrl-planner.agent.md exists) AND (agents enabled in config) {
  call agent → if successful, return agent output
  if agent fails → log error → fall back to monolithic
} else {
  run monolithic fallback inline
}
```

---

## Path 1: Agent-Enhanced (Recommended)

**Condition:** Agent file exists AND agents enabled

**Behavior:**

- Delegates to `pwrl-planner.agent.md` orchestrator
- Orchestrator calls micro-skills in sequence:
  1. `pwrl-plan-scope` (S2) — context gathering
  2. `pwrl-plan-research` (S3) — research findings
  3. `pwrl-plan-design` (S4) — design and units
  4. `pwrl-plan-generate` (S5) — plan generation

**Checkpoints:**

- User can review and adjust each phase before proceeding
- Phase outputs stored in memory or temp files
- Seamless handoff between skills

**Log Output:**

```
ℹ️  Agents detected — delegating to pwrl-planner.agent.md
```

---

## Path 2: Monolithic Fallback (Always Works)

**Condition:** Agents unavailable, file missing, or agent invocation fails

**Behavior:**

- Runs all phases inline within pwrl-plan/SKILL.md
- Same checkpoints and user interactions
- No external agent orchestration needed

**Log Output:**

```
ℹ️  Agents not available — running monolithic planning workflow
```

See `fallback-workflow.md` for complete Phase 1-4 details.

---

## How to Enable the Agent Path

1. Verify `.agents/agents/pwrl-planner.agent.md` exists in your workspace
2. Enable agents in your system configuration:
   - **GitHub Copilot:** Check settings for "Agents" or "Agentic Features"
   - **Custom frameworks:** Verify agent support in your orchestrator config
3. Call `/pwrl-plan [task]` — should log "Agents detected"
4. If still running fallback, verify:
   - Agent file path and syntax
   - System agent settings

---

## Troubleshooting

| Symptom                    | Likely Cause              | Fix                                           |
| -------------------------- | ------------------------- | --------------------------------------------- |
| Always runs fallback       | Agent file missing        | Create `.agents/agents/pwrl-planner.agent.md` |
| Always runs fallback       | Agents disabled in config | Enable agents in system settings              |
| Agent fails; fallback runs | Agent has syntax errors   | Check agent file for errors                   |
| Both paths fail            | Invalid input or state    | Check error logs; simplify task input         |

---

## Backward Compatibility

The monolithic fallback ensures planning always works, regardless of:

- System configuration
- Agent availability
- Framework version
- Network connectivity

**No user action required:** Routing is automatic and transparent on every invocation.
