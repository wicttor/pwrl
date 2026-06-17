import { describe, test, expect, beforeEach } from "@jest/globals";

describe("pwrl-learnings-extract: Extract learnings from various sources", () => {
  let extractor: any;

  beforeEach(() => {
    // Initialize extractor with test utilities
    extractor = {
      extract: (source: string, content: string, context?: any) => ({}),
      categorize: (candidates: any[]) => ({}),
      extractMetadata: (learning: any) => ({}),
      validateExtraction: (learning: any) => true,
      generateArtifact: (learnings: any[]) => ({}),
    };
  });

  // Suite 1: Code Extraction
  describe("Code Extraction", () => {
    test("GIVEN: code with performance optimization WHEN: extract from code THEN: return pattern learning", () => {
      const code = `
        const memoized = (() => {
          let cache = new Map();
          return (input) => {
            if (cache.has(input)) return cache.get(input);
            const result = expensive(input);
            cache.set(input, result);
            return result;
          };
        })();
      `;

      const result = extractor.extract("code", code);
      expect(result).toEqual(
        expect.objectContaining({
          type: "pattern",
          title: expect.stringContaining("memoization"),
          severity: "important",
        }),
      );
    });

    test("GIVEN: code with FIXME comment WHEN: extract THEN: identify as potential gotcha", () => {
      const code = `
        // FIXME: Race condition here if called concurrently
        let counter = 0;
        async function increment() {
          const val = counter;
          await delay(10);
          counter = val + 1;
        }
      `;

      const result = extractor.extract("code", code);
      expect(result).toEqual(
        expect.objectContaining({
          type: "gotcha",
          problem: expect.stringContaining("race condition"),
        }),
      );
    });

    test("GIVEN: code with security implementation WHEN: extract THEN: return technical_fix", () => {
      const code = `
        function validateInput(input) {
          if (!input.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error('Invalid input');
          }
          return sanitize(input);
        }
      `;

      const result = extractor.extract("code", code);
      expect(result).toEqual(
        expect.objectContaining({
          type: "technical_fix",
          severity: "critical",
        }),
      );
    });

    test("GIVEN: code with high cyclomatic complexity WHEN: extract THEN: flag as potential gotcha", () => {
      const code = `
        function complex(a, b, c, d) {
          if (a) { if (b) { if (c) { if (d) { return 1; } } } }
          else if (a && !b) return 2;
          else if (b && !c) return 3;
          else return 4;
        }
      `;

      const result = extractor.extract("code", code);
      expect(result).toEqual(
        expect.objectContaining({
          type: "pattern",
          title: expect.stringContaining("complexity"),
        }),
      );
    });

    test("GIVEN: clean, standard code WHEN: extract THEN: return zero learnings", () => {
      const code = `
        function add(a: number, b: number): number {
          return a + b;
        }
      `;

      const result = extractor.extract("code", code);
      expect(result).toEqual(
        expect.objectContaining({
          learnings_found: 0,
        }),
      );
    });

    test("GIVEN: code with TODO and HACK comments WHEN: extract THEN: identify multiple candidates", () => {
      const code = `
        // TODO: Optimize this loop
        // HACK: Workaround for browser bug
        function process() { }
      `;

      const result = extractor.extract("code", code);
      expect(result.learnings_found).toBeGreaterThan(0);
    });

    test("GIVEN: code with database connection pooling WHEN: extract THEN: classify as pattern", () => {
      const code = `
        const pool = new Pool({
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000
        });
      `;

      const result = extractor.extract("code", code);
      expect(result).toEqual(
        expect.objectContaining({
          type: "pattern",
          domains: expect.arrayContaining(["backend"]),
        }),
      );
    });
  });

  // Suite 2: Commit Extraction
  describe("Commit Extraction", () => {
    test("GIVEN: commit fixing race condition WHEN: extract THEN: return technical_fix with critical severity", () => {
      const commit = {
        message: "fix: prevent race condition in task queue",
        refs: "#2847",
        diff: "Added lock mechanism to serialize operations",
      };

      const result = extractor.extract("commit", JSON.stringify(commit));
      expect(result).toEqual(
        expect.objectContaining({
          type: "technical_fix",
          severity: "critical",
        }),
      );
    });

    test("GIVEN: commit optimizing performance WHEN: extract THEN: return pattern", () => {
      const commit = {
        message: "perf: optimize query with index",
        diff: "Added database index on user_id",
      };

      const result = extractor.extract("commit", JSON.stringify(commit));
      expect(result).toEqual(
        expect.objectContaining({
          type: "pattern",
          severity: "important",
        }),
      );
    });

    test("GIVEN: refactoring commit WHEN: extract THEN: identify design approach", () => {
      const commit = {
        message: "refactor: extract service layer",
        diff: "Moved business logic to service classes",
      };

      const result = extractor.extract("commit", JSON.stringify(commit));
      expect(result).toEqual(
        expect.objectContaining({
          type: expect.stringMatching(/pattern|decision/),
        }),
      );
    });

    test("GIVEN: commit with issue link WHEN: extract THEN: include source reference", () => {
      const commit = {
        message: "fix: authentication failure on mobile",
        refs: "#3421",
        sha: "abc123",
      };

      const result = extractor.extract("commit", JSON.stringify(commit));
      expect(result.source_reference).toEqual(
        expect.objectContaining({
          refs: "#3421",
        }),
      );
    });

    test("GIVEN: multiple commits in batch WHEN: extract THEN: return multiple learnings", () => {
      const commits = [
        "fix: bug #1",
        "feat: new feature",
        "perf: optimization",
      ];

      const result = extractor.extract("commit", JSON.stringify(commits));
      expect(result.learnings_found).toBeGreaterThanOrEqual(1);
    });
  });

  // Suite 3: Task Extraction
  describe("Task Extraction", () => {
    test("GIVEN: task with goals and constraints WHEN: extract THEN: return decision learning", () => {
      const task = `
        Task: Implement caching layer
        Goals: Reduce database load by 50%, maintain data consistency
        Constraints: Must work with existing ORM, <500ms latency
      `;

      const result = extractor.extract("task", task);
      expect(result).toEqual(
        expect.objectContaining({
          type: "decision",
          title: expect.stringContaining("caching"),
        }),
      );
    });

    test("GIVEN: task with blocker and resolution WHEN: extract THEN: include as learning", () => {
      const task = `
        Blocker: X library incompatible with Y version
        Resolution: Switched to alternative library Z
        Result: 15% performance improvement
      `;

      const result = extractor.extract("task", task);
      expect(result.learnings_found).toBeGreaterThan(0);
    });

    test("GIVEN: task with assumptions WHEN: extract THEN: flag key assumptions", () => {
      const task = `
        Assumptions:
        - Database supports transactions
        - All users have modern browsers
        - Network latency <200ms
      `;

      const result = extractor.extract("task", task);
      expect(result).toEqual(
        expect.objectContaining({
          type: "decision",
        }),
      );
    });

    test("GIVEN: task description with lessons learned WHEN: extract THEN: return workflow learning", () => {
      const task = `
        Lesson: Breaking into smaller PRs improved review velocity
        Time to review: 45min (vs 2hr for monolithic)
        Quality improved: Found 3x more issues with smaller scope
      `;

      const result = extractor.extract("task", task);
      expect(result).toEqual(
        expect.objectContaining({
          type: "workflow",
        }),
      );
    });
  });

  // Suite 4: Error & Review Extraction
  describe("Error and Review Extraction", () => {
    test("GIVEN: error trace with root cause WHEN: extract THEN: return technical_fix", () => {
      const error = `
        Error: TypeError: Cannot read property 'map' of undefined
        Root cause: API returns different schema in edge case
        Fix: Add null check before map()
      `;

      const result = extractor.extract("error", error);
      expect(result).toEqual(
        expect.objectContaining({
          type: "technical_fix",
          severity: "critical",
        }),
      );
    });

    test("GIVEN: code review comments WHEN: extract THEN: identify pattern recommendations", () => {
      const review = `
        Review comment 1: Consider using Promise.all for parallel operations
        Review comment 2: Add error handling for async/await
        Status: Approved after fixes
      `;

      const result = extractor.extract("review", review);
      expect(result.learnings_found).toBeGreaterThan(0);
    });

    test("GIVEN: test failure trace WHEN: extract THEN: classify as gotcha", () => {
      const failure = `
        Test: should handle concurrent requests
        Failure: Race condition causes inconsistent state
        Details: Same resource modified simultaneously
      `;

      const result = extractor.extract("error", failure);
      expect(result).toEqual(
        expect.objectContaining({
          type: "gotcha",
        }),
      );
    });
  });

  // Suite 5: Metadata Extraction
  describe("Metadata Extraction", () => {
    test("GIVEN: learning with source file WHEN: extract metadata THEN: include line number", () => {
      const learning = {
        type: "pattern",
        title: "Test",
        problem: "Issue",
        application: "Use this",
      };

      const metadata = extractor.extractMetadata({
        ...learning,
        source: { file: "src/cache.ts", line: 42 },
      });

      expect(metadata).toEqual(
        expect.objectContaining({
          source_reference: expect.objectContaining({
            file: "src/cache.ts",
            line: 42,
          }),
        }),
      );
    });

    test("GIVEN: learning without context WHEN: extract metadata THEN: use current timestamp", () => {
      const learning = {
        type: "pattern",
        title: "Test",
        problem: "Issue",
        application: "Use this",
      };

      const metadata = extractor.extractMetadata(learning);
      expect(metadata.source_reference.timestamp).toBeDefined();
    });

    test("GIVEN: learning with URL reference WHEN: extract metadata THEN: preserve URL", () => {
      const learning = {
        type: "decision",
        title: "Test",
        problem: "Issue",
        application: "Use this",
        source: { url: "https://github.com/user/repo/pull/123" },
      };

      const metadata = extractor.extractMetadata(learning);
      expect(metadata.source_reference.url).toBe(
        "https://github.com/user/repo/pull/123",
      );
    });

    test("GIVEN: multiple learnings WHEN: extract all metadata THEN: unique IDs assigned", () => {
      const learnings = [
        { type: "pattern", title: "Test 1" },
        { type: "pattern", title: "Test 2" },
        { type: "pattern", title: "Test 3" },
      ];

      const results = learnings.map((l) => extractor.extractMetadata(l));
      const ids = results.map((r) => r.id);

      expect(new Set(ids).size).toBe(3); // All unique
    });
  });

  // Suite 6: Validation
  describe("Extraction Validation", () => {
    test("GIVEN: learning with all required fields WHEN: validate THEN: return true", () => {
      const learning = {
        type: "pattern",
        title: "Learning title",
        problem: "Problem statement",
        application: "How to apply",
        source_reference: { file: "test.ts" },
      };

      expect(extractor.validateExtraction(learning)).toBe(true);
    });

    test("GIVEN: learning missing required field WHEN: validate THEN: return false", () => {
      const learning = {
        type: "pattern",
        title: "Learning title",
        // missing: problem, application
      };

      expect(extractor.validateExtraction(learning)).toBe(false);
    });

    test("GIVEN: learning with invalid type WHEN: validate THEN: return false", () => {
      const learning = {
        type: "invalid_type",
        title: "Test",
        problem: "Problem",
        application: "Use this",
      };

      expect(extractor.validateExtraction(learning)).toBe(false);
    });

    test("GIVEN: generic title WHEN: validate THEN: warn but still valid", () => {
      const learning = {
        type: "pattern",
        title: "Bug fix",
        problem: "Specific problem description",
        application: "Specific application",
      };

      // Should be valid but ideally title would be more specific
      expect(extractor.validateExtraction(learning)).toBe(true);
    });
  });

  // Suite 7: Categorization
  describe("Learning Categorization", () => {
    test("GIVEN: learning about unexpected behavior WHEN: categorize THEN: assign gotcha", () => {
      const learning = {
        title: "JavaScript type coercion surprise",
        problem: '1 + "1" returns "11" not 2',
        application: "Always use strict equality",
      };

      const result = extractor.categorize([learning]);
      expect(result[0].type).toBe("gotcha");
    });

    test("GIVEN: learning about reusable solution WHEN: categorize THEN: assign pattern", () => {
      const learning = {
        title: "Error recovery with exponential backoff",
        problem: "Transient failures need retry logic",
        application: "Implement exponential backoff for retries",
      };

      const result = extractor.categorize([learning]);
      expect(result[0].type).toBe("pattern");
    });

    test("GIVEN: learning about technology choice WHEN: categorize THEN: assign decision", () => {
      const learning = {
        title: "Why we chose PostgreSQL over MongoDB",
        problem: "Need ACID transactions and complex queries",
        application: "Use PostgreSQL for transactional systems",
      };

      const result = extractor.categorize([learning]);
      expect(result[0].type).toBe("decision");
    });

    test("GIVEN: multiple learnings WHEN: categorize THEN: assign appropriate types", () => {
      const learnings = [
        { title: "Unexpected null pointer", problem: "Null check missed" },
        { title: "Caching pattern", problem: "Repeated expensive calls" },
        { title: "Why we use TypeScript", problem: "Type safety needed" },
      ];

      const results = extractor.categorize(learnings);
      expect(results.map((r) => r.type)).toEqual(
        expect.arrayContaining(["gotcha", "pattern", "decision"]),
      );
    });
  });

  // Suite 8: Edge Cases
  describe("Edge Cases", () => {
    test("GIVEN: empty content WHEN: extract THEN: return zero learnings", () => {
      const result = extractor.extract("code", "");
      expect(result).toEqual(
        expect.objectContaining({
          learnings_found: 0,
          extraction_status: "success",
        }),
      );
    });

    test("GIVEN: very large file (10k lines) WHEN: extract THEN: handle and return results", () => {
      const largeCode = "function test() {}\n".repeat(10000);
      const result = extractor.extract("code", largeCode);
      expect(result).toHaveProperty("learnings_found");
    });

    test("GIVEN: content with special characters WHEN: extract THEN: preserve in output", () => {
      const content = "Bug: Type error in ñ → σ conversion";
      const result = extractor.extract("code", content);
      expect(result).toBeDefined();
    });

    test("GIVEN: source type not in enum WHEN: extract THEN: error with recovery", () => {
      expect(() => {
        extractor.extract("unknown_source", "content");
      }).toThrow();
    });

    test("GIVEN: ambiguous learning type WHEN: extract THEN: assign primary with note", () => {
      const content =
        "Performance issue: algorithm O(n²) but works for current data size";
      const result = extractor.extract("code", content);
      // Should assign gotcha or pattern with confidence note
      expect(result).toHaveProperty("learnings_found");
    });
  });

  // Suite 9: Integration
  describe("Full Extraction Workflow", () => {
    test("GIVEN: code source with commit context WHEN: full extraction THEN: comprehensive artifact", () => {
      const source = "code";
      const content = "memoization pattern code";
      const context = { task_id: "U4.1", file: "src/cache.ts", line: 42 };

      const result = extractor.extract(source, content, context);
      const artifact = extractor.generateArtifact(
        result.learnings ? [result] : result.learnings_found > 0 ? result : [],
      );

      expect(artifact).toEqual(
        expect.objectContaining({
          format: "learnings_extraction",
          extraction_status: expect.stringMatching(/success|partial/),
        }),
      );
    });

    test("GIVEN: multiple source extractions WHEN: aggregate THEN: combined artifact", () => {
      const results = [
        extractor.extract("code", "pattern code"),
        extractor.extract("commit", "fix: issue"),
        extractor.extract("task", "task description"),
      ];

      const allLearnings = results.flatMap((r) => r.learnings || []);
      const artifact = extractor.generateArtifact(allLearnings);

      expect(artifact.learnings_found).toBeGreaterThan(0);
      expect(artifact.ready_for_classification).toBe(true);
    });
  });
});
