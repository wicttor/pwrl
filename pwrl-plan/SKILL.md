---
name: pwrl-plan
description: "Create structured implementation plans with three tiers (Fast/Standard/Deep). Pure skill pipeline orchestrator—no agent routing."
argument-hint: "[task description, requirements doc, or goal to plan]"
---

# PWRL Plan — Pure Skill Orchestrator

Create durable implementation plans that can be handed off for execution. Orchestrates a deterministic pipeline of micro-skills: scope → research → design → generate. No agent dependency, no fallback paths.

## Purpose

Plans capture decisions, structure, and approach before execution. They enable:

- Clear scope and success criteria
- Identified risks and dependencies
- Concrete implementation units with acceptance criteria
- Knowledge reuse through related learnings
- Confidence that work won't go off the rails

## Core Workflow: Four-Phase Pipeline

```
INPUT (task description)
  ↓
PHASE 1: Scope (pwrl-plan-scope)
  → Gather context, validate domain, bootstrap requirements
  → Output: Scoped context artifact
  ↓
PHASE 2: Research (pwrl-plan-research)
  → Discover patterns, identify risks, recommend external research
  → Output: Research findings artifact
  ↓
PHASE 3: Design (pwrl-plan-design)
  → Decompose into units, map dependencies, assess complexity
  → Output: Design artifact with unit decomposition
  ↓
PHASE 4: Generate (pwrl-plan-generate)
  → Select tier, render plan, embed learnings, save to docs/plans/
  → Output: Final plan document saved to file
  ↓
OUTPUT (plan file ready for execution)
```

## Phase Details

### Phase 1: Scope (pwrl-plan-scope)

**Purpose:** Entry point to planning workflow. Gathers context, checks existing plans and learnings, validates domain, and returns a scoped context object.

**Micro-Skill:** `pwrl-plan-scope`

**Input:**

- User provides task description, requirements doc, or goal
- Empty input prompts user: "What would you like to plan?"

**Processing:**

1. Check for existing plans in `docs/plans/`; suggest resume/review/archive/delete/new
2. Validate domain (software vs. non-software)
3. Bootstrap problem frame, intended behavior, success criteria
4. Search `docs/learnings/INDEX.md` for related learnings
5. Search `docs/requirements/` and `docs/brainstorms/` for matching docs
6. Confirm context with user
7. **Ask interaction mode:**
   - **Detailed:** Step-by-step interaction at each phase (review, confirm, adjust)
   - **Yolo:** Full automation from Phase 1 through Phase 4, final confirmation only
8. Generate scope artifact with interaction_mode

**Output:** Scoped context artifact with:

- Problem frame, intended behavior, success criteria
- Related learnings (HIGH-relevance)
- Learning gaps identified
- Requirements found
- interaction_mode (detailed or yolo)

**See:** [pwrl-plan-scope/SKILL.md](../pwrl-plan-scope/SKILL.md) for detailed workflow

### Phase 2: Research (pwrl-plan-research)

**Purpose:** Discover local patterns, tech stack, and high-risk areas. Recommend external research if needed.

**Micro-Skill:** `pwrl-plan-research`

**Input:** Scoped context artifact from Phase 1

**Processing:**

1. Detect tech stack from `package.json`, `Dockerfile`, codebase structure
2. Discover local patterns (architecture, async style, testing, organization)
3. Identify high-risk areas (security, performance, migrations, distributed systems, compliance)
4. Recommend external research for high-risk areas (optional)
5. Integrate insights from related learnings
6. Compile research findings

**Output:** Research artifact with:

- Tech stack detection
- Local patterns identified
- Risk areas with recommendations
- External research findings (if performed)
- Learnings integration notes

**See:** [pwrl-plan-research/SKILL.md](../pwrl-plan-research/SKILL.md) for detailed workflow

### Phase 3: Design (pwrl-plan-design)

**Purpose:** Decompose work into implementation units, identify dependencies and risks, assess complexity.

**Micro-Skill:** `pwrl-plan-design`

**Input:** Scoped context + Research findings

**Processing:**

1. Identify work units from success criteria and risk areas
2. Map dependencies between units (topological sort)
3. Detect circular dependencies; prompt for refactoring
4. Create risk mitigation units
5. Generate Mermaid diagrams for complex workflows (5+ units)
6. Assess complexity (LOW/MEDIUM/HIGH)
7. Estimate effort
8. Confirm decomposition with user

