---
name: pwrl-work-ship
description: Finalize, approve, and ship completed work
argument-hint: "[Reviewed tasks from pwrl-work-review]"
---

# pwrl-work-ship — Finalization & Shipping

**Purpose:** Terminal phase of the work execution workflow. Runs final quality checks (targeted tests, linting, formatting), reviews the diff for regressions and scope drift, obtains user approval, creates the final commit, and offers the end-session workflow.

## Input

Accepts review summary from `pwrl-work-review`:

```yaml
readyForShipping: true
duplicationsConsolidated: 3
helpersExtracted: 2
systemChecks:
  eventTriggering: pass
  mockCoverage: warning
  idempotency: pass
  alternateEntryPoints: pass
designSpecDeltas: 0
recommendations:
  - "Add 2 integration tests for mock coverage"
```

## Output: Shipping Result

```yaml
success: true
status: shipped
branch: feat/pwrl-work-agent
commitHash: a1b2c3d4
commitMessage: "feat(pwrl-work): slice skill into micro-skills"
tasksShipped: 11
testResults:
  testsPassed: 127
  testsFailed: 0
  coverage: 92
qualityChecks:
  linting: pass
  formatting: pass
  diffReview: pass
endSessionOffered: true
nextSteps:
  - "Create pull request at [URL]"
  - "Document learnings with /pwrl-learnings"
```

---

## Workflow

### 1. Run Final Targeted Test Suite

Run tests only for affected areas (not full suite):

**Identify affected test files:**
1. From `git diff --name-only <base>...HEAD`, find changed source files
2. Map each to its corresponding test file (e.g., `src/utils.ts` → `src/utils.spec.ts`)
3. Build minimal test file list

**Run targeted suite:**
```bash
# If using npm:
npm test -- <test-files-1> <test-files-2> ...

# If using jest directly:
npx jest <test-files> --coverage
```

**Evaluate results:**
- ❌ If any test fails: show failure output, stop shipping, ask user to fix
- ✅ If all tests pass: log results and continue

```yaml
Final Test Suite:
  Files tested: 8
  Tests run: 127
  Tests passed: 127
  Tests failed: 0
  Coverage: 92%
  Result: PASS
```

### 2. Verify Linting & Formatting

Check code quality per project configuration:

**Detect config:**
- ESLint: `.eslintrc.*` or `eslintConfig` in `package.json`
- Prettier: `.prettierrc*` or `prettier` in `package.json`
- If neither: skip this step (log "No lint/format config found")

**Run linting:**
```bash
# If ESLint configured:
npx eslint . --max-warnings 0

# Capture violations:
# For each: file:line:col - rule - message
```

**Run formatting check (read-only, no auto-fix):**
```bash
# If Prettier configured:
npx prettier --check .
```

**Handle violations:**
- If violations found:
  - Show formatted list: file, line, rule, message
  - Ask: "Auto-fix formatting violations? (yes/no)"
  - If yes: `npx prettier --write .` and `npx eslint . --fix`
  - If no: ask user to fix manually before shipping
- If no violations: continue

```yaml
Linting & Formatting:
  Lint errors: 0
  Lint warnings: 0
  Formatting violations: 0
  Result: PASS
```

### 3. Review Diff for Regressions & Scope Drift

**Get diff:**
```bash
git diff --stat <base-branch>...HEAD
git diff <base-branch>...HEAD
```

**Check scope drift:**
- Expected files: collected from all tasks' `files` fields
- Unexpected files: those in diff but not in any task's file list
- If unexpected files found: ask user "File [path] was modified but isn't in any task. Was this intentional?"
  - If no: suggest reverting the unrelated change
  - If yes: log as scope exception

**Check for regressions:**
- Deleted production code: is this intentional?
- Modified/deleted tests: are tests being weakened? (warning)
- API contract changes: new required params, removed fields

**Present summary:**
```
Diff Summary:
  Files modified: 12
  Files added: 2
  Files deleted: 0
  Total: +450 / -120 LOC

  Expected files (from task list):
    ✓ src/validation.ts (+150 LOC)
    ✓ src/user.ts (+80 LOC)

  Unexpected files: None ✓
  Deleted production code: None ✓
  Test modifications: None ✓
  API breaking changes: None ✓
```

### 4. User Approval Checkpoint

Present final summary and ask for confirmation:

---

```
═══════════════════════════════════════════════════════════
READY TO SHIP
═══════════════════════════════════════════════════════════

Tasks: 11 (S1-S11)
Branch: feat/pwrl-work
Tests: 127 passed (92% coverage) ✓
Linting: No errors ✓
Formatting: No violations ✓
Diff: 12 files, +450/-120 LOC, no regressions ✓

Commit Message:
  Implement S1-S7: Slice pwrl-work into micro-skills
  - S1: Analyze pwrl-work structure
  - S2: Extract triage logic
  - S3: Extract prepare logic
  - S4: Create GitHub sync utility
  - S5: Extract execute logic
  - S6: Extract review logic
  - S7: Extract ship logic
═══════════════════════════════════════════════════════════

Ready to commit and push?

Options:
  ✅ Yes, ship it
  🔄 Review diff again
  📋 Review/edit commit message
  ❌ Cancel
```

