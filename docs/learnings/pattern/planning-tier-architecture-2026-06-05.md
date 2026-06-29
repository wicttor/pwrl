---
title: Planning Tier Architecture - Fast, Standard, Deep
timestamp: 2026-06-05
category: pattern
type: PWRL Learning
tags:
  - planning-workflow
  - tier-selection
  - user-intent
  - risk-assessment
  - pwrl
severity: medium
context: PWRL planning tiers (Fast/Standard/Deep) applied uniformly across 4 micro-skills
---

# Planning Tier Architecture - Fast, Standard, Deep

## What It Is

A three-level planning depth system where **tier selection determines how much investigation, documentation, and risk assessment occurs** across all planning phases. Each tier produces a complete, executable plan, but with different levels of rigor and preparation.

**Tier Definitions:**

- **Fast** (1-2 hours max) — Quick scope, essential decisions only, minimal research, execution-ready high-level plan
- **Standard** (3-6 hours typical) — Balanced investigation, documented trade-offs, local + light external research, risk-aware plan
- **Deep** (full day+) — Exhaustive research, multiple design options with analysis, external research with evidence, comprehensive risk assessment, defensible plan

**Key insight:** Tiers are NOT separate workflows. All four planning phases execute for every tier; **tier selection tunes the depth of work within each phase**, not which phases run.

## Why It Matters

**Without tiers:**
- Users must choose: "Do I spend 1 hour or 8 hours planning?" with no guidance
- Planning rigor is left to user preference, not task risk
- Simple tasks get over-analyzed; risky tasks get under-prepared
- No standard vocabulary for "how much planning is this task worth?"

**With tiers:**
- Tier selection is **heuristic-based** on task risk and complexity
- Users know what to expect: each tier has a scope contract
- Rigor matches risk: riskier tasks automatically trigger deeper planning
- Teams can standardize: "this is a tier-2 task"
- Plans are comparable: "both Fast and Standard plans exist for the same task; here's the difference"

## When to Use

- **User-directed planning** — User runs `/pwrl-plan [task]` and explicitly chooses tier
- **Heuristic selection** — System detects task risk and recommends tier; user confirms or overrides
- **Iterative planning** — Start with Fast plan, upgrade to Standard or Deep if risks emerge
- **Stakeholder expectations** — "This rewrite needs a Deep plan with full design options"

## Examples

### Tier Selection Heuristic

```
Input: Task description, scope context

Risk Scoring:
  +0 points = Low risk (maintenance, documentation, refactoring low-risk areas)
  +1 point  = Medium risk (new feature, architecture change, integration)
  +2 points = High risk (security, system-critical, data migration, breaking change)
  +3 points = Critical (production systems, user-facing data, regulatory impact)

Decision Tree:

  if risk_score <= 0:
    recommend Fast
    rationale: "Straightforward task; minimal planning overhead justified"
  
  elif risk_score <= 2:
    recommend Standard
    rationale: "Moderate complexity; balance investigation with execution velocity"
  
  else (risk_score > 2):
    recommend Deep
    rationale: "High risk; invest time in thorough research and options analysis"
```

### Phase-Specific Depth Tuning

#### Phase 1: Scope (all tiers)

```
Fast Scope:
  - Problem: 1 sentence
  - Success criteria: 2-3 bullet points
  - Related learnings: Skip (or 1-2 if obvious)
  - Time: 15 minutes

Standard Scope:
  - Problem: 1 paragraph with context
  - Success criteria: 5-7 specific, measurable criteria
  - Related learnings: 3-5 relevant learnings from docs/learnings/
  - Time: 30-45 minutes

Deep Scope:
  - Problem: Multi-paragraph with historical context and stakeholder perspectives
  - Success criteria: 10+ detailed, testable criteria
  - Related learnings: All applicable learnings with detailed applicability notes
  - Stakeholder alignment: Interview notes, approval sign-off
  - Time: 1-2 hours
```

#### Phase 2: Research (tuned by tier)

