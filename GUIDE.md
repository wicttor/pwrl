# PWRL Guide

Best practices, anti-patterns, and philosophy for effective AI-assisted development.

---

## Skill Format and Standardization

PWRL skills follow a standardized format to ensure consistency, scannability, and compatibility across AI frameworks.

### Design Principles

**Agent-Agnostic:**

Skills use generic language that works across LangChain, AutoGen, custom orchestrators, and future frameworks:

- ✅ "platform's ask_user facility"
- ✅ "search the workspace"
- ❌ "call ask_user() function"
- ❌ "@workspace search"

**Balanced Verbosity:**

- Main `SKILL.md` files: 100-150 lines (acceptable: 80-170)
- Detailed content extracted to `references/`, `assets/`, `examples/`
- Keeps workflows scannable while preserving completeness

**Consistent Tone:**

- Imperative mood: "Do X" not "X should be done"
- Active voice: "Create the file" not "The file is created"
- Scannable structure: bullets, short paragraphs, numbered steps

**Support File Organization:**

```
pwrl-skillname/
  SKILL.md                  # Main workflow (100-150 lines)
  references/               # Detailed guidance, schemas, templates
    methodology.md
    examples.md
  assets/                   # Static resources, diagrams
    template.yml
  examples/                 # Sample outputs
    output-sample.md
```

### For Contributors

When creating or improving skills:

1. **Check [pwrl-standards/SCHEMA.md](pwrl-standards/SCHEMA.md)** for canonical format specification
2. **Use [pwrl-standards/TEMPLATE.md](pwrl-standards/TEMPLATE.md)** as starting template
3. **Follow validation checklist** in CONTRIBUTING.md:
   - YAML frontmatter with `name`, `description` fields
   - Line count within 80-170 range
   - Agent-agnostic language throughout
   - Support files for detailed content
   - Imperative mood and active voice
   - Repository-relative paths only

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete contribution guidelines.

---

## Using Support Files Effectively

PWRL skills separate scannable workflows from detailed guidance. When working with skills:

### Start with SKILL.md

Each skill's main file (e.g., `pwrl-plan/SKILL.md`) contains:

- Purpose and when to use the skill
- Core workflow steps
- Essential rules and criteria
- Links to support files for detail

**Read this first** to understand the workflow.

### Consult references/ for Detail

When you need deeper guidance:

- **pwrl-plan/references/plan-templates.md** — Full plan templates with real examples
- **pwrl-review/references/severity-guide.md** — Complete P0-P3 definitions with calibration
- **pwrl-refresh-learnings/references/assessment-criteria.md** — Detailed update procedures

**Use these when:**

- First time using a skill
- Need specific examples
- Customizing for your project
- Training team members

### Navigation Pattern

```
1. Read SKILL.md → Understand workflow
2. Execute workflow → Follow steps
3. Consult references/ as needed → Deep dives
```

---

## Work Execution with pwrl-work

The work execution workflow is orchestrated by agents when available, or runs in monolithic mode as a fallback. Understanding both modes helps you execute effectively.

### Execution Workflow (Five Phases)

When you call `/pwrl-work [task/plan/prompt]`, the workflow proceeds in five phases:

**Phase 1: Triage** (`pwrl-work-triage`)

- Classify work input (task file, plan, or bare prompt)
- Extract context and requirements
- Bootstrap implementation approach
- Set up initial work state

**Phase 2: Prepare** (`pwrl-work-prepare`)

- Set up execution environment
- Create subtask lists if needed
- Choose execution mode (inline, serial, parallel)
- Review environment readiness

**Phase 3: Execute** (`pwrl-work-execute`)

- Implement work according to selected mode
- Write tests first (TDD discipline)
- Build features incrementally
- Verify tests pass after each change

**Phase 4: Review** (`pwrl-work-review`)

- Simplify and consolidate code
- Check for duplication and clarity
- Verify edge cases handled
- Finalize code changes and prepare branch for pull request

The work execution workflow runs through these four phases:

**Triage** → **Prepare** → **Execute** → **Review**

Each phase has a user checkpoint for review and adjustment before proceeding.

### Execution with Agents

The work execution workflow can optionally use the agent-based orchestrator:

**Agent-Enhanced (Recommended):**

