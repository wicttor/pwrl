---
unit-id: S8
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
status: done
created: 2026-06-05
dependencies: [S2, S3, S4, S5, S6, S7]
files:
  - skills/pwrl-plan-scope/SKILL.md
  - skills/pwrl-plan-research/SKILL.md
  - skills/pwrl-plan-design/SKILL.md
  - skills/pwrl-plan-generate/SKILL.md
  - agents/pwrl-planner.agent.md
  - docs/examples/planner-workflow.md (new)
  - docs/examples/pwrl-planner-agent-example.md (new)
learnings: []
---

# S8: Update Documentation & Examples

## Goal

Create comprehensive documentation for micro-skills (S2-S5), agent (S6), fallback strategy (S7), and provide usage examples for both agent and fallback paths. Ensure all developers understand how to use the new planning infrastructure.

## Context

With 5 micro-skills + agent + fallback now implemented, documentation is essential for:
- Explaining micro-skill boundaries and responsibilities
- Showing how to use the agent workflow
- Demonstrating the fallback path
- Providing real examples of planning workflows
- Clarifying when to use agent vs. fallback

**Why this matters:** Good documentation reduces support burden and enables easy adoption.

**Dependency:** Depends on S2-S7 (all components must exist). Can be parallelized with S9 (testing).

## Related Learnings

- **Learning: Documentation Best Practices** (if exists at `docs/learnings/documentation.md`)
  - *Applicability:* Guides structure, examples, and clarity.

**Learning Gap:** If no learning for "Planning Workflow Documentation" exists, create one via `/pwrl-learnings` after S8 completes.

## Implementation Steps

1. **Document Micro-Skills (S2-S5)**
   - For each skill (pwrl-plan-scope, pwrl-plan-research, pwrl-plan-design, pwrl-plan-generate):
     - Ensure SKILL.md has clear header: name, description, purpose
     - Document: inputs, outputs, key actions
     - Provide: 1-2 usage examples
     - Note: dependencies (what must run before this skill)
     - Include: error handling guidance

2. **Document Agent (S6)**
   - Update `agents/pwrl-planner.agent.md` with:
     - Agent purpose: orchestrate micro-skills
     - Workflow diagram: Phase 1 → Checkpoint → Phase 2 → ... → Phase 4 → Summary
     - Entry point: how to invoke agent (e.g., `/pwrl-planner-agent [task]`)
     - State passing: what flows between phases
     - Checkpoints: what user decisions are made at each phase
     - Error handling: what happens if a phase fails

3. **Document Fallback Strategy (S7)**
   - Update `skills/pwrl-plan/SKILL.md` with:
     - Agent vs. Fallback section (from S7 task)
     - Detection logic explanation
     - When each path is used
     - How to enable agent path
     - Troubleshooting guide

4. **Create docs/examples/planner-workflow.md**
   - **Purpose:** Show both agent and fallback paths end-to-end
   - **Content:**
     ```
     # Planning Workflows
     
     ## Workflow 1: Agent Path (Recommended)
     - Prerequisites: agents enabled, pwrl-planner.agent.md exists
     - Steps: Run `/pwrl-planner-agent [task description]`
     - Example input: "Plan microservice decomposition"
     - Expected output: Plan file at docs/plans/YYYY-MM-DD-NNN-*.md
     - Duration: 5-10 minutes
     - User interactions: 4 checkpoints (scope, research, units, confirmation)
     
     ## Workflow 2: Fallback Path (Monolithic)
     - Prerequisites: None (always available)
     - Steps: Run `/pwrl-plan [task description]`
     - Example input: "Plan microservice decomposition"
     - Expected output: Plan file at docs/plans/YYYY-MM-DD-NNN-*.md
     - Duration: Similar to agent path
     - User interactions: Same checkpoints
     
     ## Comparison Table
     | Aspect | Agent Path | Fallback Path |
     |--------|-----------|---------------|
     | Speed | Fast | Same |
     | User Experience | Interactive phases | Inline phases |
     | Requirements | Agents enabled | None |
     | Robustness | Enhanced | Proven |
     ```

5. **Create docs/examples/pwrl-planner-agent-example.md**
   - **Purpose:** Show detailed agent workflow with concrete example
   - **Content:**
     - Walkthrough: Example task from start to finish
     - Screenshots/logs: Expected agent output at each phase
     - User choices: What user decides at each checkpoint
     - Final plan: Rendered plan excerpt
     - Next steps: How to create tasks from plan (S8 / pwrl-tasks)

6. **Create Agent Usage Guide**
   - Document: How to invoke agent
     - Command: `/pwrl-planner-agent "your task description"`
     - Or: Use skill browser to find agent
   - Document: Phase-by-phase walkthrough
   - Document: How to adjust at each checkpoint

