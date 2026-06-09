---
id: 2026-06-05-002
status: active
tier: Standard
created: 2026-06-05
updated: 2026-06-05
---

# Plan: Slice pwrl-work Skill into Micro-Skills for pwrl-work.agent.md (with Fallback)

## Overview

**Goal:** Decompose the monolithic `pwrl-work` skill into focused, reusable micro-skills that each handle one stage of the execution workflow. These micro-skills will be orchestrated by a new `pwrl-work.agent.md` agent file (optional). The original `pwrl-work` skill remains as a smart fallback: it detects if agents are enabled and either delegates to the agent or runs the monolithic workflow, ensuring work execution always functions regardless of system configuration.

- Single-responsibility components (easier to test, maintain, extend)
- Independent reuse in other agents or workflows
- Cleaner separation of concerns (input triage vs. context prep vs. execution vs. review vs. shipping)
- Simpler decision trees for each micro-skill
- Support for inline, serial, and parallel execution modes with clear safety gates

**Success Criteria:**
- All 5 execution phases have dedicated micro-skills
- `pwrl-work.agent.md` successfully orchestrates them (when agents available)
- Each micro-skill can be tested independently
- Original `pwrl-work` skill acts as intelligent wrapper with fallback behavior
- Serial execution works reliably by default
- Parallel execution supported with file-conflict detection
- GitHub Issues integration cleanly separated
- Work execution succeeds with or without agent infrastructure
- Documentation and examples updated

---

## Current State

**Existing Skill:** `pwrl-work/SKILL.md` (at project root)

**Phases (nested in single skill):**
1. Phase 0: Triage Input (classify input type, extract context, check dependencies)
2. Phase 1: Prepare Context & Environment (clarify ambiguities, setup branch, create/update tasks, choose execution mode)
3. Phase 2: Execute (iterate through tasks: implement, test, mark complete/for-review)
4. Phase 3: Simplify & Review (consolidate duplication, extract helpers, compare to design specs)
5. Phase 4: Ship (run final checks, review diff, request approval, offer end-session)

**Supporting Files:**
- `.pwrlrc.json` — project configuration (GitHub integration flag)
- `docs/tasks/to-do/`, `docs/tasks/in-progress/`, `docs/tasks/for-review/` — task tracking
- `docs/tasks/INDEX.md` — task registry and status
- Linked plans in `docs/plans/` — context and rationale

**Execution Modes:**
- **Inline:** 1-2 small tasks, user interaction expected
- **Serial Subagents:** 3+ dependent tasks, sequential execution
- **Parallel Subagents:** 3+ independent tasks, file-conflict safety check

---

## Key Technical Decisions

1. **Micro-Skill Boundaries:** Split by workflow phase (Triage → Prepare → Execute → Review → Ship), not by execution mode. Execution mode selection happens in Phase 1 (Prepare).

2. **Orchestrator Pattern:** `pwrl-work.agent.md` calls micro-skills sequentially, passing state forward (input context → environment setup → task execution loop → review & simplification → shipping).

3. **State Management:** Use markdown frontmatter + memory to retain state between skill calls:
   - Input classification (task type, parsed unit-id, plan path)
   - Task list (with dependencies, file manifests)
   - Execution mode choice (inline/serial/parallel)
   - Test results and verification status
   - Final shipping checklist

4. **Execution Mode Safety:**
   - **Inline Mode:** Subagents not needed; execute tasks directly in main skill flow
   - **Serial Mode:** Spawn subagents sequentially; main agent orchestrates, reviews, tests, stages, commits after all tasks complete
   - **Parallel Mode:** Spawn subagents in parallel with file-conflict detection; orchestrator reviews aggregated results, runs full test suite, handles commits

5. **Fallback Strategy:** Keep the original `pwrl-work` skill as a smart wrapper that:
   - Detects if agents are enabled in the system
   - If agents available: delegates to `pwrl-work.agent.md`
   - If agents unavailable or agent file missing: runs monolithic fallback behavior
   - Always ensures work execution functions regardless of system configuration

