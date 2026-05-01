# PWRL Skills Audit Report

**Date:** 2026-05-01
**Auditor:** AI Infrastructure Engineer
**Scope:** 6 pwrl-\* skills
**Purpose:** Document current state inconsistencies and guide migration to standardized format

---

## Executive Summary

### Current State Overview

| Skill                  | Lines | Status      | Verbosity | Structure | Support Files     |
| ---------------------- | ----- | ----------- | --------- | --------- | ----------------- |
| pwrl-end-session       | 49    | Too concise | Minimal   | Good      | None              |
| pwrl-work              | 133   | ✅ Optimal  | Balanced  | Good      | None              |
| pwrl-plan              | 192   | Too verbose | High      | Good      | None (needs refs) |
| pwrl-learnings         | 218   | Too verbose | High      | Good      | ✅ Well-organized |
| pwrl-review            | 237   | Too verbose | High      | Good      | Partial (1 file)  |
| pwrl-refresh-learnings | 292   | Too verbose | Very High | Good      | Partial (README)  |

**Target:** 100-150 lines (±20 acceptable)

### Key Findings

**1. Verbosity Inconsistency**

- **Range:** 49 to 292 lines (6x variation)
- **Issue:** Only pwrl-work meets target range
- **Root Cause:** No prior verbosity guidelines; detailed content not extracted to references/

**2. Structure Consistency** ✅

- All skills use YAML frontmatter correctly
- All have clear workflow sections with phases
- Section naming is generally consistent

**3. Support File Organization**

- **Strong:** pwrl-learnings (references/, assets/ well-utilized)
- **Weak:** Most skills have no support files despite containing extractable content
- **Missing:** pwrl-plan needs references/ for templates; pwrl-review needs references/ for protocols

**4. Tone & Style**

- **Good:** Generally imperative mood and active voice
- **Minor issues:** Some passive constructions; occasional tool-specific language
- **Consistent:** All use scannable bullet lists and numbered workflows

**5. Agent-Agnostic Compliance** ✅ (mostly)

- Most skills avoid tool-specific language
- Some references to "Memory" and platform-specific features need genericization
- All paths are repository-relative (compliant)

---

## Skill-by-Skill Analysis

### 1. pwrl-end-session

**File:** `pwrl-end-session/SKILL.md`
**Lines:** 49
**Assessment:** Too concise; needs expansion for clarity

#### Frontmatter Analysis

```yaml
name: pwrl-end-session
description: Create a single clear commit at session end capturing state and next steps.
argument-hint: "[Optional: reason for ending session or switching tasks]"
```

✅ **Compliant** — All required fields present, well-formatted

#### Structure Analysis

**Present Sections:**

- Title & opening (1 line)
- Flow (concise) — workflow section
- Rules (short)
- Acceptance Criteria

**Missing Sections:**

- Purpose (expanded rationale)
- Usage examples
- Sufficient workflow detail

**Issues:**

1. **Too terse** — Only 49 lines; needs 80-120 for clarity
2. **Missing Purpose section** — Should explain why session commits matter
3. **Workflow lacks detail** — "Pre-flight", "Confirm", "Prepare message", "Commit" phases could be expanded with concrete steps
4. **Incomplete message guidance** — List of message types is helpful but lacks examples

**Required Changes:**

- Expand Purpose section (add 6-8 lines explaining value of session commits)
- Expand workflow phases with numbered steps (add ~30 lines)
- Add concrete examples of good commit messages
- **Target:** 100-110 lines

**Content to Preserve:**

- Concise "Flow" structure (good skeleton)
- Clear rules about [AGENT: ...] trailer and not pushing
- Acceptance criteria

**Extractable Content:** None (all should stay inline)

---

### 2. pwrl-work

**File:** `pwrl-work/SKILL.md`
**Lines:** 133
**Assessment:** ✅ Optimal — minimal changes needed

#### Frontmatter Analysis

