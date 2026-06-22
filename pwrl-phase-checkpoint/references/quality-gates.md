# Quality Gates by Phase

Acceptance criteria that MUST be met before a phase is considered complete and progression allowed.

---

## PWRL Review

### Phase 1: Scope Validation

**Must Verify:**

1. ✓ **Scope verdict recorded**
   - Check: `scope_verdict` field exists and is one of: `on-target`, `justified`, `creep-detected`
   - Failure: Verdict not determined

2. ✓ **Files analyzed identified**
   - Check: `files_analyzed` list contains ≥1 file
   - Failure: No files in scope

3. ✓ **Requirements extracted**
   - Check: `requirements_context` non-empty OR `user_confirmed` true
   - Failure: Requirements unclear

4. ✓ **Interaction mode chosen**
   - Check: `interaction_mode` is one of: `detailed`, `yolo`
   - Failure: Mode not specified

5. ✓ **User confirmed scope**
   - Check: `user_confirmed` is true
   - Failure: User has not approved scope

---

### Phase 2: Prepare Review

**Must Verify:**

1. ✓ **Diff gathered successfully**
   - Check: `files_changed` > 0
   - Failure: No diff, or error gathering diff

2. ✓ **Review scope defined**
   - Check: At least 3 of these are true: code_quality, security, tests, documentation, integration
   - Failure: Scope too narrow

3. ✓ **All tools configured**
   - Check: `tools_configured.linter` true
   - Check: `tools_configured.test_framework` true
   - Check: `tools_configured.coverage_tool` true
   - Check: `tools_configured.build_system` true
   - Failure: Any tool missing configuration

4. ✓ **Scope artifact valid**
   - Check: Phase 1 artifact exists and user_confirmed is true
   - Failure: Scope approval missing

---

### Phase 3: Analyze Code

**Must Verify:**

1. ✓ **Build passes**
   - Check: `integration.build_passes` is true
   - Failure: Build has errors

2. ✓ **Tests pass**
   - Check: `integration.tests_pass` is true
   - Failure: Test failures detected

3. ✓ **No regressions**
   - Check: `integration.regressions` is empty list
   - Failure: Existing tests broken

4. ✓ **Coverage adequate**
   - Check: `tests.coverage_pct` ≥ 50
   - Failure: Coverage < 50%

5. ✓ **Critical issues acceptable**
   - Check: `critical_issue_count` < 3
   - Failure: 3+ critical issues

6. ✓ **Major issues acceptable**
   - Check: `major_issue_count` < 11
   - Failure: 11+ major issues

7. ✓ **All analysis categories completed**
   - Check: findings contains: code_quality, security, tests, documentation, integration (all non-null)
   - Failure: Analysis category missing

---

### Phase 4: Generate Report

**Must Verify:**

1. ✓ **Verdict determined**
   - Check: `verdict` is one of: `approved`, `request-changes`, `rejected`
   - Failure: No verdict set

2. ✓ **Rationale provided**
   - Check: `rationale` non-empty and explains verdict
   - Failure: Rationale missing or unclear

3. ✓ **Verdict justified by analysis**
   - Check:
     - If `approved`: critical_count=0, major_count ≤ 5
     - If `request-changes`: 1-2 critical OR 5-10 major
     - If `rejected`: >2 critical OR >10 major
   - Failure: Verdict inconsistent with issue counts

4. ✓ **User confirmed verdict**
   - Check: `user_confirmed_verdict` is true
   - Failure: User has not approved verdict

5. ✓ **Ready to merge consistent**
   - Check: If `verdict` = approved, then `ready_to_merge` = true
   - Failure: Inconsistent state

---

## PWRL Work

### Phase 0: Triage Input

**Must Verify:**

1. ✓ **Unit identified**
   - Check: `unit_id` non-empty and unique (no in-progress task with same ID)
   - Failure: Duplicate or missing unit_id

2. ✓ **Title & goal descriptive**
   - Check: `title` length > 10 chars
   - Check: `goal` length > 10 chars and describes outcome
   - Failure: Title/goal too vague

3. ✓ **Files to modify identified**
   - Check: `files_to_modify` list contains ≥1 file
   - Failure: Unclear which files to change