6. **GitHub Integration:** Extract status syncing (label updates, comments) into a shared utility micro-skill (`pwrl-work-sync-status`) called by Phase 1 (setup) and Phase 2 (completion), keeping concerns cleanly separated.

---

## Proposed Micro-Skills

### **U1: pwrl-work-triage**
**Purpose:** Classify input type and extract foundational context for execution.

**Inputs:**
- Input document (task file path, plan path, or bare prompt)
- User preferences (branch strategy, work scope)

**Key Actions:**
- Classify input: task file (has `unit-id`), plan file (no `unit-id`), or bare prompt
- For task files: Parse frontmatter (unit-id, plan, status, dependencies, files, github-issue)
- For plan files: Load plan structure, extract implementation units
- For bare prompts: Scan codebase for patterns, estimate complexity (trivial/small/medium/large)
- If complexity is large AND user skipped planning: warn and confirm understanding of risks
- Resolve and validate dependencies (check task status from INDEX.md or plan)
- Return: Classified input, parsed context, complexity estimate, dependency chain

**Dependencies:** None (entry point)

**Validation:** Input is classified correctly; dependencies are resolved and valid

---

### **U2: pwrl-work-prepare**
**Purpose:** Set up environment, create task list, choose execution mode, prepare for execution.

**Inputs:**
- Classified input from U1
- User branch preferences
- Project configuration (.pwrlrc.json)

**Key Actions:**
- Confirm branch strategy: new branch (e.g., `feat/xyz`) vs. direct commit
- For task files: Update status from `to-do` to `in-progress` in frontmatter; move file to `in-progress/` dir if using directory organization
- For plan files: Create specific, testable tasks with dependencies; preserve stable unit IDs
- For bare prompts: Create inline task list or recommend planning first (if large)
- Detect execution mode:
  - Count tasks: 1-2 → Inline, 3+ → Serial (default) or Parallel (if no file conflicts)
  - Check file-to-task map: If overlap detected → Serial (force)
  - If parallel chosen: document safety constraints (no full suite, stage/commit by orchestrator only)
- Check GitHub integration (`.pwrlrc.json`): If enabled AND tasks have `github-issue` field, prepare sync
- Return: Task list, execution mode choice, branch strategy, GitHub sync readiness

**Dependencies:** U1

**Validation:** Branch strategy confirmed; task list is complete and ordered; execution mode chosen safely

---

### **U3: pwrl-work-sync-status** (Shared Utility)
**Purpose:** Synchronize task status with GitHub Issues when integration is enabled.

**Inputs:**
- Task file path
- New status (to-do, in-progress, for-review, done, blocked)
- Commit links (optional)
- Summary message (optional)

**Key Actions:**
- Check if GitHub integration enabled in `.pwrlrc.json`
- If disabled: log and return silently
- If enabled AND task has `github-issue` field:
  - Parse issue URL or number
  - Update labels: remove old status label, add new status label
  - Add comment to issue: status update + commit links + summary
  - Log sync success
- Return: Sync status (success, skipped, error)

**Dependencies:** None (utility; called by U2 and U4)

**Validation:** GitHub issues updated correctly; labels consistent; comments posted

---

### **U4: pwrl-work-execute**
**Purpose:** Coordinate task execution (inline, serial, or parallel mode) with quality gates.

**Inputs:**
- Task list from U2
- Execution mode from U2
- Branch context
- GitHub sync readiness from U2

**Key Actions:**
- **Inline Execution:**
  - Execute tasks one-by-one in main skill flow
  - For each task: read, implement, test, mark complete or iterate
  - After each logical unit: run tests, verify behavior
  - Mark task status in frontmatter (in-progress → for-review when done)
  - Call U3 (sync-status) if GitHub integration enabled

- **Serial Execution:**
  - Spawn subagents sequentially for each task
  - Main agent: Monitor task progress, collect results
  - After each task: verify test pass, collect implementation summary
  - Mark task status (for-review) after completion
  - Call U3 (sync-status) for each task

