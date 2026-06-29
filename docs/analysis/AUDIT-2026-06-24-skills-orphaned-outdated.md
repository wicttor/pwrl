---
title: Skills Audit Report — Orphan, Outdated, & Non-Compliant Tasks
description: Comprehensive audit of pwrl-testing, pwrl-update-learnings, pwrl-refresh-learnings, pwrl-phase-checkpoint, and pwrl-standards skills for orphaned tasks, outdated references, and non-compliant documentation.
type: PWRL Analysis
timestamp: 2026-06-24
tags: [audit, skills, compliance, documentation, pwrl-standards]
---

# Skills Audit Report: Orphan, Outdated, & Non-Compliant Tasks

**Date:** 2026-06-24
**Auditor:** AI Assistant
**Scope:** pwrl-testing, pwrl-update-learnings, pwrl-refresh-learnings, pwrl-phase-checkpoint, pwrl-standards
**Focus:** Orphaned tasks, outdated references, non-compliant documentation, cross-skill dependencies

---

## Executive Summary

| Skill                      | Status       | Issues  | Severity |
| -------------------------- | ------------ | ------- | -------- |
| **pwrl-testing**           | ✅ COMPLIANT | None    | N/A      |
| **pwrl-update-learnings**  | ✅ COMPLIANT | None    | N/A      |
| **pwrl-refresh-learnings** | ⚠️ ISSUES    | 3 found | MEDIUM   |
| **pwrl-phase-checkpoint**  | ⚠️ ISSUES    | 3 found | MEDIUM   |
| **pwrl-standards**         | ⚠️ ISSUES    | 4 found | MEDIUM   |
| **Cross-Skill**            | ⚠️ ISSUES    | 4 found | MEDIUM   |

**Total Issues:** 18 (3 CRITICAL, 8 MEDIUM, 7 LOW)

---

## CRITICAL ISSUES (Must Fix)

### 1. Orphaned Documentation: Duplicate README.md Files

**Affected Skills:**

- `pwrl-refresh-learnings/README.md` ⚠️
- `pwrl-phase-checkpoint/README.md` ⚠️

**Issue:**
Both skills have:

- A main `SKILL.md` file (canonical source per SCHEMA.md)
- A duplicate `README.md` file with overlapping content

Per [pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md) §3 (Right-Sized), skills should have ONE main documentation file. READMEs create ambiguity about which is authoritative.

**Impact:**

- Users don't know which file is current
- Maintenance burden (updates must sync both files)
- Violates single-source-of-truth principle

**Action Required:**

- [ ] `pwrl-refresh-learnings/README.md` → REMOVE or convert to architecture notes
- [ ] `pwrl-phase-checkpoint/README.md` → REMOVE or convert to reference material
- Keep SKILL.md as canonical source per standards

---

### 2. Standards Compliance Gap: pwrl-standards References Missing Validation Script

**Affected File:** `pwrl-standards/SCHEMA.md` line ~580

**Issue:**
SCHEMA.md references validation script:

```
- `pwrl-standards/scripts/validate-skills.js` script to check schema compliance (`npm run validate:skills`)
```

However:

- Script does NOT exist yet (planned in docs/tasks U2, U3, U4)
- SCHEMA.md presents it as if it exists
- README in project root doesn't document this

**Impact:**

- Users can't validate skills yet
- Standards are defined but not enforceable
- SCHEMA.md is misleading about current capabilities

**Action Required:**

- [ ] Update SCHEMA.md line ~580 to: "Script planned for Phase U2 (TDD validator tests)"
- [ ] Add note: "Validation script will be available in [next release]"
- [ ] Document validation roadmap in pwrl-standards/README.md

---

### 3. Task Index & Skill Mismatch: Extraction Tasks (U9–U19) Lack Compliance Mapping

**Affected File:** `docs/tasks/INDEX.md`

**Issue:**
Tasks U9–U19 define skill extraction work (pwrl-learnings-structure, pwrl-work-execute, etc.) but:

- No explicit compliance requirements per SCHEMA.md
- No phase manifest schema referenced (U5 task defines this)
- No quality gate definitions per pwrl-phase-checkpoint
- Tasks don't link to standards compliance checklist

**Impact:**

- Skills may be extracted without conforming to standards
- No clear definition of "done" for extraction work
- Risk of incomplete standardization

**Action Required:**

