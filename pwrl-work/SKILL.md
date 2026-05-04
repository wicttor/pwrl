---
name: pwrl-work
description: Execute implementation work efficiently while maintaining quality and shipping complete features
argument-hint: "[Task file, plan doc path, or work description. Leave blank to use latest plan/task]"
---

# PWRL Work

Execute implementation work from a plan or prompt with fast feedback loops and clear quality checks.

## Purpose

Transform plans or prompts into working code through systematic execution:

- Test-first discipline ensures correctness
- Incremental verification catches issues early
- Clear quality gates prevent scope drift
- Supports inline, serial, or parallel execution modes based on task complexity

## Input

<input_document> #$ARGUMENTS </input_document>

## Workflow

### Phase 0: Triage Input

Classify `<input_document>`:

- **If input is a task file path** (contains `unit-id` in frontmatter):
  - Read task frontmatter to extract: `unit-id`, `plan`, `status`, `dependencies`, `files`, `github-issue` (if present)
  - Read linked plan file for broader context and technical decisions
  - Check `.pwrlrc.json` to determine if GitHub Issues integration is enabled
  - If `github-issue` field exists AND GitHub integration is enabled, prepare to sync status updates
  - Extract implementation steps, code patterns, edge cases, and testing strategy from task body
  - Proceed to Phase 1 with task context

- **If input is a plan path** (no `unit-id` in frontmatter):
  - Use it directly as before
  - Follow standard plan-based workflow

- **If input is a bare prompt**:
  - Scan likely files, related tests, and local patterns
  - Choose a route by size and complexity:
    - trivial: 1-2 files, no behavior change → implement directly after environment check
    - small/medium: clear scope, under ~5 files → build task list, then execute
    - large: cross-cutting, architectural, 10+ files, sensitive areas, mostly backend implementation, modifications into core systems → recommend planning with `/pwrl-plan` workflow first; continue ONLY if user wants and expressly confirms understanding of risks and tradeoffs of skipping planning.

### Phase 1: Prepare Context and Environment

1. Read and clarify

**For task files:**

- Task file already contains structured implementation steps, code patterns, and acceptance criteria
- Read the linked plan (from `plan` field in frontmatter) for broader context and rationale
- Review dependencies (from `dependencies` field) to understand what work must be completed first
- Ask questions only for ambiguities that can materially change implementation
- If dependencies exist, verify they are complete before proceeding

**For plan files:**

- Read the plan end-to-end when provided
- Use implementation units, files, verification, and test scenarios as source material
- Capture non-goals and implementation-time unknowns before coding
- Ask questions only for ambiguities that can materially change implementation

**For bare prompts:**

- Scan codebase for relevant context, patterns, and existing tests

2. Setup branch context

- Confirm branch strategy.
  - A new branch (e.g., `feat/xyz`, `fix/abc`) is recommended for non-trivial work.
  - For trivial work, confirm if direct commit to default branch is acceptable.
- Avoid committing to default branch without explicit confirmation.
- For plan-based work: Create a minimal task list for medium work and get user approval before proceeding.
- For task-based work: Task is already defined; proceed with execution after confirming branch strategy.

3. Create or update tasks

**For task files:**

- Task already exists at the provided path (e.g., `docs/tasks/to-do/YYYY-MM-DD-u1-task-name.md`)
- Update task status from `to-do` to `in-progress` in task file frontmatter
- Move task file from `docs/tasks/to-do/` to `docs/tasks/in-progress/` if using directory-based organization
- If GitHub Issues integration enabled AND `github-issue` field present:
  - Update GitHub issue status: add `in-progress` label, remove `to-do` label
  - Add comment: "Started work on this task - [Link to task file]"

**For plan files:**

- Use the platform's task tracking facility
- Create specific, testable tasks with dependencies for medium work
- For most trivial work, inline execution without formal tasks is acceptable but still requires environment check and user confirmation
- Include testing and verification tasks
- Preserve stable unit IDs from the plan if present

