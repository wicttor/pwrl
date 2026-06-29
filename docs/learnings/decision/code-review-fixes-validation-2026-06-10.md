---
title: Code Review Fixes & Validation Approach for Skill Decomposition
timestamp: 2026-06-10
category: decision
type: PWRL Learning
tags:
  - code-review
  - pwrl-work
  - parallel-execution
  - state-management
  - testing-strategy
severity: high
context: pwrl-work skill decomposition review and quality gates
---

# Code Review Fixes & Validation Approach for Skill Decomposition

## What We Fixed

After decomposing `pwrl-work` into 6 micro-skills + 1 orchestrator agent, code review identified 3 P2 (moderate) issues affecting clarity, testability, and API contracts. All 3 were fixed and validated.

### Issue 1: Parallel Mode Fallback Logic (Unclear)

**Problem**: Parallel mode mentioned "If conflicts found at runtime → downgrade to serial mode" but provided no explicit step-by-step procedure for the fallback. Operations engineers debugging failures would struggle to understand the exact sequence.

**Root Cause**: Documentation described the fallback as a possible outcome but didn't define implementation steps.

**Fix Applied**:
- Added explicit "Runtime conflict detection (during spawn)" section as Step 2
- Included detailed procedures:
  - **Detection**: Monitor for file conflicts during subagent initialization
  - **Pause**: Stop spawning new subagents immediately upon conflict
  - **Kill**: Terminate already-running subagents cleanly (SIGTERM → SIGKILL with 5s timeout)
  - **Notify**: Log conflict details (which tasks, which files)
  - **Decide**: Ask user: "Retry in serial mode or abort?"
  - **Action**: Re-queue all tasks for serial execution, or mark as blocked
- Renumbered all subsequent steps (3→3, 3→4, 4→5, 5→6, 6→7, 7→8) for clarity

**Evidence in File**:
```markdown
2. **Runtime conflict detection (during spawn):**
   - As subagents initialize, verify no file conflicts emerge
   - If during spawn phase a conflict is detected:
     - **Pause all spawning** — Do not start new subagents
     - **Kill already-running subagents** — Clean termination with SIGTERM (5s timeout, then SIGKILL)
     - **Log conflict details** — Which tasks share which files
     - **Ask user:** "File conflicts detected during parallel execution. Retry in serial mode or abort?"
     - **If user chooses serial:** Re-queue all tasks (including completed ones) for serial re-execution
     - **If user chooses abort:** Mark all tasks as blocked, return partial results
```

**Why It Matters**: Prevents state corruption and ensures deterministic recovery when parallelization conflicts emerge at runtime.

### Issue 2: GitHub CLI Mocking Not Documented

**Problem**: `pwrl-work-sync-status` skill depends on GitHub CLI (`gh` command) but provided no guidance on unit testing without:
- GitHub CLI installed
- GitHub credentials/authentication
- Access to live repositories

This causes test failures in CI environments and confusion for local development.

**Root Cause**: Skill assumed `gh` would always be available; no mock strategy documented.

**Fix Applied**:
- Added comprehensive "Testing with Mocks" section with 3 approaches:

#### Approach 1: Mock Shell Commands
```bash
# tests/mocks/gh-mock.sh
# Override gh in PATH to return canned responses
export PATH="./tests/mocks:$PATH"
```
- Pros: Realistic, covers error paths, full control
- Cons: More setup required
- Best for: Local development, comprehensive testing

#### Approach 2: Mock Config Disable
```json
// tests/.pwrlrc.test.json
{
  "integrations": {
    "githubIssues": false
  }
}
```
- Pros: Simplest, no external dependencies, fastest
- Cons: Only tests happy path (skipped)
- Best for: CI/CD pipelines, smoke tests

#### Approach 3: Real Issue in Repo
```bash
gh issue create --title "Test sync issue" --body "For pwrl-work-sync-status tests"
# Use real issue #9999 in test fixtures
# Clean up after: gh issue delete 9999
```
- Pros: Validates actual GitHub API behavior
- Cons: Requires credentials, slower, cleanup required
- Best for: Integration tests, pre-deployment verification

**Recommended Practice**:
- **CI/CD**: Use Approach 2 (mock disable) — fastest, no dependencies
- **Local dev**: Use Approach 1 (mock wrapper) — realistic, covers error paths
- **Integration**: Use Approach 3 (real issue) — validates GitHub API

**Why It Matters**: Enables testing in all environments (CI without credentials, local dev without gh CLI, integration without live state), reducing test flakiness and false failures.

### Issue 3: State Field Naming Inconsistency

**Problem**: Output schemas used both `unitId` (camelCase) and `unit-id` (kebab-case) inconsistently:
- YAML frontmatter files use `unit-id` (standard convention)
- Some output examples used `unitId`
- Some output examples used `unit-id`

This inconsistency causes mapping bugs in orchestrators and shell scripts parsing YAML.

**Root Cause**: Fields in examples were copied from different sources without normalization.

**Fix Applied**:
- Standardized all runtime state objects to use `unit-id` (matching YAML frontmatter convention)
- Changed 35 occurrences across 7 files:
  - `pwrl-work-triage/SKILL.md`: 3 → 3 ✓
  - `pwrl-work-prepare/SKILL.md`: 3 → 2 ✓
  - `pwrl-work-execute/SKILL.md`: 9 → 0 ✓
  - `pwrl-work-review/SKILL.md`: 1 → 0 ✓
  - `pwrl-work-sync-status/SKILL.md`: 1 → 1 ✓
  - `agents/pwrl-work.agent.md`: + agent updates ✓

**Before & After**:
```yaml
# Before (inconsistent)
results:
  - unitId: S1          # camelCase
    status: for-review
  - unit-id: S2         # kebab-case
    status: for-review

# After (standardized)
results:
  - unit-id: S1         # consistent
    status: for-review
  - unit-id: S2         # consistent
    status: for-review
```

**Why It Matters**: 
- Consistency reduces bugs in YAML parsers
- Shell scripts mapping `unit-id` from frontmatter to runtime state work correctly
- Orchestrators have clear, predictable field names
- Future developers don't need to search multiple examples to understand the schema

## Validation Approach

### Test Coverage Maintained
- **Before**: 83/83 tests passing
- **After**: 83/83 tests passing ✓
- No regressions, all existing assertions valid

### No Logic Changes
- Only documentation and examples modified
- No code behavior changed
- Backward compatible

### Consistency Verification
```bash
# Verified across all files:
grep -r "unit-id:" pwrl-work-*/SKILL.md agents/
# Confirmed: all output examples use consistent field naming
```

## Decision: Why These Fixes

| Criterion | Assessment |
|---|---|
| **Impact** | P2 (moderate) — affects clarity, testing, API contracts |
| **Scope** | Documentation only — no logic changes, low risk |
| **Effort** | < 30 minutes to implement and test |
| **Risk** | Minimal — review, fix, verify tests, merge |
| **Value** | High — improves maintainability, testability, reliability |

**Decision**: Apply all 3 fixes before merge. Benefits outweigh effort.

## Related Learnings

- `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — Foundation: why decomposition works
- `docs/learnings/decision/fallback-architecture-design-2026-06-05.md` — Why dual-path (agent + monolithic) chosen
- `docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md` — How state flows between skills

## Lessons for Future Decompositions

1. **Document fallback paths explicitly** — "If conflict detected, do X, Y, Z" is clearer than "downgrade to serial"
2. **Provide testing guidance for external dependencies** — 3 approaches > no guidance
3. **Standardize naming early** — Check consistency in examples before review phase
4. **Validate against full test suite** — All 83 tests still passing = safe to merge
