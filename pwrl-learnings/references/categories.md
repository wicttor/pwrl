# Learning Categories

Quick reference for choosing the right category.

## technical-fix

**Use for**: Bugs, errors, failures, or unexpected behaviors that were debugged and resolved.

**Directory**: `docs/learnings/technical-fix/`

**When to use**:

- You encountered an error or bug
- Something broke or behaved unexpectedly
- You had to debug and fix code

**Template sections**:

- Problem — What broke and how it manifested
- Symptoms — Observable errors or behavior
- What Didn't Work — Investigation dead ends
- Solution — The fix that worked
- Why It Works — Root cause and why solution addresses it
- Prevention — How to avoid in future

---

## pattern

**Use for**: Reusable code patterns, architecture approaches, or design decisions.

**Directory**: `docs/learnings/pattern/`

**When to use**:

- You discovered a reusable code pattern
- You made an architecture decision worth documenting
- You learned a better way to structure code

**Template sections**:

- What It Is — Description of the pattern
- Why It Matters — Problems it solves
- When to Use — Applicable situations
- Examples — Code showing the pattern in action
- Tradeoffs — Pros, cons, and alternatives

---

## workflow

**Use for**: Development environment setups, tool configurations, or process improvements.

**Directory**: `docs/learnings/workflow/`

**When to use**:

- You set up or improved dev tooling
- You discovered a better development practice
- You configured something that others will need

**Template sections**:

- Context — What prompted this workflow change
- The Practice — What the workflow/setup is
- Why It Helps — Benefits and problems avoided
- How to Apply — Step-by-step instructions
- Examples — Screenshots or code snippets

---

## gotcha

**Use for**: Non-obvious behaviors, edge cases, surprises, or "things I wish I knew earlier."

**Directory**: `docs/learnings/gotcha/`

**When to use**:

- Something behaved counter-intuitively
- You hit an edge case or sharp edge
- You wasted time on something that wasn't obvious

**Template sections**:

- The Situation — When this gotcha appears
- What's Non-Obvious — The surprising behavior
- What to Do — The correct approach
- Why It Matters — Impact if you get it wrong

---

## concept

**Use for**: Understanding gained about a technology, framework, or domain.

**Directory**: `docs/learnings/concept/`

**When to use**:

- You gained mental model clarity about a technology
- You figured out how something really works
- You learned a framework concept that clicked

**Template sections**:

- What It Is — Core concept description
- Why It Matters — Why it's worth understanding
- How It Works — Mechanisms or mental models
- Examples — Concrete usage showing the concept
- Resources — Links for further learning

---

## decision

**Use for**: Documenting why a particular approach was chosen over alternatives.

**Directory**: `docs/learnings/decision/`

**When to use**:

- You evaluated multiple options and picked one
- You made a technical decision worth recording
- You want to capture the rationale for future reference

**Template sections**:

- The Question — What decision was being made
- Options Considered — Alternatives evaluated
- What We Chose — The decision
- Why — Rationale and deciding factors
- Tradeoffs — What was gained and what was sacrificed

---

## Choosing Between Categories

**Bug or weird behavior?** → `technical-fix`

**Reusable code pattern or architecture?** → `pattern`

**Tool setup or process improvement?** → `workflow`

**Surprising/non-obvious behavior?** → `gotcha`

**Learned how something works?** → `concept`

**Evaluated options and picked one?** → `decision`

When in doubt, choose the category that best matches how you'd want to find this learning in the future.
