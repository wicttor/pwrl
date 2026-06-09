# Installation

PWRL skills work with any AI assistant that supports custom instructions or skill files. Skills are **agent-agnostic**, using generic language compatible across frameworks (LangChain, AutoGen, custom orchestrators, etc.).

## Quick Start

```bash
# Install globally
npm install -g @wicttor/pwrl

# Initialize in your project (interactive)
cd your-project
pwrl init
```

During initialization, you'll be asked:

1. **Skills folder location** — Default: `.agents/skills/` (or specify custom path)
2. **GitHub Issues integration** — Enable task tracking with GitHub Issues

Configuration is saved in `.pwrlrc.json`.

## What You Get

PWRL provides standardized workflow skills:

- **Main workflows** in `SKILL.md` files (100-150 lines each)
- **Detailed guidance** in `references/` subdirectories
- **Support files** like templates, schemas, and examples
- **Consistent format** across all skills for easy learning

## Directory Structure

After running `pwrl init`, your project will have:

```
.agents/
  skills/               # PWRL skills (or your custom location)
    pwrl-plan/
      SKILL.md
      references/
    pwrl-work/
      SKILL.md
      references/
    pwrl-review/
      SKILL.md
      references/
    ... (other skills)
  agents/               # PWRL agents (orchestrators)
    pwrl-planner.agent.md
    personas/

docs/
  learnings/            # Categorized knowledge capture
    technical-fix/
    pattern/
    workflow/
    gotcha/
    concept/
    decision/
  plans/                # Implementation plans
  tasks/                # Task files
    to-do/
    in-progress/
    for-review/
    done/

.pwrlrc.json            # PWRL configuration
```

## Platform Setup

### GitHub Copilot (VS Code)

**Skills Setup:**
Skills in `.agents/skills/` are automatically discovered by GitHub Copilot.

**Agent Setup (Optional but Recommended):**
Agents in `.agents/agents/` enable advanced workflows:
1. In VS Code, enable "GitHub Copilot: Agents" in settings or experiments
2. Agents in your workspace will be auto-discovered
3. The PWRL Planner Agent will orchestrate `/pwrl-plan` using micro-skills

Invoke with: `/pwrl-plan`, `/pwrl-work`, `/pwrl-review`, etc.

**Agent-Enhanced Planning:**
When agents are enabled, `/pwrl-plan` automatically delegates to the PWRL Planner Agent, which orchestrates:
- `pwrl-plan-scope` → `pwrl-plan-research` → `pwrl-plan-design` → `pwrl-plan-generate`

### Claude (Desktop/Web)

1. Create a Claude Project for your codebase
2. Add `.agents/skills/` folder as project knowledge
3. **Agent Support:** Claude Projects support custom agents via `.instructions.md` files (see Agent Setup section below)
4. Invoke with: `/pwrl-plan`, `/pwrl-work`, etc.

### Cursor

**Skills Setup:**
Skills in `.agents/skills/` are automatically discovered by Cursor.

**Agent Setup (Recommended):**
Cursor supports agents through its integrated AI:
1. Skills in `.agents/skills/` include agent routing directives
2. When agents are enabled, complex workflows auto-delegate to micro-skills
3. See Agent Setup section below for details

Invoke with: `/pwrl-plan`, `/pwrl-work`, etc.

### Other AI Assistants (LangChain, AutoGen, Custom)

1. Reference skill files from `.agents/skills/` in your assistant's context
2. Use natural language prompts aligned with skill workflows
3. **For Agent Support:** Check if your framework supports agents:
   - Provide agent files from `.agents/agents/` to your agent runtime
   - Follow the agent routing logic in `pwrl-plan/references/agent-routing.md`

## Agent Setup

PWRL includes pre-built agents for advanced orchestration. Agents are **optional** — all PWRL workflows have fallback implementations.

### What Agents Do

Agents orchestrate complex workflows by calling multiple skills in sequence with intelligent handoffs:

- **PWRL Planner Agent** (`.agents/agents/pwrl-planner.agent.md`)
  - Orchestrates planning workflow: scope → research → design → generate
  - Collects user feedback at each phase
  - Manages state between micro-skills
  - Produces final plan file at `docs/plans/`

- **PWRL Work Agent** (`.agents/agents/pwrl-work.agent.md`)
  - Orchestrates execution workflow: triage → prepare → execute → review → ship
  - Collects user feedback at each phase
  - Manages state between micro-skills
  - Supports inline, serial, and parallel execution modes
  - Produces committed code with optional GitHub Issues updates

