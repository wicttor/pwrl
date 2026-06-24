# Review Verdict Mapping to GitHub Actions

Maps pwrl-review verdicts to GitHub PR actions, labels, and next steps.

## Verdict → GitHub Review Action Mapping

| PWRl Verdict | GitHub Action | Logic | Use Case |
|---|---|---|---|
| **APPROVED** | APPROVE | All checks passed, code ready | Feature complete, no issues |
| **REQUEST CHANGES** | REQUEST_CHANGES | Issues found, resubmit after fixes | Fixable problems, resubmit expected |
| **REJECTED** | REQUEST_CHANGES (blocking) | Blockers found, discuss first | Major issues, strategy discussion needed |

**GitHub Review States:**
- `APPROVED` — Reviewer approves PR merge
- `CHANGES_REQUESTED` — Reviewer blocks PR, changes required (can dismiss with re-review)
- `COMMENTED` — Reviewer comments without blocking
- `PENDING` — Review in progress (not typically used here)
- `DISMISSED` — Previous review removed (auto-handled by GitHub)

## Label Assignment Rules

### By Verdict

| Verdict | Labels Applied | Labels Removed | Next Action |
|---------|---|---|---|
| **APPROVED** | `review-approved` | `review-changes-requested`, `review-rejected` | Ready to merge |
| **REQUEST CHANGES** | `review-changes-requested` | `review-approved`, `review-rejected` | Author fixes issues |
| **REJECTED** | `review-rejected` | `review-approved`, `review-changes-requested` | Team discussion |

### By Quality Dimension

| Finding Type | Condition | Label | Keep On Resubmit? |
|---|---|---|---|
| **Security** | Any CRITICAL or MAJOR | `security-concerns` | Yes (manual clear) |
| **Test Coverage** | Coverage < threshold | `coverage-low` | No (auto-clear if fixed) |
| **Documentation** | Missing sections found | `docs-incomplete` | No (auto-clear if fixed) |
| **Build/Integration** | Build/tests failing | `build-failing` | Yes (manual clear) |
| **Code Quality** | High complexity, duplication | `code-quality` | No (auto-clear if fixed) |

### Auto-Clear Logic

**On resubmit (new review):**
- If previous APPROVED → current REQUEST CHANGES: Remove `review-approved`, add `review-changes-requested`
- If previous REQUEST CHANGES → current APPROVED: Remove `review-changes-requested`, add `review-approved`
- If coverage was low but now meets threshold: Remove `coverage-low`
- If docs were incomplete but now complete: Remove `docs-incomplete`
- If code quality issues resolved: Remove `code-quality`

**Never auto-remove:**
- `security-concerns` (must be manually cleared after full security audit)
- `build-failing` (must be manually cleared after CI/CD fixes)

### Label Priority

**High Priority (block merge):**
- `review-rejected` — Do not merge until cleared
- `build-failing` — Merge blocked by CI
- `security-concerns` — High-risk merge

**Medium Priority (requires attention):**
- `review-changes-requested` — Author should address
- `coverage-low` — Quality concern
- `docs-incomplete` — Maintenance concern

**Low Priority (informational):**
- `review-approved` — Ready status
- `code-quality` — Best practice suggestion

## Quality Score → Label Thresholds

### Overall Score Thresholds

| Overall Score | Status | Action |
|---|---|---|
| 90-100% | Excellent | Add `excellent-quality` (optional) |
| 75-89% | Good | No special label |
| 50-74% | Fair | Add `needs-attention` (optional) |
| 0-49% | Poor | Add `quality-low` (optional) |

### Dimension-Specific Thresholds

**Coverage Score:**
- ≥80%: Remove `coverage-low`
- 50-79%: Add `coverage-low`
- <50%: Add `coverage-critical`

**Security Score:**
- 100%: No security label
- 85-99%: Add `security-review-minor` (optional)
- <85%: Add `security-concerns`

**Documentation Score:**
- ≥80%: Remove `docs-incomplete`
- 50-79%: Add `docs-incomplete`
- <50%: Add `docs-critical`

**Code Quality:**
- ≥85%: No quality label
- 70-84%: Add `code-quality`
- <70%: Add `code-quality-low`

## Example Mappings

### Example 1: APPROVED with Excellent Quality

**Input:**
- Verdict: APPROVED
- Overall Score: 95%
- Code Quality: 90%
- Security: 100%
- Coverage: 95%
- Docs: 95%

**Output:**
- GitHub Action: **APPROVE**
- Labels Applied:
  - `review-approved` ✅
  - `excellent-quality` (optional) ✨