- **Parallel Execution:**
  - Spawn subagents in parallel for independent tasks
  - Main agent: Wait for all subagents to complete
  - Collect results and verify no file conflicts in actual output
  - Aggregate test results
  - Main agent: Run full targeted test suite to verify parallel work didn't cause issues
  - Mark all tasks status (for-review) after all complete
  - Call U3 (sync-status) for all tasks

- **Quality Gate:** Fail task if:
  - Tests don't pass
  - Code violates project patterns
  - Behavior verification fails
  - Task blocked or stuck → ask user for guidance

- Return: Task execution results, test status, verification summaries, ready-for-review task list

**Dependencies:** U1, U2, U3

**Validation:** All tasks completed or blocked; tests pass; code follows patterns; status synced to GitHub (if enabled)

---

### **U5: pwrl-work-review**
**Purpose:** Simplify code, consolidate duplication, and compare implementation to specs.

**Inputs:**
- Executed tasks and results from U4
- Design specs or related learnings (if applicable)

**Key Actions:**
- After every 2-3 related tasks:
  - Review diffs for duplication and obvious complexity
  - Extract shared helpers when they improve clarity
  - Verify naming, patterns, and conventions consistency
- For UI work with design specs:
  - Compare implementation to source design iteratively
  - Resolve visible deltas before final review
- System check for each task:
  - Are callbacks/middleware/observers/events triggered correctly?
  - Do tests cover real interactions (not only mocks)?
  - Are failure paths idempotent and cleanup-safe?
  - Is behavior consistent across alternate entry points?
- Return: Simplified code summary, any refactoring notes, readiness for shipping

**Dependencies:** U4

**Validation:** No obvious duplication remains; code is clear and follows patterns; system checks pass

---

### **U6: pwrl-work-ship**
**Purpose:** Finalize, review, approve, and ship completed work.

**Inputs:**
- Reviewed and simplified tasks from U5
- Full work context and diff

**Key Actions:**
- Run final targeted checks:
  - Lint/format verification (per project config)
  - Focused test suite (only affected areas, not full suite)
  - Diff review for regressions and scope drift
- Request user review and approval:
  - Summarize changes and test results
  - Ask: "Ready to ship? Proceed with commit?"
- If approved:
  - Stage changes
  - Create commit with summary and related unit IDs
  - Push to branch
  - Log shipping success
- Offer end-session workflow:
  - Ask user: "Would you like to use `/pwrl-end-session` to create a summary commit?"
- Return: Shipping status, commit hash, next steps

**Dependencies:** U5

**Validation:** All checks pass; user approves; commit created successfully

---

## Implementation Units for Slicing Work

### **S1: Analyze pwrl-work Structure & Dependencies**
- **Scope:** Document phase breakdown, state passing needs, and macro dependencies
- **Files Affected:**
  - Research phase (in this planning document)
- **Approach:** Read full pwrl-work/SKILL.md, identify phase boundaries, state objects, entry/exit points
- **Acceptance:** Clear understanding of which logic belongs in each micro-skill

### **S2: Extract Input Classification & Triage Logic (U1)**
- **Scope:** Implement pwrl-work-triage micro-skill
- **Files Affected:**
  - `pwrl-work-triage/SKILL.md` (new)
- **Approach:** Extract Phase 0 (Triage) from pwrl-work, parameterize for standalone use, add complexity estimation heuristic
- **Acceptance:** Skill classifies task/plan/prompt correctly, resolves dependencies, estimates complexity

### **S3: Extract Environment Setup & Mode Selection (U2)**
- **Scope:** Implement pwrl-work-prepare micro-skill
- **Files Affected:**
  - `pwrl-work-prepare/SKILL.md` (new)
- **Approach:** Extract Phase 1 (Prepare) from pwrl-work, implement execution mode selection with file-conflict detection, GitHub integration check
- **Acceptance:** Skill creates task lists, detects execution mode safely, confirms branch strategy

### **S4: Create GitHub Sync Utility (U3)**
- **Scope:** Implement pwrl-work-sync-status micro-skill for GitHub Issues integration
- **Files Affected:**
  - `pwrl-work-sync-status/SKILL.md` (new)
- **Approach:** Extract GitHub syncing logic from Phase 1 and Phase 2, make standalone and reusable
- **Acceptance:** Skill syncs task status to GitHub issues correctly, handles disabled integration gracefully

