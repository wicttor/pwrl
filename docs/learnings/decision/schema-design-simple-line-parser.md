---
title: Schema Design - Simple Line Parser
type: decision
domain: architecture
severity: high
tags: [schema-design, constraints, no-external-deps, yaml]
source: "commit:2c5e7ec, task:U5"
created: 2026-06-22
---

# Schema Design - Simple Line Parser

## Decision

**CHOSEN:** Parse YAML manifest using simple 2-space-indented line-based parser (mirrors existing `parseFrontmatter` function)

**REJECTED:** External YAML library (`js-yaml`, `yaml`)

## Rationale

1. **Lightweight** — Validator remains self-contained; no external dependencies
2. **Maintainable** — Code is explicit and easy to audit; developers understand parsing logic without library docs
3. **Consistent** — Mirrors existing frontmatter parser; one parsing pattern for the entire validator
4. **Sufficient** — YAML schema constraints (no anchors, no multi-line strings) make hand-rolled parser sufficient

## Constraints Applied

Format is deliberately simple:

```yaml
workflow: pwrl-review
phases:
  - number: 1
    name: "Scope Validation"
    required_steps:
      - scope_verdict
      - files_analyzed
```

**Rules:**
- Exactly 2 spaces per indentation level
- No tabs, no 1/3/4-space variants
- No anchors, aliases, merge keys
- No multi-line strings (`|`, `>`)
- No inline JSON or complex data structures

## Implementation Pattern

```javascript
function parsePhaseManifest(content) {
  const lines = content.split(/\r?\n/);
  let workflow, phases = [];
  let currentPhase = null;
  
  for (const line of lines) {
    if (line.startsWith('workflow:')) {
      workflow = line.split(':')[1].trim();
    } else if (line.startsWith('- number:')) {
      currentPhase = { number: parseInt(...), required_steps: [] };
      phases.push(currentPhase);
    } else if (line.includes('required_steps:')) {
      // Start collecting steps
    } else if (line.trim().startsWith('- ') && currentPhase) {
      currentPhase.required_steps.push(line.trim().slice(2));
    }
  }
  return { workflow, phases };
}
```

## Benefits

✓ No external dependencies added to core validator
✓ Easier to audit for security (code is visible, not hidden in library)
✓ Consistent with existing parsing patterns in validator
✓ Simple enough for developers to extend or fix

## Tradeoffs

⚠️ Cannot support all YAML features (but constraints make that acceptable)
⚠️ Hand-rolled parser requires more testing than battle-tested library
⚠️ If future needs complex YAML, migration would require refactoring

## When to Use This Pattern

- Core tools that must remain self-contained
- Formats with predictable, constrained structure
- Security-sensitive parsing (auditable code preferred)
- Projects with strong "no external deps" requirements

## When NOT to Use This Pattern

- Supporting full YAML spec required
- Team lacks parser implementation expertise
- Frequent format changes anticipated
- External library is already a dependency anyway

## Related Learnings

- Code Review 4-Phase Pipeline (workflow)
- Schema Design principles (architecture)
