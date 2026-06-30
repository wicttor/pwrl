---
name: pwrl-work-review
description: Review, simplify, and consolidate code after execution
argument-hint: "[Executed tasks from pwrl-work-execute, design specs (optional)]"
version: 1.7.0-dev.1
---

# pwrl-work-review — Code Simplification & System Review

## Interaction Method

- Use platform's `ask_user_question`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "Should the implementation be reviewed? Confirm scope match, test coverage, and code quality."
- Provide clear recovery suggestions when errors occur

## Pre-Flight Guard

Assert that the input task file is in `docs/tasks/for-review/`.

If the file is in any other folder, refuse to proceed with a recovery message.

If the file is in `docs/tasks/in-progress/`, refuse: "Task is not in for-review/. Lifecycle contract violation. Refusing to review."

**Cross-reference:** see [`pwrl-work/SKILL.md` §"Task Lifecycle Contract"](../pwrl-work/SKILL.md#task-lifecycle-contract).

## Responsibility Boundary

**This skill OWNS the `for-review → in-progress` transition (rework loop).**

**This skill MUST NOT perform the `for-review → done` transition.** That is the exclusive responsibility of `pwrl-review-report`.

For the canonical ownership table, see [`pwrl-work/references/workflow-details.md` §"Task Status Transitions"](../pwrl-work/references/workflow-details.md#task-status-transitions-docstasks).

**Purpose:** Review code after execution to consolidate duplication, extract shared helpers, run system-wide consistency checks, compare UI implementations to design specs (when applicable), and determine readiness for shipping.

## Input

Accepts execution results from `pwrl-work-execute`:

```yaml
mode: serial
taskCount: 5
tasksCompleted: 5
results:
  - unit-id: S1
    taskFile: docs/tasks/for-review/...
    status: for-review
    testsPassed: true
    files: [src/utils.ts, src/api.ts]
```

Optional: design spec references for UI work (e.g., Figma links, `docs/design/` files).

## Output: Review Summary

```yaml
duplicationFound: true
duplicationsConsolidated: 3
helpersExtracted: 2
helperNames: [isValidEmail, parseUserInput]
LOCReduced: 120
systemChecks:
  eventTriggering: pass
  mockCoverage: warning
  idempotency: pass
  alternateEntryPoints: pass
designSpecDeltas: 0
refactoringScope: controlled
readyForShipping: true
recommendations:
  - "Add 2 integration tests for mock coverage"
```

---

## Workflow

### 1. Identify Modified Files

After every 2-3 related tasks:

1. Collect files affected by the completed tasks:
   - From each task's `files` field in execution results
   - From `git diff` against base branch: `git diff --name-only <base>...HEAD`
2. Build a consolidated list of files modified by these tasks
3. Focus review ONLY on these files (scope control)

### 2. Detect Duplication

Scan modified files for code duplication:

**Approach:**

1. For each modified file, look for:
   - Identical code blocks (same logic, same structure)
   - Similar patterns with different variable names
   - Copy-paste code (identical comments, same ordering)

2. Cross-file duplication:
   - Compare files modified by different tasks
   - If two tasks modified different files with similar logic → candidate

3. For each candidate, show:
   - Location (file:lines)
   - Code snippet (before)
   - Proposed consolidation (after)
   - LOC reduction estimate

**Example:**

```
Found duplication between src/user.ts:45 and src/signup.ts:72:
  Both validate email with same regex: /^[^@]+@[^@]+\.[^@]+$/
  Proposed: Extract isValidEmail() to src/validation.ts
  LOC reduction: 12 lines
```

**Decision:**

- Ask user: "Extract helper? (yes/no/skip)"
- If yes: proceed to Step 3 (Helper Extraction)
- If no or skip: log as noted for future refactoring

### 3. Extract Helpers

For confirmed candidates, extract shared logic:

**When to extract:**

- Code appears 2+ times across modified files
- Extraction improves readability (function name self-documents)
- Extraction improves testability

**When NOT to extract (YAGNI):**

- Code appears only once
- Extract adds indirection without benefit
- Extract would create complex API (too many parameters)

**Extraction process:**

1. Design helper:
   - Name: clear verb/noun describing what it does
   - Parameters: minimal set needed
   - Return value: typed and documented

2. Create helper file (or add to existing shared module):
   - If no shared module exists: create one (e.g., `src/utils.ts`, `src/validation.ts`)
   - If shared module exists: add helper to it

3. Write tests for helper (test-first):
   - Test normal case
   - Test edge cases (empty, null, boundary)
   - Test error handling

4. Replace call sites:
   - Replace duplicate code blocks with helper call
   - Update all references

5. Run tests:
   - Verify all tests still pass
   - Log: "Extracted [helperName] → [file], replaced [N] call sites, -[M] LOC"

### 4. Run System Checks

After simplifying, verify system consistency. The four checks (Event/Observer/Callback Triggering, Mock vs. Real Interaction Balance, Idempotency & Cleanup Safety, Alternate Entry Points) and the log-result format are documented in [`references/system-checks.md`](references/system-checks.md).

### 5. Compare to Design Specs (UI Work Only)

For tasks involving UI/component changes:

**If design specs exist:**

- Read from `docs/design/` or linked Figma file
- Compare: layout, spacing, colors, typography, responsive behavior
- Classify each delta:

| Severity | Meaning                                     | Action           |
| -------- | ------------------------------------------- | ---------------- |
| Minor    | Within 2px, slightly different shade        | Acceptable, note |
| Moderate | Wrong component variant, minor layout shift | Should fix       |
| Critical | Completely wrong layout, broken responsive  | Must fix         |

**If no design specs:**

- Skip this step entirely
- Log: "No design specs found; skipping visual comparison"

### 6. Control Refactoring Scope

**Golden Rule: Only simplify code that was changed by executed tasks.**

**Do:**

- Simplify code you just wrote
- Extract helpers from duplications you introduced
- Fix obvious bugs in modified code
- Improve tests for changed behavior

**Do NOT:**

- Refactor unrelated modules
- Do "while we're here" cleanup
- Change naming/style for consistency in untouched code

**Enforcement:**

- Build list of affected files from task execution results
- If scope check finds a change to an unrelated file:
  - Warn: "File [path] was modified but is not in any task's files list"
  - Ask: "Remove this unrelated change before shipping? (yes/no)"

### 7. Produce Review Summary

```yaml
duplicationFound: true
duplicationsConsolidated: 2
helpersExtracted: 1
helperNames: [isValidEmail]
LOCReduced: 34
systemChecks:
  eventTriggering: pass
  mockCoverage: warning
  idempotency: pass
  alternateEntryPoints: pass
refactoringScope: controlled
readyForShipping: true
approved: true | false
changesRequested: true | false
rejected: true | false
recommendations:
  - "Add 2 integration tests with real DB for user module"
```

The new flags `approved`, `changesRequested`, and `rejected` are set by the user at the end of the review (Step 8) and drive the rework-loop transition. The flags are mutually exclusive — set at most one to `true`.

If `readyForShipping` is true, work is ready for pull request creation.

### 8. Handle Rework Loop

Read the current `Review Summary` artifact and branch on the user verdict. Use a 4-option `ask_user_question` (Approve / Request changes / Reject / Defer) to make the verdict explicit.

**If `approved: true`:** do nothing — the file remains in `for-review/`. The next pipeline step, `pwrl-review-report`, will handle the `→ done` transition.

**If `changesRequested: true`:**

- **CRITICAL: Move task file** `for-review/` → `in-progress/`
  - Read the task file from `for-review/` folder
  - Update frontmatter status: `status: for-review` → `status: in-progress`
  - Write the updated file to `in-progress/` with same filename
  - Delete original from `for-review/`
  - Log: `Task returned for rework: docs/tasks/for-review/[file] → docs/tasks/in-progress/[file]`
- Add a "Review Findings" section to the task body listing the action items
- The next `/pwrl-work` loop will pick it up from `in-progress/`

**If `rejected: true`:** do not move the file (per the `explicit-review-verdict-flow-2026-06-16.md` pattern, REJECTED leaves the file in `for-review/`). Add a "Review Findings" section explaining why the change is unfixable in its current form.

**If neither flag is set:** ask the user "Did the review approve, request changes, or reject?" before taking action.

---

## Optional Deep Review Mode

For complex or high-risk changes, deep review adds Performance, Security, Accessibility, API-contract, and DB-migration checks. Full list of dimensions and the `--deep` flag usage are in [`references/deep-review-and-error-handling.md`](references/deep-review-and-error-handling.md#optional-deep-review-mode). For detailed analysis, use the dedicated `/pwrl-review` skill.

---

## Error Handling

Full error-handling table is in [`references/deep-review-and-error-handling.md`](references/deep-review-and-error-handling.md#error-handling).

---

## Dependencies

- **pwrl-work-execute (S5)** — Consumes executed task results
- **Git** — For diff analysis
- **File system** — For reading/writing modified files
- **Test framework** — For verifying helpers and consolidations

## References

- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **Source Phase 3:** Installed `pwrl-work` skill (Phase 3: Simplify & Review, lines 173-185)
