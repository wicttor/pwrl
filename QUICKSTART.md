# Quick Start Guide

Get started with PWRL workflows for common development tasks.

**Note:** All PWRL skills follow a standardized format (100-150 line main files) with detailed guidance in `references/` subdirectories. Skills are agent-agnostic and work across any AI framework.

## Installation and Setup

```bash
# Install globally
npm install -g @wicttor/pwrl

# Initialize in your project (interactive)
cd your-project
pwrl init

# Follow prompts to configure:
# - Skills folder location (default: .agents/skills/)
# - GitHub Issues integration (optional)
```

## Core Workflow

**Standard Workflow:**

```
Problem → /pwrl-plan → /pwrl-work → /pwrl-review → /pwrl-learnings → /pwrl-end-session
```

- `/pwrl-plan` orchestrates 4 phases: scope → research → design → generate
- `/pwrl-work` orchestrates 5 phases: triage → prepare → execute → review → finalize
- `/pwrl-review` does explicit code review and moves tasks based on verdict

**Task-Based Workflow (Complex/Team):**

```
Problem → /pwrl-plan → /pwrl-tasks → /pwrl-work [task] → /pwrl-review → repeat → /pwrl-learnings → /pwrl-end-session
```

Each `/pwrl-work [task]` invocation runs the 5-phase orchestration (triage → prepare → execute → review → finalize) with interaction mode selection at Phase 0.

**Task Status:** `to-do` → `in-progress` → `for-review` → `done` (after /pwrl-review approves)

**Interaction Modes (for /pwrl-work):**

- **Detailed (Step-by-Step):** Review and confirm at each phase
- **Yolo (Full Automation):** Automated through Phase 3, final confirmation at Phase 4

---

## Implementing a New Feature

### Simple Feature (Direct)

```bash
# 1. Plan the work
/pwrl-plan Add user profile editing with validation
# Creates docs/plans/YYYY-MM-DD-NNN-add-user-profile-editing.md

# 2. Execute the plan
/pwrl-work
# Work completed on feature branch, status updated

# 3. Document any insights
/pwrl-learnings

# 4. Clean commit
/pwrl-end-session
```

**What happens:**

- **Plan** creates structured implementation plan in `docs/plans/`
  - Orchestrates 4 phases: scope → research → design → generate
- **Work** runs 5 orchestrated phases with test-first discipline (triage → prepare → execute → review → finalize) on a feature branch
- **Review** checks correctness, security, quality; approves or requests changes
  - This is the dedicated `/pwrl-review` step (Phase 3 of `/pwrl-work` runs an internal review, but `/pwrl-review` is the explicit main-flow review)
- **Learnings** documents solutions while context is fresh
- **End-session** creates clean commit with learnings captured

### Complex Feature (Task-Based)

```bash
# 1. Plan
/pwrl-plan Add user profile editing with validation

# 2. Break into tasks (optional)
/pwrl-tasks docs/plans/2026-05-04-user-profile-editing.md
# Creates task files:
# - docs/tasks/to-do/2026-05-04-u1-profile-model.md
# - docs/tasks/to-do/2026-05-04-u2-edit-endpoint.md
# - docs/tasks/to-do/2026-05-04-u3-validation-logic.md
# - docs/tasks/to-do/2026-05-04-u4-ui-components.md

# 3. Work on first task
/pwrl-work docs/tasks/to-do/2026-05-04-u1-profile-model.md
# Status: to-do → in-progress → for-review
# Task auto-moves through folders at Prepare and Execute phases

# 4. Review first task
/pwrl-review
# If approved (no issues found): for-review/ → done/
# If changes needed: Return task to in-progress/ and re-run /pwrl-work

# 5. Continue with remaining tasks
/pwrl-work docs/tasks/to-do/2026-05-04-u2-edit-endpoint.md
/pwrl-review
# Each approved task moves to done/
# Repeat for U3, U4...

# 6. Create pull request
# When all tasks are in done/ (approved by review):
git push origin feature-branch
# Create PR via GitHub or `gh pr create`

# 7. Document and commit
/pwrl-learnings
/pwrl-end-session
```

**Benefits of task-based approach:**

- Break complex work into reviewable units
- Enable parallel work across team members
- Track progress with GitHub Issues (if enabled)
- Clear dependencies and completion criteria

---

## Fixing a Bug

```bash
# 1. Quick plan or dive straight to work
/pwrl-work Fix null reference error in user controller
# Status: Inline task created, completed, in for-review/

# 2. Review the fix
/pwrl-review
# If approved (no issues): for-review/ → done/

# 3. Document the bug and solution
/pwrl-learnings

# 4. Create PR and commit
git push origin feature-branch
# Create PR via GitHub or `gh pr create`

/pwrl-end-session Bug fix for null reference
```

**For trivial fixes**, skip planning and go straight to work. The review step still validates quality before creating a PR.

---

## Refactoring Code

```bash
# 1. Plan the refactor (recommended for non-trivial changes)
/pwrl-plan Refactor authentication service to use dependency injection

# 2. Optional: Break into tasks for large refactors
/pwrl-tasks  # Creates incremental refactoring tasks

# 3. Execute with tests
/pwrl-work [task-file-if-using-tasks]
# Status: to-do → in-progress → for-review

# 4. Verify no regressions
/pwrl-review
# Approves: Ready for PR creation

# 5. Document patterns learned
/pwrl-learnings

# 6. Commit
/pwrl-end-session
```

