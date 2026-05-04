---
name: pwrl-review
description: "Standard code review focusing on correctness, maintainability, security, and testing. Returns findings in a simple checklist format."
argument-hint: "[branch/PR or tokens like depth:fast, subagents:on]"
---

# Code Review

Reviews code changes against quality standards, identifying issues in logic, security, maintainability, testing, performance, and API contracts.

## Purpose

Provide actionable code review feedback before merge to catch correctness, security, testing, performance, maintainability, and API contract issues.

## When to Use

- Before creating a PR
- When reviewing someone else's changes
- After completing implementation work
- When you need feedback on code quality
- After completing a task from `pwrl-tasks` (task-based workflow)

## Support Files

- `references/severity-guide.md` — P0-P3 definitions, severity assessment guidelines, and examples
- `references/subagent-protocol.md` — Parallel reviewer orchestration, JSON schemas, error handling
- `references/validator-template.md` — Validation prompt for deep mode findings

## Review Lenses

- **Correctness**: Logic errors, edge cases, state bugs, error handling
- **Maintainability**: Code clarity, complexity, naming, duplication, abstraction
- **Security**: Input validation, auth checks, data exposure, injection risks
- **Testing**: Coverage gaps, test quality, missing edge cases
- **Performance**: Inefficient patterns, unnecessary work, resource usage
- **API Contracts**: Breaking changes, versioning, backward compatibility

## Severity Levels

| Level  | Meaning                                               | Action                 |
| ------ | ----------------------------------------------------- | ---------------------- |
| **P0** | Critical bug, security issue, or data corruption risk | Must fix before merge  |
| **P1** | High-impact defect likely in normal usage             | Should fix             |
| **P2** | Moderate issue with meaningful downside               | Fix if straightforward |
| **P3** | Minor improvement or low-impact issue                 | Optional               |

**See `references/severity-guide.md` for detailed definitions, assessment guidelines, and calibration examples.**

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

- **If verdict is "Ready to merge"**:
  - Update task frontmatter: change `status: for-review` to `status: done`
  - Move task file from `docs/tasks/for-review/` to `docs/tasks/done/`
  - Update `docs/tasks/INDEX.md` to reflect completion
  - If GitHub Issues integration enabled AND `github-issue` field present:
    - Close the GitHub issue
    - Add closing comment: "✅ Review passed - Ready to merge"

- **If verdict is "Ready with fixes" or "Not ready"**:
  - Update task frontmatter: change `status: for-review` back to `status: in-progress`
  - Move task file from `docs/tasks/for-review/` back to `docs/tasks/in-progress/`
  - Update `docs/tasks/INDEX.md` to reflect status change
  - If GitHub Issues integration enabled AND `github-issue` field present:
    - Re-open the GitHub issue (if closed)
    - Update labels: add `in-progress`, remove `for-review`
    - Add comment listing required fixes (P0/P1 items)

## Example Invocations

- `@pwrl-review` - Review current branch (defaults to `depth:standard`)
- `@pwrl-review depth:fast` - Quick scan, minimal output
- `@pwrl-review depth:deep subagents:on` - Thorough audit, spawn parallel subagents and write artifacts
- `@pwrl-review feature/new-api depth:standard` - Review specific branch with standard depth
- `@pwrl-review 123 depth:fast` - Review PR #123 with a quick scan
- `@pwrl-review https://github.com/org/repo/pull/123 depth:deep` - Review PR by URL with deep audit
- `@pwrl-review docs/tasks/in-progress/2026-05-04-u1-task.md` - Review work for specific task file
