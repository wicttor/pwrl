# Subagent Review Protocol

Orchestration protocol for parallel code review using multiple specialized reviewer personas.

---

## Overview

When `pwrl-review` runs in `depth:deep` mode or with `subagents:on`, it spawns multiple specialized reviewer personas in parallel. Each persona focuses on one aspect of code quality.

**Benefits:**

- Faster reviews through parallelization
- Specialized expertise per review dimension
- Higher coverage through focused attention
- Detailed evidence artifacts in deep mode

**Requirements:**

- Platform must expose parallel subagent facility
- Reviewers must not modify repository (read-only)
- Orchestrator handles final aggregation and presentation

---

## Reviewer Persona Assignments

### 1. Correctness Reviewer

**Focus Areas:**

- Logic errors and off-by-one bugs
- Edge case handling (empty, null, max, min, boundary)
- Error propagation correctness
- State transition validity

**Review Questions:**

- Are there logic errors in this code?
- Are edge cases handled properly?
- Is error propagation correct?
- Are state transitions valid and safe?

**JSON Output Contract:**

```json
{
  "findings": [
    {
      "title": "Off-by-one error in pagination logic",
      "severity": "P1",
      "file": "src/api/users.ts",
      "line": 45,
      "category": "correctness",
      "confidence": "high",
      "suggested_fix": "Change `<= limit` to `< limit` on line 45",
      "why_it_matters": "Returns one extra item per page, breaking API contract",
      "evidence": ["Line 45: `for (let i = offset; i <= limit; i++)`"]
    }
  ]
}
```

---

### 2. Testing Reviewer

**Focus Areas:**

- Test coverage for new features
- Edge case test scenarios
- Assertion quality and specificity
- Test meaningfulness (not just happy path)

**Review Questions:**

- Are new features covered by tests?
- Do tests verify edge cases?
- Are tests meaningful (not just happy path)?
- Are test assertions strong and specific?

**JSON Output Contract:**

```json
{
  "findings": [
    {
      "title": "Missing tests for error handling paths",
      "severity": "P2",
      "file": "tests/api/users.test.ts",
      "line": null,
      "category": "testing",
      "confidence": "high",
      "suggested_fix": "Add tests for 400, 401, 404 error responses",
      "why_it_matters": "Error paths are untested; bugs in error handling will reach production",
      "evidence": ["Only happy path tested in users.test.ts:10-25"]
    }
  ]
}
```

---

### 3. Maintainability Reviewer

**Focus Areas:**

- Code clarity and naming
- Complexity (cyclomatic, nesting depth)
- Appropriate abstractions
- Unnecessary duplication

**Review Questions:**

- Is the code clear and well-named?
- Is complexity reasonable?
- Are abstractions appropriate?
- Is there unnecessary duplication?

**JSON Output Contract:**

```json
{
  "findings": [
    {
      "title": "Excessive complexity in validation function",
      "severity": "P2",
      "file": "src/validators/input.ts",
      "line": 78,
      "category": "maintainability",
      "confidence": "medium",
      "suggested_fix": "Extract nested conditions into helper functions; reduce cyclomatic complexity from 15 to <8",
      "why_it_matters": "High complexity makes code difficult to understand and test; increases bug risk",
      "evidence": ["Function spans 120 lines with 5 levels of nesting"]
    }
  ]
}
```

---

### 4. Security Reviewer

**Focus Areas:**

- User input validation
- Authorization checks presence
- Data leakage or exposure risks
- Injection vulnerabilities (SQL, XSS, command)

**Review Questions:**

- Is user input validated?
- Are authorization checks present?
- Could data leak or be exposed?
- Are there injection risks (SQL, XSS, command)?

**JSON Output Contract:**

```json
{
  "findings": [
    {
      "title": "SQL injection vulnerability in search endpoint",
      "severity": "P0",
      "file": "src/api/search.ts",
      "line": 34,
      "category": "security",
      "confidence": "high",
      "suggested_fix": "Use parameterized query: `db.query('SELECT * FROM items WHERE name LIKE ?', [`%${term}%`])`",
      "why_it_matters": "Attacker can execute arbitrary SQL; full database compromise possible",
      "evidence": [
        "Line 34: `db.query(`SELECT * FROM items WHERE name LIKE '%${searchTerm}%'`)`"
      ]
    }
  ]
}
```

---

### 5. Performance Reviewer

**Focus Areas:**

- Unnecessary loops or operations
- Caching opportunities for expensive operations
- Database query efficiency
- Resource release (connections, handles, memory)