- `.agents/agents/pwrl-work.agent.md` orchestrates all four phases
- Clear phase boundaries with checkpoints
- Can iterate within each phase before moving forward
- Better user experience with staged feedback
- Supports parallel execution mode for concurrent subtasks

**Skill-Based (Direct):**

- Call `pwrl-work` or individual skills directly
- Same logic, direct invocation
- See `pwrl-work/SKILL.md` for complete Phase 0-3 logic and `pwrl-work/references/workflow-details.md` for execution modes and task status rules

### Execution Modes

During Phase 2 (Prepare), you select an execution mode for your work:

**Inline Mode:**
- Single focused task
- Implement directly without subtasks
- Best for small, straightforward work
- Fastest for 1-3 file changes

**Serial Mode:**
- Multiple subtasks executed one-by-one
- Dependencies handled automatically
- Best for linear workflows with clear order
- Default for complex work

**Parallel Mode (Agent-Enhanced Only):**
- Multiple independent subtasks run concurrently
- Requires agent orchestration
- Best for team collaboration or large features
- Each subtask has isolated context and execution
- Results consolidated in Phase 4 (Review)

### Best Practices for Work Execution

1. **Test-first always:** Work execution enforces test-first discipline. Write failing tests before implementation.
2. **Stay focused:** Stick to the task scope. Expand scope with new tasks, not mid-execution.
3. **Verify as you go:** Run tests after each meaningful change. Don't batch verification.
4. **Use inline for simple work:** Don't over-engineer with phases for trivial changes.
5. **Break complex work:** If work feels large or risky, use task-based workflow to break into units.
6. **Learn as you go:** Document gotchas and patterns discovered during execution via `/pwrl-learnings`.
7. **Commit atomically:** Each work execution produces one clean commit. Use `/pwrl-end-session` or agent shipping.

### Work Quality Checklist

A good work execution produces:

- ✅ Failing tests written first (before implementation)
- ✅ Implementation satisfies all test cases
- ✅ Edge cases tested
- ✅ Code review findings addressed
- ✅ No breaking API changes (or intentional, documented changes)
- ✅ Performance acceptable (no obvious optimizations missed)
- ✅ Single, clean commit with context
- ✅ GitHub Issues updated if task-based workflow used

If your work execution is missing any of these, re-run the work workflow or address gaps before shipping.

---

The planning workflow is the foundation of PWRL. Understanding how it works helps you create better plans and use the framework more effectively.

### Planning Tiers

Plans are tailored to task complexity using three tiers:

**Fast (5-15 min):** Small, well-understood tasks with clear scope and low risk

- 1-3 files affected
- No major architectural decisions
- Examples: bug fixes, documentation updates, small tweaks

**Standard (30-45 min):** Most software features with moderate complexity

- 4-8 files affected
- 2-5 key technical decisions
- Examples: new features, API integrations, auth flows

**Deep (1-2 hours):** Complex, high-risk work requiring extensive design

- 9+ files affected
- 5+ technical decisions or cross-cutting impact
- Examples: security overhauls, payment systems, major migrations

See `pwrl-plan/references/planning-tiers.md` for detailed tier descriptions and decision criteria.

### Planning Workflow (Four Phases)

When you call `/pwrl-plan`, the workflow proceeds in four phases:

**Phase 1: Scope Gathering** (`pwrl-plan-scope`)

- Check for existing plans
- Search for related documentation and learnings
- Validate domain (software vs. non-software)
- Bootstrap problem frame, intended behavior, success criteria

**Phase 2: Research & Findings** (`pwrl-plan-research`)

- Discover local patterns and tech stack
- Detect high-risk areas (security, payments, APIs, migrations)
- Recommend external research if needed
- Document constraints and patterns found

**Phase 3: Design & Units** (`pwrl-plan-design`)

- Decompose work into stable implementation units (U1, U2, ... UX)
- Define dependencies and acceptance criteria
- Optionally generate Mermaid diagrams
- Determine complexity hint (Fast/Standard/Deep)

**Phase 4: Plan Generation** (`pwrl-plan-generate`)

- Select tier based on complexity
- Render plan from appropriate template
- Embed related learnings and learning gaps
- Save to `docs/plans/YYYY-MM-DD-NNN-<name>.md`

Each phase has a user checkpoint for review and adjustment before proceeding.

### Agent-Enhanced vs. Fallback

