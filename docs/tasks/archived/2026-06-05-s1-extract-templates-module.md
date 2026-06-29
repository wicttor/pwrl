---
unit-id: S1
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
status: for-review
created: 2026-06-05
type: PWRL Task
dependencies: []
files:
  - skills/pwrl-plan/references/plan-templates.md
  - skills/_shared/plan-template-helpers.md (new, if needed)
learnings: []
---

# S1: Extract Templates Module

## Goal

Pull template definitions out of pwrl-plan/SKILL.md into a reusable module that can be accessed by all tier-specific plan generators (Fast/Standard/Deep). Ensure templates are complete, accessible, and properly documented.

## Context

The current `pwrl-plan/SKILL.md` contains inline template definitions for Fast, Standard, and Deep tier plans. When decomposed into micro-skills, each tier-specific generator will need to reference these templates. This task extracts templates into a central, reusable reference and verifies completeness.

**Why this matters:** Without a clean template abstraction, micro-skill S5 (pwrl-plan-generate) will struggle with template rendering and tier selection logic.

**Dependency:** Entry point; no dependencies. Can start immediately.

## Related Learnings

- **Learning: Template Rendering in Skills** (if exists at `docs/learnings/template-rendering.md`)
  - *Applicability:* Guides extraction strategy and dynamic template handling patterns.

**Learning Gap:** If no existing learning for "Template Module Structure" exists, create one during/after this task via `/pwrl-learnings`.

## Implementation Steps

1. **Audit Existing Templates**
   - Read `skills/pwrl-plan/SKILL.md` completely
   - Identify all references to "Fast", "Standard", "Deep" tier templates
   - Document current template structure (sections, required fields, optional sections)
   - Check if `skills/pwrl-plan/references/plan-templates.md` already exists and its completeness

2. **Verify Template Completeness**
   - Ensure all three tiers (Fast/Standard/Deep) have documented section structures
   - Confirm each tier includes: Goal, Implementation Units, Test Scenarios (if applicable)
   - Check that Standard tier includes: Key Technical Decisions, System-Wide Impact
   - Check that Deep tier includes: High-Level Technical Design, Alternative Approaches, Risk Analysis, Operational Notes
   - Verify all tiers include: Related Learnings section, Learning Gap follow-ups

3. **Create/Update plan-templates.md**
   - If file doesn't exist: create `skills/pwrl-plan/references/plan-templates.md`
   - Structure as:
     ```markdown
     # Plan Templates Reference
     
     ## Fast Tier Template
     [Complete template with all required sections]
     
     ## Standard Tier Template
     [Complete template with all required sections]
     
     ## Deep Tier Template
     [Complete template with all required sections]
     
     ## Common Sections (All Tiers)
     [Shared template parts like Related Learnings, Learning Gap notes]
     ```
   - Make templates copy-paste ready (with placeholder examples)

4. **Design Template Abstraction (if needed)**
   - Evaluate if template rendering requires helper logic (e.g., Mustache, Handlebars, or simple string replacement)
   - If yes: Create `skills/_shared/plan-template-helpers.md` or a utility module
   - Document helper functions/methods that will be used by S5 (pwrl-plan-generate)
   - Ensure helpers are language/platform agnostic (work in any skill)

5. **Document Template Rules**
   - Add section to plan-templates.md: "Template Usage Rules"
   - Include: required fields per tier, file path format requirements, learnings embedding rules
   - Add: expected output examples for each tier

6. **Cross-Reference with pwrl-plan/SKILL.md**
   - Ensure pwrl-plan/SKILL.md references the external templates
   - Update any outdated inline template examples
   - Add comment: "See references/plan-templates.md for authoritative template definitions"

## Code Patterns

**Example: Fast Tier Template Structure**

```markdown
---
id: YYYY-MM-DD-NNN
status: active
tier: Fast
created: YYYY-MM-DD
type: PWRL Task
---

# [Plan Title]

## Goal
[Single sentence: what this plan accomplishes]

## Implementation Units

### U1: [Unit Name]
- **Files Affected:** [list]
- **Approach:** [brief description]
- **Verification:** [how to verify completion]

### U2: [Unit Name]
...

## Related Learnings
[Links to docs/learnings/INDEX.md entries]

## Learning Gaps
[Any gaps identified + follow-up actions]
```

**Example: Template Helpers (pseudo-code)**

```javascript
// Placeholder for potential helper module
class TemplateRenderer {
  static renderFast(context) { /* tier Fast logic */ }
  static renderStandard(context) { /* tier Standard logic */ }
  static renderDeep(context) { /* tier Deep logic */ }
  static embedLearnings(plan, learnings) { /* learnings section */ }
}
```

## Edge Cases

1. **Existing plan-templates.md is incomplete**
   - Solution: Extend it with missing sections; preserve any existing content
   - Validate against template quality bar from pwrl-plan/SKILL.md

2. **Template helpers are complex**
   - Solution: Keep helpers minimal; rely on markdown rendering, not dynamic code
   - Document by example, not by function signatures

3. **Tier definitions have evolved**
   - Solution: Update pwrl-plan/SKILL.md with latest rules first; then ensure templates reflect
   - Cross-check with `docs/plans/` examples to confirm current tier usage

## Testing

### Unit Test: Template Completeness

- **Input:** plan-templates.md (or updated file)
- **Verification:**
  - All three tier templates (Fast/Standard/Deep) are present
  - Fast tier has at least 5 core sections
  - Standard tier has at least 8 sections including Key Decisions & System-Wide Impact
  - Deep tier has all Standard sections plus High-Level Design, Alternatives, Risks, Operational Notes
  - All tiers include "Related Learnings" section with example learnings entries

### Unit Test: Template Usability

- **Input:** Fast/Standard/Deep templates from plan-templates.md
- **Verification:**
  - Each template is copy-paste ready (can be filled in without additional research)
  - Placeholder examples are clear and specific
  - File path formats are documented (repository-relative)
  - No absolute paths in templates

### Integration Test: pwrl-plan References

- **Input:** pwrl-plan/SKILL.md + plan-templates.md
- **Verification:**
  - pwrl-plan/SKILL.md references "See references/plan-templates.md" in appropriate sections
  - No conflicting template definitions between files
  - Links to templates are correct (no broken references)

## Acceptance Criteria

✅ `skills/pwrl-plan/references/plan-templates.md` exists and is complete (or verified as already complete)  
✅ All three tier templates (Fast/Standard/Deep) are documented with all required sections  
✅ Templates include placeholder examples for each section  
✅ "Related Learnings" section is present in all tier templates  
✅ File path format requirements are documented (repository-relative paths)  
✅ pwrl-plan/SKILL.md references external templates and is updated if needed  
✅ No inline template duplicates remain in pwrl-plan/SKILL.md  
✅ All templates pass completeness and usability tests (see Testing section)  

## References

- Source: `skills/pwrl-plan/SKILL.md` (current inline templates)
- Output: `skills/pwrl-plan/references/plan-templates.md`
- Used by: S5 (pwrl-plan-generate) micro-skill
- Related doc: Plan Quality Bar section in pwrl-plan/SKILL.md

