# PWRL Review: GitHub Integration Analysis

**Date:** 2026-06-24
**Analysis:** Current GitHub capabilities in `pwrl-review` + synchronization opportunities
**Target:** Enable review findings to sync back to GitHub PRs

---

## Executive Summary

The `pwrl-review` workflow currently:
- ✓ Accepts PR numbers as input (scope validation entry point)
- ✓ Has read-only GitHub API capabilities (files, commits, metadata)
- ✓ Generates detailed review verdicts (APPROVED/REQUEST CHANGES/REJECTED)
- ❌ Cannot post reviews, comments, or status back to GitHub
- ❌ No PR metadata stored in artifacts
- ❌ No sync mechanism after final report generation

**Recommendation:** Create `pwrl-review-sync-status` skill (paralleling existing `pwrl-work-sync-status`) to post review findings back to GitHub PRs as comments and formal reviews.

---

## 1. EXISTING GITHUB CAPABILITIES

### PR Number Input Acceptance

| Aspect | Status | Details |
|--------|--------|---------|
| **Entry point** | ✓ Accepts | `pwrl-review-scope` argument-hint: `[branch name, unit ID, or PR number]` |
| **Usage examples** | ✓ Works | `/pwrl-review feature/email-validation` or `/pwrl-review 123` |
| **Resolution logic** | ❌ Missing | No explicit PR→branch mapping; focus is on branch names |
| **Config support** | ✓ Partial | `.pwrlrc.json` has `github.owner` and `github.repo` |

### GitHub-Related Fields in Artifacts

**Scope Artifact (Phase 1) — NO GitHub fields:**
```yaml
scope_id, branch_name, unit_id, scope_verdict, user_approval
```

**Prepare Artifact (Phase 2) — NO GitHub fields:**
```yaml
prepare_id, files_modified, review_scope, tools_configured
```

**Analyze Artifact (Phase 3) — NO GitHub fields:**
```yaml
analyze_id, findings, critical_issues, major_issues, minor_issues, recommendation
```

**Report Artifact (Phase 4) — NO GitHub fields:**
```yaml
report_id, verdict, quality_score, code_quality_score, security_score,
test_coverage_score, documentation_score, signed_by, approval_date
```

**⚠️ Gap:** No `pr_number`, `pr_metadata`, or reference back to GitHub PR in any artifact.

### Current GitHub API Capabilities

**Available functions in `lib/github-integration.js`:**

| Function | Purpose | Used In |
|----------|---------|---------|
| `getPullRequest(owner, repo, prNumber)` | Fetch PR metadata | Not used in review |
| `getPullRequestFiles(owner, repo, prNumber)` | Get modified files | Not used (git diff used instead) |
| `getCommits()` | Get commit history | Available but not used |
| `extractRepoInfoFromGit()` | Parse git remote | Available |
| `getModifiedFiles()` | Git-based file list | Available |
| `makeGitHubRequest()` | Generic API calls | Foundation for all |

**Missing functions:**
- ❌ `createPullRequestReview()` — post formal review
- ❌ `postPullRequestComment()` — post comment
- ❌ `updatePullRequestLabels()` — manage labels
- ❌ `updateCommitStatus()` — update check status
- ❌ `requestReview()` — request reviewers

### PR Data Actually Used in Review Workflow

**Currently leveraged:**
1. **Branch name** — triggers scope validation (if PR number provided)
2. **Modified files** — obtained via `git diff`, not PR API
3. **Unit/task context** — looks up `docs/tasks/` for requirements

**NOT currently used:**
- PR title, description, or body
- PR author or assignees
- PR labels, milestone, or draft status
- Existing reviews or comments
- Review conversation history

---

## 2. GITHUB FLOW PATTERNS

### Pattern 1: Task Status Sync (Existing Model)

**Via `pwrl-work-sync-status`:**

```
Task Status Change
      ↓
pwrl-work-sync-status
      ↓
Update GitHub Issue:
  - Add/remove status labels (to-do, in-progress, for-review, done, blocked)
  - Post status comment (🚀, 🔍, ✅, 🚫)
  - Close issue if done
```

**Integration control:**
```json
{
  "integrations": {
    "githubIssues": true,
    "github": { "owner": "wicttor", "repo": "pwrl" }
  }
}
```

**Task-to-issue linking:**
```yaml
---
unit-id: S1
github-issue: 123
---
```

### Pattern 2: Review Findings Sync (MISSING)

**Opportunity for new `pwrl-review-sync-status`:**

```
Report Artifact Generated (verdict + findings)
      ↓
pwrl-review-sync-status
      ↓
Update GitHub PR:
  - Post review comment (detailed findings + metrics)
  - Submit formal review (APPROVE or REQUEST_CHANGES)
  - Add verdict labels (review-approved, review-changes-requested, security-concerns, etc.)
  - Update commit status (optional)
```

