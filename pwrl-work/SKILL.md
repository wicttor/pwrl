---
name: pwrl-work
description: Execute implementation work efficiently through 5-phase micro-skill pipeline
argument-hint: "[Task file, plan doc path, or work description. Leave blank to use latest plan/task]"
---

# PWRL Work

Execute implementation work through a deterministic 5-phase pipeline: triage input, prepare environment, implement with test-first discipline, review code quality, and ship to main branch.

## Purpose

Transform task files, plans, or prompts into completed working code through systematic execution:

- **Triage Input** — Classify and validate input (task file, plan file, bare prompt, or latest task)
- **Prepare Environment** — Repository verification, ambiguity resolution, branch setup, verification commands
- **Execute Implementation** — Test-first implementation with incremental verification and quality gates
- **Review & Verify** — Code review, scope check, diff quality, documentation
- **Ship to Main** — Merge, update status, optional end-session chaining

## Usage

```bash
/pwrl-work
/pwrl-work docs/tasks/to-do/2026-06-11-U2-email-validation.md
/pwrl-work docs/plans/2026-06-11-003-skill-architecture.md
/pwrl-work "add email validation to user signup"
```

## Architecture

**Direct sequence of 5 micro-skills with deterministic artifact flow:**

```
Input
  ↓
Phase 0: pwrl-work-triage
  ├ Input: task file, plan file, bare prompt, or empty
  ├ Output: triage artifact (unit_id, files, acceptance_criteria, dependencies)
  ↓
Phase 1: pwrl-work-prepare
  ├ Input: triage artifact
  ├ Processing: repo verification, ambiguity resolution, branch strategy, verification commands
  ├ Output: prepare artifact (branch, verification_commands, environment state)
  ↓
Phase 2: pwrl-work-execute
  ├ Input: prepare artifact
  ├ Processing: scaffolding, test-first implementation, quality gates
  ├ Output: execute artifact (files changed, tests passing, build/lint status)
  ↓
Phase 3: pwrl-work-review
  ├ Input: execute artifact
  ├ Processing: scope check, diff review, test review, documentation check
  ├ Output: review artifact (approval status, ready_to_ship)
  ↓
Phase 4: pwrl-work-ship
  ├ Input: review artifact
  ├ Processing: merge to main, update task status, optional end-session
  ├ Output: ship artifact (merge status, completion timestamp)
  ↓
COMPLETE
```

Each phase produces an explicit **artifact** (YAML frontmatter + structured data) consumed by the next phase. Enables resumability, traceability, and independent testing.

## Workflow

### Phase 0: Triage Input

**Purpose:** Classify input, extract task data, and select interaction mode

**Input:** Task file path, plan file path, bare prompt, or empty (defaults to latest task)

**Processing:** (See `pwrl-work-triage/references/triage-input-protocol.md`)

1. Identify input type
2. Extract task data (unit_id, files, dependencies, acceptance_criteria)
3. Validate required fields
4. Detect conflicts with in-progress tasks
5. **Ask interaction mode:**
   - **Detailed:** Step-by-step interaction at each phase (review, confirm, adjust)
   - **Yolo:** Full automation from Phase 0 through Phase 3, final confirmation only
6. Confirm with user
7. Generate triage artifact with interaction_mode

**Output:** Triage artifact with unit_id, title, goal, files, acceptance_criteria, dependencies, interaction_mode

### Phase 1: Prepare Environment

**Purpose:** Setup branch, verify repository state, identify verification commands

**Input:** Triage artifact (includes interaction_mode)

**Processing:** (See `pwrl-work-prepare/references/prepare-environment-protocol.md`)

1. Verify repository clean, pulled, correct branch
2. Clarify ambiguities (file creation vs. extension, vague approach, test scenarios, dependency location)
3. Establish branch strategy (create feature/U<N>, use existing, or continue on dev)
4. Identify verification commands (build, test, lint, precommit)
5. Check environment (Node, npm, dependencies, database, env vars)
6. **Move task file:** `docs/tasks/to-do/` → `docs/tasks/in-progress/`
7. Update task status to `in-progress` in frontmatter
8. Generate prepare artifact

