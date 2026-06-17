# pwrl-plan-generate — Plan Generation Micro-Skill

**Status:** Phase 1, Unit 4 (U1.4)
**Version:** 1.0
**Role:** Fourth phase of pwrl-plan orchestrator (final output)

## Overview

`pwrl-plan-generate` is the final phase of planning. It selects a tier (FAST/STANDARD/DEEP), renders the plan using the appropriate template, embeds related learnings, generates a unique filename, and saves the plan to `docs/plans/`.

**Purpose:** Transform design artifacts into a human-readable, actionable plan document ready for execution.

## Workflow

### Input

- Design artifact from pwrl-plan-design (units, complexity, effort)
- Scope artifact from pwrl-plan-scope (problem frame, success criteria, learnings)

### Processing

**Step 1: Auto-Select Tier**

- Based on complexity + unit count + effort:
  - **FAST:** LOW complexity, 1-3 units, <5 hours
  - **STANDARD:** MEDIUM complexity, 4-8 units, 5-20 hours
  - **DEEP:** HIGH complexity, 9+ units, 20+ hours
- If selection is ambiguous: prompt user to choose
- Allow user to override auto-selected tier

**Step 2: Select Template**

- **FAST Template:**
  - Problem & Scope
  - Success Criteria
  - Implementation Units (brief)
  - Quick Start (1-2 sentences)

- **STANDARD Template:**
  - Problem & Scope
  - Success Criteria
  - Technical Design (2-3 paragraphs)
  - Implementation Units (with details)
  - Risk Assessment (HIGH-risk areas + mitigations)
  - Related Learnings (top 3-5)
  - Rollout Notes (deployment, rollback, verification)

- **DEEP Template:**
  - Problem & Scope
  - Success Criteria
  - Technical Design (comprehensive)
  - Architecture Overview
  - Dependency Graph (Mermaid diagram)
  - Implementation Units (detailed)
  - Risk Analysis (all risks with mitigation)
  - Alternative Approaches (considered but not chosen)
  - Related Learnings (top 5 with detailed notes)
  - Learning Gaps (areas for post-implementation docs)
  - Rollout Plan (phases, rollback, monitoring)
  - Success Metrics

**Step 3: Populate Template**

- Fill all template sections with data from design + scope artifacts
- Substitute variables (problem frame, unit details, etc.)
- Include Mermaid diagrams for STANDARD/DEEP

**Step 4: Embed Learnings**

- From scope artifact, select top 3-5 HIGH-relevance learnings
- For each learning:
  - Title + link to file
  - Why it's relevant to this plan
  - Key takeaways (1-2 sentences)
- Insert into "Related Learnings" section

**Step 5: Add YAML Frontmatter**

- Add plan metadata:
  ```yaml
  ---
  format: pwrl-plan-artifact
  version: "1.0"
  plan_id: "YYYY-MM-DD-NNN-<slug>"
  created_date: "YYYY-MM-DD"
  created_by: pwrl-plan-generate
  tier: "FAST|STANDARD|DEEP"
  input_scope_id: "scope_id"
  input_design_id: "design_id"
  unit_count: N
  estimated_effort: "X hours"
  status: "Ready for Execution"
  ---
  ```

**Step 6: Generate Filename**

- Base: `YYYY-MM-DD-NNN-<slug>.md`
  - `YYYY-MM-DD`: Today's date
  - `NNN`: Sequence number (001, 002, 003, ...)
  - `<slug>`: Problem frame, slugified (lowercase, hyphens, no special chars)
  - Example: `2026-06-11-001-email-validation.md`
- Check for collisions:
  - If exists: ask user: "Update existing plan? Or increment sequence? Or cancel?"
  - If increment: use next available sequence (002, 003, etc.)
  - If update: overwrite existing file
  - If cancel: return without saving

**Step 7: Save Plan File**

- Write to `docs/plans/` directory
- Include YAML frontmatter + rendered content
- Confirm save with filepath to user

### Output

**Saved Plan File** in `docs/plans/YYYY-MM-DD-NNN-<slug>.md`:

```
---
format: pwrl-plan-artifact
version: "1.0"
plan_id: "2026-06-11-001-email-validation"
...
---

# Email Validation Planning Document

## Problem & Scope

Users can submit invalid emails in signup form...

## Success Criteria

- Email validation works (RFC 5322 compliant)
- Invalid emails show error message
- Valid emails proceed to next step

## Implementation Units

### U1: Setup & Infrastructure
...

## Related Learnings

- [Email Validation Patterns](docs/learnings/pattern/email-validation.md)
  - Why relevant: Covers regex, libraries, and edge cases
  - Key takeaway: Use library for RFC 5322 compliance

...

## Rollout

1. Merge to develop
2. Test in staging (email enumeration testing)
3. Deploy to production
4. Monitor for validation errors
```

## Error Handling

| Error                    | Recovery                                     |
| ------------------------ | -------------------------------------------- |
| Ambiguous tier selection | Prompt user to choose tier                   |
| Filename collision       | Offer: update/increment/cancel               |
| File write failure       | Check permissions; suggest manual save       |
| Template rendering error | Log error; suggest manual plan creation      |
| No learnings found       | Continue without learnings section           |
| Invalid artifact input   | Return error; ask user to retry design phase |