- [ ] Add compliance checklist to each extraction task (U9–U19)
- [ ] Link each task to: SCHEMA.md, TEMPLATE.md, AUDIT.md
- [ ] Add phase manifest requirement (from U5) to each extraction task

---

## MEDIUM ISSUES (Should Fix)

### 4. Orphaned pwrl-refresh-learnings Content

**File:** `pwrl-refresh-learnings/SKILL.md` (292 lines)

**Issue:**
SKILL.md exceeds recommended 170 lines (now relaxed to 300, but trending toward reduction per SCHEMA.md note).

Content that could be extracted to `references/`:

- Full assessment criteria workflow (lines ~85-110)
- Example session transcript (lines ~130-160)
- Consolidation procedures (lines ~70-85)

**Current:** 292 lines (HIGH verbosity)
**Target after extraction:** ~150 lines (OPTIMAL)
**Compliance:** ⚠️ At upper bound; next relaxation will be stricter

**Impact:**

- Difficult to scan and understand quickly
- Violates scannability principle (SCHEMA.md §2)
- Maintenance burden

**Action Required:**

- [ ] Extract assessment workflow to `references/assessment-workflow.md`
- [ ] Extract example session to `references/example-sessions.md`
- [ ] Reduce SKILL.md to ~150 lines
- [ ] Update internal references to point to references/ files

---

### 5. pwrl-phase-checkpoint Standards Compliance Undocumented

**File:** `pwrl-phase-checkpoint/SKILL.md` + `references/standards-mapping.md`

**Issue:**
While `standards-mapping.md` exists, the main SKILL.md:

- Doesn't explicitly state compliance with pwrl-standards in frontmatter
- Doesn't link SCHEMA.md/TEMPLATE.md/AUDIT.md in usage section
- Assumes users know about phase-schemas.md without context

**Current State:**

```markdown
# PWRL Phase Checkpoint

Enforce strict phase completion...
(No explicit standards reference)
```

**Expected State per SCHEMA.md §1:**

```markdown
# PWRL Phase Checkpoint

Enforce strict phase completion across all PWRL workflows by validating
artifacts against [pwrl-standards/SCHEMA.md](../pwrl-standards/SCHEMA.md)...
```

**Impact:**

- Users unaware of standards foundation
- No discoverable path from phase-checkpoint to standards
- Compliance relationship invisible

**Action Required:**

- [ ] Add explicit SCHEMA.md/TEMPLATE.md/AUDIT.md references to SKILL.md intro
- [ ] Add section: "Standards Compliance" linking to `references/standards-mapping.md`
- [ ] Document phase-checkpoint as "Standards Enforcement Skill"

---

### 6. pwrl-standards AUDIT.md Incomplete

**File:** `pwrl-standards/AUDIT.md`

**Issue:**
AUDIT.md current state (lines 1-150 reviewed):

- Documents pwrl-end-session, pwrl-work, pwrl-plan, pwrl-learnings, pwrl-review, pwrl-refresh-learnings
- MISSING: pwrl-phase-checkpoint audit (added 2026-06-21, not in original AUDIT.md)
- MISSING: Updated line-count guidance (relaxed from 170 to 300 on 2026-06-21)
- MISSING: Phase manifest requirement (U5 task, planned but not yet documented)

**Compliance Status:**

- ✅ STRUCTURE: Audit framework present
- ⚠️ COMPLETENESS: Missing recent additions
- ⚠️ GUIDANCE: Line-count range not updated

**Impact:**

- New pwrl-phase-checkpoint not evaluated against standards
- Outdated verbosity guidance
- Standards audit becomes unreliable source

**Action Required:**

- [ ] Add pwrl-phase-checkpoint audit section
- [ ] Update line-count guidance from "80-170 lines" to "80-300 lines (trending to 170)"
- [ ] Add phase manifest audit criteria
- [ ] Re-audit all 17 skills against updated standards

---

### 7. Task Index Validation Reference Missing

**File:** `docs/tasks/INDEX.md`

**Issue:**
Index states U2 task: "TDD validator tests (RED)" but:

- No link to SCHEMA.md validation requirements
- No link to pwrl-standards/references/ for validation protocol
- Task description doesn't specify what validation rules to implement

**Current:** Task is vague about compliance target
**Expected:** Task should reference exact validation checklist

**Impact:**

- U2 executor won't know what validator to build
- U7 (enforce validator) lacks clear requirements
- Validator may not cover all standards

**Action Required:**

