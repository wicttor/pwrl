---
unit-id: S6
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
status: archived
superseded-by: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md (Units U1-U8)
created: 2026-06-05
archived: 2026-06-10
dependencies: [S2, S3, S4, S5]
files:
  - agents/pwrl-planner.agent.md (new)
learnings: []
---

> ⚠️ **ARCHIVED & SUPERSEDED** — 2026-06-10
> 
> This task has been superseded by a comprehensive fix & verification plan:
> **[Fix and Verify PWRL Plan Micro-Skills for Production Readiness](docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md)**
> 
> The implementation from this task (agents/pwrl-planner.agent.md) is complete and in use.
> However, critical P0/P1 findings from code review require fixes to enable production deployment.
> 
> **Related work:** 
> - Code review: `.context/pwrl-review/pwrl-plan-comprehensive-review/review.md`
> - New plan: `docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md`
> - New tasks: `docs/tasks/to-do/2026-06-10-u*.md`
> 
> ---

# S6: Create pwrl-planner.agent.md Orchestrator

## Goal

Build a new agent file `pwrl-planner.agent.md` that orchestrates the 4 micro-skills (S2-S5) in sequence, handling state passing between skills and user confirmations at each phase. This agent provides an optional, streamlined planning workflow for systems with agent infrastructure enabled.

## Context

With micro-skills now independent (S2, S3, S4, S5), an agent is needed to:
- Call skills in sequence: S2 → S3 → S4 → S5
- Pass state forward between skills
- Collect user confirmations/adjustments at each phase
- Provide clear summary of progress

This agent is **optional** — systems without agents will use the fallback pwrl-plan skill (S7).

**Why this matters:** Agent orchestration provides a polished, interactive planning experience for advanced systems.

**Dependency:** Depends on S2-S5 (micro-skills must exist). Parallel with S7 (fallback).

## Related Learnings

- **Learning: PWRL Agent Orchestration** (if exists at `docs/learnings/agent-orchestration.md`)
  - *Applicability:* Guides sequential skill calling, state passing patterns, user interaction in agents.

**Learning Gap:** If no learning for "Agent Design Patterns" exists, create one via `/pwrl-learnings` after S6 completes.

## Implementation Steps

1. **Understand Agent File Format**
   - Study existing agent examples in the project (if any)
   - Understand how agents call skills sequentially
   - Learn state passing mechanisms (memory, markdown files, etc.)

2. **Design Agent Workflow**
   - **Entry Point:** User provides task description
   - **Phase 1:** Call S2 (pwrl-plan-scope) → collect scoped context
   - **Checkpoint 1:** Ask user: "Is scope correct?" (yes/adjust/cancel)
   - **Phase 2:** Call S3 (pwrl-plan-research) with scoped context → collect research findings
   - **Checkpoint 2:** Ask user: "Research sufficient?" (yes/run external/continue)
   - **Phase 3:** Call S4 (pwrl-plan-design) with context + research → collect units
   - **Checkpoint 3:** Ask user: "Units look good?" (yes/adjust/cancel)
   - **Phase 4:** Call S5 (pwrl-plan-generate) with all state → generate plan
   - **Summary:** Display plan file path + first 100 words
   - **Exit:** "Plan created! Next: /pwrl-tasks to create task files"

3. **Create pwrl-planner.agent.md**
   - Path: `agents/pwrl-planner.agent.md`
   - Frontmatter: agent metadata (name, description, version)
   - Define workflow sections for each phase + checkpoint

4. **Implement Phase Orchestration**
   - For each phase (S2-S5):
     - Prepare input state from previous phases
     - Call skill with appropriate arguments
     - Capture output state
     - Store state in memory or temp markdown file for next skill
     - Handle skill errors gracefully

5. **Implement User Checkpoints**
   - After each phase, ask user:
     - Is this phase correct? (Yes/Adjust/Cancel)
     - If "Adjust": offer to re-run phase with new info
     - If "Cancel": abort cleanly; offer to save partial progress
   - Use ask_user tool for clear, structured questions

6. **Implement State Management**
   - Define state schema: what flows between skills?
     - S2 → S3: scoped context
     - S3 → S4: research findings
     - S4 → S5: units + complexity hint
   - Choose storage: memory, session file, or markdown temp file
   - Ensure no information loss

7. **Implement Error Handling**
   - If skill fails: log error, offer retry or skip
   - If state is invalid: ask user to re-run that phase
   - If user cancels: offer to save progress and exit

8. **Implement Summary & Next Steps**
   - After plan generation:
     - Display: "Plan saved to [path]"
     - Show: First 100 words of plan
     - Suggest: "Next: Run `/pwrl-tasks [plan-path]` to create task files"

## Code Patterns

**Example: Agent Workflow Structure (pseudo-code)**

