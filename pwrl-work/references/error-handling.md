# pwrl-work Error Handling & Recovery

Centralized error taxonomy and recovery strategies for all 4 phases of the work execution pipeline.

---

## Phase 0: Triage Input

**Purpose:** Identify and recover from input validation failures

| Error Scenario                      | Symptoms                                   | Recovery Strategy                                                                          |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Task file not found                 | File path provided but doesn't exist       | Log path; ask user: "Provide a different path or create a new task?"                       |
| Plan file not found                 | Plan reference invalid or moved            | Log path; ask user: "Provide a different path or use /pwrl-plan?"                          |
| Circular dependencies               | Dependency graph contains cycle (A→B→C→A)  | Walk dep tree; fail with `Circular: [A→B→C→A]`; ask user to resolve                        |
| Missing dependencies                | Task references non-existent dependency    | Log; add to `blockedBy`; warn: "Not found in INDEX. Proceeding may cause ordering issues." |
| Input is empty                      | No task, plan, or prompt provided          | Ask user: "What would you like to work on?"                                                |
| File unreadable                     | Permissions error or corrupted file        | Log error; ask user: "Cannot read file. Retry or provide different path?"                  |
| Malformed frontmatter               | YAML parsing fails on task file            | Log details; ask user to fix frontmatter and retry                                         |
| Complexity is `large` (bare prompt) | Bare prompt classified as high complexity  | Warn; require user confirmation before proceeding                                          |
| Task references non-existent plan   | Task's `plan` field points to missing file | Warn; proceed with caution                                                                 |

**Retry Rules:**

- Max 3 attempts per operation
- If all retries fail, log error and ask: "Retry, skip, or abort?"

---

## Phase 1: Prepare Environment

**Purpose:** Detect and recover from setup and configuration errors

| Error Scenario                      | Symptoms                                             | Recovery Strategy                                                          |
| ----------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Uncommitted changes                 | Git status shows unstaged modifications              | Ask user: "Commit changes, stash, or abort?"                               |
| Wrong branch                        | Current branch doesn't match target                  | Ask: "Switch to [target-branch], create new branch, or continue anyway?"   |
| Missing dependencies                | npm/pip packages not installed                       | Run package manager install; verify availability                           |
| Repository not pulled               | Local branch behind remote                           | Run `git pull --rebase`; verify success before proceeding                  |
| GitHub integration validation fails | `.pwrlrc.json` malformed or missing config           | Log error; ask: "Skip GitHub integration or fix config?"                   |
| GitHub CLI not authenticated        | `gh auth status` fails                               | Suggest: "Run `gh auth login` to authenticate"                             |
| Task file move fails                | Cannot read from `to-do/` or write to `in-progress/` | Log error; ask: "Fix file permissions or abort?"                           |
| Branch creation fails               | `git checkout -b` returns error                      | Log git error; ask: "Retry with different name or use existing branch?"    |
| Status transition invalid           | Task status transition violates state machine rules  | Log transition error; ask user: "Resolve dependencies or skip validation?" |

**Prevention Rules:**

- Always verify repository clean before starting
- Validate all file operations have proper error handling
- Check GitHub config exists before attempting sync operations

---

## Phase 2: Execute Implementation

**Purpose:** Detect and recover from execution-time failures

| Error Scenario                  | Symptoms                               | Recovery Strategy                                                                    |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| Task execution crashes          | Unhandled exception or subagent error  | Catch error; mark `blocked`; log stack trace; ask: "Retry, skip, or investigate?"    |
| Test failure                    | One or more unit tests fail            | Mark `blocked`; show failing test output; ask: "Fix tests or implementation, retry?" |
| Quality gate fails              | Build, lint, or coverage check fails   | Mark `blocked`; show gate reason; ask: "Address issue, retry?"                       |
| Subagent timeout (parallel)     | Subagent exceeds time limit            | Kill subagent; mark failed; ask: "Re-run as serial or fix and retry?"                |
| Git error during commit         | `git commit` or `git push` fails       | Log error; show git state; ask: "Fix git state, retry commit?"                       |
| Parallel safety violation       | Multiple tasks try to modify same file | Downgrade to serial mode; warn user; continue safely in serial                       |
| Build succeeds but no tests run | Test framework not found or skipped    | Verify test command; check config; ask: "Retry with correct test runner?"            |
| Coverage below threshold        | Tests pass but coverage < 50%          | Warn user; mark `blocked`; ask: "Add tests or lower threshold?"                      |
| Regression detected             | Existing tests now fail                | Mark `blocked`; show failing tests; ask: "Fix regression or revert changes?"         |

**Blocked Task Escalation:**

- Task marked `blocked` with reason documented
- User prompts: "Task [unitId] is blocked due to [reason]. Would you like to retry, skip, or investigate?"
- Options: Retry, Skip (move to backlog), Investigate (provide details for manual intervention)

---

## Phase 3: Review & Verify

**Purpose:** Detect and recover from quality and scope issues

| Error Scenario                 | Symptoms                                 | Recovery Strategy                                                            |
| ------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------- |
| No duplications found          | Consolidation analysis finds no issues   | Log "No duplications detected" (normal, not an error)                        |
| Git diff parsing fails         | Cannot parse `git diff` output           | Log error; ask: "Verify git state, retry?"                                   |
| Design spec not found          | Figma link missing or unreachable        | Skip design comparison; log warning; continue                                |
| Tests fail after consolidation | Code refactoring breaks existing tests   | Revert consolidation; mark as blocked; ask: "Investigate before proceeding?" |
| Unrelated changes in diff      | Diff contains changes outside task scope | Warn user; ask: "Remove unrelated changes or explain?"                       |
| Scope creep detected           | Changes exceed task acceptance criteria  | Warn user; ask: "Revert extra changes or document scope expansion?"          |
| Documentation missing          | README or code comments not updated      | Warn user; ask: "Update docs before review approval?"                        |

**Quality Gate Validation:**

- All tests pass (0 failures)
- Linting passes (0 errors)
- Build succeeds (0 errors)
- No regressions (existing tests still pass)
- Coverage acceptable (>50%)

---

## Cross-Phase Error Patterns

### Precedence & Escalation Rules

1. **File-level errors take precedence:** If file cannot be read/written, skip higher-level processing and escalate to user
2. **Git state errors block all work:** Repository must be in clean state before proceeding
3. **GitHub integration failures are non-blocking:** If GitHub sync fails, work continues; warn user but don't stop execution
4. **Quality gate failures are phase-final:** Cannot proceed to next phase if quality gates don't pass (unless user overrides)

### Fallback Strategy

For any error with multiple recovery paths:

1. Try primary recovery (e.g., auto-fix)
2. If fails, offer manual options (e.g., user confirmation)
3. If all options fail, escalate to user with full context and log
4. Never silently continue after error — always notify user of failures

### User Interaction Patterns

- **Single-step fixes:** Auto-apply (e.g., `git pull --rebase`)
- **Conditional decisions:** Ask user with clear options (e.g., "Commit, stash, or abort?")
- **Escalations:** Provide full error context and suggest next steps
- **Blocked tasks:** Allow user to retry, skip, or investigate manually

---

## References

- [pwrl-work-triage/SKILL.md](../../pwrl-work-triage/SKILL.md) — Phase 0 error handling
- [pwrl-work-prepare/SKILL.md](../../pwrl-work-prepare/SKILL.md) — Phase 1 error handling
- [pwrl-work-execute/SKILL.md](../../pwrl-work-execute/SKILL.md) — Phase 2 error handling
- [pwrl-work-review/SKILL.md](../../pwrl-work-review/SKILL.md) — Phase 3 error handling