**Review Questions:**

- Are there unnecessary loops or operations?
- Are expensive operations cached when appropriate?
- Are database queries efficient?
- Are resources released properly?

**JSON Output Contract:**

```json
{
  "findings": [
    {
      "title": "N+1 query in user listing endpoint",
      "severity": "P1",
      "file": "src/api/users.ts",
      "line": 56,
      "category": "performance",
      "confidence": "high",
      "suggested_fix": "Use JOIN or batch loading: `db.query('SELECT * FROM users JOIN profiles ON users.id = profiles.user_id WHERE ...')`",
      "why_it_matters": "Fetching 100 users triggers 101 database queries; endpoint takes 2-3 seconds under load",
      "evidence": [
        "Loop at line 56 calls `db.getProfile(user.id)` for each user"
      ]
    }
  ]
}
```

---

### 6. API Reviewer

**Focus Areas:**

- Breaking changes to public APIs
- Versioning handled correctly
- Types/schemas backward compatible
- Contract clearly documented

**Review Questions:**

- Are there breaking changes to public APIs?
- Is versioning handled correctly?
- Are types/schemas backward compatible?
- Is the contract clearly documented?

**JSON Output Contract:**

```json
{
  "findings": [
    {
      "title": "Breaking API change without version bump",
      "severity": "P0",
      "file": "src/api/orders.ts",
      "line": 23,
      "category": "api",
      "confidence": "high",
      "suggested_fix": "Either revert field removal or bump API version to v2 and maintain v1 compatibility",
      "why_it_matters": "Removing required field breaks existing API clients; causes production failures",
      "evidence": [
        "Line 23 removed: `order_date` field no longer in response schema"
      ]
    }
  ]
}
```

---

## Orchestration Protocol

### Stage 1: Spawn Reviewers

1. **Check subagent facility availability**
   - Query platform for parallel execution support
   - If unavailable, fall back to single-pass in-process review

2. **Prepare diff context**
   - Extract full diff with adequate context lines
   - Identify changed files and line ranges
   - Prepare diff as shared context for all reviewers

3. **Spawn reviewers in parallel**
   - Launch all 6 reviewers simultaneously
   - Pass diff and review focus to each
   - Set timeout: 60 seconds per reviewer

4. **Monitor execution**
   - Track reviewer completion
   - Handle timeouts gracefully (log warning, continue with other reviewers)
   - Collect JSON output from each reviewer

### Stage 2: Aggregate Findings

1. **Collect reviewer outputs**
   - Parse JSON from each reviewer
   - Validate schema compliance
   - Log any malformed outputs

2. **Deduplicate findings**
   - Group findings by file + line
   - If multiple reviewers flag same issue:
     - Keep highest severity
     - Combine evidence from all reviewers
     - Note agreement in confidence: "Multiple reviewers agree"

3. **Sort findings**
   - Primary: Severity (P0 > P1 > P2 > P3)
   - Secondary: Category (alphabetical)
   - Tertiary: File path + line number

### Stage 3: Validation Pass (Deep Mode Only)

When `depth:deep` is enabled:

1. **Select findings for validation**
   - Validate top 15 findings (all P0, then P1, then P2)
   - If fewer than 15 findings, validate all

2. **Spawn validators in parallel**
   - One validator per finding
   - Pass finding + diff + original reviewer context
   - Use validator template from `references/validator-template.md`

3. **Filter based on validation results**
   - Keep findings where `validated: true`
   - Drop findings where `validated: false`
   - Log dropped findings with reason for audit trail

4. **Write artifacts** (depth:deep only)
   - Create `.context/pwrl-review/{run_id}/` directory
   - Write per-reviewer full analysis JSON:
     - `{reviewer}.json` contains all findings with full `why_it_matters` and `evidence[]`
   - Write validation results:
     - `validation-results.json` contains validator verdicts
   - Include run_id in summary output

### Stage 4: Present Findings

1. **Format output**
   - Group by severity
   - Use checklist format: `- [ ] **[Category]** File:Line - Description`
   - Include "Why it matters" and "Suggested fix" for each finding
   - Include evidence snippet for deep mode findings

2. **Generate summary**
   - Verdict: Ready to merge | Ready with fixes | Not ready
   - Testing gaps summary
   - Artifact path (if depth:deep)

---

## JSON Schema

