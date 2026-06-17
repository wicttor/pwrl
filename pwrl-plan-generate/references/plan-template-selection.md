# pwrl-plan-generate: Plan Template Selection & Rendering

## Purpose

Define the input/output contracts for the `pwrl-plan-generate` micro-skill. This skill:

- Takes design artifact from `pwrl-plan-design`
- Selects tier (Fast/Standard/Deep) based on complexity
- Renders plan using tier template
- Embeds related learnings and learning gaps
- Generates unique filename and saves to `docs/plans/`

## Input Contract

### Type: Design Artifact (from U1.3)

```yaml
design-artifact:
  units: [...]
  dependency_graph: { ... }
  risk_mitigations: [...]
  complexity: HIGH|MEDIUM|LOW
  estimated_effort: "X hours"

scope-artifact (passed through):
  problem_frame: "..."
  intended_behavior: "..."
  success_criteria: [...]
  related_learnings: [...]
  learning_gaps: [...]
```

## Tier Selection Algorithm

### Tier Decision Logic

```
ALGORITHM:
  if complexity == LOW and num_units <= 3 and estimated_effort <= "5 hours":
    tier = FAST
  elif complexity == MEDIUM and num_units <= 8 and estimated_effort <= "20 hours":
    tier = STANDARD
  elif complexity == HIGH or num_units > 8 or estimated_effort > "20 hours":
    tier = DEEP
  else:
    PROMPT user: "Which tier? Fast (5-15 min), Standard (30-45 min), Deep (1-2 hours)"
    tier = user_response

  return tier
```

### Tier Characteristics

| Tier         | Criteria               | Sections                                                 | Time      |
| ------------ | ---------------------- | -------------------------------------------------------- | --------- |
| **FAST**     | 1-3 units, LOW risk    | Problem, Success, Units, Notes                           | 5-15 min  |
| **STANDARD** | 4-8 units, MEDIUM risk | Problem, Design, Units, Risks, Learnings, Rollout        | 30-45 min |
| **DEEP**     | 9+ units, HIGH risk    | Problem, Design, Units, Risks, Learnings, Gaps, Appendix | 1-2 hours |

### Template Structure

#### FAST Tier Template

```markdown
# [Project Title] — Fast Plan

**Date:** YYYY-MM-DD | **Type:** [type] | **Risk:** LOW

## Problem & Scope

[problem_frame from scope]

## Success Criteria

- [criterion 1]
- [criterion 2]

## Implementation Units

### U1. [Unit Title]

**Goal:** [goal]
**Files:** [files]
**Test Scenarios:** [3-5 scenarios]

[Repeat for U2, U3, ...]

## Notes

[Any key observations or dependencies]

---

**Status:** Ready for Execution
**Estimated Time:** X hours
```

#### STANDARD Tier Template

```markdown
# [Project Title] — Standard Plan

**Date:** YYYY-MM-DD | **Type:** [type] | **Risk:** MEDIUM

## Problem & Scope

[problem_frame]
[intended_behavior]

## Success Criteria

- [criterion 1]
- [criterion 2]
- [criterion 3]

## Technical Design

### Architecture Overview

[key architectural decisions]

### Dependency Graph

[Mermaid diagram if present, else text summary]

## Implementation Units

### U1. [Title]

[unit details]

[Repeat for all units]

## Risk Assessment

| Risk   | Impact   | Probability | Mitigation   |
| ------ | -------- | ----------- | ------------ |
| [risk] | [impact] | [prob]      | [mitigation] |

[More rows]

## Related Learnings

**Leverage existing knowledge:**

- [Learning Title] (`path`) — Why relevant
- [Learning Title] (`path`) — Why relevant

## Rollout & Next Steps

1. Phase 1: [units]
2. Phase 2: [units]
3. Validation & deployment

---

**Status:** Ready for Execution
**Estimated Time:** X hours
```

#### DEEP Tier Template

````markdown
# [Project Title] — Deep Plan

**Date:** YYYY-MM-DD | **Type:** [type] | **Risk:** HIGH

