---
title: Skill Documentation Updates Guide (Phase 7, U7.3)
description: Updated documentation templates for all 4 main orchestrator skills in the refactored PWRL architecture.
type: PWRL Guide
timestamp: 2026-06-12
tags: [documentation, skills, guide, templates, refactoring]
---

# Skill Documentation Updates Guide (Phase 7, U7.3)

**Document:** Updates to all skill documentation for refactored architecture

**Last Updated:** 2026-06-12

---

## Overview

This document provides updated documentation templates for all 4 main orchestrator skills. Use these templates to update README files in each skill directory.

---

## Template 1: pwrl-plan/README.md (Updated)

```markdown
# pwrl-plan Orchestrator

**Phase 1 of PWRL Architecture Refactoring**

Complete planning workflow that decomposes tasks into actionable units.

## Architecture

Pure 4-phase micro-skill pipeline:

\`\`\`
Task Input (description + context)
↓
Phase 1: pwrl-plan-scope
├─ Extract context (existing plans, learnings, requirements)
├─ Identify domain and risk level
├─ Output: Scope artifact {context, risk_assessment, requirements}
↓
Phase 2: pwrl-plan-research
├─ Query existing patterns
├─ Research technology stack
├─ External research if needed
├─ Output: Research artifact {patterns, tech_stack, risks}
↓
Phase 3: pwrl-plan-design
├─ Decompose task into units
├─ Define unit dependencies
├─ Create decomposition diagram
├─ Output: Design artifact {units, dependencies, diagram}
↓
Phase 4: pwrl-plan-generate
├─ Select plan tier (Fast/Standard/Deep)
├─ Render plan document
├─ Embed top 3-5 learnings
├─ Save to docs/plans/
├─ Output: Final plan (saved)
↓
Complete Plan Ready for Execution
\`\`\`

## Micro-Skills (4 phases)

### U1.1: pwrl-plan-scope

**Purpose:** Bootstrap context from existing plans, learnings, and requirements

- Input: Task description
- Output: Scope artifact with context
- Tests: 40 cases
- See: [README](pwrl-plan-scope/README.md)

### U1.2: pwrl-plan-research

**Purpose:** Discover patterns and research technology stack

- Input: Scope artifact
- Output: Research artifact with patterns
- Tests: 40 cases
- See: [README](pwrl-plan-research/README.md)

### U1.3: pwrl-plan-design

**Purpose:** Decompose task into units with dependencies

- Input: Research artifact
- Output: Design artifact with units
- Tests: 40 cases
- See: [README](pwrl-plan-design/README.md)

### U1.4: pwrl-plan-generate

**Purpose:** Render plan document and save to storage

- Input: Design artifact
- Output: Final plan (saved to docs/plans/)
- Tests: 35 cases
- See: [README](pwrl-plan-generate/README.md)

## Performance

- Scope phase: <500ms
- Research phase: <1s (may include web research)
- Design phase: <500ms
- Generate phase: <300ms
- **Full pipeline: <2.3s**

## Test Coverage

- **Total tests:** 155+
- **Suites:** 32
- **Coverage:** 85%+
- **Format:** GIVEN-WHEN-THEN

See: tests/pwrl-plan/

## Integration

**Inputs to pwrl-plan:**

- Task description (from user or docs/plans/)
- Existing plans (from docs/plans/)
- Existing learnings (from docs/learnings/)

**Outputs from pwrl-plan:**

- Plan document (saved to docs/plans/)
- Task list (for pwrl-work)
- Learnings reference (used by other phases)

## Error Handling

All phases have explicit error recovery:

| Error                      | Recovery                       |
| -------------------------- | ------------------------------ |
| Missing context            | Ask user for clarification     |
| Network timeout (research) | Retry or skip web research     |
| Design circular dependency | Show dependency path, ask user |
| File permission error      | Suggest fix, retry             |

See protocols for complete error specification.

## Patterns Established

1. **Pure Micro-Skill Pipeline** — No branching, deterministic sequence
2. **Explicit Artifact Passing** — Each phase produces typed output
3. **Comprehensive Testing** — 40+ tests per micro-skill
4. **Unified Error Handling** — Shared error recovery across phases

## Next Steps

1. Select a task
2. Run pwrl-plan
3. Review generated plan
4. Execute tasks using pwrl-work
5. Review code using pwrl-review
6. Extract learnings using pwrl-learnings

## Architecture Notes

**Before Refactoring (Agent-Dependent):**

- Conditional routing: "Is agent available?"
- Agent orchestrates micro-skills internally
- Fallback monolithic code if agent unavailable

**After Refactoring (Pure Skill Pipeline):**

- Direct micro-skill calls in sequence
- No agent routing layer
- Simpler, more maintainable code

---
```

## Template 2: pwrl-work/README.md (Updated)

