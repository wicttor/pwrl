# PWRl Learnings Index

Central index of all learnings extracted from development sessions.

## Session: OKF Compliance Migration Planning (2026-06-28)

**File:** [2026-06-28-okf-compliance-planning-learnings.md](2026-06-28-okf-compliance-planning-learnings.md) (summary below)

**Commit:** 723702a

**Key Learnings:**

1. **OKF Compliance Bulk-Migration Pattern** (Pattern)
   - 6-step pattern for migrating 85+ documents to OKF v0.1: taxonomy → batch → indexes → validate → capture
   - Dependency graph: 4 sequential groups, 4 parallel tasks in group 2
   - Reusable for: any documentation format compliance migration
   - Full doc: [pattern/okf-compliance-bulk-migration-2026-06-28.md](pattern/okf-compliance-bulk-migration-2026-06-28.md)

2. **OKF Type Taxonomy Design** (Decision)
   - Chose `PWRL X` prefix for type values to avoid namespace collisions
   - 7 type values mapped from PWRL document categories
   - Field mapping: date→timestamp, category preserved as custom extension
   - Full doc: [decision/okf-type-taxonomy-for-pwrl-docs-2026-06-28.md](decision/okf-type-taxonomy-for-pwrl-docs-2026-06-28.md)

3. **Plan-to-Tasks Pipeline for Docs-Only Migrations** (Workflow)
   - Full pwrl-plan → pwrl-tasks pipeline for documentation migrations (no code changes)
   - Adaptations: verification commands instead of test suites, frontmatter patterns instead of code patterns
   - Critical path: 4 sequential steps out of 7 total (43% parallel execution)
   - Full doc: [workflow/plan-to-tasks-pipeline-for-docs-migrations-2026-06-28.md](workflow/plan-to-tasks-pipeline-for-docs-migrations-2026-06-28.md)

4. **Parallel Task Grouping by Document Category** (Pattern)
   - Group bulk-update tasks by directory isolation for maximum parallelism
   - Fan-out/fan-in dependency graph: foundation → parallel groups → cross-cutting gates → validation
   - Result: 7-unit plan executes in 4 sequential steps instead of 7
   - Full doc: [pattern/parallel-task-grouping-by-document-category-2026-06-28.md](pattern/parallel-task-grouping-by-document-category-2026-06-28.md)

**Themes:**
- OKF Compliance (documentation standards)
- Bulk Migration Strategy (format migration)
- Pipeline Architecture (plan → tasks → execute)
- Parallel Execution (task grouping)

## Session: wave-2-u3-u4-u6 Refactoring (2026-06-24)

**File:** [2026-06-24-wave-2-refactoring-learnings.md](2026-06-24-wave-2-refactoring-learnings.md)

**Commit:** 334da40

**Key Learnings:**

1. **Pure Orchestrator Pattern** (Architecture)
   - Orchestrators should contain coordination only, not workflow details
   - Reference consolidation files for shared concerns
   - Result: 59% size reduction without feature loss
   - Reusable for: pwrl-work, pwrl-plan, pwrl-learnings

2. **Consolidation Strategy** (Consolidation Technique)
   - Consolidate N-way duplication to central references + one-line links
   - Targets: schemas, error handling, decision logic, API protocols
   - Result: ~328 lines of duplication eliminated, single source of truth
   - Metrics: 1,673 lines centralized, 18% average skill size reduction

3. **GitHub Integration Pattern** (Feature Architecture)
   - 5-step workflow: validate, format, post, review, labels
   - Stateless design enables idempotent re-runs
   - Error recovery: transient retry + permanent fallback
   - Verdict mapping: APPROVED/REQUEST_CHANGES/REJECTED → GitHub actions + labels

4. **Cross-Skill Artifact Chain** (System Design)
   - Explicit input/output validation between phases
   - Each phase consumes previous output, produces next input
   - Artifact IDs enable audit trail
   - Prevents cascading failures from schema mismatches

**Themes:**
- Single Source of Truth (consolidation)
- Explicit Data Flow (architecture)
- Error Recovery (reliability)

## Session: End-session formatting fix (2026-06-24)

**File:** [pattern/markdown-blank-line-before-nested-list-2026-06-24.md](pattern/markdown-blank-line-before-nested-list-2026-06-24.md)

**Commit:** 16f2763

**Key Learnings:**

1. **Blank Line Before Nested Lists** (Documentation)
   - Always add a blank line before a nested list following a paragraph
   - Ensures correct rendering across all Markdown parsers
   - Fixed in pwrl-end-session-checkpoint and pwrl-end-session-commit SKILL files

---

## How to Use These Learnings

### For Architecture Decisions
- Reference "Pure Orchestrator Pattern" when designing new multi-phase skills
- Reference "Artifact Chain" when designing data transformations

### For Code Consolidation
- Use "Consolidation Strategy" when finding N-way duplication
- Checklist: Is this content in 2+ skills? → Consolidate to references/

### For GitHub Integration
- Reference "GitHub Integration Pattern" for PR sync workflows
- Copy error recovery strategies from github-pr-sync-protocol.md

### For Next Sessions
- Apply pure orchestrator pattern to: pwrl-work, pwrl-plan, pwrl-learnings
- Consider: Should new skills follow artifact chain pattern?

---

*Index generated from session learnings. Update manually or via pwrl-update-learnings skill.*