## Problem & Scope

[problem_frame]
[intended_behavior]

## Success Criteria

[all criteria with measurable outcomes]

## Technical Design

### Architecture Overview & Rationale

[Detailed architecture]

### Technology Stack

[Detected tech from research]

### Key Design Decisions

1. Decision 1 — Rationale + alternatives considered
2. Decision 2 — Rationale + alternatives considered

### Dependency Graph

[Mermaid diagram with explanation]

## Implementation Units (Deep Decomposition)

### Phase 1: [Phase Name]

#### U1. [Title]

[full unit details: goal, dependencies, files, approach, test scenarios, acceptance criteria]

[Repeat for all units, organized by phase]

## Risk Analysis & Mitigation

### High-Risk Areas

| Risk   | Impact   | Prob.  | Mitigation | Owner   |
| ------ | -------- | ------ | ---------- | ------- |
| [risk] | [impact] | [prob] | [strategy] | [owner] |

[More rows with detailed analysis]

## Alternative Approaches Considered

### Approach 1: [Name]

- Pros: [...]
- Cons: [...]
- Why Rejected: [...]

### Approach 2: [Name]

[Same structure]

**Why Selected Approach:** [Justification]

## Related Learnings & Applicability

**Knowledge Base:**

- [Learning] (`path`) — Why relevant: [note]
- [Learning] (`path`) — Why relevant: [note]

## Learning Gaps

Post-implementation documentation needed:

- Gap 1: [Description]
- Gap 2: [Description]

**Action:** Use `/pwrl-learnings` after implementation

## Operational / Rollout Notes

### Phased Rollout

| Phase   | Units | Time | Go-Live |
| ------- | ----- | ---- | ------- |
| Phase 1 | U1–U2 | 5h   | [date]  |
| Phase 2 | U3–U5 | 8h   | [date]  |

### Feature Flags / Config

```json
{
  "feature": {
    "enabled": false,
    "rolloutPercent": 0
  }
}
```
````

### Monitoring & Alerts

- Metric 1: [description]
- Metric 2: [description]

### Rollback Plan

If critical issue:

1. Revert commit
2. Restore previous state
3. Investigate in feature branch

---

**Status:** Ready for Execution
**Estimated Time:** X hours
**Confidence:** HIGH | MEDIUM | LOW

```

## Processing Steps

### Step 1: Determine Tier Automatically or Prompt User

```

ALGORITHM:
tier = auto_select_tier(design.complexity, design.num_units, design.estimated_effort)

if auto_selected_with_confidence >= 0.8:
CONFIRM: "Using {tier} tier. Proceed?"
if user rejects: PROMPT "Choose tier"
else:
PROMPT "Which tier? Fast/Standard/Deep"

return tier

```

### Step 2: Render Plan Using Selected Template

```

ALGORITHM:
template = load_template(tier)

plan = render(template, {
problem_frame: scope.problem_frame,
intended_behavior: scope.intended_behavior,
success_criteria: scope.success_criteria,
units: design.units,
dependency_graph: design.dependency_graph,
risk_mitigations: design.risk_mitigations,
tech_stack: research.tech_stack,
local_patterns: research.local_patterns,
complexity: design.complexity,
estimated_effort: design.estimated_effort
})

return rendered_plan

```

### Step 3: Embed Related Learnings

```

ALGORITHM:
learnings = scope.related_learnings
top_learnings = sort_by_relevance(learnings)[:3-5]

for each learning in top_learnings:
learning_section += "- [{title}]({path}) — {why_relevant}"

insert_into_plan(plan, learning_section, "Related Learnings")

```

### Step 4: Generate Unique Filename

```

ALGORITHM:
base_name = slugify(problem_frame)
date = today()

sequence = 1
while file_exists("docs/plans/{date}-{sequence:03d}-{base_name}.md"):
sequence += 1

filename = "{date}-{sequence:03d}-{base_name}.md"
return filename

```

### Step 5: Handle Filename Collision

```

