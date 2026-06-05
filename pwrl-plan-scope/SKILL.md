---
name: pwrl-plan-scope
description: "Gather context, check learnings, validate domain, and bootstrap requirements for planning workflow."
argument-hint: "[task description, requirements doc, or goal to plan]"
---

# pwrl-plan-scope — Context & Scope Gathering

**Purpose:** Entry point to the planning workflow. Gathers context, checks existing plans and learnings, validates domain, and returns a scoped context object that downstream skills (pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate) consume.

## Interaction Method

- Use the platform's `ask_user` tool for all user-facing decisions.
- Ask one question at a time. Use follow-up questions to refine scope.
- Use multiple-choice questions when possible (e.g., "Is this a new feature, a bug fix, or a refactor?").
- If the input is empty, ask: "What would you like to plan? Describe the task or project."
- Do not proceed to research/design/generation — this skill only gathers context.

## Output: Scoped Context

After completing the workflow, produce a scoped context block (in memory or as markdown) with this schema:

```yaml
scope-id: YYYY-MM-DD-NNN-scope
domain: software | non-software
status: confirmed

# Scoped Context

## Problem
[Clear statement of the problem frame]

## Intended Behavior
[Description of desired outcome]

## Success Criteria
- [Criterion 1]
- [Criterion 2]

## Existing Plan
path: docs/plans/...md | null
action: resume | review | archive | delete | create-new | none

## Related Learnings
- docs/learnings/XXX.md — [1-line applicability note]
- (List from docs/learnings/INDEX.md; empty list if none)

## Learning Gaps
- [Gap name] — [Follow-up action via /pwrl-learnings]

## Requirements Found
- docs/brainstorms/XXX.md — [relevant excerpt]
- docs/requirements/XXX.md — [relevant excerpt]
- (Empty list if none found)
```

This context is passed to `pwrl-plan-research` (S3) for the research phase.

## Workflow

### Step 1: Check for Existing Plan

1. Search `docs/plans/` for existing plans related to the task.
2. **If an existing plan is found:**
   - Read the plan to understand its title and goal.
   - Ask the user via `ask_user` (multiple choice):
     ```
     An existing plan was found: "[Plan Title]"
     What would you like to do?
     - Resume: Continue working on this plan
     - Review: Read the plan before deciding
     - Archive: Keep for reference, mark as inactive
     - Delete: Remove the plan entirely
     - Create New: Start fresh
     ```
   - Handle each choice:
     - **Resume:** Use plan as-is; set `existing_plan.action: resume`
     - **Review:** Show plan summary, then re-prompt with same options
     - **Archive:** Move to archive; set `existing_plan.action: archive`
     - **Delete:** Remove file; set `existing_plan.action: delete`
     - **Create New:** Keep old plan; set `existing_plan.action: create-new`

3. **If no existing plan is found:**
   - Set `existing_plan.path: null`, `existing_plan.action: none`
   - Proceed to Step 2

### Step 2: Domain Validation

- Ask: "Is this a software/code planning task?"
- **If yes:** Set `domain: software`
- **If no:** Set `domain: non-software`
  - Note: Non-software planning is outside pwrl-plan's scope. Suggest a universal planning approach instead. The downstream skills (pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate) only support software planning.

### Step 3: Bootstrap Problem Context

If no existing context was found (no plan, no brainstorms/requirements), bootstrap from the user:

1. **Problem Frame:** Ask "What problem are you trying to solve? Describe it in 1-2 sentences."
2. **Intended Behavior:** Ask "What should happen after this is implemented? Describe the desired outcome."
3. **Success Criteria:** Ask "How will we know this is complete? What specific outcomes define success?" Collect 1-3 criteria.

If the user already provided rich context in the initial input, extract these from the input text and confirm with the user via `ask_user`.

### Step 4: Learnings Index Gate

1. Read `docs/learnings/INDEX.md`.
2. Search entries for keywords matching the task description (problem, domain, technologies, patterns).
3. **For each match:**
   - Add to `Related Learnings` list with file path and 1-line applicability note
   - Rate relevance: high / medium / low
4. **Identify learning gaps:**
   - If the task touches areas not covered by existing learnings, add a `Learning Gap` note
   - Include a follow-up action to document via `/pwrl-learnings` during/after implementation
   - Example: If task involves "deploying to Kubernetes" but no learning exists for Kubernetes patterns → gap
