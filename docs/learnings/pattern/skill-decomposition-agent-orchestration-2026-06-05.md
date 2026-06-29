---
title: Skill Decomposition & Agent Orchestration Pattern
timestamp: 2026-06-05
category: pattern
type: PWRL Learning
tags:
  - skill-architecture
  - orchestration
  - micro-services
  - workflow
  - pwrl
severity: high
context: PWRL planning workflow refactor (v1.0.7)
---

> **📌 UPDATED:** As of v1.2.1, PWRL has removed agent orchestrators. The **skill decomposition** part of this pattern remains fully valid — micro-skills with phase boundaries, state passing, and independent testability. The **agent orchestration** part has been superseded by pure skill chaining where orchestrator skills directly invoke micro-skills in sequence. See [Remove Agent Infrastructure](../decision/remove-agent-infrastructure-2026-06-16.md) for details.

# Skill Decomposition & Agent Orchestration Pattern

## What It Is

A pattern for decomposing a monolithic, multi-phase skill into focused, single-responsibility micro-skills that can be orchestrated by an agent while remaining independently testable and reusable.

**Structure:**
- Break a workflow into **phase-aligned micro-skills** (not tier-aligned)
- Each micro-skill handles one stage and returns state to downstream phases
- Create an **orchestrator agent** that calls skills sequentially, passing state forward
- Maintain the original **monolithic skill as an intelligent fallback**

**Example:** `pwrl-plan` (monolithic, 4 phases) → `{pwrl-plan-scope, pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate}` (micro-skills) + `pwrl-planner.agent.md` (orchestrator)

## Why It Matters

**Before (monolithic):**
- One massive skill handles all 4 phases sequentially
- Hard to test individual phases independently
- Difficult to reuse a single phase in another workflow
- User sees entire workflow as one atomic operation
- Changes to one phase risk breaking others

**After (decomposed):**
- Each micro-skill owns one phase, is easy to test, and can be used standalone
- Phases can be composed into different workflows or agent sequences
- Agent orchestration provides checkpoints: user can pause/review after each phase
- Simpler decision trees per skill; easier to maintain and extend
- Original skill remains as fallback, ensuring backward compatibility

## When to Use

- **Large workflows** with 3+ distinct phases
- **Need for checkpoints** where users should review/confirm before proceeding
- **Multiple composition patterns** possible (some tasks need all phases, some need only scope + generate)
- **Reusability** — phases will be used in different agents or contexts
- **Testability** — each phase must be independently verified

## Examples

### Phase-Aligned Decomposition (Correct)

```
pwrl-plan (monolithic before):
1. Scope gathering
2. Research & design
3. Implementation units
4. Plan generation

Split into:
- pwrl-plan-scope       (owns: context gathering, learnings gate, domain validation)
- pwrl-plan-research    (owns: local + external research, risk detection)
- pwrl-plan-design      (owns: technical design, architecture decisions)
- pwrl-plan-generate    (owns: plan rendering for chosen tier)

Orchestrated by:
- pwrl-planner.agent.md (calls each skill, collects results, passes state forward)
```

### State Passing Between Phases

Each phase consumes state from the previous phase and produces state for the next:

```
pwrl-plan-scope output:
  scope:
    id: 2026-06-05-001-scope
    domain: software
    problem: [...]
    success_criteria: [...]
    related_learnings: [links]

↓ (passed to pwrl-plan-research)

pwrl-plan-research output:
  scope: [from input]
  research:
    local: [findings]
    external: [findings]
    risks: [high-risk items detected]

↓ (passed to pwrl-plan-design)

pwrl-plan-design output:
  scope: [from input]
  research: [from input]
  design:
    architecture: [...]
    implementation_units: [u-ids]
    decisions: [key decisions]

↓ (passed to pwrl-plan-generate)

pwrl-plan-generate output:
  plan: [rendered markdown per tier]
  metadata:
    tier: Standard | Fast | Deep
    learnings_embedded: [count]
    units_decomposed: [count]
```

### Fallback Orchestration (Without Agents)

Original `pwrl-plan` skill detects if agents are available:

```
if (agents_enabled && planner_agent_exists) {
  delegate_to_pwrl_planner_agent()
  // User gets checkpoints and phase-by-phase feedback
} else {
  run_monolithic_fallback()
  // User gets traditional sequential workflow
  // Result: same plan, different UX
}
```

This ensures planning always works regardless of agent infrastructure.

## Tradeoffs

**Pros:**

- Clear separation of concerns; each skill is simple and focused
- Independently testable; can verify each phase in isolation
- Reusable: phases can be composed into different workflows
- Agent orchestration enables interactive checkpoints and pause points
- Easier to extend: adding a new phase doesn't require touching existing ones
- Backward compatible: monolithic fallback keeps existing workflows functional

**Cons:**

- More files to maintain (5 skills + agent vs. 1 skill)
- State passing contracts must be well-documented (schemas, examples, edge cases)
- Agent infrastructure adds system complexity (detection, error handling, routing)
- Requires careful phase boundary definition; bad splits cause state bloat

**Alternatives:**

1. **Keep monolithic** — Simpler deployment, but harder to test and less reusable
2. **Plugins/hooks instead of agents** — More decoupled, but less discoverable and harder to orchestrate
3. **Separate command-line tools** — Clear boundaries, but user has to invoke manually in sequence

## Related

- `docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md` — Implementation plan for this pattern
- `docs/learnings/decision/fallback-architecture-design-2026-06-05.md` — Why fallback was chosen
- `docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md` — How state is structured