BEHAVIOR:
if filename already exists:
INFORM user: "Plan already exists: {existing_file}"
PROMPT: "Update existing, create new with incremented number, or cancel?"

    if update: overwrite file
    if new: increment sequence number
    if cancel: return error "Plan generation cancelled"

```

### Step 6: Save Plan to docs/plans/

```

ALGORITHM:
filepath = "docs/plans/" + filename

write_file(filepath, rendered_plan)

CONFIRM: "Plan saved to {filepath}"
RETURN plan_artifact

````

## Output Contract

### Type: Plan Artifact

```yaml
---
format: pwrl-plan-artifact
version: "1.0"
created-date: YYYY-MM-DD
created-by: pwrl-plan-generate
plan-id: YYYY-MM-DD-NNN-<name>
tier: FAST|STANDARD|DEEP
input-design-id: YYYY-MM-DD-NNN-design
input-scope-id: YYYY-MM-DD-NNN-scope
---

# [Title]

[Full rendered plan content using selected tier template]

---

**Execution Status:** Ready for Implementation
````

## Error Cases

### Error: Cannot Auto-Select Tier

```
BEHAVIOR:
  if metrics ambiguous or conflicting:
    PROMPT: "Tier unclear. Which tier? Fast (5-15min), Standard (30-45min), Deep (1-2h)"
    user_choice = get_response()
    tier = user_choice
```

### Error: Filename Collision

```
BEHAVIOR:
  if file exists:
    INFORM: "Plan already exists: {path}"
    OPTIONS: Update | New (increment) | Cancel
    user_choice = get_response()

    if Update: overwrite
    if New: increment sequence, retry
    if Cancel: ERROR "Generation cancelled"
```

### Error: Failed to Write File

```
BEHAVIOR:
  if write fails:
    ERROR: "Failed to save plan to {filepath}"
    RECOVERY:
      1. Check file permissions
      2. Verify docs/plans/ exists
      3. Retry write
      4. If persistent: suggest manual save
```

## State Persistence

Plan artifact is:

1. Saved to: `docs/plans/YYYY-MM-DD-NNN-<name>.md`
2. Returned to user with success confirmation
3. Ready for `/pwrl-work` execution

## Downstream Consumption

Plan artifact consumed by:

- **pwrl-work** — Uses units + dependencies for execution
- **Users/Teams** — Read and understand plan before execution

## Testing Strategy (TDD)

```
Test: "FAST Tier: Simple 3-unit design"
  GIVEN: design with LOW complexity, 3 units, 5h effort
  WHEN: tier selected
  THEN: tier == FAST

Test: "STANDARD Tier: Medium 6-unit design"
  GIVEN: design with MEDIUM complexity, 6 units, 15h effort
  WHEN: tier selected
  THEN: tier == STANDARD

Test: "DEEP Tier: Complex 10-unit design"
  GIVEN: design with HIGH complexity, 10 units, 40h effort
  WHEN: tier selected
  THEN: tier == DEEP

Test: "Filename Generation: Unique & valid"
  GIVEN: problem_frame = "Add email validation"
  WHEN: filename generated
  THEN: filename matches YYYY-MM-DD-NNN-slug.md format
  AND: file doesn't exist in docs/plans/

Test: "Learnings Embedding: Top 3-5 by relevance"
  GIVEN: scope with 5 HIGH-relevance learnings
  WHEN: plan rendered
  THEN: 3-5 learnings embedded in "Related Learnings" section
  AND: ordered by relevance

Test: "Collision Handling: Increment sequence"
  GIVEN: 2026-06-11-001-test.md exists
  WHEN: filename generated for similar plan
  THEN: filename == 2026-06-11-002-test.md

Test: "Template Rendering: All sections present"
  GIVEN: DEEP tier selected
  WHEN: plan rendered
  THEN: all sections present (Problem, Design, Units, Risks, Learnings, Gaps, Rollout)
  AND: no placeholder text remains
```

---

**Document Version:** 1.0
**Date:** 2026-06-11
**Status:** Reference specification for U1.4 implementation
