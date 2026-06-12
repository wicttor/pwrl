import { describe, test, expect, beforeEach } from "@jest/globals";

describe("pwrl-learnings-structure: Structure learnings for storage", () => {
  let structurer: any;

  beforeEach(() => {
    structurer = {
      normalize: (learning: any) => ({ ...learning }),
      generateMetadata: (learning: any) => ({ ...learning }),
      generatePath: (learning: any, strategy: string) => "path",
      formatForStorage: (learning: any, format: string) => "formatted",
      createIndex: (learnings: any[]) => ({}),
      generateArtifact: (learnings: any[]) => ({}),
    };
  });

  // Suite 1: Format Normalization
  describe("Learning Format Normalization", () => {
    test("GIVEN: complete learning with all fields WHEN: normalize THEN: return unchanged", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Test learning",
        severity: "important",
        problem: "Test problem",
        application: "Test application",
        domains: ["backend"],
        tags: ["typescript"],
        created: "2026-06-12T14:00:00Z",
      };

      const result = structurer.normalize(learning);
      expect(result).toEqual(expect.objectContaining(learning));
    });

    test("GIVEN: learning missing optional fields WHEN: normalize THEN: add defaults", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Minimal learning",
        severity: "important",
        problem: "Problem",
        application: "Application",
      };

      const result = structurer.normalize(learning);
      expect(result.domains).toBeDefined();
      expect(result.tags).toBeDefined();
      expect(result.created).toBeDefined();
    });

    test("GIVEN: learning with invalid type WHEN: normalize THEN: set type to unclassified", () => {
      const learning = {
        id: "uuid1",
        type_refined: "invalid_type",
        title: "Test",
        severity: "important",
      };

      const result = structurer.normalize(learning);
      expect(result.type_refined).not.toBe("invalid_type");
    });

    test("GIVEN: learning missing required fields WHEN: normalize THEN: add placeholders", () => {
      const learning = {
        id: "uuid1",
        // missing: type_refined, title, severity
      };

      const result = structurer.normalize(learning);
      expect(result.type_refined).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.severity).toBeDefined();
    });

    test("GIVEN: learning with empty arrays WHEN: normalize THEN: keep empty or add defaults", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Test",
        domains: [],
        tags: [],
      };

      const result = structurer.normalize(learning);
      expect(Array.isArray(result.domains)).toBe(true);
      expect(Array.isArray(result.tags)).toBe(true);
    });

    test("GIVEN: learning with extra fields WHEN: normalize THEN: preserve or warn", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Test",
        custom_field: "custom_value",
        another_field: 42,
      };

      const result = structurer.normalize(learning);
      // Should preserve or handle gracefully
      expect(result).toBeDefined();
    });
  });

  // Suite 2: Metadata Generation
  describe("Metadata Generation", () => {
    test("GIVEN: learning with title WHEN: generate metadata THEN: create slug", () => {
      const learning = {
        id: "uuid1",
        title: "Async Race Condition Prevention",
        type_refined: "gotcha",
      };

      const result = structurer.generateMetadata(learning);
      expect(result.slug).toBe("async-race-condition-prevention");
    });

    test("GIVEN: learning without timestamp WHEN: generate metadata THEN: add current timestamp", () => {
      const learning = {
        id: "uuid1",
        title: "Test",
        type_refined: "pattern",
      };

      const result = structurer.generateMetadata(learning);
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });

    test("GIVEN: learning WHEN: generate metadata THEN: create full_text_index", () => {
      const learning = {
        id: "uuid1",
        title: "Memoization",
        problem: "Expensive calculations",
        application: "Use caching",
      };

      const result = structurer.generateMetadata(learning);
      expect(result.full_text_index).toContain("memoization");
      expect(result.full_text_index).toContain("expensive");
    });

    test("GIVEN: learning WHEN: generate metadata THEN: calculate fingerprints", () => {
      const learning = {
        id: "uuid1",
        title: "Test Learning",
        problem: "Test problem",
        type_refined: "pattern",
      };

      const result = structurer.generateMetadata(learning);
      expect(result.source_fingerprint).toBeDefined();
      expect(result.keyword_hash).toBeDefined();
    });

    test("GIVEN: learning with special characters in title WHEN: generate slug THEN: sanitize", () => {
      const learning = {
        id: "uuid1",
        title: "Test: Learning (v2) & More!",
        type_refined: "pattern",
      };

      const result = structurer.generateMetadata(learning);
      expect(result.slug).toMatch(/^[a-z0-9\-]+$/);
    });

    test("GIVEN: multiple learnings with same title WHEN: generate metadata THEN: unique slugs", () => {
      const learnings = [
        { id: "uuid1", title: "Same Title", type_refined: "pattern" },
        { id: "uuid2", title: "Same Title", type_refined: "pattern" },
      ];

      const results = learnings.map((l) => structurer.generateMetadata(l));
      expect(results[0].slug).not.toBe(results[1].slug);
    });
  });

  // Suite 3: Storage Path Generation
  describe("Storage Path Generation", () => {
    test("GIVEN: learning, by_type strategy WHEN: generate path THEN: path with type folder", () => {
      const learning = {
        id: "uuid1",
        type_refined: "gotcha",
        title: "Race Condition",
        created: "2026-06-12",
      };

      const result = structurer.generatePath(learning, "by_type");
      expect(result).toContain("gotcha");
      expect(result).toContain("2026-06-12");
    });

    test("GIVEN: learning, by_domain strategy WHEN: generate path THEN: path with domain folder", () => {
      const learning = {
        id: "uuid1",
        domains: ["backend"],
        title: "Database Optimization",
        created: "2026-06-12",
      };

      const result = structurer.generatePath(learning, "by_domain");
      expect(result).toContain("backend");
    });

    test("GIVEN: learning, by_category strategy WHEN: generate path THEN: path with year/month", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Learning",
        created: "2026-06-12",
      };

      const result = structurer.generatePath(learning, "by_category");
      expect(result).toContain("2026-06");
      expect(result).toContain("pattern");
    });

    test("GIVEN: learning with slug WHEN: generate path THEN: include filename", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Memoization Pattern",
        created: "2026-06-12",
        slug: "memoization-pattern",
      };

      const result = structurer.generatePath(learning, "by_type");
      expect(result).toContain("memoization-pattern");
    });

    test("GIVEN: archived learning WHEN: generate path THEN: use archived folder", () => {
      const learning = {
        id: "uuid1",
        status: "archived",
        type_refined: "gotcha",
        title: "Old Learning",
        created: "2026-06-12",
      };

      const result = structurer.generatePath(learning, "by_type");
      expect(result).toContain("archived");
    });
  });

  // Suite 4: Storage Formatting
  describe("Storage Formatting", () => {
    test("GIVEN: learning, markdown format WHEN: format THEN: valid markdown", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Test Learning",
        severity: "important",
        problem: "Test problem",
        application: "Test application",
        domains: ["backend"],
        tags: ["typescript"],
      };

      const result = structurer.formatForStorage(learning, "markdown");
      expect(result).toContain("# Test Learning");
      expect(result).toContain("**Type:**");
      expect(result).toContain("**Severity:**");
    });

    test("GIVEN: learning, json format WHEN: format THEN: valid json", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Test",
        problem: "Problem",
      };

      const result = structurer.formatForStorage(learning, "json");
      const parsed = JSON.parse(result);
      expect(parsed.id).toBe("uuid1");
    });

    test("GIVEN: learning, yaml format WHEN: format THEN: valid yaml", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Test",
        domains: ["backend"],
      };

      const result = structurer.formatForStorage(learning, "yaml");
      expect(result).toContain("id:");
      expect(result).toContain("type:");
    });

    test("GIVEN: learning with special characters WHEN: format THEN: properly escaped", () => {
      const learning = {
        id: "uuid1",
        title: 'Test: "Quote" & <Tag>',
        problem: "Test\\Backslash",
        type_refined: "pattern",
      };

      const result = structurer.formatForStorage(learning, "markdown");
      expect(result).toBeDefined();
      // Should not break markdown/json
    });

    test("GIVEN: learning with code example WHEN: format markdown THEN: code block preserved", () => {
      const learning = {
        id: "uuid1",
        title: "Test",
        examples: ["```javascript\nconst x = 1;\n```"],
        type_refined: "pattern",
      };

      const result = structurer.formatForStorage(learning, "markdown");
      expect(result).toContain("```javascript");
    });
  });

  // Suite 5: Index Creation
  describe("Index File Generation", () => {
    test("GIVEN: multiple learnings WHEN: create index THEN: INDEX.md generated", () => {
      const learnings = [
        { id: "a", type_refined: "pattern", title: "Learning A" },
        { id: "b", type_refined: "gotcha", title: "Learning B" },
      ];

      const result = structurer.createIndex(learnings);
      expect(result.index_files).toContainEqual(
        expect.objectContaining({ name: "INDEX.md" }),
      );
    });

    test("GIVEN: learnings with different types WHEN: create BY_TYPE index THEN: grouped by type", () => {
      const learnings = [
        { id: "a", type_refined: "pattern", title: "Pattern 1" },
        { id: "b", type_refined: "pattern", title: "Pattern 2" },
        { id: "c", type_refined: "gotcha", title: "Gotcha 1" },
      ];

      const result = structurer.createIndex(learnings);
      expect(result.index_files).toContainEqual(
        expect.objectContaining({ name: "BY_TYPE.md" }),
      );
    });

    test("GIVEN: learnings with different domains WHEN: create BY_DOMAIN index THEN: grouped by domain", () => {
      const learnings = [
        { id: "a", domains: ["backend"], title: "Backend 1" },
        { id: "b", domains: ["frontend"], title: "Frontend 1" },
      ];

      const result = structurer.createIndex(learnings);
      expect(result.index_files).toContainEqual(
        expect.objectContaining({ name: "BY_DOMAIN.md" }),
      );
    });

    test("GIVEN: learnings with different severities WHEN: create BY_SEVERITY index THEN: grouped", () => {
      const learnings = [
        { id: "a", severity: "critical", title: "Critical" },
        { id: "b", severity: "important", title: "Important" },
      ];

      const result = structurer.createIndex(learnings);
      expect(result.index_files).toContainEqual(
        expect.objectContaining({ name: "BY_SEVERITY.md" }),
      );
    });

    test("GIVEN: 100 learnings WHEN: create RECENT index THEN: last 20 included", () => {
      const learnings = Array.from({ length: 100 }, (_, i) => ({
        id: `uuid${i}`,
        title: `Learning ${i}`,
        created: new Date(2026, 5, (i % 30) + 1).toISOString(),
        type_refined: "pattern",
      }));

      const result = structurer.createIndex(learnings);
      expect(result.index_files).toContainEqual(
        expect.objectContaining({ name: "RECENT.md" }),
      );
    });

    test("GIVEN: learnings WHEN: create machine-readable index THEN: .index.json generated", () => {
      const learnings = [{ id: "a", type_refined: "pattern", title: "Test" }];

      const result = structurer.createIndex(learnings);
      expect(result.index_files).toContainEqual(
        expect.objectContaining({ name: ".index.json" }),
      );
    });

    test("GIVEN: index JSON created WHEN: parse THEN: valid structure", () => {
      const learnings = [
        { id: "uuid1", type_refined: "pattern", title: "Test" },
      ];

      const result = structurer.createIndex(learnings);
      const jsonIndex = result.index_files.find(
        (f) => f.name === ".index.json",
      );
      const parsed = JSON.parse(jsonIndex.content);
      expect(parsed).toHaveProperty("learnings");
    });
  });

  // Suite 6: Error Recovery
  describe("Error Handling", () => {
    test("GIVEN: invalid storage format WHEN: normalize THEN: default to markdown", () => {
      const learning = { id: "uuid1", title: "Test", type_refined: "pattern" };
      const result = structurer.formatForStorage(learning, "invalid_format");
      // Should either error or use default
      expect(result).toBeDefined();
    });

    test("GIVEN: learning missing required id WHEN: normalize THEN: generate id or error", () => {
      const learning = {
        title: "No ID",
        type_refined: "pattern",
      };

      const result = structurer.normalize(learning);
      expect(result.id).toBeDefined();
    });

    test("GIVEN: very long title WHEN: generate slug THEN: truncate reasonably", () => {
      const learning = {
        id: "uuid1",
        title: "A".repeat(500),
        type_refined: "pattern",
      };

      const result = structurer.generateMetadata(learning);
      expect(result.slug.length).toBeLessThan(200);
    });

    test("GIVEN: path collision WHEN: generate path THEN: unique path created", () => {
      const learnings = [
        {
          id: "a",
          type_refined: "pattern",
          title: "Test",
          created: "2026-06-12",
          slug: "test",
        },
        {
          id: "b",
          type_refined: "pattern",
          title: "Test",
          created: "2026-06-12",
          slug: "test",
        },
      ];

      const paths = learnings.map((l) => structurer.generatePath(l, "by_type"));
      expect(new Set(paths).size).toBe(2); // Both unique
    });
  });

  // Suite 7: Full Workflow
  describe("Full Structuring Workflow", () => {
    test("GIVEN: classified learnings WHEN: full structure workflow THEN: complete artifact", () => {
      const learnings = [
        {
          id: "uuid1",
          type_refined: "pattern",
          title: "Memoization",
          severity: "important",
          problem: "Expensive calls",
          application: "Use caching",
          domains: ["backend"],
          tags: ["performance"],
        },
        {
          id: "uuid2",
          type_refined: "gotcha",
          title: "Race condition",
          severity: "critical",
          problem: "Concurrent access",
          application: "Use locks",
          domains: ["backend"],
          tags: ["concurrency"],
        },
      ];

      // Full workflow
      const normalized = learnings.map((l) => structurer.normalize(l));
      const withMetadata = normalized.map((l) =>
        structurer.generateMetadata(l),
      );
      const withPaths = withMetadata.map((l) => ({
        ...l,
        path: structurer.generatePath(l, "by_type"),
      }));
      const artifact = structurer.generateArtifact(withPaths);

      expect(artifact).toEqual(
        expect.objectContaining({
          format: "learnings_structured",
          learnings_stored: expect.any(Number),
          index_generated: true,
          storage_status: "success",
          ready_for_deduplication: true,
        }),
      );
    });

    test("GIVEN: learnings in multiple domains WHEN: structure THEN: correct organization", () => {
      const learnings = [
        {
          id: "a",
          type_refined: "pattern",
          domains: ["backend"],
          title: "Backend Pattern",
        },
        {
          id: "b",
          type_refined: "pattern",
          domains: ["frontend"],
          title: "Frontend Pattern",
        },
        {
          id: "c",
          type_refined: "gotcha",
          domains: ["security"],
          title: "Security Gotcha",
        },
      ];

      const artifact = structurer.generateArtifact(learnings);
      expect(artifact.by_type.pattern).toBe(2);
      expect(artifact.by_type.gotcha).toBe(1);
    });
  });
});
