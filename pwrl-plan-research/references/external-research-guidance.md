# External Research Guidance

This file documents how to generate targeted external research queries when high-risk areas are detected and external research is recommended.

## Decision Point

External research is recommended when:

```
should_run_external_research = high_risk_detected AND patterns_found_count < 3
```

- **high_risk_detected:** One or more high-risk areas identified (see high-risk-detection.md)
- **patterns_found_count:** Number of similar local implementations found (< 3 = insufficient)

If this condition is true, ask the user via `ask_user`:

> "This task involves high-risk area(s) ([areas]) with only [count] local example(s). Should I run external research?"

**Options:** yes, no, skip

## Generating Targeted Queries

If the user accepts, generate a specific query for external research. The query should include:

1. **Topic:** The specific area (e.g., "payment gateway", "OAuth2 implementation")
2. **Tech stack context:** Relevant technologies from the scoped context (e.g., "Node.js", "Express", "PostgreSQL")
3. **Scope:** The kind of information needed (e.g., "best practices", "patterns", "migration guide", "troubleshooting")
4. **Year/date:** Current year or "2024" to get recent guidance

## Query Templates

### Template 1: Security Area

```
[security-area] implementation patterns [tech-stack] [year]
```

**Example queries:**
- `JWT authentication patterns Node.js Express 2024`
- `OAuth2 implementation best practices Python FastAPI`
- `Session management security patterns Java Spring 2024`

### Template 2: Payments Area

```
[payment-provider] integration [tech-stack] [scope]
```

**Example queries:**
- `Stripe integration Node.js best practices`
- `Payment gateway PCI compliance Python 2024`
- `Subscription billing implementation Stripe Go 2024`

### Template 3: API Design Area

```
[api-type] design patterns [scope] [year]
```

**Example queries:**
- `GraphQL vs REST API design patterns 2024`
- `REST API versioning strategies 2024`
- `API rate limiting and throttling patterns Node.js 2024`

### Template 4: Migrations Area

```
[migration-type] migration guide [tech-stack] [year]
```

**Example queries:**
- `Database migration MySQL to PostgreSQL best practices 2024`
- `Framework upgrade patterns Node.js 2024`
- `Zero-downtime schema migration patterns 2024`

### Template 5: Complex Logic Area

```
[algorithm-type] implementation [tech-stack] [scope]
```

**Example queries:**
- `Search algorithm optimization patterns Node.js`
- `Machine learning model selection best practices Python 2024`
- `Financial calculation precision and accuracy patterns 2024`

### Template 6: Infrastructure Area

```
[infrastructure-tech] [deployment-type] [scope] [year]
```

**Example queries:**
- `Kubernetes deployment best practices 2024`
- `Docker containerization patterns Node.js`
- `Scaling microservices architecture patterns 2024`

## Providing Guidance to User

Format the guidance for the user:

### Option A: If Librarian Skill is Available

```
/librarian "[generated-query]"
```

**Example:**
```
/librarian "JWT authentication patterns Node.js Express 2024"
```

### Option B: If Using Web Search

```
Web search: "[generated-query]"
```

**Example:**
```
Web search: "Stripe integration Node.js best practices 2024"
```

### Option C: If Research Is Manual

```
Suggested external research query:

[query]

You can research this topic via:
1. GitHub repositories with similar implementations
2. Official documentation for [relevant library/framework]
3. Blog posts and articles on [topic]
4. Stack Overflow or community forums
```

## Refining Queries Based on Findings

After initial external research, you may refine queries based on findings:

| Finding | Refinement Strategy |
| --- | --- |
| "Multiple approaches exist" | Narrow to specific context: Add tech stack or use case |
| "Information is outdated" | Add current year or "2024" to query |
| "Too many results" | Add more specifics: "best practices" or "production" |
| "Not enough results" | Broaden query or try alternative terminology |
| "Conflicting advice" | Separate queries for each approach; compare side-by-side |

## Integration Notes

- This guidance is provided in Step 4 of `pwrl-plan-research/SKILL.md`
- Queries should be actionable and specific to the project's tech stack
- If the librarian skill is unavailable, provide web search guidance instead
- Encourage the user to capture key findings as new learnings via `/pwrl-learnings` after research