The planning workflow can run in two modes:

**Agent-Enhanced (Recommended):**

- `.agents/agents/pwrl-planner.agent.md` orchestrates all four phases
- Clear phase boundaries with checkpoints
- Can iterate within each phase before moving forward
- Better user experience with staged feedback

**Monolithic Fallback:**

- All four phases run within `pwrl-plan` when agents unavailable
- Same checkpoints and logic, all inline
- Guaranteed to work regardless of system configuration
- See `pwrl-plan/references/fallback-workflow.md` for complete Phase 1-4 logic

### Best Practices for Planning

1. **Answer questions fully:** When the planning skill asks questions, provide context. Short answers lead to shallow plans.
2. **Be honest about risk:** If an area feels risky, flag it. The plan will include risk mitigation.
3. **Leverage learnings:** Review existing learnings before planning. Reuse proven approaches rather than reinventing.
4. **Research unfamiliar patterns:** If the codebase has <3 examples of a pattern you need, run external research. It's worth the time.
5. **Don't over-plan:** Small tasks don't need Deep tier plans. Match tier to complexity to save time.
6. **Document gaps:** If important knowledge is missing, add a learning gap to the plan. Document it after implementation via `/pwrl-learnings`.
7. **Stable unit IDs:** Once a plan is created, unit IDs (U1, U2, ...) are anchors. If you need to adjust, keep the same IDs; don't renumber.

### Plan Quality Checklist

A good plan includes:

- ✅ Clear problem statement and intended behavior
- ✅ 1-3 specific, measurable success criteria
- ✅ Implementation units with dependencies and acceptance criteria
- ✅ Files to create/modify/test per unit
- ✅ Key technical decisions with rationale (Standard/Deep)
- ✅ Risk analysis and mitigation (Deep)
- ✅ Related learnings with applicability notes
- ✅ Learning gaps flagged for post-implementation documentation

If your plan is missing any of these, re-run the planning workflow with more detail.

---

## Core Philosophy

### Plan First, Code Second

Ad-hoc prompts like "add authentication" lead to incomplete solutions. PWRL separates planning from implementation:

1. **Planning phase** explores approaches, identifies risks, and defines success criteria
2. **Implementation phase** executes against a concrete plan with clear verification steps

**Why it matters:**

- Catches edge cases before coding
- Documents decisions for future reference
- Reduces rework from unclear requirements
- Creates reviewable, maintainable changes

---

### Document While Context Is Fresh

The first time you solve a problem takes hours of research. The next time should take minutes.

PWRL captures:

- **Technical fixes** — What broke, what didn't work, what solved it
- **Patterns** — Reusable approaches and architecture decisions
- **Gotchas** — Non-obvious behaviors and edge cases
- **Concepts** — Framework understanding and domain knowledge

**Why it matters:**

- Knowledge compounds over time
- Onboarding becomes trivial
- Debugging speeds up exponentially
- Team learning scales

---

### Ship Complete Features

PWRL's review and verification steps ensure:

- Tests cover new behavior
- Edge cases are handled
- Quality standards are met
- Code passes review before marking done
- Sessions end with clean commits

**Task Status Flow:**

- `to-do`: Ready to be picked up
- `in-progress`: Currently being implemented
- `for-review`: Work complete, awaiting review
- `done`: Review approved, ready to merge

**Why it matters:**

- Reduces production bugs
- Makes code reviewable
- Builds confidence in AI-assisted work
- Creates audit trail
- Separates implementation from approval

---

## When to Use Which Skill

### /pwrl-plan

✅ **Always plan when:**

- Adding new features or capabilities
- Work spans multiple files or components
- Architectural decisions are involved
- High-risk areas (security, data, payments, auth)
- Complex refactoring or migrations
- You're unsure of the best approach

❌ **Skip planning for:**

- Typos, formatting, single-line changes
- Direct execution paths with obvious implementation
- Following existing clear patterns
- Urgent hotfixes (but document after!)

**Choosing tier:**

- **Fast**: 1-3 files, clear scope, low risk
- **Standard**: Features with decisions, moderate complexity
- **Deep**: Architecture, migrations, high-risk work

---

### /pwrl-tasks

✅ **Use when:**

- Complex plan with multiple implementation units
- Team collaboration (parallel work needed)
- Want GitHub Issues integration for tracking
- Breaking risky changes into safe increments
- Need clear progress visibility

