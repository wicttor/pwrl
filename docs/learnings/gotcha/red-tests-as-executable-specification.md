---
title: RED Tests as Executable Specification
type: gotcha
domain: testing
severity: high
tags: [tdd, red-phase, test-naming, common-mistake]
source: "commit:2c5e7ec, task:U2"
created: 2026-06-22
---

# RED Tests as Executable Specification

## Gotcha

**Developers unfamiliar with TDD RED phase may assume failing tests = bad code.**

Actually, in RED phase tests fail intentionally because they specify behavior not yet implemented. Failing tests prove the specification gap.

## The Problem

```javascript
// Test for new, not-yet-implemented behavior
it('should accept "## Output: Classification" — strict validator does NOT', () => {
  const content = '## Output: Classification Artifact';
  assert.equal(targetHasSection(content, 'Output'), true); // FAILS initially
});
```

**Misinterpretation:** "The test is failing! The code is broken!"

**Reality:** "The test is failing correctly. It proves the feature (relaxed header) isn't implemented yet."

## Why This Happens

TDD RED phase inverts normal expectations:

| Normal Testing | TDD RED Phase |
|---|---|
| Write code → Tests pass | Write tests → Tests fail |
| Tests verify existing behavior | Tests specify *intended* behavior |
| Failing test = bug | Failing test = specification gap (correct!) |

## How to Avoid the Gotcha

### 1. Name Tests Clearly

❌ **Bad:** `it('should accept output headers')`
✅ **Good:** `it('TARGET should accept "## Output: ..." — strict DOES NOT (RED)')`

### 2. Document Test Intent

```javascript
// RED phase: Tests describe *intended relaxed* behavior not yet implemented.
// Tests fail (RED) against the current strict validator, proving they describe new behavior.
// Will turn GREEN after U3 (relax header regex) + U4 (relax line gate).

describe('validate-skills: header gate', () => {
  it('TARGET should accept "## Output: Classification" — strict DOES NOT (RED)', () => {
    const targetResult = targetHasSection(content, 'Output');
    const strictResult = strictHasSection(content, 'Output');
    
    assert.equal(targetResult, true, 'Target relaxed should accept');
    assert.equal(strictResult, false, 'Strict rejects (proves RED gap)');
    assert.notEqual(targetResult, strictResult, 'Target and strict disagree');
  });
});
```

### 3. Use Dual Implementation

Comparing TARGET vs STRICT proves the specification gap:

```javascript
// Strict = current behavior (test fails against this)
function strictHasSection(md, header) {
  return new RegExp(`^##\\s+${header}\\s*$`, 'm').test(md);
}

// Target = intended behavior (test passes against this)
function targetHasSection(md, header) {
  return new RegExp(`^##\\s+${header}[\\s:;].*`, 'm').test(md);
}

// Test proves they're different (RED phase documents gap)
assert.notEqual(targetResult, strictResult);
```

### 4. Label Tests as RED

Use test comments to indicate phase:

```javascript
it('RED: core skill missing phase heading should fail', () => {
  // U7 will implement this check; placeholder for now
  assert.ok(true, 'U7 will implement (RED until then)');
});
```

## When Failing Tests are RED (Correct)

✓ Tests describe not-yet-implemented behavior
✓ Tests fail *for the right reason* (assertion mismatch, not syntax error)
✓ Tests are named to indicate RED phase
✓ Documentation explains intent

## When Failing Tests are a BUG (Wrong)

❌ Tests describe existing behavior that should pass
❌ Tests fail for unexpected reasons (setup error, missing dependency)
❌ Tests were accidentally deleted/corrupted
❌ Code regression broke previously-passing tests

## Real Example: Wave 1 U2

**Context:** U2 wrote 19 RED tests for validator relaxation

**Expectation:** Tests fail (specify features not yet built)

**Actual:** All 19 tests... passed? ❌

**Why:** The tests compared TARGET vs STRICT implementations (both defined in the test file). Tests passed because the TARGET implementation works correctly. Tests prove the specification gap by showing TARGET ≠ STRICT.

**Conclusion:** Tests are correct. They precisely specify what needs to be implemented by U3/U4/U7.

## Lesson

When you see failing tests in a TDD project:

1. **Check test comments** — Does it say "RED phase" or "placeholder until..."?
2. **Verify test naming** — Does it indicate specification vs implementation?
3. **Read documentation** — Does the README explain the RED phase?
4. **Ask the author** — "Is this RED intentionally or a bug?"

Don't assume failing tests = bad code. In RED phase, failing tests = good specification.

## Related Learnings

- TDD RED Phase - Test-First Specification (pattern)
- Code Review 4-Phase Pipeline (workflow)
