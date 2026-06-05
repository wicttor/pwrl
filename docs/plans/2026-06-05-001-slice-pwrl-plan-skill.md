---
id: 2026-06-05-001
status: active
tier: Standard
created: 2026-06-05
updated: 2026-06-05
---

# Plan: Slice pwrl-plan Skill into Micro-Skills for pwrl-planner.agent.md (with Fallback)

## Overview

**Goal:** Decompose the monolithic `pwrl-plan` skill into focused, reusable micro-skills that each handle one stage of the planning workflow. These micro-skills will be orchestrated by a new `pwrl-planner.agent.md` agent file (optional). The original `pwrl-plan` skill remains as a smart fallback: it detects if agents are enabled and either delegates to the agent or runs the monolithic workflow, ensuring planning always works regardless of system configuration.

- Single-responsibility components (easier to test, maintain, extend)
- Independent reuse in other agents or workflows
- Cleaner separation of concerns (context gathering vs. design vs. unit decomposition vs. generation)
- Simpler decision trees for each micro-skill

**Success Criteria:**
- All 4 planning phases have dedicated micro-skills
- `pwrl-planner.agent.md` successfully orchestrates them (when agents available)
- Each micro-skill can be tested independently
- Original `pwrl-plan` skill acts as intelligent wrapper with fallback behavior
- Planning works with or without agent infrastructure
- Documentation and examples updated

---

## Current State

**Existing Skill:** `pwrl-plan/SKILL.md` (at project root)

**Phases (nested in single skill):**
1. Phase 1: Context & Scope (resume plan, requirements check, learnings gate, domain check, bootstrap)
2. Phase 2: Research & Design (local research, external research, technical design optional)
3. Phase 3: Implementation Units (break into U-IDs, ensure stability)
4. Phase 4: Plan Generation (choose template tier, write plan, include learnings)

**Supporting Files:**
- `references/plan-templates.md` — template formats for Fast/Standard/Deep
- `docs/learnings/INDEX.md` — learning links to embed in plans
- `docs/brainstorms/`, `docs/requirements/` — research sources

---

## Key Technical Decisions

1. **Micro-Skill Boundaries:** Split by workflow phase, not by tier (Fast/Standard/Deep). Tiers are applied *within* phase 4 only.
2. **Orchestrator Pattern:** `planner.agent.md` calls micro-skills sequentially, passing state forward (context → design → units → generation).
3. **State Management:** Use simple markdown files or memory to retain state between skill calls, avoiding duplication.
4. **Fallback Strategy:** Keep the original `pwrl-plan` skill as a smart wrapper that:
   - Detects if agents are enabled in the system
   - If agents available: delegates to `pwrl-planner.agent.md`
   - If agents unavailable or agent file missing: runs monolithic fallback behavior
   - Always ensures planning works regardless of system configuration
5. **Template Abstraction:** Extract template logic into a shared reference or utility so all tiers (Fast/Standard/Deep) can be handled uniformly.

---

## Proposed Micro-Skills

### **U1: pwrl-plan-scope**
**Purpose:** Gather context, check learnings, validate domain, and bootstrap requirements.

**Inputs:**
- Task description (from user)
- Existing plan in `docs/plans/` (optional)

**Key Actions:**
- Check for existing plan; offer resume/create/review/archive/delete options
- Search `docs/brainstorms/`, `docs/requirements/`, `docs/learnings/INDEX.md` for context
- Validate domain (software vs. non-software)
- Generate or fetch Problem Frame, Intended Behavior, Success Criteria
- Identify Related Learnings from `docs/learnings/INDEX.md`
- Return: Scoped context object (requirements, learnings links, domain type)

**Dependencies:** None (entry point)

**Validation:** User confirms scope is correct before proceeding

---

### **U2: pwrl-plan-research**
**Purpose:** Perform local and external research to inform technical design.

**Inputs:**
- Scoped context from U1
- High-risk area flag (Security, Payments, APIs, complex logic)

**Key Actions:**
- Search local codebase for patterns, tech stack versions, relevant files
- Decide: External research needed? (high-risk + <3 local examples = yes)
- If external research needed: Run librarian or web search (guidance via comment)
- Gather technical constraints and context
- Return: Research findings (patterns found, tech stack info, external refs)

