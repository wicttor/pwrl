# pwrl-plan-research — Research Discovery Micro-Skill

**Status:** Phase 1, Unit 2 (U1.2)
**Version:** 1.0
**Role:** Second phase of pwrl-plan orchestrator

## Overview

`pwrl-plan-research` discovers local patterns, detects tech stack, identifies high-risk areas, and recommends external research. It bridges scoping (what are we building?) to design (how do we build it?).

**Purpose:** Transform a scoped context into comprehensive research findings with tech stack, local patterns, risk areas, and external research recommendations.

## Workflow

### Input

- Scope artifact from pwrl-plan-scope (problem frame, success criteria, learnings)

### Processing

**Step 1: Tech Stack Detection**

- Scan `package.json` for dependencies
- Look for `Dockerfile`, infrastructure configs
- Analyze codebase structure (`src/`, `lib/`, architecture patterns)
- Identify primary languages, frameworks, databases
- Output: Tech stack summary

**Step 2: Local Pattern Discovery**

- Scan codebase for architectural patterns (monolith, modular, microservices)
- Identify async style (callbacks, promises, async/await, RxJS)
- Look for testing patterns (Jest, Mocha, custom runners)
- Check code organization (by feature, by layer, by domain)
- Identify error handling approaches (try-catch, error objects, logging)
- Look for dependency injection, singleton, factory patterns
- Output: 6+ local patterns identified

**Step 3: Risk Identification**

- Map risks from problem frame + success criteria
- Common risk types:
  - Security (auth, data exposure, injection attacks)
  - Performance (scaling, database queries, caching)
  - Migrations (data consistency, downtime, rollback)
  - Distributed systems (async coordination, retries, idempotency)
  - Compliance (data retention, privacy, audit logging)
  - Integration (external APIs, versioning, rate limiting)
  - Testing (coverage, mocking, edge cases)
  - Maintenance (documentation, knowledge transfer, debugging)
- Output: 1-8 identified risk areas

**Step 4: External Research Recommendation**

- For each HIGH-risk area, check if additional research needed
- Recommend external sources (docs, best practices, tools)
- Examples: OWASP for security, AWS docs for performance, academic papers for algorithms
- User can approve/skip external research

**Step 5: Optional External Research Execution**

- If user approves: search for recommended resources
- Compile findings (URLs, summaries, applicability notes)
- Output: External research findings

**Step 6: Learnings Integration**

- Map discovered patterns to existing learnings
- Note which learnings are already known vs. new
- Suggest learnings to create post-implementation
- Output: Learnings integration notes

**Step 7: Compile Research Findings**

- Aggregate all discoveries into research artifact
- Include tech stack, patterns, risks, external research, learnings

### Output

**Research Artifact** (YAML frontmatter + structured data):

```yaml
---
format: pwrl-research-artifact
version: "1.0"
research_id: "2026-06-11-002-research"
created_date: "2026-06-11"
created_by: pwrl-plan-research
input_scope_id: "2026-06-11-001-scope"
tech_stack:
  languages: ["TypeScript", "JavaScript"]
  frameworks: ["Express", "React"]
  databases: ["PostgreSQL"]
  deployment: "Docker + Kubernetes"
local_patterns:
  - name: "Pattern Name"
    evidence: "Where found in code"
    applicability: "Relevance to current task"
risk_areas:
  - name: "Risk Name"
    severity: "HIGH|MEDIUM|LOW"
    rationale: "Why this is a risk"
    mitigation: "Initial mitigation idea"
external_research:
  - topic: "Research Topic"
    source: "URL or resource"
    applicability: "Why relevant"
learnings_integration:
  aligned_with:
    - title: "Learning Title"
      path: "docs/learnings/..."
  gaps:
    - "New learning needed"
---
```

## Error Handling

| Error                     | Recovery                                   |
| ------------------------- | ------------------------------------------ |
| Codebase analysis fails   | Continue with minimal tech stack info      |
| No local patterns found   | Log as "minimal codebase" and continue     |
| No risk areas identified  | Continue (may indicate low-risk task)      |
| External research timeout | Skip external research; use local findings |
| Learnings not found       | Continue (not an error)                    |

## Testing

**Test Coverage:** 25+ tests in [tests/pwrl-plan/research-patterns.test.ts](../../tests/pwrl-plan/research-patterns.test.ts)

