# PWL-Work Structure Analysis (2026-06-05)

## Overview

- **File:** `/home/wicttor/.pi/agent/skills/pwrl-work/SKILL.md`
- **Total lines:** 209 (including 5-line frontmatter)
- **Phases:** 5 (Triage → Prepare → Execute → Review → Ship)
- **Entry points:** 3 (task file with `unit-id`, plan file, bare prompt)
- **Execution modes:** 3 (inline, serial subagents, parallel subagents)
- **External integrations:** GitHub Issues (optional, via `.pwrlrc.json`)
- **Supporting files:** `references/workflow-details.md` at project level (`pwrl-work/references/`)

---

## Phase Breakdown

### Phase 0: Triage Input
- **Lines:** 26–48 (23 lines of content)
- **Purpose:** Classify input type and extract foundational context for execution
- **Inputs:** `<input_document>` = `$ARGUMENTS` (task file path, plan path, or bare prompt string)
- **Outputs:** Classified context object (`{inputType, context, complexity, ...}`)

| Input Type | Detection | Extracted Fields | Flow |
|---|---|---|---|
| Task file | Has `unit-id` in frontmatter | unit-id, plan, status, dependencies, files, github-issue | Read plan, check `.pwrlrc.json`, extract steps |
| Plan file | No `unit-id` in frontmatter | n/a | Use directly, follow plan-based workflow |
| Bare prompt | Neither of the above | n/a | Scan codebase, classify complexity |

**Complexity classification logic (bare prompt only):**
- Trivial: 1-2 files, no behavior change → implement directly
- Small/medium: clear scope, under ~5 files → build task list
- Large: cross-cutting, 10+ files, sensitive areas → recommend `/pwrl-plan`

**Key functions:**
- Frontmatter parsing (YAML between `---` markers)
- Plan path resolution (relative to project root or linked from frontmatter)
- `.pwrlrc.json` read (GitHub integration check)
- Codebase scanning (for bare prompt)
- Complexity heuristic (file count + behavior scope)

**External dependencies:**
- File system (read task files, plan files)
- `.pwrlrc.json` config
- GitHub API (conditional, for issue syncing prep)

---

### Phase 1: Prepare Context & Environment
- **Lines:** 49–121 (73 lines of content — largest phase)
- **Purpose:** Set up environment, clarify ambiguities, create/update tasks, choose execution mode
- **Inputs:** Context object from Phase 0 (`{inputType, context, complexity}`)
- **Outputs:** Execution context (`{taskList, executionMode, branchStrategy, githubReady}`)

**Sub-steps:**

**1. Read and clarify (lines 50–78)**
- **Task files:** Structured implementation steps already in task body. Read linked plan. Review dependencies field.
- **Plan files:** Read plan end-to-end. Use implementation units, files, verification, test scenarios. Capture non-goals and unknowns.
- **Bare prompts:** Scan codebase for relevant context, patterns, existing tests.

**2. Setup branch context (lines 79–87)**
- Confirm branch strategy (new branch vs. direct commit)
- For plan-based work: create minimally task list, get approval
- For task-based work: proceed after branch confirmation

**3. Create or update tasks (lines 88–108)**
- **Task files:**
  - Update `status: to-do` → `status: in-progress` in frontmatter
  - Move file from `to-do/` → `in-progress/` dir
  - If GitHub Issues enabled AND `github-issue` field present: update labels/comments
- **Plan files:**
  - Create specific, testable tasks with dependencies
  - Include testing/verification tasks
  - Preserve stable unit IDs from plan
- **Bare prompts:**
  - Create inline task list
  - For large: recommend planning, get confirmation

**4. Choose execution mode (lines 109–121)**
| Mode | When to Use | Safety Check |
|---|---|---|
| Inline | 1-2 small tasks or user interaction | n/a |
| Serial | 3+ dependent tasks | Default for dependencies |
| Parallel | 3+ independent, no file overlap | File-to-task conflict map |

**Parallel safety check:** Build file-to-task map from each task's declared files. If overlap → switch to serial.

