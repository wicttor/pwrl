/**
 * tests/pwrl-plan/scope-extraction.test.ts
 *
 * Unit tests for pwrl-plan-scope micro-skill
 * Tests input parsing, context gathering, existing plan detection, learnings search,
 * and artifact generation following TDD methodology.
 */

describe("pwrl-plan-scope: Scope Extraction", () => {
  describe("Happy Path: Basic Task Description", () => {
    test("Task input → scope returns problem frame, intended behavior, success criteria", () => {
      // GIVEN: scope context protocol loaded
      const input = "Add email validation to signup form";

      // WHEN: scope processes input
      const scope = extractScope(input);

      // THEN: artifact has required properties
      expect(scope.format).toBe("pwrl-scope-artifact");
      expect(scope.status).toBe("confirmed");
      expect(scope.domain).toBe("software");
      expect(scope.problem_frame).toBeDefined();
      expect(scope.intended_behavior).toBeDefined();
      expect(scope.success_criteria).toBeDefined();
      expect(scope.success_criteria.length).toBeGreaterThan(0);
    });
  });

  describe("Existing Plan Detection", () => {
    test("Existing plan found → scope suggests resume/review/archive/delete/new", () => {
      // GIVEN: docs/plans/ contains matching plan
      // GIVEN: user is prompted via ask_user
      const input = "email validation";
      mockFileSystem({
        "docs/plans/2026-06-01-001-auth.md": "existing plan",
      });
      mockUserPrompt("Resume");

      // WHEN: scope processes input
      const scope = extractScope(input);

      // THEN: existing plan is detected
      expect(scope.existing_plan.path).toBe(
        "docs/plans/2026-06-01-001-auth.md",
      );
      expect(scope.existing_plan.action).toBe("resume");
      // USER_PROMPT was called with options: resume/review/archive/delete/new
      expect(userPromptCalls).toContainEqual({
        type: "multiple-choice",
        message: expect.stringContaining("existing plan"),
      });
    });

    test('No existing plan found → action set to "none"', () => {
      // GIVEN: docs/plans/ is empty
      const input = "Add new feature";
      mockFileSystem({ "docs/plans/": {} });

      // WHEN: scope processes input
      const scope = extractScope(input);

      // THEN: existing plan action is none
      expect(scope.existing_plan.path).toBeNull();
      expect(scope.existing_plan.action).toBe("none");
    });
  });

  describe("Domain Validation", () => {
    test('Software domain → domain set to "software"', () => {
      // GIVEN: user confirms software task
      const input = "Add feature to API";
      mockUserPrompt("yes"); // "Is this software task?"

      // WHEN: scope validates domain
      const scope = extractScope(input);

      // THEN: domain is software
      expect(scope.domain).toBe("software");
      expect(scope.status).toBe("confirmed");
    });

    test("Non-software domain → error status, recovery suggestion", () => {
      // GIVEN: user indicates non-software task
      const input = "Plan company retreat";
      mockUserPrompt("no"); // "Is this software task?"

      // WHEN: scope validates domain
      const scope = extractScope(input);

      // THEN: status is error
      expect(scope.domain).toBe("non-software");
      expect(scope.status).toBe("error");
      expect(scope.message).toContain("outside pwrl-plan scope");
    });
  });

  describe("Learnings Integration", () => {
    test("Learnings found → embeds 3-5 HIGH-relevance learnings", () => {
      // GIVEN: docs/learnings/INDEX.md has HIGH-relevance entries
      const input = "Cross-plan parallel execution";
      mockLearningsIndex([
        {
          title: "Cross-Plan Patterns",
          tags: ["cross-plan"],
          relevance: "HIGH",
          path: "docs/learnings/pattern/cross-plan.md",
        },
        {
          title: "Topological Sort",
          tags: ["algorithms"],
          relevance: "HIGH",
          path: "docs/learnings/technical-fix/topo.md",
        },
        {
          title: "File Conflict Detection",
          tags: ["conflicts"],
          relevance: "HIGH",
          path: "docs/learnings/technical-fix/conflicts.md",
        },
      ]);

      // WHEN: scope searches learnings
      const scope = extractScope(input);

      // THEN: related learnings embedded
      expect(scope.related_learnings).toBeDefined();
      expect(scope.related_learnings.length).toBeLessThanOrEqual(5);
      expect(scope.related_learnings.every((l) => l.relevance === "HIGH")).toBe(
        true,
      );
      // Each learning has title, path, and applicability note
      expect(
        scope.related_learnings.every((l) => l.title && l.path && l.note),
      ).toBe(true);
    });

    test("No learnings found → related_learnings is empty list", () => {
      // GIVEN: docs/learnings/INDEX.md is empty or no matches
      const input = "Obscure feature with no learnings";
      mockLearningsIndex([]);

      // WHEN: scope searches learnings
      const scope = extractScope(input);

      // THEN: empty list (not an error)
      expect(scope.related_learnings).toEqual([]);
      expect(scope.status).toBe("confirmed"); // not blocked
    });

    test("Filters HIGH-relevance only (excludes MEDIUM/LOW)", () => {
      // GIVEN: learnings index has mixed relevance levels
      const input = "Task keyword";
      mockLearningsIndex([
        {
          title: "High Relevance",
          tags: ["keyword"],
          relevance: "HIGH",
          path: "docs/learnings/high.md",
        },
        {
          title: "Medium Relevance",
          tags: ["keyword"],
          relevance: "MEDIUM",
          path: "docs/learnings/medium.md",
        },
        {
          title: "Low Relevance",
          tags: ["keyword"],
          relevance: "LOW",
          path: "docs/learnings/low.md",
        },
      ]);

      // WHEN: scope filters learnings
      const scope = extractScope(input);

      // THEN: only HIGH included
      expect(scope.related_learnings.length).toBe(1);
      expect(scope.related_learnings[0].title).toBe("High Relevance");
    });
  });

  describe("Ambiguous Input Handling", () => {
    test("Vague input → scope asks clarifying questions", () => {
      // GIVEN: user provides vague input
      const input = "Improve things";

      // WHEN: scope processes vague input
      extractScope(input);

      // THEN: clarifying prompts are triggered
      expect(userPromptCalls.length).toBeGreaterThan(1);
      expect(
        userPromptCalls.some(
          (p) =>
            p.message.includes("clarify") || p.message.includes("specific"),
        ),
      ).toBe(true);
    });

    test('Empty input → asks "What would you like to plan?"', () => {
      // GIVEN: empty input
      const input = "";
      mockUserPrompt("Add email validation to signup");

      // WHEN: scope processes empty input
      const scope = extractScope(input);

      // THEN: prompt asks for task description
      expect(userPromptCalls[0].message).toContain(
        "What would you like to plan",
      );
      expect(scope.problem_frame).toBeDefined();
    });
  });

  describe("Problem Frame Extraction", () => {
    test("Extracts problem frame from user input or bootstraps via prompt", () => {
      // GIVEN: input with clear problem description
      const input =
        "Current PWRL executes plans sequentially; need to parallelize";
      mockUserPrompt("yes"); // domain validation

      // WHEN: scope extracts problem frame
      const scope = extractScope(input);

      // THEN: problem frame is populated
      expect(scope.problem_frame).toMatch(/sequentially|parallelize/i);
    });

    test("Intended behavior bootstrapped from user prompts", () => {
      // GIVEN: user will be prompted for intended behavior
      const input = "Add validation";
      mockUserPrompts([
        "yes", // domain
        "Add email validation to signup form", // problem frame
        "Form rejects invalid emails before submit", // intended behavior
        ["User sees validation error", "Invalid emails are rejected"], // success criteria
      ]);

      // WHEN: scope bootstraps context
      const scope = extractScope(input);

      // THEN: intended behavior is set
      expect(scope.intended_behavior).toContain("invalid emails");
      expect(scope.success_criteria.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Requirements Search", () => {
    test("Finds matching requirements from docs/requirements/", () => {
      // GIVEN: docs/requirements/ contains matching file
      const input = "add-email-validation";
      mockFileSystem({
        "docs/requirements/email-validation.md":
          "Requirement: Add email validation to signup",
      });

      // WHEN: scope searches requirements
      const scope = extractScope(input);

      // THEN: requirement is found and added
      expect(scope.requirements_found).toBeDefined();
      expect(scope.requirements_found.length).toBeGreaterThan(0);
      expect(scope.requirements_found[0].path).toContain("email-validation");
    });

    test("Finds matching brainstorms from docs/brainstorms/", () => {
      // GIVEN: docs/brainstorms/ contains matching file
      const input = "validation improvement";
      mockFileSystem({
        "docs/brainstorms/validation-ideas.md":
          "Idea: Client-side validation with server fallback",
      });

      // WHEN: scope searches brainstorms
      const scope = extractScope(input);

      // THEN: brainstorm is found
      expect(scope.requirements_found).toBeDefined();
      expect(
        scope.requirements_found.some((r) => r.path.includes("brainstorm")),
      ).toBe(true);
    });

    test("Empty list if no requirements or brainstorms found", () => {
      // GIVEN: docs/requirements/ and docs/brainstorms/ are empty
      const input = "very unique task";
      mockFileSystem({
        "docs/requirements/": {},
        "docs/brainstorms/": {},
      });

      // WHEN: scope searches
      const scope = extractScope(input);

      // THEN: empty list (not an error)
      expect(scope.requirements_found).toEqual([]);
      expect(scope.status).toBe("confirmed");
    });
  });

  describe("Confirmation & Status", () => {
    test('Confirmed scope → status is "confirmed"', () => {
      // GIVEN: user confirms all context
      const input = "Add feature";
      mockUserPrompt("yes"); // final confirmation

      // WHEN: scope completes
      const scope = extractScope(input);

      // THEN: status is confirmed
      expect(scope.status).toBe("confirmed");
    });

    test("User corrections → loop back and update scope", () => {
      // GIVEN: user rejects initial scope, then confirms updated version
      const input = "Add feature";
      mockUserPrompts([
        "yes", // domain
        "Add feature to API", // problem frame
        "API accepts new endpoint", // intended
        ["Endpoint works"], // success
        "no", // confirmation: needs changes
        "Better problem frame", // corrected
        "yes", // final confirmation
      ]);

      // WHEN: scope processes with corrections
      const scope = extractScope(input);

      // THEN: corrections are applied
      expect(scope.problem_frame).toContain("Better problem frame");
      expect(scope.status).toBe("confirmed");
    });
  });

  describe("Artifact Schema Validation", () => {
    test("Generated artifact has all required YAML frontmatter fields", () => {
      // GIVEN: scope extraction completes
      const input = "Add feature";
      mockUserPrompt("yes");

      // WHEN: artifact is generated
      const scope = extractScope(input);

      // THEN: YAML frontmatter is valid
      expect(scope.format).toBe("pwrl-scope-artifact");
      expect(scope.version).toBe("1.0");
      expect(scope.created_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(scope.created_by).toBe("pwrl-plan-scope");
      expect(scope.scope_id).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}-scope$/);
    });

    test("All artifact sections present and non-empty/valid", () => {
      // GIVEN: happy path scope extraction
      const input = "Add feature";
      mockUserPrompt("yes");

      // WHEN: artifact generated
      const scope = extractScope(input);

      // THEN: all sections present
      expect(scope.problem_frame).toBeTruthy();
      expect(scope.intended_behavior).toBeTruthy();
      expect(scope.success_criteria).toBeDefined();
      expect(Array.isArray(scope.success_criteria)).toBe(true);
      expect(scope.domain).toMatch(/^(software|non-software)$/);
      expect(scope.status).toMatch(/^(confirmed|incomplete|error)$/);
      expect(scope.existing_plan).toBeDefined();
      expect(scope.existing_plan.action).toMatch(
        /^(resume|review|archive|delete|create-new|none)$/,
      );
      expect(Array.isArray(scope.related_learnings)).toBe(true);
      expect(Array.isArray(scope.learning_gaps)).toBe(true);
      expect(Array.isArray(scope.requirements_found)).toBe(true);
    });
  });

  describe("Error Cases", () => {
    test("Empty input with no user response → retries prompt", () => {
      // GIVEN: user provides empty input twice
      const input1 = "";
      const input2 = "";
      mockUserResponses([input1, input2, "Add feature"]); // third attempt succeeds

      // WHEN: scope processes empty inputs
      const scope = extractScope(input1);

      // THEN: prompt repeated until non-empty
      expect(
        userPromptCalls.filter((p) =>
          p.message.includes("What would you like to plan"),
        ).length,
      ).toBeGreaterThanOrEqual(2);
      expect(scope.status).toBe("confirmed");
    });
  });
});

// Mock/Helper Functions

function mockFileSystem(files: Record<string, string>) {
  // Mock filesystem access for tests
}

function mockUserPrompt(response: string | boolean) {
  // Mock ask_user tool with single response
}

function mockUserPrompts(responses: (string | boolean | string[])[]) {
  // Mock ask_user tool with multiple responses in sequence
}

function mockUserResponses(responses: any[]) {
  // Mock raw user input responses
}

function mockLearningsIndex(entries: any[]) {
  // Mock docs/learnings/INDEX.md content
}

function extractScope(input: string): any {
  // Calls pwrl-plan-scope skill
  // Returns scoped context artifact
}

let userPromptCalls: any[] = [];
