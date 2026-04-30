---
name: pwrl-review
description: "Standard code review focusing on correctness, maintainability, security, and testing. Returns findings in a simple checklist format."
argument-hint: "[branch/PR or tokens like depth:fast, subagents:on]"
---

# Code Review

Reviews code changes against quality standards, identifying issues in logic, security, maintainability, testing, performance, and API contracts.

## When to Use

- Before creating a PR
- When reviewing someone else's changes
- After completing implementation work
- When you need feedback on code quality

## Review Scope

The review examines:

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

| **P3** | Minor improvement or low-impact issue | Optional |

## Argument Parsing & Depth Control

Parse the invocation for optional tokens. Tokens (if present) are stripped before interpreting the remainder as a branch name, PR number, commit SHA, or URL.

- `depth:fast` — Quick scan. Minimal findings, no evidence artifacts. Single-pass, low-latency review.
- `depth:standard` — Balanced review depth (default). Prefer subagents when available.
- `depth:deep` — Thorough audit. Spawns parallel subagents (if available), generates run artifacts, and returns enriched findings with evidence.

- `subagents:on` | `subagents:off` — Force subagent mode on or off. Default: `auto` (spawn subagents when the platform exposes them).

If multiple conflicting depth tokens are provided, the skill stops with an error: "Conflicting depth tokens — please provide exactly one depth:<fast|standard|deep>."

## Workflow

### 1. Determine Scope

**If argument is a PR number, commit SHA, or URL:**

```bash
# Get PR details
gh pr view <pr> --json title,body,baseRefName,url
gh pr diff <pr>
```

```bash
# Get commit details
git show <commit> --stat --patch
```

**If argument is a branch name:**

```bash
git diff $(git merge-base HEAD <branch>)..<branch>
```

**If no argument (review current branch):**

```bash
BASE=$(git merge-base HEAD $(git rev-parse --abbrev-ref $(git rev-parse --abbrev-ref HEAD)@{upstream} 2>/dev/null || echo main))
git diff $BASE
```

Extract:

- Changed files list
- Full diff with context
- Line counts (added/removed)

### 2. Understand Intent

From PR description, commit messages, or branch name, determine:

- What is this change trying to accomplish?
- What behavior is being added, modified, or removed?
- Are there documented requirements or plans?

If intent is unclear, ask: "What is the primary goal of these changes?"

### 3. Review

Examine the diff through each lens. The behavior varies by depth and by whether subagents are available.

3a. Subagent orchestration (deep or when `subagents:on`)

- If the environment exposes a parallel subagent facility, spawn one reviewer per area in parallel. Assign areas to reviewers as follows: - `correctness-reviewer` — Logic, edge cases, state - `testing-reviewer` — Tests, coverage, assertions - `maintainability-reviewer` — Clarity, duplication, complexity - `security-reviewer` — Auth, validation, injection, data exposure - `performance-reviewer` — Hot paths, DB queries, caching - `api-reviewer` — Public APIs, schema/contract changes

- Each subagent should return compact JSON (per-finding: `title`, `severity`, `file`, `line`, `confidence`, `suggested_fix`) and — in `depth:deep` — write a full artifact to `.context/pwrl-review/{run_id}/{reviewer}.json` containing `why_it_matters` and `evidence[]`.

- Example run-id generation (used only in `depth:deep`):

```bash
RUN_ID=$(date +%Y%m%d-%H%M%S)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')
mkdir -p ".context/pwrl-review/$RUN_ID"
```

- If subagents are not available or `subagents:off` is set, perform a single-pass review in-process using the same review lenses below.

**Correctness:**

- Are there logic errors or off-by-one bugs?
- Are edge cases handled (empty, null, max, min, boundary)?
- Is error propagation correct?
- Are state transitions valid?

**Maintainability:**

- Is the code clear and well-named?
- Is complexity reasonable?
- Are abstractions appropriate?
- Is there unnecessary duplication?

**Security:**

- Is user input validated?
- Are authorization checks present?
- Could data leak or be exposed?
- Are there injection risks (SQL, XSS, command)?

**Testing:**

- Are new features covered by tests?
- Do tests verify edge cases?
- Are tests meaningful (not just happy path)?
- Are test assertions strong?

**Performance:**

- Are there unnecessary loops or operations?
- Are expensive operations cached when appropriate?
- Are database queries efficient?
- Are resources released properly?

**API Contracts:**

- Are there breaking changes to public APIs?
- Is versioning handled correctly?
- Are types/schemas backward compatible?
- Is the contract clearly documented?

For each issue found, record:

- **Title**: Clear, specific description
- **Severity**: P0, P1, P2, or P3
- **File & Line**: Where the issue occurs
- **Category**: Which review area (correctness, security, etc.)
- **Details**: Why this matters and what to fix

### Validation pass (deep mode)

When `depth:deep` is selected and subagents have produced per-finding artifacts, run an independent validator per surviving finding using the prompt in `references/validator-template.md`. The validator re-checks the finding against the diff and any available `why_it_matters` detail from the per-reviewer artifact. Validators must return the JSON envelope:

```json
{ "validated": true|false, "reason": "<one-sentence>" }
```

Notes:

- Validators run in parallel when possible.
- If there are more than 15 findings, validate the highest-severity 15 (P0 first, then P1, etc.). Drop the remainder and record the over-budget count in the review notes.
- If a validator returns `validated:false` or fails to run, the finding is dropped and the reason is recorded.
- Validators are strictly read-only. They must not modify the repository or run mutating commands.

### 4. Report Findings

Present results as a simple checklist. When `depth:deep` is selected, include per-finding evidence and mention the artifact path `.context/pwrl-review/<run_id>/` where reviewers' full analyses are stored. Deep-mode findings should include a short `why_it_matters` snippet and 1–2 evidence lines when available.

```
# Code Review

**Scope**: <branch/PR description>
**Intent**: <1-2 line summary>
**Changed**: N files, +X/-Y lines

## Findings

### P0 - Critical
- [ ] **[Correctness]** File:Line - Issue description
      → Why it matters | Suggested fix
      Evidence: <short snippet or file:line>

### P1 - High
- [ ] **[Security]** File:Line - Issue description
      → Why it matters | Suggested fix
      Evidence: <short snippet or file:line>

### P2 - Moderate
- [ ] **[Maintainability]** File:Line - Issue description
      → Why it matters | Suggested fix

### P3 - Low
- [ ] **[Testing]** File:Line - Issue description
      → Why it matters | Suggested fix

## Summary

**Verdict**: Ready to merge | Ready with fixes | Not ready
**Reason**: <brief explanation>

**Testing Gaps**: <list any important missing tests>
**Notes**: <any additional context>
```

## Customization

Extend this skill by:

- Adjusting which review areas to emphasize
- Adding project-specific checks (linting, style guides)
- Incorporating custom quality standards
- Defining additional severity levels or categories

## Example Invocations

- `@pwrl-review` - Review current branch (defaults to `depth:standard`)
- `@pwrl-review depth:fast` - Quick scan, minimal output
- `@pwrl-review depth:deep subagents:on` - Thorough audit, spawn parallel subagents and write artifacts
- `@pwrl-review feature/new-api depth:standard` - Review specific branch with standard depth
- `@pwrl-review 123 depth:fast` - Review PR #123 with a quick scan
- `@pwrl-review https://github.com/org/repo/pull/123 depth:deep` - Review PR by URL with deep audit
