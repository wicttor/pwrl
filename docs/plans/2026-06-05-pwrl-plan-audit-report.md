---
created: 2026-06-05
updated: 2026-06-05
auditor: GitHub Copilot
status: In Progress
---

# pwrl-plan\* Skills Audit Report

**Date:** 2026-06-05
**Scope:** 5 pwrl-plan\* micro-skills (pwrl-plan, pwrl-plan-design, pwrl-plan-generate, pwrl-plan-research, pwrl-plan-scope)
**Standards Baseline:** pwrl-standards/SCHEMA.md, TEMPLATE.md
**Overall Status:** PARTIALLY COMPLIANT - Core refactoring done, micro-skills need attention

---

## Executive Summary

The pwrl-plan skill family has been successfully refactored to meet project standards:

✅ **Completed:**

- Main orchestrator skill (`pwrl-plan`) refactored and compliant (103 lines)
- Critical reference files created (agent-routing.md, fallback-workflow.md, planning-tiers.md)
- Agent orchestrator verified (pwrl-planner.agent.md exists and is well-structured)
- Documentation updated (README.md, GUIDE.md)

⚠️ **In Progress:**

- Micro-skills (pwrl-plan-scope, pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate) exceed line limits
- Need to extract detailed workflows to `references/` subdirectories
- Need to create support files for each micro-skill

---

## Detailed Assessment

### 1. pwrl-plan (Main Orchestrator) ✅ COMPLIANT

**File:** `pwrl-plan/SKILL.md`
**Lines:** 103 (Target: 100-150, Max: 170) ✓ **WITHIN STANDARDS**

**Changes Made:**

- ✅ Description shortened from 210 chars to 145 chars
- ✅ Content extracted to 3 reference files:
  - `references/agent-routing.md` (76 lines) — Detection logic, troubleshooting
  - `references/fallback-workflow.md` (180 lines) — Complete Phase 1-4 monolithic workflow
  - `references/planning-tiers.md` (220 lines) — Tier descriptions and heuristics

**Frontmatter Compliance:** ✅ COMPLIANT

```yaml
name: pwrl-plan
description: "Create structured implementation plans with three tiers..."
argument-hint: "[task description, requirements doc, or goal to plan]"
```

**Structure:** ✅ COMPLIANT

- Imperative mood: Yes
- Active voice: Yes
- Clear headers: Yes
- Phase numbering: Yes
- References to support files: Yes

**Recommendation:** ✅ APPROVED FOR MERGE

---

### 2. pwrl-plan-scope (S2: Scope Gathering) ⚠️ NEEDS WORK

**File:** `pwrl-plan-scope/SKILL.md`
**Lines:** 201 (Target: 100-150, Max: 170) ✗ **EXCEEDS BY 31 LINES**

**Frontmatter:** ✅ COMPLIANT

```yaml
name: pwrl-plan-scope
description: "Gather context, check learnings, validate domain..."
argument-hint: "[task description, requirements doc, or goal to plan]"
```

**What Needs Extraction:**

- Step 4: Learnings Index Gate (complex logic with examples)
- Edge cases (Examples 1-7, ~50 lines)
- State passing schema (20 lines)
- References section (could be referenced, not embedded)

**Recommended Action:**

1. Create `pwrl-plan-scope/references/` directory
2. Extract to:
   - `learnings-gate-logic.md` — Detailed learnings index logic
   - `edge-cases.md` — All 7 edge case handlers
   - `state-schema.md` — Output schema and versioning

**Target Size After Refactoring:** 140-150 lines

---

### 3. pwrl-plan-research (S3: Research & Findings) ⚠️ NEEDS WORK

**File:** `pwrl-plan-research/SKILL.md`
**Lines:** 217 (Target: 100-150, Max: 170) ✗ **EXCEEDS BY 47 LINES**

**Frontmatter:** ✅ COMPLIANT

**What Needs Extraction:**

- Step 2: High-Risk Area Detection (detailed keyword table, ~40 lines)
- Step 4: External Research Guidance (could be simplified)
- Edge cases (Examples 1-7, ~45 lines)
- State schema (20 lines)

**Recommended Action:**