❌ **Skip when:**

- Simple features (1-3 files)
- Solo work on straightforward implementations
- Prefer inline task management

**Workflow:** Creates task files in `docs/tasks/to-do/` from plan units. Each task has:

- Goal and context
- Implementation steps
- Acceptance criteria
- Optional GitHub issue tracking

---

### /pwrl-work

✅ **Use when:**

- You have a plan to execute
- You have a task file to implement
- Task is small/clear enough to work directly
- Following test-first discipline
- Implementing against defined requirements

⚠️ **Be careful:**

- Don't skip test verification
- Don't expand scope without updating plan
- Don't leave TODOs unresolved
- Don't commit partial work without context

---

### /pwrl-review

✅ **Always review when:**

- Work is complete and in `for-review` status
- Before creating a PR
- After completing feature work
- When quality concerns exist
- Before deploying to production
- After fixing critical bugs

✅ **What it does:**

- Checks correctness (logic errors, edge cases)
- Validates security (vulnerabilities, auth, validation)
- Assesses maintainability (clarity, complexity, patterns)
- Reviews test coverage (gaps, quality, assertions)
- Identifies performance issues
- Checks for breaking API changes

✅ **Review outcomes:**

- **Ready to merge**: Moves task `for-review` → `done`, closes GitHub issue
- **Ready with fixes**: Moves task `for-review` → `in-progress`, lists required changes
- **Not ready**: Moves task back to `in-progress`, provides detailed feedback

**For task-based workflow**: Review controls the final approval. Implementation completes work and requests review; reviewer approves (done) or requests changes (back to in-progress).

---

### /pwrl-learnings

✅ **Always document when:**

- You spent >15 minutes debugging
- Solution wasn't obvious or well-documented
- You'd want to remember this next time
- Edge case or gotcha discovered
- Pattern is reusable
- Decision needs rationale

❌ **Skip when:**

- Solution is obvious/well-known
- Already documented elsewhere
- Trivial fix with no broader learning

**Choosing category:**

- `technical-fix` — Bugs and debugging
- `pattern` — Reusable code patterns
- `workflow` — Process improvements
- `gotcha` — Non-obvious behaviors
- `concept` — Technology understanding
- `decision` — Approach justification

---

### /pwrl-refresh-learnings

✅ **Run when:**

- After major refactor or migration
- New learning contradicts/supersedes older ones
- Found duplicates during documentation
- Quarterly maintenance cycles
- Tech stack upgrade completed

**Scope strategically:**

- Specific file when updating one doc
- Category after refactoring that area
- Topic when related docs need sync
- Date range for quarterly review

---

### /pwrl-end-session

✅ **Always use when:**

- Completing a work session
- Switching tasks mid-session
- Creating a checkpoint
- Partial work needs clean commit

**Commit quality:**

- Subject: imperative, ≤50 chars
- Body: explains why and what
- Lists skills used
- Includes `[AGENT: name]` trailer

---

## Anti-Patterns to Avoid

### ❌ Vibe Coding Without Structure

**Problem:**

```

Human: Add user authentication
Agent: [writes code without planning]
Human: That broke registration
Agent: [patches it]
Human: Now tests fail
Agent: [fixes tests]
Human: Wait, we need password reset too
Agent: [adds more code]
[Session ends, context lost, no documentation]

```

**Solution:**

```

Human: /pwrl-plan Add user authentication system
[Plan created with JWT decision, all flows, tests]
Human: /pwrl-work
[Systematic implementation with verification]
Human: /pwrl-learnings
[Document JWT patterns learned]
Human: /pwrl-end-session
[Clean commit with context]

```

---

### ❌ Skipping Test Verification

**Problem:**

- Agent claims "tests pass" without running them
- Implementation assumed correct
- Regressions discovered later

**Solution:**

- `/pwrl-work` includes verification steps
- Actually run tests after changes
- Review test output before marking complete

---

### ❌ Documenting Long After Solving

**Problem:**

- Context fades quickly
- Important details forgotten
- Documentation becomes surface-level

**Solution:**

- Run `/pwrl-learnings` immediately after solving
- Capture what didn't work, not just solution
- Document while debugging steps are fresh

---

### ❌ Batch-Committing Unrelated Changes

