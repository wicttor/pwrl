# pwrl-plan-scope — Scope Gathering Micro-Skill

**Status:** Phase 1, Unit 1 (U1.1)
**Version:** 1.0
**Role:** First phase of pwrl-plan orchestrator

## Overview

`pwrl-plan-scope` gathers initial context, validates domain, and bootstraps the planning process. It's the entry point to the planning workflow.

**Purpose:** Transform a vague task description into a well-scoped context artifact with clear problem frame, success criteria, and related learnings.

## Workflow

### Input

- Task description from user (can be vague)
- Empty input is handled by prompting

### Processing

**Step 1: Check Existing Plans**

- Search `docs/plans/` for related plans
- If found: offer to resume, review, archive, delete, or create new
- If not found: proceed to step 2

**Step 2: Validate Domain**

- Is this a software task? (Yes/No/Unclear)
- If non-software: return error with suggestion
- If unclear: ask clarifying questions

**Step 3: Bootstrap Context**

- Problem frame: "What problem are we solving?"
- Intended behavior: "What should the system do?"
- Success criteria: "How do we know it's done?" (1-3 criteria)
- Timeline: "When is it needed?"

**Step 4: Search Learnings**

- Query `docs/learnings/INDEX.md` for related learnings
- Filter by relevance (HIGH/MEDIUM/LOW)
- Suggest top 3-5 HIGH-relevance learnings
- User can add/remove learnings

**Step 5: Search Requirements**

- Look in `docs/requirements/`, `docs/brainstorms/`, `docs/decisions/`
- Find docs that match keywords from problem frame
- Suggest matching docs
- User can add/remove requirements

**Step 6: Confirmation**

- Review and confirm scoped context
- Ask: "Is this scope correct?"
- If yes: generate scope artifact; if no: restart step 3

### Output

**Scope Artifact** (YAML frontmatter + structured data):

```yaml
---
format: pwrl-scope-artifact
version: "1.0"
scope_id: "2026-06-11-001-scope"
created_date: "2026-06-11"
created_by: pwrl-plan-scope
problem_frame: "Clear, concise problem statement"
intended_behavior: "What the solution should do"
success_criteria:
  - "Criterion 1"
  - "Criterion 2"
  - "Criterion 3"
learning_gaps: ["Gap 1", "Gap 2"]
related_learnings:
  - title: "Learning Title"
    path: "docs/learnings/..."
    relevance: "HIGH"
    note: "Why it's relevant"
related_requirements:
  - title: "Requirement Title"
    path: "docs/requirements/..."
---
```

## Error Handling

| Error                      | Recovery                                         |
| -------------------------- | ------------------------------------------------ |
| Empty input                | Prompt: "What would you like to plan?"           |
| Non-software domain        | Return error; suggest alternative tool           |
| Ambiguous problem frame    | Ask clarifying questions; bootstrap with answers |
| No learnings found         | Continue (not an error)                          |
| No requirements found      | Continue (not an error)                          |
| User declines confirmation | Loop back to step 3                              |

## Testing

**Test Coverage:** 30+ tests in [tests/pwrl-plan/scope-extraction.test.ts](../../tests/pwrl-plan/scope-extraction.test.ts)

**Test Suites:**

- Happy path (complete workflow)
- Existing plans (resume/archive options)
- Domain validation (software/non-software)
- Learnings search (relevance filtering, top-N)
- Requirements search (keyword matching)
- Ambiguous input (clarifying questions)
- Artifact schema (YAML validation)
- Edge cases (empty criteria, special chars)

## Protocol Documentation

**Detailed Workflow:** [scope-context-protocol.md](references/scope-context-protocol.md)

Covers:

- 6 processing steps with detailed pseudocode
- Input contract and validation
- Output artifact schema
- Error cases and recovery
- Testing strategy (GIVEN-WHEN-THEN format)

## Example

**Input:**

```
"Add email validation to signup form"
```

**Processing:**

1. Check existing plans → none found
2. Validate domain → software ✓
3. Bootstrap context:
   - Problem: "Users can submit invalid emails in signup form"
   - Intended: "Only valid emails accepted; invalid ones show error message"
   - Success: "Email validation works", "Form handles errors gracefully"
4. Search learnings → find "email-validation-patterns.md" (HIGH)
5. Search requirements → find "signup-requirements.md"
6. Confirm → user says "yes"

**Output:**

```yaml
scope_id: "2026-06-11-003-email-validation"
problem_frame: "Users can submit invalid emails in signup form, causing downstream issues"
intended_behavior: "Validate email format on submit; reject invalid emails with clear error message"
success_criteria:
  - "Email validation works (RFC 5322 compliant)"
  - "User sees error for invalid emails"
  - "Valid emails proceed to next step"
related_learnings:
  - title: "Email Validation Patterns"
    path: "docs/learnings/pattern/email-validation-patterns.md"
    relevance: "HIGH"
    note: "Covers regex, libraries, and edge cases"
```

## Key Features

- **Context-Aware:** Checks existing plans before starting new planning
- **Learning Integration:** Surfaces relevant learnings to inform next phases
- **User-Driven:** Confirmation gates prevent scoping errors
- **Error Recovery:** Clear prompts for ambiguous input
- **Artifact Output:** Structured data for next phase (pwrl-plan-research)

## Usage

**Direct Call:**

```
/pwrl-plan-scope [task description]
```

**Via Orchestrator:**

```
/pwrl-plan [task description]
```

(Orchestrator calls pwrl-plan-scope internally)

## Related Skills

- **Next Phase:** [pwrl-plan-research](../pwrl-plan-research/SKILL.md)
- **Orchestrator:** [pwrl-plan](../pwrl-plan/SKILL.md)
- **Learnings:** [pwrl-learnings](../pwrl-learnings/SKILL.md) (to find related learnings)

## FAQs

**Q: What if I don't know success criteria?**

A: Start with something simple ("Feature implemented", "Tests pass"). You can refine during design phase.

**Q: Can I skip existing plan check?**

A: No, it's a built-in step to prevent duplicate planning. You can choose to create a new plan anyway.

**Q: What's a "learning gap"?**

A: Areas where you need to learn more before designing. Captured here to guide research and external study.

**Q: Can I come back and update scope?**

A: Yes, scope artifacts are persistent. You can load an existing scope and refine it.

---

**Version:** 1.0 (pure skill, no agent routing)
**Last Updated:** 2026-06-11
**Protocol:** [scope-context-protocol.md](references/scope-context-protocol.md)
