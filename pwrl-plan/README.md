# pwrl-plan — Planning Skill Architecture

**Status:** Pure skill pipeline (no agent routing)
**Version:** 2.0
**Phase:** U1 (Planning Architecture Refactoring)

## Overview

`pwrl-plan` is the PWRL planning orchestrator. It coordinates a deterministic four-phase pipeline that transforms a task description into a structured, actionable implementation plan.

**Key Change (v2.0):** Removed agent routing logic and fallback branches. Now calls micro-skills sequentially in a single, predictable code path.

## Architecture

```
Input (task description)
   ↓
┌──────────────────────────────────────────┐
│ pwrl-plan ORCHESTRATOR                   │
├──────────────────────────────────────────┤
│ Phase 1: Call pwrl-plan-scope            │
│ Phase 2: Call pwrl-plan-research         │
│ Phase 3: Call pwrl-plan-design           │
│ Phase 4: Call pwrl-plan-generate         │
└──────────────────────────────────────────┘
   ↓
Output (plan file saved to docs/plans/)
```

### Four Micro-Skills

1. **pwrl-plan-scope** (U1.1)
   - **Purpose:** Gather context, validate domain, bootstrap requirements
   - **Input:** Task description from user
   - **Output:** Scoped context artifact with problem frame, success criteria, related learnings
   - **Location:** [pwrl-plan-scope/](../pwrl-plan-scope/)

2. **pwrl-plan-research** (U1.2)
   - **Purpose:** Discover patterns, tech stack, risks, integration points
   - **Input:** Scope artifact from U1.1
   - **Output:** Research findings artifact with tech stack, patterns, risk areas
   - **Location:** [pwrl-plan-research/](../pwrl-plan-research/)

3. **pwrl-plan-design** (U1.3)
   - **Purpose:** Decompose work into units, map dependencies, assess complexity
   - **Input:** Scope + Research artifacts
   - **Output:** Design artifact with U1, U2, ..., UX units and dependencies
   - **Location:** [pwrl-plan-design/](../pwrl-plan-design/)

4. **pwrl-plan-generate** (U1.4)
   - **Purpose:** Render plan using tier template, embed learnings, save to file
   - **Input:** Design + Scope artifacts
   - **Output:** Final plan file in docs/plans/
   - **Location:** [pwrl-plan-generate/](../pwrl-plan-generate/)

## Skill Entry Point

**Command:** `/pwrl-plan [task description]`

**Flow:**

1. Calls `pwrl-plan-scope` with user input
2. Passes scope artifact to `pwrl-plan-research`
3. Passes scope + research to `pwrl-plan-design`
4. Passes design + scope to `pwrl-plan-generate`
5. Returns success confirmation with filepath

**Error Recovery:** Each micro-skill handles errors with recovery suggestions; orchestrator passes errors up to user with context.

## Key Features

### Deterministic Pipeline

- Always executes phases in order: scope → research → design → generate
- No branching logic, no fallback paths
- Simpler to test and maintain

### Planning Tiers

- **FAST** (5-15 min): Bug fixes, small tweaks
- **STANDARD** (30-45 min): Most features
- **DEEP** (1-2 hours): Architecture, security, migrations

### Artifact-Driven Design

- Each phase produces structured output (JSON/YAML artifact)
- Next phase consumes previous artifact
- Enables resumability and phase independence
- YAML frontmatter for metadata, traceability

### Error Handling

- **Explicit failures:** Never silent errors
- **Phase-level recovery:** Each micro-skill defines recovery suggestions
- **User choice:** Prompt for decisions at each error point

## Testing & Validation

### Test Coverage

- **pwrl-plan-scope:** 30+ tests (context gathering, domain validation, learnings search)
- **pwrl-plan-research:** 25+ tests (tech stack detection, pattern discovery, risk identification)
- **pwrl-plan-design:** 35+ tests (unit decomposition, dependency mapping, cycle detection)
- **pwrl-plan-generate:** 30+ tests (tier selection, template rendering, filename generation)
- **Integration:** 30+ tests for full pipeline

**Total:** 150+ test cases covering happy path, error cases, edge cases, and consolidation audit

### Test Files

- [tests/pwrl-plan/scope-extraction.test.ts](../tests/pwrl-plan/scope-extraction.test.ts)
- [tests/pwrl-plan/research-patterns.test.ts](../tests/pwrl-plan/research-patterns.test.ts)
- [tests/pwrl-plan/design-decomposition.test.ts](../tests/pwrl-plan/design-decomposition.test.ts)
- [tests/pwrl-plan/generate-plan.test.ts](../tests/pwrl-plan/generate-plan.test.ts)

