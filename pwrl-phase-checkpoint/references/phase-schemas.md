# Phase Schemas & Artifact Structure

Canonical artifact structure for each phase across all PWRL workflows. Use this to validate artifacts at checkpoints.

---

## PWRL Review Phases

### Phase 1: Scope Validation

**Artifact Name:** `scope-artifact.yml`

**Required Fields:**

```yaml
---
phase: 1
phase_name: "scope-validation"
workflow: "pwrl-review"
timestamp: "ISO-8601"
input:
  source_branch: string (branch name or PR)
  requirements_context: string (extracted from task/plan)
output:
  scope_verdict: enum ["on-target", "justified", "creep-detected"]
  files_analyzed: string[] (non-empty list)
  scope_issues: string[] (empty list if on-target)
interaction_mode: enum ["detailed", "yolo"]
user_confirmed: boolean
---
```

**Quality Gates:**

- ✓ `scope_verdict` must be set (not null/empty)
- ✓ `files_analyzed` must contain ≥1 file
- ✓ `interaction_mode` must be declared
- ✓ `user_confirmed` must be true
- ✓ If creep detected: `scope_issues` must list them

---

### Phase 2: Prepare Review

**Artifact Name:** `prepare-artifact.yml`

**Required Fields:**

```yaml
---
phase: 2
phase_name: "prepare-review"
workflow: "pwrl-review"
timestamp: "ISO-8601"
input:
  scope_verdict: string (from Phase 1)
  approved_scope: boolean
output:
  diff_summary:
    files_changed: number (>0)
    lines_added: number
    lines_removed: number
  review_scope:
    code_quality: boolean
    security: boolean
    tests: boolean
    documentation: boolean
    integration: boolean
  tools_configured:
    linter: boolean
    test_framework: boolean
    coverage_tool: boolean
    build_system: boolean
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `files_changed` > 0
- ✓ `review_scope` has ≥3 analysis areas enabled
- ✓ All required tools configured (linter, test_framework, coverage_tool, build_system)
- ✓ Diff accessible (diff gathered)

---

### Phase 3: Analyze Code

**Artifact Name:** `analyze-artifact.yml`

**Required Fields:**

```yaml
---
phase: 3
phase_name: "analyze-code"
workflow: "pwrl-review"
timestamp: "ISO-8601"
findings:
  code_quality:
    issues: string[] (may be empty)
    severity: enum ["critical", "major", "minor"][]
  security:
    issues: string[] (may be empty)
    severity: enum ["critical", "major", "minor"][]
  tests:
    issues: string[] (may be empty)
    coverage_pct: number (0-100)
    test_count: number
  documentation:
    issues: string[] (may be empty)
    updated: boolean
  integration:
    build_passes: boolean
    tests_pass: boolean
    regressions: string[] (should be empty)
critical_issue_count: number (≥0)
major_issue_count: number (≥0)
---
```

**Quality Gates:**

- ✓ All analysis categories present (quality, security, tests, docs, integration)
- ✓ `build_passes` must be true
- ✓ `tests_pass` must be true (0 test failures)
- ✓ `regressions` list empty (no broken existing tests)
- ✓ `coverage_pct` ≥ 50
- ✓ `critical_issue_count` < 3
- ✓ `major_issue_count` < 11

---

### Phase 4: Generate Report

**Artifact Name:** `report-artifact.yml`

**Required Fields:**

```yaml
---
phase: 4
phase_name: "generate-report"
workflow: "pwrl-review"
timestamp: "ISO-8601"
verdict: enum ["approved", "request-changes", "rejected"]
rationale: string (explains verdict)
issues_summary:
  critical: number (≥0)
  major: number (≥0)
  minor: number (≥0)
recommendations: string[] (may be empty if approved)
user_confirmed_verdict: boolean
ready_to_merge: boolean
---
```

**Quality Gates:**

- ✓ `verdict` must be set (approved|request-changes|rejected)
- ✓ `rationale` non-empty
- ✓ Verdict matches issue counts (approved→0-5 major, request-changes→5-10 major, rejected→>10 major)
- ✓ `user_confirmed_verdict` must be true
- ✓ `ready_to_merge` consistent with verdict

---

## PWRL Work Phases

### Phase 0: Triage Input

**Artifact Name:** `triage-artifact.yml`

**Required Fields:**

```yaml
---
phase: 0
phase_name: "triage-input"
workflow: "pwrl-work"
timestamp: "ISO-8601"
input_type: enum ["task-file", "plan-file", "bare-prompt", "latest-task"]
output:
  unit_id: string (non-empty, unique identifier)
  title: string (non-empty)
  goal: string (non-empty, describes intended outcome)
  files_to_modify: string[] (non-empty)
  acceptance_criteria: string[] (non-empty, ≥2)
  dependencies: string[] (may be empty)