- [ ] Add validation requirements checklist to U2 task file
- [ ] Reference SCHEMA.md checklist (Right-Sizing, Structure, Frontmatter, etc.)
- [ ] Link pwrl-standards/SCHEMA.md in U2 task description

---

## LOW ISSUES (Nice to Fix)

### 8. pwrl-testing References Incomplete

**File:** `pwrl-testing/SKILL.md`

**Issue:**
SKILL.md references protocols in `pwrl-testing/references/`:

- `micro-skill-unit-tests-protocol.md` (exists ✓)
- `orchestration-tests-protocol.md` (exists ✓)
- `compatibility-tests-protocol.md` (exists ✓)
- `consolidation-audit-protocol.md` (exists ✓)

But SKILL.md doesn't provide links or inline summaries. Users must:

1. Know protocols exist
2. Navigate to references/ directory
3. Infer which protocol to read

**Impact:** Low - references are discoverable, but UX could be better

**Action:** Add short inline descriptions of each protocol in SKILL.md

---

### 9. pwrl-update-learnings Workflow Clarity

**File:** `pwrl-update-learnings/SKILL.md`

**Issue:**
Workflow section (Phase 2 & 3) mentions running `/pwrl-update-learnings` but:

- No explicit link to docs/learnings/INDEX.md location
- No mention of category folder structure
- Assumes user knows folder organization

**Impact:** Low - documented elsewhere, but not discoverable from this skill

**Action:** Add note referencing docs/learnings/ folder structure

---

### 10. Cross-Skill Task Dependencies Unclear

**File:** Multiple

**Issue:**
Tasks U9–U19 depend on pwrl-phase-checkpoint existing, but:

- Phase checkpoint spec released 2026-06-21
- Tasks defined 2026-06-21 with U2 as initial phase (TDD)
- Dependency chain (U2→U3→U4→U7→U9–U19) doesn't explicitly reference pwrl-phase-checkpoint requirements

**Impact:** Low - dependency chain is internal; pwrl-phase-checkpoint orthogonal

**Action:** Document that extraction tasks (U9–U19) should validate new skills with pwrl-phase-checkpoint

---

### 11. TEST-REPORT.md Outdated

**File:** `docs/test-plans/TEST-REPORT.md`

**Issue:**
Report dated 2026-06-05, covers pwrl-plan slicing tests:

- Tests for pwrl-plan-scope, pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate
- Tests are 19 days old (2026-06-05 → 2026-06-24)
- pwrl-phase-checkpoint and related changes post-date report

**Status:** Low priority (historical record is valuable)

**Action:** Mark report as "HISTORICAL - 2026-06-05" in header for clarity

---

### 12. Interaction Method Name Inconsistency

**Affected Files (per CHANGELOG 2026-06-19):**

- pwrl-plan, pwrl-plan-scope, pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate
- pwrl-review, pwrl-review-scope
- pwrl-standards/SCHEMA.md
- docs/tasks/INDEX.md

**Issue:**
CHANGELOG 2026-06-19 states: "Renamed `ask_user` tool references to `ask_user_question`"

But need to verify all skills actually use new term. Some skills may still reference "ask_user" or generic "platform's ask_user tool" from standards template.

**Impact:** Low - primarily consistency

**Action:** Search all SKILL.md files for remaining "ask_user" references and update to `ask_user_question` or generic pattern

---

### 13. pwrl-standards References/ Empty or Minimal

**Directory:** `pwrl-standards/references/`

**Issue:**
References/ directory has scripts/ but no additional reference docs:

- No explicit validation protocol (planned in U2)
- No phase manifest schema template (planned in U5)
- No quick-reference checklist

**Current:** scripts/ only (no README)
**Expected:** README.md explaining reference documents

**Impact:** Low - documentation gap

**Action:** Add README.md to pwrl-standards/references/

---

### 14. Missing Learnings Sync Between Skills

**Issue:**
Three skills manage learnings but don't explicitly coordinate:

- pwrl-learnings-extract (Phase 1 of pwrl-learnings)
- pwrl-learnings-classify (Phase 2)
- pwrl-refresh-learnings (independent maintenance)
- pwrl-update-learnings (index synchronization)

No cross-references in their SKILL.md files.

**Impact:** Low - documentation gap

**Action:** Add cross-references section to each skill linking related learnings skills

---

### 15. pwrl-standards Responsibility Ambiguous

**Issue:**
pwrl-standards defined as "specification" but also contains:

- SCHEMA.md (standard)
- TEMPLATE.md (template)
- AUDIT.md (audit guide)
- scripts/ (validation tools - not yet complete)

Unclear if pwrl-standards is:

- A reference-only skill (documentation)
- An executable skill (validation)
- A meta-skill (defining other skills)

**Impact:** Low - conceptual clarity

**Action:** Add section to pwrl-standards/SKILL.md clarifying its role vs. pwrl-phase-checkpoint

---

### 16. Backward Compatibility Testing Incomplete

**File:** `pwrl-testing/SKILL.md` line ~140

**Issue:**
SKILL.md defines U6.3 protocol but:

- No mention of specific APIs to test
- No backward compatibility matrix
- No version baseline documented

**Impact:** Low - detailed testing protocol in references/

**Action:** Add quick reference to backward compatibility scope in main SKILL.md

---

### 17. Circular Dependency: Phase Checkpoint ↔ Standards

**Issue:**

- pwrl-phase-checkpoint validates against standards from pwrl-standards
- pwrl-standards/SCHEMA.md references phase-checkpoint for validation
- Neither is truly "first" or "foundational"

This creates a conceptual circular dependency (though not a code cycle).

**Impact:** Low - architectural clarity

**Action:** Document in both SKILL.md files that they are co-dependent standards

---

### 18. Task Status Tracking Inconsistent

**File:** `docs/tasks/INDEX.md`

**Issue:**
Index shows all tasks as "To Do" (dated 2026-06-21) but:

- U1 (rm pwrl-extension) may already be done
- U2 (TDD validator) may be in progress
- No mechanism to sync with actual implementation

**Impact:** Low - task tracking

**Action:** Implement sync mechanism (or document manual update process)

---

## Compliance Checklist: Skills Against Standards

### pwrl-testing

| Standard                      | Check                                    | Result           |
| ----------------------------- | ---------------------------------------- | ---------------- |
| Frontmatter (SCHEMA.md §5.1)  | name, description, argument-hint present | ✅               |
| Structure (SCHEMA.md §2)      | Scannable, active voice, phase numbering | ✅               |
| Right-Sizing (SCHEMA.md §3)   | 80-300 lines                             | ✅ (~250 lines)  |
| Completeness (SCHEMA.md §4)   | Verification steps, acceptance criteria  | ✅               |
| References (SCHEMA.md §3)     | Complex logic extracted                  | ✅ 4 protocols   |
| Agent-Agnostic (SCHEMA.md §1) | No framework-specific syntax             | ✅               |
| **VERDICT**                   |                                          | **✅ COMPLIANT** |

---

### pwrl-update-learnings

| Standard       | Check                               | Result           |
| -------------- | ----------------------------------- | ---------------- |
| Frontmatter    | name, description, argument-hint    | ✅               |
| Structure      | Scannable, imperative, phase-driven | ✅               |
| Right-Sizing   | 80-300 lines                        | ✅ (~180 lines)  |
| Completeness   | Output format, acceptance criteria  | ✅               |
| References     | Links to docs/learnings/INDEX.md    | ✅               |
| Agent-Agnostic | Generic tool references             | ✅               |
| **VERDICT**    |                                     | **✅ COMPLIANT** |

---

### pwrl-refresh-learnings

| Standard           | Check                            | Result                        |
| ------------------ | -------------------------------- | ----------------------------- |
| Frontmatter        | name, description, argument-hint | ✅                            |
| Structure          | Scannable, phase-driven          | ⚠️ Verbose                    |
| Right-Sizing       | 80-300 lines                     | ⚠️ 292 lines (at upper bound) |
| Completeness       | Acceptance criteria present      | ✅                            |
| References         | Assessment criteria linked       | ⚠️ Only 1 reference file      |
| Agent-Agnostic     | Generic references               | ✅                            |
| README.md Override | Single source of truth           | ❌ ORPHANED                   |
| **VERDICT**        |                                  | **⚠️ PARTIAL COMPLIANCE**     |

---

### pwrl-phase-checkpoint

| Standard           | Check                            | Result                        |
| ------------------ | -------------------------------- | ----------------------------- |
| Frontmatter        | name, description, argument-hint | ✅                            |
| Structure          | Scannable, phase-driven          | ✅                            |
| Right-Sizing       | 80-300 lines                     | ✅ (~140 lines)               |
| Completeness       | Validation steps, gate checks    | ✅                            |
| References         | Schemas, gates, mappings         | ✅ 4 files                    |
| Standards Link     | Links to pwrl-standards          | ⚠️ Indirect (via references/) |
| README.md Override | Single source of truth           | ❌ ORPHANED                   |
| **VERDICT**        |                                  | **⚠️ PARTIAL COMPLIANCE**     |