### **S5: Extract Task Execution Logic (U4)**
- **Scope:** Implement pwrl-work-execute micro-skill
- **Files Affected:**
  - `pwrl-work-execute/SKILL.md` (new)
- **Approach:** Extract Phase 2 (Execute) from pwrl-work, support inline/serial/parallel modes, integrate U3 for GitHub syncing
- **Acceptance:** Skill executes tasks, tests code, manages quality gates, syncs status

### **S6: Extract Review & Simplification Logic (U5)**
- **Scope:** Implement pwrl-work-review micro-skill
- **Files Affected:**
  - `pwrl-work-review/SKILL.md` (new)
- **Approach:** Extract Phase 3 (Simplify & Review) from pwrl-work, run system checks, prepare for shipping
- **Acceptance:** Skill identifies duplication, suggests refactors, verifies system consistency

### **S7: Extract Shipping & Approval Logic (U6)**
- **Scope:** Implement pwrl-work-ship micro-skill
- **Files Affected:**
  - `pwrl-work-ship/SKILL.md` (new)
- **Approach:** Extract Phase 4 (Ship) from pwrl-work, run final checks, stage/commit, offer end-session
- **Acceptance:** Skill runs checks, commits work, offers end-session workflow

### **S8: Create pwrl-work.agent.md Orchestrator**
- **Scope:** Build agent that calls micro-skills in sequence and manages state
- **Files Affected:**
  - `agents/pwrl-work.agent.md` (new)
- **Approach:**
  - Define agent entry point and workflow
  - Call S2 → S3 → S5 → S6 → S7 in sequence
  - For U4 (Execute), support inline/serial/parallel modes based on S3 recommendation
  - Pass state between calls via memory or lightweight markdown
  - Handle user confirmations at key checkpoints
- **Acceptance:** Agent successfully orchestrates all micro-skills end-to-end; supports all three execution modes safely
- **Note:** This agent is optional; systems without agents still work via pwrl-work fallback

### **S9: Update pwrl-work Skill to Support Fallback**
- **Scope:** Modify `pwrl-work/SKILL.md` to detect agent availability and delegate or fallback
- **Files Affected:**
  - `pwrl-work/SKILL.md` (update with agent-detection logic)
- **Approach:**
  - Add agent detection check at start (is pwrl-work.agent.md available?)
  - If agents available & enabled: document that agent will be called; suggest user invoke via agent instead
  - If agents unavailable: run original monolithic workflow inline
  - Keep all original logic as fallback code path
  - Ensure Phase 0-4 remains fully functional in fallback
- **Acceptance:** Skill behaves correctly whether agents are present or absent; documentation clear on both paths

### **S10: Update Documentation & Examples**
- **Scope:** Document micro-skills, fallback strategy, execution modes, and agent usage patterns
- **Files Affected:**
  - `pwrl-work-*/SKILL.md` (all new micro-skills)
  - `docs/examples/work-workflow.md` (new, showing inline/serial/parallel execution)
  - `docs/examples/pwrl-work-agent-example.md` (new, agent-specific examples)
  - `docs/examples/github-integration-example.md` (new, GitHub Issues workflow)
- **Approach:** Document each micro-skill, show pwrl-work.agent.md usage, explain fallback strategy and execution modes, provide examples for all paths
- **Acceptance:** All skills and agents have clear documentation; execution modes documented with safety constraints

### **S11: Integration Testing & Validation**
- **Scope:** Test full workflow (all execution modes and both agent/fallback paths), ensure backward compatibility
- **Files Affected:**
  - Test cases for agent & fallback paths, all three execution modes
- **Approach:**
  - Test 1: Run pwrl-work.agent.md on test tasks (inline/serial/parallel) with agents enabled
  - Test 2: Run pwrl-work skill directly (fallback path) with agents disabled or unavailable
  - Test 3: Verify agent and fallback paths produce equivalent results
  - Test 4: Confirm execution mode selection works correctly (trivial → inline, small/medium → serial, large with confirmation → serial, independent + no conflicts → parallel)
  - Test 5: Verify GitHub sync works when enabled, skips gracefully when disabled
  - Test 6: Test parallel safety: verify file-conflict detection catches overlaps
  - Test 7: Edge case — agent file moved/renamed (graceful fallback)
