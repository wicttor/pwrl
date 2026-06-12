---
name: pwrl-review
description: Review code changes through 4-phase micro-skill pipeline (scope, prepare, analyze, report)
argument-hint: "[branch, PR number, or empty for current branch]"
---

# PWRL Review

Review code changes through a deterministic 4-phase pipeline: validate scope, prepare for review, analyze code quality/security/tests, and generate approval decision.

## Purpose

Provide comprehensive code review through systematic analysis:

- **Validate Scope** — Ensure changes match requirements, detect scope creep
- **Prepare Review** — Gather artifacts, establish baselines, configure analysis
- **Analyze Code** — Review quality, security, tests, documentation, integration
- **Generate Report** — Compile findings, determine approval status

## Usage

```bash
/pwrl-review
/pwrl-review feature/U2-email-validation
/pwrl-review origin/dev
```

## Architecture

**Pure Skill Pipeline** — Direct sequence of 4 micro-skills:

```
Input (branch/PR)
  ↓
Phase 1: pwrl-review-scope
  ├ Input: Source branch, requirements
  ├ Output: Scope artifact (scope_verdict, files_analyzed)
  ↓
Phase 2: pwrl-review-prepare
  ├ Input: Scope artifact
  ├ Processing: Diff gathering, baseline setup, tool configuration
  ├ Output: Prepare artifact (review_scope, tools_configured)
  ↓
Phase 3: pwrl-review-analyze
  ├ Input: Prepare artifact
  ├ Processing: Code quality, security, tests, docs, integration checks
  ├ Output: Analyze artifact (findings, issues_found by severity, integration_check)
  ↓
Phase 4: pwrl-review-report
  ├ Input: Analyze artifact
  ├ Processing: Format report, calculate verdict, get user approval
  ├ Output: Report artifact (verdict: approved/request-changes/rejected)
  ↓
COMPLETE
```

## Workflow

### Phase 1: Validate Scope

**Purpose:** Ensure code changes match requirements without scope creep

**Input:** Source branch/PR, requirements context

**Processing:** (See `pwrl-review-scope/references/scope-validation-protocol.md`)

1. Extract requirements from task/plan
2. Compare to actual files modified
3. Detect scope creep (unrelated file changes)
4. Get user approval if justified

**Output:** Scope artifact with scope_verdict (on-target/justified/creep-detected)

### Phase 2: Prepare Review

**Purpose:** Setup review environment and configure analysis tools

**Input:** Scope artifact (approved)

**Processing:** (See `pwrl-review-prepare/references/prepare-review-protocol.md`)

1. Gather diff, LOC changes, file types
2. Establish baseline for comparison
3. Identify review scope (code quality, security, tests, docs)
4. Configure analysis tools (linter, test framework, coverage)

**Output:** Prepare artifact with tools_configured and review_scope

### Phase 3: Analyze Code

**Purpose:** Review code quality, security, tests, documentation, and integration

**Input:** Prepare artifact

**Processing:** (See `pwrl-review-analyze/references/analyze-code-protocol.md`)

1. **Code Quality:** Logic, complexity, style, error handling, dead code
2. **Security:** Input validation, injection risks, auth/authz, secrets, dependencies
3. **Tests:** Coverage, scenarios, assertions, speed, isolation
4. **Documentation:** README updates, comments, types, changelog
5. **Integration:** Build success, test pass, no regressions, no broken imports

**Output:** Analyze artifact with findings organized by category and severity

### Phase 4: Generate Report

**Purpose:** Compile findings and determine approval status

**Input:** Analyze artifact

**Processing:** (See `pwrl-review-report/references/report-generation-protocol.md`)

1. Format findings into readable report
2. Calculate approval verdict based on issues:
   - **APPROVED:** 0 critical issues, <5 major, all checks pass
   - **REQUEST CHANGES:** 1-2 critical or 5-10 major (fixable)
   - **REJECTED:** >2 critical or >10 major (unfixable)
3. Get user approval
4. Generate report artifact

**Output:** Report artifact with verdict (approved/request-changes/rejected)

---

## Quality Assessment

**Code is APPROVED when:**

- ✓ Scope matches requirements (no creep)
- ✓ Code logic is correct
- ✓ No security vulnerabilities
- ✓ Tests are adequate (>50% coverage)
- ✓ Documentation updated
- ✓ Build passes, tests pass
- ✓ No regressions

**REQUEST CHANGES when:**

- ⚠ 1-2 critical issues (fixable)
- ⚠ 5-10 major issues (fixable)
- ⚠ Some tests failing (fixable)
- ⚠ Build warnings

**REJECT when:**

- ✗ >2 critical issues (unfixable)
- ✗ >10 major issues
- ✗ Build fails
- ✗ Core tests fail
- ✗ Significant scope creep

## Review Lenses

- **Correctness** — Logic errors, edge cases, error handling
- **Security** — Input validation, injection, auth, secrets
- **Maintainability** — Clarity, complexity, duplication, abstraction
- **Testing** — Coverage, scenarios, assertions, isolation
- **Performance** — Efficiency, resource usage, slow operations
- **Integration** — No broken imports, circular deps, regressions