**Output:** Prepare artifact with branch, verification_commands, environment state, task moved and status updated

### Phase 2: Execute Implementation

**Purpose:** Implement work with test-first discipline and incremental verification

**Input:** Prepare artifact

**Processing:** (See `pwrl-work-execute/references/execute-implementation-protocol.md`)

1. Scaffold directory structure
2. For each test scenario: write test → implement → refactor → verify
3. Verify all acceptance criteria
4. Run quality gates: tests pass, lint clean, build succeeds, no regressions, coverage acceptable
5. Prepare for review: clear commits, remove debug code, update docs
6. **Move task file:** `docs/tasks/in-progress/` → `docs/tasks/for-review/`
7. Update task status to `for-review` in frontmatter
8. Generate execute artifact

**Output:** Execute artifact with files changed, tests passing, build/lint status, task moved and marked for-review

**Quality Gates (all must pass):**

- ✓ All tests pass (0 failures)
- ✓ Linting passes (0 errors)
- ✓ Build succeeds (0 errors)
- ✓ No regressions (existing tests still pass)
- ✓ Coverage acceptable (>50%)

### Phase 3: Review & Simplify

**Purpose:** Final code quality check and consolidation

**Input:** Execute artifact

**Processing:** (See `pwrl-work-review/references/review-quality-protocol.md`)

1. Verify scope (no unrelated changes)
2. Review diff (code quality, security, style)
3. Review tests (adequate coverage, meaningful tests)
4. Check documentation (README, comments, types updated)
5. Detect and consolidate duplication
6. Get user approval
7. Generate review artifact

**Output:** Review artifact with scope_check, diff_review, approval status

### Phase 4: Finalize & Mark Ready

**Purpose:** Final confirmations and branch management

**Input:** Review artifact

**Processing:**

1. Verify all tasks marked `for-review` ✓
2. Verify branch created and maintained ✓
3. Display completion summary
4. Branch remains active for pull request creation
5. Optionally chain to `/pwrl-end-session` for learnings documentation
6. Generate finalization artifact

**Output:** Finalization artifact with completion status, branch info, PR instructions

---

## Quality Criteria

- Requirements from task/plan fully implemented
- Behavior changes covered by tests
- Tests pass after each logical unit
- Code follows project patterns and conventions
- No debug code, console.logs, or commented code left behind
- Scope stayed tight (no unrelated changes)

## Rules

- **Clarify ambiguities upfront** — Don't proceed if approach is unclear
- **Verify incrementally** — Run checks frequently, catch issues early
- **Test-first discipline** — Write tests before implementing
- **One scope at a time** — Complete and ship each unit separately
- **No scope creep** — Get approval before expanding beyond task
- **Quality gates** — All checks must pass before shipping

## Error Recovery

Each phase includes error detection and recovery:

- **Triage:** File not found, missing fields, conflicts with in-progress → suggest fix
- **Prepare:** Uncommitted changes, wrong branch, missing dependencies → ask action
- **Execute:** Build failure, test failure, regression, low coverage → recovery instructions
- **Review:** Scope creep, quality issues, security concerns → request fix
- **Ship:** Merge conflicts, permission denied, CI failure → recovery steps

All errors include user-facing explanation and recovery path (never silent failure).

## Support Files

- `pwrl-work-triage/references/triage-input-protocol.md` — Phase 1 specification
- `pwrl-work-prepare/references/prepare-environment-protocol.md` — Phase 2 specification
- `pwrl-work-execute/references/execute-implementation-protocol.md` — Phase 3 specification
- `pwrl-work-review/references/review-quality-protocol.md` — Phase 4 specification
- `pwrl-work-ship/references/ship-delivery-protocol.md` — Phase 5 specification

## When to Use

- Use when executing a clear task from a task file
- Use when extracting and executing units from a plan
- Use for well-defined work with clear acceptance criteria
- For exploratory work without clear requirements, use `/pwrl-plan` first
