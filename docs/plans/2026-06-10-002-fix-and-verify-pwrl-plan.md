---
id: 2026-06-10-002
status: active
tier: Standard
created: 2026-06-10
updated: 2026-06-10
---

# Fix and Verify PWRL Plan Micro-Skills for Production Readiness

## Goal

Resolve critical (P0) and high-priority (P1) findings from code review to enable safe agent orchestration and comprehensive testing of planning workflow.

## Overview

The pwrl-plan micro-skills implementation is architecturally sound but has three blocking issues:

1. **State passing mechanism undefined** (P0) — Agent-to-skill communication not specified, causing orchestration failure
2. **Reference file completeness unverified** (P1) — All 19 files exist but content not audited
3. **Zero test coverage** (P1) — Skills lack unit/integration tests despite comprehensive test scenarios in task files

This plan addresses all P0/P1 issues + key P2 items (state schema standardization, backward navigation clarity).

## Success Criteria

- State passing protocol fully documented and verifiable
- All 19 reference files audited and complete (verified checklist)
- Unit tests for all 4 micro-skills pass
- Integration tests for agent orchestration pass
- Fallback routing implementation specified
- Agent backward-navigation behavior documented

## Implementation Units

### U1: Define State Passing Protocol

**Scope:** Create unified specification for how agent passes state between skills and how skills read/write state.

**Dependencies:** None

**Files Affected:**
  - Create: `pwrl-plan/references/state-passing-protocol.md` (new)
  - Modify: `agents/pwrl-planner.agent.md` (Phase 1-4 sections updated with actual invocations)
  - Modify: `pwrl-plan-research/SKILL.md` (argument-hint updated)
  - Modify: `pwrl-plan-design/SKILL.md` (argument-hint updated)
  - Modify: `pwrl-plan-generate/SKILL.md` (argument-hint updated)

**Approach:**
  - Option analysis: arg-based vs. file-based vs. environment-based state passing
  - Recommend file-based (docs/plans/.scope/, .research/, .design/) for robustness
  - Define schema: each skill writes state file, next skill reads latest
  - Update agent invocations to show actual file paths
  - Update each skill's argument-hint to match

**Acceptance Criteria:**
  - State passing protocol document exists with schema, storage paths, examples
  - Agent Phase 2-4 show actual file paths or environment variables
  - All skill argument-hints match agent's expected inputs
  - State object can be traced through all 4 skills

### U2: Audit and Complete Reference Files

**Scope:** Verify all 19 reference files exist, are complete, have examples, and contain no TODO/placeholder text.

**Dependencies:** None (can run in parallel with U1)

**Files Affected:**
  - Audit: 19 reference files across pwrl-plan-scope, pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate
  - Create: `pwrl-plan/docs/REFERENCE_FILE_AUDIT.md` (completion checklist)

**Approach:**
  - Create audit checklist with columns: File, Exists?, Empty?, Examples?, TODOs?, Status
  - Spot-check each file (10 min per file, 3 hours total):
    - Verify structure matches parent skill's description
    - Confirm 2-3 key examples/rules present
    - Check for incomplete sections
  - Document any gaps (e.g., missing examples, vague logic)
  - Update incomplete files or flag as low-priority (non-blocking)

**Acceptance Criteria:**
  - All 19 files verified to exist and be non-empty
  - Critical files (u-id-generator, render-workflow, high-risk-detection, learnings-gate-logic) have complete examples
  - No TODO, FIXME, or placeholder markers remaining
  - Audit checklist saved showing 100% completion

### U3: Specify Fallback Routing Implementation

**Scope:** Document exact detection logic for agent availability, file paths, config keys, and fallback behavior.

**Dependencies:** None

**Files Affected:**
  - Modify: `pwrl-plan/references/agent-routing.md` (add implementation details)
  - Create: `pwrl-plan/references/agent-routing-implementation.md` (code-level details, if needed)

**Approach:**
  - Define file path to check: `.agents/agents/pwrl-planner.agent.md` relative to project root
  - Define config key: `PI_AGENTS_ENABLED` environment variable (or system config alternative)
  - Pseudocode → implementation checklist:
    ```
    if (file .agents/agents/pwrl-planner.agent.md exists) AND (env PI_AGENTS_ENABLED !== "false") {
      try to call /pwrl-planner [args]
      if success: return result
      if fail: log error, fall back to monolithic
    } else {
      run monolithic fallback
    }
    ```
  - Update troubleshooting table with exact steps

