---
session: wave-2-u3-u4-u6
date: 2026-06-24
commit: 334da40
learnings_extracted: 4
categories: [architecture, consolidation, patterns, github-integration]
---

# Session Learnings: PWRl-Review Orchestrator Refactoring

## Learning 1: Pure Orchestrator Pattern (Architecture)

**Type:** Pattern
**Domain:** Architecture, Skill Design
**Severity:** High (reusable pattern)
**Source:** Phases 1-4 refactoring (pwrl-review/SKILL.md 326→135L)

### Key Insight

Orchestrators can be "pure" (coordination only) or "hybrid" (coordination + details). Pure orchestrators:
- Call micro-skills and pass their output to next phase
- Contain no workflow details, phase-specific logic, or decision matrices
- Reference micro-skills via one-liner descriptions with links
- Delegate all implementation specifics to micro-skills or references

### Pattern Structure

```
Pure Orchestrator:
  ├ Architecture diagram (visual overview)
  ├ Phase Summary (4-5 lines: one per phase with link)
  ├ Quality Gates (reference to validation skill)
  ├ References (links to consolidation files)
  ├ Dependencies (what this skill consumes)
  └ Usage (when to use this orchestrator)

Hybrid Orchestrator (Anti-pattern):
  ├ Phase 1-4 detailed workflows (100+ lines) ← DUPLICATES micro-skills
  ├ Quality assessment criteria (35+ lines) ← BELONGS in references
  ├ Implementation specifics ← DUPLICATES micro-skills
  └ Decision matrices ← CENTRALIZES poorly
```

### Result

- **Size reduction:** 326 → 135 lines (59% reduction!)
- **Duplication eliminated:** 91L workflow details + 100L implementation specifics
- **Maintainability:** Single source of truth per domain (micro-skills own their logic)
- **Pattern reusability:** Applied to pwrl-review; next: pwrl-work, pwrl-plan, pwrl-learnings

### Decision Rationale

- **Why pure?** Orchestrators change frequently (phase order, new phases); keeping them simple reduces maintenance burden
- **Why reference links?** Centralizes related knowledge (artifact schemas, error handling, verdict logic) so single edit updates all consumers
- **Why micro-skills own details?** Each micro-skill knows its domain best; orchestrator doesn't second-guess

### Applicability

**When to use pure orchestrator:**
- 3+ phases with clear input/output boundaries
- Shared concerns across phases (error handling, artifacts, decision criteria)
- Likely future changes (phase additions, criteria refinement)

**When hybrid is acceptable:**
- 2-phase simple workflow (too simple for references)
- Phase-specific logic that never changes
- No shared concerns between phases

### Next Steps

1. Refactor pwrl-work orchestrator to pure pattern
2. Refactor pwrl-plan orchestrator to pure pattern
3. Refactor pwrl-learnings orchestrator to pure pattern
4. Document pure orchestrator pattern in docs/ARCHITECTURE.md

---

## Learning 2: Consolidation Strategy (Consolidation Technique)

**Type:** Technique
**Domain:** Knowledge Management, Code Consolidation
**Severity:** High (30% size reduction without feature loss)
**Source:** Phases 1-4 consolidation (3 reference files created)

### Key Insight

When duplication exists across N micro-skills, consolidate to centralized reference files instead of inline definitions:

**Anti-pattern (before):**
```
pwrl-review-scope/SKILL.md: "## Artifact\n[37 lines of schema]"
pwrl-review-prepare/SKILL.md: "## Artifact\n[37 lines of schema]"
pwrl-review-analyze/SKILL.md: "## Artifact\n[37 lines of schema]"
pwrl-review-report/SKILL.md: "## Artifact\n[37 lines of schema]"
→ 158 lines duplicated, 4 locations to maintain
```

**Pattern (after):**
```
pwrl-review/references/artifact-schemas.md: "## All Artifacts\n[408 lines, complete]"
pwrl-review-scope/SKILL.md: "See [artifact-schemas.md](../references/artifact-schemas.md)"
pwrl-review-prepare/SKILL.md: "See [artifact-schemas.md](../references/artifact-schemas.md)"
pwrl-review-analyze/SKILL.md: "See [artifact-schemas.md](../references/artifact-schemas.md)"
pwrl-review-report/SKILL.md: "See [artifact-schemas.md](../references/artifact-schemas.md)"
→ 1 location to maintain, 4 one-line links
```

### Consolidation Targets (This Session)

| Reference File | Content | Size | Duplication Eliminated |
|---|---|---|---|
| artifact-schemas.md | All 4 artifact structures (scope, prepare, analyze, report) | 408L | 158L |
| error-and-testing.md | Error recovery + testing guidelines for all phases | 271L | ~110L |
| verdict-criteria.md | Complete verdict decision logic, matrices, templates | 307L | 60L |
| github-pr-sync-protocol.md | GitHub API details, auth, error recovery | 416L | N/A (new) |
| review-verdict-mapping.md | Verdict→action mapping, label assignment, examples | 271L | N/A (new) |
| **Total** | | **1,673L** | **328L eliminated** |

### Consolidation Mechanics