5. If no relevant learnings found, set `Related Learnings` to empty and note "No relevant learnings found."

### Step 5: Requirements Search

1. Search `docs/brainstorms/` for files whose names or content match the task description.
   - Keywords: exact match on filename, grep content for relevant terms
   - If the directory does not exist, skip silently
2. Search `docs/requirements/` for matching files.
   - Same approach as brainstorms
3. **For each match:**
   - Extract the title and a 1-2 sentence relevant excerpt
   - Add to `Requirements Found` list
4. If no matches found, set `Requirements Found` to empty.

### Step 6: Confirm and Return Scoped Context

1. Present the assembled scoped context to the user via `ask_user` for confirmation.
2. Ask: "Is this context correct? Should I proceed to the research phase?"
3. **If confirmed:** Return the scoped context (markdown block as defined above).
4. **If corrections needed:** Iterate through Steps 2-5 as needed based on user feedback.
5. **Do not proceed to research/design/generation** — this skill only gathers context.

## Edge Cases

### 1. Existing plan is outdated
- Show a summary of the plan (title, date, status, goal)
- Ask user to confirm: "This plan was created on [date]. Is it still relevant?"
- Default to "Create New" if user is unsure

### 2. Multiple existing plans found
- List all found plans with their titles and dates
- Ask user to select one or choose "None of these — create new"
- If selected, treat as single existing plan (Step 1)

### 3. No learnings indexed yet
- `docs/learnings/INDEX.md` may have no entries (empty table)
- Set `Related Learnings` to empty, note: "No learnings indexed yet — consider documenting via /pwrl-learnings"
- Proceed normally; learning gaps will be identified during implementation

### 4. No brainstorms/requirements directories
- These directories may not exist in all projects
- Silently skip search; set `Requirements Found` to empty
- Proceed with bootstrap approach in Step 3

### 5. User provides very vague input
- Ask clarifying questions first (e.g., "Is this a new feature, a bug fix, or a refactor?")
- If still unclear after 2 rounds, ask user to provide a written description or requirements doc
- Do not proceed until Problem Frame is reasonably clear

### 6. Non-software domain
- Set `domain: non-software`
- Explain: "This planning skill is designed for software engineering tasks. For non-software planning, consider a universal planning template instead."
- Offer to proceed with a simplified generic context or exit

### 7. Learning gaps identified
- Include gap notes in the output
- Suggest that downstream skills (especially pwrl-plan-generate) add a `Related Learnings` section with gap follow-ups
- Gaps are not blockers; they are tracked for post-implementation documentation

## State Passing (to S3: pwrl-plan-research)

After completing this skill, the scoped context object is passed to `pwrl-plan-research`. The context uses a simple markdown format with a YAML frontmatter section (see "Output: Scoped Context" above). Downstream skills read the file from memory or from a stored location at `docs/plans/.scope/YYYY-MM-DD-NNN-scope.md`.

**Schema contract (stable):**

| Field              | Type                       | Required | Description                              |
| ------------------ | -------------------------- | -------- | ---------------------------------------- |
| `domain`           | string                     | yes      | "software" or "non-software"             |
| `problem`          | string                     | yes      | Problem frame statement                  |
| `intended_behavior`| string                     | yes      | Desired outcome                          |
| `success_criteria` | string[]                   | yes      | 1-3 success criteria                     |
| `existing_plan`    | object {path, action}      | yes      | Path to existing plan or null            |
| `related_learnings`| string[]                   | yes      | Learning file paths with applicability   |
| `learning_gaps`    | string[]                   | yes      | Identified gaps with follow-up actions   |
| `requirements`     | string[]                   | yes      | Found requirements/brainstorms excerpts  |

**Versioning:** Fields will only be added, never removed or renamed. Downstream skills should handle extra fields gracefully.

## References

- **Source:** Phase 1 of `pwrl-plan/SKILL.md`
- **Downstream:** `pwrl-plan-research` (S3) — receives scoped context
- **Integration:** `ask_user` tool for all user decisions
- **Learnings Index:** `docs/learnings/INDEX.md`
- **Plan storage:** `docs/plans/`
- **Brainstorms:** `docs/brainstorms/` (optional)
- **Requirements:** `docs/requirements/` (optional)
