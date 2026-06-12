# pwrl-work-triage Micro-Skill

**Phase 1 of pwrl-work Pipeline**

Classifies input and extracts work task data from multiple input formats.

## Purpose

Determine work scope and requirements from:

- **Task files** (docs/tasks/to-do/\*.md)
- **Plan files** (docs/plans/\*.md with multiple units)
- **Bare prompts** ("add email validation")
- **Empty input** (defaults to latest task)

## Input

- Task file path, plan file path, bare prompt, or empty

## Processing

1. **Identify input type** — Is this a task file, plan file, bare prompt, or empty?
2. **Extract task data** — Parse YAML frontmatter, unit ID, files, dependencies
3. **Validate fields** — Ensure required fields present (unit_id, title, goal, files, acceptance_criteria)
4. **Detect conflicts** — Check for overlapping files with in-progress tasks
5. **Confirm with user** — Display summary, ask ready/no/modify
6. **Generate artifact** — YAML frontmatter + structured data

## Output

Triage artifact with:

- `unit_id`, `title`, `goal`
- `files` (create/modify/test lists)
- `acceptance_criteria` (2+)
- `test_scenarios`
- `dependencies` (resolved)
- `status: triaged`
- `ready_for_execution: true`

## Error Cases

| Error                   | Recovery                           |
| ----------------------- | ---------------------------------- |
| File not found          | Suggest checking path              |
| Plan with no units      | Ask which unit to execute          |
| Missing required fields | Prompt for missing data            |
| File conflicts          | Suggest combining/separating tasks |
| Circular dependencies   | Reorder or mark as blocker         |

## Testing

See `tests/pwrl-work/triage-input.test.ts` (30-35 tests):

- Task file input validation
- Plan file parsing and unit extraction
- Bare prompt classification
- Dependency resolution
- Conflict detection
- User confirmation flow
- Artifact generation

## Next Phase

Passes triage artifact to `pwrl-work-prepare` for environment setup.