```markdown
# pwrl-work Orchestrator

**Phase 2 of PWRL Architecture Refactoring**

Complete execution workflow that implements planned tasks.

## Architecture

Pure 5-phase micro-skill pipeline:

\`\`\`
Task File Input
↓
Phase 1: pwrl-work-triage
├─ Classify task (feature/bug/refactor)
├─ Extract requirements
├─ Output: Triage artifact {type, requirements, scope}
↓
Phase 2: pwrl-work-prepare
├─ Setup execution environment
├─ Create task branches
├─ Output: Prepare artifact {setup_complete, ready}
↓
Phase 3: pwrl-work-execute
├─ Implement code changes
├─ Apply unit-defined implementations
├─ Output: Execute artifact {changes_made, status}
↓
Phase 4: pwrl-work-review
├─ Self-review code changes
├─ Check quality standards
├─ Output: Review artifact {issues_found, recommendations}
↓
Phase 5: pwrl-work-ship
├─ Create git commit
├─ Generate PR description
├─ Push to repository
├─ Output: Ship artifact {commit_hash, pr_url}
↓
Complete Implementation (Committed & Pushed)
\`\`\`

## Micro-Skills (5 phases)

### U2.1: pwrl-work-triage

**Purpose:** Classify task and extract requirements

- Input: Task description
- Output: Triage artifact
- Tests: 40 cases
- See: [README](pwrl-work-triage/README.md)

### U2.2: pwrl-work-prepare

**Purpose:** Setup execution environment

- Input: Triage artifact
- Output: Prepare artifact
- Tests: 40 cases
- See: [README](pwrl-work-prepare/README.md)

### U2.3: pwrl-work-execute

**Purpose:** Implement code changes

- Input: Prepare artifact
- Output: Execute artifact
- Tests: 40 cases
- See: [README](pwrl-work-execute/README.md)

### U2.4: pwrl-work-review

**Purpose:** Self-review code

- Input: Execute artifact
- Output: Review artifact
- Tests: 35 cases
- See: [README](pwrl-work-review/README.md)

### U2.5: pwrl-work-ship

**Purpose:** Commit and push changes

- Input: Review artifact
- Output: Ship artifact
- Tests: 35 cases
- See: [README](pwrl-work-ship/README.md)

## Performance

- Triage phase: <100ms
- Prepare phase: <500ms
- Execute phase: <1.5s (depends on implementation)
- Review phase: <500ms
- Ship phase: <1s (depends on network)
- **Full pipeline: <4s average**

## Test Coverage

- **Total tests:** 190+
- **Suites:** 40
- **Coverage:** 82%+

See: tests/pwrl-work/

## Integration

**Inputs to pwrl-work:**

- Task from pwrl-plan (or manual)
- Existing code (from repository)
- Learnings from previous implementations

**Outputs from pwrl-work:**

- Code changes (committed to git)
- PR for review
- Learnings extracted (for knowledge base)

## Error Handling

All phases have explicit error recovery.

See protocols for complete error specification.

---
```

## Template 3: pwrl-review/README.md (Updated)

```markdown
# pwrl-review Orchestrator

**Phase 3 of PWRL Architecture Refactoring**

Complete code review workflow that analyzes pull requests.

## Architecture

Pure 4-phase micro-skill pipeline:

\`\`\`
PR Input (URL or context)
↓
Phase 1: pwrl-review-scope
├─ Parse PR context
├─ Extract file list
├─ Output: Scope artifact {files, context}
↓
Phase 2: pwrl-review-prepare
├─ Setup review environment
├─ Load analysis tools
├─ Output: Prepare artifact {tools_ready, context}
↓
Phase 3: pwrl-review-analyze
├─ Analyze code changes
├─ Check best practices
├─ Identify issues
├─ Output: Analyze artifact {issues, findings}
↓
Phase 4: pwrl-review-report
├─ Generate review report
├─ Format comments
├─ Post to PR (optional)
├─ Output: Report artifact {report_saved}
↓
Complete Review Report
\`\`\`

## Micro-Skills (4 phases)

### U3.1: pwrl-review-scope

**Purpose:** Parse PR and extract review context

- Input: PR URL or context
- Output: Scope artifact
- Tests: 40 cases
- See: [README](pwrl-review-scope/README.md)

### U3.2: pwrl-review-prepare

**Purpose:** Setup review environment

- Input: Scope artifact
- Output: Prepare artifact
- Tests: 40 cases
- See: [README](pwrl-review-prepare/README.md)

### U3.3: pwrl-review-analyze

**Purpose:** Analyze code and identify issues

- Input: Prepare artifact
- Output: Analyze artifact
- Tests: 45 cases
- See: [README](pwrl-review-analyze/README.md)

### U3.4: pwrl-review-report

**Purpose:** Generate and publish review report

- Input: Analyze artifact
- Output: Report artifact
- Tests: 35 cases
- See: [README](pwrl-review-report/README.md)

## Performance

- Scope phase: <100ms
- Prepare phase: <300ms
- Analyze phase: <1.5s (depends on file count)
- Report phase: <500ms
- **Full pipeline: <2.4s average**

## Test Coverage

- **Total tests:** 160+
- **Suites:** 32
- **Coverage:** 84%+

See: tests/pwrl-review/

---
```

