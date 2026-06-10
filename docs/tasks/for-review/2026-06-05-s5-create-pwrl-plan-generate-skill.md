---
unit-id: S5
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
status: done
created: 2026-06-05
dependencies: [S1, S2, S3, S4]
files:
  - skills/pwrl-plan-generate/SKILL.md (new)
  - skills/pwrl-plan-generate/references/tier-heuristic.md (new)
learnings: []
---

# S5: Create pwrl-plan-generate Micro-Skill

## Goal

Extract Phase 4 (Plan Generation) logic from monolithic `pwrl-plan/SKILL.md` into a standalone `pwrl-plan-generate` micro-skill. This skill chooses tier (Fast/Standard/Deep), renders plan from templates, embeds learnings, and saves the final plan to `docs/plans/`.

## Context

Phase 4 handles:
- Tier selection heuristic (Fast/Standard/Deep based on complexity)
- Template rendering and population
- Learnings embedding (from S2 scope gathering)
- Learning gap documentation
- File I/O: saving plan to `docs/plans/YYYY-MM-DD-NNN-<name>.md`
- Generating filename with proper format and sequencing

This task extracts that logic as an independent skill.

**Why this matters:** S5 is the final output step; a good plan generation is the bridge between planning and execution.

**Dependency:** Depends on S1, S2, S3, S4. Receives all state from previous skills.

## Related Learnings

- **Learning: Template Rendering in Skills** (if exists at `docs/learnings/template-rendering.md`)
  - *Applicability:* Guides template rendering approach; defines tier selection logic.

**Learning Gap:** If no learning for "Plan Filename Sequencing" or "Learnings Embedding Best Practices" exists, create one via `/pwrl-learnings` after S5 completes.

## Implementation Steps

1. **Extract Phase 4 Logic from pwrl-plan/SKILL.md**
   - Read Phase 4: Plan Generation section
   - Identify all sub-steps:
     - Tier selection (Fast/Standard/Deep)
     - Template loading from `references/plan-templates.md`
     - Section rendering: Goal, Key Decisions, Units, System-Wide Impact, Risks, etc.
     - Learnings embedding: Related Learnings section
     - Learning gaps documentation
     - File naming: `docs/plans/YYYY-MM-DD-NNN-<name>.md`
     - File I/O: save plan

2. **Design Skill Interface**
   - **Input:** Scoped context (S2) + Research findings (S3) + Units (S4)
   - **Output:** Plan file path + summary

3. **Create SKILL.md**
   - Path: `skills/pwrl-plan-generate/SKILL.md`
   - Implement tier selection:
     - Fast: 1-3 units, low complexity
     - Standard: 4-8 units, moderate complexity
     - Deep: 9+ units, high complexity
     - Allow user override if desired

4. **Implement Template Rendering**
   - Load appropriate template from `skills/pwrl-plan/references/plan-templates.md`
   - Render sections based on tier:
     - All tiers: Goal, Overview, Units, Test Scenarios, Related Learnings
     - Standard+: Key Technical Decisions, System-Wide Impact
     - Deep: High-Level Technical Design, Alternative Approaches, Risk Analysis, Operational Notes
   - Use simple string replacement or lightweight templating (no complex logic)

5. **Implement Learnings Embedding**
   - Use related learnings from S2 scope output
   - For each learning: include file path + short applicability rationale (1 line)
   - Document learning gaps: "No relevant learnings found for [area]"
   - Add follow-up action: "Document new learning with `/pwrl-learnings` after implementation"

6. **Implement Plan Filename Generation**
   - Format: `docs/plans/YYYY-MM-DD-NNN-<name>.md`
   - YYYY-MM-DD: Current date
   - NNN: Sequential number (001, 002, 003, etc.)
   - <name>: Slug derived from plan title (lowercase, hyphens)
   - Example: `2026-06-05-001-slice-pwrl-plan-skill.md`
   - Avoid conflicts: check existing files; increment NNN if needed

7. **Implement File I/O**
   - Save plan to `docs/plans/[filename].md`
   - Ensure frontmatter is correct (id, status, tier, created, updated)
   - Validate: plan is readable markdown, all paths are repository-relative
   - Return: file path + plan summary (first 100 words)

8. **Create references/tier-heuristic.md**
   - Document tier selection algorithm
   - Include decision tree and examples
   - Define: complexity indicators (unit count, risk level, number of decisions, etc.)

## Code Patterns

**Example: Tier Selection Logic**

```javascript
function selectTier(unitCount, riskLevel, decisionCount) {
  // Fast: simple tasks
  if (unitCount <= 3 && riskLevel === "low") {
    return "Fast";
  }
  
  // Deep: complex or risky tasks
  if (unitCount >= 9 || riskLevel === "high" || decisionCount >= 5) {
    return "Deep";
  }
  
  // Standard: middle ground
  return "Standard";
}
```

**Example: Template Rendering (pseudo-code)**