interaction_mode: enum ["detailed", "yolo"]
user_confirmed: boolean
---
```

**Quality Gates:**

- ✓ `unit_id` non-empty and unique (no conflicts)
- ✓ `title` and `goal` descriptive (>10 chars)
- ✓ `files_to_modify` contains ≥1 file
- ✓ `acceptance_criteria` contains ≥2 criteria
- ✓ `interaction_mode` declared
- ✓ `user_confirmed` true

---

### Phase 1: Prepare Environment

**Artifact Name:** `prepare-artifact.yml`

**Required Fields:**

```yaml
---
phase: 1
phase_name: "prepare-environment"
workflow: "pwrl-work"
timestamp: "ISO-8601"
input:
  unit_id: string (from Phase 0)
  files_to_modify: string[] (from Phase 0)
output:
  branch_name: string (feature branch created or confirmed)
  branch_created: boolean
  repo_clean: boolean
  dependencies_available: boolean
  verification_commands: string[] (non-empty)
  environment_state: string (json or yaml describing Node, npm, db, env vars)
  task_file_moved: boolean
  task_status_updated: boolean
ambiguities_resolved: boolean
interaction_mode: string (from Phase 0)
---
```

**Quality Gates:**

- ✓ `repo_clean` true (no uncommitted changes)
- ✓ `branch_created` or existing branch confirmed
- ✓ `dependencies_available` true (all tools/libraries accessible)
- ✓ `verification_commands` contains ≥2 commands (test, lint, build)
- ✓ `task_file_moved` true (task in docs/tasks/in-progress/)
- ✓ `task_status_updated` true (frontmatter marked in-progress)
- ✓ `ambiguities_resolved` true (all vague items clarified)

---

### Phase 2: Execute Implementation

**Artifact Name:** `execute-artifact.yml`

**Required Fields:**

```yaml
---
phase: 2
phase_name: "execute-implementation"
workflow: "pwrl-work"
timestamp: "ISO-8601"
implementation:
  files_modified: string[] (non-empty)
  lines_added: number (≥0)
  lines_removed: number (≥0)
  commits: string[] (non-empty)
  debug_code_removed: boolean
quality_gates:
  tests_passing: boolean (all tests pass, 0 failures)
  tests_count: number (≥0)
  lint_passing: boolean (0 errors)
  build_passing: boolean (0 errors)
  coverage_pct: number (≥50)
  no_regressions: boolean (existing tests unchanged)
acceptance_criteria_met: string[] (list of criteria verified)
task_file_moved: boolean
task_status_updated: boolean
interaction_mode: string (from Phase 0)
---
```

**Quality Gates:**

- ✓ `files_modified` non-empty (≥1 file)
- ✓ `tests_passing` true (0 test failures)
- ✓ `tests_count` > 0 (at least 1 test written)
- ✓ `lint_passing` true (0 linting errors)
- ✓ `build_passing` true (0 build errors)
- ✓ `coverage_pct` ≥ 50
- ✓ `no_regressions` true
- ✓ `acceptance_criteria_met` contains all criteria from Phase 0
- ✓ `task_file_moved` true (task in docs/tasks/for-review/)
- ✓ `task_status_updated` true (frontmatter marked for-review)

---

### Phase 3: Review & Verify

**Artifact Name:** `review-artifact.yml`

**Required Fields:**

```yaml
---
phase: 3
phase_name: "review-quality"
workflow: "pwrl-work"
timestamp: "ISO-8601"
review:
  scope_valid: boolean (no unrelated changes)
  diff_quality: string (summary of code review)
  tests_adequate: boolean (coverage & scenarios)
  documentation_updated: boolean (README, comments, types)
  duplication_detected: string[] (may be empty)
  consolidated: boolean
verdict: enum ["approved", "request-changes", "rejected"]
rationale: string
ready_to_ship: boolean
user_confirmed_verdict: boolean
---
```

**Quality Gates:**

- ✓ `scope_valid` true (only files from Phase 0 modified)
- ✓ `tests_adequate` true (coverage ≥50%, multiple scenarios)
- ✓ `documentation_updated` true (README, types, comments)
- ✓ `verdict` set (approved|request-changes|rejected)
- ✓ `ready_to_ship` consistent with verdict
- ✓ `user_confirmed_verdict` true

---

## PWRL Plan Phases

### Phase 1: Scope

**Artifact Name:** `scope-artifact.yml`

**Required Fields:**

```yaml
---
phase: 1
phase_name: "scope"
workflow: "pwrl-plan"
timestamp: "ISO-8601"
output:
  problem_frame: string (non-empty)
  intended_behavior: string (non-empty)
  success_criteria: string[] (non-empty, ≥2)
  related_learnings: string[] (may be empty)
  learning_gaps: string[] (may be empty)
  requirements_found: string[] (may be empty)
