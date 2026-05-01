# PWRL

**Plan. Work. Review. Learn.** — A disciplined agentic development framework.

Stop vibing, start shipping. PWRL turns chaotic AI-assisted coding into predictable, high-quality software delivery.

---

## Quick Start

```bash
# Install
npm install -g pwrl

# Initialize in your project
pwrl init

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

## Documentation

- **[INSTALLATION.md](INSTALLATION.md)** — Setup for GitHub Copilot, Claude, Cursor, Gemini, Pi Agent
- **[QUICKSTART.md](QUICKSTART.md)** — Example workflows and common tasks
- **[GUIDE.md](GUIDE.md)** — Best practices, anti-patterns, philosophy
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute new skills

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
npm install -g pwrl
pwrl init

# Per-project
cd your-project
npm install --save-dev pwrl
npx pwrl init
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

Read [GUIDE.md](GUIDE.md) for the full philosophy and best practices.

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

[GitHub](https://github.com/your-org/pwrl) · [Issues](https://github.com/your-org/pwrl/issues) · [Docs](INSTALLATION.md)