**Problem:**

- Git history is unclear
- Reverts are difficult
- Code review is harder
- Bisecting bugs is impossible

**Solution:**

- Use `/pwrl-end-session` after each logical unit
- Keep commits focused and atomic
- Write clear commit messages with rationale

---

### ❌ Expanding Scope Mid-Implementation

**Problem:**

- "While I'm here" changes
- Feature creep
- Original goal lost
- Unfocused commits

**Solution:**

- Stick to the plan
- Document new work as separate task
- Update plan if scope genuinely changed
- Create new plan for significant additions

---

### ❌ Pushing Without Review

**Problem:**

- Bugs slip into production
- Quality issues accumulate
- Technical debt grows

**Solution:**

- Always run `/pwrl-review` before PR
- Address P0/P1 findings
- Review diff yourself before pushing
- Let CI/CD validate

---

## Planning with pwrl-plan

The planning workflow is the foundation of PWRL. Understanding how it works helps you create better plans and use the framework more effectively.

### Planning Workflow (Four Phases)

When you call `/pwrl-plan [task]`, the workflow proceeds in four phases:

**Phase 1: Scope Gathering** (`pwrl-plan-scope`)

- Check for existing plans
- Search for related documentation and learnings
- Validate domain (software vs. non-software)
- Bootstrap problem frame, intended behavior, success criteria

**Phase 2: Research & Findings** (`pwrl-plan-research`)

- Discover local patterns and tech stack
- Detect high-risk areas (security, payments, APIs, migrations)
- Recommend external research if needed
- Document constraints and patterns found

**Phase 3: Design & Units** (`pwrl-plan-design`)

- Decompose work into stable implementation units (U1, U2, ... UX)
- Define dependencies and acceptance criteria
- Optionally generate Mermaid diagrams
- Determine complexity hint (Fast/Standard/Deep)

**Phase 4: Plan Generation** (`pwrl-plan-generate`)

- Select tier based on complexity
- Render plan from appropriate template
- Embed related learnings and learning gaps
- Save to `docs/plans/YYYY-MM-DD-NNN-<name>.md`

Each phase has a user checkpoint for review and adjustment before proceeding.

### Agent-Enhanced vs. Fallback

The planning workflow can run in two modes:

**Agent-Enhanced (Recommended):**

- `.agents/agents/pwrl-planner.agent.md` orchestrates all four phases
- Clear phase boundaries with checkpoints
- Can iterate within each phase before moving forward
- Better user experience with staged feedback

**Monolithic Fallback:**

- All four phases run within `pwrl-plan` when agents unavailable
- Same checkpoints and logic, all inline
- Guaranteed to work regardless of system configuration
- See `pwrl-plan/references/fallback-workflow.md` for complete Phase 1-4 logic

### Best Practices for Planning

1. **Answer questions fully:** When the planning skill asks questions, provide context. Short answers lead to shallow plans.
2. **Be honest about risk:** If an area feels risky, flag it. The plan will include risk mitigation.
3. **Leverage learnings:** Review existing learnings before planning. Reuse proven approaches rather than reinventing.
4. **Research unfamiliar patterns:** If the codebase has <3 examples of a pattern you need, run external research. It's worth the time.
5. **Don't over-plan:** Small tasks don't need Deep tier plans. Match tier to complexity to save time.
6. **Document gaps:** If important knowledge is missing, add a learning gap to the plan. Document it after implementation via `/pwrl-learnings`.
7. **Stable unit IDs:** Once a plan is created, unit IDs (U1, U2, ...) are anchors. If you need to adjust, keep the same IDs; don't renumber.

### Plan Quality Checklist

A good plan includes:

- ✅ Clear problem statement and intended behavior
- ✅ 1-3 specific, measurable success criteria
- ✅ Implementation units with dependencies and acceptance criteria
- ✅ Files to create/modify/test per unit
- ✅ Key technical decisions with rationale (Standard/Deep)
- ✅ Risk analysis and mitigation (Deep)
- ✅ Related learnings with applicability notes
- ✅ Learning gaps flagged for post-implementation documentation

If your plan is missing any of these, re-run the planning workflow with more detail.

---

### Fast Plans

**When to use:**

- Clear, bounded task
- 1-3 files affected
- Low risk
- Following established patterns

**What you get:**