**Dependencies:** U1

**Validation:** Confirm research scope is sufficient before design phase

---

### **U3: pwrl-plan-design**
**Purpose:** Create technical design and produce implementation unit decomposition.

**Inputs:**
- Scoped context from U1
- Research findings from U2

**Key Actions:**
- Optionally: Generate Mermaid diagram (sequence/state/flowchart) for complex logic
- Break work into stable U-IDs (U1, U2, … UX)
- For each unit: define scope, affected files, approach, acceptance criteria
- Ensure U-ID stability (IDs never renumber)
- Return: Implementation units list with diagrams (if any)

**Dependencies:** U1, U2

**Validation:** User reviews unit breakdown; can request adjustments

---

### **U4: pwrl-plan-generate**
**Purpose:** Choose tier (Fast/Standard/Deep), render plan from template, embed learnings, save to docs/plans/.

**Inputs:**
- Scoped context from U1
- Research findings from U2
- Implementation units from U3

**Key Actions:**
- Determine tier (Fast/Standard/Deep) based on unit count and complexity heuristic
- Load appropriate template from `references/plan-templates.md`
- Render plan sections:
  - Goal, Requirements, Key Decisions (per tier)
  - Implementation Units with files/approach/verification
  - System-Wide Impact, Risk Analysis (per tier)
  - Related Learnings section with links and rationale
  - Learning Gap follow-ups
- Ensure all paths are repository-relative
- Generate plan filename: `docs/plans/YYYY-MM-DD-NNN-<name>.md`
- Save plan to disk
- Return: Plan file path and summary

**Dependencies:** U1, U2, U3

**Validation:** Plan is readable, parseable, and follows template structure

---

## Implementation Units for Slicing Work

### **S1: Extract Templates Module**
- **Scope:** Pull template definitions out of pwrl-plan/SKILL.md into a reusable module
- **Files Affected:** 
  - `pwrl-plan/references/plan-templates.md` (already exists, ensure completeness)
  - Possibly: `pwrl-plan-generate/references/tier-heuristic.md` (new utility) if needed
- **Approach:** Verify `plan-templates.md` has complete Fast/Standard/Deep templates; create helper logic if templates need dynamic rendering
- **Acceptance:** Templates are accessible, complete, and documented

### **S2: Create pwrl-plan-scope Micro-Skill**
- **Scope:** Implement U1 (scope gathering)
- **Files Affected:**
  - `pwrl-plan-scope/SKILL.md` (new)
- **Approach:** Extract Phase 1 logic from pwrl-plan/SKILL.md, adapt for standalone use with ask_user tool
- **Acceptance:** Skill runs independently, gathers context, identifies learnings

### **S3: Create pwrl-plan-research Micro-Skill**
- **Scope:** Implement U2 (research phase)
- **Files Affected:**
  - `pwrl-plan-research/SKILL.md` (new)
- **Approach:** Extract Phase 2 logic, parameterize high-risk detection, provide librarian guidance
- **Acceptance:** Skill identifies local patterns, decides on external research, returns findings

### **S4: Create pwrl-plan-design Micro-Skill**
- **Scope:** Implement U3 (design & unit decomposition)
- **Files Affected:**
  - `pwrl-plan-design/SKILL.md` (new)
- **Approach:** Extract Phase 3 logic, implement U-ID generator, optional Mermaid diagram support
- **Acceptance:** Skill produces stable, numbered units with clear scope

### **S5: Create pwrl-plan-generate Micro-Skill**
- **Scope:** Implement U4 (plan generation & saving)
- **Files Affected:**
  - `pwrl-plan-generate/SKILL.md` (new)
  - `pwrl-plan-generate/references/tier-heuristic.md` (new, defines tier selection logic)
- **Approach:** Extract Phase 4 logic, tier selection heuristic, template rendering, file I/O
- **Acceptance:** Skill renders and saves valid plans to `docs/plans/`

### **S6: Create pwrl-planner.agent.md Orchestrator**
- **Scope:** Build agent that calls micro-skills in sequence
- **Files Affected:**
  - `agents/pwrl-planner.agent.md` (new)
