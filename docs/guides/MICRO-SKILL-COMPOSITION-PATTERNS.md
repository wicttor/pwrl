---
title: Micro-Skill Composition Patterns Guide (Phase 7, U7.1)
description: Complete guide for composing micro-skills into orchestrators and pipelines, documenting patterns established through the PWRL architecture refactoring.
type: PWRL Guide
timestamp: 2026-06-12
tags: [micro-skills, composition, patterns, guide, pipeline]
---

# Micro-Skill Composition Patterns Guide (Phase 7, U7.1)

**Document:** Complete guide for composing micro-skills into orchestrators and pipelines

**Last Updated:** 2026-06-12

## Overview

This guide documents the patterns established through Phases 1-4 of the PWRL architecture refactoring. Use these patterns when creating new micro-skills or orchestrators.

---

## Pattern 1: Pure Micro-Skill Orchestrator

**When to Use:** Creating a new workflow that requires multiple sequential phases

**Components:**

1. **Orchestrator (pwrl-X/SKILL.md)**
   - Entry point for users
   - Calls micro-skills in deterministic sequence
   - No branching, no agent routing
   - Passes artifacts between phases

2. **Micro-Skills (pwrl-X-Y/SKILL.md)**
   - Single-responsibility (one task per phase)
   - Deterministic (same input → same output)
   - Testable (complete unit test coverage)
   - Well-documented (README + protocol)

3. **Protocols (pwrl-X-Y/references/\*.md)**
   - Input contract (required/optional fields)
   - Processing steps (algorithm/pseudocode)
   - Output contract (success structure)
   - Error cases (failures + recovery)

4. **Tests (tests/pwrl-X/\*.test.ts)**
   - 40-50 cases per micro-skill
   - Organized into 8-10 test suites
   - GIVEN-WHEN-THEN format
   - Cover happy path + errors + edge cases

### Example: pwrl-learnings Orchestrator

```
Input (code/commit/task/documentation/error/review)
  ↓
Phase 1: pwrl-learnings-extract (Extract learning candidates)
  Input: Source content + type
  Output: Extraction artifact {learnings_found, by_type, learnings, extraction_status}
  ↓
Phase 2: pwrl-learnings-classify (Classify & prioritize)
  Input: Extraction artifact
  Output: Classification artifact {classified_learnings, types_breakdown, priority_breakdown}
  ↓
Phase 3: pwrl-learnings-structure (Structure for storage)
  Input: Classification artifact
  Output: Structure artifact {learnings_stored, storage_path, index_generated}
  ↓
Phase 4: pwrl-learnings-dedup (Detect & merge duplicates)
  Input: Structure artifact
  Output: Dedup artifact {learnings_after_dedup, duplicates_found, archived_mapping}
  ↓
Phase 5: pwrl-learnings-save (Persist to storage)
  Input: Dedup artifact
  Output: Save artifact {learnings_saved, backup_location, git_commit_hash}
  ↓
COMPLETE: Persistent, indexed, deduplicated knowledge base
```

### Pattern Implementation Checklist

For each micro-skill orchestrator, create:

- [ ] **U1: Protocol Document** (~500-600 lines)
  - `<skill>/references/<phase>-protocol.md`
  - Define input/output contracts
  - Document processing steps
  - List all error cases with recovery

- [ ] **U2-U4: Micro-Skill Implementations** (5 files per orchestrator)
  - Each micro-skill: `pwrl-<flow>-<phase>/SKILL.md`
  - Each micro-skill: README.md (200-300 lines)
  - All shared utils integrated

- [ ] **U5: Test Suite** (5 test files, 40-50 tests each)
  - `tests/pwrl-<flow>/<phase>.test.ts`
  - Organized into 8-10 test suites
  - GIVEN-WHEN-THEN format
  - Happy path + error + edge cases

- [ ] **U6: Orchestrator Refactoring**
  - `<skill>/SKILL.md` updated to pure pipeline
  - No agent routing or branching
  - Explicit phase-to-phase artifact passing

- [ ] **U7: Documentation**
  - Main orchestrator README (300+ lines)
  - Each micro-skill README (200-250 lines)
  - Integration guide with other phases

---