**Key functions:**
- Branch strategy confirmation
- Task status file management (read/write frontmatter)
- GitHub Issues label/comment update (conditional)
- Execution mode selection heuristic
- File-to-task conflict detection
- `.pwrlrc.json` integration check

**External dependencies:**
- Git (branch operations)
- File system (task file moves, INDEX.md updates)
- GitHub API (conditional)

---

### Phase 2: Execute
- **Lines:** 122–172 (51 lines of content)
- **Purpose:** Coordinate task execution through one of three modes with quality gates
- **Inputs:** Execution context from Phase 1 (`{taskList, executionMode, branchStrategy, githubReady}`)
- **Outputs:** Execution results (`{executionResults, testStatus, verificationSummaries, readyForReviewTasks}`)

**Per-task workflow:**

**Task Start (lines 123–130):**
- Mark `in-progress` (should already be from Phase 1)
- If GitHub integration enabled AND task has `github-issue`: ensure label/comment updated

**Implementation (lines 131–140):**
- Read target and reference files
- Reuse existing patterns and naming conventions
- Find and update tests for touched behavior
- Run relevant tests after meaningful changes
- Test-first discipline: write test → confirm fail → implement → confirm pass → refactor

**Task Completion (lines 141–167):**
- Mark complete only when verification passes
- For task files: `status: in-progress` → `status: for-review`
- Move file: `in-progress/` → `for-review/`
- Update `docs/tasks/INDEX.md`
- If GitHub integration enabled AND `github-issue` present: update labels/comments

**Execution modes:**

**Inline (direct lines 128-139 in main flow):**
- Execute tasks one-by-one in main agent flow
- Each task: read, implement, test, mark complete or iterate

**Serial subagents (referenced implicitly):**
- Spawn subagents sequentially for 3+ dependent tasks
- Orchestrator monitors, collects results
- After all complete: verify tests, stage, commit

**Parallel subagents (referenced implicitly):**
- Spawn subagents in parallel for independent tasks
- Orchestrator waits, aggregates results
- Safety check: subagents must not run full suite, stage, or commit
- Orchestrator reviews, tests, stages, commits after completion

**Quality gates (lines 168–172):**
- Tests pass for touched behavior
- Code follows project patterns
- No unresolved blockers or ambiguous TODOs

**Key functions:**
- Task execution (implement/test/mark)
- Subagent spawning (serial/parallel)
- Test running and verification
- Status file management (move files, update INDEX.md)
- GitHub sync (conditional)

**External dependencies:**
- File system (task files, source files)
- Test framework
- Subagent spawning (infrastructure)
- GitHub API (conditional)

---

### Phase 3: Simplify & Review
- **Lines:** 173–185 (13 lines of content — smallest phase)
- **Purpose:** Consolidate code duplication, run system checks, ensure quality
- **Inputs:** Executed tasks from Phase 2 (`{executionResults, testStatus, verificationSummaries}`)
- **Outputs:** Review results (`{refactoringNotes, readinessForShipping}`)

**Actions (every 2-3 related tasks):**
- Consolidate duplication and obvious complexity
- Extract shared helpers when it improves clarity
- Keep changes scoped; avoid unrelated refactors
- For UI work with design specs: compare to source design, resolve deltas

**System checks before closing a task:**
- What callbacks/middleware/observers/events are triggered?
- Do tests cover real interactions (not only mocks)?
- Are failure paths idempotent and cleanup-safe?
- Is behavior consistent across alternate entry points?

**Key functions:**
- Code duplication detection
- Shared helper extraction
- System behavior verification
- Design spec comparison (conditional)

**External dependencies:**
- Design spec files (conditional, for UI work)
- Code analysis tools (implicit)

---

### Phase 4: Ship
- **Lines:** 186–194 (9 lines of content)
- **Purpose:** Finalize, review, approve, and ship completed work
- **Inputs:** Reviewed tasks from Phase 3 (`{refactoringNotes, readinessForShipping}`)
- **Outputs:** Shipping results (`{shippingStatus, commitHash}`)

**Actions:**
- Run final targeted checks (tests, lint/format as required)
- Review diff for regressions and scope drift
- Request user review and approval
- Ask user if they want to use `end-session` tool after finishing all work

