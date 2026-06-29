---
title: Interaction-Mode Three-Mode Propagation
timestamp: 2026-06-29
category: pattern
type: PWRL Learning
tags: [interaction-mode, three-mode, propagation, entry-point-placement, smart-mode, core-skills]
severity: high
priority: high
source: plan 2026-06-29-001 U1–U8
---

# Interaction-Mode Three-Mode Propagation

**Pattern:** Restore and codify an explicit user-facing interaction-mode ask (`detailed | smart | yolo`) at the entry point of every core PWRL skill workflow, propagate the value through emitted artifacts, and document the propagation contract in every orchestrator — eliminating the partial-propagation drift that grew when only one sub-skill implemented the ask.

## Problem

The `interactionMode` field is the user-facing control surface for "how much do I want to be interrupted?" across the entire PWRL ecosystem. It exists in the decision learning `docs/learnings/decision/interaction-modes-for-user-engagement.md` and was originally implemented in `pwrl-work-triage` Step 5. But of the 12 PWRL files that should reference it:

- 1 implemented the ask (with only the legacy two-mode choice: Detailed / Yolo)
- 9 were silent — no ask, no schema field, no propagation documentation
- 2 referenced it in passing without an actual ask

Result: users who invoked `/pwrl-plan`, `/pwrl-review`, `/pwrl-learnings`, `/pwrl-tasks`, or `/pwrl-end-session` had no opportunity to choose their engagement level. The pattern existed in name but not in practice.

## Solution: Three Rules

### Rule 1 — Three-Mode Contract

Codify `interactionMode: detailed | smart | yolo` as the canonical field. The three values have distinct semantics:

- **`detailed`** — Pause at every phase transition; show generated artifacts; require explicit approval to proceed.
- **`smart`** — Phases run automatically; pause only when the next phase produces a HIGH-risk operation (destructive git, irreversible API calls, schema-breaking migrations). v1 simplification: behaves like Yolo with a single confirmation prompt at workflow start.
- **`yolo`** — Every phase runs automatically; only the final outcome is reported.

The schema lives in `pwrl-standards/SCHEMA.md` §"Interaction Mode Field" (added in plan 2026-06-29-001 U1) and is the single source of truth for valid values and their semantics.

### Rule 2 — Entry-Point Placement

The mode ask lives in the **first sub-skill the user actually invokes** — not in the orchestrator. The orchestrator's `SKILL.md` only documents the propagation contract.

| Workflow          | Entry-Point Sub-Skill (or Phase)           | Step / Phase Number |
| ----------------- | ------------------------------------------ | ------------------- |
| `pwrl-plan`       | `pwrl-plan-scope`                          | Step 1.5            |
| `pwrl-work`       | `pwrl-work-triage`                         | Step 5              |
| `pwrl-review`     | `pwrl-review-scope`                        | Step 0              |
| `pwrl-learnings`  | `pwrl-learnings-extract`                   | Step 1.5            |
| `pwrl-tasks`      | (single-file orchestrator, no sub-skill)   | Phase 0             |
| `pwrl-end-session`| `pwrl-end-session-checkpoint`              | Step 1.5            |

A "Required Interaction Section Template" in `pwrl-standards/SCHEMA.md` provides the verbatim wording for the ask (heading, `ask_user_question` block, propagation note). Sub-skills copy-paste this template rather than inventing their own wording — that eliminates drift.

### Rule 3 — Artifact Propagation, Not Sidecar Files

The first phase of each workflow emits the `interactionMode` value in its output artifact's YAML frontmatter (or in its inline schema block). All downstream phases read the value from the artifact, not from environment variables, `.pwrlrc.json`, or in-memory state. This matches the existing Phase 1 → Phase N propagation contract documented in `pwrl-plan/SKILL.md` and `pwrl-learnings/SKILL.md`.

Why artifacts, not sidecars:

- **Portable** — the mode travels with the artifact when the artifact is moved, archived, or hand-edited.
- **Discoverable** — anyone reading the artifact can see what mode the user chose.
- **Stateless** — downstream phases don't need to read a config file or query the user again.

The orchestrator documents the propagation contract in an `### Interaction Mode Propagation` section. The section names the entry-point sub-skill, lists the three modes with their semantics, and references this pattern learning.

## Smart-Mode Risk Gating

The `smart` value is new in 2026-06-29. The v1 implementation is intentionally simple: **behaves like Yolo with a single confirmation prompt at workflow start.** This is sufficient for the immediate need (restoring the third value) but is a deliberate simplification of the full vision.

The full vision: `smart` mode pauses only when the next phase produces a HIGH-risk operation. The taxonomy of "what counts as HIGH-risk" is a future enhancement — see §"Future Refinements" below.

## Implementation

- **U1** — Added the canonical schema and template to `pwrl-standards/SCHEMA.md`.
- **U2–U7** — Each entry-point sub-skill (or single-file orchestrator) got the canonical ask pasted in, with a propagation note appended.
- **U8** — Each of the 6 orchestrators got an `### Interaction Mode Propagation` section; this pattern learning was created; the existing decision learning's "Future Refinements" was updated to mark the third-mode work as done; `package.json` was bumped; `CHANGELOG.md` got an `[Unreleased]` entry.

