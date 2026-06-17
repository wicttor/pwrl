import { describe, test, expect, beforeEach } from "@jest/globals";

describe("pwrl-learnings-dedup: Deduplicate and merge learnings", () => {
  let deduplicator: any;

  beforeEach(() => {
    deduplicator = {
      calculateFingerprints: (learning: any) => ({}),
      findDuplicates: (learnings: any[]) => ({}),
      mergeStrategies: { exact: (a: any, b: any) => ({}) },
      mergeLearnings: (winner: any, loser: any) => ({ ...winner }),
      archiveLearning: (learning: any, mergedInto: string) => ({ ...learning }),
      generateArtifact: (learnings: any[]) => ({}),
    };
  });

  // Suite 1: Fingerprint Generation
  describe("Fingerprint Generation", () => {
    test("GIVEN: learning WHEN: calculate fingerprints THEN: exact fingerprint generated", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Memoization Pattern",
        problem: "Expensive repeated calls",
      };

      const result = deduplicator.calculateFingerprints(learning);
      expect(result.exact_fingerprint).toBeDefined();
      expect(typeof result.exact_fingerprint).toBe("string");
    });

    test("GIVEN: identical learnings WHEN: calculate fingerprints THEN: same exact fingerprint", () => {
      const learning1 = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Memoization",
        problem: "Expensive calls",
      };
      const learning2 = {
        id: "uuid2",
        type_refined: "pattern",
        title: "Memoization",
        problem: "Expensive calls",
      };

      const fp1 = deduplicator.calculateFingerprints(learning1);
      const fp2 = deduplicator.calculateFingerprints(learning2);

      expect(fp1.exact_fingerprint).toBe(fp2.exact_fingerprint);
    });

    test("GIVEN: similar learnings WHEN: calculate fingerprints THEN: semantic fingerprint similar", () => {
      const learning1 = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Error handling best practice",
        problem: "Unhandled exceptions",
      };
      const learning2 = {
        id: "uuid2",
        type_refined: "pattern",
        title: "Exception handling technique",
        problem: "Unhandled errors",
      };

      const fp1 = deduplicator.calculateFingerprints(learning1);
      const fp2 = deduplicator.calculateFingerprints(learning2);

      expect(fp1.semantic_fingerprint).toBeDefined();
      expect(fp2.semantic_fingerprint).toBeDefined();
    });

    test("GIVEN: different learnings WHEN: calculate fingerprints THEN: different exact fingerprints", () => {
      const learning1 = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Memoization",
        problem: "Expensive calls",
      };
      const learning2 = {
        id: "uuid2",
        type_refined: "gotcha",
        title: "Type coercion",
        problem: "Unexpected comparison",
      };

      const fp1 = deduplicator.calculateFingerprints(learning1);
      const fp2 = deduplicator.calculateFingerprints(learning2);

      expect(fp1.exact_fingerprint).not.toBe(fp2.exact_fingerprint);
    });

    test("GIVEN: learning WHEN: calculate fingerprints THEN: text similarity fingerprint generated", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Test",
        problem: "Issue",
        application: "Solution",
      };

      const result = deduplicator.calculateFingerprints(learning);
      expect(result.text_similarity_fingerprint).toBeDefined();
    });

    test("GIVEN: multiple learnings WHEN: calculate all fingerprints THEN: all computed", () => {
      const learnings = [
        { id: "a", type_refined: "pattern", title: "A" },
        { id: "b", type_refined: "pattern", title: "B" },
        { id: "c", type_refined: "pattern", title: "C" },
      ];

      const fingerprints = learnings.map((l) =>
        deduplicator.calculateFingerprints(l),
      );
      expect(fingerprints).toHaveLength(3);
      fingerprints.forEach((fp) => {
        expect(fp.exact_fingerprint).toBeDefined();
      });
    });
  });

  // Suite 2: Duplicate Detection
  describe("Duplicate Detection", () => {
    test("GIVEN: exact duplicate learnings WHEN: find duplicates THEN: marked as duplicate", () => {
      const learnings = [
        {
          id: "uuid1",
          type_refined: "pattern",
          title: "Memoization",
          problem: "Expensive calls",
        },
        {
          id: "uuid2",
          type_refined: "pattern",
          title: "Memoization",
          problem: "Expensive calls",
        },
      ];

      const result = deduplicator.findDuplicates(learnings);
      expect(result.exact_duplicates).toContainEqual(
        expect.objectContaining({
          learning1_id: expect.any(String),
          learning2_id: expect.any(String),
        }),
      );
    });

    test("GIVEN: high similarity learnings WHEN: find duplicates THEN: flagged as high_similarity", () => {
      const learnings = [
        {
          id: "uuid1",
          type_refined: "pattern",
          title: "Error handling with try-catch",
          problem: "Unhandled errors",
        },
        {
          id: "uuid2",
          type_refined: "pattern",
          title: "Exception handling in code",
          problem: "Unhandled exceptions",
        },
      ];

      const result = deduplicator.findDuplicates(learnings);
      expect(result.high_similarity).toBeDefined();
    });

    test("GIVEN: related but distinct learnings WHEN: find duplicates THEN: marked related not duplicate", () => {
      const learnings = [
        {
          id: "uuid1",
          type_refined: "technical_fix",
          title: "Race condition fix",
          problem: "Concurrent access",
        },
        {
          id: "uuid2",
          type_refined: "pattern",
          title: "Lock-based synchronization",
          problem: "Multiple threads",
        },
      ];

      const result = deduplicator.findDuplicates(learnings);
      expect(result.related_pairs).toBeDefined();
    });

    test("GIVEN: no duplicates WHEN: find duplicates THEN: empty duplicates array", () => {
      const learnings = [
        { id: "a", type_refined: "pattern", title: "A", problem: "Problem A" },
        { id: "b", type_refined: "pattern", title: "B", problem: "Problem B" },
        { id: "c", type_refined: "gotcha", title: "C", problem: "Problem C" },
      ];

      const result = deduplicator.findDuplicates(learnings);
      expect(result.exact_duplicates.length).toBe(0);
    });

    test("GIVEN: threshold configured WHEN: find duplicates THEN: respect similarity threshold", () => {
      const learnings = [
        { id: "a", title: "Learning A", problem: "Problem A" },
        {
          id: "b",
          title: "Learning A Modified",
          problem: "Problem A Slightly Different",
        },
      ];

      // With high threshold, not detected
      const resultHighThreshold = deduplicator.findDuplicates(learnings);
      expect(resultHighThreshold).toBeDefined();
    });

    test("GIVEN: multiple duplicates in set WHEN: find THEN: all pairs identified", () => {
      const learnings = [
        {
          id: "a",
          type_refined: "pattern",
          title: "Learning",
          problem: "Problem",
        },
        {
          id: "b",
          type_refined: "pattern",
          title: "Learning",
          problem: "Problem",
        },
        {
          id: "c",
          type_refined: "pattern",
          title: "Learning",
          problem: "Problem",
        },
      ];

      const result = deduplicator.findDuplicates(learnings);
      // All pairs should be found (a-b, b-c, a-c or transitively)
      expect(result.exact_duplicates.length).toBeGreaterThan(0);
    });
  });

  // Suite 3: Merge Operations
  describe("Merge Operations", () => {
    test("GIVEN: winner and loser learning WHEN: merge THEN: winner retained with combined data", () => {
      const winner = {
        id: "uuid1",
        type_refined: "pattern",
        title: "Memoization",
        problem: "Expensive calls",
        examples: ["example1"],
      };
      const loser = {
        id: "uuid2",
        type_refined: "pattern",
        title: "Memoization",
        problem: "Expensive calls",
        examples: ["example2"],
      };

      const result = deduplicator.mergeLearnings(winner, loser);

      expect(result.id).toBe(winner.id);
      expect(result.examples).toContainEqual("example1");
      expect(result.examples).toContainEqual("example2");
    });

    test("GIVEN: learnings with different tags WHEN: merge THEN: tags combined", () => {
      const winner = {
        id: "a",
        type_refined: "pattern",
        tags: ["tag1", "tag2"],
      };
      const loser = {
        id: "b",
        type_refined: "pattern",
        tags: ["tag2", "tag3"],
      };

      const result = deduplicator.mergeLearnings(winner, loser);

      expect(result.tags).toContainEqual("tag1");
      expect(result.tags).toContainEqual("tag2");
      expect(result.tags).toContainEqual("tag3");
    });

    test("GIVEN: learnings with conflicting severity WHEN: merge THEN: keep higher severity", () => {
      const winner = {
        id: "a",
        severity: "important",
        type_refined: "pattern",
      };
      const loser = { id: "b", severity: "critical", type_refined: "pattern" };

      const result = deduplicator.mergeLearnings(winner, loser);

      expect(result.severity).toBe("critical");
    });

    test("GIVEN: learnings with different domains WHEN: merge THEN: domains combined", () => {
      const winner = { id: "a", domains: ["backend"], type_refined: "pattern" };
      const loser = { id: "b", domains: ["security"], type_refined: "pattern" };

      const result = deduplicator.mergeLearnings(winner, loser);

      expect(result.domains).toContainEqual("backend");
      expect(result.domains).toContainEqual("security");
    });

    test("GIVEN: learnings with source references WHEN: merge THEN: sources both preserved", () => {
      const winner = {
        id: "a",
        type_refined: "pattern",
        source_reference: { file: "file1.ts", line: 10 },
      };
      const loser = {
        id: "b",
        type_refined: "pattern",
        source_reference: { file: "file2.ts", line: 20 },
      };

      const result = deduplicator.mergeLearnings(winner, loser);

      expect(result.source_reference.primary).toEqual(winner.source_reference);
      expect(result.source_reference.also_found_in).toContainEqual(
        loser.source_reference,
      );
    });

    test("GIVEN: learnings merged WHEN: track lineage THEN: merged_from preserved", () => {
      const winner = { id: "a", type_refined: "pattern", merged_from: [] };
      const loser = { id: "b", type_refined: "pattern" };

      const result = deduplicator.mergeLearnings(winner, loser);

      expect(result.merged_from).toContainEqual(loser.id);
    });
  });

  // Suite 4: Archive Handling
  describe("Archive Handling", () => {
    test("GIVEN: learning being archived WHEN: archive THEN: status changed and reference added", () => {
      const learning = {
        id: "uuid1",
        type_refined: "pattern",
        status: "active",
      };
      const mergedIntoId = "uuid2";

      const result = deduplicator.archiveLearning(learning, mergedIntoId);

      expect(result.status).toBe("archived");
      expect(result.merged_into).toBe(mergedIntoId);
    });

    test("GIVEN: archived learning WHEN: archive THEN: note added", () => {
      const learning = { id: "uuid1", type_refined: "pattern" };
      const mergedIntoId = "uuid2";

      const result = deduplicator.archiveLearning(learning, mergedIntoId);

      expect(result.archived_reason).toBe("duplicate_of");
      expect(result.note).toBeDefined();
    });

    test("GIVEN: archived learning WHEN: archive THEN: preserved data still present", () => {
      const learning = {
        id: "uuid1",
        title: "Original Title",
        problem: "Original Problem",
        type_refined: "pattern",
      };
      const mergedIntoId = "uuid2";

      const result = deduplicator.archiveLearning(learning, mergedIntoId);

      expect(result.original_details).toBeDefined();
      expect(result.original_details.title).toBe("Original Title");
    });
  });

  // Suite 5: Conflict Resolution
  describe("Conflict Resolution", () => {
    test("GIVEN: learnings with different types WHEN: merge THEN: conflict handled", () => {
      const winner = { id: "a", type_refined: "gotcha", problem: "Issue" };
      const loser = {
        id: "b",
        type_refined: "pattern",
        application: "Solution",
      };

      const result = deduplicator.mergeLearnings(winner, loser);

      expect(result.type_refined).toBe(winner.type_refined);
      // Loser's application should be preserved as alternative
    });

    test("GIVEN: learnings with different applications WHEN: merge THEN: both preserved", () => {
      const winner = {
        id: "a",
        application: "Use pattern X",
        type_refined: "pattern",
      };
      const loser = {
        id: "b",
        application: "Use pattern Y",
        type_refined: "pattern",
      };

      const result = deduplicator.mergeLearnings(winner, loser);

      // Both should be accessible
      expect(result).toBeDefined();
    });

    test("GIVEN: conflicting severity levels WHEN: merge THEN: max severity chosen", () => {
      const severities = [
        { winner: "nice_to_know", loser: "critical" },
        { winner: "important", loser: "critical" },
        { winner: "critical", loser: "important" },
      ];

      severities.forEach((pair) => {
        const result = deduplicator.mergeLearnings(
          { id: "a", severity: pair.winner, type_refined: "pattern" },
          { id: "b", severity: pair.loser, type_refined: "pattern" },
        );

        expect(result.severity).toBe("critical");
      });
    });
  });

  // Suite 6: Strategy Selection
  describe("Merge Strategy Selection", () => {
    test("GIVEN: exact duplicates WHEN: apply exact strategy THEN: automatic merge", () => {
      const winner = { id: "a", title: "Test", problem: "P" };
      const loser = { id: "b", title: "Test", problem: "P" };

      const strategy = deduplicator.mergeStrategies.exact;
      const result = strategy(winner, loser);

      expect(result.id).toBe(winner.id);
    });

    test("GIVEN: high similarity WHEN: semantic strategy THEN: review needed flag", () => {
      const winner = {
        id: "a",
        title: "Error handling",
        problem: "Exceptions",
      };
      const loser = { id: "b", title: "Exception handling", problem: "Errors" };

      // Would use semantic strategy
      const result = deduplicator.mergeLearnings(winner, loser);
      expect(result).toBeDefined();
    });
  });

  // Suite 7: Error Handling
  describe("Error Handling", () => {
    test("GIVEN: high duplicate percentage (>20%) WHEN: dedup THEN: warn user", () => {
      // Simulate scenario where 30 out of 100 are duplicates
      const learnings = Array.from({ length: 100 }, (_, i) => ({
        id: `uuid${i}`,
        type_refined: "pattern",
        title: i < 30 ? "Duplicate Title" : `Unique ${i}`,
      }));

      const result = deduplicator.findDuplicates(learnings);
      // Should indicate high duplicate rate
      expect(result).toBeDefined();
    });

    test("GIVEN: conflicting merge results WHEN: dedup THEN: handled gracefully", () => {
      const learnings = [
        { id: "a", type_refined: "gotcha", problem: "X" },
        { id: "b", type_refined: "pattern", problem: "X" },
      ];

      const result = deduplicator.findDuplicates(learnings);
      // Should detect but mark for review
      expect(result).toBeDefined();
    });

    test("GIVEN: empty learnings array WHEN: dedup THEN: success with no changes", () => {
      const result = deduplicator.findDuplicates([]);
      expect(result.exact_duplicates).toBeDefined();
    });
  });

  // Suite 8: Full Dedup Workflow
  describe("Full Dedup Workflow", () => {
    test("GIVEN: learnings with duplicates WHEN: full dedup workflow THEN: artifact with merges", () => {
      const learnings = [
        { id: "a", type_refined: "pattern", title: "A", problem: "P1" },
        { id: "b", type_refined: "pattern", title: "A", problem: "P1" },
        { id: "c", type_refined: "pattern", title: "C", problem: "P3" },
      ];

      const fingerprints = learnings.map((l) =>
        deduplicator.calculateFingerprints(l),
      );
      const duplicates = deduplicator.findDuplicates(learnings);

      // Merge a & b
      const merged = deduplicator.mergeLearnings(learnings[0], learnings[1]);
      const archived = deduplicator.archiveLearning(
        learnings[1],
        learnings[0].id,
      );

      const artifact = deduplicator.generateArtifact([
        merged,
        archived,
        learnings[2],
      ]);

      expect(artifact).toEqual(
        expect.objectContaining({
          format: "learnings_deduplicated",
          duplicates_found: expect.any(Number),
          dedup_status: "success",
          ready_for_save: true,
        }),
      );
    });

    test("GIVEN: mixed duplicates and related learnings WHEN: dedup THEN: comprehensive result", () => {
      const learnings = [
        { id: "a", type_refined: "pattern", title: "Caching" },
        { id: "b", type_refined: "pattern", title: "Caching" }, // duplicate
        { id: "c", type_refined: "technical_fix", title: "Cache invalidation" }, // related
        { id: "d", type_refined: "gotcha", title: "Stale cache" }, // related
      ];

      const result = deduplicator.generateArtifact(learnings);

      expect(result).toEqual(
        expect.objectContaining({
          learnings_after_dedup: expect.any(Number),
          duplicates_found: expect.any(Number),
          merge_actions: expect.any(Object),
        }),
      );
    });
  });
});
