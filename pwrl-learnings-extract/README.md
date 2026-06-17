# pwrl-learnings-extract Micro-Skill

**Phase 1 of pwrl-learnings Pipeline**

Extracts actionable learnings from code, commits, tasks, documentation, errors, and reviews.

## Purpose

Identify and extract raw learning opportunities from various source materials before classification.

## Input

- Source type (code, commit, task, documentation, error, review)
- Source content
- Optional: context (task_id, file_path, line_range)

## Processing

1. **Scan Content** — Identify learning signals (FIXME comments, uncommon patterns, TODOs, complex logic)
2. **Extract Candidates** — Create preliminary learning objects with type, problem, application
3. **Categorize** — Assign preliminary type (gotcha, pattern, decision, technical_fix, workflow)
4. **Extract Metadata** — Add source reference, timestamp, context
5. **Validate** — Ensure title, problem, application are present
6. **Generate Artifact** — Package all extracted learnings

## Output

Extraction artifact with:

- `learnings_found` (count)
- `by_type` (breakdown by category)
- `learnings` (array of extracted learning objects)
- `extraction_status: success`
- `ready_for_classification: true`

## Sources

| Source            | What to Look For                                               | Example                                 |
| ----------------- | -------------------------------------------------------------- | --------------------------------------- |
| **code**          | FIXME/HACK comments, uncommon patterns, optimization, security | Memoization, workaround, algorithm      |
| **commit**        | Commit message intent, diff patterns, linked issues            | Bug fix, performance, refactoring       |
| **task**          | Goals, constraints, blockers, solutions                        | Architecture choice, limitation found   |
| **documentation** | Architecture, decisions, tradeoffs, setup                      | Why this choice? How to avoid mistakes? |
| **error**         | Root cause, symptom, fix, prevention                           | Race condition detected and solved      |
| **review**        | Praised patterns, questioned approaches, feedback              | Anti-pattern found, best practice noted |

## Testing

See `tests/pwrl-learnings/extract-learnings.test.ts` (50 tests):

- Code extraction scenarios
- Commit extraction
- Task extraction
- Error trace extraction
- Metadata generation
- Validation
- Edge cases (empty, large, special characters)

## Error Cases

| Error               | Recovery                                           |
| ------------------- | -------------------------------------------------- |
| No learnings found  | Return empty but valid artifact                    |
| Invalid source type | Ask user to specify correct type                   |
| Content too large   | Split and process in chunks                        |
| Ambiguous type      | Use liberal classification, let later phase refine |

## Next Phase

Passes extraction artifact to `pwrl-learnings-classify` for refinement and priority assessment.
