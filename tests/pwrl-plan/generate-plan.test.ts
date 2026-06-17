/**
 * tests/pwrl-plan/generate-plan.test.ts
 *
 * Unit tests for pwrl-plan-generate micro-skill
 * Tests tier selection, template rendering, learnings embedding,
 * filename generation, and file persistence.
 */

describe("pwrl-plan-generate: Plan Generation & Rendering", () => {
  describe("Tier Selection Algorithm", () => {
    test("AUTO: LOW complexity, 3 units, 5h → FAST tier", () => {
      // GIVEN: simple design
      const design = createDesignArtifact({
        complexity: "LOW",
        units: Array(3).fill(createUnit()),
        estimated_effort: "5 hours",
      });

      // WHEN: tier selected
      const plan = generatePlan(design);

      // THEN: FAST tier assigned
      expect(plan.tier).toBe("FAST");
    });

    test("AUTO: MEDIUM complexity, 6 units, 15h → STANDARD tier", () => {
      // GIVEN: medium design
      const design = createDesignArtifact({
        complexity: "MEDIUM",
        units: Array(6).fill(createUnit()),
        estimated_effort: "15 hours",
      });

      // WHEN: tier selected
      const plan = generatePlan(design);

      // THEN: STANDARD tier assigned
      expect(plan.tier).toBe("STANDARD");
    });

    test("AUTO: HIGH complexity, 10 units, 40h → DEEP tier", () => {
      // GIVEN: complex design
      const design = createDesignArtifact({
        complexity: "HIGH",
        units: Array(10).fill(createUnit()),
        estimated_effort: "40 hours",
      });

      // WHEN: tier selected
      const plan = generatePlan(design);

      // THEN: DEEP tier assigned
      expect(plan.tier).toBe("DEEP");
    });

    test("Prompts user when tier selection ambiguous", () => {
      // GIVEN: borderline design
      const design = createDesignArtifact({
        complexity: "MEDIUM",
        units: Array(8).fill(createUnit()),
        estimated_effort: "18 hours", // between STANDARD and DEEP
      });
      mockUserPrompt("Standard");

      // WHEN: tier selection attempted
      const plan = generatePlan(design);

      // THEN: user prompted
      expect(
        userPromptCalls.some(
          (p) =>
            p.message.includes("tier") &&
            p.message.includes("Fast|Standard|Deep"),
        ),
      ).toBe(true);
    });

    test("User can override auto-selected tier", () => {
      // GIVEN: FAST-tier design
      const design = createDesignArtifact({
        complexity: "LOW",
        units: Array(2).fill(createUnit()),
        estimated_effort: "5 hours",
      });
      mockUserPrompt("Deep"); // user overrides

      // WHEN: tier selected
      const plan = generatePlan(design);

      // THEN: user choice respected
      expect(plan.tier).toBe("Deep");
    });
  });

  describe("Template Rendering", () => {
    test("FAST tier renders minimal sections", () => {
      // GIVEN: FAST-tier design
      const design = createDesignArtifact({ complexity: "LOW" });
      const scope = createScopeArtifact();

      // WHEN: plan rendered
      const plan = generatePlan(design, scope);

      // THEN: FAST sections present
      expect(plan.content).toMatch(/Problem & Scope/i);
      expect(plan.content).toMatch(/Success Criteria/i);
      expect(plan.content).toMatch(/Implementation Units/i);
      // No Risks, Learnings, Rollout in FAST
      expect(plan.content).not.toMatch(/Risk Assessment/i);
    });

    test("STANDARD tier includes risks and learnings", () => {
      // GIVEN: STANDARD-tier design
      const design = createDesignArtifact({ complexity: "MEDIUM" });
      const scope = createScopeArtifact();

      // WHEN: plan rendered
      const plan = generatePlan(design, scope);

      // THEN: STANDARD sections present
      expect(plan.content).toMatch(/Problem & Scope/i);
      expect(plan.content).toMatch(/Technical Design/i);
      expect(plan.content).toMatch(/Implementation Units/i);
      expect(plan.content).toMatch(/Risk Assessment/i);
      expect(plan.content).toMatch(/Related Learnings/i);
      expect(plan.content).toMatch(/Rollout/i);
    });

    test("DEEP tier includes all detailed sections", () => {
      // GIVEN: DEEP-tier design
      const design = createDesignArtifact({ complexity: "HIGH" });
      const scope = createScopeArtifact();

      // WHEN: plan rendered
      const plan = generatePlan(design, scope);

      // THEN: DEEP sections present
      expect(plan.content).toMatch(/Problem & Scope/i);
      expect(plan.content).toMatch(/Technical Design/i);
      expect(plan.content).toMatch(/Architecture Overview/i);
      expect(plan.content).toMatch(/Dependency Graph/i);
      expect(plan.content).toMatch(/Implementation Units/i);
      expect(plan.content).toMatch(/Risk Analysis/i);
      expect(plan.content).toMatch(/Alternative Approaches/i);
      expect(plan.content).toMatch(/Learning Gaps/i);
      expect(plan.content).toMatch(/Operational.*Rollout/i);
    });

    test("All template variables are substituted", () => {
      // GIVEN: design with specific values
      const design = createDesignArtifact({
        units: [
          createUnit({ id: "U1", title: "Unit One" }),
          createUnit({ id: "U2", title: "Unit Two" }),
        ],
      });
      const scope = createScopeArtifact({
        problem_frame: "Test problem frame",
        success_criteria: ["Criterion 1", "Criterion 2"],
      });

      // WHEN: plan rendered
      const plan = generatePlan(design, scope);

      // THEN: no placeholder text remains
      expect(plan.content).toContain("Test problem frame");
      expect(plan.content).toContain("Criterion 1");
      expect(plan.content).toContain("Criterion 2");
      expect(plan.content).toContain("Unit One");
      expect(plan.content).toContain("Unit Two");
      expect(plan.content).not.toMatch(/\[PLACEHOLDER\]|\{.*?\}(?!\d)/);
    });

    test("YAML frontmatter included in rendered plan", () => {
      // GIVEN: design and scope
      const design = createDesignArtifact();
      const scope = createScopeArtifact();

      // WHEN: plan rendered
      const plan = generatePlan(design, scope);

      // THEN: frontmatter present
      expect(plan.content).toMatch(/^---/m);
      expect(plan.content).toContain("format: pwrl-plan-artifact");
      expect(plan.content).toContain('version: "1.0"');
      expect(plan.content).toContain("created-by: pwrl-plan-generate");
    });
  });

  describe("Learnings Embedding", () => {
    test("Embeds top 3-5 HIGH-relevance learnings", () => {
      // GIVEN: scope with 5 HIGH-relevance learnings
      const scope = createScopeArtifact({
        related_learnings: Array(5)
          .fill(null)
          .map((_, i) => ({
            title: `Learning ${i + 1}`,
            path: `docs/learnings/learning-${i + 1}.md`,
            relevance: "HIGH",
            note: `Why relevant ${i + 1}`,
          })),
      });
      const design = createDesignArtifact({ complexity: "MEDIUM" });

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: 3-5 learnings included
      const learningCount = (plan.content.match(/Learning \d+/g) || []).length;
      expect(learningCount).toBeGreaterThanOrEqual(3);
      expect(learningCount).toBeLessThanOrEqual(5);
    });

    test("Orders learnings by relevance (HIGH first)", () => {
      // GIVEN: mixed relevance learnings
      const scope = createScopeArtifact({
        related_learnings: [
          {
            title: "Low Relevance",
            path: "path1",
            relevance: "LOW",
            note: "Low",
          },
          {
            title: "High Relevance 1",
            path: "path2",
            relevance: "HIGH",
            note: "High",
          },
          {
            title: "Medium Relevance",
            path: "path3",
            relevance: "MEDIUM",
            note: "Medium",
          },
          {
            title: "High Relevance 2",
            path: "path4",
            relevance: "HIGH",
            note: "High",
          },
        ],
      });
      const design = createDesignArtifact({ complexity: "MEDIUM" });

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: HIGH relevance appear first
      const highIndex = plan.content.indexOf("High Relevance 1");
      const mediumIndex = plan.content.indexOf("Medium Relevance");
      expect(highIndex).toBeLessThan(mediumIndex);
    });

    test("Includes applicability note for each learning", () => {
      // GIVEN: scope with learning and note
      const scope = createScopeArtifact({
        related_learnings: [
          {
            title: "Test Learning",
            path: "docs/learnings/test.md",
            relevance: "HIGH",
            note: "Relevant because of XYZ",
          },
        ],
      });
      const design = createDesignArtifact({ complexity: "MEDIUM" });

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: note included
      expect(plan.content).toContain("Relevant because of XYZ");
    });

    test("Gracefully handles no learnings", () => {
      // GIVEN: scope with no learnings
      const scope = createScopeArtifact({
        related_learnings: [],
      });
      const design = createDesignArtifact({ complexity: "STANDARD" });

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: continues without learnings
      expect(plan.content).toBeDefined();
      expect(plan.status).not.toBe("error");
    });
  });

  describe("Filename Generation", () => {
    test("Generates filename in format: YYYY-MM-DD-NNN-slug.md", () => {
      // GIVEN: scope with problem frame
      const scope = createScopeArtifact({
        problem_frame: "Add email validation to signup",
      });
      const design = createDesignArtifact();

      // WHEN: filename generated
      const plan = generatePlan(design, scope);

      // THEN: filename matches pattern
      expect(plan.filename).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}-.*\.md$/);
      expect(plan.filename).toContain("email");
      expect(plan.filename).toContain("validation");
    });

    test("Slugifies special characters in filename", () => {
      // GIVEN: problem frame with special characters
      const scope = createScopeArtifact({
        problem_frame: "Add @email & validation (urgent!)",
      });
      const design = createDesignArtifact();

      // WHEN: filename generated
      const plan = generatePlan(design, scope);

      // THEN: special chars removed/converted
      expect(plan.filename).not.toMatch(/[@&()!]/);
      expect(plan.filename).toMatch(/^[\d\-a-z\.]+$/);
    });

    test("Handles collision: increments sequence number", () => {
      // GIVEN: file already exists for same date/name
      mockFileSystem({
        "docs/plans/2026-06-11-001-test.md": "existing plan",
      });
      const scope = createScopeArtifact({
        problem_frame: "Test",
      });
      const design = createDesignArtifact();
      mockToday("2026-06-11");

      // WHEN: filename generated
      const plan = generatePlan(design, scope);

      // THEN: sequence incremented
      expect(plan.filename).toBe("2026-06-11-002-test.md");
    });

    test("Handles multiple collisions: finds next available sequence", () => {
      // GIVEN: multiple files exist
      mockFileSystem({
        "docs/plans/2026-06-11-001-test.md": "plan1",
        "docs/plans/2026-06-11-002-test.md": "plan2",
        "docs/plans/2026-06-11-003-test.md": "plan3",
      });
      const scope = createScopeArtifact({ problem_frame: "Test" });
      const design = createDesignArtifact();
      mockToday("2026-06-11");

      // WHEN: filename generated
      const plan = generatePlan(design, scope);

      // THEN: uses next available sequence
      expect(plan.filename).toBe("2026-06-11-004-test.md");
    });
  });

  describe("File Persistence", () => {
    test("Saves plan to docs/plans/ with generated filename", () => {
      // GIVEN: design and scope ready
      const scope = createScopeArtifact();
      const design = createDesignArtifact();
      mockFileSystem({});

      // WHEN: plan generated and saved
      const plan = generatePlan(design, scope);

      // THEN: file saved to correct path
      expect(fileSystem["docs/plans/" + plan.filename]).toBeDefined();
      expect(fileSystem["docs/plans/" + plan.filename]).toContain(plan.content);
    });

    test("Confirms save to user with filepath", () => {
      // GIVEN: plan ready
      const scope = createScopeArtifact();
      const design = createDesignArtifact();

      // WHEN: plan saved
      const plan = generatePlan(design, scope);

      // THEN: user confirmation includes filepath
      expect(plan.confirmation).toContain("docs/plans/");
      expect(plan.confirmation).toContain(plan.filename);
    });

    test("Error handling: filename collision with user options", () => {
      // GIVEN: file exists
      mockFileSystem({
        "docs/plans/2026-06-11-001-test.md": "existing",
      });
      mockUserPrompt("Increment"); // user chooses to increment
      const scope = createScopeArtifact({ problem_frame: "Test" });
      const design = createDesignArtifact();
      mockToday("2026-06-11");

      // WHEN: plan attempts save
      const plan = generatePlan(design, scope);

      // THEN: incremented filename used
      expect(plan.filename).toBe("2026-06-11-002-test.md");
      expect(fileSystem["docs/plans/2026-06-11-002-test.md"]).toBeDefined();
    });

    test("Error handling: user can update existing plan", () => {
      // GIVEN: plan exists and user chooses to update
      mockFileSystem({
        "docs/plans/2026-06-11-001-test.md": "old content",
      });
      mockUserPrompt("Update"); // user chooses update
      const scope = createScopeArtifact({ problem_frame: "Test" });
      const design = createDesignArtifact();
      mockToday("2026-06-11");

      // WHEN: plan attempts save
      const plan = generatePlan(design, scope);

      // THEN: file updated
      expect(fileSystem["docs/plans/2026-06-11-001-test.md"]).toBe(
        plan.content,
      );
      expect(plan.confirmation).toContain("updated");
    });
  });

  describe("Artifact Schema", () => {
    test("Generated plan has correct YAML frontmatter", () => {
      // GIVEN: plan generated
      const scope = createScopeArtifact();
      const design = createDesignArtifact();

      // WHEN: artifact created
      const plan = generatePlan(design, scope);

      // THEN: frontmatter valid
      expect(plan.format).toBe("pwrl-plan-artifact");
      expect(plan.version).toBe("1.0");
      expect(plan.plan_id).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}-.*$/);
      expect(plan.input_design_id).toBeDefined();
      expect(plan.input_scope_id).toBeDefined();
      expect(plan.tier).toMatch(/^(FAST|STANDARD|DEEP)$/);
    });

    test("Plan artifact has all required metadata", () => {
      // GIVEN: plan generated
      const scope = createScopeArtifact();
      const design = createDesignArtifact();

      // WHEN: artifact created
      const plan = generatePlan(design, scope);

      // THEN: all metadata present
      expect(plan.format).toBeDefined();
      expect(plan.version).toBeDefined();
      expect(plan.created_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(plan.created_by).toBe("pwrl-plan-generate");
      expect(plan.plan_id).toBeDefined();
      expect(plan.tier).toBeDefined();
      expect(plan.input_design_id).toBeDefined();
      expect(plan.input_scope_id).toBeDefined();
      expect(plan.status).toBe("Ready for Execution");
    });
  });

  describe("Integration with Previous Phases", () => {
    test("Consumes design artifact from U1.3 correctly", () => {
      // GIVEN: design artifact from pwrl-plan-design
      const design = createDesignArtifact({
        format: "pwrl-design-artifact",
        design_id: "2026-06-11-001-design",
      });
      const scope = createScopeArtifact();

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: design artifact consumed
      expect(plan.input_design_id).toBe("2026-06-11-001-design");
      expect(plan.content).toContain("U1"); // units from design
    });

    test("References scope artifact correctly", () => {
      // GIVEN: scope artifact from U1.1
      const scope = createScopeArtifact({
        scope_id: "2026-06-11-001-scope",
        problem_frame: "Integration test",
      });
      const design = createDesignArtifact();

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: scope artifact referenced
      expect(plan.input_scope_id).toBe("2026-06-11-001-scope");
      expect(plan.content).toContain("Integration test");
    });
  });

  describe("Edge Cases", () => {
    test("Handles very long problem frame gracefully", () => {
      // GIVEN: very long problem frame
      const scope = createScopeArtifact({
        problem_frame:
          "This is a very long problem frame that describes a complex system with many considerations and requirements that should fit in filename and not break rendering " +
          "x".repeat(200),
      });
      const design = createDesignArtifact();

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: filename truncated appropriately
      expect(plan.filename.length).toBeLessThan(255);
      expect(plan.content).toContain(scope.problem_frame.substring(0, 50));
    });

    test("Handles no success criteria gracefully", () => {
      // GIVEN: scope with empty success criteria
      const scope = createScopeArtifact({
        success_criteria: [],
      });
      const design = createDesignArtifact();

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: plan completes (may note no criteria)
      expect(plan.status).not.toBe("error");
    });

    test("Handles DEEP tier with no alternative approaches", () => {
      // GIVEN: DEEP tier plan with no alternatives
      const scope = createScopeArtifact();
      const design = createDesignArtifact({ complexity: "HIGH" });

      // WHEN: plan generated
      const plan = generatePlan(design, scope);

      // THEN: section exists but may be minimal
      expect(plan.content).toMatch(/Alternative Approaches|only.*approach/i);
    });
  });
});

