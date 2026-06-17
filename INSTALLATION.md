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
    done/               # Approved by /pwrl-review, ready for PR

.pwrlrc.json            # PWRL configuration
```

## Platform Setup

### GitHub Copilot (VS Code)

**Skills Setup:**
Skills in `.agents/skills/` are automatically discovered by GitHub Copilot.

Invoke with: `/pwrl-plan`, `/pwrl-work`, `/pwrl-review`, etc.

### Claude (Desktop/Web)

1. Create a Claude Project for your codebase
2. Add `.agents/skills/` folder as project knowledge
3. Invoke with: `/pwrl-plan`, `/pwrl-work`, etc.

### Cursor

Skills in `.agents/skills/` are automatically discovered by Cursor.

Invoke with: `/pwrl-plan`, `/pwrl-work`, etc.

### Other AI Assistants (LangChain, AutoGen, Custom)

1. Reference skill files from `.agents/skills/` in your assistant's context
2. Use natural language prompts aligned with skill workflows

## Verification

After installation, verify skills are accessible:

**Skills:**

- Type `/pwrl` in your AI assistant and autocomplete should suggest available skills
- Or ask "What PWRL skills are available?"

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
- **pwrl-review**: `references/severity-guide.md` — Review methodology

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
