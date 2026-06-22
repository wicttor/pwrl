# Standards Compliance & Mapping

This document maps pwrl-phase-checkpoint validation to PWRL foundational standards.

---

## Standards References

All validation rules in pwrl-phase-checkpoint derive from these standards:

| Standard              | Location                     | Purpose                                         |
| --------------------- | ---------------------------- | ----------------------------------------------- |
| **PWRL Skill Schema** | `pwrl-standards/SCHEMA.md`   | Defines artifact structure and phase discipline |
| **PWRL Template**     | `pwrl-standards/TEMPLATE.md` | Canonical format for phases and artifacts       |
| **PWRL Audit**        | `pwrl-standards/AUDIT.md`    | Audit trail requirements for traceability       |

---

## Mapping: Phase Schemas ← PWRL Standards

### Artifact Structure (SCHEMA.md §3)

**Standard Requirement:**

> Artifacts are explicit outputs at each phase. Each artifact contains YAML frontmatter with metadata (phase, workflow, timestamp) and structured body data.

**Checkpoint Implementation:**

- [phase-schemas.md](./phase-schemas.md) defines required fields per phase ✓
- Artifact validation checks frontmatter presence and format ✓
- All fields typed and validated ✓

### Quality Gates (SCHEMA.md §4.3)

**Standard Requirement:**

> Each phase defines acceptance criteria (gates). A phase is complete when all gates pass. Progression blocked if any gate fails.

**Checkpoint Implementation:**

- [quality-gates.md](./quality-gates.md) lists gates per phase ✓
- Checkpoint verification (Step 3) validates each gate ✓
- Progression blocked on any critical gate failure ✓

### Agent Agnosticism (SCHEMA.md §1)

**Standard Requirement:**

> Skills must work across any AI agent framework. No framework-specific syntax. All paths repository-relative.

**Checkpoint Implementation:**

- SKILL.md uses generic terms ("platform's ask_user tool") ✓
- All paths are repository-relative (no absolute paths) ✓
- Artifact format is pure YAML/JSON (framework-agnostic) ✓
- No hardcoded tool or model-specific commands ✓

### Scannability (SCHEMA.md §2)

**Standard Requirement:**

> Skills must be quick to read and unambiguous to execute. Imperative mood, active voice, clear step numbering.

**Checkpoint Implementation:**

- SKILL.md uses imperative headers: "Validate Artifact", "Verify Quality Gates" ✓
- Step-by-step workflow with clear phase numbers ✓
- Active voice throughout ("Check X", "Report Y") ✓

### Right-Sizing (SCHEMA.md §3)

**Standard Requirement:**

> SKILL.md should be 80-170 lines (target 100-150). Complex logic extracted to references/.

**Checkpoint Implementation:**

- SKILL.md: ~140 lines (within acceptable range 80-170) ✓
- Detailed validation rules in references/phase-schemas.md ✓
- Gate definitions in references/quality-gates.md ✓
- Worked examples and checklists in references/checklists-examples.md ✓

### Completeness & Verifiability (SCHEMA.md §4)

**Standard Requirement:**

> All skills must be complete (no external assumptions) and verifiable (testable, deterministic).

**Checkpoint Implementation:**

- Checkpoint defines all validation rules inline ✓
- Quality gates are testable (boolean conditions) ✓
- Artifact format validates deterministically ✓

---

## Mapping: Checkpoint Validation ← TEMPLATE.md

### Phase Template Structure

**Standard Requirement (TEMPLATE.md §2):**

> Each phase follows: Purpose → Input → Processing → Output. Processing includes specific substeps and user interaction.

**Checkpoint Implementation:**

Each gate in [quality-gates.md](./quality-gates.md) validates this structure:

1. **Purpose** ✓ Embedded in phase name (e.g., "Scope Validation")
2. **Input** ✓ Artifact contains input fields (e.g., `source_branch`, `requirements_context`)
3. **Processing** ✓ Gates verify substeps completed (e.g., "files analyzed identified", "requirements extracted")
4. **Output** ✓ Artifact contains output fields (e.g., `scope_verdict`, `files_analyzed`)

### User Interaction

**Standard Requirement (TEMPLATE.md §3.2):**

> Determine interaction mode (detailed vs yolo) early and persist through all phases.

**Checkpoint Implementation:**

