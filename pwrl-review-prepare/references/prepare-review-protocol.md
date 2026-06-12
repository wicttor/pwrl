---
name: pwrl-review-prepare Protocol
version: "1.0"
format: protocol
created: "2026-06-12"
---

# pwrl-review-prepare Protocol

**Purpose:** Prepare for code review by gathering artifacts, establishing baselines, and configuring review parameters.

**Micro-Skill:** `pwrl-review-prepare` (U3.2)

**Role in Pipeline:** Phase 2 of pwrl-review orchestrator. Review preparation.

## Input Contract

From scope artifact:

- unit_id, scope_verdict (approved)
- files_analyzed
- user_approval

## Processing Steps

### Step 1: Gather Review Artifacts

**Collect necessary files and metadata:**

1. Source branch name
2. Target branch (main, dev, release)
3. Base commit (merge-base for diff)
4. Modified files list
5. Current test results
6. Build status from CI

### Step 2: Establish Review Baseline

**Create reference for comparison:**

1. Get diff against target branch
2. Calculate LOC changes (additions, deletions)
3. File type distribution (JS, TS, test, config, etc.)
4. Complexity metrics (if available)
5. Test coverage before/after

### Step 3: Identify Review Scope

**Determine what to review:**

1. New files (full review required)
2. Modified files (diff review)
3. Test files (test quality review)
4. Documentation files (documentation review)
5. Configuration files (setup/environment review)

### Step 4: Configure Review Parameters

**Set up review checklist:**

1. Code quality checks enabled? (complexity, duplication)
2. Security analysis enabled? (depends on file types)
3. Performance review enabled? (depends on changes)
4. Documentation review enabled? (if docs changed)
5. Test coverage check enabled? (if code changed)

### Step 5: Prepare Review Tools

**Setup analysis tools:**

1. Identify linter configuration (eslint, prettier)
2. Get test suite configuration
3. Check for coverage reports
4. Identify security scanners
5. Note performance profilers (if applicable)

### Step 6: Generate Prepare Artifact

```yaml
---
format: pwrl-review-prepare-artifact
version: "1.0"
prepare_id: "2026-06-12-U2-prepare"
created_by: pwrl-review-prepare
input_scope_id: "2026-06-12-U2-scope"
---
unit_id: U2
source_branch: "feature/U2-email-validation"
target_branch: "dev"
base_commit: "abc123def456"
files_modified: 4
loc_added: 156
loc_deleted: 12
files_by_type:
  - javascript: 2
  - test: 1
  - markdown: 1
review_scope:
  code_quality: true
  security: true
  performance: false
  documentation: true
  test_coverage: true
tools_configured:
  linter: "eslint"
  formatter: "prettier"
  test_framework: "jest"
ready_for_analysis: true
```

## Error Cases & Recovery

| Error                     | Detection               | Recovery                                 |
| ------------------------- | ----------------------- | ---------------------------------------- |
| Source branch not found   | Git branch missing      | Ask user: verify branch name             |
| Target branch not found   | Can't find main/dev     | Ask user: which branch to review against |
| No diff between branches  | Branches identical      | Return to scope (no changes to review)   |
| Test suite misconfigured  | Can't run tests         | Ask user: verify test setup              |
| Coverage data unavailable | Coverage report missing | Continue without coverage comparison     |

## Output Contract

**Success:** Return prepare artifact with:

- ✓ source_branch, target_branch
- ✓ files_modified (list)
- ✓ loc_added, loc_deleted
- ✓ review_scope (enabled checks)
- ✓ tools_configured
- ✓ ready_for_analysis: true

**Failure:** Return error with:

- ✗ error_type: "branch-not-found" | "no-diff" | "tool-error"
- ✗ recovery: Suggested action

## Testing Strategy

### Test Suites (20-25 tests)

#### Suite 1: Artifact Gathering

- Source branch identified ✓
- Target branch identified ✓
- Diff calculated ✓
- File list extracted ✓

#### Suite 2: Baseline Establishment

- LOC changes calculated ✓
- File type distribution computed ✓
- Test results retrieved ✓
- Coverage baseline set ✓

#### Suite 3: Review Scope

- Code quality scope set ✓
- Security scope set ✓
- Documentation scope set ✓
- Test coverage scope set ✓

#### Suite 4: Tool Configuration

- Linter config loaded ✓
- Test framework identified ✓
- Coverage tool setup ✓
- Security scanner configured ✓

#### Suite 5: Edge Cases

- No test changes (coverage skip) ✓
- All new files (full review) ✓
- Config-only changes (reduced scope) ✓
- Large diff (>500 lines) ✓

---

**Version:** 1.0
**Created:** 2026-06-12
**Next Phase:** pwrl-review-analyze (U3.3)
