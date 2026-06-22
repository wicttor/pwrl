---
title: Code Review 4-Phase Pipeline
type: workflow
domain: process
severity: high
tags: [code-review, workflow, quality-gates, deterministic]
source: "commit:2c5e7ec, skill:pwrl-review"
created: 2026-06-22
---

# Code Review 4-Phase Pipeline

## Workflow

Structured code review using 4 deterministic phases with clear input/output artifacts and quality gates at each phase.

## Phases

### Phase 1: Scope Validation

**Purpose:** Ensure code changes match requirements (no scope creep)

**Input:** Source branch/PR, requirements context (task/plan)

**Processing:**
- Extract requirements from task/plan
- Compare to actual files modified
- Detect scope creep (unrelated file changes)

**Output:** Scope artifact with scope_verdict (on-target/justified/creep-detected)

**Quality Gate:** Verify scope matches before proceeding

### Phase 2: Prepare Review

**Purpose:** Setup review environment and configure analysis tools

**Input:** Scope artifact (approved)

**Processing:**
- Gather diff, LOC changes, file types
- Establish baseline for comparison
- Identify review scope (code quality, security, tests, docs)
- Configure analysis tools (linter, test framework, coverage)

**Output:** Prepare artifact with tools_configured and review_scope

### Phase 3: Analyze Code

**Purpose:** Review code through multiple lenses

**Input:** Prepare artifact

**Processing:** Analyze through each lens:
1. **Correctness** — Logic errors, edge cases, state bugs, error handling
2. **Security** — Input validation, auth checks, injection risks
3. **Testing** — Coverage gaps, edge case tests, assertion quality
4. **Documentation** — README updates, comments, types, changelog
5. **Integration** — Build success, test pass, no regressions
6. **Performance** — Inefficient patterns, unnecessary work

**Output:** Analyze artifact with findings organized by category and severity

### Phase 4: Generate Report

**Purpose:** Compile findings and determine approval status

**Input:** Analyze artifact

**Processing:**
1. Format findings into readable report
2. Calculate approval verdict:
   - **APPROVED:** 0 critical, <5 major, all checks pass
   - **REQUEST CHANGES:** 1-2 critical or 5-10 major (fixable)
   - **REJECTED:** >2 critical or >10 major (unfixable)
3. Post-review actions (move tasks, update status)

**Output:** Report artifact with verdict (approved/request-changes/rejected)

## Key Advantages

✓ **Deterministic** — Same phases every time; predictable process
✓ **Phase-gated** — Quality gates prevent moving forward with unresolved issues
✓ **Artifact-driven** — Clear inputs/outputs for each phase (traceable)
✓ **Scope-first** — Validate requirements before deep analysis (prevents wasted effort)
✓ **Comprehensive** — Multiple review lenses ensure thorough analysis
✓ **Clear verdict** — Explicit criteria for approval status

## Real-World Impact

**Wave 1 Review (U1, U2, U5):**
- Phase 1 (Scope): Validated all 3 tasks matched requirements exactly → zero scope creep
- Phase 2 (Prepare): Identified 19 tests to analyze, 2 schema docs to review
- Phase 3 (Analyze): Found 2 minor (P2) issues, 0 critical, 0 major
- Phase 4 (Report): Approved all 3 tasks, moved to done/, created commit

**Efficiency Metric:** All 3 tasks approved with high confidence due to systematic review

## Quality Criteria

**Code is APPROVED when:**

- ✓ Scope matches requirements (no creep)
- ✓ Code logic is correct
- ✓ No security vulnerabilities
- ✓ Tests are adequate (>50% coverage)
- ✓ Documentation updated
- ✓ Build passes, tests pass
- ✓ No regressions

**REQUEST CHANGES when:**

- ⚠️ 1-2 critical issues (fixable)
- ⚠️ 5-10 major issues (fixable)
- ⚠️ Some tests failing (fixable)

**REJECT when:**

- ✗ >2 critical issues (unfixable)
- ✗ >10 major issues
- ✗ Build fails
- ✗ Core tests fail
- ✗ Significant scope creep

## When to Use

- After completing implementation work
- Before creating a pull request
- To review someone else's code changes
- When you need confidence before merging

## Related Learnings

- TDD RED Phase - Test-First Specification (pattern)
- Task State Management (pattern)