1. Create `pwrl-plan-research/references/` directory
2. Extract to:
   - `high-risk-detection.md` — Risk keywords and area definitions
   - `external-research-guidance.md` — Librarian queries and search patterns
   - `edge-cases.md` — Edge case handlers
   - `state-schema.md` — Output schema

**Target Size After Refactoring:** 140-150 lines

---

### 4. pwrl-plan-design (S4: Design & Units) ⚠️ NEEDS WORK

**File:** `pwrl-plan-design/SKILL.md`
**Lines:** 221 (Target: 100-150, Max: 170) ✗ **EXCEEDS BY 51 LINES**

**Frontmatter:** ✅ COMPLIANT

**What Needs Extraction:**

- Step 3: U-ID Generator implementation (code example, ~15 lines)
- Step 6-8: Complex edge cases (Examples 1-7, ~80 lines)
- State schema (25 lines)

**Recommended Action:**

1. Create `pwrl-plan-design/references/` directory
2. Extract to:
   - `u-id-generator.md` — Implementation pattern and stability rules
   - `edge-cases.md` — All 7 edge case handlers with detailed explanations
   - `state-schema.md` — Output schema and field descriptions
   - `mermaid-diagram-guide.md` — When/how to generate diagrams

**Target Size After Refactoring:** 140-150 lines

---

### 5. pwrl-plan-generate (S5: Plan Generation) ⚠️ NEEDS WORK

**File:** `pwrl-plan-generate/SKILL.md`
**Lines:** 216 (Target: 100-150, Max: 170) ✗ **EXCEEDS BY 46 LINES**

**Frontmatter:** ✅ COMPLIANT

**What Needs Extraction:**

- Step 3: Render Plan Sections (detailed per-tier logic, ~60 lines)
- Edge cases (Examples 1-7, ~50 lines)
- State schema (20 lines)

**Recommended Action:**

1. Create/enhance `pwrl-plan-generate/references/` directory
2. Files to create:
   - `render-workflow.md` — Detailed rendering logic per tier
   - `edge-cases.md` — All 7 edge case handlers
   - `state-schema.md` — Input/output schemas
3. Keep existing `tier-heuristic.md` (already created during task S5)

**Target Size After Refactoring:** 140-150 lines

---

## Standards Compliance Summary

### Frontmatter (YAML) ✅ ALL COMPLIANT

| Skill              | name | description | argument-hint |
| ------------------ | ---- | ----------- | ------------- |
| pwrl-plan          | ✅   | ✅          | ✅            |
| pwrl-plan-scope    | ✅   | ✅          | ✅            |
| pwrl-plan-research | ✅   | ✅          | ✅            |
| pwrl-plan-design   | ✅   | ✅          | ✅            |
| pwrl-plan-generate | ✅   | ✅          | ✅            |

### Line Count Compliance

| Skill              | Lines | Status       | Variance        |
| ------------------ | ----- | ------------ | --------------- |
| pwrl-plan          | 103   | ✅ COMPLIANT | -47 from target |
| pwrl-plan-scope    | 201   | ⚠️ EXCEEDS   | +31 over max    |
| pwrl-plan-research | 217   | ⚠️ EXCEEDS   | +47 over max    |
| pwrl-plan-design   | 221   | ⚠️ EXCEEDS   | +51 over max    |
| pwrl-plan-generate | 216   | ⚠️ EXCEEDS   | +46 over max    |

### Tone & Structure ✅ ALL COMPLIANT

- Imperative mood: ✅ All use "Do X" not "X should be"
- Active voice: ✅ All use "Create" not "is created"
- Scannable headers: ✅ All have action-oriented headers
- Phase numbering: ✅ All clearly numbered
- Agent-agnostic language: ✅ All use platform's ask_user terminology

### Support File Organization

| Skill              | references/                   | Status         |
| ------------------ | ----------------------------- | -------------- |
| pwrl-plan          | ✅ 3 files                    | COMPLETE       |
| pwrl-plan-scope    | ❌ none                       | NEEDS CREATION |
| pwrl-plan-research | ❌ none                       | NEEDS CREATION |
| pwrl-plan-design   | ❌ none                       | NEEDS CREATION |
| pwrl-plan-generate | ✅ 1 file (tier-heuristic.md) | NEEDS 3 MORE   |

