# Extract Learnings Detailed Workflow

Complete step-by-step workflow for the extract phase of the learnings pipeline.

**Parent Skill:** [pwrl-learnings-extract](../SKILL.md)
**Phase:** 1 (Entry point)
**Input:** Source material (code, commit, task, documentation, error, review)
**Output:** Extraction artifact with identified learning candidates

## Workflow Overview

```
Step 1: Validate Input
  ↓
Step 2: Scan for Learning Signals
  ├── For each source type (code/commit/task/documentation/error/review)
  ├── Identify signals specific to that type
  ├── Extract candidates
  ↓
Step 3: Create Learning Candidates
  ├── Assign preliminary type
  ├── Add metadata
  ↓
Step 4: Categorize Learnings
  ├── Assign preliminary types
  ↓
Step 5: Extract Metadata
  ├── Source reference, timestamp, context
  ↓
Step 6: Validate Extraction
  ├── Check required fields present
  ├── Mark confidence levels
  ↓
Step 7: Generate Extraction Artifact
  ├── Emit YAML + markdown artifact
  ↓
OUTPUT: Ready for Phase 2 (Classify)
```

## Step 1: Validate Input

**Purpose:** Ensure source material is in valid format.

**Process:**

1. Check that source type is one of: `code`, `commit`, `task`, `documentation`, `error`, `review`
2. Verify source content is provided (not empty)
3. If context available, validate timestamps and references are valid
4. If validation fails:
   - Ask user to clarify source type
   - Retry validation

**Error Cases:**

| Case                 | Action                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| Invalid source type  | Ask user: "Is this code, commit, task, documentation, error, or review?" |
| Empty source content | Return error: "Please provide source content to extract learnings from." |
| Unreadable format    | Ask: "Can you provide plain text or a summary instead?"                  |

## Step 2: Scan for Learning Signals

**Purpose:** Identify learning signals based on source type.

### For source_type = "code"

**Code comment signals:**

- `FIXME: [description]` → Learning: "Known issue or workaround"
- `HACK: [description]` → Learning: "Temporary solution or limitation"
- `TODO: [description]` → Learning: "Incomplete but important pattern"
- `NOTE: [description]` → Learning: "Cautionary note or gotcha"
- `WARN: [description]` → Learning: "Warning or precaution"

**Code pattern signals:**

- Unusual algorithms (not standard library) → Learning: "Custom algorithm pattern"
- Memoization or caching patterns → Learning: "Performance optimization pattern"
- Complex error handling (nested try-catch) → Learning: "Error handling gotcha or pattern"
- Resource management (acquire/release patterns) → Learning: "Resource management pattern"
- Synchronization/concurrency patterns → Learning: "Concurrency gotcha or pattern"

**Code quality signals:**

- Deeply nested logic (>4 levels) → Learning: "Complex branching gotcha"
- Long parameter lists (>5 args) → Learning: "API design pattern"
- Duplicated logic → Learning: "Missing abstraction pattern"
- Magic numbers → Learning: "Configuration gotcha"
- Unsafe type coercion → Learning: "Type coercion gotcha"

**Example:**

```typescript
// FIXME: Race condition when multiple instances access cache
class Cache {
  constructor() {
    this.data = {}; // Magic dictionary, no locking
  }
  get(key) {
    // HACK: Workaround until DB migration complete
    if (this.legacyFormat) {
      return convertFromLegacy(this.data[key]); // Unsafe access
    }
    return this.data[key];
  }
  // Deep nesting (5+ levels) and complex conditions
  set(key, value) {
    if (key) {
      if (value) {
        if (!isExpired(key)) {
          if (hasPermission(key)) {
            if (validateSchema(value)) {
              this.data[key] = value;
            }
          }
        }
      }
    }
  }
}
```

**Signals extracted:**

1. FIXME comment → race condition gotcha
2. HACK comment → workaround technical fix
3. Unsafe data access → type safety gotcha
4. Deep nesting → complexity gotcha or pattern

### For source_type = "commit"

**Commit message analysis:**