4. ✓ **Acceptance criteria complete**
   - Check: `acceptance_criteria` list contains ≥2 criteria
   - Check: Each criterion is testable/verifiable
   - Failure: <2 criteria or criteria too vague

5. ✓ **Dependencies clarified**
   - Check: `dependencies` list includes all blocking tasks or external dependencies
   - Failure: Missing dependency list (may be empty if none)

6. ✓ **Interaction mode chosen**
   - Check: `interaction_mode` is one of: `detailed`, `yolo`
   - Failure: Mode not specified

7. ✓ **User confirmed input**
   - Check: `user_confirmed` is true
   - Failure: User has not approved triage

---

### Phase 1: Prepare Environment

**Must Verify:**

1. ✓ **Repository clean**
   - Check: `repo_clean` is true (no uncommitted changes)
   - Failure: Uncommitted changes exist

2. ✓ **Branch ready**
   - Check: `branch_name` non-empty AND (`branch_created` true OR confirmed existing)
   - Failure: Branch not available

3. ✓ **Dependencies available**
   - Check: `dependencies_available` is true (Node, npm, libs, db, env vars all present)
   - Failure: Missing dependency (e.g., Node version, npm install, database)

4. ✓ **Verification commands identified**
   - Check: `verification_commands` list contains ≥2 commands
   - Typical: ["npm test", "npm run lint", "npm run build"]
   - Failure: <2 verification commands or commands invalid

5. ✓ **Task moved to in-progress**
   - Check: `task_file_moved` is true
   - Check: Task file located at `docs/tasks/in-progress/[unit_id].md`
   - Failure: Task file still in to-do

6. ✓ **Task frontmatter updated**
   - Check: `task_status_updated` is true
   - Check: Task frontmatter `status` field = `in-progress`
   - Failure: Frontmatter not updated

7. ✓ **Ambiguities resolved**
   - Check: `ambiguities_resolved` is true
   - Resolved items: file creation vs extension, vague approach, test scenarios, dependency location
   - Failure: Ambiguities remain (ask for clarification)

---

### Phase 2: Execute Implementation

**Must Verify:**

1. ✓ **Tests passing**
   - Check: `quality_gates.tests_passing` is true
   - Check: Test output shows 0 failures
   - Failure: Any test failure blocks progression

2. ✓ **Test count adequate**
   - Check: `tests_count` ≥ 1
   - Failure: No tests written

3. ✓ **Lint passing**
   - Check: `quality_gates.lint_passing` is true
   - Check: Lint output shows 0 errors
   - Failure: Any lint error blocks progression

4. ✓ **Build succeeding**
   - Check: `quality_gates.build_passing` is true
   - Check: Build output shows 0 errors
   - Failure: Any build error blocks progression

5. ✓ **Coverage adequate**
   - Check: `quality_gates.coverage_pct` ≥ 50
   - Failure: Coverage < 50%

6. ✓ **No regressions**
   - Check: `quality_gates.no_regressions` is true
   - Check: All previously passing tests still pass
   - Failure: Existing test broken

7. ✓ **All acceptance criteria met**
   - Check: `acceptance_criteria_met` list includes ALL criteria from Phase 0
   - Failure: Criterion not verified

8. ✓ **Debug code removed**
   - Check: `implementation.debug_code_removed` is true
   - Failure: console.log, debugger, test code remains

9. ✓ **Files modified as planned**
   - Check: `implementation.files_modified` matches `files_to_modify` from Phase 0
   - Failure: Unexpected files modified (scope creep) or expected files skipped

10. ✓ **Task moved to for-review**
    - Check: `task_file_moved` is true
    - Check: Task file located at `docs/tasks/for-review/[unit_id].md`
    - Failure: Task file still in in-progress

11. ✓ **Task frontmatter updated**
    - Check: `task_status_updated` is true
    - Check: Task frontmatter `status` field = `for-review`
    - Failure: Frontmatter not updated

---

### Phase 3: Review & Verify

**Must Verify:**

1. ✓ **Scope valid**
   - Check: `scope_valid` is true
   - Check: Only files from Phase 0 `files_to_modify` were changed
   - Failure: Unrelated file changes (scope creep)

