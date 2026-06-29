---
title: PWL-Work Slicing Plan (2026-06-05)
description: Dual-Path Architecture for Skill Decomposition — Agent Orchestration + Monolithic Fallback
category: plan
type: PWRL Learning
timestamp: 2026-06-05
tags: [skill-decomposition, plan, architecture, agent-orchestration, fallback]
---

# Learning: PWL-Work Slicing Plan (2026-06-05)

## Topic
Dual-Path Architecture for Skill Decomposition: Agent Orchestration + Monolithic Fallback

## Context
Following the successful pattern from pwrl-plan slicing (2026-06-05-001), created a comprehensive plan to decompose the monolithic pwrl-work skill into 6 focused micro-skills orchestrated by an optional agent, with intelligent fallback when agents unavailable.

## Key Insights

### 1. Micro-Skill Boundaries
Decomposed by workflow phase, not by execution mode:
- **Phase 0:** Triage Input (classify, estimate complexity, resolve dependencies)
- **Phase 1:** Prepare Environment (setup branch, create tasks, select mode)
- **Utility:** GitHub Sync (reusable by multiple skills)
- **Phase 2:** Execute (inline/serial/parallel modes)
- **Phase 3:** Review (consolidate code, system checks)
- **Phase 4:** Ship (finalize, approve, commit, push)

### 2. Execution Mode Selection
Automatic detection based on task characteristics:
- **Inline:** 1-2 tasks, no subagents needed
- **Serial:** 3+ tasks with dependencies, sequential subagents
- **Parallel:** 3+ independent tasks, concurrent subagents with file-conflict detection

### 3. Safety Gates for Parallelism
File-conflict detection prevents race conditions:
- Build file-to-task map from each task's declared files
- If any file touched by 2+ tasks: force serial mode
- Document conflict and reason in output
- Allows safe parallelism without manual verification

### 4. GitHub Integration as Utility
Extracted status syncing into reusable micro-skill:
- Called by both Prepare (at task start) and Execute (on completion)
- Gracefully skips if GitHub disabled
- Handles label management, comment posting, dry-run mode
- Centralized error handling and retry logic

### 5. Dual-Path Architecture Pattern
Replicated successful pwrl-plan fallback pattern:
- **Agent Path:** Orchestrator calls micro-skills sequentially, manages checkpoints, passes state
- **Fallback Path:** Original monolithic skill runs all phases inline
- **Detection:** Check file existence + system config
- **Transparency:** Both paths produce identical output (or documented differences)
- **Zero Breaking Changes:** Original input/output format preserved

### 6. State Management Across Skills
Context object flows through phases:
- Triage outputs: {inputType, complexity, dependencies}
- Prepare outputs: {taskList, executionMode, branchStrategy, githubReady}
- Execute outputs: {tasksCompleted, testsPassed, commitHash}
- Review outputs: {consolidations, readiness}
- Ship outputs: {shippingStatus, commitHash}

### 7. Effort Estimation
Complex feature decomposition requires comprehensive planning:
- Total: 63-82 hours (11 tasks)
- Critical path: S1 → S2 → S3 → S5 → S6 → S7 → S8 → S9 → S11
- Parallel opportunities: S4 (utility), S10 (docs)
- Largest tasks: S5 (execute, 10-12 hrs), S11 (testing, 12-16 hrs)

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| State passing complexity | Keep state simple (context objects), use markdown for persistence |
| Parallel subagent coordination | File-conflict detection heuristic prevents unsafe races |
| GitHub API rate limits | Batch operations, check limits before sync, log warnings |
| Fallback reliability | Agent detection wrapped in try-catch, full monolithic path always available |
| Execution mode selection accuracy | Heuristic may need user override, document clearly |

## Applied Patterns

1. **Micro-Skill Pattern:** Single responsibility, reusable, independently testable
2. **Agent Orchestration:** Sequential skill calling, checkpoints, state passing
3. **Intelligent Fallback:** Graceful degradation, transparent to user
4. **Dual-Path Testing:** Verify both agent and fallback paths produce equivalent results
5. **GitHub Integration:** Optional feature, does not block execution if unavailable

## Recommendations for Future Sessions

1. **S1 (Analysis) is Foundation:** Must complete before extracting micro-skills
2. **Parallel S4:** GitHub utility can be built independently while S2-S3 progress
3. **Test Coverage Critical:** 75+ tests needed to verify both paths and all modes
4. **Documentation Early:** Start S10 while S8 being built (parallel opportunity)
5. **Fallback Verification:** Before S9 completion, confirm original pwrl-work still works

## References

- Plan: `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md`
- Task Index: `docs/tasks/INDEX-S1-S11.md`
- Related Learning: `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`
- Pattern Reference: `docs/learnings/decision/fallback-architecture-design-2026-06-05.md`