- **Acceptance:** All execution modes work correctly; agent and fallback paths produce equivalent results; GitHub integration works as designed; parallel safety verified

---

## Dependencies & Sequencing

```
S1 (Analyze Structure)
  └─→ S2 (pwrl-work-triage)
        └─→ S3 (pwrl-work-prepare)
              ├─→ S4 (pwrl-work-sync-status) [utility, called by S3 & S5]
              └─→ S5 (pwrl-work-execute)
                    └─→ S6 (pwrl-work-review)
                          └─→ S7 (pwrl-work-ship)
                                ├─→ S8 (pwrl-work.agent.md) [optional, if agents enabled]
                                └─→ S9 (pwrl-work Fallback Update) [always]
                                      └─→ S10 (Documentation & Examples)
                                            └─→ S11 (Integration Testing)
```

**Critical Path:** S1 → S2 → S3 → S4 → S5 → S6 → S7 → S9 → S11 (linear; S8 & S10 can overlap)

---

## Risks & Unknowns

1. **State Complexity in Parallel Mode:** If parallel execution produces complex merged state, orchestration may be error-prone. *Mitigation: Keep state simple (task list with status, file manifest, test results); use file-conflict detection as primary safety gate; test extensively (S11).*

2. **Subagent Communication Overhead:** Spawning multiple subagents (especially parallel) may introduce latency or communication failures. *Mitigation: Design state passing to be minimal and serializable; test with realistic task counts; ensure fallback to serial if parallel fails.*

3. **GitHub API Rate Limits:** If syncing status frequently, may hit GitHub rate limits. *Mitigation: Batch sync operations; check rate limit before sync; log rate limit warnings.*

4. **File-Conflict Detection Accuracy:** Heuristic for detecting file conflicts between parallel tasks may miss edge cases (e.g., indirect dependencies). *Mitigation: Document detection heuristic clearly (S10); allow manual override; test with complex scenarios (S11).*

5. **Fallback Reliability:** Agent detection logic must be bulletproof; if agent check fails, must seamlessly fall back to monolithic behavior. *Mitigation: Test extensively (S11); wrap agent call in try-catch; ensure all fallback code paths remain functional.*

6. **Execution Mode Heuristic:** Automated mode selection (task count + complexity) may not always match user intent. *Mitigation: Allow explicit user override in pwrl-work.agent.md; document heuristic clearly (S10).*

---

## System-Wide Impact

- **User Workflows:** Zero breaking changes. Users can continue calling `pwrl-work` skill; it intelligently delegates to agent (if available) or runs fallback. Identical inputs/outputs regardless of path.
- **Task Tracking:** Existing task files and INDEX.md remain compatible; status updates now cleanly delegated to U3 utility.
- **GitHub Integration:** Existing GitHub sync behavior preserved; now cleanly separated and reusable.
- **Execution Modes:** Existing inline/serial/parallel support continues; now cleaner and safer with explicit mode selection.
- **Skill Registry:** 6 new micro-skills added (triage, prepare, execute, review, ship, + sync utility); 1 new agent added; original `pwrl-work` skill remains as smart wrapper with fallback.
- **Interdependencies:** No breaking changes to other skills. New pwrl-work.agent.md is optional enhancement; all workflows remain compatible with fallback.

---

## Related Learnings

- **Learning: Skill Decomposition & Agent Orchestration** — Documents the pattern for micro-skills and orchestrator agents; found at `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`
  - *Applicability:* Foundational reference for micro-skill boundaries, state passing, and orchestrator design.

- **Learning: Fallback Architecture Design** — Explains how to build intelligent fallback mechanisms when agents are optional; found at `docs/learnings/decision/fallback-architecture-design-2026-06-05.md`
  - *Applicability:* Informs design of agent detection logic in S9 and overall fallback strategy.