**Output:** Design artifact with:

- Implementation units (U1, U2, ..., UX) with test scenarios and acceptance criteria
- Dependency graph and topological ordering
- Risk mitigations
- Mermaid diagrams (if complex)
- Complexity assessment and effort estimate

**See:** [pwrl-plan-design/SKILL.md](../pwrl-plan-design/SKILL.md) for detailed workflow

### Phase 4: Generate (pwrl-plan-generate)

**Purpose:** Select tier (Fast/Standard/Deep), render plan using tier template, embed learnings, save to `docs/plans/`.

**Micro-Skill:** `pwrl-plan-generate`

**Input:** Design artifact (from Phase 3) + Scope artifact (from Phase 1)

**Processing:**

1. Auto-select tier based on complexity/units/effort; prompt if ambiguous
   - **FAST:** LOW complexity, 1-3 units, <5 hours
   - **STANDARD:** MEDIUM complexity, 4-8 units, 5-20 hours
   - **DEEP:** HIGH complexity, 9+ units, 20+ hours
2. Render plan using tier-specific template
3. Embed top 3-5 HIGH-relevance learnings from scope
4. Generate unique filename: `YYYY-MM-DD-NNN-<slug>.md`
5. Handle filename collisions (increment sequence or update existing)
6. Save plan to `docs/plans/`

**Output:** Plan document saved to file with:

- Problem & scope
- Success criteria
- Implementation units (tier-specific detail level)
- Risk analysis (STANDARD/DEEP)
- Related learnings (STANDARD/DEEP)
- Learning gaps (DEEP)
- Rollout notes (STANDARD/DEEP)

**See:** [pwrl-plan-generate/SKILL.md](../pwrl-plan-generate/SKILL.md) for detailed workflow

## Planning Tiers

| Tier         | Best For                           | Files | Risk | Time      |
| ------------ | ---------------------------------- | ----- | ---- | --------- |
| **FAST**     | Bug fixes, small tweaks            | 1-3   | LOW  | 5-15 min  |
| **STANDARD** | Most features                      | 4-8   | MED  | 30-45 min |
| **DEEP**     | Architecture, security, migrations | 9+    | HIGH | 1-2 hours |

**See** [references/planning-tiers.md](references/planning-tiers.md) for full tier decision criteria and template examples.

## Core Principles

- **Deterministic Pipeline:** Phases always execute in sequence: scope → research → design → generate (no branching, no fallback)
- **Focus on Decisions:** Capture approach, structure, risks, and sequencing (not code simulation)
- **Right-Size:** Small tasks → short plans; complex work → more structure
- **Separate Planning from Execution:** Don't simulate implementation during planning
- **Be Concrete:** Use specific files, components, and dependencies
- **Stay Portable:** Use repository-relative paths only
- **Transparent Artifacts:** Each phase produces explicit output artifact for next phase

## Error Handling & Recovery

**Philosophy:** Fail explicitly, not silently. Each phase has clear error handling with recovery suggestions.

### Phase 1 (Scope) Errors

- **Empty Input:** Prompt user for task description; retry
- **Non-Software Domain:** Return error; suggest alternative tool
- **Ambiguous Input:** Ask clarifying questions; bootstrap with user responses
- **No Learnings/Requirements:** Continue (not an error)

**Recovery:** User can retry, provide clarification, or abort

### Phase 2 (Research) Errors

- **Codebase Analysis Fails:** Continue with minimal tech stack info
- **High-Risk Area Identified:** Recommend external research; user can approve or skip

**Recovery:** User can approve research, skip, or manually investigate

### Phase 3 (Design) Errors

- **Circular Dependency Detected:** Report cycle path; prompt user to refactor
- **Too Many Units (15+):** Warn about complexity; suggest consolidation
- **Insufficient Detail:** Prompt to add test scenarios or split units

**Recovery:** User can refactor, consolidate, or proceed with awareness

### Phase 4 (Generate) Errors

- **Filename Collision:** Offer options: update, increment, or cancel
- **Tier Selection Ambiguous:** Prompt user to choose tier
- **Failed File Write:** Check permissions/directory; retry or suggest manual save

