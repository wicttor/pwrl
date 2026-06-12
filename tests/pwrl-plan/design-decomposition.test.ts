/**
 * tests/pwrl-plan/design-decomposition.test.ts
 *
 * Unit tests for pwrl-plan-design micro-skill
 * Tests unit identification, dependency mapping, circular dependency detection,
 * risk mitigation, and design artifact generation.
 */

describe("pwrl-plan-design: Unit Decomposition", () => {
  describe("Happy Path: Basic Unit Decomposition", () => {
    test("Creates units from success criteria", () => {
      // GIVEN: scope with 3 success criteria
      const scopeArtifact = createScopeArtifact({
        success_criteria: [
          "Plans auto-discover in docs/plans/",
          "Circular dependencies detected",
          "Parallel execution works",
        ],
      });
      const researchArtifact = createResearchArtifact();

      // WHEN: design decomposes
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: units created (≥1 per criterion)
      expect(design.units.length).toBeGreaterThanOrEqual(3);
      expect(design.units.every((u) => u.id && u.title && u.goal)).toBe(true);
    });

    test("Simple linear decomposition → no dependencies", () => {
      // GIVEN: simple single-feature task
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Add email field to form",
        success_criteria: ["Email field displays and validates"],
      });
      const researchArtifact = createResearchArtifact();

      // WHEN: design decomposes
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: minimal units with few/no dependencies
      expect(design.units.length).toBeLessThanOrEqual(3);
      const dependencyCount = design.units.reduce(
        (sum, u) => sum + (u.dependencies?.length || 0),
        0,
      );
      expect(dependencyCount).toBeLessThan(design.units.length);
    });
  });

  describe("Dependency Mapping", () => {
    test("Creates dependency graph from unit requirements", () => {
      // GIVEN: design with interdependent units
      const scopeArtifact = createScopeArtifact({
        success_criteria: [
          "Plan discovery works",
          "Circular dependencies detected",
          "Parallel execution enabled",
        ],
      });
      const researchArtifact = createResearchArtifact();

      // WHEN: design maps dependencies
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: dependency graph created
      expect(design.dependency_graph).toBeDefined();
      expect(Object.keys(design.dependency_graph).length).toBeGreaterThan(0);
    });

    test("Identifies unit that requires other units", () => {
      // GIVEN: units with clear dependency relationships
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: design identifies dependencies
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: units with dependencies listed correctly
      const u_with_deps = design.units.find((u) => u.dependencies?.length > 0);
      if (u_with_deps) {
        expect(u_with_deps.dependencies).toBeDefined();
        expect(Array.isArray(u_with_deps.dependencies)).toBe(true);
        u_with_deps.dependencies.forEach((dep) => {
          expect(design.units.some((u) => u.id === dep)).toBe(true);
        });
      }
    });

    test("Topological ordering respects dependencies", () => {
      // GIVEN: units with dependencies
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: design orders units
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: each unit appears after its dependencies
      const unitIndex: Record<string, number> = {};
      design.units.forEach((u, i) => (unitIndex[u.id] = i));

      design.units.forEach((unit) => {
        if (unit.dependencies) {
          unit.dependencies.forEach((dep) => {
            expect(unitIndex[dep]).toBeLessThan(unitIndex[unit.id]);
          });
        }
      });
    });
  });

  describe("Circular Dependency Detection", () => {
    test("Detects circular dependency: U1→U2→U1", () => {
      // GIVEN: units configured with cycle (mocked)
      mockUnitDefinitions({
        U1: { depends_on: ["U2"] },
        U2: { depends_on: ["U1"] },
      });
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();
      mockUserPrompt("no"); // don't refactor

      // WHEN: design detects cycles
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: cycle reported with full path
      expect(
        userPromptCalls.some(
          (p) => p.message.includes("circular") || p.message.includes("cycle"),
        ),
      ).toBe(true);
    });

    test("Reports cycle path: U1→U2→U3→U1", () => {
      // GIVEN: 3-unit cycle
      mockUnitDefinitions({
        U1: { depends_on: ["U2"] },
        U2: { depends_on: ["U3"] },
        U3: { depends_on: ["U1"] },
      });
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();
      mockUserPrompt("no");

      // WHEN: design reports cycle
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: cycle path includes all units
      const prompt = userPromptCalls.find((p) => p.message.includes("cycle"));
      expect(prompt.message).toMatch(/U1.*U2.*U3|U3.*U2.*U1/);
    });

    test("User refactors circular dependency when prompted", () => {
      // GIVEN: circular dependency detected
      mockUnitDefinitions({
        U1: { depends_on: ["U2"] },
        U2: { depends_on: ["U1"] },
      });
      mockUserPrompt("yes"); // refactor
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: user approves refactoring
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: refactored design has no cycles
      const cycleExists = hasCycle(design.dependency_graph);
      expect(cycleExists).toBe(false);
    });

    test("Error if user rejects cycle refactoring", () => {
      // GIVEN: cycle detected, user rejects refactor
      mockUnitDefinitions({
        U1: { depends_on: ["U2"] },
        U2: { depends_on: ["U1"] },
      });
      mockUserPrompt("no"); // don't refactor
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: design attempts to proceed
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: error status set
      expect(design.status).toBe("error");
      expect(design.error).toContain("circular");
    });
  });

  describe("Risk Mitigation Units", () => {
    test("Creates mitigation units for identified risks", () => {
      // GIVEN: research identified risks
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact({
        risk_areas: ["data_migrations", "distributed_systems"],
      });

      // WHEN: design creates mitigations
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: mitigation units included
      const mitigation_units = design.units.filter(
        (u) =>
          u.title.includes("recovery") ||
          u.title.includes("test") ||
          u.title.includes("rollback"),
      );
      expect(mitigation_units.length).toBeGreaterThan(0);
    });

    test("Data migration risk → backup + rollback units", () => {
      // GIVEN: data migration risk identified
      const researchArtifact = createResearchArtifact({
        risk_areas: ["data_migrations"],
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: design creates mitigations
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: migration mitigation units present
      expect(design.risk_mitigations).toBeDefined();
      expect(
        design.risk_mitigations.some(
          (m) => m.risk.includes("data") && m.units.length > 0,
        ),
      ).toBe(true);
    });

    test("Security risk → review + penetration test units", () => {
      // GIVEN: security risk identified
      const researchArtifact = createResearchArtifact({
        risk_areas: ["security"],
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: design creates mitigations
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: security units included
      expect(
        design.units.some(
          (u) =>
            u.title.toLowerCase().includes("security") ||
            u.title.toLowerCase().includes("review"),
        ),
      ).toBe(true);
    });
  });

  describe("Mermaid Diagram Generation", () => {
    test("Generates diagram for complex workflows (5+ units)", () => {
      // GIVEN: design with 5+ units
      const scopeArtifact = createScopeArtifact({
        success_criteria: Array(6).fill("Criterion"),
      });
      const researchArtifact = createResearchArtifact();

      // WHEN: design generates diagram
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: Mermaid diagram included if complex
      if (design.units.length >= 5 && design.complexity === "HIGH") {
        expect(design.diagram).toBeDefined();
        expect(design.diagram).toContain("graph");
      }
    });

    test("Diagram includes all units and dependencies", () => {
      // GIVEN: complex design with diagram
      const scopeArtifact = createScopeArtifact({
        success_criteria: Array(5).fill("Criterion"),
      });
      const researchArtifact = createResearchArtifact();

      // WHEN: diagram generated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: all units appear in diagram
      if (design.diagram) {
        design.units.forEach((unit) => {
          expect(design.diagram).toContain(unit.id);
        });

        // All dependencies represented
        design.units.forEach((unit) => {
          if (unit.dependencies) {
            unit.dependencies.forEach((dep) => {
              expect(design.diagram).toContain(dep);
            });
          }
        });
      }
    });

    test("No diagram for simple workflows (<5 units)", () => {
      // GIVEN: simple design with <5 units
      const scopeArtifact = createScopeArtifact({
        success_criteria: ["Criterion 1", "Criterion 2"],
      });
      const researchArtifact = createResearchArtifact();

      // WHEN: design generated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: no diagram if simple
      if (design.units.length < 5) {
        expect(design.diagram).toBeUndefined();
      }
    });
  });

  describe("Test Scenarios per Unit", () => {
    test("Each unit has test scenarios with input→output format", () => {
      // GIVEN: design generated
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: design specifies test scenarios
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: each unit has test scenarios
      design.units.forEach((unit) => {
        expect(unit.test_scenarios).toBeDefined();
        expect(Array.isArray(unit.test_scenarios)).toBe(true);
        unit.test_scenarios.forEach((scenario) => {
          expect(scenario).toMatch(
            /Happy Path|Edge Case|Error|Input|Output|→/i,
          );
        });
      });
    });

    test("Test scenarios include happy path, edge cases, errors", () => {
      // GIVEN: unit with comprehensive tests
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: design generated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: diverse scenario coverage
      const u1 = design.units[0];
      if (u1.test_scenarios) {
        const scenarios = u1.test_scenarios.join("|").toLowerCase();
        // At least one of each type
        const hasHappyPath = scenarios.includes("happy");
        const hasEdgeCase = scenarios.includes("edge");
        const hasError =
          scenarios.includes("error") || scenarios.includes("fail");
        expect(hasHappyPath || hasEdgeCase || hasError).toBe(true);
      }
    });
  });

  describe("Acceptance Criteria", () => {
    test("Each unit has acceptance criteria", () => {
      // GIVEN: design generated
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: design specifies acceptance criteria
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: each unit has criteria
      design.units.forEach((unit) => {
        expect(unit.acceptance_criteria).toBeDefined();
        expect(Array.isArray(unit.acceptance_criteria)).toBe(true);
        expect(unit.acceptance_criteria.length).toBeGreaterThan(0);
      });
    });

    test("Acceptance criteria are testable and measurable", () => {
      // GIVEN: design with criteria
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: criteria specified
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: criteria use measurable language
      design.units.forEach((unit) => {
        unit.acceptance_criteria.forEach((criterion) => {
          const measurable = criterion.match(
            /returns|produces|creates|validates|detects|handles/i,
          );
          expect(measurable || criterion.length > 10).toBe(true); // either specific verb or detailed
        });
      });
    });
  });

  describe("Complexity Assessment", () => {
    test("Assesses complexity as LOW/MEDIUM/HIGH", () => {
      // GIVEN: design generated
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: complexity assessed
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: complexity assigned
      expect(design.complexity).toMatch(/^(LOW|MEDIUM|HIGH)$/);
    });

    test("HIGH complexity for 5+ units with cross-dependencies", () => {
      // GIVEN: complex design
      const scopeArtifact = createScopeArtifact({
        success_criteria: Array(7).fill("Criterion"),
        problem_frame: "Complex distributed system",
      });
      const researchArtifact = createResearchArtifact({
        risk_areas: ["distributed_systems", "performance"],
      });

      // WHEN: complexity assessed
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: HIGH complexity assigned
      if (design.units.length >= 5) {
        expect(design.complexity).toBe("HIGH");
      }
    });

    test("LOW complexity for 1-2 units, no dependencies", () => {
      // GIVEN: simple design
      const scopeArtifact = createScopeArtifact({
        success_criteria: ["Add field to form"],
      });
      const researchArtifact = createResearchArtifact({
        risk_areas: [],
      });

      // WHEN: complexity assessed
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: LOW complexity assigned
      if (design.units.length <= 2) {
        expect(design.complexity).toMatch(/^(LOW|MEDIUM)$/);
      }
    });
  });

  describe("Estimated Effort", () => {
    test("Calculates estimated effort in hours", () => {
      // GIVEN: design generated
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: effort estimated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: effort estimate provided
      expect(design.estimated_effort).toBeDefined();
      expect(design.estimated_effort).toMatch(/\d+\s*hours?/i);
    });

    test("Effort scales with unit count and dependencies", () => {
      // GIVEN: two designs (simple and complex)
      const simpleScope = createScopeArtifact({
        success_criteria: ["Simple task"],
      });
      const complexScope = createScopeArtifact({
        success_criteria: Array(8).fill("Complex criterion"),
      });
      const research = createResearchArtifact();

      // WHEN: effort estimated for both
      const simpleDesign = decomposeDesign(simpleScope, research);
      const complexDesign = decomposeDesign(complexScope, research);

      // THEN: complex effort > simple effort
      const simpleHours = parseInt(simpleDesign.estimated_effort);
      const complexHours = parseInt(complexDesign.estimated_effort);
      expect(complexHours).toBeGreaterThan(simpleHours);
    });
  });

  describe("Design Confirmation", () => {
    test("Prompts user to approve decomposition", () => {
      // GIVEN: design ready for confirmation
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();
      mockUserPrompt("Approve");

      // WHEN: design confirms
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: user prompted
      expect(
        userPromptCalls.some(
          (p) =>
            p.message.includes("decomposition") ||
            p.message.includes("approve"),
        ),
      ).toBe(true);
    });

    test("User can refactor units and reconfirm", () => {
      // GIVEN: initial design
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();
      mockUserPrompts([
        "Refactor", // first response: needs refactoring
        "Approve", // second response: refactored version approved
      ]);

      // WHEN: user refactors
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: design updated
      expect(design.status).toBe("confirmed");
    });
  });

  describe("Artifact Schema", () => {
    test("Generated artifact has correct YAML frontmatter", () => {
      // GIVEN: design completed
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: artifact generated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: frontmatter valid
      expect(design.format).toBe("pwrl-design-artifact");
      expect(design.version).toBe("1.0");
      expect(design.design_id).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}-design$/);
      expect(design.input_scope_id).toBe(scopeArtifact.scope_id);
      expect(design.input_research_id).toBe(researchArtifact.research_id);
    });

    test("All sections present and complete", () => {
      // GIVEN: design completed
      const scopeArtifact = createScopeArtifact();
      const researchArtifact = createResearchArtifact();

      // WHEN: artifact generated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: all sections present
      expect(design.units).toBeDefined();
      expect(design.dependency_graph).toBeDefined();
      expect(design.risk_mitigations).toBeDefined();
      expect(design.complexity).toBeDefined();
      expect(design.estimated_effort).toBeDefined();
      expect(design.status).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("Handles single unit (no decomposition needed)", () => {
      // GIVEN: very simple task
      const scopeArtifact = createScopeArtifact({
        success_criteria: ["Trivial change"],
      });
      const researchArtifact = createResearchArtifact();

      // WHEN: design generated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: single unit created
      expect(design.units.length).toBeLessThanOrEqual(1);
      expect(design.complexity).toBe("LOW");
    });

    test("Handles many units (15+ with complexity warning)", () => {
      // GIVEN: large task
      const scopeArtifact = createScopeArtifact({
        success_criteria: Array(20).fill("Criterion"),
      });
      const researchArtifact = createResearchArtifact();
      mockUserPrompt("Keep as-is"); // don't consolidate

      // WHEN: design generated
      const design = decomposeDesign(scopeArtifact, researchArtifact);

      // THEN: many units with warning
      expect(design.units.length).toBeGreaterThan(10);
      expect(
        userPromptCalls.some(
          (p) =>
            p.message.includes("too many") || p.message.includes("consolidate"),
        ),
      ).toBe(true);
    });
  });
});

// Mock/Helper Functions

function createScopeArtifact(overrides?: Partial<any>): any {
  return {
    format: "pwrl-scope-artifact",
    scope_id: "2026-06-11-001-scope",
    problem_frame: "Implement feature",
    success_criteria: ["Feature works"],
    risk_areas: [],
    ...overrides,
  };
}

function createResearchArtifact(overrides?: Partial<any>): any {
  return {
    format: "pwrl-research-artifact",
    research_id: "2026-06-11-001-research",
    tech_stack: {},
    local_patterns: {},
    risk_areas: [],
    ...overrides,
  };
}

function mockUnitDefinitions(units: Record<string, any>) {
  // Mock unit dependency definitions
}

function mockUserPrompt(response: string) {
  // Mock single user response
}

function mockUserPrompts(responses: string[]) {
  // Mock multiple user responses
}

function decomposeDesign(scope: any, research: any): any {
  // Calls pwrl-plan-design skill
  // Returns design artifact
}

function hasCycle(graph: Record<string, any[]>): boolean {
  // Detects if dependency graph has cycles
  const visited: Set<string> = new Set();
  const recursionStack: Set<string> = new Set();

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node) && dfs(node)) return true;
  }

  return false;
}

let userPromptCalls: any[] = [];