**Test Suites:**

- Tech stack detection (package.json, Dockerfile, codebase analysis)
- Pattern discovery (architecture, async style, testing, organization)
- Risk identification (security, performance, migrations, distributed systems)
- External research (web search, resource compilation)
- Learnings integration (relevance filtering, gap identification)
- Artifact generation (schema validation)
- Edge cases (minimal codebase, no patterns, no risks)

## Protocol Documentation

**Detailed Workflow:** [research-discovery-protocol.md](references/research-discovery-protocol.md)

Covers:

- 6 processing steps with detailed detection algorithms
- Tech stack scanning pseudocode
- Pattern detection strategies
- Risk taxonomy (8 risk types)
- External research flow
- Output artifact schema
- Testing strategy (GIVEN-WHEN-THEN format)

## Example

**Input:**

```yaml
scope_id: "2026-06-11-003-email-validation"
problem_frame: "Users can submit invalid emails in signup form"
success_criteria:
  - "Email validation works"
  - "Invalid emails show error"
```

**Processing:**

1. Tech stack: TypeScript, Express, React, PostgreSQL
2. Local patterns:
   - Async: async/await with try-catch
   - Testing: Jest with mocked API
   - Organization: By feature (signup, profile, etc.)
3. Risk areas:
   - Security: Email enumeration attack risk (HIGH)
   - Performance: Regex too slow on long emails (MEDIUM)
   - Testing: Edge cases (internationalized domains, + syntax) (MEDIUM)
4. External research: Recommend RFC 5322, OWASP email validation
5. Learnings: "Email validation patterns" already exists (aligned)

**Output:**

```yaml
research_id: "2026-06-11-002-research"
tech_stack:
  languages: ["TypeScript"]
  frameworks: ["Express", "React"]
  testing: "Jest"
  pattern: "async/await"
local_patterns:
  - name: "Async/Await + Try-Catch"
    evidence: "src/routes/signup.ts:45-60"
    applicability: "Use same pattern for validation error handling"
risk_areas:
  - name: "Email Enumeration Attack"
    severity: "HIGH"
    rationale: "Invalid email reveals whether account exists"
    mitigation: "Return generic 'check your email' message"
external_research:
  - topic: "Email Validation Best Practices"
    source: "https://tools.ietf.org/html/rfc5322"
    applicability: "Understand email format constraints"
learnings_integration:
  aligned_with:
    - title: "Email Validation Patterns"
      path: "docs/learnings/pattern/email-validation.md"
```

## Key Features

- **Codebase Aware:** Analyzes actual tech stack and patterns
- **Risk-Focused:** Identifies HIGH-risk areas needing special attention
- **Pattern Recognition:** Surfaces existing patterns to reuse
- **External Integration:** Optional external research for learning gaps
- **Learnings Alignment:** Connects to existing knowledge base

## Usage

**Direct Call:**

```
/pwrl-plan-research [scope_artifact]
```

**Via Orchestrator:**

```
/pwrl-plan [task description]
```

(Orchestrator calls pwrl-plan-research after pwrl-plan-scope)

## Related Skills

- **Previous Phase:** [pwrl-plan-scope](../pwrl-plan-scope/SKILL.md) (produces input)
- **Next Phase:** [pwrl-plan-design](../pwrl-plan-design/SKILL.md) (consumes output)
- **Orchestrator:** [pwrl-plan](../pwrl-plan/SKILL.md)

## FAQs

**Q: What if I don't know the tech stack?**

A: Research phase will analyze codebase to detect it. If codebase unavailable, you can manually specify tech stack.

**Q: Should I do external research for all HIGH-risk areas?**

A: Recommended, but optional. For well-understood areas (standard CRUD operations), you can skip. For novel areas (security, performance), research helps.

**Q: What if findings conflict with existing learnings?**

A: Log the discrepancy. Update learnings post-implementation if needed.

**Q: How deep should pattern detection go?**

A: Sufficient to inform design phase. Look for 4-8 core patterns; stop after diminishing returns.

---

**Version:** 1.0 (pure skill, no agent routing)
**Last Updated:** 2026-06-11
**Protocol:** [research-discovery-protocol.md](references/research-discovery-protocol.md)
