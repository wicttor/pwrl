/**
 * tests/pwrl-work/triage-input.test.ts
 *
 * Unit tests for pwrl-work-triage micro-skill
 * Tests input classification, task extraction, validation,
 * dependency resolution, and conflict detection.
 */

describe("pwrl-work-triage: Work Input Triage", () => {
  describe("Task File Input", () => {
    test("Extracts task file with complete frontmatter", () => {
      // GIVEN: task file with full YAML frontmatter
      const taskFile = readTaskFile(
        "docs/tasks/to-do/2026-06-11-U1-email-validation.md",
      );

      // WHEN: triage processes file
      const triage = triageInput(taskFile);

      // THEN: all fields populated
      expect(triage.unit_id).toBe("U1");
      expect(triage.title).toBe("Add Email Validation");
      expect(triage.goal).toBeDefined();
      expect(triage.files.create).toContain("src/validators/email.ts");
      expect(triage.files.modify).toContain("tests/validators/email.test.ts");
      expect(triage.acceptance_criteria.length).toBeGreaterThanOrEqual(2);
      expect(triage.test_scenarios.length).toBeGreaterThanOrEqual(3);
    });

    test("Detects current status from task file", () => {
      // GIVEN: task file with status: in-progress
      mockTaskFile({
        status: "in-progress",
      });

      // WHEN: triage processes file
      const triage = triageInput("docs/tasks/in-progress/U1.md");

      // THEN: status preserved
      expect(triage.current_status).toBe("in-progress");
    });

    test("Extracts file path as origin", () => {
      // GIVEN: task file at specific path
      const path = "docs/tasks/to-do/2026-06-11-U2-test.md";
      mockTaskFile({ title: "Test" }, path);

      // WHEN: triage processes
      const triage = triageInput(path);

      // THEN: origin set to file path
      expect(triage.input_reference).toBe(path);
      expect(triage.input_type).toBe("task-file");
    });

    test("Handles task file with missing optional fields", () => {
      // GIVEN: task file missing approach and test_scenarios
      mockTaskFile({
        unit_id: "U1",
        title: "Quick Fix",
        files: { modify: ["src/utils.ts"] },
        acceptance_criteria: ["Fix works", "Tests pass"],
        // no approach, no test_scenarios
      });

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/quick-fix.md");

      // THEN: missing fields have defaults
      expect(triage.approach).toBeDefined();
      expect(triage.test_scenarios.length).toBeGreaterThanOrEqual(3);
    });

    test("Rejects task file with missing required fields", () => {
      // GIVEN: task file missing acceptance_criteria
      mockTaskFile({
        unit_id: "U1",
        title: "Incomplete Task",
        files: { modify: ["src/index.ts"] },
        // no acceptance_criteria
      });

      // WHEN: validation runs
      const result = triageInput("docs/tasks/to-do/incomplete.md");

      // THEN: returns error with recovery
      expect(result.error_type).toBe("validation-error");
      expect(result.missing_fields).toContain("acceptance_criteria");
      expect(result.recovery).toContain("provide at least 2");
    });
  });

  describe("Plan File Input", () => {
    test("Parses plan file and lists available units", () => {
      // GIVEN: plan file with 3 units
      mockPlanFile({
        units: [
          { id: "U1", title: "Setup", files: { create: ["src/"] } },
          { id: "U2", title: "Core Logic", files: { modify: ["src/core.ts"] } },
          {
            id: "U3",
            title: "Tests",
            files: { modify: ["tests/core.test.ts"] },
          },
        ],
      });

      // WHEN: triage processes plan file
      const triage = triageInput("docs/plans/2026-06-10-001-auth.md");

      // THEN: prompts user for unit selection
      expect(userPromptCalls.some((p) => p.message.includes("unit"))).toBe(
        true,
      );
      expect(
        userPromptCalls.some(
          (p) => p.message.includes("U1") && p.message.includes("U3"),
        ),
      ).toBe(true);
    });

    test("Single unit selection from plan", () => {
      // GIVEN: plan file + user selects U2
      mockPlanFile({
        units: [
          { id: "U1", title: "Setup" },
          { id: "U2", title: "Core Logic", files: { modify: ["src/core.ts"] } },
          { id: "U3", title: "Tests" },
        ],
      });
      mockUserResponse("U2");

      // WHEN: triage processes
      const triage = triageInput("docs/plans/2026-06-10-001-auth.md");

      // THEN: returns single triage artifact for U2
      expect(triage.unit_id).toBe("U2");
      expect(Array.isArray(triage)).toBe(false);
    });

    test("Multiple unit selection from plan", () => {
      // GIVEN: plan file + user selects "U1, U3-U5"
      mockPlanFile({
        units: [
          { id: "U1", title: "Setup" },
          { id: "U2", title: "Core" },
          { id: "U3", title: "Test 1" },
          { id: "U4", title: "Test 2" },
          { id: "U5", title: "Test 3" },
        ],
      });
      mockUserResponse("U1, U3-U5");

      // WHEN: triage processes
      const triage = triageInput("docs/plans/2026-06-10-001-auth.md");

      // THEN: returns array of 4 triage artifacts
      expect(Array.isArray(triage)).toBe(true);
      expect(triage.length).toBe(4);
      expect(triage.map((t) => t.unit_id)).toEqual(["U1", "U3", "U4", "U5"]);
    });

    test('Select "all" units from plan', () => {
      // GIVEN: plan file + user selects "all"
      mockPlanFile({
        units: [{ id: "U1" }, { id: "U2" }, { id: "U3" }],
      });
      mockUserResponse("all");

      // WHEN: triage processes
      const triage = triageInput("docs/plans/2026-06-10-001-auth.md");

      // THEN: returns 3 artifacts
      expect(Array.isArray(triage)).toBe(true);
      expect(triage.length).toBe(3);
    });

    test("Handles plan with no units", () => {
      // GIVEN: plan file with no implementation units
      mockPlanFile({ units: [] });

      // WHEN: triage processes
      const result = triageInput("docs/plans/2026-06-10-001-auth.md");

      // THEN: returns error
      expect(result.error_type).toBe("no-units-found");
      expect(result.recovery).toContain("plan");
    });
  });

  describe("Bare Prompt Input", () => {
    test("Processes bare prompt with clarifying questions", () => {
      // GIVEN: bare prompt
      const prompt = "Fix flaky test in auth middleware";
      mockUserResponses([
        "src/middleware/auth.test.ts", // files?
        "Single test file", // scope?
        "Test runs consistently", // acceptance?
        "yes", // confirm?
      ]);

      // WHEN: triage processes
      const triage = triageInput(prompt);

      // THEN: returns triage artifact with bootstrapped values
      expect(triage.title).toBe("Fix flaky test in auth middleware");
      expect(triage.files.modify).toContain("src/middleware/auth.test.ts");
      expect(triage.acceptance_criteria).toContain("Test runs consistently");
      expect(triage.status).toBe("triaged");
    });

    test("Auto-generates unit ID for bare prompt", () => {
      // GIVEN: bare prompt (no unit ID)
      mockUserResponses(["src/test.ts", "fix", "works", "yes"]);

      // WHEN: triage processes
      const triage = triageInput("Refactor utils module");

      // THEN: unit_id auto-generated (PROMPT-001, etc.)
      expect(triage.unit_id).toMatch(/^PROMPT-\d+$/);
    });

    test("Determines task complexity from prompt", () => {
      // GIVEN: complex bare prompt
      mockUserResponses([
        "src/auth.ts, src/db.ts, tests/auth.test.ts", // multiple files
        "Refactor authentication module", // scope
        "Module refactored correctly", // acceptance
        "yes",
      ]);

      // WHEN: triage processes
      const triage = triageInput("Refactor authentication to use new pattern");

      // THEN: marked as complex
      expect(triage.complexity).toBe("MEDIUM");
    });

    test("Handles bare prompt with user declining", () => {
      // GIVEN: bare prompt + user says "no" at confirmation
      mockUserResponses([
        "src/test.ts",
        "fix",
        "works",
        "no", // user declines
      ]);

      // WHEN: triage processes
      const triage = triageInput("Quick fix");

      // THEN: returns to input selection or error
      expect(triage.error_type).toBe("user-declined");
      expect(triage.recovery).toContain("try again");
    });
  });

  describe("Empty Input", () => {
    test("Uses latest task from to-do directory", () => {
      // GIVEN: no input + tasks exist
      mockTaskDirectory({
        "docs/tasks/to-do/2026-06-10-U1.md": { unit_id: "U1" },
        "docs/tasks/to-do/2026-06-11-U2.md": { unit_id: "U2" },
        "docs/tasks/to-do/2026-06-09-U3.md": { unit_id: "U3" },
      });

      // WHEN: triage called with empty input
      const triage = triageInput("");

      // THEN: returns latest task (2026-06-11-U2)
      expect(triage.unit_id).toBe("U2");
      expect(triage.input_reference).toContain("2026-06-11-U2");
    });

    test("Prompts user when no tasks found", () => {
      // GIVEN: no input + no tasks in to-do
      mockTaskDirectory({});
      mockUserResponse("Add email validation");

      // WHEN: triage called with empty input
      triageInput("");

      // THEN: prompts user to describe work
      expect(userPromptCalls.some((p) => p.message.includes("No tasks"))).toBe(
        true,
      );
    });
  });

  describe("Validation & Error Handling", () => {
    test("Validates minimum required fields", () => {
      // GIVEN: task with missing files
      mockTaskFile({
        unit_id: "U1",
        title: "Missing Files",
        acceptance_criteria: ["works"],
        // no files
      });

      // WHEN: validation runs
      const result = triageInput("docs/tasks/to-do/missing.md");

      // THEN: returns validation error
      expect(result.error_type).toBe("validation-error");
      expect(result.missing_fields).toContain("files");
    });

    test("Validates at least 2 acceptance criteria", () => {
      // GIVEN: task with 1 criterion
      mockTaskFile({
        files: { modify: ["src/test.ts"] },
        acceptance_criteria: ["works only"], // only 1
      });

      // WHEN: validation runs
      const result = triageInput("docs/tasks/to-do/insufficient.md");

      // THEN: returns error
      expect(result.error_type).toBe("validation-error");
      expect(result.missing_fields).toContain("acceptance_criteria");
      expect(result.message).toContain("at least 2");
    });

    test("Normalizes file paths", () => {
      // GIVEN: task with inconsistent file paths (with/without ./)
      mockTaskFile({
        unit_id: "U1",
        files: {
          create: ["./src/utils.ts", "src/helpers.ts"],
          modify: ["tests/./utils.test.ts"],
        },
      });

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/paths.md");

      // THEN: paths normalized
      expect(triage.files.create).toEqual(["src/utils.ts", "src/helpers.ts"]);
      expect(triage.files.modify).toEqual(["tests/utils.test.ts"]);
    });
  });

  describe("Dependency Resolution", () => {
    test("Validates dependencies exist", () => {
      // GIVEN: task depending on U1 and U5
      mockTaskFile({
        unit_id: "U2",
        dependencies: ["U1", "U5"],
        files: { modify: ["src/core.ts"] },
        acceptance_criteria: ["works", "tested"],
      });
      mockTaskIndex({
        U1: { status: "done", path: "docs/tasks/done/U1.md" },
        // U5 not found
      });

      // WHEN: dependency resolution runs
      const triage = triageInput("docs/tasks/to-do/u2.md");

      // THEN: U1 OK, U5 warning
      expect(triage.dependencies_resolved[0].status).toBe("done");
      expect(triage.dependencies_resolved[1].status).toBe("not-found");
      expect(triage.warnings).toContain("U5");
    });

    test("Warns on in-progress dependencies", () => {
      // GIVEN: task depending on in-progress unit
      mockTaskFile({
        unit_id: "U3",
        dependencies: ["U2"],
      });
      mockTaskIndex({
        U2: { status: "in-progress", path: "docs/tasks/in-progress/U2.md" },
      });

      // WHEN: dependency resolution runs
      const triage = triageInput("docs/tasks/to-do/u3.md");

      // THEN: warning issued
      expect(triage.warnings).toContain("in-progress");
      expect(triage.warnings).toContain("U2");
    });

    test("Detects circular dependencies", () => {
      // GIVEN: circular dependency U1→U2→U3→U1
      mockTaskFile({
        unit_id: "U1",
        dependencies: ["U2"],
      });
      mockTaskIndex({
        U2: { dependencies: ["U3"] },
        U3: { dependencies: ["U1"] },
      });

      // WHEN: dependency graph validated
      const result = triageInput("docs/tasks/to-do/u1.md");

      // THEN: returns error with cycle path
      expect(result.error_type).toBe("circular-dependency");
      expect(result.cycle_path).toBe("U1 → U2 → U3 → U1");
    });
  });

  describe("Conflict Detection", () => {
    test("Detects file conflicts with in-progress tasks", () => {
      // GIVEN: new task + in-progress task touch same file
      mockTaskFile({
        unit_id: "U3",
        files: { modify: ["src/utils.ts", "src/helpers.ts"] },
      });
      mockTaskIndex({
        U2: {
          status: "in-progress",
          files: { modify: ["src/helpers.ts", "src/api.ts"] },
        },
      });

      // WHEN: conflict detection runs
      const triage = triageInput("docs/tasks/to-do/u3.md");

      // THEN: conflict identified
      expect(triage.conflicts).toContain("src/helpers.ts");
      expect(triage.conflicting_unit).toBe("U2");
    });

    test("Prompts user on conflict", () => {
      // GIVEN: file conflict detected
      mockTaskFile({
        unit_id: "U3",
        files: { modify: ["src/shared.ts"] },
      });
      mockTaskIndex({
        U2: { status: "in-progress", files: { modify: ["src/shared.ts"] } },
      });
      mockUserResponse("combine");

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/u3.md");

      // THEN: prompts user + stores response
      expect(userPromptCalls.some((p) => p.message.includes("conflict"))).toBe(
        true,
      );
      expect(triage.conflict_resolution).toBe("combine");
    });

    test("No conflict if file only in for-review task", () => {
      // GIVEN: file in for-review task (not in-progress)
      mockTaskFile({
        unit_id: "U3",
        files: { modify: ["src/utils.ts"] },
      });
      mockTaskIndex({
        U1: { status: "for-review", files: { modify: ["src/utils.ts"] } },
      });

      // WHEN: conflict detection runs
      const triage = triageInput("docs/tasks/to-do/u3.md");

      // THEN: no conflict (for-review can be shipped/archived)
      expect(triage.conflicts).toBeUndefined();
    });
  });

  describe("Confirmation & User Interaction", () => {
    test("Displays summary and asks for confirmation", () => {
      // GIVEN: task ready for confirmation
      mockTaskFile({
        unit_id: "U1",
        title: "Email Validation",
        goal: "Add validation",
        files: { create: ["src/validators/email.ts"] },
        acceptance_criteria: ["Valid emails pass", "Invalid emails fail"],
      });
      mockUserResponse("yes");

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/u1.md");

      // THEN: summary shown + confirmation obtained
      expect(userPromptCalls.some((p) => p.message.includes("Ready"))).toBe(
        true,
      );
      expect(
        userPromptCalls.some((p) => p.message.includes("Email Validation")),
      ).toBe(true);
      expect(triage.user_confirmed).toBe(true);
    });

    test("Allows modification before confirmation", () => {
      // GIVEN: user chooses to modify
      mockTaskFile({ unit_id: "U1", title: "Original" });
      mockUserResponses(["modify", "title", "Updated Title", "yes"]);

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/u1.md");

      // THEN: modified value stored
      expect(triage.title).toBe("Updated Title");
      expect(triage.user_confirmed).toBe(true);
    });

    test("Returns to input selection if user says no", () => {
      // GIVEN: user declines confirmation
      mockTaskFile({ unit_id: "U1" });
      mockUserResponse("no");

      // WHEN: triage processes
      const result = triageInput("docs/tasks/to-do/u1.md");

      // THEN: error returned
      expect(result.error_type).toBe("user-declined");
    });
  });

  describe("Artifact Generation", () => {
    test("Generates triage artifact with YAML frontmatter", () => {
      // GIVEN: task ready for artifact
      mockTaskFile({
        unit_id: "U1",
        title: "Task",
      });

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/u1.md");

      // THEN: artifact has required metadata
      expect(triage.format).toBe("pwrl-triage-artifact");
      expect(triage.version).toBe("1.0");
      expect(triage.triage_id).toMatch(/^\d{4}-\d{2}-\d{2}-/);
      expect(triage.created_by).toBe("pwrl-work-triage");
    });

    test("Artifact includes input reference", () => {
      // GIVEN: task from file
      const path = "docs/tasks/to-do/u1.md";
      mockTaskFile({ unit_id: "U1" });

      // WHEN: triage processes
      const triage = triageInput(path);

      // THEN: artifact has input reference
      expect(triage.input_reference).toBe(path);
      expect(triage.input_type).toBe("task-file");
    });

    test("Marks artifact as ready for execution", () => {
      // GIVEN: valid task
      mockTaskFile({
        unit_id: "U1",
        files: { modify: ["src/test.ts"] },
        acceptance_criteria: ["a", "b"],
      });

      // WHEN: triage completes
      const triage = triageInput("docs/tasks/to-do/u1.md");

      // THEN: status is triaged and ready
      expect(triage.status).toBe("triaged");
      expect(triage.ready_for_execution).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("Handles task with empty file list", () => {
      // GIVEN: task with no files specified
      mockTaskFile({
        unit_id: "U1",
        title: "Documentation Only",
        files: {},
        acceptance_criteria: ["docs updated", "builds"],
      });

      // WHEN: validation runs
      const result = triageInput("docs/tasks/to-do/docs-only.md");

      // THEN: prompts user to specify files
      expect(result.error_type).toBe("validation-error");
      expect(result.message).toContain("files");
    });

    test("Handles task with special characters in paths", () => {
      // GIVEN: task with special chars in file names
      mockTaskFile({
        unit_id: "U1",
        files: { create: ["src/my-special-file.ts", "src/file(copy).ts"] },
        acceptance_criteria: ["works", "tested"],
      });

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/special.md");

      // THEN: paths validated and preserved
      expect(triage.files.create).toContain("src/my-special-file.ts");
      expect(triage.files.create).toContain("src/file(copy).ts");
    });

    test("Handles very long task description", () => {
      // GIVEN: task with very long title (>200 chars)
      const longTitle = "a".repeat(300);
      mockTaskFile({
        unit_id: "U1",
        title: longTitle,
        files: { modify: ["src/test.ts"] },
        acceptance_criteria: ["works", "tested"],
      });

      // WHEN: triage processes
      const triage = triageInput("docs/tasks/to-do/long.md");

      // THEN: handled gracefully
      expect(triage.title.length).toBeLessThan(500);
      expect(triage.title).toContain("a");
    });

    test("Handles file not found", () => {
      // GIVEN: task file doesn't exist
      mockFileSystem({ "docs/tasks/to-do/": {} });

      // WHEN: triage attempts to read
      const result = triageInput("docs/tasks/to-do/nonexistent.md");

      // THEN: returns error
      expect(result.error_type).toBe("file-not-found");
      expect(result.recovery).toContain("path");
    });

    test("Handles malformed YAML frontmatter", () => {
      // GIVEN: task with invalid YAML
      mockTaskFile({ content: "---\ninvalid: yaml: content\n---\n# Body" });

      // WHEN: triage attempts to parse
      const result = triageInput("docs/tasks/to-do/malformed.md");

      // THEN: returns error
      expect(result.error_type).toBe("parse-error");
      expect(result.recovery).toContain("valid YAML");
    });
  });
});

// Mock/Helper Functions

function readTaskFile(path: string): any {
  // Read task file from mock filesystem
}

function triageInput(input: string | null | undefined): any {
  // Calls pwrl-work-triage skill
  // Returns triage artifact
}

function mockTaskFile(data: Partial<any>, path?: string) {
  // Mock a task file
}

function mockPlanFile(data: Partial<any>) {
  // Mock a plan file
}

function mockUserResponse(response: string) {
  // Mock single user response
}

function mockUserResponses(responses: string[]) {
  // Mock multiple user responses in sequence
}

function mockTaskDirectory(files: Record<string, any>) {
  // Mock task directory contents
}

function mockTaskIndex(index: Record<string, any>) {
  // Mock task index for dependency/conflict checks
}

function mockFileSystem(files: Record<string, any>) {
  // Mock filesystem
}

let userPromptCalls: any[] = [];
let fileSystem: Record<string, any> = {};