1. Extract intent from commit message
2. Identify category: fix | feature | refactor | chore | docs
3. Look for issue numbers (e.g., #456, closes #789)

**Diff pattern analysis:**

1. File count and types (code, tests, docs)
2. LOC added/deleted ratio
3. If heavy refactoring (>50% deletion): "Refactoring decision"
4. If cross-module changes: "Integration pattern"
5. If security-related: "Security fix technical learning"

**Linked issues:**

- Extract GitHub issue numbers
- Categorize by issue type

**Example:**

```
Commit: "Fix: Race condition in cache access (closes #456)"
Diff: src/cache.ts (-45, +62), test/cache.test.ts (+30)

Signals extracted:
1. Commit title "Fix: Race condition" → technical_fix type, critical priority
2. Issue #456 → linked issue, priority from issue
3. Test additions (+30 lines) → pattern: "Test-driven fix"
4. Code refactor (-45, +62) → "Refactoring decision"
```

### For source_type = "task"

**Requirements analysis:**

1. Extract acceptance criteria
2. Note constraints or blockers
3. Identify dependencies

**Learning signals:**

- "Why this design?" → Learning: "Architectural decision"
- "Constraint: X" → Learning: "System limitation"
- "Blocked by Y" → Learning: "Dependency management"
- "Must use X" → Learning: "Technology choice decision"

**Example:**

```
Task: "Migrate cache to Redis due to memory constraints"
Constraints:
  - Must maintain backward compatibility
  - Deployment requires database migration
  - Cannot use external services in prod

Signals extracted:
1. Constraint: backward compatibility → design pattern learning
2. Constraint: migration required → technical workflow learning
3. Technology choice: Redis → decision learning
```

### For source_type = "documentation"

**Architecture sections:**

- System design decisions → Learning: "Architectural decision"
- Tradeoffs and rationale → Learning: "Design tradeoff decision"
- Known limitations → Learning: "System limitation gotcha"

**Setup/configuration:**

- Common pitfalls mentioned → Learning: "Configuration gotcha"
- Environment-specific issues → Learning: "Environment gotcha"
- Manual steps required → Learning: "Setup workflow"

**FAQ/troubleshooting:**

- Common errors and solutions → Learning: "Technical fix"
- Preventative measures → Learning: "Gotcha prevention pattern"

### For source_type = "error"

**Error trace analysis:**

1. Extract error type and message
2. Identify root cause (from stack trace or analysis)
3. Note affected code path

**Symptom-to-fix mapping:**

- What manifested? (symptom)
- Why did it happen? (root cause)
- How was it fixed? (solution)
- How to prevent? (prevention)

**Example:**

```
Error: TypeError: Cannot read property 'foo' of undefined
Stack: at processData() [app.js:42]
Source: User submitted null payload

Analysis:
  Symptom: Crash on null property access
  Root Cause: Missing null check on user input
  Fix: Add null validation before accessing properties
  Prevention: Use TypeScript null checking, input validation

Signals extracted:
1. Type: gotcha ("Always check for null")
2. Type: technical_fix ("Add null validation")
3. Type: pattern ("Input validation pattern")
```

### For source_type = "review"

**Review feedback patterns:**

- Comments praising patterns → Learning: "Praised approach pattern"
- Comments questioning approaches → Learning: "Anti-pattern"
- Suggestions for improvement → Learning: "Best practice"

**Categories:**

- Security feedback → Learning: "Security gotcha"
- Performance feedback → Learning: "Performance pattern"
- Style feedback → Learning: "Coding standard pattern"
- Test coverage feedback → Learning: "Testing pattern"

## Step 3: Create Learning Candidates

**Purpose:** Formalize each signal as a learning candidate.

**For each signal found, create learning object:**

```yaml
Learning Candidate:
  type: [gotcha | pattern | decision | technical_fix | workflow]
  title: [Concise, actionable title (1 line)]
  problem: [Clear statement of problem/opportunity (2-3 sentences)]
  application: [How to use this learning (1-2 sentences)]
  source: [File:line or commit hash or task_id]
  confidence: [high | medium | low]
  tags: [optional categorization]
```

**Confidence levels:**

- **High:** Clear, explicit signal
  - Direct comment (FIXME, HACK, NOTE)
  - Documented decision
  - Issue linked in commit

- **Medium:** Inferred from code/commit pattern
  - Code pattern matches known gotcha
  - Architectural decision implied
  - Test coverage indicates pattern

- **Low:** Uncertain interpretation
  - Ambiguous comment
  - May need human review
  - Could be coincidence

**Examples:**

```yaml
Candidate 1:
  type: gotcha
  title: "Race condition when multiple threads access shared cache"
  problem: "Cache object is mutated without synchronization, causing data corruption in multi-threaded environments."
  application: "Always use locking (mutex, semaphore) for shared mutable state in concurrent systems."
  source: "src/cache.ts:42"
  confidence: high
  tags: [concurrency, cache, threading]

Candidate 2:
  type: pattern
  title: "Memoization for expensive computations"
  problem: "Expensive function called repeatedly with same inputs, wasting CPU."
  application: "Cache function results keyed by arguments; check cache before computing."
  source: "src/utils.ts:120"
  confidence: medium
  tags: [performance, optimization]
```

## Step 4: Categorize Learnings

**Purpose:** Assign preliminary types to candidates.

**Type assignment logic:**

- **Gotcha:** "Beware of X" or "Don't do X"
  - Warning, edge case, trap, pitfall
  - Example: "Race condition when accessing shared state"

- **Pattern:** "Effective approach for Y"
  - Reusable solution, best practice, idiom
  - Example: "Memoization for expensive computations"

- **Decision:** "Why we chose X over Y"
  - Technology choice, architectural decision, tradeoff
  - Example: "Chose async/await over callbacks for readability"

- **Technical Fix:** "How to solve specific problem Z"
  - Bug fix, workaround, debugging technique
  - Example: "Fix import cycle by moving type to separate file"

- **Workflow:** "Process or best practice"
  - Process improvement, checklist, sequence of steps
  - Example: "Always update docs when changing public API"

## Step 5: Extract Metadata

**Purpose:** Collect complete context for each learning.

**For each learning, collect:**

- **Source reference:** file path, line range, or commit hash
- **Source type:** what kind of source was scanned
- **Timestamp:** when extraction occurred (ISO-8601)
- **Context:** task ID, related files, linked issues
- **Confidence:** high/medium/low assessment
- **Tags:** optional categorization (security, performance, language, framework, etc.)

**Metadata structure:**

```yaml
source:
  type: code | commit | task | documentation | error | review
  reference: "file:line" or "commit_hash" or "task_id"
  timestamp: "2026-06-12T10:30:00Z"
  context:
    file_path: [if applicable]
    line_range: [if applicable]
    task_id: [if applicable]
    linked_issues: ["#456", "#789"]
    related_files: []
confidence: high | medium | low
tags: [list of tags]
```

## Step 6: Validate Extraction

**Purpose:** Ensure each learning has required fields and quality.

**Validation checklist for each candidate:**

- ✓ **Title:** Present, 1 line, actionable, clear
- ✓ **Problem:** Clear statement, 2-3 sentences
- ✓ **Application:** How/when to apply, 1-2 sentences
- ✓ **Source reference:** File:line or commit hash or task_id
- ✓ **Type:** One of 5 types assigned
- ✓ **Confidence:** high/medium/low assessed

**If validation fails:**

- Mark learning as low-confidence
- Add note about issue
- Continue (don't discard)
- Detailed mode: ask user for clarification
- Yolo mode: auto-assign medium confidence

**Quality checks:**

```
Learning: "Race condition in cache"
Title check:      ✓ Clear, 1 line
Problem check:    ✓ Root cause explained
Application:      ✓ How to apply stated
Source ref:       ✓ File:line provided
Type assigned:    ✓ "gotcha" is appropriate
Confidence:       ✓ "high" due to FIXME comment
Status:           ✓ Ready for classification
```

## Step 7: Generate Extraction Artifact

**Purpose:** Emit structured output for next phase.

**Artifact structure (YAML + markdown):**

```yaml
---
format: pwrl-learnings-extract-artifact
version: "1.0"
extract_id: YYYY-MM-DD-NNN-extract
created: ISO-8601-timestamp
source_type: code | commit | task | documentation | error | review
source_ref: [file_path | commit_hash | task_id]
---

# Learning Extraction Results

## Summary
- **Total Learnings Found:** [count]
- **By Category:**
  - Gotchas: [count]
  - Patterns: [count]
  - Decisions: [count]
  - Technical Fixes: [count]
  - Workflows: [count]

## Extracted Learnings

### Learning 1
- **Type:** [gotcha | pattern | decision | technical_fix | workflow]
- **Title:** [Concise 1-line title]
- **Problem:** [What problem does this learning address?]
- **Application:** [How/when to apply this learning?]
- **Source Context:** [File:line or relevant snippet]
- **Confidence:** [high | medium | low]
- **Linked Issues:** [GitHub issue numbers if available]

[Additional learnings...]

## Extraction Status
- **Status:** success
- **Quality:** [all|most|some] learnings are actionable
- **Coverage:** Scanned [N] lines / [N] items

## Ready for Classification
- **Next Skill:** pwrl-learnings-classify
- **Artifacts Passed:** This extraction artifact + source reference
```

## Error Handling

| Error                | Recovery                                                                      |
| -------------------- | ----------------------------------------------------------------------------- |
| Invalid source_type  | Ask user to clarify (code/commit/task/documentation/error/review)             |
| Empty source content | Return error; ask user to provide content                                     |
| Unreadable format    | Ask user to provide plain text or summary                                     |
| No signals found     | Return empty artifact; continue to classify (it may have learnings to refine) |
| Parse error          | Log issue; continue with parsed portion                                       |

## Performance Guidelines

- **Expected time:** <5 seconds for typical code files (100-500 lines)
- **For large files (1000+ lines):** May take 10-20 seconds; show progress
- **For commits:** <2 seconds per commit (message + diff analysis)
- **For tasks/docs:** <3 seconds per document

## Testing Scenarios

**Happy Path:**

- ✅ Code with FIXME/HACK/TODO comments (3+ learnings)
- ✅ Commit message with issue number (1+ learnings)
- ✅ Task with constraints (2+ learnings)
- ✅ Error trace with root cause (1+ learnings)
- ✅ Review feedback (2+ learnings)
- ✅ Documentation with tradeoffs (2+ learnings)

**Edge Cases:**

- ✅ Code with no comments (0 learnings extracted)
- ✅ Very long source (50+ lines scanned)
- ✅ Special characters in comments (handled)
- ✅ Multiple different signal types (all categorized)
- ✅ Conflicting signals (both extracted)

## Related Workflows

- **Next Phase:** [pwrl-learnings-classify detailed workflow](../pwrl-learnings-classify/references/classify-learnings-detailed-workflow.md)
- **Early Duplicate Detection:** See [Duplicate Handling Consolidated](../pwrl-learnings/references/duplicate-handling-consolidated.md)
- **Quality Validation:** See [pwrl-phase-checkpoint](../../pwrl-phase-checkpoint/SKILL.md)