interaction_mode: enum ["detailed", "yolo"]
user_confirmed: boolean
---
```

**Quality Gates:**

- ✓ `problem_frame` non-empty and descriptive
- ✓ `intended_behavior` non-empty and specific
- ✓ `success_criteria` contains ≥2 measurable criteria
- ✓ `interaction_mode` declared
- ✓ `user_confirmed` true

---

### Phase 2: Research

**Artifact Name:** `research-artifact.yml`

**Required Fields:**

```yaml
---
phase: 2
phase_name: "research"
workflow: "pwrl-plan"
timestamp: "ISO-8601"
output:
  tech_stack_detected: string[] (non-empty)
  local_patterns: string[] (non-empty)
  risk_areas: object
    area: string
    severity: enum ["low", "medium", "high"]
    recommendation: string
  external_research: string[] (may be empty)
  learnings_integrated: boolean
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `tech_stack_detected` contains ≥1 technology
- ✓ `local_patterns` identifies ≥1 pattern
- ✓ `risk_areas` lists any identified risks with recommendations
- ✓ `learnings_integrated` true if HIGH-relevance learnings exist

---

### Phase 3: Design

**Artifact Name:** `design-artifact.yml`

**Required Fields:**

```yaml
---
phase: 3
phase_name: "design"
workflow: "pwrl-plan"
timestamp: "ISO-8601"
output:
  units: object[]
    unit_id: string (U1, U2, etc)
    description: string (non-empty)
    acceptance_criteria: string[] (≥2)
    test_scenarios: string[] (≥2)
  dependencies: object
    unit_id: string
    depends_on: string[] (may be empty)
  complexity: enum ["low", "medium", "high"]
  effort_estimate_hours: number (>0)
  risk_mitigations: string[] (may be empty)
  mermaid_diagrams: boolean (if complexity = high)
user_confirmed_design: boolean
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `units` contains ≥1 implementation unit
- ✓ Each unit has ≥2 acceptance criteria
- ✓ Each unit has ≥2 test scenarios
- ✓ `complexity` set (low|medium|high)
- ✓ If complexity = high: `mermaid_diagrams` true
- ✓ `user_confirmed_design` true

---

### Phase 4: Generate

**Artifact Name:** `plan-artifact.yml`

**Required Fields:**

```yaml
---
phase: 4
phase_name: "generate"
workflow: "pwrl-plan"
timestamp: "ISO-8601"
output:
  plan_file: string (path to generated plan, non-empty)
  plan_tier: enum ["fast", "standard", "deep"]
  units_count: number (>0)
  learnings_embedded: string[] (may be empty)
  learning_gaps_documented: boolean
user_confirmed_plan: boolean
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `plan_file` non-empty (file exists at specified path)
- ✓ `plan_tier` set (fast|standard|deep)
- ✓ `units_count` ≥1
- ✓ Learnings embedded if any found in Phase 1
- ✓ Learning gaps documented if complexity = deep
- ✓ `user_confirmed_plan` true

---

## PWRL Tasks

### Phase 3: Generate Tasks & Index

**Artifact Name:** `tasks-artifact.yml`

**Required Fields:**

```yaml
---
phase: 3
phase_name: "generate-tasks"
workflow: "pwrl-tasks"
timestamp: "ISO-8601"
output:
  tasks_created: object[]
    unit_id: string (U1, U2, etc)
    task_file: string (path, non-empty)
    status: enum ["to-do", "in-progress", "for-review", "done"]
  index_file: string (path to docs/tasks/INDEX.md)
  dependencies_validated: boolean
  critical_path: string[] (ordered unit IDs)
  recommended_starting_tasks: string[] (≥1)
  learnings_mapped: object
    unit_id: string
    learning_count: number
---
```

**Quality Gates:**

- ✓ `tasks_created` contains ≥1 task
- ✓ Each task has `task_file` path (file exists)
- ✓ `index_file` created (docs/tasks/INDEX.md exists)
- ✓ `dependencies_validated` true (no circular deps)
- ✓ `critical_path` contains ordered units
- ✓ `recommended_starting_tasks` contains ≥1 unit

---

## PWRL Learnings Phases

### Phase 1: Extract

**Artifact Name:** `extract-artifact.yml`

**Required Fields:**

