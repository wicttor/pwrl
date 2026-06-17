---
title: Remove Agent Infrastructure, Adopt Pure Skill-Based Framework
date: 2026-06-16
category: decision
tags:
  - architecture
  - simplification
  - skill-based
  - agent-removal
  - pwrl
severity: high
supersedes:
  - decision/fallback-architecture-design-2026-06-05.md
context: v1.2.0 → v1.2.1 rebranding; removed agent orchestrators and routing docs
---

# Remove Agent Infrastructure, Adopt Pure Skill-Based Framework

## The Question

Should PWRL retain agent-based orchestration (agents routing between micro-skills with smart fallback) or remove agent infrastructure entirely and adopt a pure skill-based architecture where workflows are orchestrated by directly chaining skills?

## Background

PWRL was originally designed with a dual-path architecture:

- **Agent path:** Agents (`.agent.md` files) orchestrated micro-skills with phase-by-phase checkpoints
- **Fallback path:** Monolithic skills ran the same logic directly when agents were unavailable

This added significant complexity: agent detection logic, dual-path testing, routing documentation, and two parallel maintenance tracks for the same workflow.

## Options Considered

### Option 1: Keep Agent Infrastructure (Status Quo)

Maintain the dual-path architecture with agent orchestration and smart fallback.

**Pros:**
- Existing setups continue working unchanged
- Agent checkpoint UX for those who use it
- Investment in agent infrastructure not wasted

**Cons:**
- 3 agent-related files + routing docs to maintain
- Dual-path testing overhead
- Users confused by "agent vs fallback" mental model
- Agent file format (.agent.md) is platform-specific and brittle
- Adds ~1500 LOC of routing/logic docs that aren't product value

### Option 2: Pure Skill-Based (Chosen)

Remove all agent infrastructure. All workflows are composable skill pipelines — skills chain directly, no intermediate orchestrator.

**Pros:**
- Single path: no dual-maintenance, no routing logic
- Simpler mental model: "skills chain together" vs "agents route to skills"
- Removes ~1300 LOC of documentation debt
- Skills are standalone and independently invocable
- No platform-specific agent file format dependencies
- Cleaner docs: no "agent setup" sections across 4 core docs
- Future-proof: works identically across all AI assistants

**Cons:**
- No auto-checkpoint UX between phases (user invokes each skill or uses the orchestrator skill that chains them)
- Existing deployments with agent config need to adapt
- Lose agent-based parallel execution (can still run skills manually in parallel)

## What We Chose

**Pure Skill-Based Framework.** Remove all agent infrastructure:

- Delete agent orchestrator files (`.agents/agents/`)
- Delete agent routing documentation (`pwrl-plan/references/agent-routing.md`)
- Delete agent-adjacent docs (`error-recovery.md`, `cross-plan-task-coordination.md`)
- Remove agent setup sections from README, GUIDE, QUICKSTART, INSTALLATION
- Rebrand from "agentic development framework" to "skill-based development framework"
- Remove mandatory `[AGENT: ...]` attribution trailer from commit protocol

### How Workflows Work Now

```
Before (with agents):
  /pwrl-plan → agent detects → routes to micro-skills → collects results
  /pwrl-work → agent detects → 4-phase orchestration → checkpoints

After (pure skills):
  /pwrl-plan → directly chains micro-skills (scope → research → design → generate)
  /pwrl-work → directly chains micro-skills (triage → prepare → execute → review → finalize)
  Or call individual skills directly: /pwrl-plan-scope, /pwrl-work-triage, etc.
```

## Why

**Decision factors:**

1. **Simplification** — Removing 1300+ LOC of routing/agent docs with 0 functional loss
2. **Maintenance burden** — Dual-path architecture was ~2x testing/validation effort
3. **User clarity** — "Skills" is intuitive; "agents routing to skills" adds cognitive load
4. **Platform independence** — Skills are plain markdown, not platform-specific agent formats
5. **Skills are composable** — `/pwrl-plan design` works standalone, no agent needed
6. **No breaking change** — Skills were always the execution layer; we just removed the middleman

## Impact

### Removed Files

- `pwrl-plan/references/agent-routing.md` (105 lines)
- `pwrl-planner/references/error-recovery.md` (467 lines)
- `pwrl-work-execute/references/cross-plan-task-coordination.md` (440 lines)

### Updated Files

- `README.md` — Rebranded tagline, removed agent references
- `GUIDE.md` — Skill-based workflow docs, added interaction modes
- `QUICKSTART.md` — Simplified, no agent setup
- `INSTALLATION.md` — Removed agent setup sections
- `pwrl-end-session-commit/SKILL.md` — Removed agent trailer requirement
- `pwrl-end-session-commit/references/commit-protocol.md` — Removed agent trailer rules
- `package.json` — Updated description and keywords
- `CHANGELOG.md` — Version 1.2.1 entry

### Updated Documentation Patterns

- `pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — Updated: skill decomposition is still valid, but orchestration is now pure skill chaining, not agent-mediated
- `decision/fallback-architecture-design-2026-06-05.md` — Superseded: fallback no longer needed since there's only one path

## Related Learnings

- `decision/remove-agent-attribution-trailer-2026-06-16.md` — Related decision to remove `[AGENT: ...]` from commit protocol
- `pattern/explicit-review-verdict-flow-2026-06-16.md` — New review verdict pattern added during this session
- `pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — Predecessor pattern (now updated)
- `decision/fallback-architecture-design-2026-06-05.md` — Superseded by this decision
- `decision/interaction-modes-for-user-engagement.md` — Interaction modes pattern (now integrated into work execution)