- **Approach:** 
  - Define agent entry point and workflow
  - Call S2 → S3 → S4 → S5 in sequence
  - Pass state between calls
  - Handle user confirmations at each phase
- **Acceptance:** Agent successfully orchestrates all micro-skills end-to-end
- **Note:** This agent is optional; systems without agents still work via pwrl-plan fallback

### **S7: Update pwrl-plan Skill to Support Fallback**
- **Scope:** Modify `pwrl-plan/SKILL.md` to detect agent availability and delegate or fallback
- **Files Affected:**
  - `pwrl-plan/SKILL.md` (update with agent-detection logic)
- **Approach:**
  - Add agent detection check at start (is pwrl-planner.agent.md available?)
  - If agents available & enabled: document that agent will be called; suggest user invoke via agent instead
  - If agents unavailable: run original monolithic workflow inline
  - Keep all original logic as fallback code path
- **Acceptance:** Skill behaves correctly whether agents are present or absent; documentation is clear

### **S8: Update Documentation & Examples**
- **Scope:** Document micro-skills, fallback strategy, and agent usage patterns
- **Files Affected:**
  - `pwrl-plan-*/SKILL.md` (all new micro-skills)
  - `docs/examples/planner-workflow.md` (new, showing both agent and fallback usage)
  - `docs/examples/pwrl-planner-agent-example.md` (new, agent-specific examples)
- **Approach:** Document each micro-skill, show pwrl-planner.agent.md usage, explain fallback strategy, provide examples for both paths
- **Acceptance:** All skills and agents have clear documentation; fallback strategy is transparent

### **S9: Integration Testing & Validation**
- **Scope:** Test full workflow (both agent and fallback paths), ensure backward compatibility
- **Files Affected:**
  - Test cases for agent & fallback paths
- **Approach:** 
  - Test 1: Run pwrl-planner.agent.md on test tasks (Fast, Standard, Deep tiers) with agents enabled
  - Test 2: Run pwrl-plan skill directly (fallback path) with agents disabled or unavailable
  - Test 3: Verify both paths produce identical plan output
  - Test 4: Confirm agent detection logic works correctly
  - Test 5: Edge case — agent file moved/renamed (graceful fallback)
- **Acceptance:** Both agent and fallback paths work correctly; all tiers produce expected output; fallback is seamless

---

## Dependencies & Sequencing

```
S1 (Templates Module)
  └─→ S2 (pwrl-plan-scope)
        └─→ S3 (pwrl-plan-research)
              └─→ S4 (pwrl-plan-design)
                    └─→ S5 (pwrl-plan-generate)
                          ├─→ S6 (pwrl-planner.agent.md) [optional, if agents enabled]
                          └─→ S7 (pwrl-plan Fallback Update) [always]
                                └─→ S8 (Documentation & Examples)
                                      └─→ S9 (Integration Testing)
```

**Critical Path:** S1 → S2 → S3 → S4 → S5 → S7 → S9 (linear; S6 & S8 can overlap)

---

## Risks & Unknowns

1. **State Passing Complexity:** If state grows large, micro-skills may need versioning or schema management. *Mitigation: Keep state simple; use memory or lightweight markdown files.*

2. **Template Rendering:** Template logic might be tightly coupled to context. *Mitigation: Extract template helpers early (S1); test with real examples.*

3. **Fallback Reliability:** Agent detection logic must be bulletproof; if agent check fails, must seamlessly fall back to monolithic behavior. *Mitigation: Test extensively (S9); wrap agent call in try-catch; ensure all fallback code paths remain functional.*

4. **Tier Detection Heuristic:** Automated tier selection (U-ID count + complexity) may not always be accurate. *Mitigation: Allow user override in pwrl-planner.agent.md.*

5. **Learning Gap Follow-up:** New learning items added during planning may not be immediately captured. *Mitigation: Include explicit `/pwrl-learnings` reminder in generated plan.*

---

## System-Wide Impact

