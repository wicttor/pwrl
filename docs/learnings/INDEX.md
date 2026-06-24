# PWRl Learnings Index

Central index of all learnings extracted from development sessions.

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