- Labels Removed:
  - `review-changes-requested`
  - `review-rejected`
- Status: "Ready to merge" 🟢

---

### Example 2: REQUEST CHANGES with Coverage Issues

**Input:**
- Verdict: REQUEST CHANGES
- Overall Score: 72%
- Code Quality: 85%
- Security: 95%
- Coverage: 65% (below 80% threshold)
- Docs: 80%
- Finding: "Test coverage below threshold"

**Output:**
- GitHub Action: **REQUEST_CHANGES**
- Labels Applied:
  - `review-changes-requested` ⚠️
  - `coverage-low` 📉
- Labels Removed:
  - `review-approved`
  - `excellent-quality`
- Status: "Fix test coverage (need +15%) and resubmit" 🟡

---

### Example 3: REJECTED with Security Issues

**Input:**
- Verdict: REJECTED
- Overall Score: 35%
- Code Quality: 60%
- Security: 20% (CRITICAL SQL injection found)
- Coverage: 40% (far below threshold)
- Docs: 50%
- Findings: SQL injection, missing rate limiting, no tests

**Output:**
- GitHub Action: **REQUEST_CHANGES** (blocking)
- Labels Applied:
  - `review-rejected` 🔴
  - `security-concerns` 🔒
  - `coverage-critical` 📉
  - `build-failing` (if integration failed) ❌
- Labels Removed:
  - `review-approved`
  - `review-changes-requested`
- Status: "Critical security issues. Team discussion needed before resubmitting." 🔴

---

### Example 4: Resubmit After Fixes

**Scenario:** Previous review was REQUEST_CHANGES with coverage-low. Author fixed tests.

**New Review Input:**
- Verdict: APPROVED
- Coverage: 85% (now meets threshold)
- All other scores: Maintained

**Output:**
- GitHub Action: **APPROVE**
- Labels Applied:
  - `review-approved` ✅
- Labels Removed:
  - `review-changes-requested` ⚠️ (auto-remove)
  - `coverage-low` 📉 (auto-remove)
- Status: "Coverage fixed, approved for merge" 🟢

---

## Label Naming Convention

**Format:** `kebab-case`, lowercase, max 50 chars

**Prefixes:**
- `review-*` → Verdict status (review-approved, review-changes-requested, review-rejected)
- `security-*` → Security findings (security-concerns, security-critical)
- `coverage-*` → Test coverage (coverage-low, coverage-critical)
- `docs-*` → Documentation (docs-incomplete, docs-critical)
- `build-*` → Integration failures (build-failing, build-broken)
- `code-*` → Code quality (code-quality, code-quality-low)

**Color Assignment:**
- Green (#28a745): Approved/positive (review-approved)
- Yellow (#fbca04): Warning/needs attention (coverage-low, docs-incomplete)
- Orange (#ed7923): Issues (code-quality, build-failing)
- Red (#d73a49): Blocking/critical (security-concerns, review-rejected)
- Purple (#a371f7): Quality metrics

## GitHub API Actions Mapping

### Verdict → API Call Mapping

**APPROVED:**
```javascript
{
  "body": "All checks passed ✅. Code is ready to merge.",
  "event": "APPROVE"
}
```

**REQUEST CHANGES (fixable):**
```javascript
{
  "body": "Please fix the X issues above and request re-review.",
  "event": "REQUEST_CHANGES"
}
```

**REJECTED (blocking):**
```javascript
{
  "body": "Critical blockers found. Please discuss approach with the team before resubmitting.",
  "event": "REQUEST_CHANGES"  // Same action, but body is different
}
```

**Note:** GitHub only has APPROVE and REQUEST_CHANGES events. We distinguish REJECTED from REQUEST_CHANGES through:
1. Comment body (different messaging)
2. Additional labels (`review-rejected` vs `review-changes-requested`)
3. Presence of CRITICAL issues in findings

## Metrics & Reporting

### Summary Metrics

After GitHub sync, report:
- ✅ Formal review created: [APPROVE | REQUEST_CHANGES]
- ✅ Comment posted with findings
- ✅ Labels updated: [list of added/removed labels]
- ✅ Ready for merge? [Yes | No, awaiting fixes]

### Example Output

```
✅ Review Synchronized to GitHub PR #42
   Status: APPROVED
   Action: APPROVE
   Labels Added: review-approved, excellent-quality
   Labels Removed: review-changes-requested

   Quality Metrics:
   📊 Overall: 92%
   📊 Code: 90% | Security: 100% | Coverage: 95% | Docs: 95%

   ✅ Ready to merge
```

