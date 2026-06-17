---
name: pwrl-learnings-classify
version: "1.0"
format: protocol
created: "2026-06-12"
created_by: Phase 4 implementation
unique_id: U4.2-classify-learnings-protocol
---

# Classify Learnings Protocol

**Purpose:** Classify extracted learnings by type, category, priority, and applicability.

**Micro-Skill:** `pwrl-learnings-classify` (U4.2)

**Role in Pipeline:** Phase 2 of pwrl-learnings orchestrator. Refines preliminary classifications and assigns priority, enabling effective filtering and retrieval.

---

## Input Contract

### Required

| Field                    | Type   | Description                                     |
| ------------------------ | ------ | ----------------------------------------------- |
| `learnings`              | array  | Extracted learnings from pwrl-learnings-extract |
| `classification_context` | object | Domain, technology, project info                |

### Optional

| Field                  | Type   | Description                                   |
| ---------------------- | ------ | --------------------------------------------- |
| `force_classification` | object | Override type/priority for specific learnings |
| `exclude_categories`   | array  | Skip certain categories (e.g., `[workflow]`)  |

### Validation

- `learnings` must be non-empty array
- Each learning must have `id`, `type` (preliminary), `title`, `problem`
- `classification_context` must include at least `domain` field

---

## Processing Steps

### 1. Validate Preliminary Classification

Review extracted learning types:

```
For each learning:
  IF type not in [gotcha, pattern, decision, technical_fix, workflow] THEN
    Set type = "unclassified"
  END
```

### 2. Refine Type Classification

Re-evaluate type based on content:

**Refine to Gotcha:** If learning describes:

- Unexpected behavior or surprise
- Counter-intuitive API or language feature
- Performance cliff or edge case
- Common mistake or trap

**Refine to Pattern:** If learning describes:

- Reusable solution or best practice
- Architecture or design pattern
- Testing or deployment approach
- Idiom or coding style

**Refine to Decision:** If learning describes:

- Why something was chosen over alternatives
- Tradeoff between options
- Technology or library selection
- Architectural choice

**Refine to Technical Fix:** If learning describes:

- Solution to specific problem
- Root cause and fix
- Debugging steps
- Workaround for limitation

**Refine to Workflow:** If learning describes:

- Process improvement or efficiency
- Collaboration technique
- Development workflow enhancement
- Automation or tooling

### 3. Assign Primary Domain

Categorize by technology/domain:

```yaml
domains:
  - backend: Node.js, TypeScript, databases, APIs
  - frontend: React, CSS, UI/UX, performance
  - architecture: design patterns, scalability, microservices
  - devops: deployment, CI/CD, infrastructure, monitoring
  - process: git workflow, PR review, testing, documentation
  - security: authentication, validation, encryption
  - performance: optimization, caching, profiling
  - testing: unit, integration, e2e, mocking
```

### 4. Assess Applicability

Score applicability (0-10) for different contexts:

```
applicability = {
  "current_project": 0-10,  // How relevant to this project?
  "general": 0-10,           // How broadly applicable?
  "time_sensitive": true/false  // Will this expire/become outdated?
}
```

High scores (8-10): Widely applicable, frequent use
Medium scores (5-7): Specific scenario, occasional use
Low scores (0-4): Niche, rare use

### 5. Assign Priority

Determine priority (critical → important → nice_to_know):

**CRITICAL Priority:**

- Blocks major workflows
- Security implications
- Frequent runtime errors
- Can cause data loss

**IMPORTANT Priority:**

- Improves performance significantly
- Prevents common mistakes
- Best practices
- Should be known to team

**NICE_TO_KNOW Priority:**

- Interesting edge cases
- Performance micro-optimizations
- Rarely needed techniques
- Historical context

### 6. Identify Related Learnings

Find duplicates and related learnings:

- Exact duplicates: Same problem, same solution
- Partial duplicates: Similar problem, different context
- Related: Complementary learnings (e.g., error + solution)

Mark for deduplication phase.

### 7. Add Tags

Classify with multiple tags:

```yaml
tags:
  - language: [typescript, javascript, sql, etc.]
  - framework: [react, express, nestjs, etc.]
  - domain: [backend, frontend, devops, etc.]
  - topic: [performance, security, testing, etc.]
  - difficulty: [beginner, intermediate, advanced]
  - status: [verified, needs_verification, deprecated]
```

### 8. Generate Artifact

Create classification artifact with refined metadata:

```yaml
classification_artifact:
  format: learnings_classification
  version: "1.0"
  created: 2026-06-12T14:35:00Z
  input_reference:
    extraction_id: uuid-from-extract-phase
    learnings_count: N
  classified_learnings:
    - id: uuid
      type_refined: (gotcha|pattern|decision|technical_fix|workflow)
      title: One-liner
      severity: (critical|important|nice_to_know)
      domains: [backend, security]
      tags: [typescript, security, validation]
      applicability:
        current_project: 8
        general: 6
        time_sensitive: false
      related_learning_ids: [uuid, uuid]
      is_duplicate_of: null
      classification_confidence: 0.95
  classification_status: success
  duplicates_found: N
  ready_for_deduplication: true
```

---

## Output Contract

### Success Output