### Enabling Agents

**GitHub Copilot (VS Code):**
1. Install/update GitHub Copilot extension (latest version)
2. Go to VS Code Settings → Extensions → GitHub Copilot
3. Look for "Agents" or "Agentic Features" — enable if available
4. Restart VS Code
5. Test: Run `/pwrl-plan [task]` — should see "Agents detected" in output

**Cursor:**
1. Ensure Cursor AI is enabled
2. Cursor automatically discovers agents in `.agents/agents/`
3. Test: Run `/pwrl-plan [task]` — complex workflows will delegate to agents

**Claude (Desktop/Web):**
1. Create a Claude Project that includes `.agents/agents/` folder
2. Agents will be available to the Claude model in that project
3. Test: Invoke `/pwrl-plan` and Claude will route to agents if available

**Custom Frameworks:**
- Provide agent files to your agent runtime
- Enable agent execution in your orchestrator config
- See `pwrl-plan/references/agent-routing.md` for detection logic

### Troubleshooting Agent Setup

| Issue                     | Cause                          | Fix                                                     |
| ------------------------- | ------------------------------ | ------------------------------------------------------- |
| "Agents not available"    | Agents disabled in platform    | Enable agents in platform settings                      |
| Plan uses fallback        | Agent file not found           | Verify `.agents/agents/pwrl-planner.agent.md` exists   |
| Agent fails silently      | Agent syntax error             | Check agent file formatting in YAML frontmatter        |
| No agent discovered       | Skills/agents not in context   | Ensure `.agents/` is in project root and discoverable  |
| Micro-skill not called    | Missing micro-skill file       | Verify all `pwrl-plan-*` skills exist in `.agents/skills/` |

### Disabling Agents

To run PWRL in monolithic mode (no agents):

1. **GitHub Copilot:** Disable "Agents" in VS Code settings
2. **Cursor:** Remove `.agents/agents/` folder or move agents elsewhere
3. **Claude:** Remove `.agents/agents/` from Claude Project knowledge
4. **Custom:** Disable agent runtime in orchestrator config

All workflows will automatically fall back to inline execution — no code changes needed.

## Verification

After installation, verify skills and agents are accessible:

**Skills:**
- Type `/pwrl` in your AI assistant and autocomplete should suggest available skills
- Or ask "What PWRL skills are available?"

**Agents (Optional):**
- If agents are enabled in your platform, run `/pwrl-plan [test task]`
- Look for output like "Agents detected — delegating to planner agent" or similar
- Without agents, PWRL still works using fallback workflows
- See "Agent Setup" section above for enabling agents

## Skill Invocation

Skills are invoked through your AI assistant using natural language or skill names:

- `/pwrl-plan` or "Plan this feature using PWRL"
- `/pwrl-work` or "Execute this using PWRL work skill"
- `/pwrl-review` or "Review this code using PWRL"

The exact invocation syntax depends on your platform, but the workflows remain consistent.

## Support Files

Many skills include support files for detailed guidance:

- **pwrl-plan**: `references/plan-templates.md` — Full Fast/Standard/Deep templates
- **pwrl-learnings**: `references/schema.yaml`, `references/categories.md` — Learning format specs
- **pwrl-refresh-learnings**: `references/assessment-criteria.md` — Update procedures
- **pwrl-review**: `references/severity-guide.md`, `references/subagent-protocol.md` — Review methodology

These files provide deep detail without cluttering main workflows.

## Configuration

After initialization, `.pwrlrc.json` stores your project settings:

```json
{
  "version": "1.0",
  "skillsPath": ".agents/skills",
  "integrations": {
    "githubIssues": false
  },
  "created": "2026-05-04T..."
}
```

You can manually edit this file or re-run `pwrl init` to reconfigure.

---

## For Contributors

If you want to create or improve skills:

1. See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
2. Review [pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md) for standardized format
3. Use [pwrl-standards/TEMPLATE.md](pwrl-standards/TEMPLATE.md) as starting template

---

## Updating

```bash
npm update -g @wicttor/pwrl
```

---

## Uninstalling

```bash
npm uninstall -g @wicttor/pwrl
```

---

> **Note**: PWRL is tool-agnostic. The skills define workflows and principles that work across any AI assistant with sufficient context window and tool access. The NPM package provides CLI utilities (`pwrl init`, `pwrl info`) and makes skills discoverable, but skills themselves are framework-agnostic markdown files following a standardized format (see [pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md)).