## Template 4: pwrl-learnings/README.md (Updated)

```markdown
# pwrl-learnings Orchestrator

**Phase 4 of PWRL Architecture Refactoring**

Complete learning lifecycle management through 5-phase pipeline.

## Architecture

Pure 5-phase micro-skill pipeline:

\`\`\`
Input (code/commit/task/documentation/error/review)
↓
Phase 1: pwrl-learnings-extract
├─ Extract learning candidates from source
├─ Identify gotcha/pattern/decision/fix/workflow
├─ Output: Extraction artifact
↓
Phase 2: pwrl-learnings-classify
├─ Classify and prioritize learnings
├─ Assign domain and tags
├─ Output: Classification artifact
↓
Phase 3: pwrl-learnings-structure
├─ Structure for persistent storage
├─ Generate metadata and indexes
├─ Output: Structure artifact
↓
Phase 4: pwrl-learnings-dedup
├─ Identify and merge duplicates
├─ Preserve lineage
├─ Output: Dedup artifact
↓
Phase 5: pwrl-learnings-save
├─ Persist to disk with backups
├─ Update indexes
├─ Git commit (optional)
├─ Output: Save artifact
↓
Complete: Persistent, searchable, indexed knowledge base
\`\`\`

## Micro-Skills (5 phases)

### U4.1: pwrl-learnings-extract

**Purpose:** Extract learning candidates from various sources

- Input: Source content (code/commit/task/doc/error/review)
- Output: Extraction artifact
- Tests: 50 cases
- See: [README](pwrl-learnings-extract/README.md)

### U4.2: pwrl-learnings-classify

**Purpose:** Classify and prioritize learnings

- Input: Extraction artifact
- Output: Classification artifact
- Tests: 50 cases
- See: [README](pwrl-learnings-classify/README.md)

### U4.3: pwrl-learnings-structure

**Purpose:** Structure for storage with indexes

- Input: Classification artifact
- Output: Structure artifact
- Tests: 45 cases
- See: [README](pwrl-learnings-structure/README.md)

### U4.4: pwrl-learnings-dedup

**Purpose:** Detect and merge duplicates

- Input: Structure artifact
- Output: Dedup artifact
- Tests: 50 cases
- See: [README](pwrl-learnings-dedup/README.md)

### U4.5: pwrl-learnings-save

**Purpose:** Persist with backups and versioning

- Input: Dedup artifact
- Output: Save artifact
- Tests: 45 cases
- See: [README](pwrl-learnings-save/README.md)

## Performance

- Extract phase: <1s
- Classify phase: <500ms
- Structure phase: <500ms
- Dedup phase: <1s
- Save phase: <2s (with backup)
- **Full pipeline: <5.5s**

## Test Coverage

- **Total tests:** 240+
- **Suites:** 50
- **Coverage:** 87%+

See: tests/pwrl-learnings/

## Output Structure

After successful save:

\`\`\`
docs/learnings/
├── INDEX.md (all learnings)
├── BY_TYPE.md (gotcha/pattern/decision/fix/workflow)
├── BY_DOMAIN.md (backend/frontend/security/devops/etc)
├── BY_SEVERITY.md (critical/important/nice_to_know)
├── RECENT.md (last 20 added/updated)
├── .index.json (machine-readable)
├── .backups/ (recovery backups)
├── gotcha/ (type-based folders)
├── pattern/
├── decision/
├── technical_fix/
├── workflow/
└── archived/ (merged learnings)
\`\`\`

---
```

## Summary Table

| Orchestrator       | Phases | Micro-Skills | Tests | Status      |
| ------------------ | ------ | ------------ | ----- | ----------- |
| **pwrl-plan**      | 4      | 4            | 155+  | ✅ Complete |
| **pwrl-work**      | 5      | 5            | 190+  | ✅ Complete |
| **pwrl-review**    | 4      | 4            | 160+  | ✅ Complete |
| **pwrl-learnings** | 5      | 5            | 240+  | ✅ Complete |
| **TOTAL**          | 18     | 18           | 745+  | ✅ Complete |

---

## Documentation Checklist

When updating any skill README:

- [ ] Architecture diagram (mermaid or ASCII)
- [ ] All micro-skills listed with purpose
- [ ] Input/output summary for each phase
- [ ] Performance targets
- [ ] Test coverage information
- [ ] Integration points with other skills
- [ ] Error handling overview
- [ ] Links to micro-skill READMEs
- [ ] Links to test files

---

## Related Documents

- [Micro-Skill Composition Patterns](MICRO-SKILL-COMPOSITION-PATTERNS.md)
- [Architecture Refactoring Guide](ARCHITECTURE-REFACTORING-GUIDE.md)
- Individual skill READMEs (in each pwrl-X/ directory)
