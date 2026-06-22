# pwrl-plan-research: Research Discovery Protocol

## Purpose

Define the input/output contracts for the `pwrl-plan-research` micro-skill. This skill:

- Takes scoped context from `pwrl-plan-scope`
- Discovers local patterns, tech stack, and risk indicators
- Recommends external research if needed
- Returns research artifact for `pwrl-plan-design`

## Input Contract

### Type: Scoped Context Artifact (from U1.1)

```yaml
# Input artifact from pwrl-plan-scope:
format: pwrl-scope-artifact
problem_frame: "..."
intended_behavior: "..."
success_criteria: [...]
domain: software | non-software
existing_plan: { path: ..., action: ... }
related_learnings: [...]
```

### User Context

May prompt user via `ask_user_question` for:

- Confirmation of tech stack detection
- Approval for external research
- Risk area clarifications

## Processing Steps

### 1. Tech Stack Detection

Analyze codebase to identify:

```
ALGORITHM:
  scan: package.json, Dockerfile, .tool-versions, README.md, src/ structure
  detect: {
    languages: [list of programming languages],
    frameworks: [detected frameworks],
    databases: [detected data stores],
    deployment: [detected deployment targets],
    testing: [detected test frameworks],
    ci_cd: [detected CI/CD tools]
  }

  PROMPT user to confirm detected stack (if uncertain)
```

Example Detection:

```
languages: [TypeScript, JavaScript, Shell]
frameworks: [React, Node.js, Express]
databases: [PostgreSQL, Redis]
deployment: [Docker, Kubernetes]
testing: [Jest, Cypress]
ci_cd: [GitHub Actions]
```

### 2. Local Pattern Discovery

Search codebase for recurring patterns:

```
ALGORITHM:
  scan: src/, lib/, utils/ directories
  identify: {
    architectural_patterns: [MVC, service layer, middleware, etc.],
    error_handling_style: [try-catch, error-boundary, etc.],
    async_patterns: [async-await, promises, callbacks, etc.],
    testing_patterns: [unit, integration, e2e coverage],
    file_organization: [by-feature, by-layer, flat],
    naming_conventions: [camelCase, snake_case, etc.],
    dependency_injection: [constructor, props, service locator, etc.]
  }
```

Example Discovery:

```
architectural_patterns: [service layer, middleware]
error_handling_style: [try-catch with typed errors]
async_patterns: [async-await]
testing_patterns: [unit + integration (70% coverage)]
file_organization: [by-feature]
naming_conventions: [camelCase for variables/functions, PascalCase for classes]
```

### 3. Risk Area Identification

Identify high-risk aspects that may need external research:

```
HIGH-RISK INDICATORS:
  - security: Any mention of auth, cryptography, payment, data protection
  - performance: Any mention of scale, optimization, benchmarking
  - distributed_systems: Multiple services, APIs, databases
  - data_migrations: Schema changes, data transformations
  - infrastructure: Cloud migrations, Kubernetes, containerization
  - compliance: GDPR, PCI-DSS, SOC2
  - third_party_integrations: External APIs, webhooks
  - legacy_systems: Old codebases, deprecated libraries
```

Algorithm:

```
ALGORITHM:
  risk_areas = []
  for each keyword in problem_frame + success_criteria:
    if keyword matches HIGH-RISK pattern:
      risk_areas.append(keyword)

  if risk_areas is not empty:
    PROMPT user: "High-risk area detected: {risk_area}. Proceed with external research?"
    if YES:
      recommendations = external_research_topics(risk_area)
```

Example:

```
problem_frame: "Migrate session storage to Redis"
risk_areas_detected: ["data migration", "caching", "distributed systems"]
recommendation: "Research Redis best practices for session storage"
```

### 4. Related Learnings Integration

Leverage learnings from pwrl-plan-scope:

```
ALGORITHM:
  for each learning in input.related_learnings:
    extract: { topic, tags, key_insights }
    suggest: "Based on '{topic}' learning, consider: [insight]"

  compile: research_recommendations (integrated from learnings)
```

Example:

```
Learning: "Topological Sort Performance"
Integration: "For parallel execution, use topological sort (see learning for optimization techniques)"
```

### 5. External Research Recommendation

If high-risk areas identified and user approves:

```
ALGORITHM:
  recommendations = []
  for each risk_area:
    topics = extract_research_topics(risk_area)
    recommendations.append({
      topic: risk_area,
      search_terms: [...],
      suggested_sources: ["docs", "blogs", "papers"],
      time_estimate: "15-30 min"
    })

  if user confirms external research:
    PERFORM actual web search (if available)
    SUMMARIZE findings
    return findings artifact
```

Example:

```
Risk Area: "Data Migration"
Suggested Research:
  - "Redis session migration best practices"
  - "Avoiding session data loss during migration"
  - "Performance testing Redis vs. in-memory"
Search Time Estimate: 20-30 minutes
```

### 6. Compile Research Artifact

Create output artifact summarizing all discoveries:

```
ALGORITHM:
  output = {
    tech_stack: [detected from step 1],
    local_patterns: [discovered from step 2],
    risk_areas: [identified from step 3],
    risk_recommendations: [if any],
    external_research: {
      recommended: boolean,
      topics: [...],
      findings: [if research performed]
    },
    learnings_integrated: [which learnings informed research],
    notes: "Any observations about codebase, architecture, complexity"
  }
  return output
```