```yaml
name: pwrl-work
description: Execute implementation work efficiently while maintaining quality and shipping complete features
argument-hint: "[Plan doc path or work description. Leave blank to use the latest plan-like document]"
```

✅ **Compliant** — Well-formatted, descriptive

#### Structure Analysis

**Present Sections:**

- Title & opening
- Input pattern (document-based)
- Workflow (5 phases with numbered steps)
- Quality Criteria
- Pitfalls to Avoid

✅ **Well-structured** — Clear phases with actionable steps

**Issues:**

1. **Minor:** Phase 0 naming ("Triage Input") is good; others could be more action-oriented
2. **Minor:** "Pitfalls to Avoid" could be "Best Practices" for positive framing
3. **Agent-specific references:** Mentions "task tracker" but doesn't specify it's platform-generic

**Required Changes:**

- Rename phases to be consistently action-oriented:
  - Phase 0: Triage Input ✅ (good as-is)
  - Phase 1: Prepare → "Prepare Context and Environment"
  - Phase 2: Execute ✅ (good as-is)
  - Phase 3: Simplify and Review ✅ (good as-is)
  - Phase 4: Ship ✅ (good as-is)
- Rename "Pitfalls to Avoid" to "Best Practices" or keep as "Rules"
- Minor tone polishing (ensure all steps use imperative mood)
- **Target:** 130-140 lines (minimal change)

**Content to Preserve:**

- Entire workflow structure (excellent model)
- Quality criteria
- Triage routing logic (trivial/small/medium/large)

**Extractable Content:** None needed

---

### 3. pwrl-plan

**File:** `pwrl-plan/SKILL.md`
**Lines:** 192
**Assessment:** Too verbose; extract templates to references/

#### Frontmatter Analysis

```yaml
name: pwrl-plan
description: "Create structured implementation plans for any task. Supports three tiers: Fast (lightweight), Standard (technical), and Deep (high-confidence/risky)."
argument-hint: "[task description, requirements doc, or goal to plan]"
```

✅ **Compliant** — Descriptive and clear

#### Structure Analysis

**Present Sections:**

- Title & opening
- Interaction Method (ask_user guidance)
- Core Principles
- Plan Quality Bar
- Planning Tiers
- Workflow (4 phases)
- Plan Templates (3 full templates inline: Fast, Standard, Deep)
- Rules of Execution

✅ **Strong workflow** — Clear phases with decision points

**Issues:**

1. **Too verbose** — 192 lines, target is 120-150
2. **Templates inline** — Fast/Standard/Deep plan templates consume ~80 lines; should be in references/
3. **Tier descriptions** — Could be abbreviated in main file, detailed in references/
4. **"Rules of Execution"** — More like guidelines; could be "Best Practices"

**Required Changes:**

- Extract plan templates to `pwrl-plan/references/plan-templates.md`:
  - Fast Plan template
  - Standard Plan template
  - Deep Plan template
  - Include full markdown with examples in references/
- Condense Planning Tiers section to brief descriptions + link to references/
- Update workflow to reference: "Read `references/plan-templates.md` for format"
- Rename "Rules of Execution" to "Best Practices"
- **Target:** 130-140 lines main file

**Content to Preserve:**

- Core Principles (excellent)
- Plan Quality Bar
- Workflow phases
- Tier selection guidance (abbreviated)

**Content to Extract:**

- All 3 plan templates → `references/plan-templates.md` (~80 lines)
- Optionally: Detailed tier selection criteria → `references/tier-selection.md` (~20 lines)

**New References Structure:**

```
pwrl-plan/
  SKILL.md (130-140 lines)
  references/
    plan-templates.md (80-100 lines) ← CREATE
    tier-selection.md (20-30 lines) ← CREATE (optional)
```

---

### 4. pwrl-learnings

**File:** `pwrl-learnings/SKILL.md`
**Lines:** 218
**Assessment:** Too verbose; good support structure but needs condensing

