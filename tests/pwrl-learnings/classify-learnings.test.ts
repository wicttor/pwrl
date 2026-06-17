import { describe, test, expect, beforeEach } from "@jest/globals";

describe("pwrl-learnings-classify: Classify and prioritize learnings", () => {
  let classifier: any;

  beforeEach(() => {
    classifier = {
      refineType: (learning: any) => ({ ...learning }),
      assignDomain: (learning: any) => ({ ...learning }),
      assessPriority: (learning: any) => ({ ...learning }),
      assessApplicability: (learning: any) => ({ ...learning }),
      addTags: (learning: any) => ({ ...learning }),
      identifyRelated: (learnings: any[]) => ({}),
      generateArtifact: (learnings: any[]) => ({}),
    };
  });

  // Suite 1: Type Refinement
  describe("Type Refinement", () => {
    test("GIVEN: learning with preliminary gotcha type WHEN: refine THEN: confirm or adjust", () => {
      const learning = {
        id: "uuid1",
        type: "gotcha",
        title: "Async race condition",
        problem: "Unexpected interleaving of operations",
      };

      const result = classifier.refineType(learning);
      expect(result.type).toBe("gotcha");
    });

    test("GIVEN: learning with wrong initial type WHEN: refine THEN: correct to pattern", () => {
      const learning = {
        id: "uuid2",
        type: "gotcha",
        title: "Memoization technique",
        problem: "Expensive function called repeatedly",
        application: "Cache results using closure",
      };

      const result = classifier.refineType(learning);
      expect(result.type_refined).toBe("pattern");
    });

    test("GIVEN: learning about technology choice WHEN: refine THEN: classify as decision", () => {
      const learning = {
        id: "uuid3",
        type: "unclassified",
        title: "Why we chose TypeScript",
        problem: "Need type safety for team project",
        application: "Use TypeScript for strict typing",
      };

      const result = classifier.refineType(learning);
      expect(result.type_refined).toBe("decision");
    });

    test("GIVEN: learning about specific bug fix WHEN: refine THEN: classify as technical_fix", () => {
      const learning = {
        id: "uuid4",
        type: "gotcha",
        title: "SQL injection vulnerability fixed",
        problem: "User input directly in SQL queries",
        application: "Always use parameterized queries",
      };

      const result = classifier.refineType(learning);
      expect(result.type_refined).toBe("technical_fix");
    });

    test("GIVEN: learning about workflow improvement WHEN: refine THEN: classify as workflow", () => {
      const learning = {
        id: "uuid5",
        type: "pattern",
        title: "Smaller PRs improve review velocity",
        problem: "Large monolithic PRs take too long to review",
        application: "Break work into smaller, focused PRs",
      };

      const result = classifier.refineType(learning);
      expect(result.type_refined).toBe("workflow");
    });

    test("GIVEN: ambiguous learning fitting two types WHEN: refine THEN: assign primary with confidence", () => {
      const learning = {
        id: "uuid6",
        type: "unclassified",
        title: "Event listener memory leak",
        problem: "Listeners not removed on cleanup",
        application: "Use .removeEventListener in cleanup",
      };

      const result = classifier.refineType(learning);
      expect(result.type_refined).toMatch(/gotcha|technical_fix/);
      expect(result.classification_confidence).toBeLessThan(1.0);
    });

    test("GIVEN: unclassified learning WHEN: refine THEN: assign valid type", () => {
      const learning = {
        id: "uuid7",
        type: "unclassified",
        title: "Something learned",
        problem: "Some problem",
        application: "Some solution",
      };

      const result = classifier.refineType(learning);
      expect(result.type_refined).toMatch(
        /gotcha|pattern|decision|technical_fix|workflow/,
      );
    });
  });

  // Suite 2: Domain Assignment
  describe("Domain Assignment", () => {
    test("GIVEN: learning about Node.js/TypeScript WHEN: assign domain THEN: backend", () => {
      const learning = {
        type_refined: "pattern",
        title: "Async patterns in TypeScript",
        problem: "Managing asynchronous operations",
        keywords: ["async", "await", "TypeScript", "Node.js"],
      };

      const result = classifier.assignDomain(learning);
      expect(result.domains).toContain("backend");
    });

    test("GIVEN: learning about React/CSS WHEN: assign domain THEN: frontend", () => {
      const learning = {
        type_refined: "pattern",
        title: "React hook patterns",
        keywords: ["React", "hooks", "useEffect", "CSS"],
      };

      const result = classifier.assignDomain(learning);
      expect(result.domains).toContain("frontend");
    });

    test("GIVEN: learning about security validation WHEN: assign domain THEN: security", () => {
      const learning = {
        type_refined: "technical_fix",
        title: "SQL injection prevention",
        keywords: ["security", "SQL", "validation", "injection"],
      };

      const result = classifier.assignDomain(learning);
      expect(result.domains).toContain("security");
    });

    test("GIVEN: learning about deployment WHEN: assign domain THEN: devops", () => {
      const learning = {
        type_refined: "pattern",
        title: "CI/CD pipeline configuration",
        keywords: ["deployment", "CI", "CD", "container", "kubernetes"],
      };

      const result = classifier.assignDomain(learning);
      expect(result.domains).toContain("devops");
    });

    test("GIVEN: learning about git workflow WHEN: assign domain THEN: process", () => {
      const learning = {
        type_refined: "workflow",
        title: "Feature branch workflow",
        keywords: ["git", "workflow", "branching", "PR"],
      };

      const result = classifier.assignDomain(learning);
      expect(result.domains).toContain("process");
    });

    test("GIVEN: learning spanning multiple domains WHEN: assign THEN: all applicable domains", () => {
      const learning = {
        type_refined: "technical_fix",
        title: "Security in microservices deployment",
        keywords: ["security", "deployment", "microservices", "authentication"],
      };

      const result = classifier.assignDomain(learning);
      expect(result.domains.length).toBeGreaterThan(1);
      expect(result.domains).toEqual(
        expect.arrayContaining(["security", "devops"]),
      );
    });

    test("GIVEN: learning with unknown domain WHEN: assign THEN: use closest match", () => {
      const learning = {
        type_refined: "pattern",
        title: "Unknown domain pattern",
        keywords: ["obscure_tech", "pattern"],
      };

      const result = classifier.assignDomain(learning);
      expect(result.domains.length).toBeGreaterThan(0);
    });
  });

  // Suite 3: Priority Assessment
  describe("Priority Assessment", () => {
    test("GIVEN: learning about security vulnerability WHEN: assess THEN: critical priority", () => {
      const learning = {
        type_refined: "technical_fix",
        title: "SQL injection exploit found",
        problem: "Direct SQL queries with user input",
        domains: ["security"],
      };

      const result = classifier.assessPriority(learning);
      expect(result.severity).toBe("critical");
    });

    test("GIVEN: learning about blocking workflow WHEN: assess THEN: critical priority", () => {
      const learning = {
        type_refined: "gotcha",
        title: "Race condition in async queue",
        problem: "Blocks all concurrent operations",
        domains: ["backend"],
      };

      const result = classifier.assessPriority(learning);
      expect(result.severity).toBe("critical");
    });

    test("GIVEN: learning about significant performance improvement WHEN: assess THEN: important priority", () => {
      const learning = {
        type_refined: "pattern",
        title: "Database query optimization with caching",
        problem: "Repeated expensive queries",
        application: "Implement query cache",
      };

      const result = classifier.assessPriority(learning);
      expect(result.severity).toBe("important");
    });

    test("GIVEN: learning about best practice WHEN: assess THEN: important priority", () => {
      const learning = {
        type_refined: "pattern",
        title: "Error handling with try-catch",
        problem: "Unhandled promise rejections",
        application: "Always catch async errors",
      };

      const result = classifier.assessPriority(learning);
      expect(result.severity).toBe("important");
    });

    test("GIVEN: learning about edge case WHEN: assess THEN: nice_to_know priority", () => {
      const learning = {
        type_refined: "gotcha",
        title: "JavaScript type coercion edge case",
        problem: "Null == undefined returns true",
        frequency: "rare",
      };

      const result = classifier.assessPriority(learning);
      expect(result.severity).toBe("nice_to_know");
    });

    test("GIVEN: learning about uncommon optimization WHEN: assess THEN: nice_to_know priority", () => {
      const learning = {
        type_refined: "pattern",
        title: "Micro-optimization of string concatenation",
        problem: "String.concat vs + operator performance",
        applicability: "very_specific",
      };

      const result = classifier.assessPriority(learning);
      expect(result.severity).toBe("nice_to_know");
    });

    test("GIVEN: learning about common mistake WHEN: assess THEN: important priority", () => {
      const learning = {
        type_refined: "gotcha",
        title: "Modifying array during iteration",
        problem: "forEach loop index issues",
        frequency: "common",
      };

      const result = classifier.assessPriority(learning);
      expect(result.severity).toMatch(/important|critical/);
    });
  });

  // Suite 4: Applicability Scoring
  describe("Applicability Assessment", () => {
    test("GIVEN: learning highly relevant to project WHEN: assess applicability THEN: score 8-10", () => {
      const learning = {
        type_refined: "pattern",
        title: "Node.js async patterns",
        domains: ["backend"],
        project_stack: ["Node.js", "TypeScript"],
      };

      const result = classifier.assessApplicability(learning);
      expect(result.applicability.current_project).toBeGreaterThanOrEqual(8);
    });

    test("GIVEN: learning broadly applicable WHEN: assess applicability THEN: general score 7-10", () => {
      const learning = {
        type_refined: "pattern",
        title: "Error handling best practices",
        domains: ["backend", "frontend"],
      };

      const result = classifier.assessApplicability(learning);
      expect(result.applicability.general).toBeGreaterThanOrEqual(7);
    });

    test("GIVEN: learning specific to old tech WHEN: assess applicability THEN: low score, time_sensitive true", () => {
      const learning = {
        type_refined: "pattern",
        title: "Callbacks for async in older JavaScript",
        domains: ["frontend"],
        deprecated_tech: true,
      };

      const result = classifier.assessApplicability(learning);
      expect(result.applicability.current_project).toBeLessThan(5);
      expect(result.applicability.time_sensitive).toBe(true);
    });

    test("GIVEN: learning somewhat applicable WHEN: assess THEN: score 5-7", () => {
      const learning = {
        type_refined: "pattern",
        title: "iOS development optimization",
        domains: ["frontend"],
        project_type: "web_app",
      };

      const result = classifier.assessApplicability(learning);
      expect(result.applicability.current_project).toBeLessThan(7);
    });

    test("GIVEN: learning niche but valuable WHEN: assess THEN: low project score, high general score", () => {
      const learning = {
        type_refined: "technical_fix",
        title: "Chrome DevTools specific debugging",
        domains: ["frontend"],
        niche: true,
      };

      const result = classifier.assessApplicability(learning);
      expect(result.applicability.current_project).toBeLessThan(
        result.applicability.general,
      );
    });
  });

  // Suite 5: Tag Assignment
  describe("Tag Assignment", () => {
    test("GIVEN: learning about TypeScript WHEN: assign tags THEN: include language, framework", () => {
      const learning = {
        type_refined: "pattern",
        title: "TypeScript generics patterns",
        problem: "Reusable type-safe code",
        keywords: ["typescript", "generics", "types"],
      };

      const result = classifier.addTags(learning);
      expect(result.tags).toContain("typescript");
      expect(result.tags).toContain("types");
    });

    test("GIVEN: learning about React WHEN: assign tags THEN: include framework and topic", () => {
      const learning = {
        type_refined: "pattern",
        title: "React hooks best practices",
        keywords: ["react", "hooks", "state"],
      };

      const result = classifier.addTags(learning);
      expect(result.tags).toContain("react");
      expect(result.tags).toContain("hooks");
    });

    test("GIVEN: learning about security WHEN: assign tags THEN: include security topic", () => {
      const learning = {
        type_refined: "technical_fix",
        title: "CSRF protection",
        keywords: ["security", "csrf", "web"],
      };

      const result = classifier.addTags(learning);
      expect(result.tags).toContain("security");
    });

    test("GIVEN: learning with difficulty WHEN: assign tags THEN: include difficulty level", () => {
      const learning = {
        type_refined: "pattern",
        title: "Advanced async patterns",
        complexity: "advanced",
      };

      const result = classifier.addTags(learning);
      expect(result.tags).toContain("advanced");
    });

    test("GIVEN: complex learning WHEN: assign tags THEN: multiple relevant tags", () => {
      const learning = {
        type_refined: "decision",
        title: "Microservices architecture with TypeScript and Kubernetes",
        keywords: ["typescript", "microservices", "kubernetes", "architecture"],
      };

      const result = classifier.addTags(learning);
      expect(result.tags.length).toBeGreaterThan(2);
      expect(result.tags).toEqual(
        expect.arrayContaining(["typescript", "architecture"]),
      );
    });
  });

  // Suite 6: Duplicate Detection
  describe("Duplicate and Related Learning Detection", () => {
    test("GIVEN: exact duplicate learnings WHEN: identify related THEN: mark as duplicate", () => {
      const learnings = [
        {
          id: "uuid1",
          type_refined: "pattern",
          title: "Memoization pattern",
          problem: "Expensive repeated calls",
        },
        {
          id: "uuid2",
          type_refined: "pattern",
          title: "Memoization pattern",
          problem: "Expensive repeated calls",
        },
      ];

      const result = classifier.identifyRelated(learnings);
      expect(result.duplicates_found).toBeGreaterThan(0);
    });

    test("GIVEN: partial duplicate learnings WHEN: identify related THEN: flag for review", () => {
      const learnings = [
        {
          id: "uuid1",
          type_refined: "pattern",
          title: "Error handling with try-catch",
          problem: "Unhandled errors crash app",
        },
        {
          id: "uuid2",
          type_refined: "pattern",
          title: "Exception handling in async",
          problem: "Unhandled promise rejections",
        },
      ];

      const result = classifier.identifyRelated(learnings);
      // Should detect similarity
      expect(result).toHaveProperty("high_similarity_pairs");
    });

    test("GIVEN: complementary learnings WHEN: identify related THEN: link as related", () => {
      const learnings = [
        {
          id: "uuid1",
          type_refined: "technical_fix",
          title: "Race condition fix",
          problem: "Concurrent access to shared state",
          solution: "Use lock",
        },
        {
          id: "uuid2",
          type_refined: "pattern",
          title: "Lock-based synchronization",
          problem: "Multiple threads accessing resource",
          application: "Mutex or lock mechanism",
        },
      ];

      const result = classifier.identifyRelated(learnings);
      expect(result.related_pairs).toContainEqual(
        expect.objectContaining({
          learning1_id: expect.any(String),
          learning2_id: expect.any(String),
        }),
      );
    });

    test("GIVEN: multiple learnings WHEN: build relation graph THEN: identify clusters", () => {
      const learnings = [
        { id: "a", title: "Async", type_refined: "pattern" },
        { id: "b", title: "Promises", type_refined: "pattern" },
        { id: "c", title: "Async/await", type_refined: "pattern" },
        { id: "d", title: "TypeScript", type_refined: "decision" },
      ];

      const result = classifier.identifyRelated(learnings);
      expect(result).toHaveProperty("related_pairs");
    });
  });

  // Suite 7: Confidence Scoring
  describe("Classification Confidence", () => {
    test("GIVEN: clear, unambiguous learning WHEN: classify THEN: high confidence >0.9", () => {
      const learning = {
        type_refined: "technical_fix",
        title: "SQL injection prevention",
        problem: "Clear security issue",
        domains: ["security"],
        severity: "critical",
      };

      const result = classifier.refineType(learning);
      expect(result.classification_confidence).toBeGreaterThan(0.9);
    });

    test("GIVEN: ambiguous learning WHEN: classify THEN: medium confidence 0.6-0.8", () => {
      const learning = {
        type_refined: "unclassified",
        title: "Performance concern or design pattern",
        problem: "Could be either optimization or approach",
      };

      const result = classifier.refineType(learning);
      expect(result.classification_confidence).toBeLessThan(0.9);
      expect(result.classification_confidence).toBeGreaterThan(0.5);
    });

    test("GIVEN: very unclear learning WHEN: classify THEN: low confidence <0.7", () => {
      const learning = {
        type_refined: "unclassified",
        title: "Something about code",
        problem: "Unclear what this is about",
        application: "Unknown",
      };

      const result = classifier.refineType(learning);
      expect(result.classification_confidence).toBeLessThan(0.7);
    });
  });

  // Suite 8: Integration
  describe("Full Classification Workflow", () => {
    test("GIVEN: extracted learning WHEN: full classification THEN: refined artifact with all fields", () => {
      const learning = {
        id: "uuid-123",
        type: "unclassified",
        title: "Async race condition prevention",
        problem: "Concurrent modifications to queue",
        application: "Use locks for shared resources",
        domains: [],
        tags: [],
      };

      // Full pipeline
      const typeRefined = classifier.refineType(learning);
      const domainAssigned = classifier.assignDomain(typeRefined);
      const priorityAssessed = classifier.assessPriority(domainAssigned);
      const applicabilityAssessed =
        classifier.assessApplicability(priorityAssessed);
      const tagsAdded = classifier.addTags(applicabilityAssessed);

      expect(tagsAdded).toEqual(
        expect.objectContaining({
          type_refined: expect.stringMatching(
            /gotcha|pattern|decision|technical_fix|workflow/,
          ),
          severity: expect.stringMatching(/critical|important|nice_to_know/),
          domains: expect.arrayContaining(["backend"]),
          applicability: expect.objectContaining({
            current_project: expect.any(Number),
            general: expect.any(Number),
            time_sensitive: expect.any(Boolean),
          }),
          tags: expect.any(Array),
        }),
      );
    });

    test("GIVEN: multiple learnings WHEN: classify all and detect duplicates THEN: full artifact", () => {
      const learnings = [
        {
          id: "a",
          type: "gotcha",
          title: "Race condition",
          problem: "Concurrent access",
        },
        {
          id: "b",
          type: "pattern",
          title: "Lock pattern",
          problem: "Resource sharing",
        },
      ];

      const classified = learnings.map((l) => {
        const refined = classifier.refineType(l);
        const domain = classifier.assignDomain(refined);
        const priority = classifier.assessPriority(domain);
        const applicability = classifier.assessApplicability(priority);
        return classifier.addTags(applicability);
      });

      const related = classifier.identifyRelated(classified);
      const artifact = classifier.generateArtifact(classified);

      expect(artifact).toEqual(
        expect.objectContaining({
          format: "learnings_classification",
          classified_learnings: expect.arrayContaining([
            expect.objectContaining({ id: "a" }),
            expect.objectContaining({ id: "b" }),
          ]),
          classification_status: "success",
          ready_for_deduplication: true,
        }),
      );
    });
  });
});
