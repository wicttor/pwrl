# pwrl-plan-scope: Context Protocol

## Purpose

Define the input/output contracts for the `pwrl-plan-scope` micro-skill. This document specifies:

- Input format and expectations
- Processing behavior
- Output artifact structure
- Error cases and recovery

## Input Contract

### Type: Bare String or Empty

```
INPUT: string (task description, requirement doc excerpt, or goal)
  - Can be 1-line summary or multi-paragraph description
  - Can be empty → skill prompts user for input

EXAMPLES:
  - "Add email validation to signup form"
  - "Migrate session storage from in-memory to Redis"
  - docs/requirements/auth.md (path to requirement doc)
```

### User Context

The skill may need to prompt the user via `ask_user_question` extension if:

- Input is empty (ask: "What would you like to plan?")
- Input is ambiguous (ask clarifying questions)
- An existing plan is found (ask: resume/review/archive/delete/new?)

## Processing Steps

### 1. Existing Plan Detection

Search `docs/plans/` for related plans:

```
ALGORITHM:
  for each *.md file in docs/plans/:
    if filename or title matches INPUT keywords:
      FOUND = true
      break

  if FOUND:
    PROMPT user (multiple choice)
    return user choice → sets scope.existing_plan.action
  else:
    scope.existing_plan.action = "none"
```

### 2. Domain Validation

```
PROMPT: "Is this a software/code planning task?"

if YES:
  scope.domain = "software"
  PROCEED to Step 3
else:
  scope.domain = "non-software"
  WARN: "Non-software planning is outside pwrl-plan scope"
  RETURN error with recovery suggestion
```

### 3. Context Bootstrap

If no existing plan, gather:

```
PROMPT 1: "What problem are you trying to solve?"
  INPUT: problem_frame (text)

PROMPT 2: "What should happen after this is implemented?"
  INPUT: intended_behavior (text)

PROMPT 3: "How will we know this is complete? (1-3 success criteria)"
  INPUT: success_criteria (list of strings)
```

If user provided rich context in initial INPUT, extract and confirm instead of prompting.

### 4. Learnings Search

Search `docs/learnings/INDEX.md` for HIGH-relevance learnings matching task:

```
ALGORITHM:
  matches = []
  for each row in docs/learnings/INDEX.md:
    if row.relevance == "HIGH":
      if row.tags.contains(any keyword from INPUT):
        matches.append(row)

  take TOP 5 matches (or fewer if < 5)
  scope.related_learnings = matches
```

### 5. Requirements Search

Search `docs/brainstorms/` and `docs/requirements/` for matching files:

```
ALGORITHM:
  matches = []
  for each *.md in docs/brainstorms/:
    if filename contains(INPUT keywords):
      matches.append(filename, excerpt)

  for each *.md in docs/requirements/:
    if filename contains(INPUT keywords):
      matches.append(filename, excerpt)

  scope.requirements_found = matches (or empty list)
```

### 6. Confirmation

```
PROMPT: "Is this context correct? Proceed to research phase?"
  if YES: RETURN scope artifact
  if NO: loop back to Step 2 (user corrections)
```

## Output Contract

### Type: Scoped Context Artifact

