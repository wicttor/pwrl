---
unit-id: S7
plan: docs/plans/2026-06-05-002-slice-pwrl-work-skill.md
status: for-review
created: 2026-06-05
type: PWRL Task
dependencies: [S1, S6]
files:
  - pwrl-work-ship/SKILL.md
learnings:
  - docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md
---

# Task S7: Extract Shipping & Approval Logic (U6)

## Goal

Create the `pwrl-work-ship` micro-skill that finalizes work, runs final quality checks, obtains user approval, creates and pushes the final commit, and offers the end-session workflow.

## Context

From S1 analysis, Phase 4 (Ship) is the final workflow phase:
1. Run final targeted checks (tests, lint/format)
2. Review diff for regressions and scope drift
3. Request user approval
4. Stage, commit, and push
5. Offer end-session workflow

This skill marks work completion and prepares for session finalization.

## Related Learnings

- **Skill Decomposition & Agent Orchestration** (`docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md`):
  - Terminal phase pattern: final checks before shipping
  - User approval checkpoint: "Are you ready to ship?"
  - Integration with end-session workflow
  - Applicability: Guides shipping logic and approval handling

## Implementation Steps

### Step 1: Create Skill Directory and Frontmatter

- Create directory: `pwrl-work-ship/`
- Create file: `pwrl-work-ship/SKILL.md`
- Add frontmatter:

```yaml
---
name: pwrl-work-ship
description: Finalize, approve, and ship completed work
argument-hint: "[Reviewed tasks from pwrl-work-review]"
---
```

### Step 2: Document Purpose Section

Add "Purpose" section explaining:
- Final targeted quality checks
- Diff review for regressions and scope drift
- User approval checkpoint
- Staging, committing, and pushing
- End-session workflow offer
- Output: shipping status, commit hash, next steps

### Step 3: Implement Final Targeted Test Suite Run

Add final test verification:

```markdown
#### Final Targeted Test Suite

**Run tests for affected areas only (NOT full suite):**

1. Identify affected test files:
   - From git diff: which source files changed?
   - Find corresponding test files (e.g., `src/utils.ts` → `src/utils.spec.ts`)
   - Build list of test files to run

2. Run targeted test suite:
   - Command: `npm test -- <affected-test-files>` (or equivalent)
   - Run tests
   - Collect results: pass/fail, test count, coverage

3. Verify all tests pass:
   - ❌ If any test fails: show failure output, ask user to fix before shipping
   - ✅ If all tests pass: continue to next check

4. Log result:
   ```
   Final Test Suite:
     Files tested: 8
     Tests run: 127
     Tests passed: 127
     Coverage: 92%
     Result: ✓ PASS
   ```
```

### Step 4: Implement Linting and Formatting

Add code quality checks:

```markdown
#### Linting & Formatting Verification

**Run per project configuration:**

1. Check project config:
   - Read `.eslintrc.json`, `prettier.config.js`, or equivalent
   - Determine if linting/formatting is required

2. Run linting:
   - Command: `npm run lint` (or equivalent)
   - Capture output: any warnings or errors
   - For each violation: file, line, rule

3. Run formatting check:
   - Command: `npm run format:check` (or equivalent, no auto-fix)
   - Capture output: any formatting issues

4. Report violations:
   - If violations found:
     - Show list of violations
     - Ask user: "Should I auto-fix formatting? (yes/no)"
     - If yes: run `npm run format` and verify
     - If no: ask user to fix manually before shipping
   - If no violations: continue

5. Log result:
   ```
   Linting & Formatting:
     Lint errors: 0
     Lint warnings: 0
     Formatting violations: 0
     Result: ✓ PASS
   ```
```

### Step 5: Implement Diff Review

Review changes for regressions and scope drift:

```markdown
#### Diff Review

**Review all changes for safety:**

1. Get full diff:
   - Command: `git diff origin/main...HEAD` (or equivalent)
   - Summarize changes by file and type

2. Check for scope drift:
   - Expected files: those from task list
   - Actual files: from git diff
   - If unexpected files modified: ask user "Why were [files] modified? (unrelated scope drift?)"

3. Check for regressions:
   - Deleted code: is this intentional? (ask user to confirm)
   - Modified tests: are tests loosened or removed? (ask user to confirm)
   - API changes: are these breaking changes? (warn if public APIs changed)

4. Provide summary to user:
   ```
   Diff Summary:
     Files modified: 12
     Files added: 2
     Files deleted: 0
     Total LOC changes: +450 / -120
     
   Modified files (expected):
     ✓ src/validation.ts (+150 LOC)
     ✓ src/user.ts (+80 LOC)
     ...
   
   Added files (new):
     ✓ src/helpers.ts (+100 LOC)
   
   No unexpected files detected ✓
   No deleted tests ✓
   No API breaking changes ✓
   ```

5. Request review confirmation:
   - Ask user: "Does diff look correct?"
   - If no: allow user to cancel or review specific changes
   - If yes: proceed to approval
```

