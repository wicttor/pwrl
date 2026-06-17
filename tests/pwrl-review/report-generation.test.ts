/**
 * tests/pwrl-review/report-generation.test.ts
 * Unit tests for pwrl-review-report micro-skill (U3.4)
 */
describe("pwrl-review-report: Review Report Generation", () => {
  describe("Report Formatting", () => {
    test("Creates executive summary", () => {
      const result = reviewReport({
        issues_found: 3,
        critical_issues: 0,
        recommendation: "approved",
      });
      expect(result.report_sections.executive_summary).toBeDefined();
      expect(result.report_sections.executive_summary).toContain("Approved");
    });

    test("Organizes findings by category", () => {
      const result = reviewReport({
        findings: {
          code_quality: [{ issue: "complexity" }],
          security: [{ issue: "injection" }],
          tests: [{ issue: "coverage" }],
          documentation: [{ issue: "missing comment" }],
        },
      });
      expect(result.report_sections.code_quality_findings).toBeDefined();
      expect(result.report_sections.security_findings).toBeDefined();
      expect(result.report_sections.test_findings).toBeDefined();
      expect(result.report_sections.documentation_findings).toBeDefined();
    });

    test("Displays integration status", () => {
      const result = reviewReport({
        integration_check: {
          builds: true,
          tests: true,
          imports: true,
          regressions: false,
        },
      });
      expect(result.report_sections.integration_status).toContain("Build");
      expect(result.report_sections.integration_status).toContain("✓");
    });

    test("Includes line numbers and snippets", () => {
      const result = reviewReport({
        findings: {
          code_quality: [
            {
              file: "src/email.ts",
              line: 45,
              issue: "Complex logic",
            },
          ],
        },
      });
      expect(result.report_sections.code_quality_findings).toContain("45");
      expect(result.report_sections.code_quality_findings).toContain(
        "email.ts",
      );
    });
  });

  describe("Approval Decision Logic", () => {
    test("Approves clean code (0 critical)", () => {
      const result = reviewReport({
        critical_issues: 0,
        major_issues: 0,
        integration_check: { builds: true, tests: true },
      });
      expect(result.verdict).toBe("approved");
      expect(result.ready_to_ship).toBe(true);
    });

    test("Approves with few minor issues", () => {
      const result = reviewReport({
        critical_issues: 0,
        major_issues: 0,
        minor_issues: 3,
        integration_check: { builds: true, tests: true },
      });
      expect(result.verdict).toBe("approved");
    });

    test("Requests changes for fixable issues (1-2 critical)", () => {
      const result = reviewReport({
        critical_issues: 1,
        major_issues: 3,
        integration_check: { builds: true, tests: false },
      });
      expect(result.verdict).toBe("request-changes");
      expect(result.ready_to_ship).toBe(false);
    });

    test("Requests changes for high major issues (5-10)", () => {
      const result = reviewReport({
        critical_issues: 0,
        major_issues: 7,
      });
      expect(result.verdict).toBe("request-changes");
    });

    test("Rejects for high critical count (>2)", () => {
      const result = reviewReport({
        critical_issues: 3,
        major_issues: 5,
      });
      expect(result.verdict).toBe("rejected");
      expect(result.ready_to_ship).toBe(false);
    });

    test("Rejects for build failure", () => {
      const result = reviewReport({
        critical_issues: 0,
        integration_check: { builds: false },
      });
      expect(result.verdict).toBe("rejected");
    });

    test("Rejects for test failure", () => {
      const result = reviewReport({
        critical_issues: 0,
        integration_check: { builds: true, tests: false },
      });
      expect(result.verdict).toBe("rejected");
    });
  });

  describe("Recommendation Generation", () => {
    test("Approved: ready to ship", () => {
      const result = reviewReport({
        verdict: "approved",
      });
      expect(result.recommendation).toContain("ready to ship");
    });

    test("Request changes: lists specific issues", () => {
      const result = reviewReport({
        verdict: "request-changes",
        critical_issues: 1,
        major_issues: 2,
        findings: {
          security: [{ issue: "missing validation" }],
          code_quality: [{ issue: "complexity" }, { issue: "unused var" }],
        },
      });
      expect(result.recommendation).toContain("validation");
      expect(result.recommendation).toContain("complexity");
    });

    test("Rejected: return to implementation", () => {
      const result = reviewReport({
        verdict: "rejected",
      });
      expect(result.recommendation).toContain("return");
      expect(result.recommendation).toContain("implementation");
    });
  });

  describe("User Interaction", () => {
    test("User approves review", () => {
      mockUserResponse("yes");
      const result = reviewReport({
        verdict: "approved",
      });
      expect(result.user_approval).toBe(true);
      expect(result.ready_to_ship).toBe(true);
    });

    test("User rejects and returns to implementation", () => {
      mockUserResponse("no");
      const result = reviewReport({
        verdict: "request-changes",
      });
      expect(result.user_approval).toBe(false);
      expect(result.ready_to_ship).toBe(false);
    });

    test("User asks for clarification", () => {
      mockUserResponse("clarify");
      const result = reviewReport({
        verdict: "request-changes",
      });
      expect(result.user_asked_clarification).toBe(true);
    });
  });

  describe("Issue Severity Breakdown", () => {
    test("Summarizes critical issues", () => {
      const result = reviewReport({
        critical_issues: 2,
        findings: {
          security: [
            { severity: "critical", issue: "SQL injection" },
            { severity: "critical", issue: "XSS" },
          ],
        },
      });
      expect(result.issues_summary.critical).toBe(2);
    });

    test("Summarizes major issues", () => {
      const result = reviewReport({
        major_issues: 3,
        findings: {
          code_quality: [
            { severity: "major", issue: "complexity" },
            { severity: "major", issue: "missing tests" },
          ],
          tests: [{ severity: "major", issue: "coverage" }],
        },
      });
      expect(result.issues_summary.major).toBe(3);
    });

    test("Summarizes minor issues", () => {
      const result = reviewReport({
        minor_issues: 2,
        findings: {
          documentation: [
            { severity: "minor", issue: "comment" },
            { severity: "minor", issue: "type" },
          ],
        },
      });
      expect(result.issues_summary.minor).toBe(2);
    });
  });

  describe("Display Formatting", () => {
    test("Formats readable report with sections", () => {
      const result = reviewReport({
        unit_id: "U2",
        verdict: "approved",
        issues_found: 0,
      });
      expect(result.formatted_report).toContain("CODE REVIEW REPORT");
      expect(result.formatted_report).toContain("U2");
      expect(result.formatted_report).toContain("VERDICT");
    });

    test("Uses checkmarks and symbols", () => {
      const result = reviewReport({
        integration_check: {
          builds: true,
          tests: false,
        },
      });
      expect(result.formatted_report).toContain("✓");
      expect(result.formatted_report).toContain("✗");
    });

    test("Organizes critical issues first", () => {
      const result = reviewReport({
        critical_issues: 1,
        major_issues: 2,
        minor_issues: 3,
      });
      const critical_pos = result.formatted_report.indexOf("CRITICAL");
      const major_pos = result.formatted_report.indexOf("MAJOR");
      const minor_pos = result.formatted_report.indexOf("MINOR");
      expect(critical_pos).toBeLessThan(major_pos);
      expect(major_pos).toBeLessThan(minor_pos);
    });
  });

  describe("Artifact Generation", () => {
    test("Generates report artifact", () => {
      const result = reviewReport({ unit_id: "U2" });
      expect(result.format).toBe("pwrl-review-report-artifact");
      expect(result.report_id).toBeDefined();
    });

    test("Includes verdict and user approval", () => {
      mockUserResponse("yes");
      const result = reviewReport({ unit_id: "U2", verdict: "approved" });
      expect(result.verdict).toBeDefined();
      expect(result.user_approval).toBeDefined();
    });

    test("References analyze artifact", () => {
      const result = reviewReport({
        unit_id: "U2",
        input_analyze_id: "2026-06-12-U2-analyze",
      });
      expect(result.input_analyze_id).toBe("2026-06-12-U2-analyze");
    });
  });

  describe("Edge Cases", () => {
    test("Handles no issues found (clean review)", () => {
      const result = reviewReport({
        issues_found: 0,
        critical_issues: 0,
        major_issues: 0,
        minor_issues: 0,
      });
      expect(result.verdict).toBe("approved");
      expect(result.formatted_report).toContain("clean");
    });

    test("Handles all issues critical", () => {
      const result = reviewReport({
        critical_issues: 5,
        major_issues: 0,
        minor_issues: 0,
      });
      expect(result.verdict).toBe("rejected");
    });

    test("Handles large number of issues", () => {
      const result = reviewReport({
        critical_issues: 10,
        major_issues: 20,
        minor_issues: 50,
      });
      expect(result.verdict).toBe("rejected");
      expect(result.formatted_report).toBeDefined();
    });

    test("Handles missing integration check", () => {
      const result = reviewReport({
        critical_issues: 0,
        integration_check: undefined,
      });
      expect(result.verdict).toBe("approved");
      expect(result.formatted_report).toContain("integration");
    });
  });
});

function reviewReport(input: any): any {}
function mockUserResponse(response: string) {}
