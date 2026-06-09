---
unit-id: S1
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: for-review
created: 2026-06-05
dependencies: []
files: []
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S1: Analyze pwrl-work Structure & Dependencies

## Goal

Document the current monolithic pwrl-work skill structure by identifying phase boundaries, state objects, entry/exit points, and macro dependencies. This analysis informs the micro-skill extraction strategy.

## Context

The current `pwrl-work/SKILL.md` contains ~200 lines implementing all 5 phases inline (Triage → Prepare → Execute → Review → Ship). Before extracting micro-skills, we need a clear map of:

1. **Phase Boundaries:** Exactly which code/logic belongs in each phase
2. **State Objects:** What context flows between phases (inputs/outputs)
3. **Dependencies:** Which phases depend on previous phase outputs
4. **Entry/Exit Points:** How users invoke each phase and what they expect to receive

This map will guide extraction tasks S2-S7 and ensure nothing is lost.

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Pattern for identifying micro-skill boundaries by responsibility
  - State passing conventions between skills
  - Applicability: Use to validate proposed boundaries and state schema

## Implementation Steps

### Step 1: Read Full pwrl-work Skill (Reference)
- Open `/home/wicttor/.pi/agent/skills/pwrl-work/SKILL.md` (full project read)
- Note: This is the skill from the pi agent framework, not the project root skill
- Document total line count, section count, and major code blocks

### Step 2: Map Phase 0 (Triage Input)
- **Scope in SKILL.md:** Lines covering input classification
- Identify logic for:
  - Detecting if input is task file (has `unit-id`), plan file (no `unit-id`), or bare prompt
  - Extracting task frontmatter (unit-id, plan, status, dependencies, files, github-issue)
  - Reading linked plan file for context
  - Checking `.pwrlrc.json` for GitHub integration flag
  - Scanning codebase for relevant context (bare prompt)
  - Complexity classification (trivial/small/medium/large)
- Document input format and output (context object)

### Step 3: Map Phase 1 (Prepare Context & Environment)
- **Scope in SKILL.md:** Lines covering environment setup
- Identify logic for:
  - Clarifying ambiguities (ask questions)
  - Branch strategy confirmation
  - Task creation/update (for task files and plan files)
  - GitHub Issues sync preparation
  - Execution mode selection (inline/serial/parallel)
  - File-to-task conflict detection heuristic
- Document dependencies on Phase 0 output
- Identify state object passed to Phase 2

### Step 4: Map Phase 2 (Execute)
- **Scope in SKILL.md:** Lines covering task execution
- Identify logic for:
  - Inline task execution (direct implementation)
  - Serial subagent spawning and orchestration
  - Parallel subagent spawning, waiting, aggregation
  - Test running and quality gates
  - Task status updates (to-do → in-progress → for-review)
  - GitHub Issues sync (status updates, comments)
- Document dependencies on Phase 1 output
- Identify state object passed to Phase 3

### Step 5: Map Phase 3 (Simplify & Review)
- **Scope in SKILL.md:** Lines covering review and simplification
- Identify logic for:
  - Consolidating duplication
  - Extracting shared helpers
  - Running system checks (callbacks, middleware, observers, etc.)
  - Design spec comparison (if UI work)
- Document dependencies on Phase 2 output
- Identify state object passed to Phase 4

### Step 6: Map Phase 4 (Ship)
- **Scope in SKILL.md:** Lines covering shipping and finalization
- Identify logic for:
  - Final targeted checks (tests, lint/format)
  - Diff review for regressions and scope drift
  - User approval request
  - Staging and committing
  - End-session workflow offer
- Document dependencies on Phase 3 output

### Step 7: Create Analysis Document

In `docs/analysis/`, create a file `2026-06-05-pwrl-work-structure-analysis.md` with sections:

```markdown
# PWL-Work Structure Analysis (2026-06-05)

## Overview
- Total lines: [count]
- Phases: 5
- Entry points: 3 (task file, plan file, bare prompt)

## Phase Breakdown

### Phase 0: Triage Input
- Lines: [start-end]
- Inputs: document path or prompt string
- Outputs: {inputType, context, complexity}
- Key functions: [list]
- External dependencies: .pwrlrc.json, file system

### Phase 1: Prepare Context & Environment
- Lines: [start-end]
- Inputs: context from Phase 0
- Outputs: {taskList, executionMode, branchStrategy, githubReady}
- Key functions: [list]
- External dependencies: task file system, GitHub API (conditional)

### Phase 2: Execute
- Lines: [start-end]
- Inputs: task list, execution mode from Phase 1
- Outputs: {executionResults, testStatus, verificationSummaries}
- Key functions: [list]
- Execution modes: inline, serial, parallel
- External dependencies: subagent spawning, test framework

### Phase 3: Simplify & Review
- Lines: [start-end]
- Inputs: execution results from Phase 2
- Outputs: {refactoringNotes, readinessForShipping}
- Key functions: [list]
- External dependencies: design spec files (optional)

### Phase 4: Ship
- Lines: [start-end]
- Inputs: reviewed tasks from Phase 3
- Outputs: {shippingStatus, commitHash}
- Key functions: [list]
- External dependencies: git, user approval

## State Flow Diagram

[ASCII diagram or list showing context object shape:]

Input
  ↓ Phase 0 (Triage)
  → {inputType, context, complexity}
  ↓ Phase 1 (Prepare)
  → {taskList, executionMode, branchStrategy, githubReady}
  ↓ Phase 2 (Execute)
  → {executionResults, testStatus, verificationSummaries}
  ↓ Phase 3 (Simplify & Review)
  → {refactoringNotes, readinessForShipping}
  ↓ Phase 4 (Ship)
  → {shippingStatus, commitHash}

## Key Dependencies

- Phase 1 depends on: Phase 0 output, user input, .pwrlrc.json
- Phase 2 depends on: Phase 1 output, task files, test framework
- Phase 3 depends on: Phase 2 output, optional design specs
- Phase 4 depends on: Phase 3 output, user approval, git

## Extraction Implications

- S2 (pwrl-work-triage) extracts Phase 0
- S3 (pwrl-work-prepare) extracts Phase 1
- S5 (pwrl-work-execute) extracts Phase 2
- S6 (pwrl-work-review) extracts Phase 3
- S7 (pwrl-work-ship) extracts Phase 4
- S4 (pwrl-work-sync-status) extracts GitHub syncing from Phases 1 & 2

## Questions for Clarification

[List any ambiguities or areas needing clarification]
```

### Step 8: Validate Against Plan

- Cross-reference analysis document against plan:
  - Do all proposed micro-skills (U1-U6) align with phase boundaries?
  - Are state objects compatible with orchestrator design in plan?
  - Are any dependencies missing or incorrectly mapped?
- Document any discrepancies

## Acceptance Criteria

✅ Analysis document created and committed  
✅ All 5 phases clearly mapped (lines, inputs, outputs, dependencies)  
✅ State flow diagram shows context object evolution  
✅ No ambiguities remain; all questions answered  
✅ Plan alignment verified (no extraction surprises)  
✅ Ready for S2 (triage extraction) to begin

## References

- **Current Skill:** `/home/wicttor/.pi/agent/skills/pwrl-work/SKILL.md`
- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md`
- **Analysis Output:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