```markdown
# pwrl-planner.agent.md

## Metadata
- Name: PWRL Planner Agent
- Description: Orchestrates planning workflow via micro-skills
- Version: 1.0

## Workflow

### Phase 1: Scope Gathering
1. Call skill: `/pwrl-plan-scope [task description]`
2. Store output: scoped_context
3. Checkpoint: Ask user "Is scope correct?"
4. If no: ask what to adjust; re-run S2
5. If yes: proceed to Phase 2

### Phase 2: Research
1. Call skill: `/pwrl-plan-research [scoped_context]`
2. Store output: research_findings
3. Checkpoint: Ask user "Research sufficient?"
4. If no: offer `/librarian` or external research
5. If yes: proceed to Phase 3

### Phase 3: Design
1. Call skill: `/pwrl-plan-design [scoped_context, research_findings]`
2. Store output: units
3. Checkpoint: Ask user "Units look good?"
4. If no: ask what to adjust; re-run S4
5. If yes: proceed to Phase 4

### Phase 4: Generate
1. Call skill: `/pwrl-plan-generate [scoped_context, research_findings, units]`
2. Output: plan file path
3. Display plan summary
4. Suggest: "Next: /pwrl-tasks [plan-path]"
```

**Example: State Passing (Markdown Temp File)**

```markdown
# Planning Session State

## Phase 1: Scoped Context
[Output from S2]

## Phase 2: Research Findings
[Output from S3]

## Phase 3: Implementation Units
[Output from S4]

## Status: Ready for Phase 4
```

**Example: User Checkpoint**

```
Agent: "Phase 1 Complete: Scope Gathering

Problem: Decompose pwrl-plan into micro-skills
Intended Behavior: 4 independent skills + agent orchestration
Success Criteria: All phases have skills, agent works, fallback works

Does this look correct?
a) Yes, proceed to research
b) Adjust scope
c) Cancel and save
```

## Edge Cases

1. **User provides vague task description**
   - Solution: S2 (pwrl-plan-scope) asks clarifying questions
   - Agent preserves user answers through to end

2. **Research phase suggests external research**
   - Solution: Agent pauses; asks user if they want to run `/librarian` manually
   - Offers resume without external research

3. **Units need adjustment**
   - Solution: Agent offers to re-run S4 with "adjustments"
   - User provides feedback; S4 re-runs with updated context

4. **Plan generation fails**
   - Solution: Agent logs error; offers retry or debug info
   - User can investigate or request support

5. **User interrupts (Ctrl+C)**
   - Solution: Agent gracefully saves state to temp file
   - Suggests: "State saved. Resume with [resume command]"

## Testing

### Unit Test: Phase 1 Orchestration

- **Input:** Task description (e.g., "plan skill decomposition")
- **Verification:**
  - Agent calls S2 (pwrl-plan-scope)
  - Agent displays scoped context
  - Agent asks user checkpoint question
  - State is captured correctly

### Unit Test: State Passing (S2 → S3)**

- **Input:** Scoped context from S2
- **Verification:**
  - Agent passes scoped context to S3 correctly
  - S3 receives all required fields
  - No information loss in passing

### Unit Test: Full Orchestration (All Phases)**

- **Input:** Task description
- **Verification:**
  - All 4 phases execute in order
  - Checkpoints are asked after each phase
  - User can answer "yes" to proceed through all phases
  - Final plan file is created at `docs/plans/`

### Unit Test: Checkpoint Interaction**

- **Input:** User answers "adjust" at Phase 1 checkpoint
- **Verification:**
  - Agent offers adjustment options
  - Agent re-runs Phase 1 with new input
  - Updated scoped context is used for Phase 2

### Integration Test: Full Workflow**

- **Input:** Task description; answers "yes" at all checkpoints
- **Verification:**
  - All phases complete successfully
  - Plan is saved to `docs/plans/`
  - Summary is displayed
  - Agent suggests next step (pwrl-tasks)

## Acceptance Criteria

✅ `agents/pwrl-planner.agent.md` exists and is functional  
✅ Agent calls S2 → S3 → S4 → S5 in sequence  
✅ State passing between skills works correctly  
✅ Checkpoints are asked after each phase  
✅ User can adjust and re-run phases  
✅ Final plan is saved to `docs/plans/` with correct format  
✅ Error handling works: skills failures are caught and reported  
✅ User can cancel at any phase  
✅ Summary displays plan path + first 100 words  
✅ Next steps suggestion (pwrl-tasks) is provided  
✅ Agent works independently; tested without pwrl-plan fallback  

## References

- Input: Task description from user
- Calls: S2 (pwrl-plan-scope), S3 (pwrl-plan-research), S4 (pwrl-plan-design), S5 (pwrl-plan-generate)
- Output: Plan file path + summary
- Next: pwrl-tasks skill to create task files from plan
- Optional: This agent is optional; fallback exists in S7 (pwrl-plan)

