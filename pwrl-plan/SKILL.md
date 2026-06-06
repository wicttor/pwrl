---
name: pwrl-plan
description: "Create structured implementation plans with three tiers (Fast/Standard/Deep). Routes to pwrl-planner.agent.md when available; provides monolithic fallback."
argument-hint: "[task description, requirements doc, or goal to plan]"
---

# PWRL Plan

Create durable implementation plans that can be handed off for execution. When invoked, stay in the planning workflow—if input is unclear, ask clarifying questions rather than abandoning the task.

## Purpose

Plans capture decisions, structure, and approach before execution. They enable:

- Clear scope and success criteria
- Identified risks and dependencies
- Concrete implementation units with acceptance criteria
- Knowledge reuse through related learnings
- Confidence that work won't go off the rails

## Workflow

### Step 1: Route to Agent or Fallback

The skill automatically detects whether agent-enhanced planning is available:

- **Agent Available:** Delegates to `pwrl-planner.agent.md` → calls micro-skills in sequence (pwrl-plan-scope → pwrl-plan-research → pwrl-plan-design → pwrl-plan-generate)
- **Agent Unavailable:** Runs monolithic fallback workflow (all phases inline)

**See `references/agent-routing.md` for detection logic and troubleshooting.**

### Step 2: Gather Context (Phase 1)

Use the platform's `ask_user` tool to:

1. Check for existing plans and decide: resume, review, archive, create new, or delete
2. Search for related context in `docs/brainstorms/`, `docs/requirements/`, `docs/learnings/`
3. Validate domain (software vs. non-software)
4. Bootstrap problem frame, intended behavior, and success criteria

**See micro-skill `pwrl-plan-scope` for detailed workflow.**

### Step 3: Research & Design (Phases 2-3)

Use `ask_user` for decisions:

1. Discover local patterns and tech stack
2. Detect high-risk areas (security, payments, APIs, migrations)
3. Recommend and execute external research if needed
4. Decompose work into implementation units (U1, U2, ..., UX)
5. Create optional Mermaid diagrams for complex workflows

**See micro-skills `pwrl-plan-research` and `pwrl-plan-design` for detailed workflows.**

### Step 4: Generate Plan (Phase 4)

Use `ask_user` for confirmations:

1. Select tier (Fast/Standard/Deep) based on complexity
2. Render plan using tier template
3. Embed related learnings and learning gaps
4. Save to `docs/plans/YYYY-MM-DD-NNN-<name>.md`

**See micro-skill `pwrl-plan-generate` for detailed workflow and `references/planning-tiers.md` for tier descriptions.**

## Planning Tiers

| Tier         | Best For                           | Files | Risk | Time      |
| ------------ | ---------------------------------- | ----- | ---- | --------- |
| **Fast**     | Bug fixes, small tweaks            | 1-3   | LOW  | 5-15 min  |
| **Standard** | Most features                      | 4-8   | MED  | 30-45 min |
| **Deep**     | Architecture, security, migrations | 9+    | HIGH | 1-2 hours |

**See `references/planning-tiers.md` for full tier decision criteria.**

## Core Principles

- **Focus on decisions, not code**: Capture approach, structure, risks, and sequencing
- **Right-size**: Small tasks → short plans; complex work → more structure
- **Separate planning from execution**: Don't simulate implementation
- **Be concrete**: Use specific files, components, and dependencies
- **Stay portable**: Use repository-relative paths only

## Key Outputs

Each plan includes:

- **Problem & Scope:** Clear problem frame and intended behavior
- **Success Criteria:** 1-3 specific conditions for completion
- **Implementation Units:** Named U-IDs with dependencies, files, approach, and acceptance criteria
- **Related Learnings:** Linked learning files with applicability notes
- **Learning Gaps:** Areas needing post-implementation documentation
- **Tier-Specific Sections:** Technical decisions, risk analysis, rollout notes (Standard/Deep)

## Interaction Method

- Use the platform's `ask_user` tool for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "What would you like to plan? Describe the task or project."

## Reference Files

- **`references/agent-routing.md`** — How detection works, troubleshooting, enabling agent path
- **`references/fallback-workflow.md`** — Complete Phase 1-4 logic (runs when agents unavailable)
- **`references/planning-tiers.md`** — Detailed tier descriptions and decision criteria
- **`references/plan-templates.md`** — Full plan templates for each tier