## Validation

Verify the pattern is fully applied by running:

```bash
# 1. All 6 entry points have the canonical ask
for f in pwrl-plan-scope pwrl-work-triage pwrl-review-scope pwrl-learnings-extract pwrl-tasks pwrl-end-session-checkpoint; do
  test -f "/home/wicttor/Projects/pwrl/$f/SKILL.md" || continue
  grep -q "Select Interaction Mode" "/home/wicttor/Projects/pwrl/$f/SKILL.md" && \
    echo "✓ entry-point: $f" || echo "✗ MISSING ASK: $f"
done

# 2. All 6 orchestrators have the propagation section
for f in pwrl-plan pwrl-work pwrl-review pwrl-learnings pwrl-tasks pwrl-end-session; do
  grep -q "Interaction Mode Propagation" "/home/wicttor/Projects/pwrl/$f/SKILL.md" && \
    echo "✓ orchestrator: $f" || echo "✗ MISSING SECTION: $f"
done

# 3. The schema and template live in the standards
grep -q "## Interaction Mode Field" /home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md && \
  grep -q "## Required Interaction Section Template" /home/wicttor/.agents/skills/pwrl-standards/SCHEMA.md && \
  echo "✓ standards doc has schema + template"

# 4. Each ask uses the verbatim three options
for f in pwrl-plan-scope pwrl-work-triage pwrl-review-scope pwrl-learnings-extract pwrl-tasks pwrl-end-session-checkpoint; do
  d=$(grep -c "Detailed (Step-by-Step)" "/home/wicttor/Projects/pwrl/$f/SKILL.md")
  s=$(grep -c "Smart (Risk-gated automation)" "/home/wicttor/Projects/pwrl/$f/SKILL.md")
  y=$(grep -c "Yolo (Full Automation)" "/home/wicttor/Projects/pwrl/$f/SKILL.md")
  [ "$d" = "1" ] && [ "$s" = "1" ] && [ "$y" = "1" ] && \
    echo "✓ three options: $f" || echo "✗ WRONG WORDING: $f (d=$d s=$s y=$y)"
done
```

## Why This Pattern Matters

1. **User autonomy is non-negotiable.** People want to choose their own pace. Forcing every workflow into one mode is a regression.
2. **Consistency builds trust.** Six workflows using the same ask wording and the same option descriptions lets users develop a single mental model. Drift breaks that model.
3. **Documentation must follow implementation.** An undocumented propagation contract is a future bug — a contributor adding a new sub-skill won't know to read the mode from the artifact.
4. **Smart mode is the middle ground users want.** Detailed is too slow for routine work; Yolo is too risky for high-stakes changes. Smart fills the gap (even in its v1 simplification).

## Cross-References

- **Source plan:** `docs/plans/2026-06-29-001-restore-interaction-mode-ask.md`
- **Decision (evolved):** `docs/learnings/decision/interaction-modes-for-user-engagement.md` — the original two-mode decision; this pattern's third-mode upgrade is reflected in that learning's "Future Refinements" section.
- **Schema:** `pwrl-standards/SCHEMA.md` §"Interaction Mode Field" + §"Required Interaction Section Template"
- **Related pattern:** `pattern/state-schema-workflow-context-2026-06-05.md` — typed context objects flowing between phases (the `interactionMode` field is one such field).
- **Related pattern:** `pattern/phase-manifest-model-agnostic-enforcement-2026-06-21.md` — machine-readable phase manifests for validator enforcement (orthogonal: manifest enforces structure; this pattern enforces user-facing consistency).
- **Related workflow:** `workflow/cross-skill-terminology-update-2026-06-19.md` — the six-phase pattern used to apply the wording update across all 6 entry points in a single coordinated pass.
- **Related workflow:** `workflow/plan-to-tasks-pipeline-for-docs-migrations-2026-06-28.md` — the plan-to-tasks pipeline used to slice plan 2026-06-29-001 into 8 executable units (U1–U8).

## Future Refinements

- **Smart-mode risk-classification taxonomy.** Enumerate which sub-skill operations count as "HIGH-risk" in Smart mode (e.g., `git push --force`, `rm -rf`, schema-breaking migrations, posting a formal GitHub review on a release-blocking PR). Once enumerated, each sub-skill can implement targeted Smart-mode pauses without re-asking the user at every transition.
- **Cross-session mode persistence.** Honor a `.pwrlrc.json` field or a `--mode` CLI flag so users who always want Yolo don't get re-prompted on every workflow invocation. The mode is set per-invocation today; persistent mode is a future enhancement.
- **Mode-aware review verdict logic.** `pwrl-review-report` currently always asks the user to approve / request changes / clarify. In Yolo mode, the report should auto-approve unless CRITICAL issues are found. This behavior change is out of scope for plan 2026-06-29-001.
- **Per-phase mode override.** Allow users to start in Yolo for prepare/execute but switch to Detailed for review (or vice versa) without re-invoking the whole workflow. Requires a per-phase `interactionMode` field rather than the single workflow-level field used today.