- **Learning: State Schema & Workflow Context** — Documents lightweight state management for multi-skill workflows; found at `docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md`
  - *Applicability:* Guides design of state objects passed between U1→U2→U4→U5→U6 and orchestration.

- **Learning: Planning Tier Architecture** — Covers how Fast/Standard/Deep tiers work; found at `docs/learnings/pattern/planning-tier-architecture-2026-06-05.md`
  - *Applicability:* While pwrl-work uses execution modes (inline/serial/parallel) rather than tiers, this learning provides context on mode selection heuristics.

**Learning Gaps:**
- No existing learning for "Parallel Execution Safety & File-Conflict Detection" — *Follow-up:* Document heuristic and safety constraints in `/pwrl-learnings` after S8 completion.
- No guidance on "GitHub Issues Integration Architecture" — *Follow-up:* Document GitHub sync patterns (S4) in `/pwrl-learnings` after S10 completion.

---

## Test & Validation Scenarios

### **Inline Execution Test (S2, S5)**
- Input: Task list with 1-2 tasks
- Expected: Execute inline without spawning subagents
- Validation: Tasks complete, tests pass, no subagent overhead

### **Serial Execution Test (S2, S5, S8)**
- Input: Task list with 3-5 tasks with dependencies
- Expected: Execute sequentially via subagents; orchestrator reviews and tests after all complete
- Validation: Tasks execute in order, dependencies respected, orchestrator does final test sweep

### **Parallel Execution Test (S2, S5, S8)**
- Input: Task list with 3-4 independent tasks, non-overlapping files
- Expected: Spawn subagents in parallel; orchestrator waits and aggregates results
- Validation: Subagents run concurrently, orchestrator detects completion, parallel safety constraints enforced

### **Parallel Safety Test (S2, S5)**
- Input: Task list with 3 tasks where file manifest overlaps (e.g., both touch `src/utils.js`)
- Expected: Execution mode auto-downgrade to Serial
- Validation: Tasks execute sequentially even though parallelism was possible; no file conflicts

### **Backward Compatibility Test (S9, S11)**
- Input: Run pwrl-work.agent.md and fallback pwrl-work on identical task/plan
- Expected: Both produce equivalent execution and results
- Validation: Tasks complete identically; test results match; state handling equivalent

### **Agent Detection Test (S9, S11)**
- Input: Call pwrl-work skill with agents enabled, then disabled
- Expected: With agents: delegates (or indicates delegation); Without agents: runs fallback
- Validation: Both paths complete successfully; fallback requires no agent infrastructure

### **GitHub Integration Test (S3, S4, S11)**
- Input: Task with `github-issue` field; GitHub integration enabled in `.pwrlrc.json`
- Expected: U3 (sync-status) updates issue labels and comments
- Validation: GitHub issue has correct labels; comments posted with status and links

### **GitHub Integration Disabled Test (S3, S4, S11)**
- Input: Task with `github-issue` field; GitHub integration disabled in `.pwrlrc.json`
- Expected: U3 (sync-status) skips GitHub sync silently
- Validation: No GitHub API calls made; sync marked as "skipped"

---

## Next Steps (Post-Plan)

1. **Review & Approval:** Present plan to stakeholder; collect feedback (maintain planner role, don't jump to coding)
2. **Prioritize Units:** Determine order if parallelization is possible (S1 independent; most others build sequentially)
3. **Prepare Task Breakdown:** Use `/pwrl-tasks` skill to slice S1-S11 into daily or sprint tasks
4. **Begin Work:** Use `/pwrl-work` skill to execute tasks; maintain quality and testing as per project rules
5. **Track Learnings:** Document discoveries in `/pwrl-learnings` as each unit completes (especially parallel safety and GitHub sync patterns)
6. **Verify Fallback:** Before finalizing S9, confirm original pwrl-work monolithic code still runs correctly as fallback
7. **Test All Modes:** Before integration testing, verify inline/serial/parallel modes all work correctly
8. **Final Review:** Use `/pwrl-review` skill before merging; ensure code quality, test coverage, and all three execution modes work
9. **End Session:** Use `/pwrl-end-session` skill to commit and summarize progress