### Where Review Findings Could Post Back

| Sync Point | Data | Action | GitHub API |
|-----------|------|--------|-----------|
| **After Phase 4 (Report)** | Report artifact + verdict | Post review | `POST /repos/{owner}/{repo}/pulls/{prNumber}/reviews` |
| **After Phase 4 (Report)** | Detailed findings | Post comment | `POST /repos/{owner}/{repo}/issues/{prNumber}/comments` |
| **After Phase 4 (Report)** | Verdict type | Update labels | `PATCH /repos/{owner}/{repo}/issues/{prNumber}` |
| **After Phase 4 (Report)** | Verdict | Commit status | `POST /repos/{owner}/{repo}/statuses/{commitSha}` |

### Verdict-to-GitHub-Action Mapping

| Report Verdict | GitHub Review Action | Suggested Labels |
|---|---|---|
| `APPROVED` | `APPROVE` | `review-approved`, `ready-to-merge` |
| `REQUEST CHANGES` | `REQUEST_CHANGES` | `review-changes-requested` |
| `REJECTED` | `REQUEST_CHANGES` (blocking) | `review-rejected`, `blocked` |

**Additional contextual labels:**
- `security-concerns` ← if security issues found
- `test-coverage-low` ← if coverage < threshold
- `docs-incomplete` ← if documentation gaps
- `quality-warnings` ← if minor issues but approved

### Config Entries Needed

**Current `.pwrlrc.json`:**
```json
{
  "integrations": {
    "githubIssues": false
  }
}
```

**Extended structure (proposed):**
```json
{
  "integrations": {
    "githubIssues": true,
    "githubPullRequests": true,
    "github": {
      "owner": "wicttor",
      "repo": "pwrl",
      "reviewLabels": {
        "approved": "review-approved",
        "changesRequested": "review-changes-requested",
        "rejected": "review-rejected"
      }
    }
  }
}
```

---

## 3. SYNC OPPORTUNITIES

### What Data Should Sync Back to GitHub

**From Analyze Artifact (Phase 3):**
```yaml
critical_issues: 0-N count
major_issues: 0-N count
minor_issues: 0-N count
findings:
  code_quality: [list]
  security: [list]
  tests: [list]
  documentation: [list]
  integration: [list]
```

**From Report Artifact (Phase 4):**
```yaml
verdict: APPROVED | REQUEST CHANGES | REJECTED
quality_score: 0-100
code_quality_score: 0-100
security_score: 0-100
test_coverage_score: 0-100
documentation_score: 0-100
recommendation: [text rationale]
signed_by: [reviewer]
approval_date: [ISO timestamp]
```

### Sync Architecture

**Question: Should `pwrl-review-sync-status` be called after report phase?**

**YES — Recommended:**

```yaml
# pwrl-review/SKILL.md orchestrator

workflow: pwrl-review
phases:
  - number: 1
    name: "Validate Scope"
    skill: pwrl-review-scope
  - number: 2
    name: "Prepare Review"
    skill: pwrl-review-prepare
  - number: 3
    name: "Analyze Code"
    skill: pwrl-review-analyze
  - number: 4
    name: "Generate Report"
    skill: pwrl-review-report
  - number: 5  # NEW SYNC PHASE
    name: "Sync to GitHub"
    skill: pwrl-review-sync-status
    condition: "githubPullRequests enabled AND pr_number available"
    input: report_artifact
```

**Sync Flow:**
1. Phase 4 completes: `pwrl-review-report` → `report_artifact`
2. Orchestrator checks: `githubPullRequests` enabled? PR number available?
3. If yes: call `pwrl-review-sync-status` with report_artifact
4. Sync actions execute (post comment, review, labels)
5. Return sync_status_artifact with GitHub actions taken

### Useful GitHub Actions for Review

**Priority 1 — Essential:**
- ✓ **Post review comment** → formatted review summary with scores/findings
- ✓ **Submit GitHub review** → APPROVE or REQUEST_CHANGES action
- ✓ **Update PR labels** → verdict-based labels (review-approved, review-changes-requested, etc.)

**Priority 2 — Important:**
- ✓ **Update commit status** → add check status for "Code Review" with verdict
- ✓ **Inline code comments** → highlight critical/major issues at specific lines
- ✓ **Auto-close PR** → if REJECTED and severity is high (optional)

**Priority 3 — Nice-to-have:**
- ✓ **Request reviews** → auto-request from code owners or team leads
- ✓ **Create follow-up issues** → for action items from REQUEST CHANGES
- ✓ **Auto-assign reviewers** → based on file paths

