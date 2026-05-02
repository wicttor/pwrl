# Quick Start Guide

Get started with PWRL workflows for common development tasks.

**Note:** All PWRL skills follow a standardized format (100-150 line main files) with detailed guidance in `references/` subdirectories. Skills are agent-agnostic and work across any AI framework.

## Core Workflow

```
Problem → /pwrl-plan → /pwrl-work → /pwrl-review → /pwrl-learnings → /pwrl-end-session
```

---

## Implementing a New Feature

```bash
# 1. Plan the work
/pwrl-plan Add user profile editing with validation

# 2. Execute the plan
/pwrl-work

# 3. Review before committing
/pwrl-review

# 4. Document any insights
/pwrl-learnings

# 5. Clean commit
/pwrl-end-session
```

**What happens:**

- **Plan** creates structured implementation plan in `docs/plans/`
- **Work** executes with test-first discipline
- **Review** checks correctness, security, quality
- **Learnings** documents solutions while context is fresh
- **End-session** creates clean commit with context

---

## Fixing a Bug

```bash
# 1. Quick plan or dive straight to work
/pwrl-work Fix null reference error in user controller

# 2. Review the fix
/pwrl-review

# 3. Document the bug and solution
/pwrl-learnings

# 4. Commit
/pwrl-end-session Bug fix for null reference
```

**For trivial fixes**, skip planning and go straight to work.

---

## Refactoring Code

```bash
# 1. Plan the refactor (recommended for non-trivial changes)
/pwrl-plan Refactor authentication service to use dependency injection

# 2. Execute with tests
/pwrl-work

# 3. Verify no regressions
/pwrl-review

# 4. Document patterns learned
/pwrl-learnings

# 5. Commit
/pwrl-end-session
```

---

## Adding Tests

```bash
# 1. Plan test strategy
/pwrl-plan Add integration tests for payment flow

# 2. Implement tests
/pwrl-work

# 3. Review coverage and assertions
/pwrl-review

# 4. Commit
/pwrl-end-session
```

---

## Maintaining Knowledge

```bash
# After major refactor or migration
/pwrl-refresh-learnings authentication

# Review by category
/pwrl-refresh-learnings technical-fix

# Quarterly maintenance
/pwrl-refresh-learnings 2026-Q1

# Review specific file
/pwrl-refresh-learnings file:async-race-condition-2026-04-30.md
```

**When to refresh:**

- After refactors or migrations
- New learning contradicts older ones
- Found duplicates or outdated content
- Quarterly maintenance cycles

---

## Planning Tiers

Choose the right planning depth:

### Fast (Small Tasks)

```bash
/pwrl-plan Add loading spinner to submit button
```

**Use for:**

- 1-3 files
- Clear approach
- Low risk

### Standard (Default)

```bash
/pwrl-plan Implement user authentication with JWT
```

**Use for:**

- Features with technical decisions
- Moderate complexity
- Some unknowns

### Deep (High-Risk)

```bash
/pwrl-plan Migrate database from MongoDB to PostgreSQL
```

**Use for:**

- Architecture changes
- Migrations
- Security-critical areas
- Cross-cutting concerns

---

## When to Skip Planning

✅ **Skip planning for:**

- Typos and formatting
- Single-line changes
- Following existing clear patterns
- Obvious implementation paths

**Go straight to:**

```bash
/pwrl-work Fix typo in error message
```

---

## Workflow Variations

### Test-First Development

```bash
# 1. Plan with test scenarios
/pwrl-plan Add email validation with edge cases

# 2. Work implements tests first
/pwrl-work

# 3. Review test quality
/pwrl-review

# 4. Document patterns
/pwrl-learnings

# 5. Commit
/pwrl-end-session
```

### Spike/Exploration

```bash
# 1. Plan exploration
/pwrl-plan depth:fast Investigate GraphQL vs REST for new API

# 2. Execute exploration (time-boxed)
/pwrl-work

# 3. Document findings as decision
/pwrl-learnings  # Category: decision

# 4. Commit spike results
/pwrl-end-session Spike: API approach investigation
```

### Bug Triage