// Mock/Helper Functions

function createScopeArtifact(overrides?: Partial<any>): any {
  return {
    format: "pwrl-scope-artifact",
    scope_id: "2026-06-11-001-scope",
    problem_frame: "Implement feature",
    intended_behavior: "Feature works",
    success_criteria: ["Feature implemented"],
    related_learnings: [],
    ...overrides,
  };
}

function createDesignArtifact(overrides?: Partial<any>): any {
  return {
    format: "pwrl-design-artifact",
    design_id: "2026-06-11-001-design",
    input_scope_id: "2026-06-11-001-scope",
    complexity: "MEDIUM",
    units: Array(5)
      .fill(null)
      .map((_, i) => createUnit({ id: `U${i + 1}` })),
    estimated_effort: "15 hours",
    dependency_graph: {},
    risk_mitigations: [],
    ...overrides,
  };
}

function createUnit(overrides?: Partial<any>): any {
  return {
    id: "U1",
    title: "Unit Title",
    goal: "Unit goal",
    dependencies: [],
    files: { create: [], modify: [], test: [] },
    test_scenarios: ["Happy path", "Edge case", "Error case"],
    acceptance_criteria: ["Criterion 1"],
    ...overrides,
  };
}

function generatePlan(design: any, scope?: any): any {
  // Calls pwrl-plan-generate skill
  // Returns plan artifact
}

function mockFileSystem(files: Record<string, string>) {
  // Mock filesystem
}

function mockUserPrompt(response: string) {
  // Mock user input
}

function mockToday(date: string) {
  // Mock current date
}

let fileSystem: Record<string, string> = {};
let userPromptCalls: any[] = [];
