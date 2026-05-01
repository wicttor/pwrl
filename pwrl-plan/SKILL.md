---
name: pwrl-plan
description: "Create structured implementation plans for any task. Supports three tiers: Fast (lightweight), Standard (technical), and Deep (high-confidence/risky)."
argument-hint: "[task description, requirements doc, or goal to plan]"
---

# Universal Planner

**Note: The current year is 2026.**

This skill defines **HOW** to build a solution. It produces a durable implementation plan that can be handed off for execution. When invoked, always stay in the planning workflow—if the input is unclear, ask clarifying questions rather than abandoning the task.

## Interaction Method

- Use the platform's `ask_user` tool for questions.
- Ask one question at a time. Use follow-up questions to clarify scope, requirements, or constraints.
- Use multiple rounds of questioning to refine the plan before generating it.
- Use multiple-choice questions when possible to guide the user toward specific details (e.g., "Is this a new feature, a bug fix, or a refactor?").
- If the input is empty, ask: "What would you like to plan? Describe the task or project."

## Core Principles

1. **Focus on decisions, not code**: Define approach, structure, risks, and sequencing — not implementation details.
2. **Right-size the plan**: Small tasks → short plans. Complex work → more structure.
3. **Separate planning from execution**: Don’t simulate coding, testing, or runtime behavior.
4. **Be concrete**: Use specific files, components, or steps where relevant.
5. **Stay portable**: Avoid tool-specific instructions or environment assumptions.

## Plan Quality Bar

A good plan includes:

- Clear problem and scope
- Key requirements or success criteria
- Concrete steps or implementation units
- Dependencies and sequencing
- Risks or unknowns
- Test or validation scenarios (when applicable)

---

## Planning Tiers

Choose the appropriate tier based on task complexity and risk:

1. **Fast**: Small, well-bounded tasks (1-3 files, clear scope, low risk)
2. **Standard**: Most software features (technical decisions, moderate complexity, test scenarios)
3. **Deep**: Cross-cutting or high-risk work (10+ files, architecture, security, migrations, alternatives analysis)

**See `references/plan-templates.md` for full templates and examples.**

---

## Workflow

### Phase 1: Context & Scope

1. **Resume or Create:** If a plan exists in `docs/plans/`, ask the user if they want to:
   - Resume the existing plan (if it's active)
   - Create a new plan (if the existing one is outdated or irrelevant)
   - Review the existing plan (if they want to see it before deciding)
   - Archive the existing plan (if it should be kept for reference but not active)
   - Delete the existing plan (if it should be removed entirely)
2. **Requirements Check:** Search `docs/brainstorms/`, `docs/requirements/`, **Memory** and `ARCHITECTURE.md` for relevant context.
3. **Domain Check:** If the task isn't software-related (e.g., "plan a vacation"), use a universal planning template instead.
4. **Bootstrap:** If no docs exist, briefly define the Problem Frame, Intended Behavior, and Success Criteria.

### Phase 2: Research & Design

1. **Local Research:** Identify existing patterns, tech stack versions, and relevant files.
2. **External Research:** Run if the task involves high-risk areas (Security, Payments, APIs) or if the codebase lacks 3+ examples of the required pattern.
3. **Technical Design (Optional):** For complex logic, include a Mermaid diagram (sequence, state, or flowchart) or a pseudo-code grammar. Frame as _directional guidance_, not a specification to copy.

### Phase 3: Implementation Units

1. Break the work into stable **U-IDs** (U1, U2, etc.).
2. **Stability:** Never renumber IDs if units are moved or deleted.

### Phase 4: Plan Generation

1. Choose template tier (Fast/Standard/Deep) based on task complexity
2. Read `references/plan-templates.md` for full template format
3. Write plan following template structure:
   - **Naming**: Save to `docs/plans/YYYY-MM-DD-NNN-<name>.md`
   - **Relative Paths**: All file references must be repository-relative (e.g., `src/main.js`), never absolute
   - **No Implementation**: Describe the _approach_ and _logic_; DO NOT WRITE production code inside the plan
4. Include required sections per tier:
   - **Fast**: Goal, Implementation Units with files/approach/verification
   - **Standard**: Overview, Key Technical Decisions, Implementation Units with test scenarios, System-Wide Impact
   - **Deep**: All Standard sections plus High-Level Technical Design, Alternative Approaches, Risk Analysis, Operational Notes

---

## Best Practices

1. **Portable Paths**: Use repository-relative paths only (e.g., `src/main.js`); absolute paths break plans
2. **U-ID Stability**: Implementation unit IDs like `U1`, `U2` are anchors; never renumber them if units are moved or deleted
3. **Decisions, Not Code**: Capture boundaries, approach, and logic; leave variable naming and syntax to implementation phase
4. **Research First**: If the codebase lacks local patterns for the task, always perform external research before finalizing
5. **Right-Size**: Small tasks get short plans; complex work gets more structure; don't over-plan simple tasks
