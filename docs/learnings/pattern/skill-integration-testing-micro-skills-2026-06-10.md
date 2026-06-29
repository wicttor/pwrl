---
title: Skill Integration Testing Pattern for Micro-Skills
timestamp: 2026-06-10
category: pattern
type: PWRL Learning
tags:
  - testing
  - micro-skills
  - integration-tests
  - decomposition
  - validation
severity: high
---

# Skill Integration Testing Pattern for Micro-Skills

## What It Is

A testing pattern for validating micro-skill decompositions by:
1. Testing each skill independently for structure, schema, and documentation completeness
2. Testing cross-skill references and state-passing contracts
3. Validating orchestrator agent configuration and error handling
4. Confirming fallback monolithic path works when agent unavailable
5. Verifying all example workflows are present and documented

Combines unit tests (per-skill validation) with integration tests (cross-skill contracts) to catch decomposition issues early.

## Why It Matters

When decomposing a monolithic skill into 6+ micro-skills, state-passing contracts and orchestration logic become fragile:

**Without integration tests:**
- Skills may have mismatched Input/Output schemas
- Cross-skill references may break silently
- Fallback path may become stale as micro-skills evolve
- Example workflows become out-of-date

**With integration tests:**
- Catch schema mismatches automatically (during CI)
- Validate cross-skill dependencies (references and state)
- Ensure fallback path still works
- Validate example documentation completeness

## Pattern

### Structure

```
tests/
├── [skill-name]/
│   └── skills.test.js           # Per-skill validation
│       ├── File existence (SKILL.md)
│       ├── Frontmatter validation (YAML)
│       ├── Required sections (Input, Output, Workflow, Error, Dependencies)
│       ├── Content validation (logic, states, modes)
│       └── Reference validation (linked files exist)
├── cross-skill-tests/
│   └── integration.test.js        # Cross-skill contracts
│       ├── Schema matching (Input of N+1 matches Output of N)
│       ├── Reference validation (skills reference each other)
│       ├── State passing (context evolves predictably)
│       └── Agent configuration (references all micro-skills)
└── examples/
    └── examples.test.js           # Documentation completeness
        ├── Example workflow files exist
        ├── Example file paths are valid
        └── Agent/skill references in examples are accurate
```

### Test Checklist per Skill

For each micro-skill, validate:

- ✅ **File presence**: SKILL.md exists at correct path
- ✅ **YAML frontmatter**: Valid frontmatter with name, description, argument-hint
- ✅ **Input section**: Clearly defined schema with required/optional fields
- ✅ **Output section**: Clearly defined schema with example YAML
- ✅ **Workflow section**: Step-by-step procedures with clear entry/exit points
- ✅ **Error handling**: Table of error scenarios with recovery strategies
- ✅ **Dependencies**: Lists upstream and downstream skills
- ✅ **References**: Links to supporting docs, related files
- ✅ **Content validation**: Checks for required execution modes, quality gates, etc. (skill-specific)

### Cross-Skill Integration Tests

After per-skill validation, test:

- ✅ **Schema contracts**: Output of skill N matches Input of skill N+1
- ✅ **State passing**: Context object evolves predictably through pipeline
- ✅ **Reference integrity**: Skills reference each other correctly
- ✅ **Orchestrator config**: Agent references all micro-skills in correct order
- ✅ **Fallback detection**: Main skill has agent detection and fallback logic
- ✅ **Error scenarios**: Agent handles missing skills, timeouts, failures

### Example Workflow Tests

- ✅ **Example files exist**: Documentation in docs/examples/ is present
- ✅ **Path validity**: Example references are resolvable (files exist)
- ✅ **Correctness**: Examples use correct skill names, arguments, flags

## Benefits

**Early Detection**: Catch breaking changes before merging
**Contract Validation**: Schemas stay in sync across skills
**Documentation**: Enforces complete documentation for every skill
**CI/CD Ready**: Tests run automatically on every commit
**Low Friction**: Unit tests are simple assertions, fast to run
**Maintainability**: Future refactoring can reference test coverage

## Applied Example: pwrl-work Decomposition

**Scenario**: Decomposed `pwrl-work` (1 monolithic skill) into 6 micro-skills + 1 orchestrator agent.

**Tests Created**:
- 5 tests per micro-skill (47 total)
- 2 cross-skill tests (references, state contracts)
- 3 example workflow tests
- Total: 82 tests, ~100-120ms to run

**Issues Caught**:
- Inconsistent field naming (unitId vs unit-id in output examples)
- Missing mocking guidance for external GitHub CLI dependency
- Undefined fallback behavior in parallel mode

**Result**: 83/83 tests passing after fixes applied

## Tradeoffs

**Pros**:
- Catches schema/reference mismatches automatically
- Validates documentation completeness
- Tests are simple, fast, and maintainable
- Can run on every commit (CI-friendly)
- Scales well as more micro-skills are added

**Cons**:
- Doesn't test actual execution (skill behavior)
- Schema validation is structural, not semantic
- Example tests are brittle (example paths can break easily)
- Requires discipline to keep tests in sync with skill changes

**When to use**:
- Decomposing monolithic skills (3+ phases)
- Multiple micro-skills with orchestration
- Need for documented state contracts between phases
- Plan to support multiple orchestration patterns

**When not needed**:
- Single simple skills (no decomposition)
- External dependencies (test actual execution instead)
- One-off scripts (documentation may not be critical)

## Related Learnings

- `docs/learnings/pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — Foundation: when and how to decompose
- `docs/learnings/decision/code-review-fixes-validation-2026-06-10.md` — Code review fixes: P2 issues caught during integration testing
- `docs/learnings/pattern/state-schema-workflow-context-2026-06-05.md` — How state flows through phases (basis for contract tests)

## Implementation Checklist

- [ ] Create `tests/[skill-project]/skills.test.js` for per-skill validation
- [ ] Define test checklist covering: file presence, frontmatter, sections, content
- [ ] Create cross-skill tests in `tests/cross-skill-tests/integration.test.js`
- [ ] Validate Input/Output schema contracts between skills
- [ ] Add example workflow tests in `tests/examples/examples.test.js`
- [ ] Run tests on every commit (add to CI pipeline)
- [ ] Document test coverage in project README
- [ ] Update tests when adding new micro-skills or changing contracts
