---
unit-id: U3
plan: docs/plans/2026-06-10-002-fix-and-verify-pwrl-plan.md
status: to-do
dependencies: []
created: 2026-06-10
files:
  - pwrl-plan/references/agent-routing.md (modify)
  - pwrl-plan/references/agent-routing-implementation.md (new, if needed)
learnings: []
---

# U3: Specify Fallback Routing Implementation

## Goal

Document exact detection logic for agent availability: file paths, config keys, implementation steps, and fallback behavior.

## Context

The fallback routing concept is sound but lacks specifics. Skills/agent cannot be tested without knowing:
- Exact file path to check (relative to project root? user home?)
- Which environment variable or config file to check for "agents enabled"
- What happens if detection fails (immediate fallback or retry?)

## Implementation Steps

### Step 1: Define File Path to Check

Decide: where is the agent file located?
- Current assumption: `.agents/agents/pwrl-planner.agent.md`
- Verify: is this path relative to project root? Git workspace root? User home?
- Document the exact path convention

Recommended: `<project_root>/.agents/agents/pwrl-planner.agent.md`

### Step 2: Define Config Key for "Agents Enabled"

Decide: how does user enable/disable agent path?
- Option A: Environment variable `PI_AGENTS_ENABLED` (true/false)
- Option B: Config file `~/.pi/config.json` with `{ "agents": { "enabled": true } }`
- Option C: System setting in framework config

Recommended: Environment variable `PI_AGENTS_ENABLED` with default `true` if unset

### Step 3: Write Implementation Pseudocode

```
function route_to_agent_or_fallback(user_input):
  agent_file = "<project_root>/.agents/agents/pwrl-planner.agent.md"
  agents_enabled = env(PI_AGENTS_ENABLED) != "false"  # default: true
  
  if file_exists(agent_file) AND agents_enabled:
    log("ℹ️  Agents detected — delegating to pwrl-planner.agent.md")
    try:
      result = call_agent("/pwrl-planner", user_input)
      return result
    catch error:
      log("⚠️  Agent call failed:", error)
      log("ℹ️  Falling back to monolithic planning workflow")
      return run_monolithic_fallback(user_input)
  else:
    if not file_exists(agent_file):
      log("ℹ️  Agent file not found — running monolithic planning workflow")
    if not agents_enabled:
      log("ℹ️  Agents disabled (PI_AGENTS_ENABLED=false) — running monolithic planning workflow")
    return run_monolithic_fallback(user_input)
```

### Step 4: Update agent-routing.md

Modify `pwrl-plan/references/agent-routing.md` with:
1. Updated detection logic section with exact file paths and env vars
2. Implementation checklist:
   - [ ] Check if `<project_root>/.agents/agents/pwrl-planner.agent.md` exists
   - [ ] Check if `env PI_AGENTS_ENABLED != "false"`
   - [ ] If both true: try to invoke agent
   - [ ] If agent fails: log error and fall back to monolithic
   - [ ] If either condition false: run monolithic directly
3. Troubleshooting table:
   | Symptom | Cause | Fix |
   | --- | --- | --- |
   | Always runs fallback | Agent file missing | Create `.agents/agents/pwrl-planner.agent.md` |
   | Always runs fallback | Agents disabled | Set `export PI_AGENTS_ENABLED=true` |
   | Agent fails; fallback runs | Agent has errors | Check `.agents/agents/pwrl-planner.agent.md` syntax |

### Step 5: Create Implementation Details Document (if needed)

If implementation requires more detail than fits in agent-routing.md, create:
`pwrl-plan/references/agent-routing-implementation.md` with:
- Code-level implementation (pseudocode or actual code stub)
- Testing strategy for detection logic
- Debug output format for troubleshooting

## Edge Cases

1. **Agent file exists but is corrupted/unparseable**
   - Catch parse error, log, fall back to monolithic
2. **Agent invocation hangs**
   - Add timeout (e.g., 30 seconds), then fall back
3. **User sets `PI_AGENTS_ENABLED=false` explicitly**
   - Respect user preference; run monolithic

## Testing

- [ ] Create test scenarios for each detection branch:
  - File exists + agents enabled → should call agent
  - File missing + agents enabled → should run monolithic
  - File exists + agents disabled → should run monolithic
  - File exists + agent fails → should fall back to monolithic

## Acceptance Criteria

✅ Agent routing documentation specifies exact file path (relative to project root)  
✅ Config key defined (`PI_AGENTS_ENABLED`) with default value  
✅ Implementation pseudocode clear and complete  
✅ Troubleshooting table covers all detection failure scenarios  
✅ Timeout and error handling specified  
✅ Detection logic testable and verifiable  

## References

- Current documentation: pwrl-plan/references/agent-routing.md
- Agent file: agents/pwrl-planner.agent.md
