# Learnings Index Gate Logic

## Overview

Step 4 of the scope-gathering workflow validates existing project learnings and identifies gaps. This file documents the detailed logic for checking learnings and connecting them to the planning task.

## Procedure

### 1. Read the Learnings Index

Read `docs/learnings/INDEX.md` to understand what learnings exist in the project.

The index is a table or list of learning entries with:

- **Title**: Name of the learning
- **Category**: Type (e.g., `concept/`, `pattern/`, `gotcha/`, `workflow/`, `decision/`, `technical-fix/`)
- **Date Created**: When the learning was documented
- **One-line Summary**: Brief description

### 2. Search for Keyword Matches

Search entries for keywords matching the task description. Consider:

**From problem statement:**

- Core domain terms (e.g., "authentication", "payment", "migration")
- Technologies mentioned (e.g., "Node.js", "PostgreSQL", "React")
- Patterns referenced (e.g., "microservices", "caching", "event-driven")

**From intended behavior:**

- Implementation approach hints
- Integration points
- Architectural implications

**From success criteria:**

- Performance requirements (e.g., "sub-second response time" → search "performance")
- Compatibility requirements (e.g., "mobile support" → search "responsive")

### 3. Rate Relevance for Each Match

For each matching learning entry, assign:

| Relevance | Usage                                             |
| --------- | ------------------------------------------------- |
| HIGH      | Directly applicable to this task; use as guidance |
| MEDIUM    | Related context; helpful background               |
| LOW       | Tangentially related; may inform edge cases       |

### 4. Add to Related Learnings List

For each HIGH or MEDIUM relevance match:

```
- docs/learnings/[category]/[name].md — [1-line applicability note]
```

Example:

```
- docs/learnings/pattern/event-driven-architecture.md — Framework for distributed components in microservices design
- docs/learnings/gotcha/database-migration-edge-cases.md — Reference for data integrity during schema changes
```

### 5. Identify Learning Gaps

Compare the task scope to existing learnings:

**Gap exists if:**

- Task touches an area not covered by any learning (e.g., task involves "Kubernetes deployment" but no K8s learning exists)
- Existing learning is outdated (date > 1 year old for fast-moving areas)
- Task requires deep expertise in a new area (e.g., "implement custom compiler" but no compiler learnings exist)

**Document each gap:**

```
- [Gap Name] — [Follow-up action: document via /pwrl-learnings]
```

Example:

```
- Kubernetes deployment patterns — Document during implementation via /pwrl-learnings
- Custom error telemetry — Research and capture via /pwrl-learnings if not covered
```

### 6. Handle Empty Learning Index

If `docs/learnings/INDEX.md` doesn't exist or has no entries:

```
No learnings indexed yet — consider documenting patterns via /pwrl-learnings as implementation progresses.
```

This is not a blocker; gaps will be identified during implementation.

## Examples

### Example 1: Task with High Learnings Coverage

**Task:** "Add JWT-based authentication to existing REST API"

**Learnings searched:** authentication, JWT, REST, API, security

**Matches found:**

- `docs/learnings/pattern/jwt-authentication.md` (HIGH)
- `docs/learnings/gotcha/jwt-expiration-edge-cases.md` (HIGH)
- `docs/learnings/decision/auth-session-vs-jwt.md` (MEDIUM)
- `docs/learnings/technical-fix/cors-with-auth-headers.md` (MEDIUM)

**Gaps identified:** None

**Output:**

```yaml
Related Learnings:
  - docs/learnings/pattern/jwt-authentication.md — Standard JWT flow implementation
  - docs/learnings/gotcha/jwt-expiration-edge-cases.md — Token refresh and expiration handling
  - docs/learnings/decision/auth-session-vs-jwt.md — Comparison of session vs JWT approaches
  - docs/learnings/technical-fix/cors-with-auth-headers.md — CORS header configuration for auth

Learning Gaps: None identified
```

### Example 2: Task with Some Learnings and Identified Gaps

**Task:** "Migrate from MySQL to PostgreSQL with zero downtime"

**Learnings searched:** migration, database, schema, versioning, MySQL, PostgreSQL, zero-downtime

**Matches found:**

- `docs/learnings/pattern/database-versioning.md` (HIGH)
- `docs/learnings/gotcha/foreign-key-constraints.md` (MEDIUM)
- `docs/learnings/technical-fix/backup-strategies.md` (LOW)

**Gaps identified:**

- Zero-downtime migration strategies (advanced technique, not yet documented)
- PostgreSQL-specific performance tuning post-migration

**Output:**

```yaml
Related Learnings:
  - docs/learnings/pattern/database-versioning.md — Multi-version schema support during migration
  - docs/learnings/gotcha/foreign-key-constraints.md — Handling constraints in pg vs mysql
  - docs/learnings/technical-fix/backup-strategies.md — Backup procedures during migration

Learning Gaps:
  - Zero-downtime migration strategies — Document via /pwrl-learnings during implementation
  - PostgreSQL performance tuning — Capture post-migration learnings
```

### Example 3: Novel Task with No Matching Learnings

**Task:** "Implement custom distributed tracing system for microservices"

**Learnings searched:** tracing, distributed, observability, logging, microservices

**Matches found:** None

**Gaps identified:**

- Distributed tracing architecture (novel for this project)
- Instrumentation patterns for microservices
- Sampling and storage strategies

**Output:**

```yaml
Related Learnings: None found

Learning Gaps:
  - Distributed tracing architecture — Document via /pwrl-learnings during spike/research
  - Microservices instrumentation patterns — Capture as implementation patterns
  - Sampling and storage strategies — Reference external research; document learnings
```

## Integration Notes

- This gate is part of Step 4 in `pwrl-plan-scope/SKILL.md`
- Learnings are passed downstream to `pwrl-plan-research` and `pwrl-plan-generate`
- Learning gaps are tracked in the final plan for post-implementation documentation
- Use `/pwrl-learnings` skill to document new learnings discovered during implementation