```javascript
function renderPlan(context, tier) {
  const template = loadTemplate(tier);
  
  let plan = template
    .replace("{{GOAL}}", context.goal)
    .replace("{{OVERVIEW}}", context.overview)
    .replace("{{UNITS}}", renderUnits(context.units))
    .replace("{{TEST_SCENARIOS}}", renderTests(context.tests));
  
  if (tier === "Standard" || tier === "Deep") {
    plan = plan
      .replace("{{KEY_DECISIONS}}", renderDecisions(context.decisions))
      .replace("{{SYSTEM_IMPACT}}", renderImpact(context.impact));
  }
  
  if (tier === "Deep") {
    plan = plan
      .replace("{{TECHNICAL_DESIGN}}", context.design)
      .replace("{{ALTERNATIVES}}", renderAlternatives(context.alts))
      .replace("{{RISKS}}", renderRisks(context.risks));
  }
  
  return plan;
}
```

**Example: Learnings Embedding**

```markdown
## Related Learnings

- **Learning: Implementation Unit Design** (at `docs/learnings/unit-design.md`)
  - *Applicability:* Guided decomposition into U1-U5; ensures unit stability.

- **Learning: State Management in Skills** (at `docs/learnings/state-management.md`)
  - *Applicability:* Informs how state passes from S2→S3→S4→S5; validates schema design.

## Learning Gaps

- **Missing Learning: "Fallback Strategy & Agent Detection"**
  - *Action:* Document after S7 completes via `/pwrl-learnings`
  - *Template:* Include agent detection logic, fallback routing, testing patterns

- **Missing Learning: "Heuristic-Based Tier Selection"**
  - *Action:* Document after S5 completes via `/pwrl-learnings`
  - *Template:* Include tier heuristic, decision tree, edge cases
```

**Example: Filename Generation**

```javascript
function generateFilename(title) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const nnn = findNextSequenceNumber(today);
  return `docs/plans/${today}-${String(nnn).padStart(3, '0')}-${slug}.md`;
}
```

## Edge Cases

1. **Filename collision** (same date, same title)
   - Solution: Increment NNN sequence; e.g., 001 → 002
   - Document in plan generation output

2. **User wants to override tier**
   - Solution: After heuristic selection, ask user: "Proceed with [tier]? or choose different?"
   - Allow: Fast, Standard, Deep selection

3. **Some learnings are no longer relevant**
   - Solution: Document but exclude from final "Related Learnings"
   - Note: "Filtered X learnings; kept Y relevant entries"

4. **Learning gaps are numerous**
   - Solution: That's OK; document all gaps
   - Include clear follow-up reminders

5. **Template rendering fails**
   - Solution: Validate template before rendering; fail with clear error
   - Example: "Fast template missing {{GOAL}} placeholder"

## Testing

### Unit Test: Tier Selection

- **Input:** Unit count + risk level + decision count
- **Verification:**
  - 3 units, low risk → Fast
  - 6 units, medium risk → Standard
  - 12 units, high risk → Deep
  - Edge cases (boundary units) handled correctly

### Unit Test: Template Rendering

- **Input:** Tier + context (goal, units, decisions, etc.)
- **Verification:**
  - All placeholders are filled
  - Correct sections present per tier
  - Output is valid markdown

### Unit Test: Learnings Embedding

- **Input:** Related learnings from S2 + learning gaps
- **Verification:**
  - Related learnings appear in plan with file paths and rationale
  - Learning gaps are documented
  - Follow-up actions are clear (e.g., "/pwrl-learnings" reminders)

### Unit Test: Filename Generation

- **Input:** Plan title + today's date
- **Verification:**
  - Filename follows format: YYYY-MM-DD-NNN-<slug>.md
  - No filename collisions
  - Slug is valid (lowercase, hyphens, no special chars)

### Unit Test: File I/O**

- **Input:** Rendered plan + destination `docs/plans/`
- **Verification:**
  - File is created at correct path
  - Frontmatter is valid (id, status, tier, created, updated)
  - Plan is readable markdown
  - All file paths in plan are repository-relative (no absolute paths)

### Integration Test: Full Generation Workflow**

- **Input:** Scoped context (S2) + Research (S3) + Units (S4)
- **Verification:**
  - Plan generation completes without errors
  - Plan file is saved to `docs/plans/`
  - Plan includes: all sections, learnings, units, tests
  - Plan is readable and follows template structure

## Acceptance Criteria

✅ `skills/pwrl-plan-generate/SKILL.md` exists and is functional  
✅ Tier selection heuristic works: unit count + risk → Fast/Standard/Deep  
✅ Template rendering works: sections populated correctly per tier  
✅ Learnings embedding works: related learnings + gaps documented  
✅ Filename generation works: YYYY-MM-DD-NNN-<slug>.md format, no collisions  
✅ File I/O works: plan saved to `docs/plans/` with valid frontmatter  
✅ All file paths in output plan are repository-relative  
✅ Plan validation passes: markdown is readable, all required sections present  
✅ State passing from S2/S3/S4 is clear and complete  
✅ Skill works independently; tested without S6  
✅ Learning gaps are documented with follow-up actions  

## References

- Source: Phase 4 section in `skills/pwrl-plan/SKILL.md`
- Templates: `skills/pwrl-plan/references/plan-templates.md` (from S1)
- Input state: From S2 (scoped context) + S3 (research) + S4 (units)
- Output: Plan file at `docs/plans/YYYY-MM-DD-NNN-<name>.md`
- Related: Tier heuristic in `references/tier-heuristic.md`