- All artifacts include `interaction_mode` field ✓
- Checkpoint validates mode is consistent across phases ✓
- Mode persists from Phase 0 (triage) through Phase 3 (review) ✓

### Artifact Linking

**Standard Requirement (TEMPLATE.md §2.3):**

> Each artifact links to parent phase output (traceability chain).

**Checkpoint Implementation:**

- Each phase artifact includes input fields from previous phase ✓
- Checkpoint checks parent artifact exists before allowing progression ✓
- Artifact chain: Phase0→Phase1→Phase2→Phase3 ✓

---

## Mapping: Audit Trail ← AUDIT.md

### Phase Completion Tracking

**Standard Requirement (AUDIT.md §2):**

> Record when each phase completes, by whom, and with what decisions. Enable resumption from any checkpoint.

**Checkpoint Implementation:**

- All artifacts include `timestamp` (ISO-8601) ✓
- Gates verify phase actually executed (timestamp present) ✓
- Checkpoint can resume from any phase (artifact-driven) ✓

### Decision Logging

**Standard Requirement (AUDIT.md §3):**

> Log all user decisions: scope approval, interaction mode, verdict confirmation, etc.

**Checkpoint Implementation:**

- Artifacts include all user decisions:
  - `user_confirmed` (Phase 0-1)
  - `user_confirmed_verdict` (Phase 3-4)
  - `interaction_mode` (all phases)
  - `scope_verdict` (review Phase 1)
- Checkpoint validates all confirmations present ✓

### Traceability

**Standard Requirement (AUDIT.md §4):**

> Every artifact must be findable, hashable, and immutable after completion.

**Checkpoint Implementation:**

- Artifacts stored at standard paths (docs/artifacts/) ✓
- Artifact paths include unit_id and phase (findable) ✓
- Frontmatter immutable after phase complete (verification only) ✓

---

## Validation Rules Compliance

### Rule: Artifact Generation

**Derived from:** SCHEMA.md §3.1, TEMPLATE.md §2

**Checkpoint Verification:**

1. ✓ File exists at expected path
2. ✓ YAML frontmatter present and valid
3. ✓ All required fields populated
4. ✓ Data types match schema

### Rule: Phase Completeness

**Derived from:** SCHEMA.md §4.3, TEMPLATE.md §3.1

**Checkpoint Verification:**

1. ✓ All substeps in "Processing" section executed
2. ✓ All gates pass (boolean true)
3. ✓ No NULL values in required fields
4. ✓ User confirmations obtained

### Rule: Progression Eligibility

**Derived from:** SCHEMA.md §4.3, AUDIT.md §2

**Checkpoint Verification:**

- ✓ Current phase artifact valid
- ✓ All current phase gates pass
- ✓ Previous phase artifact exists and valid
- ✓ No blocking dependencies

### Rule: Workflow Integrity

**Derived from:** SCHEMA.md §1, TEMPLATE.md §2.3

**Checkpoint Verification:**

- ✓ Phases executed in sequence (Phase 0 → 1 → 2 → 3)
- ✓ Workflow consistent (all artifacts same workflow name)
- ✓ Unit_id consistent (all artifacts same unit)
- ✓ Interaction mode consistent (all phases same mode)

---

## Extension Mechanism

To add validation for custom workflows (e.g., pwrl-tasks, pwrl-plan):

1. **Add phase schema** to `references/phase-schemas.md`
   - Define required fields
   - Inherit metadata template (phase, workflow, timestamp)

2. **Add quality gates** to `references/quality-gates.md`
   - List acceptance criteria per phase
   - Link to workflow standards

3. **Register in standards** file (this document)
   - Map to source standard
   - Document compliance rules

4. **Update SKILL.md** workflow list
   - Add workflow name
   - Link to reference files

---

## Compliance Audit

To verify pwrl-phase-checkpoint compliance:

```bash
# Check artifact structure matches SCHEMA.md
grep -r "required_fields" references/phase-schemas.md

# Check gate definitions complete
wc -l references/quality-gates.md  # Should be >100

# Check standards mapping
grep -c "Standard Requirement" references/standards-mapping.md

# Validate SKILL.md format
grep -E "^### Phase|^### Workflow" SKILL.md | wc -l
```

**Expected Results:**

- ✓ 5 workflows defined (review, work, plan, tasks, learnings)
- ✓ 14 phases defined across workflows
- ✓ 100+ quality gates defined
- ✓ All gates linked to standards
