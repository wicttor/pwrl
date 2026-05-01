# PWRL Guide

Best practices, anti-patterns, and philosophy for effective AI-assisted development.

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
- Sessions end with clean commits

**Why it matters:**

- Reduces production bugs
- Makes code reviewable
- Builds confidence in AI-assisted work
- Creates audit trail

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

### /pwrl-work

✅ **Use when:**

- You have a plan to execute
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

- Before creating a PR
- After completing feature work
- When quality concerns exist
- Before deploying to production
- After fixing critical bugs

✅ **What it catches:**

- Logic errors and edge cases
- Security vulnerabilities
- Maintainability issues
- Test coverage gaps
- Performance problems
- Breaking API changes

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

## Planning Tiers Deep Dive

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
```

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
```

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