```yaml
---
phase: 1
phase_name: "extract"
workflow: "pwrl-learnings"
timestamp: "ISO-8601"
output:
  source_type: enum ["code", "commit", "task", "documentation", "error", "review"]
  candidates: object[]
    text: string (learning candidate, non-empty)
    type: enum ["gotcha", "pattern", "decision", "technical_fix", "workflow"]
    source_reference: string (file/line/commit ref)
  candidate_count: number (>0)
interaction_mode: enum ["detailed", "yolo"]
user_confirmed: boolean
---
```

**Quality Gates:**

- ✓ `source_type` identified
- ✓ `candidates` contains ≥1 learning candidate
- ✓ Each candidate has `text`, `type`, and `source_reference`
- ✓ `interaction_mode` declared
- ✓ `user_confirmed` true

---

### Phase 2: Classify

**Artifact Name:** `classify-artifact.yml`

**Required Fields:**

```yaml
---
phase: 2
phase_name: "classify"
workflow: "pwrl-learnings"
timestamp: "ISO-8601"
output:
  classified: object[]
    text: string (non-empty)
    type: enum ["gotcha", "pattern", "decision", "technical_fix", "workflow"]
    domain: string (e.g., "testing", "architecture", "performance")
    priority: enum ["low", "medium", "high"]
    severity: enum ["low", "medium", "high"]
  duplicates_detected: number (≥0)
  duplicates_tagged: string[] (may be empty)
classified_count: number (>0)
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `classified` contains ≥1 learning
- ✓ Each learning has `type`, `domain`, `priority`, `severity`
- ✓ `classified_count` = count of classified learnings
- ✓ Duplicates identified and tagged

---

### Phase 3: Structure

**Artifact Name:** `structure-artifact.yml`

**Required Fields:**

```yaml
---
phase: 3
phase_name: "structure"
workflow: "pwrl-learnings"
timestamp: "ISO-8601"
output:
  structured: object[]
    id: string (unique learning ID)
    title: string (short, non-empty)
    description: string (non-empty)
    domain: string
    tags: string[] (non-empty)
    source: string (file/commit/task ref)
    metadata:
      created: string (ISO-8601)
      priority: enum ["low", "medium", "high"]
  storage_paths: object
    learning_id: string
    file_path: string (docs/learnings/...)
  index_updated: boolean
structured_count: number (>0)
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `structured` contains ≥1 learning
- ✓ Each learning has `id`, `title`, `description`, `domain`, `tags`
- ✓ `storage_paths` maps each learning to file location
- ✓ `index_updated` true (INDEX.md refreshed)

---

### Phase 4: Deduplicate

**Artifact Name:** `dedup-artifact.yml`

**Required Fields:**

```yaml
---
phase: 4
phase_name: "deduplicate"
workflow: "pwrl-learnings"
timestamp: "ISO-8601"
output:
  merged: object[]
    primary_id: string (canonical learning ID)
    merged_ids: string[] (may be empty)
    reason: string (if merged)
  archived: object[]
    learning_id: string
    archive_reason: string (duplicate|obsolete|superseded)
  dedup_count: number (≥0)
  final_count: number (>0)
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `dedup_count` ≥ 0 (duplicates found and merged)
- ✓ Archived learnings have reason documented
- ✓ `final_count` = total unique learnings after dedup
- ✓ Lineage preserved in `merged_ids`

---

### Phase 5: Save

**Artifact Name:** `save-artifact.yml`

**Required Fields:**

```yaml
---
phase: 5
phase_name: "save"
workflow: "pwrl-learnings"
timestamp: "ISO-8601"
output:
  learnings_saved: number (>0)
  files_created: string[] (file paths, non-empty)
  files_updated: string[] (may be empty)
  index_created: boolean
  backup_created: string (backup file path or "none")
  git_committed: boolean
  commit_sha: string (if committed, non-empty)
saved_count: number (>0)
interaction_mode: string (from Phase 1)
---
```

**Quality Gates:**

- ✓ `learnings_saved` ≥ 1
- ✓ `files_created` contains ≥1 file (all exist)
- ✓ `index_created` true (docs/learnings/INDEX.md exists)
- ✓ `backup_created` non-"none" (backup exists)
- ✓ `git_committed` true
- ✓ `commit_sha` non-empty (commit created)

---

## Extending with Custom Workflows

To add phases for custom workflows (e.g., additional workflow types):

1. Duplicate template above
2. Replace `workflow: "custom-name"`
3. Define required fields for your phases
4. Document quality gates in [quality-gates.md](./quality-gates.md)
5. Register in [standards-mapping.md](./standards-mapping.md)