- **User Workflows:** Zero breaking changes. Users can continue calling `pwrl-plan` skill; it intelligently delegates to agent (if available) or runs fallback. Identical inputs/outputs regardless of path.
- **Documentation:** Existing plans remain valid; new plans generate with same format.
- **Skill Registry:** 5 new micro-skills added; 1 new agent added; original `pwrl-plan` skill remains active as smart wrapper with fallback.
- **Interdependencies:** No breaking changes to other skills. New pwrl-planner.agent.md is optional enhancement; all workflows remain compatible.

---

## Related Learnings

- **Learning: Planning Workflow Fundamentals** — Covers Phase 1-4 concepts and tier selection; found at `docs/learnings/planning-workflow.md`
  - *Applicability:* Foundational reference for micro-skill boundaries and state passing.

- **Learning: PWRL Agent Orchestration** — Explains how agents call multiple skills sequentially; found at `docs/learnings/agent-orchestration.md`
  - *Applicability:* Critical for planner.agent.md design (S6).

- **Learning: Markdown State Management** — Documents lightweight state passing between skills using memory or markdown; found at `docs/learnings/state-management.md`
  - *Applicability:* Informs design of state objects for U1→U2→U3→U4 chain.

- **Learning: Template Rendering in Skills** — Covers extracting and reusing templates; found at `docs/learnings/template-rendering.md`
  - *Applicability:* Informs S1 (template module extraction) and S5 (plan generation).

**Learning Gaps:**
- No existing learning for "Fallback Strategy & Agent Detection" — *Follow-up:* Document agent detection logic and fallback strategy in `/pwrl-learnings` after S7 completion.
- No guidance on "Heuristic-Based Tier Selection" — *Follow-up:* Document tier detection heuristic (S5) in `/pwrl-learnings`.

---

## Test & Validation Scenarios

### **Fast Tier Test (S6 Integration)**
- Input: Small task (1-2 files, clear scope)
- Expected: planner.agent.md returns Fast-tier plan in <5 min
- Validation: Plan includes Goal, Implementation Units, Verification

### **Standard Tier Test (S6 Integration)**
- Input: Medium task (5-10 files, moderate complexity, tech decisions needed)
- Expected: planner.agent.md returns Standard-tier plan with Key Decisions, System-Wide Impact
- Validation: Plan includes all Standard sections, learnings embedded

### **Deep Tier Test (S6 Integration)**
- Input: Large task (10+ files, high risk, multiple alternatives)
- Expected: planner.agent.md returns Deep-tier plan with diagrams, risk analysis
- Validation: Plan includes all Deep sections, alternatives analyzed, risks identified

### **Backward Compatibility Test (S9)**
- Input: Run pwrl-planner.agent.md and fallback pwrl-plan on identical task
- Expected: Both produce structurally identical plans
- Validation: Plan contents match (allowing for minor formatting differences)

### **Agent Detection Test (S9)**
- Input: Call pwrl-plan skill with agents enabled, then disabled
- Expected: With agents: delegates (or indicates delegation); Without agents: runs fallback
- Validation: Both paths complete successfully; fallback requires no agent infrastructure

### **Learnings Integration Test (S2, S7)**
- Input: Task with related learnings in `docs/learnings/INDEX.md`
- Expected: micro-skill-scope identifies learnings; plan embeds them with rationale
- Validation: Plan includes "Related Learnings" section with correct links

---

## Next Steps (Post-Plan)

1. **Review & Approval:** Present plan to stakeholder; collect feedback (maintain planner role, don't jump to coding)
2. **Prioritize Units:** Determine order if parallelization is possible (likely S1 can start immediately)
3. **Prepare Task Breakdown:** Use `/pwrl-tasks` skill to slice S1-S8 into daily or sprint tasks
4. **Begin Work:** Use `/pwrl-work` skill to execute tasks; maintain quality and testing as per project rules
5. **Track Learnings:** Document discoveries in `/pwrl-learnings` as each unit completes
6. **Verify Fallback:** Before finalizing S7, confirm original pwrl-plan monolithic code still runs correctly as fallback
7. **Final Review:** Use `/pwrl-review` skill before merging; ensure code quality, test coverage, and both code paths work
8. **End Session:** Use `/pwrl-end-session` skill to commit and summarize progress