---

## Documentation Updates Completed

✅ **README.md**

- Added "Planning Micro-Skills (Internal)" section
- Documented the four-skill workflow (S2-S5)
- Clarified that micro-skills are called automatically

✅ **GUIDE.md**

- Added "Planning with pwrl-plan" section (~100 lines)
- Documented three tiers (Fast, Standard, Deep)
- Documented four-phase workflow with details
- Added best practices for planning
- Added plan quality checklist

✅ **.agents/agents/pwrl-planner.agent.md**

- Already exists and is well-structured
- No changes needed

---

## Recommended Next Steps (Priority Order)

### PRIORITY 1: Refactor Micro-Skills (1-2 hours)

1. **Extract pwrl-plan-scope to references/**
   - Create: learnings-gate-logic.md, edge-cases.md, state-schema.md
   - Target: ~140 lines in SKILL.md

2. **Extract pwrl-plan-research to references/**
   - Create: high-risk-detection.md, external-research-guidance.md, edge-cases.md, state-schema.md
   - Target: ~140 lines in SKILL.md

3. **Extract pwrl-plan-design to references/**
   - Create: u-id-generator.md, edge-cases.md, state-schema.md, mermaid-diagram-guide.md
   - Target: ~140 lines in SKILL.md

4. **Extract pwrl-plan-generate to references/**
   - Create: render-workflow.md, edge-cases.md, state-schema.md
   - Enhance existing: tier-heuristic.md
   - Target: ~140 lines in SKILL.md

### PRIORITY 2: Verification (30 min)

1. Line count check: Confirm all skills ≤ 170 lines
2. Cross-reference check: Verify all skill-to-skill references are correct
3. Documentation check: Verify README and GUIDE reference the skills correctly
4. Test agent orchestration: Confirm pwrl-planner.agent.md still works with refactored skills

### PRIORITY 3: Enhancement (Optional, future)

1. Add examples/ subdirectory to each skill with sample outputs
2. Create mermaid diagrams in references/ for complex workflows
3. Add "Frequently Asked Questions" to each skill
4. Create video walkthrough guides

---

## Files Modified in This Audit

### Created Files

- ✅ `/home/wicttor/Projects/pwrl/pwrl-plan/references/agent-routing.md`
- ✅ `/home/wicttor/Projects/pwrl/pwrl-plan/references/fallback-workflow.md`
- ✅ `/home/wicttor/Projects/pwrl/pwrl-plan/references/planning-tiers.md`

### Modified Files

- ✅ `/home/wicttor/Projects/pwrl/pwrl-plan/SKILL.md` (refactored, 246 → 103 lines)
- ✅ `/home/wicttor/Projects/pwrl/README.md` (added planning micro-skills section)
- ✅ `/home/wicttor/Projects/pwrl/GUIDE.md` (added planning workflow section)

### Verified Existing Files

- ✅ `/home/wicttor/Projects/pwrl/.agents/agents/pwrl-planner.agent.md` (well-structured, no changes needed)
- ✅ `/home/wicttor/Projects/pwrl/pwrl-plan-generate/references/tier-heuristic.md` (already exists)

---

## Conclusion

The pwrl-plan skill family is **PARTIALLY COMPLIANT** with project standards:

**Completed:**

- Main orchestrator skill fully refactored and compliant
- Agent orchestration file verified
- Documentation updated
- Core reference files created

**Remaining:**

- Extract micro-skill details to references/ (4 skills, ~2 hours work)
- Verify all cross-references and integration

**Recommendation:**
✅ APPROVE current changes for merge
⏳ SCHEDULE micro-skill refactoring for next iteration (high priority)

---

## Standards References

- **[pwrl-standards/SCHEMA.md](../pwrl-standards/SCHEMA.md)** — Canonical format specification
- **[pwrl-standards/TEMPLATE.md](../pwrl-standards/TEMPLATE.md)** — Skill template
- **[pwrl-standards/AUDIT.md](../pwrl-standards/AUDIT.md)** — Standardization audit framework (original, May 1st)
