# Installation

PWRL skills work with any AI assistant that supports custom instructions or skill files.

## NPM Installation (Recommended)

```bash
npm install -g pwrl
```

This installs PWRL skills globally and makes them available to your AI assistant.

## Platform-Specific Setup

### GitHub Copilot (VS Code)

**Option 1: Global (via NPM)**

```bash
npm install -g pwrl
```

Skills are automatically discovered by GitHub Copilot.

**Option 2: Per-Project**

```bash
cd your-project
npm install --save-dev pwrl
# or clone directly
git clone https://github.com/your-org/pwrl.git .pwrl
```

Invoke skills with `/pwrl-plan`, `/pwrl-work`, etc.

---

### Claude (Desktop/Web)

**Projects (Recommended):**

1. Create a Claude Project for your codebase
2. Add PWRL skill folders as project knowledge:
   - If installed via NPM: `~/.npm/pwrl/` or `node_modules/pwrl/`
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
npm install -g pwrl
```

**Option 2: Workspace**

```bash
cd your-project
npm install --save-dev pwrl
```

Reference skills in `.cursorrules` or project settings.
Invoke with `/pwrl-plan`, `/pwrl-work`, etc.

---

### Gemini (Google AI Studio)

**Via NPM:**

```bash
npm install -g pwrl
# Skills available at: ~/.npm/pwrl/ or /usr/local/lib/node_modules/pwrl/
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
npm install -g pwrl
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

This directory is created automatically when you first use a PWRL skill.

---

## Updating

```bash
npm update -g pwrl
```

---

## Uninstalling

```bash
npm uninstall -g pwrl
```

---

> **Note**: PWRL is tool-agnostic. The skills define workflows and principles that work across any AI assistant with sufficient context window and tool access.
