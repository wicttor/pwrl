---
unit-id: U8
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: [U5, U6, U7]
created: 2026-06-10
files:
  - agents/pwrl-planner.agent.md (modify)
  - pwrl-plan-scope/SKILL.md (modify)
  - pwrl-plan-research/SKILL.md (modify)
  - pwrl-plan-design/SKILL.md (modify)
  - pwrl-plan-generate/SKILL.md (modify)
learnings: []
---

# U8: Documentation Polish and Examples

## Goal

Add missing examples, fix consistency issues, and ensure documentation is complete and navigable.

## Context

**Dependencies:** All prior units must be complete (U1-U7).

This is the final polish task addressing P3 (low-priority) documentation issues:
1. Agent usage examples lack output/walkthrough
2. Each skill doesn't explain its role in tier selection
3. Reference file naming inconsistent (edge-cases.md vs. High-Risk Detection)
4. Heading depth inconsistent across skills

## Implementation Steps

### Step 1: Add Output Examples to Agent

Modify `agents/pwrl-planner.agent.md`:

For each of the 3 usage examples, add "Expected Output" subsection:

```markdown
### Example 1: Plan from Goal Description

```bash
/pwrl-plan "Extract triage logic from pwrl-work into a micro-skill"
```

**Expected Output:**

```
ℹ️  Agents detected — delegating to pwrl-planner.agent.md

📋 Phase 1: Scope Gathering

Scoped Context:
  Problem: Extract triage logic from pwrl-work into independent skill
  Domain: software
  Existing Plan: none
  Related Learnings: 2 found
  Learning Gaps: 1 identified

✅ Phase 1 complete. Proceed to research?
   a) Yes, proceed to research phase
   b) Adjust context (refine scope)
   c) Cancel planning
   
[User chooses: a) Yes]

📋 Phase 2: Research & Findings

Research complete:
  Local patterns found: 5
  High-risk areas: none
  External research: not needed
  Risk level: MEDIUM

✅ Phase 2 complete. Proceed to design?
   a) Yes, proceed to design phase
   b) Perform additional research
   c) Show research details
   d) Cancel planning
   
[User chooses: a) Yes]

📋 Phase 3: Design & Implementation Units

Design complete:
  Units defined: 3
  Dependencies: Linear (U1 → U2 → U3)
  Complexity hint: Standard
  Mermaid diagram included: no

✅ Phase 3 complete. Proceed to plan generation?
   a) Yes, proceed to generate plan
   b) Adjust units (refine scope or dependencies)
   c) Show unit details
   d) Cancel planning
   
[User chooses: a) Yes]

📋 Phase 4: Plan Generation

Recommended tier: Standard
  Rationale: 3 units, MEDIUM risk, 30-45 min estimate

Plan preview:
---
id: 2026-06-10-001
status: active
tier: Standard
created: 2026-06-10
---

# Extract Triage Logic from pwrl-work into Micro-Skill (Standard)

## Goal
...

[First 300 characters of plan]

---

Ready to save this plan to docs/plans/2026-06-10-001-extract-triage-logic.md?
  a) Yes, save plan
  b) Edit plan [refine sections]
  c) Cancel

[User chooses: a) Yes]

✅ Plan generated successfully!
   
Path: docs/plans/2026-06-10-001-extract-triage-logic.md
Tier: Standard
Units: 3

What would you like to do next?
a) Execute plan with /pwrl-work
b) Create task files with /pwrl-tasks
c) Document learnings with /pwrl-learnings
d) Plan something else
e) Exit

[User chooses: a) Execute]
```

(Repeat for Examples 2 and 3 with different scenarios/outputs)
```

### Step 2: Add Tier Guidance to Each Skill

Modify each skill's Purpose section to explain its role:

**pwrl-plan-scope/SKILL.md:**
```markdown
## Purpose

...

### Role in Tier Selection

This skill gathers initial context. The tier decision happens in later phases:
- **Fast plans** ← Detected by pwrl-plan-design when unit count is 1-3 and risk is LOW
- **Standard plans** ← Detected when unit count is 4-8 or risk is MEDIUM
- **Deep plans** ← Detected when unit count is 9+, risk is HIGH, or complexity is high

Your job (scope gathering) focuses on clarity, not tier. Leave tier selection to the design and generate phases.
```

