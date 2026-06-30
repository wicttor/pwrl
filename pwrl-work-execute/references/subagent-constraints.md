# Subagent Constraints (pwrl-work-execute)

Reference for `pwrl-work-execute` §"Subagent Constraints". Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

## Subagents MUST NOT

1. Run full test suite (only targeted tests for changed files)
2. Stage or commit changes (orchestrator does this)
3. Push to remote (orchestrator does this)
4. Modify branch or stash (orchestrator manages branches)
5. Update `docs/tasks/INDEX.md` directly (orchestrator aggregates)

## Subagents CAN

1. Read and modify source files
2. Run targeted tests for changed files
3. Update task file frontmatter (status field)
4. Move task file between directories
5. Call S4 (pwrl-work-sync-status) for GitHub sync

## Enforcement

- Pass constraint flags when spawning: `--no-full-suite`, `--no-commit`
- Subagent checks flags at startup and refuses violations
- Orchestrator validates after each subagent completes
