# Installation

PWRL skills work with any AI assistant that supports custom instructions or skill files. Skills are **agent-agnostic**, using generic language compatible across frameworks (LangChain, AutoGen, custom orchestrators, etc.).

## What You Get

PWRL provides standardized workflow skills:

- **Main workflows** in `SKILL.md` files (100-150 lines each)
- **Detailed guidance** in `references/` subdirectories
- **Support files** like templates, schemas, and examples
- **Consistent format** across all skills for easy learning

## NPM Installation (Recommended)

```bash
npm install -g @wicttor/pwrl
```

This installs PWRL skills globally and makes them available to your AI assistant.

## Platform-Specific Setup

### GitHub Copilot (VS Code)

**Option 1: Global (via NPM)**

```bash
npm install -g @wicttor/pwrl
```

Skills are automatically discovered by GitHub Copilot.

**Option 2: Per-Project**

```bash
cd your-project
npm install --save-dev @wicttor/pwrl
# or clone directly
git clone https://github.com/wicttor/pwrl.git .pwrl
# Then run: npx @wicttor/pwrl init  # copies bundled skills into .agents/skills/
```

Invoke skills with `/pwrl-plan`, `/pwrl-work`, etc.

---

### Claude (Desktop/Web)

**Projects (Recommended):**

1. Create a Claude Project for your codebase
2. Add PWRL skill folders as project knowledge:
   - If installed via NPM: `~/.npm/@wicttor/pwrl/` or `node_modules/@wicttor/pwrl/`
   - Or download skills from GitHub
3. Reference skills with `/pwrl-plan`, `/pwrl-work`, etc.

**Manual:**

1. Copy skill content from `SKILL.md` files
2. Paste into conversation or project instructions
3. Use natural language prompts aligned with skill workflows

---

### Cursor

**Option 1: Global**

```bash
npm install -g @wicttor/pwrl
```

**Option 2: Workspace**

```bash
cd your-project
npm install --save-dev @wicttor/pwrl
```

Reference skills in `.cursorrules` or project settings.
Invoke with `/pwrl-plan`, `/pwrl-work`, etc.

---

### Gemini (Google AI Studio)

**Via NPM:**

```bash
npm install -g @wicttor/pwrl
# Skills available at: ~/.npm/@wicttor/pwrl/ or /usr/local/lib/node_modules/@wicttor/pwrl/
```

1. Upload skill documents from installation directory as system instructions
2. Or reference skill workflows in conversation context
3. Use natural prompts matching skill patterns

**Manual:**

1. Download skills from GitHub
2. Upload SKILL.md files to your project
3. Reference in prompts

---

### Pi Agent / Custom Setups

**Via NPM:**

```bash
npm install -g @wicttor/pwrl
```

**Manual Setup:**

1. Add SKILL.md content to agent instructions or context
2. Map skill workflows to your agent's command system
3. Adapt invocation patterns to your platform

---

## Verification

After installation, verify skills are accessible:

**GitHub Copilot:**

- Type `/pwrl` in chat and autocomplete should suggest available skills

**Claude:**

- Ask "What PWRL skills are available?"

**Cursor:**

- Type `/pwrl` to see available skills

**Others:**

- Reference skill documents in your AI assistant's context

---

## Directory Structure

PWRL expects (and creates) this structure in your project:

```
docs/
  learnings/
    technical-fix/
    pattern/
    workflow/
    gotcha/
    concept/
    decision/
  plans/
```

PWRL skills themselves are organized as:

```
pwrl-skillname/
  SKILL.md              # Main workflow (100-150 lines)
  references/           # Detailed guidance (optional)
    methodology.md
    templates.md
  assets/              # Static resources (optional)
  examples/            # Sample outputs (optional)
```

Each skill's `SKILL.md` contains the core workflow. For additional detail, check the skill's `references/` directory (e.g., `pwrl-review/references/severity-guide.md` for P0-P3 definitions).

---

## Skill Invocation

Skills are invoked through your AI assistant using natural language or skill names:

- `/pwrl-plan` or "Plan this feature using PWRL"
- `/pwrl-work` or "Execute this using PWRL work skill"
- `/pwrl-review` or "Review this code using PWRL"

The exact invocation syntax depends on your platform, but the workflows remain consistent.

---

## Support Files

Many skills include support files for detailed guidance:

- **pwrl-plan**: `references/plan-templates.md` — Full Fast/Standard/Deep templates
- **pwrl-learnings**: `references/schema.yaml`, `references/categories.md` — Learning format specs
- **pwrl-refresh-learnings**: `references/assessment-criteria.md` — Update procedures
- **pwrl-review**: `references/severity-guide.md`, `references/subagent-protocol.md` — Review methodology

These files provide deep detail without cluttering main workflows.

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
