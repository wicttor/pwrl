# Severity Guide

Classification system for code review findings.

---

## Severity Levels

### P0 - Critical

**Definition:** Critical bug, security issue, or data corruption risk that must be fixed before merge.

**Characteristics:**

- Security vulnerabilities (SQL injection, XSS, auth bypass)
- Data loss or corruption risks
- Production crash scenarios
- Critical business logic errors

**Action:** Must fix before merge. Block PR until resolved.

**Examples:**

- SQL injection vulnerability in user input handling
- Missing authentication check on admin endpoint
- Race condition causing data corruption
- Uncaught exception in critical path causing service crash

---

### P1 - High

**Definition:** High-impact defect likely to occur in normal usage.

**Characteristics:**

- Logic errors in common code paths
- Missing error handling for expected failures
- Performance issues affecting user experience
- Breaking changes without migration path

**Action:** Should fix before merge. Can merge with explicit acknowledgment and follow-up plan.

**Examples:**

- Off-by-one error in pagination logic
- Missing null check causing likely crash
- N+1 query in frequently-used endpoint
- API contract change without versioning

---

### P2 - Moderate

**Definition:** Moderate issue with meaningful downside but limited scope or likelihood.

**Characteristics:**

- Edge case handling issues
- Maintainability concerns (complexity, duplication)
- Minor performance inefficiencies
- Missing test coverage for non-critical paths

**Action:** Fix if straightforward. Can defer to follow-up if time-constrained.

**Examples:**

- Edge case not handled (e.g., empty array, max value)
- Complex nested logic that could be simplified
- Duplicated code across 2-3 functions
- Missing tests for error paths

---

### P3 - Low

**Definition:** Minor improvement or low-impact issue.

**Characteristics:**

- Code style inconsistencies
- Naming improvements
- Documentation gaps
- Nice-to-have optimizations

**Action:** Optional. Improve if trivial, otherwise defer or ignore.

**Examples:**

- Inconsistent variable naming
- Missing docstring on helper function
- Opportunity to use more idiomatic pattern
- Minor optimization that saves negligible time

---

## Severity Assessment Guidelines

### How to Choose Severity

Ask these questions in order:

1. **Does this cause data loss, corruption, or a security vulnerability?**
   - YES → **P0**

2. **Will this likely cause errors or incorrect behavior in normal usage?**
   - YES → **P1**

3. **Is this an edge case, maintainability concern, or moderate issue?**
   - YES → **P2**

4. **Is this a minor style or documentation issue?**
   - YES → **P3**

### Severity vs Confidence

**High severity + Low confidence = Present as lower severity**

If you're uncertain whether a P0 issue is real, present it as P1 and explain uncertainty.

Example:

- "Potential SQL injection (P1): User input appears unescaped, but could not verify if ORM handles this. Review escaping logic."

### When in Doubt

**Err on the side of higher severity** if the impact is unclear. It's better to flag a potential P0 as P1 than to miss a critical issue entirely.

But **explain your reasoning** so the reviewer can adjust if needed.

---

## Severity by Review Category

### Correctness

| Issue                       | Typical Severity |
| --------------------------- | ---------------- |
| Data corruption             | P0               |
| Logic error (common path)   | P1               |
| Edge case not handled       | P2               |
| Off-by-one in rare scenario | P2-P3            |

### Security

| Issue                 | Typical Severity |
| --------------------- | ---------------- |
| SQL injection         | P0               |
| XSS vulnerability     | P0               |
| Auth bypass           | P0               |
| Missing auth check    | P0-P1            |
| Weak input validation | P1-P2            |
| Data exposure (logs)  | P1-P2            |

### Testing

| Issue                    | Typical Severity |
| ------------------------ | ---------------- |
| No tests for new feature | P1               |
| Missing edge case tests  | P2               |
| Weak assertions          | P2               |
| Missing test docstrings  | P3               |

### Maintainability

| Issue                        | Typical Severity |
| ---------------------------- | ---------------- |
| Excessive complexity (>10CC) | P2               |
| Significant duplication      | P2               |
| Poor naming (confusing)      | P2-P3            |
| Inconsistent style           | P3               |

### Performance

| Issue                          | Typical Severity |
| ------------------------------ | ---------------- |
| N+1 query (hot path)           | P1               |
| Blocking I/O in async context  | P1               |
| Inefficient algorithm (hot)    | P1-P2            |
| Minor inefficiency (cold path) | P3               |

### API Contracts

| Issue                            | Typical Severity |
| -------------------------------- | ---------------- |
| Breaking change (no migration)   | P0               |
| Breaking change (with migration) | P1               |
| Missing backward compatibility   | P1-P2            |
| Inconsistent API patterns        | P2-P3            |

---

## Special Cases

### Multiple Related Issues

If multiple findings relate to the same root cause, report them together as a single finding with the highest severity.

Example:

- "Missing input validation (P1): Endpoints A, B, and C all accept unvalidated user input. Recommend centralized validation middleware."

### Partial Information

If you cannot fully assess an issue due to missing context:

- Lower the severity by one level
- Add confidence note: "Could not verify X; may be higher severity if Y is true"
- Suggest specific investigation steps

### Pre-Existing Issues

If an issue predates this change (found via git blame):

- Note in finding: "Pre-existing (line unchanged since YYYY-MM)"
- Consider lowering severity by one level
- Focus review on issues introduced by this change

---

## Calibration Examples

### Example 1: Authentication Check

```python
@app.route('/admin/delete-user')
def delete_user():
    user_id = request.args.get('user_id')
    db.delete_user(user_id)
    return {'status': 'deleted'}
```

**Finding:** Missing authentication check on admin endpoint (P0)
**Why P0:** Any user can delete any other user. Data loss risk. Security vulnerability.

---

### Example 2: Null Handling

```python
def process_order(order):
    items = order.get('items')  # Could be None
    for item in items:  # Crashes if None
        process_item(item)
```

**Finding:** Missing null check for items (P1)
**Why P1:** Likely crash scenario. Orders without items are plausible input.

---

### Example 3: Edge Case

```python
def paginate(items, page, per_page=10):
    start = page * per_page
    end = start + per_page
    return items[start:end]
```

**Finding:** Negative page number not handled (P2)
**Why P2:** Edge case. Unlikely user input. But should validate: `if page < 0: raise ValueError`

---

### Example 4: Naming

```python
def f(x, y):
    return x + y
```

**Finding:** Vague function and parameter names (P3)
**Why P3:** Maintainability issue. Not incorrect. Improve if trivial: `def add_numbers(a, b)`

---

## Output Format

When reporting findings, always include:

```
### P[0-3] - [Category]

- [ ] **[Category]** File:Line - Issue description
      → Why it matters | Suggested fix
      [Evidence: snippet or explanation if available]
```

Example:

```
### P1 - High

- [ ] **[Security]** auth/login.py:45 - SQL query uses string interpolation with user input
      → Enables SQL injection attacks | Use parameterized query: `cursor.execute("SELECT * FROM users WHERE username = ?", (username,))`
      Evidence: `cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")`
```