```bash
# 1. Reproduce and document
/pwrl-work Reproduce and fix payment timeout issue

# 2. Verify fix works
/pwrl-review

# 3. Document for future reference
/pwrl-learnings  # Category: technical-fix

# 4. Commit
/pwrl-end-session
```

---

## Tips

### Starting Your First Session

1. Install PWRL (see [INSTALLATION.md](INSTALLATION.md))
2. Pick a task from your backlog
3. Start with `/pwrl-plan` if non-trivial
4. Follow the workflow through to `/pwrl-end-session`
5. Review the generated docs in `docs/plans/` and `docs/learnings/`

### Building the Habit

- **Always end sessions** with `/pwrl-end-session` for clean commits
- **Document while fresh** — run `/pwrl-learnings` immediately after solving
- **Review before PR** — run `/pwrl-review` before creating pull requests
- **Maintain knowledge** — run `/pwrl-refresh-learnings` monthly

### Common Patterns

**Feature → Test → Review → Learn → Commit**

```bash
/pwrl-plan → /pwrl-work → /pwrl-review → /pwrl-learnings → /pwrl-end-session
```

**Quick Fix → Learn → Commit**

```bash
/pwrl-work → /pwrl-learnings → /pwrl-end-session
```

**Maintenance → Commit**

```bash
/pwrl-refresh-learnings → /pwrl-end-session
```

---

## Example Session Output

After running through a full workflow:

```
docs/
  plans/
    2026-04-30-001-user-auth.md          ← Implementation plan
  learnings/
    technical-fix/
      jwt-token-refresh-2026-04-30.md    ← Problem solved
    pattern/
      auth-middleware-2026-04-30.md      ← Pattern learned
```

Plus a clean Git commit:

```
feat: Add JWT authentication system

Implemented user authentication using JWT tokens with refresh
flow. Includes middleware for protected routes and comprehensive
test coverage for all auth scenarios.

Key decisions:
- JWT over sessions for stateless API
- 15min access token, 7d refresh token
- Refresh rotation for security

Skills used: pwrl-plan, pwrl-work, pwrl-review, pwrl-learnings

[AGENT: GitHub Copilot]
```

---

## Understanding Skill Support Files

Many skills include detailed reference material in subdirectories:

### pwrl-plan

- **Main workflow** ([SKILL.md](pwrl-plan/SKILL.md)): 100 lines covering planning tiers and workflow
- **Detailed templates** ([references/plan-templates.md](pwrl-plan/references/plan-templates.md)): Full Fast/Standard/Deep plan templates with real-world examples

### pwrl-learnings

- **Main workflow** ([SKILL.md](pwrl-learnings/SKILL.md)): 135 lines covering 9-phase documentation process
- **Schema** ([references/schema.yaml](pwrl-learnings/references/schema.yaml)): Frontmatter field definitions
- **Categories** ([references/categories.md](pwrl-learnings/references/categories.md)): When to use each category

### pwrl-refresh-learnings

- **Main workflow** ([SKILL.md](pwrl-refresh-learnings/SKILL.md)): 184 lines covering refresh workflow
- **Assessment criteria** ([references/assessment-criteria.md](pwrl-refresh-learnings/references/assessment-criteria.md)): Detailed assessment methodology and update procedures

### pwrl-review

- **Main workflow** ([SKILL.md](pwrl-review/SKILL.md)): 142 lines covering review workflow and depth control
- **Severity guide** ([references/severity-guide.md](pwrl-review/references/severity-guide.md)): P0-P3 definitions with calibration examples
- **Subagent protocol** ([references/subagent-protocol.md](pwrl-review/references/subagent-protocol.md)): Parallel reviewer orchestration details

**Tip:** Start with the main `SKILL.md` file for any skill. Consult `references/` files when you need deep detail or examples.

---

## For Contributors

Want to create or improve skills? See:

- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md) — Standardized format specification
- [pwrl-standards/TEMPLATE.md](pwrl-standards/TEMPLATE.md) — Starting template with examples

---

## Next Steps

- Read [GUIDE.md](GUIDE.md) for best practices and anti-patterns
- Explore individual skill docs in skill folders
- See [CONTRIBUTING.md](CONTRIBUTING.md) to extend PWRL