**Acceptance Criteria:**
  - Agent routing documentation specifies exact file paths (relative to project root)
  - Config key defined with default value and how to override
  - Implementation pseudocode clear enough for developer implementation
  - Troubleshooting section covers all detection failure scenarios

### U4: Create Unit Tests for Micro-Skills

**Scope:** Implement unit tests for each micro-skill covering scenarios described in task files.

**Dependencies:** U1 (state passing protocol must be finalized first)

**Files Affected:**
  - Create: `pwrl-plan-scope/__tests__/scope.test.md` (scenarios from task S2)
  - Create: `pwrl-plan-research/__tests__/research.test.md` (scenarios from task S3)
  - Create: `pwrl-plan-design/__tests__/design.test.md` (scenarios from task S4)
  - Create: `pwrl-plan-generate/__tests__/generate.test.md` (scenarios from task S5)

**Approach:**
  - Extract test scenarios from existing task files:
    - S2: Existing Plan Resume, Bootstrap from Scratch, Learnings Index Gate, Requirements Search
    - S3: Pattern Discovery, Risk Detection, External Research Decision
    - S4: Unit Count Estimation, U-ID Stability, Dependency Validation
    - S5: Tier Selection, Template Rendering, File Validation
  - Format as markdown test suites with setup, execution, verification
  - Include mock inputs and expected outputs
  - Verify each skill's workflow can be tested independently

**Acceptance Criteria:**
  - 4 test files created (1 per skill)
  - Each covers 3-4 key scenarios from original task file
  - Tests verify input handling, ask_user prompts, output structure
  - Tests can be run to verify skill functionality

### U5: Create Integration Test for Agent Orchestration

**Scope:** Test full planning workflow: agent → S2 scope → S3 research → S4 design → S5 generate.

**Dependencies:** U1, U4 (state passing and unit tests)

**Files Affected:**
  - Create: `agents/__tests__/pwrl-planner-orchestration.test.md` (full workflow)
  - Create: `agents/__tests__/pwrl-planner-fallback.test.md` (fallback path)

**Approach:**
  - Full workflow test:
    - Input: "Plan extraction of triage logic from pwrl-work"
    - Verify all 4 skills called in sequence
    - Verify state passes correctly between skills
    - Verify final plan file written to docs/plans/
  - Fallback test:
    - Simulate missing agent file
    - Verify fallback path taken
    - Verify plan still generated

**Acceptance Criteria:**
  - Integration test passes end-to-end
  - Fallback test confirms graceful degradation
  - State object traced through all 4 skills
  - Final plan file validates against schema

### U6: Standardize State Schema Field Naming

**Scope:** Align state object field names across all 4 skills for consistency and robustness.

**Dependencies:** U1 (protocol must define standard fields)

**Files Affected:**
  - Modify: `pwrl-plan-scope/references/state-schema.md`
  - Modify: `pwrl-plan-research/references/state-schema.md`
  - Modify: `pwrl-plan-design/references/state-schema.md`
  - Modify: `pwrl-plan-generate/references/state-schema.md`
  - Create: `pwrl-plan/references/unified-state-schema.md` (master schema)

**Approach:**
  - Define standard fields all phases must have:
    - `id`: YYYY-MM-DD-NNN-<phase>
    - `phase`: scope | research | design | plan
    - `status`: in-progress | complete
    - `created`, `updated`: YYYY-MM-DD
  - Phase-specific fields documented separately:
    - Scope: `domain`, `problem`, `intended_behavior`, `success_criteria`
    - Research: `risk_level`, `patterns_found`, `tech_stack`
    - Design: `complexity_hint`, `implementation_units`, `diagram`
    - Generate: `tier`, `plan_file_path`, `frontmatter`
  - Update all state-schema.md files to follow unified format

**Acceptance Criteria:**
  - Unified schema document created
  - All 4 state-schema.md files updated to use standard fields
  - Field naming consistent and documented
  - Examples in each file updated to match new schema

### U7: Document Backward Navigation in Agent

**Scope:** Clarify agent behavior for backward navigation and state rollback.

**Dependencies:** None (documentation only)

