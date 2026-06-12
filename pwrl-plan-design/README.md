# pwrl-plan-design — Unit Decomposition Micro-Skill

**Status:** Phase 1, Unit 3 (U1.3)
**Version:** 1.0
**Role:** Third phase of pwrl-plan orchestrator

## Overview

`pwrl-plan-design` decomposes work into concrete implementation units, maps dependencies, detects cycles, and assesses complexity. It transforms research findings into actionable work breakdown.

**Purpose:** Create a detailed design with implementation units (U1, U2, ..., UX), dependency graph, risk mitigations, and complexity assessment.

## Workflow

### Input

- Scope artifact from pwrl-plan-scope
- Research artifact from pwrl-plan-research

### Processing

**Step 1: Identify Implementation Units**

- From success criteria: one unit per criterion, or group related criteria
- From risk areas: one unit per HIGH-risk mitigation
- From tech research: additional units for foundational work (setup, infrastructure, testing)
- From learnings: units addressing learning gaps
- Create 1-15 units (not >20, too complex)
- For each unit:
  - ID: U1, U2, ..., UX
  - Title: Clear, actionable title
  - Goal: What this unit accomplishes
  - Files: create (new), modify (existing), test (test files)
  - Approach: How to implement (bullets, not pseudocode)
  - Acceptance criteria: 2-4 specific conditions
  - Test scenarios: 3-5 scenarios (happy path, edge cases, errors)

**Step 2: Map Dependencies**

- For each unit, list which units it depends on
- Draw dependency graph as JSON/YAML adjacency list
- Example:
  ```
  U1 (setup) → U2, U3
  U2 (model) → U4, U5
  U3 (UI) → U4
  U4 (validation) → none
  U5 (API) → none
  ```

**Step 3: Detect Circular Dependencies**

- Use DFS (Depth-First Search) to find cycles
- If cycle found: report cycle path (e.g., U1→U2→U3→U1)
- Prompt user to refactor: split units, remove dependency, or change approach
- Don't proceed until cycles resolved

**Step 4: Topological Sort**

- Sort units so dependencies come first
- Execution order: U1, U4, U5, U2, U3 (for example above)
- This is the recommended implementation sequence

**Step 5: Create Risk Mitigation Units**

- For each HIGH-risk area from research:
  - Create unit to mitigate (testing, documentation, safety checks)
  - Example: "Email enumeration risk" → U8: "Implement generic error messages"
- Insert into unit list and re-sort

**Step 6: Generate Mermaid Diagrams** (if 5+ units)

- Create dependency graph diagram
- Show unit relationships visually
- Helps user understand complexity

**Step 7: Assess Complexity**

- Count units: 1-3 = LOW, 4-8 = MEDIUM, 9+ = HIGH
- Assess connections: few = LOW, some = MEDIUM, many = HIGH
- Estimate effort: LOW = <5h, MEDIUM = 5-20h, HIGH = 20+h
- Output: complexity level (LOW/MEDIUM/HIGH)

**Step 8: User Confirmation**

- Show decomposition, dependencies, complexity assessment
- Ask: "Is this decomposition correct?"
- If no: go back to step 1 and refactor
- If yes: generate design artifact

### Output

**Design Artifact** (YAML frontmatter + units):

```yaml
---
format: pwrl-design-artifact
version: "1.0"
design_id: "2026-06-11-003-design"
created_date: "2026-06-11"
created_by: pwrl-plan-design
input_scope_id: "2026-06-11-001-scope"
input_research_id: "2026-06-11-002-research"
complexity: "MEDIUM"
estimated_effort: "15 hours"
unit_count: 6
---

# Implementation Units

## U1: Setup & Infrastructure
**Goal:** Set up project structure and build pipeline
**Files:**
  - create: src/validators/email.ts, tests/email.test.ts
  - modify: package.json, jest.config.js
  - test: All validators
**Approach:**
  - Create validators directory
  - Add email validation module
  - Add test utilities
**Acceptance Criteria:**
  - Email validator module loads
  - Tests pass and show in coverage
**Test Scenarios:**
  - Valid email accepted
  - Invalid email rejected
  - Edge cases (+ syntax, internationalized domains)

## U2: Core Validation Logic
**Goal:** Implement RFC 5322-compliant email validation
**Dependencies:** U1
**Files:**
  - modify: src/validators/email.ts
  - modify: tests/email.test.ts
**Approach:**
  - Implement regex from RFC 5322 or use library
  - Handle internationalized emails
  - Add performance optimization
**Acceptance Criteria:**
  - All standard emails validated correctly
  - Performance: <5ms per validation
**Test Scenarios:**
  - Standard emails (name@domain.com)
  - Plus syntax (name+tag@domain.com)
  - Internationalized domains
  - Performance test (1000 validations)

...

# Dependency Graph
U1 → U2, U3, U4
U2 → U5
U3 → U5
U4 → none
U5 → none

Execution Order: U1, U4, U2, U3, U5
```