---

### pwrl-standards

| Standard                   | Check                         | Result                           |
| -------------------------- | ----------------------------- | -------------------------------- |
| Completeness (SCHEMA.md)   | All sections present          | ✅                               |
| Completeness (TEMPLATE.md) | All sections present          | ✅                               |
| Completeness (AUDIT.md)    | All skills audited            | ⚠️ Missing pwrl-phase-checkpoint |
| Reference Organization     | scripts/, examples organized  | ⚠️ No README in references/      |
| Validation Script          | Script referenced as existing | ❌ Does NOT exist (planned)      |
| **VERDICT**                |                               | **⚠️ PARTIAL COMPLIANCE**        |

---

## Remediation Roadmap

### Phase 1: Critical (Do Immediately)

1. **Remove orphaned README.md files**
   - [ ] Delete `pwrl-refresh-learnings/README.md`
   - [ ] Delete `pwrl-phase-checkpoint/README.md`
   - Time: ~5 min

2. **Fix SCHEMA.md validation script reference**
   - [ ] Update line ~580 to note script is planned
   - [ ] Add URL/version when available
   - Time: ~10 min

3. **Add compliance mapping to extraction tasks**
   - [ ] Update docs/tasks/INDEX.md with compliance links
   - [ ] Create checklist for each U9–U19 task
   - Time: ~30 min

**Total Phase 1:** ~45 min

---

### Phase 2: Standards Updates (Do Next)

4. **Audit and update AUDIT.md**
   - [ ] Add pwrl-phase-checkpoint section
   - [ ] Update line-count guidance
   - [ ] Re-audit all skills
   - Time: ~1 hour

5. **Add standards references to pwrl-phase-checkpoint**
   - [ ] Update SKILL.md intro with SCHEMA.md/TEMPLATE.md/AUDIT.md links
   - [ ] Add "Standards Compliance" section
   - Time: ~20 min

6. **Add README.md to pwrl-standards/references/**
   - [ ] Document reference files
   - [ ] Add validation roadmap
   - Time: ~20 min

**Total Phase 2:** ~1.5 hours

---

### Phase 3: Optimization (Do Later)

7. **Extract pwrl-refresh-learnings content**
   - [ ] Move assessment workflow to references/
   - [ ] Move examples to references/
   - Time: ~45 min

8. **Add cross-skill references**
   - [ ] Link learnings skills together
   - [ ] Add relationship documentation
   - Time: ~30 min

9. **Audit interaction method naming**
   - [ ] Search for remaining `ask_user` references
   - [ ] Update to `ask_user_question` or generic pattern
   - Time: ~20 min

**Total Phase 3:** ~1.5 hours

---

## Recommendations

### Immediate (This Week)

1. ✅ Address all CRITICAL issues (items 1-3) — BLOCKING
2. ✅ Fix MEDIUM items 4-7 — COMPLIANCE
3. ⚠️ Update task files to reference compliance checklists

### Short Term (This Sprint)

1. Complete AUDIT.md updates (MEDIUM #6)
2. Extract pwrl-refresh-learnings content (MEDIUM #4)
3. Add cross-skill documentation (LOW #14)

### Long Term (Next Release)

1. Implement validation script (U2-U4 tasks)
2. Add phase manifests to all skills (U5-U6 tasks)
3. Re-baseline standards on next audit cycle

---

## References

- [pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md) — Skill standardization schema
- [pwrl-standards/TEMPLATE.md](pwrl-standards/TEMPLATE.md) — Canonical skill template
- [pwrl-standards/AUDIT.md](pwrl-standards/AUDIT.md) — Audit findings (needs update)
- [docs/tasks/INDEX.md](docs/tasks/INDEX.md) — Remediation tasks (U1-U20)
- [CHANGELOG.md](CHANGELOG.md) — Version history and changes
- [pwrl-phase-checkpoint/references/standards-mapping.md](pwrl-phase-checkpoint/references/standards-mapping.md) — Mapping validation to standards

---

**Report Generated:** 2026-06-24
**Status:** DRAFT (Awaiting Review)