**Files Affected:**
  - Modify: `agents/pwrl-planner.agent.md` (add navigation model section)

**Approach:**
  - Define navigation model:
    - Forward-only: User can refine at current checkpoint but cannot skip ahead
    - Backward: Not supported (to keep state linear)
    - If user needs to change prior phase: exit and re-run /pwrl-plan
  - Document state management:
    - What state is stored between phases? (in memory)
    - What happens if user cancels? (state discarded)
    - What if user adjusts at Phase 1? (Phase 1 re-runs, Phases 2-4 reset)
  - Add decision tree for checkpoint options

**Acceptance Criteria:**
  - Navigation model documented in agent
  - Clear guidance for users on how to adjust prior decisions
  - State rollback behavior explicit
  - No user confusion about what happens when they refine scope mid-workflow

### U8: Documentation Polish and Examples

**Scope:** Add missing examples, fix consistency issues, ensure completeness.

**Dependencies:** All prior units

**Files Affected:**
  - Modify: `agents/pwrl-planner.agent.md` (add output examples)
  - Modify: `pwrl-plan-scope/SKILL.md` (tier guidance)
  - Modify: `pwrl-plan-research/SKILL.md` (tier guidance)
  - Modify: `pwrl-plan-design/SKILL.md` (tier guidance)
  - Modify: `pwrl-plan-generate/SKILL.md` (tier guidance)

**Approach:**
  - Add output examples to agent showing user sees at each checkpoint
  - Add tier context to each skill's Purpose section
  - Standardize heading depth and reference file naming
  - Fix any remaining consistency issues

**Acceptance Criteria:**
  - Agent examples show actual user experience
  - Each skill explains its role in tier selection
  - Documentation is consistent and easy to navigate

---

## Related Learnings

- **Planning Workflow Fundamentals** — docs/learnings/planning-workflow.md — Covers Phase 1-4 concepts; already aligned with micro-skill boundaries
- **Agent Orchestration Patterns** — docs/learnings/agent-orchestration.md — Informs state passing protocol design
- **Testing Micro-Skills** — docs/learnings/testing-micro-skills.md — (learning gap) Document best practices for testing independent skills

## Learning Gaps

- **State Passing in Orchestrated Workflows** — Document design decision (file-based state) and rationale after U1 completes
- **Testing Strategy for Phase-Based Systems** — Document unit vs. integration testing approach after U4/U5 complete
- **Backward Navigation in Sequential UIs** — Document forward-only navigation model and why (linear state management)

---

## Technical Decisions

### Decision 1: File-Based State Passing (vs. Args or Environment)

**Rationale:**
- **File-based:** Robust (survives skill restarts), debuggable (state visible), scalable (large objects)
- **Args:** Limited by command-line length, requires careful escaping
- **Environment:** Not visible in logs, not persistent

**Chosen:** File-based with `docs/plans/.scope/`, `.research/`, `.design/` directories

### Decision 2: Forward-Only Navigation

**Rationale:**
- Keeps state linear and prevents complex rollback logic
- Users can refine at each checkpoint; if they want major changes, they re-run planning
- Simpler implementation and fewer edge cases

**Chosen:** Forward-only with option to exit and re-run

---

## Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Reference files incomplete | Skills fail at runtime | Medium | Thorough audit in U2 |
| State passing breaks agent | Agent orchestration unusable | High | Careful protocol design + U5 testing |
| Tests don't cover edge cases | Undiscovered bugs | Medium | Extract scenarios from existing task files |
| Backward navigation confusion | User frustration | Low | Clear documentation in agent |

---

## Rollout Plan

**Phase 1 (1-2 days):** U1, U3 — Protocol and routing (foundation)
**Phase 2 (2-3 days):** U2, U4 — Reference audit and unit tests (verification)
**Phase 3 (1 day):** U5, U6 — Integration tests and schema standardization (integration)
**Phase 4 (1 day):** U7, U8 — Documentation polish (finalization)

**Total estimated:** 5-7 days (if working full-time on this)

---

## Success Metrics

- ✅ All P0 findings resolved (state passing 100% defined)
- ✅ All P1 findings resolved (reference audit complete, tests added)
- ✅ Agent orchestration can be tested end-to-end
- ✅ Fallback routing can be tested independently
- ✅ Documentation is consistent and complete
- ✅ Planning skill can be merged to main branch with confidence
