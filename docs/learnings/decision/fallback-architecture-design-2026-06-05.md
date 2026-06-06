---
title: Fallback Architecture Design for System Resilience
date: 2026-06-05
category: decision
tags:
  - architecture
  - resilience
  - backwards-compatibility
  - agent-infrastructure
  - pwrl
severity: high
context: PWRL planning workflow refactor (v1.0.7); agent infrastructure optional
---

# Fallback Architecture Design for System Resilience

## The Question

When adding optional agent infrastructure (e.g., AI agents orchestrating skills), how do we ensure the system remains functional if:
- Agent runtime is not available?
- Agent file is missing or corrupted?
- User's system doesn't support agents?
- Agent orchestration fails mid-workflow?

How do we introduce new orchestration without breaking existing deployments?

## Options Considered

### Option 1: Mandatory Agent Infrastructure
Replace the monolithic skill entirely with agent-only orchestration.

**Pros:**
- Clean break; no legacy code to maintain
- All users get modern orchestration and checkpoints

**Cons:**
- Breaks existing deployments immediately
- Users without agent support cannot use the feature at all
- Migration path is unclear and painful
- No graceful degradation

### Option 2: Separate Agent & Monolithic Skills (No Integration)
Maintain both, but keep them completely separate (users choose one or the other).

**Pros:**
- No risk to monolithic skill
- Agent users can opt-in cleanly

**Cons:**
- Code duplication and sync issues
- Users see two different workflows for the same task
- Hard to migrate: logic changes must be applied to both
- Confusing UX: which skill should I use?

### Option 3: Smart Fallback (Chosen)
The monolithic skill detects agent availability and delegates or falls back seamlessly.

**Pros:**
- Unified user experience: one skill, two execution modes
- Zero breaking changes to existing deployments
- Users get agent benefits automatically if available
- Graceful degradation: if agent fails, fallback ensures task still completes
- Clean migration path: no "choose which version" confusion
- Single source of truth for business logic

**Cons:**
- Requires dual-path implementation logic
- Agent detection logic adds complexity
- Must test both paths to maintain confidence

## What We Chose

**Smart Fallback:** The monolithic skill wraps both paths.

### Implementation Pattern

```javascript
// Original pwrl-plan skill
async function executePlan(context) {
  
  // Step 1: Detect agent availability
  const agentAvailable = checkAgentEnvironment() && agentFileExists()
  
  // Step 2: Route based on detection
  if (agentAvailable) {
    // AGENT PATH: Delegate to pwrl-planner.agent.md
    // User gets checkpoints, phase-by-phase feedback, interactive orchestration
    return await delegateToAgent(context)
  } else {
    // FALLBACK PATH: Run monolithic workflow
    // User gets traditional sequential flow, same result
    return await runMonolithicWorkflow(context)
  }
}
```

**Detection Logic:**
- Check if `.agents/` directory exists and is configured
- Verify `pwrl-planner.agent.md` file exists
- Optionally test agent connectivity (ping agent framework)
- Log detection result for debugging

**Error Handling:**
- If agent fails mid-execution: catch error, log, fall back to monolithic
- If user cancels agent flow: preserve partial state, offer resume
- If fallback fails: surface error (both paths failed)

## Why

**Decision factors:**

1. **Backward Compatibility** — Existing deployments continue to work unchanged; no forced migration
2. **Graceful Degradation** — System degrades to known-working fallback instead of failing hard
3. **User Optionality** — Users don't have to choose; system picks the best available path
4. **Testability** — Both paths are tested; confidence in either path
5. **Reduced Complexity at Scale** — Avoid maintaining two separate features; single skill with dual routing is simpler than two parallel skills
6. **Clear Responsibility** — Original skill remains the source of truth; agent only orchestrates known-good phases
7. **Risk Mitigation** — If agent infrastructure has bugs, fallback preserves system reliability

## Tradeoffs

**What we gained:**
- System resilience: always has a working execution path
- Frictionless adoption: users get agent benefits without configuration
- Backward compatibility: no breaking changes
- Testability: can test both agent and fallback independently
- Debugging clarity: logs show which path executed

**What we sacrificed:**
- Implementation complexity: dual-path logic requires more testing and maintenance
- Binary detection: if agent is partially broken (e.g., slow), fallback is all-or-nothing (no hybrid mode)
- Potential duplicated effort if both paths diverge in business logic

**What we kept simple:**
- No user-facing config for agent enable/disable (system decides)
- Micro-skills are stateless and reusable regardless of routing
- Fallback is complete and functional on its own

## When to Revisit

**Revisit if:**
- Agent adoption reaches >90% — might justify removing fallback entirely
- Fallback path becomes significantly harder to maintain — consider extracting to separate package
- Agent infrastructure becomes ubiquitous in PWRL deployments — standardize on agent-only
- Micro-skills are used in non-agent contexts frequently — might need more flexible orchestration

**Keep this decision if:**
- Agent adoption remains optional for users
- System must support both modern and legacy environments
- Reliability is higher priority than simplification
- Users value graceful degradation

## Related

- `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — How skills are decomposed
- `docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md` — Technical implementation details
- `pwrl-plan/references/agent-routing.md` — Detection logic and troubleshooting