**For bare prompts:**

- Create inline task list if needed

4. Choose execution mode

| Mode               | When to Use                                       |
| ------------------ | ------------------------------------------------- |
| Inline             | 1-2 small tasks or tasks needing user interaction |
| Serial subagents   | 3+ dependent tasks                                |
| Parallel subagents | 3+ independent tasks with no file overlap         |

Parallel safety check:

- Build a file-to-task map from each task's declared files.
- If files overlap, switch to serial.

Parallel constraints:

- Subagents must not run full suite, stage, or commit.
- Orchestrator reviews, tests, stages, and commits after completion.

### Phase 2: Execute

For each task:

**Task Start:**

- Mark task in progress (if not already done in Phase 1)
- For task files: Status should already be `in-progress` from Phase 1
- For inline/plan-based tasks: Use platform's task tracking facility to mark in-progress
- If GitHub Issues integration is enabled (check `.pwrlrc.json`) AND task has `github-issue` field:
  - Ensure GitHub issue has been updated with `in-progress` label
  - Add progress update comment if substantial time has passed

**Implementation:**

- Read target and reference files
- Reuse existing patterns and naming conventions
- Find and update tests for touched behavior
- Run relevant tests after meaningful changes
- Add tests for new behavior, update tests for changed behavior, remove obsolete tests

**Task Completion:**

- Mark complete only when verification passes, otherwise iterate
- If stuck, ask user for guidance or clarification, or escalate to a human if needed
- When task is complete:
  - **For task files:**
    - Update task frontmatter: change `status: in-progress` to `status: for-review`
    - Move task file from `docs/tasks/in-progress/` to `docs/tasks/for-review/`
    - Update `docs/tasks/INDEX.md` to reflect status change
    - If GitHub Issues integration enabled AND `github-issue` field present:
      - Update GitHub issue: add `for-review` label, remove `in-progress` label
      - Add comment: "🔍 Ready for review - [Brief summary of what was implemented]"
      - Include links to commits if available
  - **For inline tasks:**
    - Mark as ready for review in platform's task tracking facility

Execution notes:

- Do not write the test and implementation in the same step when working test-first
- Do not skip verifying that a new test fails before implementing the fix or feature
- Do not over-implement beyond the current behavior slice when working test-first
- Skip test-first discipline for trivial renames, pure configuration, and pure styling work

System check before closing a task:

- What callbacks/middleware/observers/events are triggered?
- Do tests cover real interactions (not only mocks)?
- Are failure paths idempotent and cleanup-safe?
- Is behavior consistent across alternate entry points?

### Phase 3: Simplify and Review

After every 2-3 related tasks:

- Consolidate duplication and obvious complexity.
- Extract shared helpers when it improves clarity.
- Keep changes scoped; avoid unrelated refactors.

For UI work with design specs:

- Compare implementation to source design iteratively.
- Resolve visible deltas before final review.

### Phase 4: Ship

When tasks are complete:

- Run final targeted checks (tests, lint/format as required).
- Review diff for regressions and scope drift.
- Request user review and approval.
- Ask user if they want to use the `end-session` tool after finishing all work and checks.

## Quality Criteria

- Requirements from prompt or plan are fully implemented.
- Behavior changes are covered by tests.
- Relevant tests pass after each logical unit.
- Code follows local patterns and conventions.
- No unresolved blockers or ambiguous TODOs left behind.

## Rules

- **No over-analysis**: Start coding after clarifying material ambiguities; avoid excessive upfront planning
- **Clarify ambiguities**: Ask questions when answers materially affect implementation
- **Test incrementally**: Run tests after each logical unit; don't defer all testing to the end
- **Complete work**: Ship only complete features with explicit follow-up tasks for partial work
- **Respect scope**: Don't expand beyond plan boundaries without user confirmation
