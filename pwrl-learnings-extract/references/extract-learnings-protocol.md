---
name: pwrl-learnings-extract
version: "1.0"
format: protocol
created: "2026-06-12"
created_by: Phase 4 implementation
unique_id: U4.1-extract-learnings-protocol
---

# Extract Learnings Protocol

**Purpose:** Extract actionable learnings from code, commits, tasks, and documentation.

**Micro-Skill:** `pwrl-learnings-extract` (U4.1)

**Role in Pipeline:** Phase 1 of pwrl-learnings orchestrator. Identifies and extracts raw learning opportunities from source materials before classification.

---

## Input Contract

### Required

| Field     | Type   | Description                                                                         |
| --------- | ------ | ----------------------------------------------------------------------------------- |
| `source`  | enum   | Where to extract from: `code`, `commit`, `task`, `documentation`, `error`, `review` |
| `content` | string | Source content to analyze                                                           |

### Optional

| Field            | Type   | Description                                                                    |
| ---------------- | ------ | ------------------------------------------------------------------------------ |
| `context`        | object | Background info: `task_id`, `unit_id`, `file_path`, `line_range`, `timestamp`  |
| `filter_by_type` | array  | Filter learnings: `gotcha`, `pattern`, `decision`, `technical_fix`, `workflow` |

### Validation

- `source` must be one of the enum values
- `content` must not be empty
- If `context` provided, must be valid object

---

## Processing Steps

### 1. Extract Candidates

Scan content for learning signals:

**From Code:**

- Complex algorithms (high cyclomatic complexity)
- Workarounds and hacks (marked with `// TODO`, `// HACK`, `// FIXME`)
- Uncommon patterns (unfamiliar library usage, unusual architecture)
- Performance optimizations (caching, memoization)
- Security implementations (validation, auth, encryption)

**From Commits:**

- Commit message analysis (extract intent from "fix", "refactor", "optimize")
- Diff analysis (compare before/after for insights)
- Issue references (link to problem being solved)

**From Tasks:**

- Task description (goals and constraints)
- Blockers and how they were resolved
- Assumptions and dependencies
- Success criteria

**From Documentation:**

- Architecture decisions
- Design tradeoffs
- Setup procedures and common mistakes
- Troubleshooting guides

**From Errors/Failures:**

- Root cause (what caused the problem)
- Symptom patterns (how to recognize it)
- Resolution (fix applied)
- Prevention (how to avoid it)

**From Reviews:**

- Code review comments (what was questioned)
- Approved patterns (what was praised)
- Rejected approaches (what was discouraged)

### 2. Categorize Candidates

Assign preliminary categories:

| Category          | Definition                                                                            |
| ----------------- | ------------------------------------------------------------------------------------- |
| **gotcha**        | Unexpected behavior, trap, surprise (syntax trap, performance cliff, API quirk)       |
| **pattern**       | Reusable solution, best practice, idiom (testing pattern, error handling, deployment) |
| **decision**      | Why something was chosen over alternatives (tech choice, tradeoff, requirement)       |
| **technical_fix** | Solution to specific problem (debugging steps, workaround, bug fix)                   |
| **workflow**      | Process improvement, efficiency gain, technique (git workflow, review process)        |

### 3. Extract Metadata

For each candidate, extract:

```yaml
learning:
  id: (auto-generated UUID)
  type: (gotcha|pattern|decision|technical_fix|workflow)
  title: One-sentence summary
  severity: (critical|important|nice_to_know)
  source_type: (code|commit|task|documentation|error|review)
  source_reference:
    file: path/to/file.ts
    line: 42
    line_range: [40, 50]
    url: https://github.com/...
    timestamp: 2026-06-12T14:30:00Z
  context:
    task_id: U2.3
    unit_id: U2
    domain: execution
    technology: typescript
```

### 4. Extract Content

For each candidate, create standardized content:

```
**Problem/Observation:**
[What the learning is about - situation or observation]

**Details:**
[Specific details - technical specifics, code examples, configuration]

**Why This Matters:**
[Impact and relevance - what breaks if you miss this]

**Application:**
[How to use this learning - prevention, implementation, decision-making]

**Examples:**
[Code/config examples showing the learning in practice]

**Related:**
[Links to similar learnings or documentation]
```

### 5. Validate Extractions

Quality checks:

- ✓ Title is clear and specific (not generic)
- ✓ Problem is clearly stated
- ✓ Application section is actionable
- ✓ At least one example provided
- ✓ Category is accurate for content

### 6. Generate Artifact

Create extraction artifact with:

```yaml
extraction_artifact:
  format: learnings_extraction
  version: "1.0"
  created: 2026-06-12T14:30:00Z
  source_reference:
    type: (code|commit|task|documentation|error|review)
    url: full_reference
    file_path: path/to/source
  learnings_found:
    count: N
    by_type:
      { gotcha: X, pattern: Y, decision: Z, technical_fix: A, workflow: B }
    by_severity: { critical: X, important: Y, nice_to_know: Z }
  learnings:
    - id: uuid
      type: category
      title: One-liner
      severity: level
      problem: (text)
      details: (text)
      why_matters: (text)
      application: (text)
      examples: (list)
  extraction_status: success
  ready_for_classification: true
```

---

## Output Contract

### Success Output

| Field                      | Type    | Required | Description                         |
| -------------------------- | ------- | -------- | ----------------------------------- |
| `learnings_found`          | number  | ✓        | Count of extracted learnings        |
| `by_type`                  | object  | ✓        | Breakdown by learning type          |
| `by_severity`              | object  | ✓        | Breakdown by severity               |
| `learnings`                | array   | ✓        | Array of extracted learning objects |
| `extraction_status`        | string  | ✓        | "success" or "partial"              |
| `ready_for_classification` | boolean | ✓        | Always true if extraction succeeds  |

### Learning Object Structure

```typescript
{
  id: string (UUID)
  type: 'gotcha' | 'pattern' | 'decision' | 'technical_fix' | 'workflow'
  title: string
  severity: 'critical' | 'important' | 'nice_to_know'
  problem: string
  details: string
  why_matters: string
  application: string
  examples: string[]
  source_type: string
  source_reference: {
    file?: string
    line?: number
    url?: string
    timestamp?: string
  }
}
```

---

## Error Cases

### Error: No learnings found

**Symptom:** Content analyzed but no candidates identified

**Recovery:**

1. Check if source material is suitable (code vs. non-code)
2. Ask user: "Would you like to manually add a learning?"
3. If yes, proceed to manual entry
4. If no, return empty extraction artifact (still valid)

### Error: Invalid source type

**Symptom:** `source` value not in enum

**Recovery:**

1. Validate source against enum: code, commit, task, documentation, error, review
2. Ask user: "Which source type? [code/commit/task/documentation/error/review]"
3. Re-extract with corrected type

### Error: Content too large or complex

**Symptom:** Source file >10k lines or very large commit diff

**Recovery:**

1. Split content into chunks (max 2k lines each)
2. Extract from each chunk separately
3. Combine results
4. Deduplicate in later phase

### Error: Ambiguous learning type

**Symptom:** Candidate fits multiple categories

**Recovery:**

1. Assign primary type based on dominant aspect
2. Add note about alternative type
3. Let user re-classify in next phase if needed

---

## Quality Gates

Before producing output:

- [ ] All extracted learnings have title, problem, application
- [ ] No duplicate IDs
- [ ] All learnings have valid severity level
- [ ] Source references accurate and traceable
- [ ] At least one example per learning (if applicable)

---

## Testing Strategy

### Test Suites

**Suite 1: Code Extraction (5-7 tests)**

- Extract from function with workaround
- Extract from performance optimization
- Extract from security implementation
- Extract from uncommon pattern
- No learnings in clean code

**Suite 2: Commit Extraction (5-7 tests)**

- Extract from commit fixing bug
- Extract from optimization commit
- Extract from refactoring commit
- Parse commit message intent
- Link to associated issue