```yaml
---
format: pwrl-scope-artifact
version: "1.0"
created-date: YYYY-MM-DD
created-by: pwrl-plan-scope
scope-id: YYYY-MM-DD-NNN-scope
domain: software | non-software
status: confirmed | incomplete | error
---

# Scoped Context

## Problem Frame

[Clear statement of the problem]

Example:
"Current PWRL executes plans sequentially; multi-plan workflows run linearly"

## Intended Behavior

[Description of desired outcome]

Example:
"Plans in docs/plans/ are auto-discovered and dependency-scanned"

## Success Criteria

1. [Criterion 1] ← Specific, measurable condition
2. [Criterion 2]
3. [Criterion 3] ← Optional (1-3 total)

Example:
1. Multi-plan workflows complete 2x faster (60 min → 28 min)
2. Cross-plan dependencies automatically detected
3. Circular dependencies raise errors with full path reporting

## Existing Plan

- **path:** docs/plans/2026-06-10-001-cross-plan.md | null
- **action:** resume | review | archive | delete | create-new | none

## Related Learnings

List top 5 HIGH-relevance learnings (or fewer if not found):

- **Title** — `docs/learnings/category/slug.md` — Why this is relevant (1 line)
- **Title** — `docs/learnings/category/slug.md` — Why this is relevant (1 line)
- (Empty if no matches found)

Example:
- **Cross-Plan Dependency Patterns** — `docs/learnings/pattern/cross-plan-patterns.md` — Recognized patterns for organizing multi-plan workflows
- **Topological Sort Performance** — `docs/learnings/technical-fix/topological-optimization.md` — Optimization techniques for large dependency graphs

## Learning Gaps

Identify areas where post-implementation documentation is needed:

- Gap 1 description (→ will be documented via /pwrl-learnings after implementation)
- Gap 2 description
- (Empty if no gaps identified)

Example:
- Circular Dependency Error Patterns (common anti-patterns users hit)
- Parallelization Strategy Trade-offs (when to use conservative vs. aggressive)

## Requirements Found

List matching documents from `docs/brainstorms/` and `docs/requirements/`:

- **Path** — Relevant excerpt (1-2 sentences)
- **Path** — Relevant excerpt
- (Empty if none found)

Example:
- `docs/requirements/cross-plan-execution.md` — "Support parallel execution of multiple independent plans"
- `docs/brainstorms/performance-ideas.md` — "30-50% faster multi-plan execution through topological grouping"

## Status Notes

[Optional notes about scope confirmation, any caveats, or user clarifications]
```

## Error Cases

### Error: Empty Input

```
INPUT: "" (empty string)

BEHAVIOR:
  PROMPT: "What would you like to plan? Describe the task or project."
  WAIT for user input
  RETRY from Step 1 with new input
```

### Error: Non-Software Domain

```
INPUT: "Plan a company retreat"
domain: non-software

BEHAVIOR:
  RETURN error artifact with:
    status: error
    message: "Non-software planning is outside pwrl-plan scope. Try a universal planning tool instead."
    recovery: "Please provide a software/code task instead."
```

### Error: Ambiguous Input

```
INPUT: "Improve the system"

BEHAVIOR:
  PROMPT clarifying questions:
    1. "What system? Which codebase?"
    2. "What kind of improvement? Performance, features, refactoring?"
    3. "Are there specific pain points or goals?"
  COLLECT user responses
  RETRY from Step 1 with enriched context
```

### Error: No Learnings or Requirements

```
BEHAVIOR: (NOT an error)
  scope.related_learnings = []
  scope.requirements_found = []
  PROCEED normally (no learnings doesn't block progress)
```

## State Persistence

Scoped context artifact is:

1. Returned immediately to the user (in-memory or printed)
2. Optionally persisted to: `docs/plans/.scope/YYYY-MM-DD-NNN-scope.md` (if user requests)
3. Passed to next micro-skill (`pwrl-plan-research`) via return value or file path

## Downstream Consumption

The scoped context is consumed by:

- **pwrl-plan-research** — Uses problem frame, success criteria, learnings to guide research phase
- **pwrl-plan-design** — Uses success criteria, existing plan context to guide design
- **pwrl-plan-generate** — Uses related learnings to embed in final plan

## Testing Strategy (TDD)

Each test follows pattern:

```
Test: "[Scenario Name]"
  GIVEN: [Setup state]
  WHEN: [Input provided]
  THEN: [Expected artifact properties]
  AND: [User prompts triggered (if any)]
```

Example Tests:

```
Test: "Happy Path with Problem Frame"
  GIVEN: scope-context-protocol.md loaded
  WHEN: INPUT = "Add email validation to signup form"
  THEN:
    scope.domain == "software"
    scope.problem_frame == "Add email validation to signup form"
    scope.status == "confirmed"

Test: "Existing Plan Found and Resumed"
  GIVEN: docs/plans/2026-06-01-001-auth.md exists
  WHEN: INPUT = "email validation"
  THEN:
    scope.existing_plan.path == "docs/plans/2026-06-01-001-auth.md"
    USER_PROMPT: "Resume/Review/Archive/Delete/New?" == "Resume"
    scope.existing_plan.action == "resume"

Test: "Non-Software Domain Rejected"
  GIVEN: scope-context-protocol.md loaded
  WHEN: INPUT = "Plan company retreat"
  AND: USER_PROMPT["Is this software task?"] == "no"
  THEN:
    scope.status == "error"
    scope.domain == "non-software"
    ERROR_MESSAGE includes "outside pwrl-plan scope"
```

---

**Document Version:** 1.0
**Date:** 2026-06-11
**Status:** Reference specification for U1.1 implementation
