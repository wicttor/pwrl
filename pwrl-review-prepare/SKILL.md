---
name: pwrl-review-prepare
description: "Prepare code review environment, gather artifacts, and configure analysis tools."
version: 1.2.0-dev.4
argument-hint: "[scope artifact from pwrl-review-scope]"
---

# pwrl-review-prepare — Review Environment Setup

**Purpose:** Phase 2 of review workflow. Prepares the review environment by gathering diff artifacts, establishing analysis baselines, and configuring appropriate review tools based on the type of changes being reviewed.

## Interaction Method

- Minimal user interaction; primarily automates setup steps.
- Ask user only if build/test tools are missing: "Should I skip [tool] checks?"
- Use `run_in_terminal` to gather git info and detect available tools.
- Emit configuration summaries for user verification before proceeding.

## Input: Scope Artifact

Expects artifact from `pwrl-review-scope` with:

```yaml
scope_id: YYYY-MM-DD-UNN-scope
branch_name: feature/...
scope_verdict: on-target | justified | creep-detected
user_approval: true
```

## Output: Prepare Artifact

Emit prepare artifact (YAML + markdown):

```yaml
---
format: pwrl-review-prepare-artifact
version: "1.0"
prepare_id: YYYY-MM-DD-UNN-prepare
created: ISO-8601-timestamp
---

# Review Environment Preparation

## Commit & Branch Info
- Source Branch: [branch name]
- Target Branch: [main/dev]
- Base Commit: [hash]
- Head Commit: [hash]

## Code Metrics
- Files Modified: [count]
- Lines Added: [count]
- Lines Deleted: [count]
- Net Change: [+/- count]

## Modified File Types
- Source Code: [count] files
- Tests: [count] files
- Documentation: [count] files
- Configuration: [count] files
- Other: [count] files

## Review Scope Configuration

### Enabled Checks
- Code Quality: [yes/no]
- Security: [yes/no]
- Performance: [yes/no]
- Test Coverage: [yes/no]
- Documentation: [yes/no]

### Tools Configured
- Linter: [tool name] ✓
- Test Framework: [framework] ✓
- Coverage Tool: [tool] ✓
- Type Checker: [tool] ✓

## Ready for Analysis
- **Status:** ready
- **Next Skill:** pwrl-review-analyze
- **Artifacts Passed:** This prepare artifact + modified files
```

Artifact passed to `pwrl-review-analyze`.

## Workflow

### Step 1: Verify Scope Artifact

1. Check that input artifact has:
   - Valid `scope_id` and `branch_name`
   - `scope_verdict` is `on-target` or `justified` (not `creep-detected`)
   - `user_approval: true`

2. **If verification fails:**
   - Return error: "Scope not approved. Return to pwrl-review-scope."
   - Do not proceed.

### Step 2: Gather Git Information

1. **Get branch info:**
   - Source branch name (e.g., `feature/X`)
   - Target/base branch (usually `main` or `dev`)
   - Base commit hash
   - Head commit hash

2. **List modified files:**
   - Use `git diff` to get all changed files
   - Categorize: code, tests, docs, config, other

3. **Calculate metrics:**
   - Lines added / deleted per file
   - Total net change
   - Complexity indicators (very large changes, binary files, etc.)

### Step 3: Determine Review Scope

**Decide which analysis tools to enable based on file types:**

| File Type      | Triggers            | Default Checks                         |
| -------------- | ------------------- | -------------------------------------- |
| `.ts` `.js`    | Code files          | Code Quality, Security, Performance    |
| `.test.ts`     | Test files          | Test Coverage, Code Quality            |
| `.md` `.txt`   | Documentation       | Documentation, Spelling                |
| `.json` `.yml` | Configuration       | Configuration Validation               |
| Multiple       | Complex change      | All checks enabled                     |
| Config only    | Only config changes | Quality only (no performance/coverage) |

**Scope Configuration Rules:**

- **Code Quality:** Always enabled if code files modified
- **Security:** Always enabled if code files modified
- **Performance:** Enabled if complex changes or large LOC additions
- **Test Coverage:** Enabled if code modified AND test files present
- **Documentation:** Enabled if docs modified or LOC > 50
- **Complexity Analysis:** Enabled if LOC > 200 or 10+ files

### Step 4: Configure Analysis Tools

**For each enabled check, verify tool availability:**

1. **Code Quality:**
   - Detect linter (eslint, pylint, etc.)
   - Verify configuration exists
   - Test run linter on modified files
   - Status: `✓ configured` or `⚠ not found`

2. **Security:**
   - Detect security scanner (snyk, OWASP, etc.)
   - Verify can scan modified files
   - Status: `✓ configured` or `⚠ not found`

3. **Test Coverage:**
   - Detect test framework (jest, pytest, etc.)
   - Verify test files exist and pass
   - Calculate coverage for modified code
   - Status: `✓ configured` or `⚠ not found`

4. **Type Checking:**
   - Detect type checker (tsc, mypy, etc.)
   - Run on modified files
   - Status: `✓ configured` or `⚠ not found`

**If tool not available:**

- Ask user: "I didn't find [tool]. Should I skip this check?"
- If skip: mark as disabled in config
- If user wants it: ask for path to tool

### Step 5: Check Environment

1. **Build environment:**
   - Can build the project? (try `npm build` or equivalent)
   - Dependencies installed?
   - All imports resolvable?

2. **Test environment:**
   - Can run tests? (try `npm test` or equivalent)
   - Tests discoverable?

3. **Tool environment:**
   - All configured tools in PATH?
   - Correct versions installed?

**If errors detected:**

- List them for user awareness
- Suggest: "Some tools may not be available. Continue anyway?"
- User can proceed or abort

### Step 6: Generate Prepare Artifact

Create prepare artifact with:

- All commit/branch info
- Metrics summary
- Tool configuration matrix
- Ready flag for next skill

**Emit artifact to console/file for next skill.**

## Error Handling

| Error                     | Recovery                                              |
| ------------------------- | ----------------------------------------------------- |
| Scope not approved        | Return error; direct to pwrl-review-scope             |
| Invalid branch/commit     | Ask user to verify branch name and status             |
| No modified files         | Return error; no changes to review                    |
| Build fails               | Ask user to fix build; optionally skip check          |
| Tools not found           | Ask user to skip or install; proceed if user confirms |
| Metrics calculation fails | Continue with partial metrics                         |

## Testing Coverage

Test file: `tests/pwrl-review/prepare-setup.test.ts`

**Happy Path Tests:**

- ✅ Standard code changes (code + tests)
- ✅ Config-only changes (no performance/coverage checks)
- ✅ Docs-only changes (minimal checks)
- ✅ Large refactor (all checks enabled)

**Edge Cases:**

- ✅ No test files (coverage skipped)
- ✅ No linter config (quality check skipped)
- ✅ Build fails (user prompted)
- ✅ Git access fails (error with recovery)
- ✅ Binary files present (handled)

**Output Validation Tests:**

- ✅ Artifact structure complete
- ✅ Metrics accurate
- ✅ Tool configuration valid
- ✅ Ready flag set correctly