7. **Create Fallback Usage Guide**
   - Document: How to invoke fallback
     - Command: `/pwrl-plan "your task description"` (auto-detects if agents unavailable)
   - Document: Same phases as agent (user may not notice they're using fallback)
   - Document: Troubleshooting if agent/fallback conflict

8. **Create Troubleshooting Guide**
   - Q: How do I know which path I'm using?
     - A: Look for log message: "Using pwrl-planner.agent.md" (agent) or "Running monolithic" (fallback)
   - Q: How do I force use of agent path?
     - A: Ensure agents are enabled; check pwrl-planner.agent.md exists
   - Q: How do I force use of fallback?
     - A: Disable agents in config, or delete pwrl-planner.agent.md temporarily
   - Q: Both paths failed. What now?
     - A: Check error logs; may be issue with micro-skills (S2-S5)

## Code Patterns

**Example: Micro-Skill Documentation Frontmatter**

```yaml
---
name: pwrl-plan-scope
description: >-
  Gather context and scope for planning workflow. Handles:
  - Resume or create new plan decisions
  - Learnings index gate (find related learnings)
  - Domain validation (software vs. non-software)
  - Bootstrap: Problem Frame, Intended Behavior, Success Criteria
argument-hint: "[task description or goal to plan]"
---
```

**Example: Agent Usage Instructions**

```markdown
# pwrl-planner.agent.md Usage

## How to Invoke
```bash
/pwrl-planner-agent "Plan the decomposition of pwrl-plan skill"
```

## What Happens
1. **Phase 1: Scope Gathering** — Agent asks clarifying questions
2. **Checkpoint 1** — User confirms scope is correct
3. **Phase 2: Research** — Agent searches codebase and decides if external research is needed
4. **Checkpoint 2** — User approves research findings
5. **Phase 3: Design** — Agent breaks work into implementation units (U1, U2, etc.)
6. **Checkpoint 3** — User reviews units; can request changes
7. **Phase 4: Generate** — Agent selects tier, renders plan, saves to docs/plans/
8. **Summary** — Agent shows plan path and suggests next steps

## Example Interaction
[Show full agent interaction log with user responses]
```

**Example: Workflow Comparison**

```markdown
## Comparing Paths

### Agent Path: `/pwrl-planner-agent [task]`
- ✅ Interactive phase-by-phase workflow
- ✅ Clear checkpoints where user can adjust
- ✅ Polished user experience
- ✅ Requires agents enabled
- ✅ Calls micro-skills via agent

### Fallback Path: `/pwrl-plan [task]`
- ✅ Works everywhere (no agent requirement)
- ✅ Same end result (identical plan output)
- ✅ Reliable fallback mechanism
- ✅ Proven monolithic approach
- ✅ No extra setup needed

**Choose:** Agent path if you want interactive experience; use fallback if you need universal compatibility.
```

## Edge Cases

1. **User asks "why use micro-skills?"**
   - Document: Benefits — reusability, testability, clarity
   - Link: To learning docs (TBD)

2. **Documentation example becomes outdated**
   - Solution: Version examples; note when they were last tested
   - Create issue: "Test planning workflows monthly"

3. **User confused about fallback**
   - Solution: Provide clear decision tree in docs
   - Example: "If agents disabled OR agent file missing → use fallback"

## Testing

### Documentation Test: Completeness

- **Input:** New developer reads all docs
- **Verification:**
  - Developer understands micro-skill responsibilities
  - Developer knows how to invoke agent path
  - Developer knows fallback path exists
  - Developer can troubleshoot issues
  - Developer knows where to go for next steps (pwrl-tasks)

### Documentation Test: Example Accuracy

- **Input:** Follow agent example walkthrough step-by-step
- **Verification:**
  - All shown commands work
  - Output matches documented expected output
  - No outdated references
  - Links to other docs are correct

### Documentation Test: Troubleshooting

- **Input:** Common issues listed in troubleshooting guide
- **Verification:**
  - Each issue has actionable solution
  - Solutions are tested and work
  - No circular references (solution doesn't point back to problem)

## Acceptance Criteria

✅ All micro-skill SKILL.md files have clear documentation (name, description, inputs, outputs)  
✅ Agent file (pwrl-planner.agent.md) has complete documentation  
✅ Fallback strategy is documented in pwrl-plan/SKILL.md  
✅ `docs/examples/planner-workflow.md` compares agent and fallback paths  
✅ `docs/examples/pwrl-planner-agent-example.md` shows detailed agent walkthrough  
✅ Troubleshooting guide addresses common issues  
✅ All examples are tested and accurate  
✅ Documentation links are valid (no broken references)  
✅ Microskill dependencies are clearly documented  
✅ Usage instructions are clear and actionable  

## References

- Updated files: S2-S7 (all micro-skills, agent, fallback)
- New docs: `docs/examples/planner-workflow.md`, `docs/examples/pwrl-planner-agent-example.md`
- Related: pwrl-tasks skill (next step after planning)