**Path strategy:** Use relative paths (`../pwrl-review/references/...`) so links work from any micro-skill

**Link format:** `[filename](../pwrl-review/references/filename.md) — One-line purpose`

**Coverage rules:**
- ✓ If content appears in 2+ skills: Consolidate to reference
- ✓ If content is rarely updated: Can stay inline (≤5L)
- ✓ If content is decision logic: Always consolidate (single source of truth)
- ✓ If content is examples/templates: Consider consolidation (if reused)

### Result

- **Micro-skill sizes:** Reduced 18-30% (scope 157→120L, prepare 216→176L, etc.)
- **Orchestrator size:** Reduced 59% (326→135L)
- **Maintainability:** Update error handling once, all 4 phases benefit
- **Consistency:** Verdict logic defined once, no divergence across skills

### Decision Rationale

- **Why centralize?** Reduces cognitive load (one truth) and maintenance burden (edit once)
- **Why relative paths?** Skills can be moved/reorganized without breaking links
- **Why link instead of copy-paste?** Version drift prevention; single change propagates

### When to NOT Consolidate

- ✗ Content is phase-specific and never reused
- ✗ Content is example code (often customized per context)
- ✗ Content is rarely referenced
- ✗ Content changes frequently and differently per phase

### Applicability

**Apply consolidation to:**
- Artifact schemas (always duplicated across input/output phases)
- Error handling strategies (same patterns in all phases)
- Decision matrices and criteria (need single source of truth)
- Testing guidelines and validation rules
- Authentication/API protocols (same across consumers)

**Skip consolidation for:**
- Phase-specific workflows (unique per phase)
- Example code runs (customized per context)
- Inline documentation (<5L, rarely reused)

### Next Steps

1. Audit other orchestrators (pwrl-work, pwrl-plan, pwrl-learnings) for consolidation opportunities
2. Extract common error patterns to shared `docs/references/` directory
3. Create template: "When to consolidate" decision guide

---

## Learning 3: GitHub Integration Pattern (Feature Architecture)

**Type:** Pattern
**Domain:** GitHub Integration, API Patterns
**Severity:** High (complete PR sync workflow)
**Source:** Phase 5 (pwrl-review-sync-status + 2 references)

### Key Insight

Stateless GitHub PR synchronization requires:
1. **Input validation** — Report artifact + PR number from context
2. **Format transformation** — Findings → Markdown comment + GitHub review action
3. **API orchestration** — Sequential GitHub calls (comment, review, labels)
4. **Error recovery** — Transient retry (3x backoff), permanent fallback (local save)
5. **Idempotency** — Avoid duplicate reviews on resubmit

### Architecture

**Phase 5 Workflow:**
```
Step 1: Validate Report Artifact & PR Context
  ├ Check artifact has verdict, scores, findings
  ├ Resolve PR number (arg, branch, API search, or manual)
  ├ Verify PR exists on GitHub

Step 2: Format Review for GitHub
  ├ Markdown comment: verdict, metrics (progress bars), findings, action items
  ├ Verdict→Action mapping: APPROVED/REQUEST_CHANGES/REJECTED
  ├ Quality thresholds determine auto-labels

Step 3: Post Comment
  ├ Call GitHub API: POST /repos/{owner}/{repo}/issues/{issue_number}/comments
  ├ Handle transient errors: retry 1s→2s→4s
  ├ Handle permanent errors: fallback to local save

Step 4: Create Formal Review
  ├ Call GitHub API: POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews
  ├ Skip if already reviewed (avoid duplicates)
  ├ Action: APPROVE | REQUEST_CHANGES

Step 5: Update Labels
  ├ Auto-add: review-approved, coverage-low, security-concerns, etc.
  ├ Auto-remove: old verdict labels
  ├ Preserve: manual labels (security-concerns, docs-incomplete)
```

### Implementation Details

**Comment formatting:**
- Emoji-driven (✅ APPROVED, ⚠️ REQUEST CHANGES, ❌ REJECTED)
- Progress bars for metrics (████░░░░ 80%)
- Findings grouped by severity (🔴 CRITICAL, 🟠 MAJOR, 🟡 MINOR)
- Truncate to 60KB if too large; link to full artifact

**Verdict mapping:**
```
pwrl Verdict → GitHub Action + Labels
APPROVED → APPROVE + review-approved
REQUEST CHANGES → REQUEST_CHANGES + review-changes-requested
REJECTED → REQUEST_CHANGES + review-rejected (blocking)
```

**Label assignment rules:**
- Verdict labels (mutually exclusive): review-approved, review-changes-requested, review-rejected
- Quality labels (can combine): security-concerns, coverage-low, docs-incomplete, build-failing
- Auto-clear: Coverage/docs labels on resubmit if fixed
- Never auto-clear: Security/build labels (manual audit required)

**Error recovery:**
- Transient (rate limit, timeout): Retry with exponential backoff (1s→2s→4s)
- Permanent (auth failure, PR not found): Fall back to local artifact save
- Rate limit handling: Check X-RateLimit-Remaining before each call; pause if <100

### Result