2. ✓ **Tests adequate**
   - Check: `tests_adequate` is true
   - Check: Coverage ≥50% AND multiple test scenarios exist
   - Failure: Inadequate test coverage or scenarios

3. ✓ **Documentation updated**
   - Check: `documentation_updated` is true
   - Check: README, type annotations, comments updated where applicable
   - Failure: Missing documentation

4. ✓ **Verdict determined**
   - Check: `verdict` is one of: `approved`, `request-changes`, `rejected`
   - Failure: No verdict

5. ✓ **User confirmed verdict**
   - Check: `user_confirmed_verdict` is true
   - Failure: User has not approved verdict

6. ✓ **Ready to ship consistent**
   - Check: If `verdict` = approved, then `ready_to_ship` = true
   - Failure: Inconsistent state

---

## PWRL Plan

### Phase 1: Scope

**Must Verify:**

1. ✓ **Problem frame clear**
   - Check: `problem_frame` non-empty and descriptive
   - Failure: Problem undefined

2. ✓ **Success criteria defined**
   - Check: `success_criteria` contains ≥2 measurable criteria
   - Failure: <2 criteria or criteria too vague

3. ✓ **Interaction mode chosen**
   - Check: `interaction_mode` is one of: `detailed`, `yolo`
   - Failure: Mode not specified

4. ✓ **User confirmed scope**
   - Check: `user_confirmed` is true
   - Failure: User has not approved scope

---

### Phase 2: Research

**Must Verify:**

1. ✓ **Tech stack detected**
   - Check: `tech_stack_detected` contains ≥1 technology
   - Failure: Tech stack not identified

2. ✓ **Local patterns identified**
   - Check: `local_patterns` contains ≥1 pattern
   - Failure: No patterns found

3. ✓ **Risk areas assessed**
   - Check: `risk_areas` includes all high-risk areas with recommendations
   - Failure: Risk assessment incomplete

---

### Phase 3: Design

**Must Verify:**

1. ✓ **Implementation units defined**
   - Check: `units` contains ≥1 unit
   - Failure: No units defined

2. ✓ **Each unit has acceptance criteria**
   - Check: Each unit has ≥2 acceptance criteria
   - Failure: Criteria missing

3. ✓ **Each unit has test scenarios**
   - Check: Each unit has ≥2 test scenarios
   - Failure: Test scenarios missing

4. ✓ **Complexity assessed**
   - Check: `complexity` is one of: `low`, `medium`, `high`
   - Failure: Complexity not assessed

5. ✓ **Complex designs documented**
   - Check: If complexity = high, `mermaid_diagrams` true
   - Failure: High complexity missing diagrams

6. ✓ **User confirmed design**
   - Check: `user_confirmed_design` is true
   - Failure: User has not approved design

---

### Phase 4: Generate

**Must Verify:**

1. ✓ **Plan file created**
   - Check: `plan_file` non-empty and file exists at path
   - Failure: Plan file missing

2. ✓ **Plan tier assigned**
   - Check: `plan_tier` is one of: `fast`, `standard`, `deep`
   - Failure: Tier not assigned

3. ✓ **Units included**
   - Check: `units_count` ≥1
   - Failure: No units in plan

4. ✓ **User confirmed plan**
   - Check: `user_confirmed_plan` is true
   - Failure: User has not approved plan

---

## PWRL Tasks

### Phase 3: Generate Tasks

**Must Verify:**

1. ✓ **Tasks created**
   - Check: `tasks_created` contains ≥1 task
   - Failure: No tasks created

2. ✓ **Each task has file**
   - Check: Each task `task_file` exists
   - Failure: Task file missing

3. ✓ **Index created**
   - Check: `index_file` points to existing docs/tasks/INDEX.md
   - Failure: Index file missing

4. ✓ **Dependencies validated**
   - Check: `dependencies_validated` is true (no circular deps)
   - Failure: Invalid dependencies detected

5. ✓ **Critical path defined**
   - Check: `critical_path` contains ordered units
   - Failure: Critical path not determined

6. ✓ **Starting tasks identified**
   - Check: `recommended_starting_tasks` contains ≥1 unit
   - Failure: No starting tasks identified