### Reviewer Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["findings"],
  "properties": {
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["title", "severity", "file", "category", "confidence"],
        "properties": {
          "title": {
            "type": "string",
            "maxLength": 100,
            "description": "Clear, specific description of the issue"
          },
          "severity": {
            "type": "string",
            "enum": ["P0", "P1", "P2", "P3"],
            "description": "Severity level per severity-guide.md"
          },
          "file": {
            "type": "string",
            "description": "Repository-relative file path"
          },
          "line": {
            "type": ["number", "null"],
            "description": "Primary line number or null if not line-specific"
          },
          "category": {
            "type": "string",
            "enum": [
              "correctness",
              "testing",
              "maintainability",
              "security",
              "performance",
              "api"
            ],
            "description": "Review category matching reviewer persona"
          },
          "confidence": {
            "type": "string",
            "enum": ["high", "medium", "low"],
            "description": "Reviewer's confidence in this finding"
          },
          "suggested_fix": {
            "type": "string",
            "description": "Concrete suggestion for fixing the issue"
          },
          "why_it_matters": {
            "type": "string",
            "description": "Explanation of impact (required for depth:deep)"
          },
          "evidence": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Code snippets or explanations supporting the finding"
          }
        }
      }
    }
  }
}
```

### Validator Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["validated", "reason"],
  "properties": {
    "validated": {
      "type": "boolean",
      "description": "true if finding is confirmed, false if invalid"
    },
    "reason": {
      "type": "string",
      "maxLength": 200,
      "description": "One-sentence explanation of verdict"
    }
  }
}
```

---

## Error Handling

### Reviewer Timeout

If a reviewer times out (>60s):

- Log warning: "Reviewer {name} timed out after 60s"
- Continue with other reviewers
- Note in summary: "Note: {category} review incomplete due to timeout"

### Malformed JSON

If a reviewer returns invalid JSON:

- Log error with reviewer name and output sample
- Skip that reviewer's findings
- Continue with other reviewers
- Note in summary: "Note: {category} review failed due to output error"

### Validator Failure

If a validator fails or times out:

- Log warning with finding title and validator error
- Drop the finding (fail-safe: don't present unvalidated findings in deep mode)
- Record in validation-results.json: `{"validated": false, "reason": "Validator error: {msg}"}`

### No Subagent Support

If platform doesn't support subagents:

- Fall back to single-pass in-process review
- Use same review lenses (correctness, testing, etc.)
- Present findings in same format
- Note in summary: "Single-pass review (subagents not available)"

---

## Performance Considerations

**Parallel Execution:**

- 6 reviewers run simultaneously
- Total wall-clock time = slowest reviewer (typically 15-45s)
- Much faster than 6 sequential reviews (90-270s)

**Validation Pass:**

- 15 validators run simultaneously (or fewer if <15 findings)
- Adds 10-20s wall-clock time in deep mode
- Trade-off: Higher confidence vs additional latency

**Artifact Generation:**

- Only in depth:deep mode
- Minimal overhead (<1s for file I/O)
- Stored in `.context/pwrl-review/{run_id}/`

---

## Example Orchestration Flow

```
depth:deep, subagents:on
│
├─ Stage 1: Spawn 6 reviewers in parallel
│  ├─ correctness-reviewer → [3 findings]
│  ├─ testing-reviewer → [2 findings]
│  ├─ maintainability-reviewer → [4 findings]
│  ├─ security-reviewer → [1 finding (P0)]
│  ├─ performance-reviewer → [2 findings]
│  └─ api-reviewer → [0 findings]
│
├─ Stage 2: Aggregate findings
│  ├─ Total: 12 findings
│  ├─ Deduplicate: 11 unique findings
│  └─ Sort: P0(1), P1(3), P2(6), P3(1)
│
├─ Stage 3: Validation pass
│  ├─ Validate top 11 findings (all < 15)
│  ├─ Spawn 11 validators in parallel
│  ├─ Results: 9 validated:true, 2 validated:false
│  └─ Final: 9 findings to present
│
├─ Stage 4: Write artifacts
│  ├─ .context/pwrl-review/20260501-143022-a3f4/
│  │  ├─ correctness-reviewer.json
│  │  ├─ testing-reviewer.json
│  │  ├─ maintainability-reviewer.json
│  │  ├─ security-reviewer.json
│  │  ├─ performance-reviewer.json
│  │  ├─ api-reviewer.json
│  │  └─ validation-results.json
│  └─ Mention artifact path in summary
│
└─ Stage 5: Present findings
   └─ Formatted checklist with 9 findings
```