**pwrl-plan-research/SKILL.md:**
```markdown
## Purpose

...

### Role in Tier Selection

This skill assesses risk level. Higher risk → higher tier:
- **Low risk** (common patterns, straightforward) → Fast tier candidate
- **Medium risk** (some unknowns, moderate complexity) → Standard tier
- **High risk** (security, payments, migrations, complex) → Deep tier

The generate phase uses your risk assessment to recommend tier. Your job is to accurately detect and document risks.
```

**pwrl-plan-design/SKILL.md:**
```markdown
## Purpose

...

### Role in Tier Selection

This skill decomposes work into units. Unit count largely determines tier:
- **1-3 units** (small, focused) → Fast or Standard (depending on risk)
- **4-8 units** (medium scope) → Standard
- **9+ units** (large scope) → Deep

The generate phase applies the tier heuristic (units + risk level) to recommend tier. Your job is to accurately estimate unit count and complexity.
```

**pwrl-plan-generate/SKILL.md:**
```markdown
## Purpose

...

### Role in Tier Selection

This skill makes the final tier selection based on:
- Unit count (from design)
- Risk level (from research)
- Complexity hint (from design)

You apply the tier heuristic and ask user to confirm. Your job is to pick the right tier for the plan content.
```

### Step 3: Standardize Reference File Naming

Check all reference files for consistency:
- File names: Use kebab-case (edge-cases.md, high-risk-detection.md, u-id-generator.md)
- Headings: Use Title Case (## High-Risk Detection Patterns, ### Example)

Audit and fix any inconsistencies:
- Find all `.md` files in `pwrl-plan-*/references/`
- Rename if needed (e.g., `High-Risk Detection.md` → `high-risk-detection.md`)
- Update heading structure if inconsistent

### Step 4: Standardize Heading Depth

Check skill files and references for consistent heading depth:
- Main skill sections: `## Purpose`, `## Interaction Method`, `## Workflow`, `## Edge Cases`, `## References`
- Workflow subsections: `### Step 1: ...`, `### Step 2: ...`
- Reference files: `## Overview`, `### Sub-topic`, etc.

Audit and fix any deep or shallow nesting that hurts readability.

### Step 5: Add "When to Use" Context

Add brief context to each skill explaining when to use it:

At the top of each skill's SKILL.md, add:
```markdown
## When to Use This Skill

**This skill is called by:** pwrl-planner.agent.md (step N of 4)
**This skill calls:** [next skill, or "none"]
**Time estimate:** 10-15 minutes
**User input needed:** Yes, via ask_user prompts
**Requires files:** docs/plans/, docs/learnings/, docs/brainstorms/
```

### Step 6: Create or Update README for Skills

If no README exists, add `pwrl-plan/README.md` with:
- Overview of all 4 micro-skills
- How they fit together
- When to use planning workflow vs. individual skills
- Quick start guide

### Step 7: Verify Navigation

Ensure all cross-references work:
- Agent references micro-skills: ✓
- Micro-skills reference each other: ✓
- Reference files linked from parent skills: ✓
- Examples show actual file paths: ✓

## Edge Cases

1. **Renaming files breaks links**
   - Solution: Update all cross-references in parent skills
2. **Heading depth change breaks table of contents**
   - Solution: Verify TOC still valid after changes
3. **Adding examples increases file size**
   - OK; examples are valuable for understanding

## Testing

- [ ] Agent usage examples run and produce expected output
- [ ] Each skill explains its tier role
- [ ] Reference files have consistent naming (kebab-case)
- [ ] Heading depth consistent across all skills and references
- [ ] All cross-references valid (no broken links)
- [ ] README or "When to Use" section added to each skill

## Acceptance Criteria

✅ Agent examples show actual user experience and output  
✅ Each skill documents its role in tier selection  
✅ Reference file names standardized to kebab-case  
✅ Heading depth consistent (## for main, ### for sub)  
✅ "When to Use This Skill" context added  
✅ All cross-references work  
✅ Documentation is complete and navigable  

## References

- Current agent: agents/pwrl-planner.agent.md
- All skill files: pwrl-plan-scope/SKILL.md, pwrl-plan-research/SKILL.md, etc.
- All reference files: pwrl-plan-*/references/*.md