- **GitHub integration complete:** Review findings flow back to PR
- **User visibility:** Team sees findings + verdict directly in PR
- **Automation:** Labels applied automatically based on verdict + quality scores
- **Reliability:** Error recovery prevents partial syncs; local fallback if GitHub unavailable

### Decision Rationale

- **Why stateless?** Allows re-runs without tracking state; simpler error recovery
- **Why separate protocol references?** GitHub API details (auth, rate limits, endpoints) are distinct from verdict mapping (business logic)
- **Why auto-labels?** Reduces manual work; codifies verdict→label mapping
- **Why transient retry + fallback?** GitHub can be temporarily unavailable; fallback ensures no data loss

### Applicability

**Apply pattern to:**
- Any review/approval system with GitHub PR sync
- Workflow engines that need to post status back to PRs
- CI/CD systems that update PRs with results

**Patterns reusable for:**
- Posting test results to PRs
- Syncing deployment status to PRs
- Posting metrics/coverage reports to PRs

### Next Steps

1. Create GitHub integration reference library (auth, rate limiting, error recovery)
2. Apply pattern to pwrl-work (sync task status to GitHub issues)
3. Apply pattern to pwrl-testing (post test results to PRs)

---

## Learning 4: Cross-Skill Artifact Chain (System Design)

**Type:** Pattern
**Domain:** System Architecture, Data Flow
**Severity:** High (foundation for multi-phase workflows)
**Source:** Validated artifact chain in pwrl-review (Phase 1-5)

### Key Insight

Multi-phase orchestrators should use explicit artifact chains where each phase:
1. **Consumes** the previous phase's output artifact (input validation)
2. **Produces** an artifact for the next phase
3. **Validates** artifact schema before passing (quality gate)
4. **Logs** artifact ID for audit trail

### Artifact Chain (This Session)

```
Phase 1 (Scope)
  └─ Output: scope_artifact {branch, files, scope_summary}
     ↓
Phase 2 (Prepare)
  ├─ Input: scope_artifact ✓ (validate schema)
  └─ Output: prepare_artifact {environment, analysis_config, tools}
     ↓
Phase 3 (Analyze)
  ├─ Input: prepare_artifact ✓ (validate schema)
  └─ Output: analyze_artifact {code_findings, security_findings, test_findings, ...}
     ↓
Phase 4 (Report)
  ├─ Input: analyze_artifact ✓ (validate schema)
  └─ Output: report_artifact {verdict, quality_scores, findings_summary, sign_off}
     ↓
Phase 5 (Sync Status)
  ├─ Input: report_artifact ✓ (validate schema)
  └─ Output: sync_artifact {github_updates, timestamp, status}
```

### Implementation Pattern

**In each micro-skill SKILL.md:**

```markdown
## Input: [Previous Phase Name] Artifact

Expects artifact from `[previous-skill]` with:
- field1: description
- field2: description
...

## Output: [Current Phase Name] Artifact

Produces artifact with:
- field1: description
- field2: description
...

See [artifact-schemas.md](...) for complete schema
```

**In orchestrator:**

```markdown
Phase N output → Phase N+1 input validation → Pass if valid, error if invalid
```

### Result

- **Error detection:** Invalid artifact caught immediately (not propagated to next phase)
- **Debugging:** Artifact chain makes data flow explicit and testable
- **Coupling:** Tight schema coupling ensures phases stay in sync
- **Traceability:** Each artifact has ID and metadata for audit trail

### Decision Rationale

- **Why explicit validation?** Prevents cascading failures from bad data
- **Why artifact IDs?** Enables audit trail (which phase produced which findings)
- **Why phase-specific schemas?** Catches schema drift early; one source of truth per phase

### Applicability

**Use artifact chains for:**
- Multi-phase workflows with shared concerns
- Data transformation pipelines
- QA/review workflows (where early phases feed later phases)

**Track artifact IDs for:**
- Audit trails (which agent/reviewer generated findings)
- Debugging (trace findings back to analysis phase)
- Testing (verify phase inputs/outputs match expected schemas)

### Next Steps

1. Codify artifact chain pattern in docs/ARCHITECTURE.md
2. Create artifact schema template for new orchestrators
3. Add artifact ID validation to pwrl-phase-checkpoint

---

## Cross-Cutting Themes

### Theme 1: Single Source of Truth (Consolidation)

Appeared in multiple contexts:
- Artifact schemas (consolidated to references/)
- Error handling (consolidated to references/)
- Verdict logic (consolidated to references/)
- GitHub mappings (consolidated to references/)

**Pattern:** Whenever information appears in 2+ locations, consolidate and link.

### Theme 2: Explicit Data Flow (Architecture)

Appeared in:
- Phase summary (one-liner per phase)
- Artifact chain (phase-in → phase-out)
- GitHub workflow (5-step sequence)

**Pattern:** Make data flow explicit; avoid implicit coupling.

### Theme 3: Error Recovery (Reliability)

Appeared in:
- Error and testing reference (all phases)
- GitHub sync protocol (transient vs. permanent)
- Local fallback strategy (when external systems fail)

**Pattern:** Classify errors (transient vs. permanent) and provide appropriate recovery.