- Quick plan generation
- File targets
- Basic approach
- Verification steps

**Example:**

```

/pwrl-plan Add loading spinner to submit button

```

---

### Standard Plans (Default)

**When to use:**

- Feature development
- Moderate complexity
- Technical decisions needed
- Some unknowns

**What you get:**

- Technical decisions documented
- Implementation units (U1, U2, ...)
- Test scenarios
- Dependencies
- System impact analysis

**Example:**

```

/pwrl-plan Implement user authentication with JWT

```

---

### Deep Plans

**When to use:**

- Architectural changes
- Database migrations
- Security-critical work
- Cross-cutting refactors
- High-risk areas

**What you get:**

- High-level technical design
- Phased rollout
- Alternative approaches considered
- Risk analysis and mitigation
- Operational notes

**Example:**

```

/pwrl-plan Migrate database from MongoDB to PostgreSQL

````

---

## The Cost of "Just Vibing"

### Without Structure

**Time spent:**

- Initial coding: 2 hours
- Fixing broken things: 3 hours
- Debugging test failures: 2 hours
- Addressing review feedback: 2 hours
- **Total: 9 hours**

**Result:**

- Incomplete implementation
- Hidden edge cases
- No documentation
- Unclear decisions
- Hard to review

---

### With PWRL

**Time spent:**

- Planning: 30 minutes
- Implementation: 2.5 hours
- Review: 20 minutes
- Documentation: 15 minutes
- **Total: 4 hours**

**Result:**

- Complete, tested feature
- Edge cases handled
- Decisions documented
- Easy to review
- Future reference

**Time saved: 5 hours (56%)**

---

## Building the Habit

### Week 1: Learn the Flow

- Focus on completing one task start-to-finish
- Use all skills in sequence
- Review generated documentation
- Get comfortable with the pattern

### Week 2: Optimize Usage

- Choose appropriate planning tier
- Skip planning when truly trivial
- Document learnings consistently
- Write better commit messages

### Week 3: Advanced Patterns

- Use refresh-learnings
- Experiment with depth modes
- Contribute improvements
- Teach others

### Week 4+: Second Nature

- PWRL becomes automatic
- Quality improves noticeably
- Velocity increases
- Knowledge compounds

---

## Measuring Success

### Good Signs

- ✅ Learnings directory growing steadily
- ✅ Plans are referenced during implementation
- ✅ Code review findings decreasing
- ✅ Onboarding time reduced
- ✅ Debugging faster (checking learnings first)
- ✅ Commit messages are clear and complete

### Warning Signs

- ⚠️ Skipping steps regularly
- ⚠️ No learnings documented in weeks
- ⚠️ Plans gathering dust, not used
- ⚠️ Reviews finding same issues repeatedly
- ⚠️ Commits are vague or batch multiple changes

---

## Integration with Existing Workflows

### With Agile/Scrum

- Run `/pwrl-plan` during sprint planning for complex stories
- Use `/pwrl-work` during sprints
- Run `/pwrl-review` before moving to "Done"
- Document learnings during retrospectives

### With Pull Requests

1. Work on feature branch
2. Use PWRL workflow
3. Run `/pwrl-review` before creating PR
4. Reference plan in PR description
5. Link to learnings if relevant

### With CI/CD

- PWRL commits trigger CI normally
- Review findings inform test improvements
- Learnings capture deployment gotchas
- Plans reference rollout procedures

---

## Agent Development

PWRL includes pre-built agents for orchestrating complex workflows. Agents are optional but recommended for their superior UX with phase checkpoints and state management.

### Understanding Agents

**What agents do:**

- Orchestrate multi-phase workflows (e.g., planning, review)
- Collect user feedback at strategic checkpoints
- Manage state between skill invocations
- Provide better UX than inline skill calls
- Enable complex conditional logic

**What agents aren't:**

- Required (all PWRL workflows have fallback implementations)
- Platform-specific (PWRL agents are framework-agnostic)
- Replacement for skills (agents orchestrate skills)

### Built-In Agents

**PWRL Planner Agent** (`.agents/agents/pwrl-planner.agent.md`)

Orchestrates the planning workflow:
1. Scope Gathering → `pwrl-plan-scope`
2. Research & Findings → `pwrl-plan-research`
3. Design & Units → `pwrl-plan-design`
4. Plan Generation → `pwrl-plan-generate`

Each phase has a user checkpoint for review/adjustment before proceeding.

**PWRL Work Agent** (`.agents/agents/pwrl-work.agent.md`)

Orchestrates the work execution workflow:
1. Triage → `pwrl-work-triage`
2. Prepare → `pwrl-work-prepare`
3. Execute → `pwrl-work-execute`
4. Review → `pwrl-work-review`

Each phase has a user checkpoint for review/adjustment before proceeding. Supports inline, serial, and parallel execution modes. After Phase 4, work is ready for pull request creation.

**Usage:**
```bash
# When agents enabled in your platform:
/pwrl-plan [task description]
/pwrl-work [task file or prompt]

