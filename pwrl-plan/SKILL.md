---
name: pwrl-plan
description: "Create structured implementation plans for any task. Supports three tiers: Fast (lightweight), Standard (technical), and Deep (high-confidence/risky)."
argument-hint: "[task description, requirements doc, or goal to plan]"
---

# PWRL Plan

Create a durable implementation plan that can be handed off for execution.

## Purpose

- Define approach, sequencing, risks, and verification (not production code)
- Right-size planning effort via tiers: Fast, Standard, Deep
- Keep plans portable across tools and environments

## Plan Quality Bar

A good plan is concrete, testable, and easy to execute later:

- Clear goal and explicit non-goals
- Key requirements and success criteria
- Stable implementation units (`U1`, `U2`, ...) with file touch-points
- Dependencies/sequencing and any rollout/migration notes
- Risks/unknowns and how to de-risk them
- Verification scenarios (tests, checks, manual steps)

## Usage

```bash
/pwrl-plan
/pwrl-plan "add oauth login"
/pwrl-plan docs/requirements/auth.md
```

## Workflow

### Phase 1: Clarify Scope

1. If the input is unclear or empty, ask clarifying questions (one at a time).
2. Prefer multiple-choice questions when they speed up decisions (feature vs bugfix vs refactor).
3. Check for existing context: `docs/plans/`, `docs/requirements/`, `docs/brainstorms/`, `ARCHITECTURE.md`.
4. Read `docs/learnings/INDEX.md` and identify relevant learnings to reuse.

### Phase 2: Choose a Tier

1. Pick the tier based on complexity and risk:
   - **Fast**: 1-3 files, low risk
   - **Standard**: most features, moderate complexity
   - **Deep**: cross-cutting/high-risk work (10+ files, security, migrations)
2. Read `references/plan-templates.md` for the chosen template.

### Phase 3: Draft the Plan

1. Write the plan (no production code) using repository-relative paths only.
2. Break work into stable implementation units (`U1`, `U2`, ...); never renumber.
3. Include test/verification scenarios for each unit when applicable.
4. Add `Related Learnings` links with 1-line applicability notes (or explicitly state none).
5. Save to `docs/plans/YYYY-MM-DD-NNN-<name>.md`.

## Output

- A plan document at `docs/plans/YYYY-MM-DD-NNN-<name>.md`
- Uses the selected tier template from `pwrl-plan/references/plan-templates.md`
- Includes stable unit IDs, dependencies, risks/unknowns, and verification scenarios

## Best Practices

- Use repository-relative paths (absolute paths break portability)
- Capture decisions and boundaries, not implementation details
- Research locally first; do external research for high-risk areas or missing patterns

## Rules

- Stay in planning mode; do not implement production code.
- Use repository-relative paths in the plan (e.g., `src/main.js`).
- Keep unit IDs stable once created; never renumber.

## When to Use

- Use when you need a concrete implementation plan before coding.
- Prefer for medium/large work, unclear requirements, or risky changes.
