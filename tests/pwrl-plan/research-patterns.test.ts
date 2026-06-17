/**
 * tests/pwrl-plan/research-patterns.test.ts
 *
 * Unit tests for pwrl-plan-research micro-skill
 * Tests tech stack detection, pattern discovery, risk identification,
 * and research recommendations following TDD methodology.
 */

describe("pwrl-plan-research: Research Pattern Discovery", () => {
  describe("Tech Stack Detection", () => {
    test("Detects languages, frameworks, databases from codebase", () => {
      // GIVEN: codebase with React, TypeScript, Node.js
      mockFileSystem({
        "package.json": JSON.stringify({
          dependencies: {
            react: "^18.0.0",
            typescript: "^4.8.0",
            express: "^4.18.0",
            pg: "^8.8.0",
          },
        }),
        Dockerfile: "FROM node:18",
        "src/index.ts": "// TypeScript",
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects tech stack
      const research = discoverResearch(scopeArtifact);

      // THEN: all technologies identified
      expect(research.tech_stack.languages).toContain("TypeScript");
      expect(research.tech_stack.frameworks).toContain("React");
      expect(research.tech_stack.frameworks).toContain("Express");
      expect(research.tech_stack.databases).toContain("PostgreSQL");
    });

    test("Detects testing frameworks", () => {
      // GIVEN: package.json with Jest and Cypress
      mockFileSystem({
        "package.json": JSON.stringify({
          devDependencies: {
            jest: "^29.0.0",
            cypress: "^13.0.0",
          },
        }),
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects testing
      const research = discoverResearch(scopeArtifact);

      // THEN: testing frameworks included
      expect(research.tech_stack.testing).toContain("Jest");
      expect(research.tech_stack.testing).toContain("Cypress");
    });

    test("Detects CI/CD from .github/workflows/", () => {
      // GIVEN: GitHub Actions workflow present
      mockFileSystem({
        ".github/workflows/ci.yml": "name: CI",
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects CI/CD
      const research = discoverResearch(scopeArtifact);

      // THEN: GitHub Actions detected
      expect(research.tech_stack.ci_cd).toContain("GitHub Actions");
    });

    test("Detects deployment from Docker/Kubernetes config", () => {
      // GIVEN: Dockerfile and k8s manifests
      mockFileSystem({
        Dockerfile: "FROM node:18",
        "k8s/deployment.yaml": "apiVersion: apps/v1",
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects deployment
      const research = discoverResearch(scopeArtifact);

      // THEN: Docker and Kubernetes detected
      expect(research.tech_stack.deployment).toContain("Docker");
      expect(research.tech_stack.deployment).toContain("Kubernetes");
    });

    test("Prompts user to confirm detected stack if uncertain", () => {
      // GIVEN: ambiguous tech indicators
      mockFileSystem({
        "package.json": "{ /* malformed */ }",
      });
      mockUserPrompt("Confirmed: React + Node.js");
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects stack
      const research = discoverResearch(scopeArtifact);

      // THEN: user prompted for confirmation
      expect(
        userPromptCalls.some(
          (p) =>
            p.message.includes("confirm") && p.message.includes("tech stack"),
        ),
      ).toBe(true);
    });
  });

  describe("Local Pattern Discovery", () => {
    test("Identifies architectural patterns from code structure", () => {
      // GIVEN: well-organized codebase with service layer
      mockFileSystem({
        "src/services/": { "user.service.ts": "", "auth.service.ts": "" },
        "src/controllers/": { "user.controller.ts": "" },
        "src/middleware/": { "auth.middleware.ts": "" },
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research discovers patterns
      const research = discoverResearch(scopeArtifact);

      // THEN: service layer and middleware patterns identified
      expect(research.local_patterns.architectural_patterns).toContain(
        "service layer",
      );
      expect(research.local_patterns.architectural_patterns).toContain(
        "middleware",
      );
    });

    test("Detects async patterns (async-await, promises, callbacks)", () => {
      // GIVEN: codebase using async-await
      mockFileSystem({
        "src/index.ts": `
          async function getData() {
            const result = await fetch('/api/data');
            return result.json();
          }
        `,
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects async patterns
      const research = discoverResearch(scopeArtifact);

      // THEN: async-await identified as primary pattern
      expect(research.local_patterns.async_patterns).toContain("async-await");
      expect(research.local_patterns.async_patterns).not.toContain("callbacks");
    });

    test("Identifies error handling style", () => {
      // GIVEN: codebase with try-catch blocks
      mockFileSystem({
        "src/index.ts": `
          try {
            doSomething();
          } catch (error: CustomError) {
            handleError(error);
          }
        `,
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects error handling
      const research = discoverResearch(scopeArtifact);

      // THEN: try-catch style identified
      expect(research.local_patterns.error_handling_style).toContain(
        "try-catch",
      );
    });

    test("Detects file organization structure (by-feature, by-layer, flat)", () => {
      // GIVEN: codebase organized by-feature
      mockFileSystem({
        "src/features/auth/": { "service.ts": "", "controller.ts": "" },
        "src/features/users/": { "service.ts": "", "controller.ts": "" },
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research analyzes structure
      const research = discoverResearch(scopeArtifact);

      // THEN: by-feature organization identified
      expect(research.local_patterns.file_organization).toContain("by-feature");
    });

    test("Identifies naming conventions in code", () => {
      // GIVEN: codebase with consistent naming
      mockFileSystem({
        "src/helpers.ts": `
          export const getUserData = () => {};
          export class UserService {}
          export const MAX_RETRIES = 3;
        `,
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research analyzes naming
      const research = discoverResearch(scopeArtifact);

      // THEN: naming conventions identified
      expect(research.local_patterns.naming_conventions).toContain("camelCase");
      expect(research.local_patterns.naming_conventions).toContain(
        "PascalCase",
      );
    });

    test("Detects dependency injection pattern", () => {
      // GIVEN: codebase using constructor injection
      mockFileSystem({
        "src/service.ts": `
          class UserService {
            constructor(private db: Database) {}
          }
        `,
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research detects DI
      const research = discoverResearch(scopeArtifact);

      // THEN: constructor injection identified
      expect(research.local_patterns.dependency_injection).toContain(
        "constructor",
      );
    });
  });

  describe("Risk Area Identification", () => {
    test("Identifies security risk when auth/crypto mentioned", () => {
      // GIVEN: problem frame mentions authentication
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Implement OAuth2 authentication",
        success_criteria: ["Secure token exchange", "CSRF protection"],
      });

      // WHEN: research identifies risks
      const research = discoverResearch(scopeArtifact);

      // THEN: security risk flagged
      expect(research.risk_areas).toContain("security");
      expect(
        research.risk_recommendations.some(
          (r) => r.area.includes("security") || r.area.includes("auth"),
        ),
      ).toBe(true);
    });

    test("Identifies performance risk when scale/optimization mentioned", () => {
      // GIVEN: problem frame mentions optimization
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Optimize query performance for 100k records",
      });

      // WHEN: research identifies risks
      const research = discoverResearch(scopeArtifact);

      // THEN: performance risk flagged
      expect(research.risk_areas).toContain("performance");
    });

    test("Identifies data migration risk", () => {
      // GIVEN: problem mentions data transformation or migration
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Migrate user data from MongoDB to PostgreSQL",
      });

      // WHEN: research identifies risks
      const research = discoverResearch(scopeArtifact);

      // THEN: data migration risk flagged
      expect(research.risk_areas).toContain("data_migrations");
    });

    test("Identifies distributed systems risk for multi-service architecture", () => {
      // GIVEN: tech stack includes multiple services
      mockFileSystem({
        "services/": { "auth-service/": {}, "api-service/": {} },
        "docker-compose.yml": "version: 3",
      });
      const scopeArtifact = createScopeArtifact();

      // WHEN: research identifies risks
      const research = discoverResearch(scopeArtifact);

      // THEN: distributed systems risk flagged
      expect(research.risk_areas).toContain("distributed_systems");
    });

    test("Identifies compliance risk for GDPR/PCI/SOC2", () => {
      // GIVEN: problem mentions payment or data protection
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Process credit card payments securely",
        success_criteria: ["PCI-DSS compliance"],
      });

      // WHEN: research identifies risks
      const research = discoverResearch(scopeArtifact);

      // THEN: compliance risk flagged
      expect(research.risk_areas).toContain("compliance");
    });

    test("Prompts user for high-risk areas before proceeding", () => {
      // GIVEN: high-risk area identified
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Implement encryption for sensitive data",
      });
      mockUserPrompt("yes"); // approve research

      // WHEN: research identifies risks
      const research = discoverResearch(scopeArtifact);

      // THEN: user prompted about risk area
      expect(
        userPromptCalls.some(
          (p) =>
            p.message.includes("high-risk") || p.message.includes("security"),
        ),
      ).toBe(true);
    });
  });

  describe("External Research Recommendation", () => {
    test("Recommends external research for high-risk areas", () => {
      // GIVEN: high-risk area identified
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Migrate to Redis cluster",
      });
      mockUserPrompt("yes"); // approve research

      // WHEN: research recommends external research
      const research = discoverResearch(scopeArtifact);

      // THEN: research topics recommended
      expect(research.external_research.recommended).toBe(true);
      expect(research.external_research.topics).toBeDefined();
      expect(research.external_research.topics.length).toBeGreaterThan(0);
    });

    test("Includes search terms for each research topic", () => {
      // GIVEN: research approved
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Implement Redis caching",
      });
      mockUserPrompt("yes");

      // WHEN: research recommends topics
      const research = discoverResearch(scopeArtifact);

      // THEN: each topic has search terms
      research.external_research.topics.forEach((topic) => {
        expect(topic.search_terms).toBeDefined();
        expect(Array.isArray(topic.search_terms)).toBe(true);
        expect(topic.search_terms.length).toBeGreaterThan(0);
      });
    });

    test("Estimates research time", () => {
      // GIVEN: research topics identified
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Migrate session storage",
      });
      mockUserPrompt("yes");

      // WHEN: research compiles estimates
      const research = discoverResearch(scopeArtifact);

      // THEN: time estimates included
      expect(
        research.external_research.topics.every((t) => t.time_estimate),
      ).toBe(true);
    });

    test("Performs actual web research if approved and available", () => {
      // GIVEN: user approves external research
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Redis best practices",
      });
      mockUserPrompt("yes");
      mockWebSearch([
        { title: "Redis Performance Tips", source: "redis.io", excerpt: "..." },
      ]);

      // WHEN: research performs web search
      const research = discoverResearch(scopeArtifact);

      // THEN: findings included in artifact
      expect(research.external_research.findings).toBeDefined();
      expect(research.external_research.findings.length).toBeGreaterThan(0);
      expect(research.external_research.findings[0].title).toBeTruthy();
    });

    test("Gracefully handles no web search available", () => {
      // GIVEN: web search not available
      const scopeArtifact = createScopeArtifact({
        problem_frame: "Research topic",
      });
      mockUserPrompt("yes");
      mockWebSearch(null); // no search available

      // WHEN: research attempts to search
      const research = discoverResearch(scopeArtifact);

      // THEN: continues with topic suggestions
      expect(research.external_research.topics).toBeDefined();
      expect(research.external_research.findings).toBeUndefined(); // no findings
    });
  });

  describe("Learnings Integration", () => {
    test("Integrates related learnings from scope artifact", () => {
      // GIVEN: scope includes learnings
      const scopeArtifact = createScopeArtifact({
        related_learnings: [
          {
            title: "Topological Sort Performance",
            path: "docs/learnings/technical-fix/topo.md",
            relevance: "HIGH",
          },
        ],
      });

      // WHEN: research integrates learnings
      const research = discoverResearch(scopeArtifact);

      // THEN: learnings referenced in recommendations
      expect(research.learnings_integrated).toContain(
        "Topological Sort Performance",
      );
    });

    test("Extracts insights from learnings for research", () => {
      // GIVEN: learning contains specific insights
      mockLearning({
        title: "File Conflict Detection",
        insights: ["Use dependency matrix", "Check file modification times"],
      });
      const scopeArtifact = createScopeArtifact({
        related_learnings: [
          { title: "File Conflict Detection", path: "...", relevance: "HIGH" },
        ],
      });

      // WHEN: research integrates insights
      const research = discoverResearch(scopeArtifact);

      // THEN: insights appear in recommendations
      expect(research.notes).toMatch(/dependency matrix|modification time/i);
    });

    test("Includes learnings source in artifact", () => {
      // GIVEN: multiple learnings
      const scopeArtifact = createScopeArtifact({
        related_learnings: [
          { title: "Learning1", path: "path1", relevance: "HIGH" },
          { title: "Learning2", path: "path2", relevance: "HIGH" },
        ],
      });

      // WHEN: research compiles findings
      const research = discoverResearch(scopeArtifact);

      // THEN: learning paths included in artifact
      expect(research.learnings_integrated.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Artifact Generation", () => {
    test("Generated artifact has correct YAML frontmatter", () => {
      // GIVEN: research completes
      const scopeArtifact = createScopeArtifact();

      // WHEN: artifact generated
      const research = discoverResearch(scopeArtifact);

      // THEN: frontmatter is valid
      expect(research.format).toBe("pwrl-research-artifact");
      expect(research.version).toBe("1.0");
      expect(research.created_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(research.created_by).toBe("pwrl-plan-research");
      expect(research.research_id).toMatch(
        /^\d{4}-\d{2}-\d{2}-\d{3}-research$/,
      );
      expect(research.input_scope_id).toBe(scopeArtifact.scope_id);
    });

    test("All artifact sections populated and non-empty", () => {
      // GIVEN: research discovery completes
      const scopeArtifact = createScopeArtifact();

      // WHEN: artifact generated
      const research = discoverResearch(scopeArtifact);

      // THEN: all sections present
      expect(research.tech_stack).toBeDefined();
      expect(research.local_patterns).toBeDefined();
      expect(research.risk_areas).toBeDefined();
      expect(research.external_research).toBeDefined();
      expect(research.learnings_integrated).toBeDefined();
      expect(research.notes).toBeDefined();
    });

    test("Includes confidence level in research", () => {
      // GIVEN: research completed
      const scopeArtifact = createScopeArtifact();

      // WHEN: artifact generated
      const research = discoverResearch(scopeArtifact);

      // THEN: confidence level included
      expect(research.confidence_level).toMatch(/^(HIGH|MEDIUM|LOW)$/);
    });
  });

  describe("Edge Cases", () => {
    test("Handles codebase analysis failure gracefully", () => {
      // GIVEN: codebase cannot be analyzed
      mockFileSystem({});
      const scopeArtifact = createScopeArtifact();

      // WHEN: research attempts analysis
      const research = discoverResearch(scopeArtifact);

      // THEN: continues with available data
      expect(research.tech_stack).toBeDefined(); // may be empty
      expect(research.status).not.toBe("error");
    });

    test("Handles missing learnings gracefully", () => {
      // GIVEN: scope has no learnings
      const scopeArtifact = createScopeArtifact({
        related_learnings: [],
      });

      // WHEN: research processes
      const research = discoverResearch(scopeArtifact);

      // THEN: continues without learnings
      expect(research.learnings_integrated).toEqual([]);
      expect(research.status).not.toBe("error");
    });
  });
});

// Mock/Helper Functions

function createScopeArtifact(overrides?: Partial<any>): any {
  return {
    format: "pwrl-scope-artifact",
    scope_id: "2026-06-11-001-scope",
    domain: "software",
    problem_frame: "Add feature to system",
    intended_behavior: "Feature works correctly",
    success_criteria: ["Feature implemented"],
    related_learnings: [],
    ...overrides,
  };
}

function mockFileSystem(structure: Record<string, any>) {
  // Mock filesystem for tests
}

function mockUserPrompt(response: string | boolean) {
  // Mock ask_user with single response
}

function mockWebSearch(results: any) {
  // Mock web search results
}

function mockLearning(content: any) {
  // Mock learning file content
}

function discoverResearch(scopeArtifact: any): any {
  // Calls pwrl-plan-research skill
  // Returns research artifact
}

let userPromptCalls: any[] = [];
