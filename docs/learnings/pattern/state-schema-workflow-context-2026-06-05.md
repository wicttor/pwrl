---
title: State Schema Design for Workflow Context Passing
date: 2026-06-05
category: pattern
tags:
  - state-management
  - workflow-design
  - contract-definition
  - data-schema
  - pwrl
severity: high
context: PWRL micro-skills state passing between phases (pwrl-plan-scope → research → design → generate)
---

# State Schema Design for Workflow Context Passing

## What It Is

A structured approach to defining how context flows between sequential workflow phases (skills). Each phase consumes input state from the previous phase, performs work, and produces output state for the next phase. State schemas are **contracts** that clarify what data each phase owns, what it requires, and what it produces.

**Pattern:**
- **Input schema** — What must be present for this phase to run
- **Operational state** — What this phase adds, modifies, or validates
- **Output schema** — What state is passed to the next phase
- **Versioning** — How to detect incompatible state versions (via `scope-id`, timestamps)

**Example: pwrl-plan phases**

```
Phase 1 (Scope):      produces ScopedContext
Phase 2 (Research):   consumes ScopedContext, adds ResearchFindings, produces EnrichedContext
Phase 3 (Design):     consumes EnrichedContext, adds TechnicalDesign, produces DesignedContext
Phase 4 (Generate):   consumes DesignedContext, adds PlanContent, produces FinalPlan
```

## Why It Matters

**Without schemas:**
- Each phase guesses what data it needs from the previous phase
- Phases accidentally overwrite each other's state
- Hard to debug: "why does the design phase not have the research findings?"
- New phases don't know what state to expect
- State grows unbounded with cruft and duplicates
- Phase isolation breaks down; hidden dependencies emerge

**With schemas:**
- Each phase has an explicit contract of what it consumes and produces
- Phases can be tested in isolation with mock state
- Clear ownership: "Phase 2 owns research findings; Phase 3 doesn't modify them"
- New phases can be added confidently with known input/output contracts
- State remains lean; no accidental duplication or bloat
- Easy to version: if schema changes, version number flags incompatibility

## When to Use

- **Multi-phase workflows** where state flows sequentially from one phase to the next
- **Distributed or agent-orchestrated workflows** where phases execute in different contexts (different skill invocations, different agents)
- **State must be serialized** (e.g., saved to disk between phases for pause/resume)
- **Multiple implementations** of a phase might exist (e.g., fast vs. detailed research)
- **Phase reuse** — if a phase will be used in different workflows, schema is essential

## Examples

### Complete State Schema (PWRL Planning)

```yaml
# ==============================================================================
# ScopedContext (output of pwrl-plan-scope, input to pwrl-plan-research)
# ==============================================================================
scope-id: 2026-06-05-001-scope
domain: software | non-software
status: confirmed

problem: "Clear problem statement"
intended_behavior: "Desired outcome"
success_criteria:
  - "Criterion 1"
  - "Criterion 2"

existing_plan:
  path: docs/plans/2026-06-05-001.md | null
  action: resume | review | archive | delete | create_new | none

related_learnings:
  - path: docs/learnings/pattern/some-pattern.md
    relevance: "How this learning applies to the problem"

requirements_found:
  - source: docs/brainstorms/feature-brainstorm.md
    excerpt: "Relevant requirement text"

learning_gaps:
  - gap_name: "Authentication strategy"
    action: "Run /pwrl-learnings after planning to document"
```

### Enriched State (with Research)

```yaml
scope: [ScopedContext from above]

research:
  local:
    findings:
      - source: docs/requirements/auth-spec.md
        excerpt: "Relevant quote"
      - source: docs/learnings/pattern/jwt-pattern.md
        excerpt: "How JWT works"
    high_risk_items:
      - "Integration with legacy auth system"
      - "GDPR compliance for user data"
  
  external:
    findings:
      - source: "RFC 7519 (JWT standard)"
        excerpt: "Token structure and claims"
      - source: "OWASP authentication guidelines"
        excerpt: "Best practices for token storage"
    
    risks_flagged:
      - severity: high
        risk: "Refresh token theft if stored insecurely"
        mitigation: "Use httpOnly cookies"
```

### Design State (with Architecture)

```yaml
scope: [ScopedContext]
research: [ResearchFindings]

design:
  architecture:
    layers:
      - name: middleware
        responsibility: "JWT validation"
        decisions:
          - "Extract token from Authorization header"
          - "Validate signature and expiry"
  
  implementation_units:
    - u-id: 2026-06-05-001-u1
      name: "JWT middleware"
      scope: "Implement token validation"
      dependencies: []
    - u-id: 2026-06-05-001-u2
      name: "Token refresh endpoint"
      scope: "Refresh expired tokens"
      dependencies: [u1]
  
  key_decisions:
    - decision: "Token refresh strategy"
      chosen: "Use httpOnly cookies for refresh tokens"
      rationale: "Prevents XSS token theft"
```

### Final Plan (Generated)

```yaml
scope: [ScopedContext]
research: [ResearchFindings]
design: [DesignedContext]

plan:
  content: "[Markdown plan for chosen tier]"
  tier: Standard | Fast | Deep
  
  metadata:
    learnings_embedded: 3
    units_decomposed: 2
    dependencies_validated: true
    generation_timestamp: 2026-06-05T14:32:00Z
```

### State Transition Validation

**Before Phase 2 runs:**
```javascript
function validateInputState(state) {
  assert(state.scope, "Missing scope from Phase 1")
  assert(state.scope.status === "confirmed", "Scope not confirmed")
  assert(state.scope["scope-id"], "Missing scope-id")
  // Phase 2 can now proceed with confidence
}
```

## Tradeoffs

**Pros:**

- **Explicit contracts** — No guessing; each phase knows exactly what to expect
- **Backward compatibility** — Old state versions can be detected and handled
- **Isolation** — Phases don't leak side effects; clear ownership of state
- **Reusability** — Phases can be used in different workflows if state schemas match
- **Testing** — Mock state that matches schema is easy to create
- **Debugging** — State snapshots at each phase make it easy to pinpoint problems

**Cons:**

- **Upfront design cost** — Schemas must be well-thought-out before implementation
- **Rigidity** — If a phase needs new state, the schema changes and may break downstream phases
- **Versioning overhead** — Schema changes require versioning strategy and migration logic
- **Verbosity** — State objects grow; large documents are harder to inspect
- **Over-engineering risk** — Simple workflows may not need formal schemas

**Alternatives:**

1. **Implicit contracts** (no schema docs) — Simpler initially, but error-prone as complexity grows
2. **Shared mutable state** (all phases mutate same object) — Less isolation, easier for simple cases, fragile as workflow grows
3. **Message queues** (each phase publishes events) — More decoupled, but harder to debug state flow
4. **Inline contracts** (schema defined in code, not docs) — Type-safe if using TypeScript, but docs are separate from code

## Related

- `pwrl-plan-scope/references/state-schema.md` — Detailed schema for Phase 1 output
- `pwrl-plan-research/references/state-schema.md` — Detailed schema for Phase 2 output
- `pwrl-plan-design/references/state-schema.md` — Detailed schema for Phase 3 output
- `pwrl-plan-generate/references/state-schema.md` — Detailed schema for Phase 4 output
- `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — How these schemas fit into the larger pattern
