---
unit-id: U1
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: []
created: 2026-06-10
files:
  - pwrl-plan/references/state-passing-protocol.md (new)
  - agents/pwrl-planner.agent.md (modify)
  - pwrl-plan-research/SKILL.md (modify)
  - pwrl-plan-design/SKILL.md (modify)
  - pwrl-plan-generate/SKILL.md (modify)
learnings:
  - docs/learnings/agent-orchestration.md
---

# U1: Define State Passing Protocol

## Goal

Create unified specification for how the pwrl-planner agent passes state between micro-skills and how skills read/write state.

## Context

**Why this is blocking:** Agent currently shows invocations like `/pwrl-plan-research` with no arguments, but skills expect to receive scoped context. Without a clear mechanism, the agent orchestration will fail—skills will re-prompt users instead of using prior context.

**Current state:** Agent documentation is vague about state passing; skills have conflicting expectations about input format.

## Implementation Steps

### Step 1: Analyze State Passing Options

- **Option A (Arg-based):** Agent passes state via command arguments `/pwrl-plan-research --scope docs/plans/.scope/...scope.md`
  - Pros: Simple, visible in logs
  - Cons: Limited by command-line length, requires escaping
- **Option B (File-based):** Skills auto-detect and load latest state from `docs/plans/.scope/`, `.research/`, `.design/` directories
  - Pros: Robust, debuggable, scalable, survives restarts
  - Cons: Requires directory structure and file discovery logic
- **Option C (Environment-based):** Agent stores state in environment variables or temp files
  - Pros: Fast, flexible
  - Cons: Not visible in logs, fragile

**Recommendation:** Option B (file-based) is most robust for a planning workflow

### Step 2: Create State Passing Protocol Document

Create `pwrl-plan/references/state-passing-protocol.md` with:
- Overview: Why file-based approach chosen
- Storage schema: Where each phase's state is written
  - `docs/plans/.scope/YYYY-MM-DD-NNN-scope.md` (written by S2: pwrl-plan-scope)
  - `docs/plans/.research/YYYY-MM-DD-NNN-research.md` (written by S3: pwrl-plan-research)
  - `docs/plans/.design/YYYY-MM-DD-NNN-design.md` (written by S4: pwrl-plan-design)
  - `docs/plans/YYYY-MM-DD-NNN-<name>.md` (written by S5: pwrl-plan-generate)
- Discovery logic: How skills find the latest scope/research/design file
  - Read directory, filter by session ID or date, select most recent
- Serialization: YAML frontmatter + Markdown body format
- Examples: Show state object flow through all 4 skills
- Backward compatibility: How fallback path (monolithic) handles state

### Step 3: Update Agent Invocations

Modify `agents/pwrl-planner.agent.md`:
- Phase 1 invocation stays as `/pwrl-plan-scope [input]` (takes user input)
- Phase 2 invocation: `/pwrl-plan-research` (skill auto-detects latest scope file)
- Phase 3 invocation: `/pwrl-plan-design` (skill auto-detects latest scope + research files)
- Phase 4 invocation: `/pwrl-plan-generate` (skill auto-detects latest scope + research + design files)
- Add comment to each phase: "Scoped context auto-detected from `docs/plans/.scope/`" etc.

### Step 4: Update Skill Argument Hints

Modify each skill's SKILL.md frontmatter:
- `pwrl-plan-research/SKILL.md`: argument-hint: "[or leave blank to auto-detect latest scope]"
- `pwrl-plan-design/SKILL.md`: argument-hint: "[or leave blank to auto-detect latest scope/research]"
- `pwrl-plan-generate/SKILL.md`: argument-hint: "[or leave blank to auto-detect latest scope/research/design]"

## Edge Cases

1. **Multiple scopes for same session** — If user plans multiple things in parallel, which scope does research skill use?
   - Answer: Most recent by timestamp or session ID
   - Mitigation: Document session management or add session ID tracking

2. **State file missing** — Research skill can't find scope file
   - Answer: Skill re-prompts user to run scope first
   - Document this as fallback behavior

3. **Stale state** — User ran scope, then decided to re-run from scratch
   - Answer: User re-runs /pwrl-plan which starts fresh
   - State files from prior run are left in place (can be archived manually)

## Testing

- [ ] Create state file in `docs/plans/.scope/` manually
- [ ] Call `/pwrl-plan-research` and verify it auto-detects the scope file
- [ ] Verify research findings saved to `docs/plans/.research/`
- [ ] Trace state flow through all 4 skills end-to-end

## Acceptance Criteria

✅ State passing protocol document exists with storage paths and discovery logic  
✅ Agent Phase 2-4 show actual invocations with state auto-detection comments  
✅ All skill argument-hints updated to reflect auto-detection  
✅ Examples in protocol document show state flowing through all 4 skills  
✅ Edge cases documented with mitigation strategies  

## References

- Agent state management: agents/pwrl-planner.agent.md (state object structure)
- Skill state expectations: pwrl-plan-scope/SKILL.md → pwrl-plan-research/SKILL.md
