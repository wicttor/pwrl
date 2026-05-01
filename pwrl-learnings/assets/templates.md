# Learning Templates

Choose the template that matches your learning category.

---

## technical-fix

**Use for**: Bugs, errors, or issues debugged and resolved

````markdown
---
title: [Clear problem description]
date: [YYYY-MM-DD]
category: technical-fix
tags: [keyword-one, keyword-two, keyword-three]
severity: [high/medium/low]
---

# [Title]

## Problem

[1-2 sentence description of what broke and user-visible impact]

## Symptoms

- [Observable error message or broken behavior]
- [Another symptom if applicable]

## What Didn't Work

- **[Attempted approach]**: [Why it didn't work or what we learned]
- **[Another attempt]**: [Why it failed]

## Solution

[The fix that worked, with code examples]

```[language]
// Before (broken)
[code showing the problem]

// After (working)
[code showing the fix]
```
````

[Step-by-step if multiple steps needed]

## Why It Works

[Root cause explanation: why the problem occurred and why the solution fixes it]

## Prevention

- [Concrete practice, test, or guardrail to prevent recurrence]
- [Another prevention tip]

## Related

- [Link to related learning doc or issue]

````

---

## pattern

**Use for**: Reusable code patterns or architecture decisions

```markdown
---
title: [Pattern name]
date: [YYYY-MM-DD]
category: pattern
tags: [keyword-one, keyword-two, keyword-three]
severity: [high/medium/low]
---

# [Title]

## What It Is

[Description of the pattern or approach]

## Why It Matters

[Problems this pattern solves or benefits it provides]

## When to Use

- [Situation where this pattern applies]
- [Another applicable scenario]

## Examples

```[language]
// Example showing the pattern in use
[code example]
````

[Explanation of the example]

## Tradeoffs

**Pros:**

- [Advantage]

**Cons:**

- [Limitation or cost]

**Alternatives:**

- [Other approaches and when to prefer them]

## Related

- [Link to related pattern or decision doc]

````

---

## workflow

**Use for**: Process improvements, tooling setups, dev practices

```markdown
---
title: [Workflow/practice name]
date: [YYYY-MM-DD]
category: workflow
tags: [keyword-one, keyword-two, keyword-three]
severity: [high/medium/low]
---

# [Title]

## Context

[What prompted this workflow change or setup? What friction existed before?]

## The Practice

[Description of the workflow, setup, or practice]

```[language/shell]
# Commands or configuration
[example showing the setup]
````

## Why It Helps

- [Benefit or problem avoided]
- [Another benefit]

## How to Apply

1. [First step]
2. [Second step]
3. [Continue with concrete steps]

## Examples

[Screenshots, code snippets, or examples showing it in action]

## Related

- [Link to related workflow doc or tool]

````

---

## gotcha

**Use for**: Non-obvious behaviors, edge cases, surprises

```markdown
---
title: [The gotcha or surprising behavior]
date: [YYYY-MM-DD]
category: gotcha
tags: [keyword-one, keyword-two, keyword-three]
severity: [high/medium/low]
---

# [Title]

## The Situation

[When does this gotcha appear? What triggers it?]

## What's Non-Obvious

[The surprising or counter-intuitive behavior]

```[language]
// What you might expect
[code showing intuitive but wrong approach]

// What actually happens
[result or error]
````

## What to Do

[The correct approach]

```[language]
// Correct way to handle it
[code showing proper approach]
```

## Why It Matters

[Impact if you get this wrong, or time cost of not knowing]

## Related

- [Link to related gotcha or technical fix]

````

---

## concept

**Use for**: Understanding about a technology, framework, or domain

```markdown
---
title: [Concept name]
date: [YYYY-MM-DD]
category: concept
tags: [keyword-one, keyword-two, keyword-three]
severity: [high/medium/low]
---

# [Title]

## What It Is

[Core description of the concept]

## Why It Matters

[Why this understanding is valuable, what it enables or prevents]

## How It Works

[Mental models, mechanisms, or key details that make it click]

```[language]
// Code example illustrating the concept
[example]
````

## Examples

[Real-world usage or scenarios showing the concept in practice]

## Resources

- [Link to docs, articles, or related learnings]

## Related

- [Link to related concept or pattern doc]

````

---

## decision

**Use for**: Documenting why a particular approach was chosen

```markdown
---
title: [The decision made]
date: [YYYY-MM-DD]
category: decision
tags: [keyword-one, keyword-two, keyword-three]
severity: [high/medium/low]
---

# [Title]

## The Question

[What decision needed to be made? What was the context?]

## Options Considered

### Option 1: [Name]
- [Pro]
- [Con]

### Option 2: [Name]
- [Pro]
- [Con]

### Option 3: [Name]
- [Pro]
- [Con]

## What We Chose

[The selected option]

## Why

[Rationale: what factors led to this choice?]

- [Deciding factor 1]
- [Deciding factor 2]

## Tradeoffs

**What we gained:**
- [Benefit]

**What we sacrificed:**
- [Cost or limitation]

**When to revisit:**
- [Conditions that might make us reconsider]

## Related

- [Link to related decision or pattern doc]
````

---

## Customizing Templates

These templates are starting points. Adapt sections as needed:

- **Skip sections** that don't apply
- **Add sections** when your learning needs them
- **Merge sections** when it flows better
- **Rename sections** for clarity

The goal is useful documentation, not template compliance.