**Key functions:**
- Final test/lint execution
- Diff review (regression detection)
- User approval request
- End-session workflow integration

**External dependencies:**
- Test framework
- Linter/formatter
- Git (for diff review, staging, committing)
- pwrl-end-session skill (via user decision)

---

## State Flow Diagram

```
User Input (task file, plan path, bare prompt)
    │
    ▼
╔═══════════════════════════════════════════╗
║  Phase 0: Triage Input                   ║
║  Lines 26-48                             ║
╚═══════════════════════════════════════════╝
    │
    │ Output: { inputType, context, complexity,
    │            taskFile?, plan?, githubReady? }
    ▼
╔═══════════════════════════════════════════╗
║  Phase 1: Prepare Context & Environment   ║
║  Lines 49-121                             ║
╚═══════════════════════════════════════════╝
    │
    │ Output: { taskList, executionMode,
    │            branchStrategy, githubEnabled }
    ▼
╔═══════════════════════════════════════════╗
║  Phase 2: Execute (inline/serial/parallel)║
║  Lines 122-172                            ║
╚═══════════════════════════════════════════╝
    │
    │ Output: { executionResults, testStatus,
    │            verificationSummaries, readyTasks }
    ▼
╔═══════════════════════════════════════════╗
║  Phase 3: Simplify & Review               ║
║  Lines 173-185                            ║
╚═══════════════════════════════════════════╝
    │
    │ Output: { refactoringNotes, readinessForShipping }
    ▼
╔═══════════════════════════════════════════╗
║  Phase 4: Ship                            ║
║  Lines 186-194                            ║
╚═══════════════════════════════════════════╝
    │
    ▼
  Done (commit, summary, end-session offer)
```

### State Object Shapes

```
// Phase 0 → Phase 1
{
  inputType: "taskFile" | "planFile" | "barePrompt",
  taskFile?: { unitId, plan, status, dependencies, files, githubIssue },
  plan?: { planPath, implementationUnits },
  complexity?: "trivial" | "small" | "medium" | "large",
  githubReady: boolean  // from .pwrlrc.json
}

// Phase 1 → Phase 2
{
  taskList: Task[],            // ordered list with dependencies
  executionMode: "inline" | "serial" | "parallel",
  branchStrategy: string,      // "new branch" | "current branch"
  githubEnabled: boolean       // GitHub Issues integration active
}

// Phase 2 → Phase 3
{
  executionResults: TaskResult[],   // per-task status
  testStatus: "pass" | "fail" | "partial",
  verificationSummaries: string[],
  readyForReviewTasks: string[]     // task IDs ready for review
}

// Phase 3 → Phase 4
{
  refactoringNotes: string[],
  readinessForShipping: boolean
}

// Phase 4 → Done
{
  shippingStatus: "shipped" | "pending-approval" | "deferred",
  commitHash?: string,
  nextSteps?: string[]
}
```

---

## Phase Dependencies Map

| Phase | Depends On | Produces | Consumes From |
|---|---|---|---|
| 0 (Triage) | None | Classified context | User input, file system, `.pwrlrc.json` |
| 1 (Prepare) | Phase 0 output | Task list, execution mode, branch | Phase 0, user input, `.pwrlrc.json` |
| 2 (Execute) | Phase 1 output | Execution results, test results | Phase 1, task files, source code, tests |
| 3 (Review) | Phase 2 output | Refactoring notes, readiness | Phase 2, optional design specs |
| 4 (Ship) | Phase 3 output | Commit, shipping status | Phase 3, git, user approval |

---

## Extraction Mapping

The proposed micro-skills align with phase boundaries as follows:

| Micro-Skill | Extracts From | Phase | Lines | Complexity |
|---|---|---|---|---|
| U1: pwrl-work-triage | Phase 0 (lines 26-48) | Triage | 23 lines | Low |
| U2: pwrl-work-prepare | Phase 1 (lines 49-121) | Prepare | 73 lines | High |
| U3: pwrl-work-sync-status | Phases 1 & 2 (GitHub sync sections) | Utility | ~15 scattered lines | Medium |
| U4: pwrl-work-execute | Phase 2 (lines 122-172) | Execute | 51 lines | High |
| U5: pwrl-work-review | Phase 3 (lines 173-185) | Review | 13 lines | Low |
| U6: pwrl-work-ship | Phase 4 (lines 186-194) | Ship | 9 lines | Low |