## Pattern 2: Artifact-Based Data Flow

**When to Use:** Passing data between phases/skills

**Key Principles:**

1. **Explicit Contracts**
   - Each phase produces typed artifact
   - Next phase knows exact structure
   - Schema defined in protocol
   - Validated before use

2. **YAML Frontmatter** (All artifacts)

   ```yaml
   ---
   artifact_type: extraction
   version: "1.0"
   created: "2026-06-12T14:58:00Z"
   created_by: "pwrl-learnings-extract"
   input_reference: "source_id_xyz"
   ---
   ```

3. **Immutable Passing**
   - Artifact from phase 1 → phase 2 (read-only)
   - Phase 2 reads all fields from phase 1
   - Phase 2 creates new artifact (doesn't modify input)
   - Original artifact always preserved (for audit trail)

### Example: Learning Pipeline Data Flow

**Phase 1 Output (Extraction Artifact):**

```typescript
{
  artifact_type: "extraction",
  learnings_found: 5,
  by_type: { gotcha: 2, pattern: 2, decision: 1 },
  learnings: [
    { id: "uuid1", type: "gotcha", title: "...", content: "...", source: {...} }
  ],
  extraction_status: "success",
  ready_for_classification: true
}
```

**Phase 2 Input = Phase 1 Output** (read fully)

**Phase 2 Processing:**

```typescript
function classify(extractionArtifact) {
  const learnings = extractionArtifact.learnings;  // read all fields

  // Process without modifying
  const classified = learnings.map(l => ({
    ...l,  // preserve all fields from phase 1
    domain: determineDomain(l),
    priority: calculatePriority(l),
    tags: assignTags(l)
  }));

  // Return new artifact (never modify input)
  return {
    artifact_type: "classification",
    classified_learnings: classified,
    ...  // phase 2 specific fields
  };
}
```

**Phase 2 Output (Classification Artifact):**

```typescript
{
  artifact_type: "classification",
  classified_learnings: [
    { id: "uuid1", type: "gotcha", domain: "backend", priority: "important", ... }
  ],
  types_breakdown: {...},
  ready_for_structure: true
}
```

**Phase 3 Receives Both:**

- Phase 2 output (new classifications)
- Can access phase 1 data via cross-reference in artifact
- Never modifies either

---

## Pattern 3: Error Handling & Recovery

**When to Use:** Handling failures at any phase

**Structure:**

```typescript
try {
  const result = await microSkill.process(input);
  return { status: "success", result };
} catch (error) {
  const recovery = getRecoverySuggestion(error);

  if (recovery.is_recoverable) {
    return {
      status: "error_with_recovery",
      error: error.message,
      recovery_action: recovery.action, // "retry", "ask_user", "skip_phase", etc.
      recovery_details: recovery.details,
    };
  } else {
    return {
      status: "fatal_error",
      error: error.message,
      action: "halt_pipeline",
    };
  }
}
```

**Error Categories (Standard Across All Skills):**

| Category             | Recovery        | Example                                                |
| -------------------- | --------------- | ------------------------------------------------------ |
| **Input Validation** | Ask user        | Invalid field type → ask user to provide correct value |
| **Network**          | Retry           | API timeout → retry up to 3 times                      |
| **File System**      | Fix & Retry     | Permission denied → suggest chmod and retry            |
| **Data**             | Skip/Fix        | Encoding error → suggest encoding and rescan           |
| **Resource**         | Cleanup & Retry | Disk full → clean backups and retry                    |
| **Logic**            | Ask User        | Ambiguous type → ask user to clarify                   |
| **Fatal**            | Halt            | Database connection failed → halt pipeline             |

**Shared Error Library:**

```typescript
// lib/errors.js
class ValidationError extends Error { ... }
class NetworkError extends Error { ... }
class FileSystemError extends Error { ... }
class DataError extends Error { ... }
class ResourceError extends Error { ... }
class LogicError extends Error { ... }
class FatalError extends Error { ... }

// lib/recovery-suggestions.js
const suggestions = {
  ValidationError: "Provide field in correct format",
  NetworkError: "Retry connection, check network",
  FileSystemError: "Check file permissions or disk space",
  // ... etc
}
```

---

## Pattern 4: Testing Strategy

**When to Use:** Testing micro-skills or orchestrators

**Test Suite Organization (8-10 suites per skill):**

1. **Happy Path** — Normal operation
2. **Input Validation** — Invalid/missing inputs
3. **Error Handling** — Error scenarios
4. **Edge Cases** — Boundary conditions
5. **Performance** — Speed benchmarks
6. **Integration** — Phase-to-phase compatibility
7. **Recovery** — Error recovery procedures
8. **Dependencies** — External service mocking

**Test Format:**

```typescript
describe("pwrl-learnings-extract: Extract learnings from source", () => {
  let extract: any;

  beforeEach(() => {
    extract = new LearningsExtractor();
  });

  describe("Happy Path Suite", () => {
    test("GIVEN code with FIXME comment, WHEN extracted, THEN creates learning candidate", async () => {
      const input = {
        type: "code",
        content: "// FIXME: race condition here\nfunction doX(){}",
      };
      const result = await extract.process(input);
      expect(result.learnings_found).toBe(1);
      expect(result.learnings[0].type).toBe("gotcha");
    });
  });

  describe("Input Validation Suite", () => {
    test("GIVEN missing required field, WHEN validated, THEN throws ValidationError", async () => {
      const input = { type: "code" }; // missing content
      await expect(() => extract.process(input)).rejects.toThrow(
        "content required",
      );
    });
  });

  // ... 6-8 more suites
});
```

**Checklist per Test Suite:**

- [ ] At least 4-5 test cases
- [ ] GIVEN-WHEN-THEN format
- [ ] All assertions clear
- [ ] Mocks cleaned up in afterEach
- [ ] No console.log/debug statements
- [ ] Async tests have timeout

---

## Pattern 5: Documentation Structure

**When to Use:** Documenting new skills

**For Orchestrator (pwrl-X/README.md):**

```markdown
# pwrl-X Orchestrator

**Phase N of PWRL Architecture Refactoring**

Brief description of what this orchestrator does.

## Architecture

Mermaid diagram showing 4-5 phase pipeline.

## Micro-Skills

Section for each micro-skill:

- Name and link to README
- Purpose (2-3 lines)
- Input/Output
- Test count

## Integration

How this orchestrator works with other phases.

## Performance Targets

Table of execution times and limits.

## Patterns Established

What new patterns this phase introduces.
```

**For Micro-Skill (pwrl-X-Y/README.md):**

```markdown
# pwrl-X-Y Micro-Skill

**Phase N of pwrl-X Pipeline**

What this phase does.

## Purpose

One-sentence summary.

## Input

List of input fields.

## Processing

1. Step 1 description
2. Step 2 description
   ... (usually 5-8 steps)

## Output

Artifact structure.

## [Category Criteria]

Table specific to this skill.

## Testing

Reference to test file with count.

## Error Cases

Table of errors and recovery.

## Next Phase

Link to next micro-skill README.
```

---

## Pattern 6: Shared Utilities

**When to Use:** Common functionality across multiple skills

**Created in Phase 5:**

1. **lib/context-extraction.js** — Gather context from files/git/tasks
2. **lib/github-integration.js** — GitHub API calls with rate limiting
3. **lib/artifact-io.js** — Read/write artifacts with validation
4. **lib/errors.js** — Standardized error classes
5. **lib/recovery-suggestions.js** — Error recovery guidance

**Usage Pattern:**

```typescript
import { extractContext } from "../lib/context-extraction.js";
import { saveArtifact, loadArtifact } from "../lib/artifact-io.js";
import { ValidationError } from "../lib/errors.js";

async function myMicroSkill(input) {
  // Use shared utilities
  const context = await extractContext(input);
  const previousArtifact = await loadArtifact(input.artifact_path);

  // Process
  const result = doProcessing(context, previousArtifact);

  // Save
  await saveArtifact(result, output_path);
}
```

**Benefits:**

- Eliminate duplication
- Consistent error handling
- Easier to test (mock once)
- Single source of truth
- Performance optimization centralized

---

## Pattern 7: Performance Optimization

**When to Use:** Improving pipeline speed

**Common Bottlenecks:**

1. **File I/O** — Use batch operations
2. **API Calls** — Use caching + rate limiting
3. **Large Datasets** — Use streaming/chunking
4. **Regex** — Pre-compile patterns
5. **Sorting** — Use fast algorithms

**Benchmarking Pattern:**

```typescript
test("GIVEN 1000 learnings, WHEN dedup runs, THEN completes in <1s", async () => {
  const start = performance.now();
  const result = await dedup.process(largeArtifact);
  const elapsed = performance.now() - start;

  expect(elapsed).toBeLessThan(1000); // 1 second
});
```

---

## Pattern 8: Backward Compatibility

**When to Use:** Maintaining API compatibility during refactoring

**Rules:**

1. **Input Format Unchanged** — Same parameters accepted
2. **Output Format Unchanged** — Same result structure
3. **Error Messages** — Same wording or clearly better
4. **Behavior** — Same results for same inputs
5. **Performance** — <5% overhead acceptable

**Compatibility Tests:**

```typescript
test("GIVEN same input as original, WHEN refactored runs, THEN output identical", async () => {
  const legacyOutput = getLegacyTestCase();
  const newOutput = await refactoredSkill.process(legacyOutput.input);

  expect(newOutput).toEqual(legacyOutput.output);
});
```

---

## Common Mistakes to Avoid

1. **Branching Logic in Orchestrators**
   - ❌ Wrong: `if (agent available) { agent() } else { fallback() }`
   - ✅ Right: Pure sequence of micro-skills

2. **Modifying Input Artifacts**
   - ❌ Wrong: `extractArtifact.learnings.push(...)`
   - ✅ Right: `const newLearnings = [...extractArtifact.learnings, ...]`

3. **Inconsistent Error Handling**
   - ❌ Wrong: Some skills return errors, others throw
   - ✅ Right: Use shared error library consistently

4. **Skipping Test Cases**
   - ❌ Wrong: `test.skip('should handle error', ...)`
   - ✅ Right: Fix the error or document why skipped

5. **Untested Code Paths**
   - ❌ Wrong: Error recovery code never tested
   - ✅ Right: Test all error cases in error suite

6. **Large Monolithic Functions**
   - ❌ Wrong: 200-line function doing everything
   - ✅ Right: Break into 5-10 smaller steps

7. **Duplicate Utility Code**
   - ❌ Wrong: Each skill re-implements context extraction
   - ✅ Right: Use shared lib/context-extraction.js

8. **Poor Documentation**
   - ❌ Wrong: No README, protocol or test references
   - ✅ Right: Complete docs with examples

---

## Checklist for New Micro-Skill Orchestrator

Before merging new work, verify:

- [ ] **Architecture**
  - [ ] 4-5 micro-skills in sequence
  - [ ] No branching logic
  - [ ] Explicit artifact passing
  - [ ] Clear dependencies

- [ ] **Protocols**
  - [ ] Input/output contracts defined
  - [ ] Processing steps documented
  - [ ] All error cases listed
  - [ ] Recovery procedures specified

- [ ] **Implementation**
  - [ ] All micro-skills created
  - [ ] Shared utilities used where applicable
  - [ ] No duplication vs. other skills
  - [ ] Code <500 lines per file avg

- [ ] **Testing**
  - [ ] 40-50 tests per micro-skill
  - [ ] 8-10 test suites
  - [ ] GIVEN-WHEN-THEN format
  - [ ] Happy path + errors + edges

- [ ] **Documentation**
  - [ ] Main orchestrator README
  - [ ] Each micro-skill README
  - [ ] All protocols documented
  - [ ] Examples provided

- [ ] **Quality**
  - [ ] Code coverage ≥80%
  - [ ] No linting errors
  - [ ] Performance <5% overhead
  - [ ] Backward compatible

- [ ] **Integration**
  - [ ] Works with other phases
  - [ ] Shared utilities adopted
  - [ ] Error handling consistent
  - [ ] Ready for production

---

## Related Documents

- [Architecture Refactoring Guide](architecture-refactoring-guide.md)
- [Skill Documentation Template](../learnings/pattern/skill-documentation-template.md)
- [Testing Best Practices](../learnings/pattern/testing-best-practices.md)
