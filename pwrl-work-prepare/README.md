# pwrl-work-prepare Micro-Skill

**Phase 2 of pwrl-work Pipeline**

Prepares execution environment and resolves ambiguities before implementation begins.

## Purpose

Setup repository state, clarify implementation details, configure verification commands.

## Input

Triage artifact from `pwrl-work-triage` with:

- Unit ID, files, dependencies, acceptance criteria

## Processing

1. **Verify repository state** — Clean, pulled, correct branch
2. **Clarify ambiguities** — File creation vs. extension, vague approach, test scenarios
3. **Establish branch strategy** — Create feature/U<N>, use existing, or continue on dev
4. **Identify verification commands** — build, test, lint, precommit
5. **Check environment** — Node/npm versions, dependencies, database, env vars
6. **Update task status** — Move to in-progress, update INDEX.md
7. **Generate artifact** — YAML frontmatter with verification commands

## Output

Prepare artifact with:

- `branch` (created or confirmed)
- `verification_commands` (build, test, lint, precommit)
- `ambiguities_resolved` (list of clarifications)
- `repository_state` (clean, pulled, branch)
- `environment` (node version, npm, dependencies)
- `task_status_updated: true`
- `ready_for_execution: true`

## Error Cases

| Error                  | Recovery                               |
| ---------------------- | -------------------------------------- |
| Uncommitted changes    | Ask to commit or stash                 |
| Wrong branch           | Suggest switching to correct branch    |
| Not pulled             | Run git pull                           |
| Ambiguity unresolvable | Return to prepare or skip with warning |
| Missing dependencies   | Run npm install                        |
| Database not seeded    | Ask for manual setup or data           |

## Testing

See `tests/pwrl-work/prepare-environment.test.ts` (30-35 tests):

- Repository state verification
- Ambiguity resolution flow
- Branch strategy selection
- Verification command identification
- Environment checks
- Task status updates
- User confirmation

## Next Phase

Passes prepare artifact to `pwrl-work-execute` for implementation.