## Testing

**Test Coverage:** 30+ tests in [tests/pwrl-plan/generate-plan.test.ts](../../tests/pwrl-plan/generate-plan.test.ts)

**Test Suites:**

- Tier selection (auto-select logic, user override)
- Template rendering (all 3 tiers, all sections)
- Learnings embedding (top 3-5, relevance ordering)
- Filename generation (pattern, slugification, collision handling)
- File persistence (save, confirmation)
- Artifact schema (YAML frontmatter)
- Integration (consumes design + scope artifacts)
- Edge cases (no learnings, long problem frames, complex cycles)

## Protocol Documentation

**Detailed Workflow:** [plan-template-selection.md](references/plan-template-selection.md)

Covers:

- Tier selection algorithm
- 3 template specifications (FAST/STANDARD/DEEP)
- Template rendering logic
- Learnings embedding strategy
- Filename generation with collision handling
- Output artifact schema
- Testing strategy (GIVEN-WHEN-THEN format)

## Example

**Input:**

```yaml
design_id: "2026-06-11-003-design"
complexity: "MEDIUM"
unit_count: 5
estimated_effort: "15 hours"

scope_id: "2026-06-11-001-scope"
problem_frame: "Users can submit invalid emails in signup"
success_criteria:
  - "Email validation works"
  - "Invalid emails show error"
related_learnings:
  - title: "Email Validation Patterns"
    relevance: "HIGH"
    path: "docs/learnings/pattern/email-validation.md"
```

**Processing:**

1. Auto-select tier: 5 units + 15 hours → STANDARD
2. Select STANDARD template
3. Populate sections:
   - Problem & Scope ✓
   - Success Criteria ✓
   - Technical Design ✓
   - Implementation Units (U1-U5) ✓
   - Risk Assessment (enumeration, performance) ✓
   - Related Learnings ✓
   - Rollout Notes ✓
4. Embed learnings: "Email Validation Patterns" (HIGH relevance)
5. Add YAML frontmatter
6. Generate filename: `2026-06-11-001-email-validation.md`
7. Save to `docs/plans/`

**Output:**

```
Plan saved to: docs/plans/2026-06-11-001-email-validation.md
Ready for execution!
```

## Planning Tiers

| Tier         | When                     | Duration  | Template Sections                      |
| ------------ | ------------------------ | --------- | -------------------------------------- |
| **FAST**     | Bug fixes, small tweaks  | 5-15 min  | Problem, Criteria, Units, Quick Start  |
| **STANDARD** | Most features            | 30-45 min | + Design, Risks, Learnings, Rollout    |
| **DEEP**     | Architecture, migrations | 1-2 hours | + Alternatives, Gaps, Detailed Rollout |

## Key Features

- **Tier Auto-Selection:** Complexity-based tier assignment with user override
- **Template Rendering:** Tier-specific templates with all details populated
- **Learnings Integration:** Top learnings embedded with applicability notes
- **Smart Filenames:** YYYY-MM-DD-NNN-<slug> format with collision detection
- **Artifact Tracing:** YAML frontmatter enables traceability from scope → design → plan

## Usage

**Direct Call:**

```
/pwrl-plan-generate [design_artifact] [scope_artifact]
```

**Via Orchestrator:**

```
/pwrl-plan [task description]
```

(Orchestrator calls pwrl-plan-generate after pwrl-plan-design)

## Related Skills

- **Previous Phase:** [pwrl-plan-design](../pwrl-plan-design/SKILL.md) (produces input)
- **Orchestrator:** [pwrl-plan](../pwrl-plan/SKILL.md)
- **Execution:** [pwrl-work](../pwrl-work/SKILL.md) (consumes generated plan)

## Output Format

**File Location:** `docs/plans/YYYY-MM-DD-NNN-<slug>.md`

**Structure:**

1. YAML frontmatter (format, version, plan_id, timestamps, artifact references)
2. Markdown content (tier-specific sections)
3. Implementation units with details
4. Related learnings with applicability
5. Rollout/deployment notes

**Traceability:**

- `plan_id`: Unique plan identifier (YYYY-MM-DD-NNN-<slug>)
- `input_scope_id`: Links back to scope artifact
- `input_design_id`: Links back to design artifact
- Can trace entire planning chain: scope → research → design → plan

## FAQs

**Q: Can I change the tier after plan is generated?**

A: Yes, you can edit the YAML frontmatter and re-render, or create a new plan with different tier.

**Q: What if the generated filename is too long?**

A: Filename is truncated to 255 characters (OS limit). Slug is shortened to fit.

**Q: Can I include custom sections in the plan?**

A: The templates are fixed. For custom sections, edit the plan after generation or create custom template.

**Q: How are learnings prioritized?**

A: By relevance (HIGH first), then by creation date (newest first).

**Q: What if two plans have the same problem frame?**

A: Check filename collision during generation. You can update, increment, or cancel.

---

**Version:** 1.0 (pure skill, no agent routing)
**Last Updated:** 2026-06-11
**Protocol:** [plan-template-selection.md](references/plan-template-selection.md)
