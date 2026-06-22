---
title: Phase Manifest as Model-Agnostic Enforcement
date: 2026-06-21
category: pattern
tags: [phase-manifest, model-agnostic, enforcement, validate-skills, core-skills]
severity: medium
priority: high
source: plan 2026-06-21-001 U5/U6/U7
---

# Phase Manifest as Model-Agnostic Enforcement

**Pattern:** To make advisory phase gates deterministic across any agent or model, add a machine-readable phase manifest (`references/phases.yaml`) to each core skill and have the validator parse it, verifying declared phase headings + step keywords are present in the skill file — independent of runtime behavior.

## Problem

`pwrl-phase-checkpoint` defines phase schemas and quality gates, but nothing mechanically checks that a core skill's `SKILL.md` actually contains its declared phases and steps. Any agent/model can silently skip phase steps. The gates are *descriptive*, not *enforced*.

## Pattern

1. **Manifest schema** (`pwrl-standards/references/phase-manifest-schema.md`): a simple YAML format listing, per core skill, the ordered phases and the required step keywords per phase
2. **Manifest per core skill** (`pwrl-<skill>/references/phases.yaml`): populated from the existing `### Phase N:` headings and `pwrl-phase-checkpoint/references/phase-schemas.md` required fields
3. **Validator enforcement** (`validate-skills.js`): loads the manifest, verifies each declared phase has a `### Phase N:` heading and each declared step keyword appears in that phase's section text

```yaml
# references/phases.yaml example
workflow: pwrl-review
phases:
  - number: 1
    name: "Scope Validation"
    required_steps: ["scope_verdict", "files_analyzed", "interaction_mode", "user_confirmed"]
```

## Why Model-Agnostic

Enforcement checks the **skill file content**, not the agent's runtime behavior. Whether Claude, GPT, Gemini, or a human runs the skill, the file must contain the declared phases and steps or `npm run validate:skills` fails. No agent-specific hooks, no runtime instrumentation.

## Design Constraints

- Manifest format must be parseable by the validator's existing simple line parser (no external YAML dependency)
- REQUIRED for the 5 core orchestrators (review, work, plan, tasks, learnings); OPTIONAL elsewhere (manifest opted-in)
- Step keywords must already appear in current content (no aspirational keywords) so enforcement passes immediately

## Applicability

Any skill framework where phase discipline must hold across heterogeneous executors (different AI models, human contributors, CI). Especially when a separate "checkpoint" skill already defines the phase contract — the manifest bridges that contract to mechanical enforcement.

## Cross-References

- Source plan: `docs/plans/2026-06-21-001-skills-standards-remediation.md` (U5 schema, U6 manifests, U7 enforcement)
- Phase definitions: `pwrl-phase-checkpoint/references/phase-schemas.md`
- Related: `pattern/skill-integration-testing-micro-skills-2026-06-10.md` (per-skill + cross-skill contract validation)
