# pwrl-learnings-classify Micro-Skill

**Phase 2 of pwrl-learnings Pipeline**

Classifies and prioritizes learnings by type, domain, severity, and applicability.

## Purpose

Refine preliminary classifications and assign priority, enabling effective filtering and retrieval.

## Input

Extraction artifact from `pwrl-learnings-extract` with extracted learnings.

## Processing

1. **Refine Type** — Improve preliminary type classification with higher confidence
2. **Assign Domain** — Categorize by technology/domain (backend, frontend, security, devops, process)
3. **Assess Priority** — Determine severity (critical, important, nice_to_know)
4. **Score Applicability** — Rate relevance to current project and general applicability (0-10)
5. **Add Tags** — Assign language, framework, topic, difficulty tags
6. **Identify Related** — Find duplicates and complementary learnings

## Output

Classification artifact with:

- `classified_learnings` (array with refined metadata)
- `types_breakdown` (count by type)
- `domains_breakdown` (count by domain)
- `priority_breakdown` (count by severity)
- `duplicates_found` (count of potential duplicates)
- `classification_status: success`
- `ready_for_deduplication: true`

## Classification Dimensions

**Type Refinement:**

- Gotcha (unexpected behavior, trap)
- Pattern (reusable solution, best practice)
- Decision (why something was chosen)
- Technical Fix (solution to problem)
- Workflow (process improvement)

**Domain Assignment:**

- Backend, Frontend, Architecture, DevOps, Process, Security, Performance, Testing

**Priority (Severity):**

- Critical: security, blocking, causes data loss
- Important: best practice, common mistake, performance
- Nice to Know: edge case, rare, optimization

**Applicability (0-10):**

- 8-10: Highly relevant to current project
- 5-7: Somewhat applicable
- 0-4: Niche, rarely needed

## Testing

See `tests/pwrl-learnings/classify-learnings.test.ts` (50 tests):

- Type refinement
- Domain assignment
- Priority assessment
- Applicability scoring
- Tag assignment
- Duplicate detection
- Confidence scoring

## Error Cases

| Error                 | Recovery                                           |
| --------------------- | -------------------------------------------------- |
| Type ambiguity        | Assign primary, note alternative, lower confidence |
| Unknown domain        | Use closest match, flag for review                 |
| Unclear applicability | Use defaults (5.0), flag for manual review         |

## Next Phase

Passes classification artifact to `pwrl-learnings-structure` for storage preparation.
