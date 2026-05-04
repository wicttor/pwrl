# PWRL

**Plan. Work. Review. Learn.** — A disciplined agentic development framework.

Stop vibing, start shipping. PWRL turns chaotic AI-assisted coding into predictable, high-quality software delivery.

---

## Quick Start

```bash
# Install
npm install -g @wicttor/pwrl

# Initialize in your project (interactive setup)
pwrl init

# Skills will be copied to .agents/skills/ (or your custom location)
# Configuration saved in .pwrlrc.json

# Use in your AI assistant
/pwrl-plan
/pwrl-work
/pwrl-review
/pwrl-learnings
/pwrl-end-session
```

**Result:** Complete, tested, documented feature with clean commit.

---

## Why PWRL?

| Vibe Coding 😵‍💫             | PWRL ✅                      |
| -------------------------- | ---------------------------- |
| Incomplete implementations | Complete features with tests |
| Hidden technical debt      | Systematic execution         |
| Lost context               | Persistent knowledge capture |
| Scope creep                | Clear boundaries & plans     |

---

## Core Skills

| Skill                         | Purpose                     | When to Use                |
| ----------------------------- | --------------------------- | -------------------------- |
| **`/pwrl-plan`**              | Create implementation plans | Before non-trivial work    |
| **`/pwrl-work`**              | Execute with quality gates  | Implement features/fixes   |
| **`/pwrl-review`**            | Code quality checks         | Before PRs, after features |
| **`/pwrl-learnings`**         | Document solutions          | After solving problems     |
| **`/pwrl-refresh-learnings`** | Maintain knowledge          | After refactors, quarterly |
| **`/pwrl-end-session`**       | Clean commits               | End of every session       |

---

## Workflow

```
Problem → Plan → Work → Review → Learn → Commit
   ↓       ↓      ↓       ↓        ↓        ↓
  Goal   Docs   Tests  Quality  Docs/    Clean
        Plans   Pass   Gates   Learnings Git
```

---

## Configuration

After running `pwrl init`, your project settings are stored in `.pwrlrc.json`:

- **Skills location**: Where PWRL skills are installed (default: `.agents/skills/`)
- **GitHub Issues integration**: Enable automatic task tracking with GitHub Issues

You can reconfigure at any time by running `pwrl init` again or editing `.pwrlrc.json` manually.

---

## Documentation

- **[INSTALLATION.md](INSTALLATION.md)** — Setup for GitHub Copilot, Claude, Cursor, Gemini, Pi Agent
- **[QUICKSTART.md](QUICKSTART.md)** — Example workflows and common tasks
- **[GUIDE.md](GUIDE.md)** — Best practices, anti-patterns, philosophy
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute new skills

### For Contributors

- **[pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md)** — Canonical standardized format for pwrl-\* skills
- **[pwrl-standards/TEMPLATE.md](pwrl-standards/TEMPLATE.md)** — Unified skill template with examples
- **[pwrl-standards/AUDIT.md](pwrl-standards/AUDIT.md)** — Standardization audit and migration analysis

---

## Example: Feature Development

```bash
# 1. Plan
/pwrl-plan Add JWT authentication with refresh tokens

# Agent creates plan in docs/plans/ with:
# - Technical decisions (JWT vs sessions, with rationale)
# - Implementation units (U1: models, U2: middleware, U3: endpoints, etc.)
# - Test scenarios (happy path + edge cases)
# - Risk analysis

# 2. Work
/pwrl-work

# Agent executes plan:
# - Creates tests first
# - Implements each unit
# - Verifies tests pass
# - Reviews code quality

# 3. Review
/pwrl-review

# Agent checks:
# - Correctness (logic, edge cases, error handling)
# - Security (auth, validation, injection risks)
# - Maintainability (clarity, complexity, patterns)
# - Testing (coverage, assertions, edge cases)

# 4. Learn
/pwrl-learnings

# Agent documents in docs/learnings/:
# - JWT token refresh pattern learned
# - Auth middleware gotcha avoided
# - Test strategy for async auth flows

# 5. Commit
/pwrl-end-session

# Agent creates clean commit:
# feat: Add JWT authentication system
#
# Implemented user authentication using JWT with refresh flow.
# Includes middleware for protected routes and comprehensive tests.
#
# Key decisions:
# - JWT over sessions for stateless API
# - 15min access token, 7d refresh token
#
# Skills: pwrl-plan, pwrl-work, pwrl-review, pwrl-learnings
# [AGENT: GitHub Copilot]
```

**Time saved vs vibe coding:** ~50%
**Quality improvement:** Measurable

---

## Installation

```bash
# Global (recommended)
npm install -g @wicttor/pwrl
pwrl init

# Per-project
cd your-project
npm install --save-dev @wicttor/pwrl
npx @wicttor/pwrl init
# This will copy bundled skills into .agents/skills/ in your project
```

See [INSTALLATION.md](INSTALLATION.md) for platform-specific setup.

---

## CLI Commands

```bash
pwrl init      # Initialize PWRL in project
pwrl info      # Show skill locations
pwrl docs      # Show documentation paths
pwrl help      # Show CLI help
pwrl version   # Show version
```

**Note:** Skills are invoked through your AI assistant (`/pwrl-plan`, etc.), not via CLI.

---

## Platform Support

Works with any AI assistant that supports custom instructions or skills:

- ✅ **GitHub Copilot** (VS Code)
- ✅ **Claude** (Desktop/Web/Projects)
- ✅ **Cursor**
- ✅ **Gemini** (Google AI Studio)
- ✅ **Pi Agent**
- ✅ **Custom setups**

---

## Project Structure

After initialization:

```
your-project/
  docs/
    plans/                    # Implementation plans
      2026-04-30-001-auth.md
    learnings/                # Knowledge base
      technical-fix/
      pattern/
      workflow/
      gotcha/
      concept/
      decision/
```

---

## Philosophy

1. **Plan First** — Explore approaches before coding
2. **Document Fresh** — Capture solutions while context is hot
3. **Ship Complete** — Tests, edge cases, quality gates
4. **Agent-Agnostic** — Skills work across any AI framework (LangChain, AutoGen, etc.)

Read [GUIDE.md](GUIDE.md) for the full philosophy and best practices.

### Skill Design

PWRL skills follow a standardized format:

- **Concise main files** (100-150 lines) for scannability
- **Support files** in `references/`, `assets/`, `examples/` for detailed content
- **Agent-agnostic language** for cross-framework compatibility
- **Consistent tone** (imperative mood, active voice) for clear execution

See [pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md) for the complete specification.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Creating new skills
- Improving workflows
- Documentation
- Examples

---

## License

MIT

---

**PWRL** — Because shipping quality code with AI should be systematic, not chaotic.

[GitHub](https://github.com/wicttor/pwrl) · [Issues](https://github.com/wicttor/pwrl/issues) · [Docs](INSTALLATION.md)