#### Frontmatter Analysis

```yaml
name: pwrl-learnings
description: Document a recently solved problem or insight while context is fresh
```

✅ **Compliant** — Clear and concise

#### Structure Analysis

**Present Sections:**

- Title & Purpose
- Usage
- Support Files (lists references/)
- Workflow (9 phases with detailed steps)
- Best Practices

✅ **Excellent support file organization:**

- `references/schema.yaml` ✓
- `references/categories.md` ✓
- `assets/templates.md` ✓

**Issues:**

1. **Too verbose** — 218 lines, target is 110-140
2. **Redundant explanations** — Content in main file duplicates what's in references/
3. **Phase 6 "Check for Existing Docs"** — Could be condensed
4. **Phase 9 "Consider Refresh"** — Very detailed (30+ lines); should be brief with link to pwrl-refresh-learnings

**Required Changes:**

- Condense Workflow phases by removing redundant explanations:
  - Phase 2: Instead of listing all categories inline, just say "Read `references/schema.yaml` to determine category"
  - Phase 3: Instead of repeating template details, just say "Read `assets/templates.md` and choose appropriate template"
  - Phase 9: Condense refresh suggestion logic to 5-8 lines; it's detailed enough in pwrl-refresh-learnings
- Remove duplicate "What It Captures" section if workflow already covers it
- **Target:** 120-130 lines

**Content to Preserve:**

- Support Files section (excellent reference)
- Core workflow steps (just condense explanations)
- Best Practices section

**Content to Extract:** None needed (support files already well-organized)

**Existing References (Keep as-is):**

- `references/schema.yaml` ✓
- `references/categories.md` ✓
- `assets/templates.md` ✓

---

### 5. pwrl-review

**File:** `pwrl-review/SKILL.md`
**Lines:** 237
**Assessment:** Too verbose; extract protocols to references/

#### Frontmatter Analysis

```yaml
name: pwrl-review
description: "Standard code review focusing on correctness, maintainability, security, and testing. Returns findings in a simple checklist format."
argument-hint: "[branch/PR or tokens like depth:fast, subagents:on]"
```

✅ **Compliant** — Clear, describes both what and tokens

#### Structure Analysis

**Present Sections:**