# Automatically routes to appropriate agent
# Without agents, runs inline fallback
```

### Creating Custom Agents

Agent files follow YAML frontmatter + Markdown format (`.agents/agents/NAME.agent.md`):

```markdown
---
name: "Agent Name"
role: Agent Role
description: "What the agent does"
model: Auto
version: 1.0
tools: [read, write, bash, grep, find]
---

# Agent Instructions

Clear, imperative instructions for the agent...
```

**Best practices:**

1. **Document state clearly** — Define what state passes between phases
2. **Explicit checkpoints** — Ask user at decision points
3. **Graceful fallback** — Handle user cancellations/edits
4. **Reuse skills** — Call existing skills rather than reimplementing
5. **Keep it focused** — One agent per workflow type
6. **Test thoroughly** — Walk through multiple scenarios

### Debugging Agents

| Symptom                  | Likely Cause              | Fix                           |
| ------------------------ | ------------------------- | ----------------------------- |
| Agent not discovered     | File in wrong path        | Verify `.agents/agents/` path |
| Agent fails silently      | YAML syntax error         | Check frontmatter formatting  |
| Phase doesn't complete   | Missing skill call        | Verify skill is available     |
| User sees no checkpoints | Missing ask_user calls    | Add explicit user decisions   |
| State lost between calls | State not being passed    | Explicitly pass state forward |

### Examples

See `.agents/agents/pwrl-planner.agent.md` for a complete working example of:

- Phase-by-phase orchestration
- User checkpoints with multiple-choice questions
- State management across phases
- Graceful error handling
- Skill invocation and result integration

---

## Team Adoption

### Individual Developer

1. Start using PWRL personally
2. Build portfolio of learnings
3. Share success metrics
4. Demonstrate to team

### Small Team (2-5)

1. Pilot with one project
2. Share learnings directory
3. Establish conventions
4. Iterate on process

### Large Team (6+)

1. Create team guidelines
2. Designate PWRL champions
3. Regular learning reviews
4. Track quality metrics

---

## Advanced Techniques

### Compound Learning

Cross-reference related learnings:

```markdown
## Related

- [JWT token rotation](technical-fix/jwt-rotation-2026-04-15.md)
- [Auth middleware pattern](pattern/auth-middleware-2026-04-10.md)
````

### Plan Templates

Create project-specific plan templates:

```
docs/
  templates/
    standard-api-endpoint.md
    standard-react-component.md
```

Reference in future plans.

### Learning Categories

Customize categories for your domain:

```
docs/
  learnings/
    technical-fix/
    pattern/
    workflow/
    gotcha/
    concept/
    decision/
    deployment/      ← Custom
    performance/     ← Custom
```

---

## FAQ

**Q: Do I need to use all skills every time?**
A: No. Use the workflow that fits the task. Trivial changes might only need `/pwrl-work` + `/pwrl-end-session`.

**Q: What if the plan becomes outdated mid-implementation?**
A: Update the plan or create a new one. PWRL is flexible, not rigid.

**Q: How detailed should learnings be?**
A: Enough that future you (or a teammate) can understand the problem and solution without the original context.

**Q: Can I customize PWRL skills?**
A: Yes! Fork and adapt to your needs. Follow the `SKILL.md` format.

**Q: Does PWRL work for non-coding tasks?**
A: The principles apply broadly, but it's optimized for software development.

---

## Next Steps

- Practice the workflow on a real task
- Build your learnings collection
- Share with your team
- Contribute improvements

**Remember:** PWRL is about building discipline, not following rules. Adapt it to your context while preserving the core principles: plan, work, review, learn.
