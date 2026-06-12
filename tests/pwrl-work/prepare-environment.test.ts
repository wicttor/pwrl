/**
 * tests/pwrl-work/prepare-environment.test.ts
 *
 * Unit tests for pwrl-work-prepare micro-skill
 * Tests repository verification, ambiguity resolution,
 * branch strategy, verification commands, and environment setup.
 */

describe("pwrl-work-prepare: Prepare Execution Environment", () => {
  describe("Repository State Verification", () => {
    test("Confirms clean repository with pulled changes", () => {
      // GIVEN: clean repo on dev branch, pulled
      mockGit({
        status: "clean",
        current_branch: "dev",
        is_pulled: true,
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: repository state confirmed
      expect(prepare.repository_state.clean).toBe(true);
      expect(prepare.repository_state.latest_pulled).toBe(true);
    });

    test("Detects uncommitted changes and asks user", () => {
      // GIVEN: repo with uncommitted changes
      mockGit({
        status: "modified",
        modified_files: ["src/test.ts", "package.json"],
      });
      mockUserResponse("commit");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: changes detected + user prompted
      expect(prepare.repository_state.clean).toBe(false);
      expect(userPromptCalls.some((p) => p.message.includes("commit"))).toBe(
        true,
      );
      expect(prepare.user_action).toBe("commit");
    });

    test("Detects untracked files", () => {
      // GIVEN: repo with untracked files
      mockGit({
        status: "clean",
        untracked_files: ["src/temp.ts", ".env.local"],
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: untracked files noted (not blocking)
      expect(prepare.repository_state.untracked_files).toContain("src/temp.ts");
      expect(prepare.repository_state.clean).toBe(true);
    });

    test("Detects wrong branch and suggests switch", () => {
      // GIVEN: on main branch, should be on dev
      mockGit({
        current_branch: "main",
        branches_available: ["dev", "feature/test", "main"],
      });
      mockUserResponse("switch");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: wrong branch detected + switch offered
      expect(prepare.repository_state.current_branch).toBe("main");
      expect(userPromptCalls.some((p) => p.message.includes("switch"))).toBe(
        true,
      );
    });

    test("Detects not-pulled changes and asks to pull", () => {
      // GIVEN: local behind origin
      mockGit({
        status: "clean",
        commits_behind: 3,
        current_branch: "dev",
      });
      mockUserResponse("pull");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: behind detected + pull offered
      expect(userPromptCalls.some((p) => p.message.includes("pull"))).toBe(
        true,
      );
      expect(prepare.repository_state.latest_pulled).toBe(true);
    });

    test("Handles merge conflicts gracefully", () => {
      // GIVEN: repo in merge conflict state
      mockGit({
        status: "merge-conflict",
        conflicted_files: ["src/core.ts", "tests/core.test.ts"],
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: error with recovery
      expect(prepare.error_type).toBe("merge-conflicts");
      expect(prepare.conflicted_files).toContain("src/core.ts");
      expect(prepare.recovery).toContain("resolve");
    });
  });

  describe("Ambiguity Resolution", () => {
    test("Detects file creation vs. extension ambiguity", () => {
      // GIVEN: task says "create src/validators/email.ts" but file exists
      mockFileSystem({
        "src/validators/email.ts": "existing content",
      });
      mockUserResponse("extend");
      const triage = createTriageArtifact({
        files: { create: ["src/validators/email.ts"] },
      });

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: ambiguity detected + user asked
      expect(
        userPromptCalls.some(
          (p) => p.message.includes("create") && p.message.includes("extend"),
        ),
      ).toBe(true);
      expect(prepare.ambiguities_resolved).toContain("file-create-vs-extend");
    });

    test("Prompts for clarification on vague approach", () => {
      // GIVEN: approach says "use best practices"
      const triage = createTriageArtifact({
        approach: "Use best practices for validation",
      });
      mockUserResponse("RFC 5322 regex with library fallback");

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: clarification prompted
      expect(userPromptCalls.some((p) => p.message.includes("approach"))).toBe(
        true,
      );
      expect(prepare.clarified_approach).toBe(
        "RFC 5322 regex with library fallback",
      );
    });

    test("Confirms test scenarios", () => {
      // GIVEN: task with 3 test scenarios
      const triage = createTriageArtifact({
        test_scenarios: ["Valid email", "Invalid email", "Edge cases"],
      });
      mockUserResponse("yes");

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: scenarios confirmed
      expect(userPromptCalls.some((p) => p.message.includes("scenario"))).toBe(
        true,
      );
      expect(prepare.test_scenarios_confirmed).toEqual([
        "Valid email",
        "Invalid email",
        "Edge cases",
      ]);
    });

    test("Resolves dependency location ambiguity", () => {
      // GIVEN: task depends on U1 but location unclear
      const triage = createTriageArtifact({
        dependencies: [{ unit_id: "U1", location: "unknown" }],
      });
      mockUserResponse("src/validators/");

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: location clarified
      expect(userPromptCalls.some((p) => p.message.includes("location"))).toBe(
        true,
      );
      expect(prepare.dependencies_clarified[0].location).toBe(
        "src/validators/",
      );
    });

    test("Resolves multiple ambiguities", () => {
      // GIVEN: 3 ambiguities
      const triage = createTriageArtifact({
        files: { create: ["src/validators/email.ts"] }, // ambiguous: exists
        approach: "use best practices", // ambiguous: vague
        test_scenarios: ["test1"], // only 1, needs 2+
      });
      mockFileSystem({ "src/validators/email.ts": "exists" });
      mockUserResponses(["extend", "RFC 5322", "yes, add edge case"]);

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: all 3 resolved
      expect(prepare.ambiguities_resolved).toBe(3);
      expect(prepare.ambiguities_resolved_list.length).toBe(3);
    });

    test("User can decline ambiguity resolution", () => {
      // GIVEN: ambiguity detected
      const triage = createTriageArtifact({
        files: { create: ["src/test.ts"] },
      });
      mockFileSystem({ "src/test.ts": "exists" });
      mockUserResponse("skip");

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: warning issued but continues
      expect(prepare.warnings).toContain("ambiguity");
      expect(prepare.ready_for_execution).toBe(true); // continues with warning
    });
  });

  describe("Branch Strategy", () => {
    test("Creates new feature branch for unit", () => {
      // GIVEN: clean repo, user chooses new branch
      mockGit({ status: "clean", current_branch: "dev" });
      mockUserResponse("new");
      const triage = createTriageArtifact({ unit_id: "U2" });

      // WHEN: branch strategy executed
      const prepare = prepareEnvironment(triage);

      // THEN: new branch created
      expect(prepare.branch).toBe("feature/U2-email-validation");
      expect(prepare.branch_created).toBe(true);
      expect(gitCalls).toContain("checkout -b feature/U2-email-validation");
    });

    test("Uses existing branch if already on task branch", () => {
      // GIVEN: already on feature/U2-* branch
      mockGit({ current_branch: "feature/U2-email-validation" });
      const triage = createTriageArtifact({ unit_id: "U2" });

      // WHEN: branch strategy executed
      const prepare = prepareEnvironment(triage);

      // THEN: no new branch created
      expect(prepare.branch).toBe("feature/U2-email-validation");
      expect(prepare.branch_created).toBe(false);
    });

    test("Validates branch naming", () => {
      // GIVEN: unit U2
      const triage = createTriageArtifact({
        unit_id: "U2",
        title: "Add Email Validation",
      });
      mockGit({ status: "clean" });
      mockUserResponse("new");

      // WHEN: branch created
      const prepare = prepareEnvironment(triage);

      // THEN: branch name follows pattern
      expect(prepare.branch).toMatch(/^feature\/U\d+-/);
      expect(prepare.branch).toContain("email-validation");
    });

    test("Handles bugfix branch naming", () => {
      // GIVEN: unit marked as bugfix
      const triage = createTriageArtifact({
        unit_id: "BUGFIX-1",
        title: "Fix memory leak",
      });
      mockGit({ status: "clean" });
      mockUserResponse("new");

      // WHEN: branch created
      const prepare = prepareEnvironment(triage);

      // THEN: branch named with bugfix prefix
      expect(prepare.branch).toMatch(/^bugfix\//);
    });

    test("Handles refactor branch naming", () => {
      // GIVEN: refactor task
      const triage = createTriageArtifact({
        unit_id: "REFACTOR-1",
        title: "Refactor auth module",
      });
      mockGit({ status: "clean" });
      mockUserResponse("new");

      // WHEN: branch created
      const prepare = prepareEnvironment(triage);

      // THEN: branch named with refactor prefix
      expect(prepare.branch).toMatch(/^refactor\//);
    });

    test("Continues on dev if user chooses", () => {
      // GIVEN: user chooses to continue on dev
      mockGit({ status: "clean", current_branch: "dev" });
      mockUserResponse("continue");
      const triage = createTriageArtifact();

      // WHEN: branch strategy executed
      const prepare = prepareEnvironment(triage);

      // THEN: stays on dev
      expect(prepare.branch).toBe("dev");
      expect(prepare.branch_created).toBe(false);
    });
  });

  describe("Verification Commands", () => {
    test("Identifies npm build command", () => {
      // GIVEN: npm-based project with build script
      mockFileSystem({
        "package.json": JSON.stringify({
          scripts: { build: "tsc" },
        }),
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: build command identified
      expect(prepare.verification_commands.build).toBe("npm run build");
    });

    test("Identifies test command with target file", () => {
      // GIVEN: task touching tests/validators/email.test.ts
      mockFileSystem({
        "package.json": JSON.stringify({
          scripts: { test: "jest" },
        }),
      });
      const triage = createTriageArtifact({
        files: { test: ["tests/validators/email.test.ts"] },
      });

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: test command targeted to file
      expect(prepare.verification_commands.test).toBe(
        "npm test -- tests/validators/email.test.ts",
      );
    });

    test("Identifies lint command", () => {
      // GIVEN: ESLint configured
      mockFileSystem({
        "package.json": JSON.stringify({
          scripts: { lint: "eslint" },
        }),
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: lint command identified
      expect(prepare.verification_commands.lint).toBe("npm run lint");
    });

    test("Creates precommit command from verification commands", () => {
      // GIVEN: build, test, lint commands identified
      mockFileSystem({
        "package.json": JSON.stringify({
          scripts: {
            build: "tsc",
            test: "jest",
            lint: "eslint",
          },
        }),
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: precommit runs all checks
      expect(prepare.verification_commands.precommit).toContain("lint");
      expect(prepare.verification_commands.precommit).toContain("test");
    });

    test("Handles cargo (Rust) build command", () => {
      // GIVEN: Rust project (Cargo.toml exists)
      mockFileSystem({
        "Cargo.toml": "package content",
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: identifies cargo commands
      expect(prepare.verification_commands.build).toBe("cargo build");
    });

    test("Handles make build command", () => {
      // GIVEN: Makefile project
      mockFileSystem({
        Makefile: "build:\n\t...",
      });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: identifies make commands
      expect(prepare.verification_commands.build).toBe("make build");
    });

    test("Asks user if no build command found", () => {
      // GIVEN: project with no obvious build
      mockFileSystem({
        "src/": "files",
        "package.json": JSON.stringify({
          scripts: {}, // no build
        }),
      });
      mockUserResponse("manual-verification");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: asks user
      expect(userPromptCalls.some((p) => p.message.includes("build"))).toBe(
        true,
      );
    });
  });

  describe("Environment Checks", () => {
    test("Checks Node.js version", () => {
      // GIVEN: Node v18.x available
      mockCommand({ "node --version": "v18.14.0" });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: version recorded
      expect(prepare.environment.node_version).toBe("v18.14.0");
    });

    test("Checks npm version", () => {
      // GIVEN: npm v9.x available
      mockCommand({ "npm --version": "9.3.1" });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: version recorded
      expect(prepare.environment.npm_version).toBe("9.3.1");
    });

    test("Verifies dependencies installed", () => {
      // GIVEN: node_modules present, package-lock matches
      mockFileSystem({
        "node_modules/": "exists",
        "package.json": "{}",
        "package-lock.json": "{}",
      });
      mockCommand({ "npm ls": "no missing" });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: dependencies confirmed
      expect(prepare.environment.dependencies_installed).toBe(true);
    });

    test("Detects missing dependencies and suggests install", () => {
      // GIVEN: node_modules missing or package-lock outdated
      mockCommand({ "npm ls": "missing packages" });
      mockUserResponse("install");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: install suggested
      expect(userPromptCalls.some((p) => p.message.includes("install"))).toBe(
        true,
      );
      expect(prepare.environment.dependencies_installed).toBe(true);
    });

    test("Detects database requirements and prompts user", () => {
      // GIVEN: task modifies database-related files
      const triage = createTriageArtifact({
        files: { modify: ["src/db/migrations/2026-06-11-add-users.ts"] },
      });
      mockUserResponses(["yes", "data"]);

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: database setup prompted
      expect(userPromptCalls.some((p) => p.message.includes("database"))).toBe(
        true,
      );
      expect(prepare.environment.database_ready).toBe(true);
    });

    test("Checks for required environment variables", () => {
      // GIVEN: task modifies code using .env
      const triage = createTriageArtifact({
        files: { modify: ["src/config.ts"] },
      });
      mockFileSystem({
        ".env.example": "DATABASE_URL=\nAPI_KEY=\n",
      });
      mockUserResponse("yes");

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: env check performed
      expect(prepare.environment.env_configured).toBeDefined();
    });
  });

  describe("Task Status Update", () => {
    test("Moves task to in-progress directory", () => {
      // GIVEN: task in to-do directory
      mockFileSystem({
        "docs/tasks/to-do/2026-06-11-U2-test.md": "task content",
      });
      const triage = createTriageArtifact({
        input_reference: "docs/tasks/to-do/2026-06-11-U2-test.md",
      });

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: task moved to in-progress
      expect(fileSystemCalls).toContain(
        "move docs/tasks/to-do/2026-06-11-U2-test.md to docs/tasks/in-progress/",
      );
      expect(prepare.task_status_updated).toBe(true);
    });

    test("Updates status field in task YAML", () => {
      // GIVEN: task file
      mockTaskFile({
        status: "to-do",
      });
      const triage = createTriageArtifact({
        unit_id: "U2",
        input_reference: "docs/tasks/to-do/u2.md",
      });

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: status updated to in-progress + timestamp added
      expect(fileOperations).toContain("update status: in-progress");
      expect(fileOperations).toContain("add started_at: 2026-06-11T");
    });

    test("Updates INDEX.md task list", () => {
      // GIVEN: INDEX.md with task listed under "To Do"
      mockFileSystem({
        "docs/tasks/INDEX.md": "## To Do\n- U2: Email Validation\n",
      });
      const triage = createTriageArtifact({ unit_id: "U2" });

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: task moved to "In Progress" section
      expect(fileOperations).toContain("update INDEX.md");
      expect(indexUpdateLog).toContain("moved U2 from To Do to In Progress");
    });

    test("Handles case where task already in-progress", () => {
      // GIVEN: task already in in-progress directory
      mockFileSystem({
        "docs/tasks/in-progress/2026-06-11-U2-test.md": "task",
      });
      const triage = createTriageArtifact({
        input_reference: "docs/tasks/in-progress/2026-06-11-U2-test.md",
      });

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: no move needed, just continues
      expect(prepare.task_status_updated).toBe(false); // not updated (already in-progress)
      expect(prepare.ready_for_execution).toBe(true);
    });
  });

  describe("Confirmation & Summary", () => {
    test("Displays preparation summary before confirmation", () => {
      // GIVEN: all preparation steps complete
      mockGit({ status: "clean" });
      mockUserResponse("yes");
      const triage = createTriageArtifact({
        unit_id: "U2",
        title: "Email Validation",
        files: {
          create: ["src/validators/email.ts"],
          modify: ["tests/email.test.ts"],
        },
      });

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: summary displayed
      expect(
        userPromptCalls.some(
          (p) =>
            p.message.includes("EXECUTION PREPARATION") &&
            p.message.includes("U2") &&
            p.message.includes("Email Validation"),
        ),
      ).toBe(true);
    });

    test("User can confirm or modify", () => {
      // GIVEN: summary displayed
      mockGit({ status: "clean" });
      mockUserResponses(["modify", "build", "npm run tsc", "yes"]);
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: modification applied
      expect(prepare.verification_commands.build).toBe("npm run tsc");
    });

    test("User can decline and abort", () => {
      // GIVEN: summary displayed
      mockGit({ status: "clean" });
      mockUserResponse("no");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: abort with recovery options
      expect(prepare.error_type).toBe("user-declined");
      expect(prepare.recovery).toContain("restart");
    });
  });

  describe("Artifact Generation", () => {
    test("Generates prepare artifact with YAML frontmatter", () => {
      // GIVEN: preparation complete
      mockGit({ status: "clean" });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: artifact properly formatted
      expect(prepare.format).toBe("pwrl-prepare-artifact");
      expect(prepare.version).toBe("1.0");
      expect(prepare.prepare_id).toBeDefined();
      expect(prepare.created_by).toBe("pwrl-work-prepare");
    });

    test("Artifact references input triage artifact", () => {
      // GIVEN: triage artifact ID
      mockGit({ status: "clean" });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: triage artifact referenced
      expect(prepare.input_triage_id).toBe(triage.triage_id);
    });
  });

  describe("Edge Cases", () => {
    test("Handles detached HEAD state", () => {
      // GIVEN: git in detached HEAD
      mockGit({ current_branch: "HEAD (detached at abc123)" });
      mockUserResponse("create-branch");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: suggests creating branch
      expect(userPromptCalls.some((p) => p.message.includes("detached"))).toBe(
        true,
      );
    });

    test("Handles shallow clone", () => {
      // GIVEN: shallow git repository
      mockGit({ shallow_clone: true });
      mockUserResponse("continue");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: warns but continues
      expect(prepare.warnings).toContain("shallow");
      expect(prepare.ready_for_execution).toBe(true);
    });

    test("Handles large repository", () => {
      // GIVEN: repo with 10000+ commits
      mockGit({ commit_count: 15000 });
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: git operations still work
      expect(prepare.ready_for_execution).toBe(true);
    });

    test("Handles missing package manager", () => {
      // GIVEN: npm not available
      mockCommand({ "npm --version": "command not found" });
      mockUserResponse("yarn");
      const triage = createTriageArtifact();

      // WHEN: prepare processes
      const prepare = prepareEnvironment(triage);

      // THEN: asks user for alternative
      expect(
        userPromptCalls.some((p) => p.message.includes("package manager")),
      ).toBe(true);
    });
  });
});

// Mock/Helper Functions

function prepareEnvironment(triage: any): any {
  // Calls pwrl-work-prepare skill
  // Returns prepare artifact
}

function createTriageArtifact(overrides?: Partial<any>): any {
  return {
    format: "pwrl-triage-artifact",
    triage_id: "2026-06-11-U2-triage",
    unit_id: "U2",
    title: "Email Validation",
    goal: "Add validation",
    files: {
      create: ["src/validators/email.ts"],
      modify: ["tests/email.test.ts"],
    },
    acceptance_criteria: ["Valid emails pass", "Invalid emails fail"],
    test_scenarios: ["Valid email", "Invalid email", "Edge cases"],
    dependencies: [],
    ...overrides,
  };
}

function mockGit(state: Partial<any>) {
  // Mock git operations
}

function mockFileSystem(files: Record<string, string>) {
  // Mock filesystem
}

function mockCommand(commands: Record<string, string>) {
  // Mock shell commands
}

function mockUserResponse(response: string) {
  // Mock single user response
}

function mockUserResponses(responses: string[]) {
  // Mock multiple user responses
}

function mockTaskFile(data: Partial<any>) {
  // Mock task file
}

let userPromptCalls: any[] = [];
let gitCalls: string[] = [];
let fileSystemCalls: string[] = [];
let fileOperations: string[] = [];
let indexUpdateLog: string[] = [];