### Step 6: Implement User Approval Checkpoint

Add final "ready to ship?" confirmation:

```markdown
#### User Approval Checkpoint

**Final confirmation before commit:**

1. Summarize all work:
   ```
   ═══════════════════════════════════════════════════════════
   READY TO SHIP
   ═══════════════════════════════════════════════════════════
   
   Tasks Completed: 11 (S1-S11)
   Branch: feat/pwrl-work-agent
   Tests: 127 passed ✓
   Linting: No errors ✓
   Formatting: No violations ✓
   Diff: 12 files, +450/-120 LOC ✓
   
   Commit Message:
     Implement S1-S7: Slice pwrl-work into micro-skills
     - S1: Analyze pwrl-work structure
     - S2: Extract triage logic
     - S3: Extract prepare logic
     - ...
   
   ═══════════════════════════════════════════════════════════
   ```

2. Ask for final approval:
   ```
   Ready to commit and push?
   
   Options:
     ✅ Yes, ship it
     🔄 Review diff again
     📋 Review commit message
     ❌ Cancel (don't ship)
   ```

3. If user selects "Cancel":
   - Log cancellation
   - Offer to save work as draft
   - Exit gracefully (no changes committed)

4. If user selects "Review diff" or "Review commit message":
   - Show relevant information
   - Ask approval again
```

### Step 7: Implement Staging and Committing

Create the final commit:

```markdown
#### Staging & Committing

**Stage and commit all changes:**

1. Stage all changes:
   - Command: `git add .`
   - Verify: `git status` shows staged changes
   - Log: "Staged [N] files with [X] LOC changes"

2. Create commit message:
   - Format: Conventional commits (feat/fix/docs/refactor/...)
   - Example: "feat(pwrl-work): slice skill into micro-skills"
   - Include unit IDs: Add list of units completed (S1, S2, ...)
   - Include summary: 1-2 line explanation
   - Include body (if complex): Detailed explanation and rationale

3. Commit:
   - Command: `git commit -m "<message>"`
   - Capture commit hash
   - Log: "Created commit [hash] - feat(pwrl-work): ..."

4. Handle errors:
   - If commit fails: show git error, ask user to resolve
   - If pre-commit hooks fail: show violations, ask user to fix
```

### Step 8: Implement Push and Branch Management

Push changes to remote:

```markdown
#### Push & Branch Management

**Push to remote branch:**

1. Push changes:
   - Command: `git push origin [branch-name]`
   - Log push output

2. Verify push:
   - Command: `git log --oneline -n 1` (verify local)
   - Command: `git log --oneline origin/[branch] -n 1` (verify remote)
   - Compare: local and remote should match

3. Offer next steps:
   - If PR/MR workflow: "Create pull request at [PR-URL-template]"
   - If direct merge workflow: "Merge to main with command: git merge [branch-name]"

4. Handle errors:
   - If push fails (network, permissions): show error, offer retry
   - If branch protection rules violated: show violation, ask user to resolve

5. Log push result:
   ```
   Pushed to remote:
     Branch: feat/pwrl-work-agent
     Commits: 1 ([hash])
     Remote URL: github.com/wicttor/pwrl
     Status: ✓ Success
   ```
```

### Step 9: Implement End-Session Workflow Offer

Offer comprehensive session summary:

```markdown
#### End-Session Workflow Offer

**After successful shipping:**

1. Summarize work:
   ```
   ═══════════════════════════════════════════════════════════
   SESSION SUMMARY
   ═══════════════════════════════════════════════════════════
   
   Plan Executed: 2026-06-05-002-slice-pwrl-work-skill.md
   Tasks Completed: 11 (S1-S11)
   Work Duration: [start-end time]
   
   Deliverables:
     ✓ 6 new micro-skills (triage, prepare, execute, review, ship, sync)
     ✓ 1 new agent (pwrl-work.agent.md)
     ✓ Updated fallback logic in pwrl-work skill
     ✓ Documentation and examples
     ✓ Comprehensive test coverage
   
   Tests: 127 passed ✓
   Code Quality: No lint errors, no formatting violations ✓
   
   Commit: [hash] - feat(pwrl-work): slice skill into micro-skills
   Branch: feat/pwrl-work-agent
   Status: ✓ Pushed to remote
   
   ═══════════════════════════════════════════════════════════
   ```

2. Offer end-session workflow:
   ```
   Would you like to use `/pwrl-end-session` to create a summary commit
   and document learnings from this work?
   
   Options:
     ✅ Yes, run end-session
     ❌ No, I'll handle it manually
   ```

3. If user selects "Yes":
   - Call `/pwrl-end-session` skill
   - Pass summary and learnings from this work
   - Offer to document learnings

4. If user selects "No":
   - Offer to update learnings with `/pwrl-learnings`
   - Offer to create next plan with `/pwrl-plan`
```

### Step 10: Document Output Schema

```markdown
### Output

After successful shipping, return:

```json
{
  "success": true,
  "status": "shipped",
  "branch": "feat/pwrl-work-agent",
  "commitHash": "a1b2c3d4e5f6",
  "commitMessage": "feat(pwrl-work): slice skill into micro-skills",
  "tasksShipped": 11,
  "testResults": {
    "testsPassed": 127,
    "testsFailed": 0,
    "coverage": 92
  },
  "qualityChecks": {
    "linting": "pass",
    "formatting": "pass",
    "diffReview": "pass"
  },
  "endSessionOffered": true,
  "nextSteps": [
    "Create pull request at [URL]",
    "Document learnings with /pwrl-learnings",
    "Review and merge after approval"
  ]
}
```
```

### Step 11: Add Error Handling

Handle shipping failures:

```markdown
#### Error Scenarios

| Scenario                           | Handling                                              |
| ---------------------------------- | ----------------------------------------------------- |
| Final test fails                   | Stop shipping, show failures, ask user to fix         |
| Lint errors found                  | Stop shipping, show errors, ask user to fix           |
| Formatting violations found        | Ask user to auto-fix or fix manually                  |
| Diff review finds scope drift      | Ask user to explain or remove unrelated changes       |
| Git commit fails                   | Show error, ask user to resolve git state, retry      |
| Git push fails                     | Show error, offer retry or manual push                |
| User cancels at approval           | Gracefully exit, offer to save work as draft          |

**Recovery Options:**
- User can fix issues and retry shipping
- User can accept minor issues (with confirmation)
- User can cancel and continue working
```

## Test Scenarios

**Test 1: All Checks Pass**
- Input: Reviewed tasks, all checks ready
- Expected: Final tests pass, no lint errors, diff clean, user approves
- Acceptance: Commit created, pushed, success returned

**Test 2: Test Failure on Final Run**
- Input: Task with failing test
- Expected: Test failure detected, shipping stopped
- Acceptance: Error shown; user offered to fix

**Test 3: Lint Violations**
- Input: Code with lint violations
- Expected: Violations detected, user offered auto-fix option
- Acceptance: Auto-fix applied or user asked to fix manually

**Test 4: Scope Drift Detected**
- Input: Diff includes unrelated files
- Expected: Scope drift warning, user asked to explain
- Acceptance: User can remove or explain unexpected files

**Test 5: User Cancels at Approval**
- Input: User selects "Cancel" at final approval
- Expected: Shipping halted gracefully
- Acceptance: No commit/push; work preserved

**Test 6: Successful Commit and Push**
- Input: All checks pass, user approves
- Expected: Commit created with proper message, pushed to remote
- Acceptance: Commit hash returned; push verified

**Test 7: End-Session Offered**
- Input: Successful shipping complete
- Expected: End-session workflow offered to user
- Acceptance: User can accept or decline

**Test 8: Git Push Failure (Network)**
- Input: Network failure during push
- Expected: Push error caught, retry offered
- Acceptance: Error shown; user can retry

## Acceptance Criteria

✅ Skill runs final targeted test suite (not full suite)  
✅ Skill verifies linting and formatting per project config  
✅ Skill reviews diff for regressions and scope drift  
✅ Skill obtains user approval before shipping  
✅ Skill stages, commits, and pushes changes  
✅ Skill handles all error scenarios gracefully (no crashes)  
✅ Skill offers end-session workflow after successful ship  
✅ Commit message includes unit IDs and clear description  
✅ All checks pass before committing  
✅ Ready for integration with S8 (orchestrator) and end-session workflow

## References

- **Plan:** `docs/plans/2026-06-05-002-slice-pwrl-work-skill.md` (Unit U6 definition)
- **S1 Analysis:** `docs/analysis/2026-06-05-pwrl-work-structure-analysis.md`
- **S6 Output:** Reviewed tasks (readiness for shipping)
- **Related:** `/pwrl-end-session` skill for session finalization