## Micro-Skill Documentation

### [pwrl-plan-scope](../pwrl-plan-scope/README.md)

Entry point for planning. Gathers context, validates domain, searches for related learnings and requirements.

**Protocol:** [scope-context-protocol.md](../pwrl-plan-scope/references/scope-context-protocol.md)

### [pwrl-plan-research](../pwrl-plan-research/README.md)

Discovers local patterns, tech stack, integration points, and high-risk areas.

**Protocol:** [research-discovery-protocol.md](../pwrl-plan-research/references/research-discovery-protocol.md)

### [pwrl-plan-design](../pwrl-plan-design/README.md)

Decomposes work into implementation units, maps dependencies, detects cycles, assesses complexity.

**Protocol:** [unit-decomposition-algorithm.md](../pwrl-plan-design/references/unit-decomposition-algorithm.md)

### [pwrl-plan-generate](../pwrl-plan-generate/README.md)

Selects tier, renders plan from template, embeds learnings, generates unique filename, saves to file.

**Protocol:** [plan-template-selection.md](../pwrl-plan-generate/references/plan-template-selection.md)

## Frequently Asked Questions

**Q: Why remove agent routing?**

A: Agents added unnecessary complexity. The micro-skill pipeline is deterministic and more predictable. Direct skill-to-skill calls are easier to understand, test, and maintain.

**Q: Can I skip a phase?**

A: No, the orchestrator always runs all four phases. Each phase depends on previous phases' output. If you need only one micro-skill, invoke it directly (e.g., `/pwrl-plan-design`).

**Q: What if a phase errors?**

A: Each micro-skill handles errors with recovery suggestions. You can retry, provide clarification, adjust scope, or abort. No silent failures.

**Q: Can micro-skills be reused elsewhere?**

A: Yes! The micro-skills are independent and can be invoked by other workflows (e.g., pwrl-work can use pwrl-plan-design for unit decomposition).

**Q: How do I know what tier my plan will be?**

A: `pwrl-plan-generate` auto-selects based on complexity (units, effort). If selection is ambiguous, it prompts you to choose.

**Q: Can I update an existing plan?**

A: Yes. If a filename collision is detected, you can choose to update the existing plan or increment the sequence number.

## Related Documents

- [SKILL.md](SKILL.md) — Skill definition and workflow details
- [references/planning-tiers.md](references/planning-tiers.md) — Tier definitions and decision criteria
- [docs/learnings/INDEX.md](../docs/learnings/INDEX.md) — Related learnings and insights
- [docs/plans/](../docs/plans/) — Example plans generated by this skill

## Migration from v1.x

**Backward Compatibility:** v2.0 maintains same input/output as v1.x. No breaking changes for users.

**Key Differences:**

- No agent detection logic (was in `references/agent-routing.md`)
- No fallback monolithic workflow (was in `references/fallback-workflow.md`)
- Direct micro-skill calls replace agent delegation
- Same SKILL.md interface, different internal implementation

**Upgrading:** No user action needed. Plans generated by v2.0 are identical to v1.x plans.

## Performance & Reliability

### Scalability

- Tested with plans up to 50+ units (DEEP tier)
- Micro-skill composition enables parallel research (future optimization)
- Artifact-driven design enables resumability

### Reliability

- 150+ automated tests covering all error paths
- Phase-level error handling with recovery suggestions
- No silent failures; all errors explicit and user-handled

### Auditability

- YAML frontmatter tracks plan ID, input references, creation date, creator
- Artifact chain enables traceability from scope → research → design → plan
- Learnings integration logged in design artifact

## Future Extensions

**Planned (Phase 2+):**

- Reuse pwrl-plan-design in pwrl-work skill (unit decomposition)
- Consolidate shared utilities (context extraction, artifact I/O) in Phase 5
- Parallel research execution for high-complexity plans
- Integration with external research APIs (Phase 2)

**Possible (Future):**

- Integration with GitHub Projects for task tracking
- Real-time plan collaboration
- ML-assisted unit decomposition
- Cost estimation for cloud resources

---

**Version:** 2.0 (pure skill pipeline)
**Last Updated:** 2026-06-11
**Next Phase:** Phase 2 (pwrl-work refactoring)
