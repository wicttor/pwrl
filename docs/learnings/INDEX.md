---
title: Learning Index
type: index
generated: 2026-06-22
total_learnings: 6
---

# PWRL Learning Index

**Last Updated:** 2026-06-22  
**Total Learnings:** 6  
**Categories:** pattern (2), workflow (3), decision (1), gotcha (1)

## By Type

### Pattern (2)

- **[TDD RED Phase - Test-First Specification](pattern/tdd-red-phase-test-first-spec.md)**
  Use dual-implementation comparison to effectively document and prove test specification gaps.
  *Tags: tdd, test-first, specification, behavioral-contract*
  *Severity: HIGH*

- **[Task State Management - Dual-Layer Tracking](pattern/task-state-management-dual-layer-tracking.md)**
  Use file location + frontmatter status for both human-readable and machine-readable state signals.
  *Tags: task-tracking, state-machine, human-readable, machine-readable*
  *Severity: MEDIUM*

### Workflow (3)

- **[Code Review 4-Phase Pipeline](workflow/code-review-4-phase-pipeline.md)**
  Structured code review with deterministic phases, clear artifacts, and quality gates at each phase.
  *Tags: code-review, workflow, quality-gates, deterministic*
  *Severity: HIGH*

- **[Cross-Reference Integration - Single Source of Truth](workflow/cross-reference-integration-single-source-of-truth.md)**
  Establish canonical source for shared concepts, reference from multiple locations, prevent version drift.
  *Tags: documentation, references, deduplication, maintainability*
  *Severity: MEDIUM*

### Decision (1)

- **[Schema Design - Simple Line Parser](decision/schema-design-simple-line-parser.md)**
  Parse YAML using simple 2-space line-based parser (not external library) for lightweight, auditable validator.
  *Tags: schema-design, constraints, no-external-deps, yaml*
  *Severity: HIGH*

### Gotcha (1)

- **[RED Tests as Executable Specification](gotcha/red-tests-as-executable-specification.md)**
  Failing tests in RED phase prove specification gaps, not code bugs. Clear naming and documentation essential.
  *Tags: tdd, red-phase, test-naming, common-mistake*
  *Severity: HIGH*

---

## By Domain

### Testing (3)

- TDD RED Phase - Test-First Specification
- RED Tests as Executable Specification
- Code Review 4-Phase Pipeline (includes testing lens)

### Architecture (1)

- Schema Design - Simple Line Parser

### Process (1)

- Code Review 4-Phase Pipeline

### State Management (1)

- Task State Management - Dual-Layer Tracking

### Documentation (1)

- Cross-Reference Integration - Single Source of Truth

---

## By Severity

### HIGH (4)

- TDD RED Phase - Test-First Specification
- Code Review 4-Phase Pipeline
- Schema Design - Simple Line Parser
- RED Tests as Executable Specification

### MEDIUM (2)

- Task State Management - Dual-Layer Tracking
- Cross-Reference Integration - Single Source of Truth

---

## By Applicability

### all-projects (1)

- TDD RED Phase - Test-First Specification

### all-teams (1)

- Code Review 4-Phase Pipeline

### test-driven-development (1)

- RED Tests as Executable Specification

### validators-parsers (1)

- Schema Design - Simple Line Parser

### task-systems (1)

- Task State Management - Dual-Layer Tracking

### documentation-systems (1)

- Cross-Reference Integration - Single Source of Truth

---

## Search Index

**Keywords:** tdd, red-phase, test-first, specification, schema-design, yaml, parser, code-review, workflow, process, testing, quality-gates, deterministic, task-tracking, state-machine, documentation, references, deduplication, gotcha, common-mistake

**Files:** 6  
**Formats:** Markdown (.md)  
**Repository:** /home/wicttor/Projects/pwrl/docs/learnings/

---

## Quick Links

- **Start with:** TDD RED Phase - Test-First Specification (foundational pattern)
- **Most used:** Code Review 4-Phase Pipeline (cross-team workflow)
- **Critical gotcha:** RED Tests as Executable Specification (avoid misconceptions)
- **Architecture decision:** Schema Design - Simple Line Parser (design rationale)