**For large refactors**, use task-based workflow to break into safe, reviewable increments.

---

## Adding Tests

```bash
# 1. Plan test strategy
/pwrl-plan Add integration tests for payment flow

# 2. Optional: Break into test suites
/pwrl-tasks  # Creates separate tasks for different test scenarios

# 3. Implement tests
/pwrl-work [task-file-if-using-tasks]
# Status: to-do → in-progress → for-review

# 4. Review and approve
/pwrl-review
# If approved: for-review → done

# 4. Review coverage and assertions
/pwrl-review
# Approves: Ready for PR creation

# 5. Create pull request and commit
git push origin feature-branch
# Create PR via GitHub or `gh pr create`

/pwrl-learnings
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

Choose the right planning depth based on scope and risk. Planning runs through a 4-phase workflow:

1. **Scope** — Gather context and requirements
2. **Research** — Discover patterns and inform decisions
3. **Design** — Decompose work into implementation units
4. **Generate** — Select tier and render final plan

Each phase collects user input before proceeding to the next.

### Fast Tier (1-3 files, LOW risk)

```bash
/pwrl-plan Add loading spinner to submit button
```

**Use when:**

- 1-3 files affected
- Clear, straightforward approach
- Low risk (no security, performance, or stability concerns)
- No unknowns

**Typical timeline:** 5-15 minutes

### Standard Tier (4-8 files, MEDIUM risk)

```bash
/pwrl-plan Implement user authentication with JWT
```

**Use when:**

- 4-8 files affected
- Technical decisions required
- Moderate complexity with some unknowns
- Medium risk (affects multiple features but contained impact)

**Typical timeline:** 30-45 minutes

### Deep Tier (9+ files, HIGH risk)

```bash
/pwrl-plan Migrate database from MongoDB to PostgreSQL
```

**Use when:**

- 9+ files affected
- Architecture changes
- Migrations or cross-cutting concerns
- High risk (affects core systems, security, or user data)
- Significant unknowns or experimental approaches

**Typical timeline:** 1-2 hours

**Tier Selection:** See [pwrl-plan/references/planning-tiers.md](pwrl-plan/references/planning-tiers.md) for decision heuristic and detailed tier guidelines.

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
# Work completes, moves to for-review
/pwrl-review
# Quick approval: for-review → done
```

## When to Use Tasks

✅ **Use `/pwrl-tasks` for:**

- Complex features with multiple implementation units
- Team collaboration (parallel work on different tasks)
- GitHub Issues integration for tracking
- Breaking risky changes into safe increments
- Clear progress visibility across large efforts

❌ **Skip `/pwrl-tasks` for:**

- Simple features (1-3 files)
- Solo work on straightforward implementations
- Quick fixes and trivial changes
- When you prefer inline task management

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

### pwrl-plan (Main Planning Orchestrator)

- **Main workflow** ([SKILL.md](pwrl-plan/SKILL.md)): Planning entry point, routes to agent or monolithic fallback
- **Planning tiers** ([references/planning-tiers.md](pwrl-plan/references/planning-tiers.md)): Tier selection heuristic, detailed tier descriptions, decision tree
- **Plan templates** ([references/plan-templates.md](pwrl-plan/references/plan-templates.md)): Fast/Standard/Deep plan templates with real-world examples
- **Agent routing** ([references/agent-routing.md](pwrl-plan/references/agent-routing.md)): Agent detection logic, enabling agent-enhanced path, troubleshooting
- **Fallback workflow** ([references/fallback-workflow.md](pwrl-plan/references/fallback-workflow.md)): Complete 4-phase monolithic workflow (backup when agents unavailable)

### pwrl-plan Micro-Skills (Phase-Specific)

When `/pwrl-plan` routes through the agent, it calls these micro-skills automatically:

- **pwrl-plan-scope** ([SKILL.md](pwrl-plan-scope/SKILL.md)): Phase 1 — Gather context and scope requirements
- **pwrl-plan-research** ([SKILL.md](pwrl-plan-research/SKILL.md)): Phase 2 — Research patterns and high-risk areas
- **pwrl-plan-design** ([SKILL.md](pwrl-plan-design/SKILL.md)): Phase 3 — Design decomposition and implementation units
- **pwrl-plan-generate** ([SKILL.md](pwrl-plan-generate/SKILL.md)): Phase 4 — Generate final plan from templates

**Note:** You don't call micro-skills directly. They're invoked automatically by `/pwrl-plan` through the agent orchestrator or fallback workflow.

### pwrl-learnings

- **Main workflow** ([SKILL.md](pwrl-learnings/SKILL.md)): 135 lines covering 9-phase documentation process
- **Schema** ([references/schema.yaml](pwrl-learnings/references/schema.yaml)): Frontmatter field definitions
- **Categories** ([references/categories.md](pwrl-learnings/references/categories.md)): When to use each category (pattern, technical-fix, gotcha, decision, gotcha, workflow)

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