- Title & opening
- When to Use
- Review Scope (detailed list of what's examined)
- Severity Levels (P0-P3 table)
- Argument Parsing & Depth Control (complex)
- Workflow (4 phases with subagent orchestration)
- Customization
- Example Invocations

✅ **Existing reference:**

- `references/validator-template.md` ✓

**Issues:**

1. **Too verbose** — 237 lines, target is 130-150
2. **Severity table inline** — P0-P3 definitions consume ~15 lines; extract to references/
3. **Subagent orchestration** — Detailed protocol (~30 lines in workflow); extract to references/
4. **Depth control tokens** — Complex parsing logic; could be more concise
5. **Review lenses** — Six detailed review area descriptions (~40 lines); could be table or extracted

**Required Changes:**

- Extract severity definitions to `pwrl-review/references/severity-guide.md`:
  - P0-P3 level definitions
  - When to use each level
  - Examples of each severity
- Extract subagent orchestration to `pwrl-review/references/subagent-protocol.md`:
  - Subagent facility detection
  - Reviewer persona assignments (correctness, testing, maintainability, security, performance, api)
  - JSON contract specifications
  - Artifact generation (depth:deep mode)
- Condense review lenses to brief bullets + reference link
- Simplify depth control explanation (keep tokens, reduce prose)
- **Target:** 135-145 lines main file

**Content to Preserve:**

- Workflow structure (excellent)
- Depth token system (fast/standard/deep)
- Example Invocations (very helpful)
- Existing validator-template.md reference

**Content to Extract:**

- Severity guide → `references/severity-guide.md` (~25 lines)
- Subagent protocol → `references/subagent-protocol.md` (~40 lines)

**New References Structure:**

```
pwrl-review/
  SKILL.md (135-145 lines)
  references/
    validator-template.md ✓ (existing)
    severity-guide.md ← CREATE
    subagent-protocol.md ← CREATE
```

---

### 6. pwrl-refresh-learnings

**File:** `pwrl-refresh-learnings/SKILL.md`
**Lines:** 292
**Assessment:** Too verbose; extract assessment criteria

#### Frontmatter Analysis

```yaml
name: pwrl-refresh-learnings
description: Review and update existing learnings to keep knowledge current
```

✅ **Compliant** — Clear description

#### Structure Analysis

**Present Sections:**

- Title & Purpose
- Usage
- Workflow (8 phases with very detailed substeps)
- Refresh Triggers (when to use / when not to use)
- Guidelines (Update vs Consolidate, Archive vs Delete, Batch vs Targeted)

✅ **Additional file:**

- `README.md` (user-facing quickstart) ✓

**Issues:**

1. **Too verbose** — 292 lines, target is 120-140
2. **Phase 4 "Categorize Findings"** — Detailed status descriptions (~30 lines); could be table + extract
3. **Phase 7 "Execute Updates"** — Very detailed update procedures (~60 lines); extract to references/
4. **Guidelines section** — Helpful but lengthy (~40 lines); extract detailed decision criteria

**Required Changes:**

- Condense Phase 4: Use emoji table for status categories (keep inline); extract detailed guidance
- Extract Phase 7 update procedures to `pwrl-refresh-learnings/references/assessment-criteria.md`:
  - Detailed "For updates" procedure
  - "For superseded docs" procedure
  - "For consolidations" procedure
  - "For archives" procedure
- Condense Guidelines section to brief principles + reference link
- Keep Refresh Triggers section (helpful for users)
- **Target:** 125-135 lines main file

**Content to Preserve:**

- Workflow skeleton (all 8 phases, just condense steps)
- Refresh Triggers (when to use)
- Status category table (emoji + brief descriptions)

**Content to Extract:**

- Assessment criteria → `references/assessment-criteria.md` (~70 lines):
  - Detailed freshness assessment methodology
  - Update execution procedures (🟡)
  - Superseded handling (🟠)
  - Consolidation process (🔴)
  - Archive process (⚫)
  - Guidelines section content

**New References Structure:**

```
pwrl-refresh-learnings/
  SKILL.md (125-135 lines)
  README.md ✓ (existing, keep as-is)
  references/
    assessment-criteria.md ← CREATE
```

---

## Comparative Analysis

### Verbosity Distribution

```
Lines:    0    50   100   150   200   250   300
          |     |     |     |     |     |     |
end-session:    ■■■■■ (49) ← Too concise
work:                ■■■■■■■■■■■ (133) ← ✅ Optimal
plan:                     ■■■■■■■■■■■■■■■ (192) ← Too verbose
learnings:                      ■■■■■■■■■■■■■■■■■ (218) ← Too verbose
review:                          ■■■■■■■■■■■■■■■■■■ (237) ← Too verbose
refresh-learn:                          ■■■■■■■■■■■■■■■■■■■■■■ (292) ← Too verbose

Target Range: [100────────────150]
Acceptable:   [80──────────────────170]
```

### Section Consistency Matrix

| Section                     | end-session | work | plan | learnings | review | refresh |
| --------------------------- | ----------- | ---- | ---- | --------- | ------ | ------- |
| YAML Frontmatter            | ✅          | ✅   | ✅   | ✅        | ✅     | ✅      |
| Title & Purpose             | ⚠️ Minimal  | ✅   | ✅   | ✅        | ✅     | ✅      |
| Usage/Input                 | ❌          | ✅   | ✅   | ✅        | ❌     | ✅      |
| Workflow with Phases        | ⚠️ Terse    | ✅   | ✅   | ✅        | ✅     | ✅      |
| Output/Acceptance           | ✅          | ✅   | ❌   | ✅        | ⚠️     | ✅      |
| Rules/Best Practices        | ✅          | ✅   | ✅   | ✅        | ❌     | ✅      |
| When to Use / Examples      | ❌          | ❌   | ❌   | ❌        | ✅     | ✅      |
| Support Files Documentation | N/A         | N/A  | ❌   | ✅        | ⚠️     | ⚠️      |

**Legend:**

- ✅ Present and compliant
- ⚠️ Present but needs improvement
- ❌ Missing or should be added
- N/A Not applicable

### Support File Utilization

| Skill          | references/ | assets/ | examples/ | scripts/ | Assessment     |
| -------------- | ----------- | ------- | --------- | -------- | -------------- |
| end-session    | ❌          | ❌      | ❌        | ❌       | None needed    |
| work           | ❌          | ❌      | ❌        | ❌       | None needed    |
| plan           | ❌ _needs_  | ❌      | ❌        | ❌       | Should add     |
| learnings      | ✅ (3)      | ✅ (1)  | ✅ (dir)  | ❌       | ✅ Excellent   |
| review         | ✅ (1)      | ❌      | ❌        | ❌       | Should add (2) |
| refresh-learn. | ❌ _needs_  | ❌      | ❌        | ❌       | Should add     |

### Tone & Style Issues

| Issue Type            | Count | Affected Skills            | Severity |
| --------------------- | ----- | -------------------------- | -------- |
| Passive voice         | Low   | plan, review               | Minor    |
| Tool-specific refs    | Low   | plan (Memory), review      | Minor    |
| Redundant explanation | High  | learnings, refresh, review | Moderate |
| Missing imperatives   | Low   | end-session                | Minor    |
| Absolute paths        | None  | —                          | N/A      |

---

## Migration Priority & Risk

### Priority Order (Suggested)

1. **pwrl-end-session** (Low Risk, Low Effort)
   - **Why first:** Smallest, needs expansion not extraction
   - **Effort:** 1-2 hours
   - **Risk:** Low (adding content, not removing)

2. **pwrl-work** (Low Risk, Low Effort)
   - **Why second:** Already optimal, minimal changes
   - **Effort:** 30 minutes
   - **Risk:** Very low (minor tweaks only)

3. **pwrl-plan** (Medium Risk, Medium Effort)
   - **Why third:** Clear extraction target (templates)
   - **Effort:** 2-3 hours
   - **Risk:** Medium (must ensure template links work)

4. **pwrl-learnings** (Low Risk, Medium Effort)
   - **Why fourth:** Good support structure, just condense
   - **Effort:** 1-2 hours
   - **Risk:** Low (support files already exist)

5. **pwrl-refresh-learnings** (Medium Risk, High Effort)
   - **Why fifth:** Complex, needs new references/ extraction
   - **Effort:** 3-4 hours
   - **Risk:** Medium (substantial content movement)

6. **pwrl-review** (High Risk, High Effort)
   - **Why last:** Most complex, multiple extractions, subagent protocol
   - **Effort:** 3-4 hours
   - **Risk:** High (critical skill, complex orchestration logic)

### Risk Mitigation

**For all migrations:**

1. Create backup: `cp SKILL.md SKILL.md.backup` before editing
2. Extract content to references/ BEFORE removing from main file
3. Test all internal links after migration
4. Validate YAML frontmatter doesn't break
5. Commit each skill migration separately for easy rollback

**High-risk migrations (pwrl-review):**

- Review subagent orchestration logic carefully
- Test validator-template.md integration
- Verify depth token parsing still works
- Consider staged rollout or user testing

---

## Standardization Benefits

### Expected Improvements

**Scannability:**

- Target 100-150 line range makes skills readable in one scroll
- Reduced cognitive load for agents parsing skills
- Clearer phase boundaries and step sequences

**Maintainability:**

- Support files allow updating details without touching main workflow
- Consistent structure means easier to find and fix issues
- Template extraction enables reuse across skills

**Agent Compatibility:**

- Consistent structure improves agent parsing reliability
- Generic language ensures compatibility across frameworks
- Clear linking between main file and references/

**User Experience:**

- More consistent invocation patterns
- Clearer usage examples and when-to-use guidance
- Better discovery through uniform structure

### Success Metrics

**Quantitative:**

- ✅ All 6 skills within 80-170 line range
- ✅ 100% of extractable content moved to references/
- ✅ Zero tool-specific language violations
- ✅ All internal links valid

**Qualitative:**

- Skills read smoothly with consistent voice
- Workflow steps are unambiguous
- Support files are discovered and used correctly
- No functionality lost during migration

---

## Validation Plan

### Pre-Migration Validation

- [ ] Schema document reviewed and approved
- [ ] Template document tested with sample skill
- [ ] Migration order confirmed
- [ ] Backup strategy established

### Per-Skill Migration Validation

- [ ] YAML frontmatter validates
- [ ] Line count within 80-170 range
- [ ] All extracted content in references/ and linked
- [ ] No passive voice or tool-specific language
- [ ] Workflow steps use imperative mood
- [ ] Diff reviewed: no unintended deletions

### Post-Migration Validation

- [ ] All 6 skills migrated
- [ ] Cross-references between skills updated if needed
- [ ] CONTRIBUTING.md updated with schema reference
- [ ] Final validation checklist completed
- [ ] Git history preserved (commits per skill)

---

## Appendix: Detailed Line Counts

### Current State (Pre-Migration)

```bash
$ wc -l pwrl-*/SKILL.md
   49 pwrl-end-session/SKILL.md
  133 pwrl-work/SKILL.md
  192 pwrl-plan/SKILL.md
  218 pwrl-learnings/SKILL.md
  237 pwrl-review/SKILL.md
  292 pwrl-refresh-learnings/SKILL.md
 ----
 1121 total

Average: 187 lines
Median: 205 lines
Range: 49-292 (6x variation)
```

### Target State (Post-Migration)

```
Skill                  | Current | Target  | Delta
-----------------------|---------|---------|-------
pwrl-end-session       |  49     | 110     | +61
pwrl-work              | 133     | 135     | +2
pwrl-plan              | 192     | 140     | -52
pwrl-learnings         | 218     | 130     | -88
pwrl-review            | 237     | 140     | -97
pwrl-refresh-learnings | 292     | 130     | -162
-----------------------|---------|---------|-------
Total                  | 1121    | 785     | -336
Average                | 187     | 131     | -56
Median                 | 205     | 135     | -70
Range                  | 49-292  | 110-140 | consistent
```

**Expected extraction:**

- plan: ~80 lines → references/plan-templates.md
- learnings: ~88 lines removed via condensing redundancies
- review: ~70 lines → references/ (severity-guide + subagent-protocol)
- refresh-learnings: ~100 lines → references/assessment-criteria.md

**Total content preserved:** All content either remains in main file or moves to references/; zero deletion

---

## Conclusion

The audit reveals significant verbosity inconsistency (6x variation) but generally strong structural foundations. All skills use YAML frontmatter correctly and have clear workflow phases. The primary remediation needed is:

1. **Expand:** pwrl-end-session (+61 lines for clarity)
2. **Preserve:** pwrl-work (minimal changes, already optimal)
3. **Extract:** pwrl-plan, pwrl-review, pwrl-refresh-learnings (move detailed content to references/)
4. **Condense:** pwrl-learnings (remove redundancies with existing references/)

Migration priority follows low-risk first, with pwrl-review (highest complexity) last. All migrations preserve content by moving to references/ rather than deleting. Success will be measured by 80-170 line compliance, zero tool-specific language, and all internal links valid.