**Suite 3: Task Extraction (5-7 tests)**

- Extract goals from task description
- Extract constraints from task
- Extract assumptions from task context
- Extract blockers and resolutions

**Suite 4: Error/Review Extraction (5-7 tests)**

- Extract from error trace
- Extract from review comments
- Extract from failed test
- Severity assessment

**Suite 5: Classification (5-7 tests)**

- Classify as gotcha
- Classify as pattern
- Classify as decision
- Classify as technical_fix
- Classify as workflow
- Assign severity levels

**Suite 6: Validation (5-7 tests)**

- Valid metadata extraction
- Source reference accuracy
- Example inclusion
- Timestamp and traceability

**Suite 7: Edge Cases (5-7 tests)**

- Empty content
- Very large content (chunking)
- Ambiguous categories
- Multiple learnings in one source
- Malformed references

**Suite 8: Error Recovery (5-7 tests)**

- Invalid source type
- Missing context
- No learnings found
- Extraction failure and retry

---

## Integration Points

### Input From

- User supplies source material
- pwrl-work supplies code/commits
- GitHub integration supplies PRs/reviews
- Error logs supply failure traces

### Output To

- `pwrl-learnings-classify` (classification phase)

### Dependencies

- UUID generator for learning IDs
- Markdown parser for documentation
- Git log parser for commits
- Code analyzer for complexity/patterns

---

## Success Criteria

✓ Extracted learnings are specific and actionable
✓ Category assignments are accurate
✓ Source references are traceable and verifiable
✓ Severity assessment is reasonable
✓ Examples demonstrate the learning
✓ No personally identifiable information in extractions
✓ Ready for downstream classification phase

---

## Examples

### Example 1: Code Extraction

**Input:** Function with performance optimization

```typescript
// src/cache.ts
const memoizedExpensiveCalculation = (() => {
  let cache: Map<string, number> = new Map();

  return (input: string) => {
    if (cache.has(input)) return cache.get(input); // Memoization
    const result = performExpensiveWork(input);
    cache.set(input, result);
    return result;
  };
})();
```

**Extracted Learning:**

```yaml
type: pattern
title: Closure-based memoization for expensive calculations
severity: important
problem: Expensive synchronous operations slow down repeated calls
application: Use closure with Map for simple memoization; consider libraries for complex cases
examples:
  - memoizedExpensiveCalculation pattern
  - Cache invalidation strategy needed for mutable results
source_reference:
  file: src/cache.ts
  line: 5
```

### Example 2: Commit Extraction

**Input:** Commit message and diff

```
commit: "fix: prevent race condition in async task queue"
refs: #2847
diff: Added locking mechanism to serialize queue operations
```

**Extracted Learning:**

```yaml
type: technical_fix
title: Race condition in async task queue resolved with serialization lock
severity: critical
problem: Concurrent queue operations caused task duplications
details: Queue.push and Queue.process can interleave, causing task to run twice
application: Use lock/mutex for shared resource access in async contexts
examples:
  - Async queue implementation with lock
  - How lock prevents interleaving
source_reference:
  url: https://github.com/wicttor/pwrl/commit/abc123
  timestamp: 2026-06-12T10:00:00Z
```

### Example 3: No Learnings

**Input:** Simple, well-structured code with standard patterns

**Output:**

```yaml
learnings_found: 0
by_type: { gotcha: 0, pattern: 0, decision: 0, technical_fix: 0, workflow: 0 }
by_severity: { critical: 0, important: 0, nice_to_know: 0 }
learnings: []
extraction_status: success
extraction_note: "Content reviewed; no novel learnings identified. Standard patterns recognized."
ready_for_classification: true
```

---

## Notes

- Extraction is liberal (include when in doubt; classification phase will refine)
- Severity is preliminary (may be adjusted in classification)
- Source references must be preservable for later retrieval
- UUIDs must be stable for deduplication phase
- Always include at least problem + application (never "title only")