---

## PWRL Learnings

### Phase 1: Extract

**Must Verify:**

1. ✓ **Source type identified**
   - Check: `source_type` is one of: `code`, `commit`, `task`, `documentation`, `error`, `review`
   - Failure: Source type not identified

2. ✓ **Candidates extracted**
   - Check: `candidates` contains ≥1 learning candidate
   - Failure: No candidates found

3. ✓ **Each candidate typed**
   - Check: Each candidate has valid `type` (gotcha|pattern|decision|technical_fix|workflow)
   - Failure: Candidate type missing or invalid

4. ✓ **Source references recorded**
   - Check: Each candidate has `source_reference` (file/line/commit)
   - Failure: Source tracking missing

5. ✓ **User confirmed extraction**
   - Check: `user_confirmed` is true
   - Failure: User has not approved extraction

---

### Phase 2: Classify

**Must Verify:**

1. ✓ **Learnings classified**
   - Check: `classified` contains ≥1 learning
   - Failure: No classifications made

2. ✓ **Each learning has domain**
   - Check: Each learning has valid `domain` (architecture, testing, performance, etc)
   - Failure: Domain missing

3. ✓ **Priority assigned**
   - Check: Each learning has `priority` (low|medium|high)
   - Failure: Priority not assigned

4. ✓ **Severity assessed**
   - Check: Each learning has `severity` (low|medium|high)
   - Failure: Severity not assessed

---

### Phase 3: Structure

**Must Verify:**

1. ✓ **Learnings structured**
   - Check: `structured` contains ≥1 learning
   - Failure: No structured learnings

2. ✓ **Each learning has unique ID**
   - Check: Each learning has valid `id` (non-empty, unique)
   - Failure: ID missing or duplicate

3. ✓ **Title and description present**
   - Check: Each learning has `title` and `description` (both non-empty)
   - Failure: Title or description missing

4. ✓ **Tags assigned**
   - Check: Each learning has ≥1 tag
   - Failure: No tags assigned

5. ✓ **Storage paths mapped**
   - Check: `storage_paths` maps each learning to file location
   - Failure: Storage mapping incomplete

6. ✓ **Index updated**
   - Check: `index_updated` is true
   - Failure: Index not updated

---

### Phase 4: Deduplicate

**Must Verify:**

1. ✓ **Duplicates identified**
   - Check: `dedup_count` ≥0 (duplicates found and merged)
   - Failure: Dedup process incomplete

2. ✓ **Archived learnings justified**
   - Check: Each archived learning has `archive_reason`
   - Failure: Archive reason missing

3. ✓ **Lineage preserved**
   - Check: `merged` learnings have `merged_ids` with lineage
   - Failure: Merger not tracked

---

### Phase 5: Save

**Must Verify:**

1. ✓ **Learnings saved**
   - Check: `learnings_saved` ≥1
   - Failure: No learnings saved

2. ✓ **Files created**
   - Check: `files_created` contains ≥1 file path (all exist)
   - Failure: Files not created

3. ✓ **Index created**
   - Check: `index_created` is true
   - Failure: Index file missing

4. ✓ **Backup created**
   - Check: `backup_created` non-"none" (backup exists)
   - Failure: Backup missing

5. ✓ **Git committed**
   - Check: `git_committed` is true
   - Failure: Commit not created

6. ✓ **Commit SHA recorded**
   - Check: `commit_sha` non-empty (commit created)
   - Failure: Commit SHA missing

---

## Cross-Workflow Rules

**All Artifacts Must:**

- ✓ Contain required YAML frontmatter with phase, workflow, timestamp
- ✓ Have all required fields populated (no null values for required fields)
- ✓ Be machine-readable (valid YAML/JSON)
- ✓ Link to parent artifact (previous phase output)

**Progression Blocked If:**

- ✗ Artifact missing or invalid
- ✗ Any critical gate fails
- ✗ Phase completion timestamp missing (shows phase not actually run)

**Warnings (Proceed with Confirmation):**

- ⚠ Optional fields missing but non-critical
- ⚠ Minor gate failures that don't block (e.g., 1 minor issue when max is 5)