## Error Handling

| Error                        | Recovery                                     |
| ---------------------------- | -------------------------------------------- |
| Circular dependency detected | Report cycle path; prompt user to refactor   |
| Too many units (15+)         | Warn about complexity; suggest consolidation |
| Insufficient detail in unit  | Prompt to add test scenarios or split unit   |
| Missing dependencies         | Ask user to clarify dependencies             |
| User rejects decomposition   | Return to step 1; refactor with user input   |

## Testing

**Test Coverage:** 35+ tests in [tests/pwrl-plan/design-decomposition.test.ts](../../tests/pwrl-plan/design-decomposition.test.ts)

**Test Suites:**

- Unit identification (from criteria, risks, tech)
- Dependency mapping (complete, consistent)
- Cycle detection (DFS correctness, path reporting)
- Topological sort (correct order)
- Risk mitigation units (created for HIGH risks)
- Mermaid diagram generation (valid syntax)
- Complexity assessment (LOW/MEDIUM/HIGH)
- Effort estimation (hours accuracy)
- Confirmation prompts (user acceptance)
- Artifact schema validation (YAML correctness)
- Edge cases (0 units, 1 unit, 20+ units, complex cycles)

## Protocol Documentation

**Detailed Workflow:** [unit-decomposition-algorithm.md](references/unit-decomposition-algorithm.md)

Covers:

- 7 processing steps with detailed pseudocode
- DFS algorithm for cycle detection (with path reporting)
- Topological sort algorithm
- Mermaid diagram generation
- Complexity heuristics
- Output artifact schema
- Testing strategy (GIVEN-WHEN-THEN format)

## Example

**Input:**

```yaml
scope_id: "2026-06-11-003-email-validation"
success_criteria:
  - "Email validation works"
  - "Invalid emails show error"
research_id: "2026-06-11-002-research"
tech_stack: "TypeScript + Express"
risk_areas:
  - "Email enumeration attack (HIGH)"
  - "Regex performance (MEDIUM)"
```

**Processing:**

1. Identify units from criteria + risks:
   - U1: Setup validators
   - U2: Core validation logic
   - U3: Error handling UI
   - U4: Email enumeration mitigation
   - U5: Performance testing
2. Map dependencies:
   - U1 → U2, U3, U4, U5
   - U2 → (none)
3. No cycles detected ✓
4. Topological order: U1, U2, U3, U4, U5
5. Add risk units: U4 already covers enumeration
6. Mermaid diagram (5 units):
   ```
   U1 → U2
   U1 → U3
   U1 → U4
   U1 → U5
   ```
7. Complexity: 5 units, few connections → MEDIUM
8. Estimate: 15 hours

**Output:**

```yaml
design_id: "2026-06-11-003-design"
complexity: "MEDIUM"
estimated_effort: "15 hours"
unit_count: 5
```

## Key Features

- **Concrete Units:** Each unit has files, approach, acceptance criteria
- **Dependency Awareness:** Maps and validates dependencies
- **Cycle Detection:** Prevents impossible work sequences
- **Risk-Aware:** Creates mitigation units for HIGH-risk areas
- **Complexity Assessment:** Helps choose planning tier
- **Visualizations:** Mermaid diagrams for complex designs

## Usage

**Direct Call:**

```
/pwrl-plan-design [scope_artifact] [research_artifact]
```

**Via Orchestrator:**

```
/pwrl-plan [task description]
```

(Orchestrator calls pwrl-plan-design after pwrl-plan-research)

## Related Skills

- **Previous Phase:** [pwrl-plan-research](../pwrl-plan-research/SKILL.md) (produces input)
- **Next Phase:** [pwrl-plan-generate](../pwrl-plan-generate/SKILL.md) (consumes output)
- **Orchestrator:** [pwrl-plan](../pwrl-plan/SKILL.md)
- **Reused By:** [pwrl-work](../pwrl-work/SKILL.md) (for unit execution)

## FAQs

**Q: How many units should I have?**

A: Typically 4-8 for STANDARD plans. Too few (1-2) lacks detail; too many (15+) is too complex. Aim for units that take 1-4 hours each.

**Q: What if I find a circular dependency?**

A: That means the decomposition needs refactoring. Either split units, remove a dependency, or change approach. The design phase is where to catch this.

**Q: Should every unit have the same effort?**

A: No, units can vary (U1 might be 1 hour, U2 might be 4 hours). But extreme variance suggests decomposition needs refinement.

**Q: Can I add units later during execution?**

A: Yes, during pwrl-work execution. But better to identify them now during planning.

**Q: What's the difference between "dependencies" and "approach"?**

A: Dependencies = which units must finish first. Approach = how to implement this specific unit.

---

**Version:** 1.0 (pure skill, no agent routing)
**Last Updated:** 2026-06-11
**Protocol:** [unit-decomposition-algorithm.md](references/unit-decomposition-algorithm.md)
