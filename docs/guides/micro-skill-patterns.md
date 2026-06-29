---
title: Micro-Skill Composition Patterns
description: A guide to building reusable, composable micro-skills in the PWRL ecosystem, covering orchestrator patterns, templates, artifact design, and common patterns.
type: PWRL Guide
timestamp: 2026-06-12
tags: [micro-skills, patterns, composition, guide, templates]
---

# Micro-Skill Composition Patterns

A guide to building reusable, composable micro-skills in the PWRL ecosystem.

## Table of Contents
1. [Orchestrator Pattern](#orchestrator-pattern)
2. [Micro-Skill Template](#micro-skill-template)
3. [Artifact Design](#artifact-design)
4. [Creating New Workflows](#creating-new-workflows)
5. [Common Patterns](#common-patterns)
6. [Testing Strategies](#testing-strategies)

---

## Orchestrator Pattern

The foundation of PWRL is the **orchestrator pattern**: a main skill that coordinates a sequence of specialized micro-skills.

### Pattern Structure

```
Orchestrator (e.g., pwrl-plan)
├── Phase 1: Input Triage
│   └── Micro-skill 1 (pwrl-plan-scope)
│   └── Input: task description
│   └── Output: context artifact
│
├── Phase 2: Processing
│   └── Micro-skill 2 (pwrl-plan-research)
│   └── Input: context artifact
│   └── Output: findings artifact
│
├── Phase 3: Design
│   └── Micro-skill 3 (pwrl-plan-design)
│   └── Input: findings artifact
│   └── Output: design artifact
│
└── Phase 4: Output Generation
    └── Micro-skill N (pwrl-plan-generate)
    └── Input: design artifact
    └── Output: final deliverable
```

### Key Rules

1. **Linear Sequence** — Phases execute in order (no branching)
   ```
   Phase 1 → Phase 2 → Phase 3 → Phase 4 (no loops)
   ```

2. **Explicit Handoff** — Each phase produces artifact consumed by next
   ```javascript
   // Phase 1 output becomes Phase 2 input
   const contextArtifact = await phaseScope(userInput);
   const researchArtifact = await phaseResearch(contextArtifact);
   ```

3. **Error Isolation** — Phase errors don't cascade
   ```javascript
   try {
     result = await phaseResearch(context);
   } catch (err) {
     // Phase 3 can still run if Phase 2 fails
     reportError(err);
   }
   ```

4. **Single Entry Point** — User interacts only with orchestrator
   ```bash
   /pwrl-plan "Add email validation"  # User calls orchestrator
   # NOT: /pwrl-plan-scope directly (internal only)
   ```

5. **Resumable Execution** — Can restart from any phase
   ```javascript
   // User can resume from existing plan
   const existingPlan = loadPlan('2026-06-11-001-plan.md');
   // Skip phases 1-3, jump to phase 4
   await phaseGenerate(existingPlan.design);
   ```

---

## Micro-Skill Template

Every micro-skill follows this structure in its `SKILL.md` file:

### Frontmatter

```yaml
---
name: [descriptive-name]
description: "[One-sentence purpose]"
argument-hint: "[What orchestrator passes to this skill]"
---
```

### Content Structure

```markdown
# [Skill Name] — [Subtitle]

**Purpose:** What this skill does in the workflow.

## Interaction Method
- How the skill asks questions (if any)
- When to request user input
- What decisions the skill makes

## Input: [Artifact Type]
- Format: YAML frontmatter + Markdown body
- Required fields: [list]
- Optional fields: [list]
- Example:
  ```yaml
  ---
  format: pwrl-context-artifact
  id: 2026-06-12-001-scope
  ---
  ```

## Output: [Artifact Type]
- Format: YAML frontmatter + Markdown body
- Always includes: [list]
- Example structure shown

## Workflow
### Step 1: [Description]
Input validation, context loading, or prerequisites

### Step 2: [Main Processing]
Core business logic of the skill

### Step 3: [Artifact Generation]
Create output artifact with YAML frontmatter

## Error Handling
| Error | Cause | Recovery |
| --- | --- | --- |
| ENOENT | File not found | Check path exists |
| INVALID_FORMAT | Bad frontmatter | Validate schema |
| ... | ... | ... |

## Testing Coverage
- ✓ Happy path (normal input → expected output)
- ✓ Edge cases (empty input, max size, etc.)
- ✓ Error handling (file errors, validation failures)
- ✓ Context preservation (artifact lineage maintained)
```

### Minimal Example

```markdown
---
name: pwrl-plan-scope
description: "Gather context and requirements for planning"
argument-hint: "Task description string"
---

# Plan Scope — Context Gathering

**Purpose:** Extract problem frame, intended behavior, and success criteria from user input.

## Interaction Method
- Asks clarifying questions if task is ambiguous
- Searches for existing related plans
- Suggests learnings from similar past work

## Input: Plain Text
- User task description (required)
- Maximum 1000 characters

## Output: Scope Artifact
- Format: YAML frontmatter + Markdown body
- Fields: problem_frame, intended_behavior, success_criteria

## Workflow
### Step 1: Parse Input
Validate task is software-related and non-empty.

### Step 2: Gather Context
- Check for existing plans
- Extract related learnings
- Search for similar patterns

### Step 3: Generate Scope Artifact
Create artifact with problem frame and acceptance criteria.

## Error Handling
| Error | Recovery |
| --- | --- |
| Empty input | Prompt user for task |
| Non-software task | Suggest alternative workflows |
| No patterns found | Continue with generic scope |

## Testing Coverage
- ✓ Basic task input → scope output
- ✓ Empty input handling
- ✓ Existing plan detection
- ✓ Learning integration
```

---

## Artifact Design

### YAML Frontmatter Format

All artifacts use consistent YAML frontmatter structure:

```yaml
---
format: pwrl-[workflow]-[phase]-artifact
version: "1.0"
id: YYYY-MM-DD-NNN-[phase]
created: ISO-8601-timestamp
created_from: [previous-artifact-id]  # if applicable
status: [complete|in-progress|error]
user_approval: [true|false]           # if needed
---
```

### Frontmatter Fields

| Field | Required | Purpose | Example |
| --- | --- | --- | --- |
| `format` | Yes | Artifact type identifier | `pwrl-plan-artifact` |
| `version` | Yes | Schema version for compatibility | `"1.0"` |
| `id` | Yes | Unique identifier with timestamp | `2026-06-12-001-scope` |
| `created` | Yes | Artifact creation timestamp | `2026-06-12T10:15:00Z` |
| `created_from` | No | Lineage to previous artifact | `2026-06-12-001-research` |
| `status` | No | Processing status | `complete` |
| `user_approval` | No | Whether user approved | `true` |

### Body Format

Keep bodies well-structured:

```markdown
# [Artifact Title]

## Executive Summary
1-3 sentence overview

## Section 1: [Main Content]
Key findings or decisions

## Section 2: [Details]
Detailed information

## Section 3: [Recommendations]
What to do next

## Appendix (optional)
Raw data, references, full output
```

### Artifact Passing Between Phases

```javascript
// Phase 1 creates artifact
const artifact1 = {
  format: 'pwrl-scope-artifact',
  id: '2026-06-12-001-scope',
  created: new Date().toISOString(),
};

// Phase 2 receives and extends it
const artifact2 = {
  ...artifact1,
  created_from: artifact1.id,  // Lineage
  format: 'pwrl-research-artifact',
  id: '2026-06-12-001-research',
};

// Phase 3 continues the chain
const artifact3 = {
  ...artifact2,
  created_from: artifact2.id,
  format: 'pwrl-design-artifact',
  id: '2026-06-12-001-design',
};
```

---

## Creating New Workflows

To create a new workflow (e.g., `pwrl-deploy`):

### Step 1: Design Phases
Identify 3-5 core phases your workflow needs:
```
pwrl-deploy workflow:
├── Phase 1: Scope - What to deploy
├── Phase 2: Validate - Pre-deployment checks
├── Phase 3: Prepare - Setup deployment environment
├── Phase 4: Execute - Deploy changes
└── Phase 5: Verify - Post-deployment validation
```

### Step 2: Define Artifact Contracts
For each phase transition, specify artifact format:
```
scope-artifact → validate-artifact → prepare-artifact → deploy-artifact → verify-artifact
```

### Step 3: Create Orchestrator
Create `pwrl-deploy/SKILL.md`:
```markdown
---
name: pwrl-deploy
description: "Deployment workflow orchestrator"
---

# Deploy Workflow

## Phases
1. **pwrl-deploy-scope** - Validate deployment target
2. **pwrl-deploy-validate** - Pre-deployment checks
3. **pwrl-deploy-prepare** - Setup environment
4. **pwrl-deploy-execute** - Execute deployment
5. **pwrl-deploy-verify** - Verify success

## Shared Dependencies
- lib/errors.js (error handling)
- lib/artifact-io.js (artifact persistence)
- lib/github-integration.js (Git operations)
```

### Step 4: Implement Micro-Skills
Create one `SKILL.md` per phase:
- `pwrl-deploy-scope/SKILL.md`
- `pwrl-deploy-validate/SKILL.md`
- `pwrl-deploy-prepare/SKILL.md`
- `pwrl-deploy-execute/SKILL.md`
- `pwrl-deploy-verify/SKILL.md`

### Step 5: Create Tests
Create comprehensive tests:
- `tests/pwrl-deploy/orchestration.test.js`
- `tests/pwrl-deploy/scope-validation.test.js`
- `tests/pwrl-deploy/execute-deployment.test.js`

### Step 6: Document
Create migration guide and examples.

---

## Common Patterns

### Pattern 1: Validation at Phase Boundaries

```javascript
// Phase 1 Output
const scopeOutput = {
  format: 'pwrl-scope-artifact',
  scope: 'email-validation',
  requirements: ['client-side', 'server-side'],
};

// Phase 2 Input Validation
function validateScopeInput(artifact) {
  if (!artifact.scope) throw new Error('Missing scope');
  if (!artifact.requirements?.length) throw new Error('No requirements');
  return true;
}

// Use shared validation
const isValid = validateArtifactSchema(artifact, {
  required: ['format', 'scope', 'requirements'],
});
```

### Pattern 2: Progressive Enhancement

Phases build on each other's output:

```
Phase 1: Extract basic facts → artifact
Phase 2: Research and validate → enhance artifact
Phase 3: Design solution → add recommendations
Phase 4: Generate plan → add timeline and resources
```

### Pattern 3: Error Recovery

```javascript
// If Phase 2 fails, allow resume from Phase 1 output
try {
  research = await phaseResearch(scope);
} catch (err) {
  if (err.code === 'API_LIMIT') {
    // Recoverable error - can retry
    return { status: 'paused', lastSuccess: 'scope', error: err };
  }
  // Non-recoverable - fail
  throw err;
}
```

### Pattern 4: User Decision Points

```javascript
// After analysis, ask user for decision
const findings = await phaseAnalyze(input);

const userChoice = await askUser({
  message: 'Select priority focus',
  options: ['security', 'performance', 'features'],
});

// Pass user decision to next phase
const design = await phaseDesign({
  ...findings,
  userPriority: userChoice,
});
```

---

## Testing Strategies

### Unit Testing Each Micro-Skill

```javascript
describe('pwrl-plan-scope: Scope Extraction', () => {
  it('should parse task input correctly', () => {
    const input = 'Add email validation';
    const result = extractScope(input);

    assert(result.problem_frame);
    assert(result.success_criteria);
  });

  it('should handle edge cases', () => {
    // Empty input
    assert.throws(() => extractScope(''));

    // Very long input
    const longInput = 'x'.repeat(2000);
    const result = extractScope(longInput);
    assert(result);
  });

  it('should detect existing plans', () => {
    // Mock filesystem
    mockFs({ 'docs/plans/2026-06-01-001.md': 'existing' });

    const result = extractScope('validation');
    assert(result.existing_plan);
  });
});
```

### Integration Testing Orchestration

```javascript
describe('Plan Workflow Orchestration', () => {
  it('should execute full flow: scope → research → design → generate', async () => {
    // Start with user input
    const scope = await phaseScope('Add validation');
    assert(scope.id);

    // Pass to research
    const research = await phaseResearch(scope);
    assert(research.patterns);

    // Pass to design
    const design = await phaseDesign(research);
    assert(design.units);

    // Generate final artifact
    const plan = await phaseGenerate(design);
    assert(plan.path); // File written
  });

  it('should recover from phase resumption', async () => {
    // Load existing plan from disk
    const existing = await loadArtifact('2026-06-12-001-design.md');

    // Jump to final phase
    const plan = await phaseGenerate(existing);
    assert(plan);
  });
});
```

### Performance Testing

```javascript
describe('Performance Benchmarks', () => {
  it('should complete plan workflow in <2 minutes', async () => {
    const start = Date.now();

    const result = await executeWorkflow('Add feature');

    const duration = Date.now() - start;
    assert(duration < 2 * 60 * 1000, `Took ${duration}ms`);
  });

  it('should scale linearly with task size', () => {
    const results = [10, 50, 100].map(size => {
      const start = Date.now();
      executeWorkflow('x'.repeat(size));
      return Date.now() - start;
    });

    // Time should scale roughly linearly
    const ratio = results[1] / results[0];
    assert(ratio < 6, 'Should scale linearly');
  });
});
```

---

## Best Practices

### ✅ DO

- Keep phases focused on single responsibility
- Use shared utilities (lib/errors, lib/artifact-io)
- Validate input at phase boundaries
- Test each micro-skill independently
- Document artifact contracts
- Version artifact formats
- Provide user choice points where needed
- Use consistent error codes

### ❌ DON'T

- Mix concerns across phases
- Duplicate error handling logic
- Skip input validation
- Hard-code file paths
- Branch based on conditions (use separate workflows)
- Forget artifact lineage tracking
- Skip testing for "simple" phases
- Make breaking changes to artifact formats

---

## Reference Implementations

For working examples, see:

- **pwrl-plan** - Planning workflow (4 phases)
- **pwrl-work** - Work execution (5 phases)
- **pwrl-review** - Code review (4 phases)
- **pwrl-learnings** - Knowledge management (5 phases)

Each includes full SKILL.md documentation and comprehensive tests.