```
Fast Research:
  - Local: Search docs/brainstorms/ and docs/learnings/; take first 2-3 relevant hits
  - External: Skip (or 1 quick web search if totally unfamiliar with tech)
  - Risk flagging: Surface only obvious high-risk items
  - Time: 30 minutes

Standard Research:
  - Local: Systematic search of docs/; 5-10 relevant findings per category
  - External: Quick research on key technologies, patterns, best practices (30 min web search)
  - Risk flagging: Identify moderate and high risks; assess mitigation strategies
  - Time: 1-2 hours

Deep Research:
  - Local: Exhaustive search; collect all relevant brainstorms, requirements, learnings
  - External: Deep dive on architecture, security, performance, compliance; 1-3 hours research
  - Risk assessment: Comprehensive risk matrix with likelihood/impact scoring
  - Evidence collection: Bookmark key resources, documentation, RFCs, vendor materials
  - Time: 3-6 hours
```

#### Phase 3: Design (tuned by tier)

```
Fast Design:
  - Architecture: High-level box diagram; 3-4 layers/components
  - Implementation units: 3-5 units; no detailed dependencies
  - No trade-off analysis; just go with the obvious approach
  - Time: 45 minutes

Standard Design:
  - Architecture: Detailed diagram with components, data flow, layer responsibilities
  - Implementation units: 8-15 units with clear dependencies and sequencing
  - Trade-off analysis: 1-2 key decisions with pros/cons of 2 options each
  - Time: 2-3 hours

Deep Design:
  - Architecture: Comprehensive with multiple views (component, deployment, data flow)
  - Implementation units: 20+ units, each with detailed scope, dependencies, risks, effort estimates
  - Trade-off analysis: 3-5 major decisions, each with 3+ options and detailed comparison
  - Alternative designs: 2-3 complete architecture options with cost/benefit analysis
  - Time: 4-8 hours
```

#### Phase 4: Generation (output tier)

```
Fast Plan Template:
  - Problem & success criteria (brief)
  - Key decisions (3-5 bullets)
  - Implementation units (5-10 lines each)
  - Next steps (3 bullets)
  - Total length: 2-3 pages

Standard Plan Template:
  - Problem & context (1 page)
  - Success criteria & risks (1 page)
  - Research findings summary (1-2 pages)
  - Architecture & design decisions (2-3 pages)
  - Implementation units (10-15 detailed units, 5-10 lines each)
  - Testing & rollout strategy (1 page)
  - Total length: 8-12 pages

Deep Plan Template:
  - Executive summary with business context (1 page)
  - Problem analysis & stakeholder perspectives (2-3 pages)
  - Research findings & evidence (3-5 pages)
  - Design options with detailed comparison (4-6 pages)
  - Chosen architecture with rationale (2-3 pages)
  - Implementation units with effort estimates & sequencing (20+ pages)
  - Risk management & mitigation strategies (2-3 pages)
  - Testing, deployment, monitoring plan (2-3 pages)
  - Total length: 30-50 pages
```

### Tier Upgrade Path

```
User starts with Fast plan (1.5 hours invested).
Risks or unknowns emerge during review.
User runs /pwrl-plan --tier Standard --resume (uses existing Fast scope/research as baseline)
Standard plan adds deeper research, more design options, risk analysis.
(2-3 more hours added)
User now has 4-5 hour investment, not 8-hour start from scratch.
```

## Tradeoffs

**Pros:**

- **Flexibility** — Users can match planning rigor to task risk and time budget
- **Efficiency** — Fast tiers avoid analysis paralysis on low-risk work
- **Risk matching** — Risky work automatically gets deeper planning
- **Iterative** — Start Fast, upgrade to Deep if needed; don't over-plan upfront
- **Comparable** — Teams can discuss tier-aware trade-offs ("do we have time for Standard?")
- **Uniform implementation** — Same 4-phase workflow applies; only depth changes

**Cons:**

- **Complexity** — Tier heuristic must be tuned to team/organization risk tolerance
- **Tier pressure** — Users might rush to Fast to save time, even for risky work
- **Diminishing returns** — Deep plans for low-risk tasks waste time
- **Consistency** — Teams must agree on when each tier is appropriate

**Alternatives:**

1. **No tiers; always "appropriate" depth** — Simpler conceptually, but harder to predict scope
2. **Separate skill per tier** — Clearer separation but more code duplication
3. **User-configurable depth tuples** — Maximum flexibility, but overwhelming choices

## Related

- `pwrl-plan-generate/references/tier-heuristic.md` — Detailed heuristic for tier selection
- `pwrl-plan-generate/references/render-workflow.md` — How templates are applied per tier
- `pwrl-plan/references/planning-tiers.md` — Complete tier documentation and templates
- `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — How tiers fit into the larger workflow