**State objects** flow naturally: each phase's output schema maps to the next micro-skill's input schema.

**GitHub sync logic** (U3) is scattered across Phases 1 and 2 (task status updates, issue comments). The plan's extraction to a shared utility is clean because the logic is identical in both phases.

---

## Key Dependencies

### Internal Dependencies
- Phase 1 depends on Phase 0's output schema
- Phase 2 depends on Phase 1's task list and execution mode
- Phase 3 depends on Phase 2's execution results
- Phase 4 depends on Phase 3's review readiness

### External Dependencies
- **File system** — All phases (read/write task files, plan files, source code)
- **`.pwrlrc.json`** — Phases 0, 1 (GitHub integration flag)
- **Git** — Phases 1 (branch setup), 4 (diff, commit)
- **GitHub API** — Phases 1, 2 (conditional, for issue syncing)
- **Test framework** — Phases 2, 4 (run tests)
- **Subagent infrastructure** — Phase 2 (serial/parallel execution)
- **User approval** — Phases 1 (branch), 3 (refactoring), 4 (shipping)
- **pwrl-end-session skill** — Phase 4 (optional end-of-workflow)

---

## Risks & Observations

1. **State management across phases** is currently implicit (assumed to be in agent memory). For micro-skill isolation, explicit state passing contracts are critical.

2. **Phase 1 is the largest** (73 lines, 35% of skill). It combines 4 distinct sub-steps (clarify, branch, task creation, mode selection). Consider whether U2 should be further split.

3. **Phase 3 and 4 are small** (13 and 9 lines). Their micro-skill abstractions may feel thin. However, the plan notes they include logic from supporting files and system checks that expand their scope.

4. **GitHub sync logic** is interleaved in Phases 1 and 2 (status updates, issue comments). Extracting to U3 is clean and removes duplication.

5. **Execution mode logic** spans Phase 1 (selection) and Phase 2 (execution). This cross-phase dependency needs clear handoff.

6. **Parallel constraints** are documented inline in Phase 2. U4 must preserve these constraints.

7. **The project-level `pwrl-work/SKILL.md`** is a simplified wrapper (69 lines). The installed skill (`/home/wicttor/.pi/agent/skills/pwrl-work/SKILL.md`) at 209 lines is the authoritative source for extraction.

---

## Plan Alignment Verification

| Plan Requirement | Analysis Confirms | Notes |
|---|---|---|
| U1: Triage micro-skill | ✅ Lines 26-48 form a clean extractable unit | Clear input/output boundary |
| U2: Prepare micro-skill | ✅ Lines 49-121, largest but cohesive | 4 sub-steps, consider splitting task creation |
| U3: GitHub sync utility | ✅ Logic appears in Phases 1 & 2 | Extracting removes ~15 lines of duplication |
| U4: Execute micro-skill | ✅ Lines 122-172, covers 3 modes | Parallel safety constraints documented |
| U5: Review micro-skill | ✅ Lines 173-185, compact | System checks may expand |
| U6: Ship micro-skill | ✅ Lines 186-194, compact | End-session integration is the main complexity |
| Fallback strategy | ✅ Plan's fallback approach aligns with existing skill | Original skill is complete fallback |
| Parallel safety | ✅ Lines 115-121 document file-conflict detection | Simple heuristic, document limitations |
| State passing | ✅ Contract-based approach from learnings maps cleanly | Each phase's output becomes next phase's input |

---

## Open Questions

- Lines 115-121 mention file-conflict detection but not the exact heuristic. S3 will need to define this precisely.
- The "subagent" concept (serial/parallel) references infrastructure that may not exist yet. This needs verification during S8 or S11.
- Are there any implicit state assumptions (e.g., env vars) that micro-skills must explicitly declare?

---

*Analysis prepared for S1 completion. Ready for S2 (pwrl-work-triage extraction).*
