---
title: TDD RED Phase - Test-First Specification
category: pattern
type: PWRL Learning
domain: testing
severity: high
tags: [tdd, test-first, specification, behavioral-contract]
source: "commit:2c5e7ec, task:U2"
created: 2026-06-22
---

# TDD RED Phase - Test-First Specification

## Pattern

Use dual-implementation comparison (TARGET vs STRICT) to effectively document and prove test specification gaps.

## Context

When implementing a feature with strict new behavior requirements, write tests against the *intended* (target) behavior **before** implementing it. The tests fail initially (RED phase), which is correct — they prove a specification gap.

## Implementation

1. **Define current behavior** — Implement functions matching current (strict) implementation
2. **Define target behavior** — Implement functions matching intended (relaxed) behavior
3. **Write tests comparing both** — Assert that target passes and strict fails
4. **Prove the RED state** — Test failures demonstrate the specification gap, not broken code
5. **Developers implement** — They know exactly what behavior to change

## Example: Validator Relaxation

```javascript
// Current (strict) validator
function strictHasSection(md, header) {
  const regex = new RegExp(`^##\\s+${header}\\s*$`, 'm');
  return regex.test(md);
}

// Target (relaxed) validator
function targetHasSection(md, header) {
  const regex = new RegExp(`^##\\s+${header}[\\s:;].*`, 'm');
  return regex.test(md);
}

// Test proving RED gap
it('should accept "## Output: Classification" — strict does NOT', () => {
  const content = '## Output: Classification Artifact';
  assert.equal(targetHasSection(content, 'Output'), true);  // PASS
  assert.equal(strictHasSection(content, 'Output'), false); // PASS
  assert.notEqual(target, strict); // ← Proves specification gap
});
```

## Benefits

✓ Clear specification before implementation
✓ Tests fail "for the right reason" (spec gap, not syntax error)
✓ Zero confusion about what to implement
✓ Easy for developers to verify: "make this test GREEN"

## Cautions

⚠️ Developers unfamiliar with TDD RED phase may think failing tests = bad code
⚠️ Must document test intent clearly: "Tests fail initially. This is correct and proves the spec gap."
⚠️ Name tests to indicate RED state: "TARGET should accept... — strict DOES NOT (RED)"

## When to Use

- Feature requires behavior changes to existing code
- New validation rules need specification before implementation
- Multiple teams implementing different parts (tests provide contract)
- Regulatory/correctness requirements demand specification first

## Related Learnings

- RED Tests as Executable Specification (gotcha)
- Code Review 4-Phase Pipeline (workflow)