## Output Contract

### Type: Research Artifact

```yaml
---
format: pwrl-research-artifact
version: "1.0"
created-date: YYYY-MM-DD
created-by: pwrl-plan-research
research-id: YYYY-MM-DD-NNN-research
input-scope-id: YYYY-MM-DD-NNN-scope  # Reference to input artifact
---

# Research Findings

## Tech Stack

Detected technologies and frameworks:

- **Languages:** TypeScript, JavaScript, Shell
- **Frameworks:** React, Node.js/Express
- **Databases:** PostgreSQL, Redis
- **Testing:** Jest, Cypress
- **Deployment:** Docker, Kubernetes
- **CI/CD:** GitHub Actions

## Local Patterns

Architectural and code patterns observed in codebase:

- **Architecture:** Service layer + middleware pattern
- **Error Handling:** try-catch with typed errors
- **Async Style:** async-await (not promises or callbacks)
- **Testing:** Unit + integration (70% coverage)
- **File Organization:** By-feature structure
- **Naming Conventions:** camelCase for vars/functions, PascalCase for classes
- **Dependency Injection:** Constructor injection

## Risk Areas Identified

High-risk aspects requiring special attention:

- **Area:** Data Migration (session storage → Redis)
  - **Impact:** Data loss if not handled carefully
  - **Recommendation:** Research Redis best practices + connection pooling

- **Area:** Distributed Systems (multiple services)
  - **Impact:** Increased complexity, consistency concerns
  - **Recommendation:** Understand service boundaries + communication patterns

## External Research

Research performed or recommended:

- **Topic:** "Redis Session Migration Best Practices"
  - **Search Terms:** redis session storage, migration patterns, TTL management
  - **Key Finding:** "Use pipeline commands for atomic operations; always have fallback to in-memory"
  - **Source:** Redis documentation, architecture patterns
  - **Time Spent:** 25 minutes

- **Topic:** "Distributed System Consistency"
  - **Search Terms:** distributed transactions, eventual consistency, CAP theorem
  - **Key Finding:** "For session state, eventual consistency is acceptable; prioritize availability"
  - **Source:** Technical blogs, architecture articles
  - **Time Spent:** 20 minutes

## Learnings Integration

Related learnings that informed research:

- **"Topological Sort Performance"** — Guides unit decomposition order for optimal parallelization
- **"File Conflict Detection"** — Important for parallel task execution; suggests conflict matrix
- **"Atomic Commit Semantics"** — Design pattern for ensuring consistency across services

## Research Notes

Summary observations about codebase and problem space:

- Codebase is well-structured with clear separation of concerns
- Async patterns are consistent (good foundation for concurrent work)
- Testing coverage is solid; new units should maintain >70% target
- Team is comfortable with Redis; migration risk is moderate
- Performance is a secondary concern (not mentioned in success criteria)

## Confidence Level

Confidence in recommendations: **HIGH** (based on local patterns + learnings)

- High-risk areas: Identified and addressed with research
- Tech stack: Clearly detected
- Patterns: Consistent with best practices
```

## Error Cases

### Error: Codebase Analysis Fails

```
BEHAVIOR:
  ERROR: "Could not analyze codebase (missing package.json or src/ structure)"
  RECOVERY:
    1. Verify repository structure
    2. Confirm programming language
    3. Proceed with minimal tech stack info
    4. Continue to risk identification step
```

### Error: High-Risk Area with No Prior Learning

```
BEHAVIOR:
  RISK_AREA: "Security: encryption"
  ACTION: Recommend external research
  PROMPT: "This is high-risk. Should we research best practices?"
  if YES: Perform external research (or direct user to resources)
  if NO: Flag as learning gap (post-implementation documentation needed)
```

### Error: External Research Unavailable

```
BEHAVIOR:
  AVAILABLE_RESEARCH: None (no web access)
  ACTION: Suggest research topics for user to investigate manually
  CONTINUE: Proceed to design phase with identified topics
```

## State Persistence

Research artifact is:

1. Returned to user (in-memory or printed)
2. Optionally persisted to: `docs/plans/.research/YYYY-MM-DD-NNN-research.md`
3. Passed to `pwrl-plan-design` micro-skill

## Downstream Consumption

Research artifact consumed by:

- **pwrl-plan-design** — Uses tech stack, patterns, risk areas to inform unit decomposition
- **pwrl-plan-generate** — Uses external research findings to populate plan's Technical Design section

## Testing Strategy (TDD)

```
Test: "Tech Stack Detection"
  GIVEN: package.json with React, TypeScript, Jest
  WHEN: tech stack detected
  THEN: includes React, TypeScript, Jest in artifact

Test: "Risk Area Identification"
  GIVEN: problem_frame = "Migrate to Redis"
  WHEN: risk areas identified
  THEN: includes "data migration", "caching" as risks

Test: "External Research Recommendation"
  GIVEN: risk_area = "security: encryption"
  WHEN: research recommended
  THEN: includes research topic + suggested search terms
  AND: user_prompt asks for approval

Test: "Learnings Integration"
  GIVEN: input includes related learnings
  WHEN: research compiled
  THEN: learnings referenced in artifact
  AND: insights integrated into recommendations
```

---

**Document Version:** 1.0
**Date:** 2026-06-11
**Status:** Reference specification for U1.2 implementation
