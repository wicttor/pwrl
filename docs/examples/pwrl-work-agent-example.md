# PWL-Work Agent Orchestration Examples

How to use the `pwrl-work.agent.md` orchestrator to execute work from plans, task files, and prompts.

## Overview

The `pwrl-work.agent.md` agent orchestrates 5 micro-skills in sequence:

```
pwrl-work-triage → pwrl-work-prepare → pwrl-work-execute
  → pwrl-work-review → pwrl-work-ship
```

User confirms at each phase checkpoint. When the `pwrl-work` skill detects agents are enabled, it delegates to this agent automatically.

## Example 1: Execute from Plan File

```bash
/pwrl-work docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
```

**Flow:**

```
Phase 1: pwrl-work-triage
  → Classifies input as "plan" (no unit-id in frontmatter)
  → Extracts 11 implementation units
  → Estimates complexity: large (11 units)
  Checkpoint: "Continue? (y/n)" → y

Phase 2: pwrl-work-prepare
  → Confirms branch: "feat/slice-pwrl-work" (new)
  → Creates 11 task files in docs/tasks/to-do/
  → Selects mode: Serial (dependencies between tasks)
  → Checks GitHub: enabled (from .pwrlrc.json)
  Checkpoint: "Ready to execute? (y/n/review)" → y

Phase 3: pwrl-work-execute
  → Executes S1-S11 in serial mode (sequential subagents)
  → Each task: implement, test, mark for-review
  → GitHub sync after each task completion
  Checkpoint: "Execution complete. Proceed to review? (y/n)" → y

Phase 4: pwrl-work-review
  → Detects and consolidates duplication across tasks
  → Runs system checks (events, mocks, idempotency, entry points)
  Checkpoint: "Ready to ship? (y/n)" → y

Phase 5: pwrl-work-ship
  → Runs final targeted tests
  → Verifies linting/formatting
  → Reviews diff for regressions
  → Requests user approval: "Ready to commit?" → y
  → Creates commit, pushes to branch
  → Offers end-session: "Use /pwrl-end-session? (y/n)" → y
```

## Example 2: Execute from Single Task File

```bash
/pwrl-work docs/tasks/to-do/2026-06-05-s1-analyze-pwrl-work.md
```

**Flow:**

```
Phase 1: pwrl-work-triage
  → Classifies input as "task" (has unit-id: S1)
  → Reads plan link, checks dependencies (none)
  → Complexity: small (1 file, analysis only)

Phase 2: pwrl-work-prepare
  → Confirms branch: feat/slice-pwrl-work
  → Updates task status: to-do → in-progress
  → Selects mode: Inline (1 task)
  → GitHub: enabled (prepares sync for status changes)

Phase 3: pwrl-work-execute
  → Inline execution (no subagents)
  → Creates analysis document
  → Runs quality gates (check for completeness)
  → Mark task as for-review
  → GitHub sync: adds for-review label to issue

Phase 4: pwrl-work-review
  → No duplication found (single file change)
  → System checks: all pass
  → Ready for shipping

Phase 5: pwrl-work-ship
  → Commits analysis document
  → Offers end-session
```

## Example 3: Execute from Bare Prompt

```bash
/pwrl-work "Add email validation to user signup form"
```

**Flow:**

```
Phase 1: pwrl-work-triage
  → Classifies input as "prompt" (neither task nor plan)
  → Scans codebase for related patterns
  → Estimates complexity: medium (3-5 files, behavior change)
  → Planning recommended: no (medium complexity, user has clear scope)

Phase 2: pwrl-work-prepare
  → Creates inline task list (in memory)
  → Branch: feat/email-validation (new)
  → Mode: Inline (1-2 tasks)
  → GitHub: enabled (no issue linked yet)

Phase 3: pwrl-work-execute
  → Implements email validation with tests
  → TDD: write test → implement → verify → refactor
  → Quality gates: tests pass, patterns followed

Phase 4: pwrl-work-review
  → Checks for duplication with existing validations
  → System checks: consistent with phone validation pattern
  → Ready for shipping

Phase 5: pwrl-work-ship
  → Commits changes
  → If issue linked: updates GitHub
```

## Phase Checkpoint Reference

| Phase | Checkpoint | Options |
|---|---|---|
| Triage → Prepare | "Continue? (y/n)" | Proceed, adjust input, cancel |
| Prepare → Execute | "Ready to execute? (y/n/review)" | Execute, review tasks, change mode, cancel |
| Execute → Review | "Proceed to review? (y/n)" | Review, retry failed, show details |
| Review → Ship | "Ready to ship? (y/n)" | Ship, address recommendations, show details |
| Ship → Done | "Ready to commit? (y/n)" | Ship, review diff, edit message, cancel |

## Force Specific Path

- **Force agent delegation:** Ensure `agents/pwrl-work.agent.md` exists and agents are enabled
- **Force fallback:** Disable agents or rename/remove the agent file
- **Force inline execution:** Use a single task file path (agent detects <3 tasks)
- **Force serial:** Use tasks with declared dependencies
- **Force parallel:** Use independent tasks and pass `--parallel` flag (if supported)

## Related

- `agents/pwrl-work.agent.md` — The orchestrator agent file
- `pwrl-work-triage/SKILL.md` — Input classification skill
- `pwrl-work-prepare/SKILL.md` — Environment setup skill
- `pwrl-work-execute/SKILL.md` — Task execution skill
- `pwrl-work-review/SKILL.md` — Code review skill
- `pwrl-work-ship/SKILL.md` — Shipping skill
- `pwrl-work-sync-status/SKILL.md` — GitHub sync utility