**Handle each option:**
- **Yes:** Proceed to staging and committing
- **Review diff:** Show diff, then ask approval again
- **Review commit message:** Show/edit message, then ask approval again
- **Cancel:** Exit gracefully, offer to save work as draft

### 5. Stage and Commit

**Stage all changes:**
```bash
git add .
# Verify:
git status --short
```

**Create commit message:**
- Format: Conventional commits (`feat/`/`fix/`/`docs/`/`refactor/`/...)
- Short description: `feat(pwrl-work): slice skill into micro-skills`
- Body: List of unit IDs with brief descriptions
- Include: "Closes #[issue]" if linked in plan

**Commit:**
```bash
git commit -m "feat(pwrl-work): slice skill into micro-skills

Implement S1-S7: [summary]
- S1: Analyze pwrl-work structure
- S2: Extract triage logic
..."
```

**Capture:**
- Commit hash: `git rev-parse HEAD`
- Log: `Created commit [hash]`

**Error handling:**
- Commit fails → show error output
- Pre-commit hooks fail → show violations, ask user to fix
- Offer retry after resolving

### 6. Push and Branch Management

**Push to remote:**
```bash
git push origin <branch-name>
```

**Verify push:**
```bash
git log --oneline -n 1            # local
git log --oneline origin/<branch> -n 1  # remote
```

**Offer next steps:**
- If PR/MR workflow: "Create pull request: [URL template]"
- If direct merge workflow: "Merge to main: `git merge <branch>`"

**Error handling:**
- Push fails (network) → offer retry
- Push fails (permissions) → show error, suggest manual push
- Branch protection violated → show violation, ask user to resolve

### 7. Offer End-Session Workflow

After successful shipping:

---

```
═══════════════════════════════════════════════════════════
SESSION SUMMARY
═══════════════════════════════════════════════════════════

Plan: 2026-06-05-002-slice-pwrl-work-skill.md
Tasks Completed: 11 (S1-S11)

Deliverables:
  ✓ 6 new micro-skills (triage, prepare, execute, review, ship, sync)
  ✓ 1 new agent (pwrl-work.agent.md)
  ✓ Updated fallback logic in pwrl-work skill
  ✓ Documentation and examples

Tests: 127 passed (92% coverage) ✓
Code Quality: No lint/format violations ✓

Commit: a1b2c3d - feat(pwrl-work): slice skill into micro-skills
Branch: feat/pwrl-work
Status: ✓ Pushed to remote
═══════════════════════════════════════════════════════════

Would you like to use /pwrl-end-session to create a summary commit
and document learnings from this work?

Options:
  ✅ Yes, run end-session
  ❌ No, handle manually
```

**If yes:** Call `/pwrl-end-session` skill with session summary.
**If no:** Offer alternatives:
- `/pwrl-learnings` to document discoveries
- `/pwrl-plan` for next planning session

---

## Error Handling

| Scenario | Handling |
|---|---|
| Final test fails | Stop shipping, show failures, ask user to fix |
| Lint errors found | Show violations, ask user to fix or accept |
| Formatting violations | Offer auto-fix, or ask user to fix manually |
| Scope drift detected | Ask user to explain or revert unrelated changes |
| Git commit fails | Show error, ask user to resolve git state, retry |
| Git push fails | Show error, offer retry or manual push |
| User cancels at approval | Exit gracefully, offer to save as draft |

**Recovery options:**
- Fix issues and retry shipping (re-run from Step 1)
- Accept minor issues with explicit confirmation
- Cancel and continue working on branch

---

## Quality Gates

- ✅ Tests pass for all affected areas
- ✅ Linting/formatting clean (or explicitly accepted)
- ✅ No regressions or scope drift detected
- ✅ User explicitly approves commit
- ✅ Commit created and pushed successfully
- ✅ End-session workflow offered

---

## Dependencies

- **pwrl-work-review (S6)** — Consumes review summary and task results
- **Git** — For diff, staging, committing, pushing
- **Test framework** — For final targeted test run
- **Linter/Formatter** — For code quality verification (if configured)
- **pwrl-end-session** — For optional session finalization

## References

- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **Source Phase 4:** Installed `pwrl-work` skill (Phase 4: Ship, lines 186-194)
- **Previous Skill:** `pwrl-work-review` (S6)
- **Related:** `/pwrl-end-session` for session finalization