---

## 4. REFERENCE FILES & CENTRALIZATION

### GitHub Integration Logic — Current Distribution

**Location 1: `lib/github-integration.js`**
- Generic API request handler
- Rate limiting & error handling
- Read-only functions (getPullRequest, getIssues, etc.)

**Location 2: `pwrl-work-sync-status/SKILL.md`**
- Issue status sync pattern (template for PR sync)
- Label management strategy
- Comment formatting examples
- GitHub CLI usage (`gh issue edit`, `gh issue comment`)

**Location 3: Review skills (scattered)**
- PR input handling (not centralized)
- Branch name extraction
- No shared utilities for PR operations

### New Reference Files to Create

**1. `pwrl-review-sync-status/references/github-pr-sync-protocol.md`**

Covers:
- PR number resolution (handle both PR #123 and branch names)
- PR metadata extraction (title, author, base/head branches)
- GitHub API vs. GitHub CLI choice (CLI for simplicity)
- Dry-run mode implementation
- Error recovery and skipping logic

**2. `pwrl-review-sync-status/references/review-verdict-mapping.md`**

Covers:
- Verdict → GitHub action mapping (APPROVE vs REQUEST_CHANGES)
- Verdict → label mapping (review-approved, review-changes-requested, etc.)
- Comment templates for each verdict type
- Formatting guidelines for markdown comments
- Issue creation patterns for action items

**3. `lib/github-pr-integration.js` (New module)**

Extends `github-integration.js` with write operations:

```javascript
// Review operations
async createPullRequestReview(owner, repo, prNumber, verdict, body)
async postPullRequestComment(owner, repo, prNumber, body)
async updatePullRequestLabels(owner, repo, prNumber, toAdd, toRemove)
async updateCommitStatus(owner, repo, commitSha, state, description)
async requestReview(owner, repo, prNumber, reviewers)

// PR metadata
async getPullRequestWithDetails(owner, repo, prNumber)
async getPRBranchMapping(owner, repo, prNumber)  // PR → base/head branches
```

**4. `lib/github-review-formatter.js` (New module)**

Formatting utilities for review output:

```javascript
formatReviewCommentBody(reportArtifact, prMetadata)  // → markdown
formatReviewAction(verdict)  // → APPROVE | REQUEST_CHANGES
generateReviewLabels(reportArtifact, config)  // → [labels]
formatFindingsList(findings, category)  // → markdown
generateQualityBadges(scores)  // → ASCII badges
```

**5. `lib/github-pr-input.js` (New module)**

Centralized PR input handling:

```javascript
resolvePRInput(input)  // → { prNumber, branch, owner, repo }
extractPRMetadata(owner, repo, prNumber)  // → PR details
validatePRInput(input, config)  // → validation result
```

### Centralized PR Input Handling Pattern

**Used by:**
- `pwrl-review-scope` → resolve input to PR/branch
- `pwrl-review-sync-status` → map review back to PR

**Benefits:**
- Single source of truth for PR resolution
- Consistent error messages
- Testable logic
- Reusable across skills

### Pattern to Extend From `pwrl-work-sync-status`

The existing sync pattern is excellent; `pwrl-review-sync-status` should follow:

1. **Check integration enabled:**
   ```
   if config.integrations.githubPullRequests !== true → skip
   ```

2. **Validate GitHub CLI:**
   ```bash
   gh auth status 2>/dev/null
   ```

3. **Parse artifact for GitHub reference:**
   ```yaml
   ---
   pr_number: 123
   ---
   ```

4. **Execute sync actions** (via `gh` or API):
   - Update labels
   - Post comment
   - Submit review

5. **Dry-run mode:**
   - Preview changes without making them
   - Show what would be posted/updated

6. **Error handling:**
   - Graceful degradation
   - Clear recovery suggestions

---

## 5. IMPLEMENTATION ROADMAP

### Phase 1: Core Library Infrastructure
**Files to create:**
- `lib/github-pr-integration.js` — PR API operations
- `lib/github-pr-input.js` — input resolution
- `lib/github-review-formatter.js` — formatting utilities

**Updates to existing:**
- `lib/github-integration.js` — extend rate limiting for write ops

### Phase 2: Create pwrl-review-sync-status Skill
**Files to create:**
- `pwrl-review-sync-status/SKILL.md` — orchestrator skill
- `pwrl-review-sync-status/references/github-pr-sync-protocol.md` — detailed protocol
- `pwrl-review-sync-status/references/review-verdict-mapping.md` — verdict mappings

**Pattern:** Mirror `pwrl-work-sync-status` structure

### Phase 3: Integration into pwrl-review
**Updates:**
- `pwrl-review/SKILL.md` — add Phase 5 (sync) to orchestrator
- `pwrl-review/references/phases.yaml` — add sync phase
- `pwrl-review-scope/SKILL.md` — extract PR metadata if input is PR number
- Artifacts — add `pr_number` field to all phases (optional but useful)

### Phase 4: Configuration & Testing
**Updates:**
- `.pwrlrc.json` schema documentation
- `lib/config.js` — add `isGitHubPullRequestsEnabled()` function
- Add integration tests
- Create example workflow in `docs/examples/`

### Phase 5: Documentation
- Update `GUIDE.md` with PR review sync workflow
- Create troubleshooting guide
- Add GitHub authentication setup instructions

---

## DETAILED FINDINGS

### Current GitHub Touchpoints in pwrl-review

| Touchpoint | File | Function | Used? |
|-----------|------|----------|-------|
| **PR input** | pwrl-review-scope/SKILL.md | Accept PR number | Accepted, not resolved |
| **PR file list** | lib/github-integration.js | `getPullRequestFiles()` | Available, not used |
| **PR metadata** | lib/github-integration.js | `getPullRequest()` | Available, not used |
| **Git operations** | lib/github-integration.js | getModifiedFiles(), getCurrentBranch() | Used |
| **Config** | .pwrlrc.json | github.owner/repo | Stored but PR sync not using |
| **Sync pattern** | pwrl-work-sync-status/SKILL.md | Issue label/comment sync | Model to follow |

### What pwrl-review-sync-status Should Do

**Input:** Report artifact + PR number + GitHub config

**Processing:**
1. Verify `githubPullRequests` enabled in config
2. Resolve PR number (from artifact or argument)
3. Extract PR details (base branch, head branch, etc.)
4. Format review comment from report findings
5. Determine review action (APPROVE or REQUEST_CHANGES)
6. Collect review labels from verdict + findings
7. **Dry-run mode:** show what would happen
8. **Execute:**
   - Post comment to PR
   - Submit formal GitHub review
   - Update PR labels
   - Update commit status (optional)

**Output:** Sync status artifact with:
```yaml
success: true | false
action: synced | skipped | failed
pr_number: 123
pr_url: "https://github.com/owner/repo/pull/123"
comment_posted: true | false
review_submitted: true | false
labels_added: [list]
labels_removed: [list]
error: null | error message
```

### How It Fits into the Orchestrator Pipeline

**Current:**
```
pwrl-review
  ├─ Phase 1: pwrl-review-scope
  ├─ Phase 2: pwrl-review-prepare
  ├─ Phase 3: pwrl-review-analyze
  └─ Phase 4: pwrl-review-report
```

**Extended:**
```
pwrl-review
  ├─ Phase 1: pwrl-review-scope
  ├─ Phase 2: pwrl-review-prepare
  ├─ Phase 3: pwrl-review-analyze
  ├─ Phase 4: pwrl-review-report
  └─ Phase 5: pwrl-review-sync-status  [NEW]
     Condition: githubPullRequests enabled AND pr_number available
     Input: report_artifact
     Output: sync_status_artifact
```

**Quality gate:** Optional validation after phase 5 (verify comment posted, etc.)

---

## SUMMARY TABLE

| Category | Current | Gap | Solution |
|----------|---------|-----|----------|
| **PR Input** | Accepted | No PR→branch resolution | Create `lib/github-pr-input.js` |
| **PR Metadata** | Read functions exist | Not used in workflow | Extract in Phase 1; store in artifacts |
| **GitHub Fields** | None in artifacts | No PR reference | Add `pr_number` field to all artifacts |
| **API Capabilities** | Read-only | Can't post reviews/comments | Create `lib/github-pr-integration.js` |
| **Sync Pattern** | Task→Issue exists | Review→PR missing | Create `pwrl-review-sync-status` |
| **Verdict Mapping** | Report has verdict | Not synced to GitHub | Create reference mapping file |
| **Config** | Basic GitHub support | PR sync not configured | Add `githubPullRequests` flag |
| **References** | Fragmented | No PR sync protocol | Create dedicated reference files |
| **Integration** | None | No orchestrator phase | Add Phase 5 to pwrl-review |

---

## Next Steps

1. **Review this analysis** → confirm alignment
2. **Create infrastructure** → Phase 1 libraries
3. **Create sync skill** → `pwrl-review-sync-status`
4. **Integrate** → update orchestrator and config
5. **Test & document** → examples and troubleshooting

---

## Appendix: Reference File Templates

See `/memories/session/pwrl-review-github-analysis.md` for:
- Complete artifact schema examples
- Status-to-label mapping table
- Comment template examples
- Implementation sequence details