**Recovery:** User can choose action or save manually

## Key Outputs

Each plan includes (tier-dependent):

- **Problem & Scope:** Clear problem frame and intended behavior
- **Success Criteria:** 1-3 specific conditions for completion
- **Implementation Units:** Named U-IDs with dependencies, files, approach, and acceptance criteria
- **Related Learnings:** Linked learning files with applicability notes (STANDARD/DEEP)
- **Learning Gaps:** Areas needing post-implementation documentation (DEEP)
- **Tier-Specific Sections:** Risk analysis, alternatives, rollout notes (STANDARD/DEEP)

## Interaction Method

- Use platform's `ask_user_questions`, `ask_user`, `ask_user_input`, `vscode/askQuestions` or any available extension/tool for user interaction for all decisions
- Ask one question at a time
- Use multiple-choice questions when possible
- If input is empty, ask: "What would you like to plan? Describe the task or project."
- Provide clear recovery suggestions when errors occur

## Architecture: No Agent Routing

**Difference from Previous Version:**

**Before:** Skill detected if agent was available, then either delegated to agent OR ran monolithic fallback (two code paths)

**After:** Skill directly calls micro-skills in sequence—single deterministic pipeline, no branching:

```
pwrl-plan orchestrator
├── 1. Call pwrl-plan-scope → get scope artifact
├── 2. Call pwrl-plan-research → get research artifact
├── 3. Call pwrl-plan-design → get design artifact
└── 4. Call pwrl-plan-generate → save plan file
```

**Benefits:**

- ✅ Simpler to understand (single code path)
- ✅ Easier to test (no branching logic)
- ✅ More maintainable (micro-skills independently testable)
- ✅ More composable (micro-skills reusable in other workflows)
- ✅ Better error handling (explicit at each phase)

## Micro-Skill References

- [pwrl-plan-scope](../pwrl-plan-scope/SKILL.md) — Context & scope gathering
- [pwrl-plan-research](../pwrl-plan-research/SKILL.md) — Pattern discovery & risk identification
- [pwrl-plan-design](../pwrl-plan-design/SKILL.md) — Unit decomposition & dependency mapping
- [pwrl-plan-generate](../pwrl-plan-generate/SKILL.md) — Plan rendering & file generation

## Related Documentation

- [references/planning-tiers.md](references/planning-tiers.md) — Tier definitions and decision criteria
- [docs/guides/micro-skill-patterns.md](../docs/guides/micro-skill-patterns.md) — How to extend with new micro-skills
- [docs/guides/skill-architecture-refactoring.md](../docs/guides/skill-architecture-refactoring.md) — Rationale for refactoring

## Testing & Validation

**Comprehensive test coverage:**

- 30+ tests for pwrl-plan-scope (U1.1)
- 25+ tests for pwrl-plan-research (U1.2)
- 35+ tests for pwrl-plan-design (U1.3)
- 30+ tests for pwrl-plan-generate (U1.4)
- 30+ integration tests for full orchestration pipeline

**Backward Compatibility:**

- Same input/output behavior as previous version
- Existing plans generated successfully
- No breaking changes for users

## Frequently Asked Questions

**Q: What if a phase fails? Can I skip it or retry?**

A: Yes. Each phase has explicit error handling with recovery suggestions. You can retry, provide clarification, modify scope, or abort. No silent failures.

**Q: Can I use just one micro-skill (e.g., only generate from design)?**

A: The orchestrator expects to call all four phases in sequence. If you want to use a single micro-skill, call it directly by name: `/pwrl-plan-scope`, `/pwrl-plan-design`, etc.

**Q: Why no agent routing?**

A: Agents were adding complexity without value. The micro-skill pipeline is deterministic, testable, and easier to understand. Direct skill calling is simpler and more maintainable.

**Q: Can I extend this for other workflows?**

A: Yes! The micro-skills are reusable. For example, pwrl-work can use pwrl-plan-design for unit decomposition. See [docs/guides/micro-skill-patterns.md](../docs/guides/micro-skill-patterns.md).

---

**Status:** Pure skill pipeline (no agent routing)
**Version:** 2.0 (refactored from agent-dependent architecture)
**Created:** 2026-06-11