## Support Files

- `pwrl-review-scope/references/scope-validation-protocol.md` — Phase 1 specification
- `pwrl-review-prepare/references/prepare-review-protocol.md` — Phase 2 specification
- `pwrl-review-analyze/references/analyze-code-protocol.md` — Phase 3 specification
- `pwrl-review-report/references/report-generation-protocol.md` — Phase 4 specification

## When to Use

- After completing implementation work
- Before creating a pull request
- To review someone else's code changes
- When you need confidence before merging
- After completing a task from pwrl-work

## Control Tokens

Optional tokens control review depth and execution mode:

- `depth:fast` — Quick scan, minimal findings, no artifacts
- `depth:standard` — Balanced review (default), prefer subagents if available
- `depth:deep` — Thorough audit with parallel subagents and artifacts
- `subagents:on|off` — Force subagent mode (default: auto)

Tokens are stripped before interpreting remainder as branch/PR/commit/URL. Error if conflicting depth tokens provided.

## Workflow

### 1. Determine Scope

Get the diff based on argument type:

- **Task file**: If argument is a path to a task file (e.g., `docs/tasks/in-progress/2026-05-04-u1-task.md`):
  - Read task frontmatter to extract `github-issue`, `files`, `plan`, and `unit-id`
  - Use `files` field to determine scope of review
  - Read linked plan for technical context
  - Get diff for all files listed in task's `files` field
  - If task is in `done/` directory, review the final implementation
  - If task is in `in-progress/`, review current work-in-progress

- **PR/commit/URL**: Use `gh pr diff <pr>` or `git show <commit>`
- **Branch**: Use `git diff $(git merge-base HEAD <branch>)..<branch>`
- **No argument**: Use `git diff $(git merge-base HEAD $(git rev-parse --abbrev-ref HEAD)@{upstream})`

Extract changed files, full diff, and line counts.

### 2. Understand Intent

From PR description, commit messages, or branch name, determine:

- What is this change trying to accomplish?
- What behavior is being added, modified, or removed?
- Are there documented requirements or plans?

**Check for associated task or plan:**

- Look for task files in `docs/tasks/in-progress/`, `docs/tasks/for-review/`, or `docs/tasks/done/` that match the work scope
- If a task file exists with `github-issue` field matching current PR/branch:
  - Read task file for detailed context: goal, acceptance criteria, edge cases
  - Read linked plan (from task's `plan` field) for broader technical context
  - Use task's expected files to verify scope hasn't drifted
- If no task found, look for related plans in `docs/plans/`
- If task has GitHub issue, note it for potential status updates after review

If intent is unclear after checking tasks/plans, ask: "What is the primary goal of these changes?"

### 3. Review

Examine the diff through each lens:

- **Correctness**: Logic errors, edge cases, state bugs, error handling
- **Testing**: Coverage gaps, edge case tests, assertion quality
- **Maintainability**: Code clarity, complexity, naming, duplication
- **Security**: Input validation, auth checks, injection risks, data exposure
- **Performance**: Inefficient patterns, unnecessary work, resource usage
- **API Contracts**: Breaking changes, versioning, backward compatibility

**Execution Modes:**

- **Single-pass** (default or `subagents:off`): Review in-process using review lenses above
- **Parallel subagents** (`depth:deep` or `subagents:on`): Spawn 6 specialized reviewers in parallel (correctness, testing, maintainability, security, performance, api)

**See `references/subagent-protocol.md` for detailed orchestration, JSON schemas, and error handling.**

**Validation Pass (depth:deep only):**

Run independent validators on top 15 findings using `references/validator-template.md`. Validators return `{"validated": true|false, "reason": "..."}`. Drop findings where `validated:false`.

**Artifacts (depth:deep only):**

Write full analysis to `.context/pwrl-review/{run_id}/` with per-reviewer JSON and validation results.

### 4. Report Findings

Present results as checklist format:

```
# Code Review

**Scope**: <branch/PR description>
**Intent**: <1-2 line summary>
**Source**: [Task: docs/tasks/.../task-file.md | Plan: docs/plans/plan.md | None]
**Changed**: N files, +X/-Y lines

## Findings

### P0 - Critical
- [ ] **[Category]** File:Line - Issue description
      → Why it matters | Suggested fix
      Evidence: <snippet> (depth:deep only)

[...P1, P2, P3 sections follow same format...]

## Summary

**Verdict**: Ready to merge | Ready with fixes | Not ready
**Reason**: <brief explanation>
**Testing Gaps**: <list important missing tests>
**Scope Check**: [If task-based] Files match task expectations | [List any unexpected changes]
**Artifacts**: .context/pwrl-review/<run_id>/ (depth:deep only)
```

**Post-Review Actions:**

If review is based on a task file:

1. If verdict is **Ready to merge**: mark task `done` and move it to `docs/tasks/done/`.
2. If verdict is **Ready with fixes / Not ready**: move task back to `in-progress` and add required fixes (P0/P1) to the task body.

## Output

- A checklist-style review report grouped by severity (P0-P3)
- For `depth:deep`, optional artifacts written to `.context/pwrl-review/<run_id>/`