| Field                     | Type    | Required | Description                   |
| ------------------------- | ------- | -------- | ----------------------------- |
| `classified_learnings`    | array   | ✓        | Refined learning objects      |
| `types_breakdown`         | object  | ✓        | Count by refined type         |
| `domains_breakdown`       | object  | ✓        | Count by domain               |
| `priority_breakdown`      | object  | ✓        | Count by priority             |
| `duplicates_found`        | number  | ✓        | Count of potential duplicates |
| `classification_status`   | string  | ✓        | "success" or "partial"        |
| `ready_for_deduplication` | boolean | ✓        | Always true if success        |

### Learning Object (Enhanced)

```typescript
{
  id: string (UUID)
  type_refined: 'gotcha' | 'pattern' | 'decision' | 'technical_fix' | 'workflow'
  title: string
  severity: 'critical' | 'important' | 'nice_to_know'
  domains: string[]
  tags: string[]
  applicability: {
    current_project: 0-10
    general: 0-10
    time_sensitive: boolean
  }
  related_learning_ids: string[]
  is_duplicate_of: string | null
  classification_confidence: 0.0-1.0
  classification_notes: string
}
```

---

## Error Cases

### Error: Type ambiguity

**Symptom:** Learning fits multiple types equally

**Recovery:**

1. Assign primary type based on dominant aspect (what's most important?)
2. Add classification_note: "Could also classify as X"
3. Let user review in deduplication if needed
4. Classification confidence = 0.8

### Error: Unknown domain

**Symptom:** Learning doesn't fit into predefined domains

**Recovery:**

1. Assign closest matching domain
2. Add additional custom domain tag
3. Add classification_note: "New domain: X"
4. Flag for team review

### Error: Applicability unclear

**Symptom:** Cannot determine relevance to project

**Recovery:**

1. Ask user context questions: "Is this project using TypeScript? React?"
2. Use defaults (5.0) if unclear
3. Classification confidence = 0.6
4. Flag for manual review

### Error: No learnings to classify

**Symptom:** Input array empty

**Recovery:**

1. Return empty classification artifact
2. Status: "success" (nothing to classify)
3. ready_for_deduplication: true
4. Log: "No learnings received for classification"

---

## Quality Gates

Before producing output:

- [ ] All learnings have refined type (not "unclassified")
- [ ] Priority assigned to all learnings
- [ ] At least one domain tag per learning
- [ ] Applicability scores reasonable (0-10 range)
- [ ] Duplicate candidates identified
- [ ] Classification confidence >0.5 for all

---

## Testing Strategy

### Test Suites

**Suite 1: Type Refinement (6-8 tests)**

- Gotcha classification
- Pattern classification
- Decision classification
- Technical fix classification
- Workflow classification
- Type disagreement handling
- Unclassified type handling

**Suite 2: Domain Assignment (6-8 tests)**

- Backend domain detection
- Frontend domain detection
- Architecture domain detection
- Multi-domain learnings
- Custom domain handling
- Unknown domain recovery

**Suite 3: Priority Assessment (6-8 tests)**

- Critical priority detection
- Important priority detection
- Nice-to-know priority detection
- Security implications (critical)
- Performance improvements (important)
- Edge cases (nice-to-know)

**Suite 4: Applicability Scoring (6-8 tests)**

- High applicability (8-10)
- Medium applicability (5-7)
- Low applicability (0-4)
- Time-sensitive detection
- Context-based scoring

**Suite 5: Tag Assignment (6-8 tests)**

- Language tags
- Framework tags
- Domain tags
- Topic tags
- Difficulty levels
- Multi-tag learnings

**Suite 6: Duplicate Detection (6-8 tests)**

- Exact duplicates identified
- Partial duplicates identified
- Related learnings linked
- No false duplicates
- Transitive duplicates

**Suite 7: Confidence Scoring (5-7 tests)**

- High confidence (0.9+)
- Medium confidence (0.7-0.9)
- Low confidence (0.5-0.7)
- Ambiguity handling
- Confidence notes

**Suite 8: Edge Cases (5-7 tests)**

- Single learning
- All same type
- Mixed types
- Empty tags
- Missing applicability

---

## Integration Points

### Input From

- `pwrl-learnings-extract` (extraction artifact)

### Output To

- `pwrl-learnings-structure` (structuring phase)

### Dependencies

- Domain classification rules
- Priority assessment criteria
- Applicability scoring model

---

## Success Criteria

✓ Type refinement improves initial classification
✓ Priority assignments realistic and consistent
✓ Domain tags cover learning scope
✓ Applicability scores useful for filtering
✓ Duplicate candidates accurate
✓ Confidence scores reflect classification certainty
✓ Ready for structure and deduplication

---

## Configuration

**Domains (Customizable per project):**

```yaml
domains:
  backend: [node, typescript, databases, apis]
  frontend: [react, css, ui, performance]
  architecture: [patterns, scalability, microservices]
  devops: [deployment, ci_cd, infrastructure]
  process: [workflow, git, review, testing]
```

**Priority Rules (Customizable):**

```yaml
critical: [security, blocking, data_loss]
important: [performance, best_practice, common_mistake]
nice_to_know: [edge_case, optimization, historical]
```
