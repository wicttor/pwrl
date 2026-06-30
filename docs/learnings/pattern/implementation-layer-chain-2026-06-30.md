---
title: "Implementation-Layer Chain — A Documented Change Is Only Real If It Reaches the Layer That Ships"
timestamp: 2026-06-30T00:50:00Z
category: pattern
type: PWRL Learning
severity: high
tags:
  - architecture
  - contract-enforcement
  - audit
  - implementation-layers
  - propagation
domains:
  - pwrl-work
  - pwrl-review
  - deployment
  - skill-architecture
---

# Implementation-Layer Chain — A Documented Change Is Only Real If It Reaches the Layer That Ships

## Pattern

A change to a complex system (a contract, a fix, a refactor) is not "fully implemented" until it propagates through every layer of the system. The layers form a chain:

```
Learning → Plan → Task → Repo → Install → Published
   (1)      (2)     (3)     (4)      (5)         (6)
```

A change is fully implemented only when it is present and consistent in **every** layer. A change that reaches layer 4 (the repo) but not layer 5 (the install) is incomplete. A change that reaches layer 5 but not layer 6 (the published package) is incomplete. A change that is described in layer 1 (a learning) but not implemented in any skill (layers 3 or 4) is incomplete.

## Why

The existing decision learning `documented-vs-implemented-contract-gap-2026-06-29.md` covers the gap between "documented in a learning" and "implemented in a SKILL.md". This is a binary version of a more nuanced problem: a change can be present at every level of the system and still be missing from the published package, because the implementation stopped at the wrong tree (e.g., the install path instead of the repo path).

The 2026-06-29 review of plan 2026-06-29-003 found exactly this: U1–U5 were documented in tasks, implemented in `~/.agents/skills/pwrl-*/SKILL.md` (the install), but the repo files and the published package contained none of the changes. The change had stopped at the wrong layer.

The chain model generalizes the binary "documented vs implemented" to a multi-layer audit:

| Layer | What it represents | How to check |
|---|---|---|
| 1. Learning | The pattern/decision that explains the change | `ls docs/learnings/{pattern,decision}/` |
| 2. Plan | The plan that scopes the work into units | `ls docs/plans/2026-06-29-*.md` |
| 3. Task | The unit that defines the implementation | `ls docs/tasks/{to-do,in-progress,for-review,done}/` |
| 4. Repo | The source code that the task edits | `git diff <base>...HEAD -- pwrl-*/SKILL.md` |
| 5. Install | The deployment copy at `~/.agents/skills/` | `diff -q <repo>/pwrl-*/SKILL.md ~/.agents/skills/pwrl-*/SKILL.md` |
| 6. Published | The npm package that ships to users | `npm view @wicttor/pwrl version` and `npm pack --dry-run` |

A change is fully implemented if the same content is present at every layer. A gap at any layer is a bug to fix.

## How to Audit

For each change, walk the chain and verify the content at each layer:

```bash
# 1. Is the pattern/decision documented?
ls docs/learnings/{pattern,decision}/ | grep <slug>

# 2. Is the plan documented?
ls docs/plans/ | grep <plan-id>

# 3. Is the task documented?
ls docs/tasks/{to-do,in-progress,for-review,done}/ | grep <unit-id>

# 4. Is the change in the repo?
git diff <base>...HEAD -- <file>

# 5. Is the change in the install?
diff <repo>/<file> ~/.agents/skills/<file>
# Expected: no output (files identical)

# 6. Is the change in the published package?
# (After `npm publish`, verify with `npm view @wicttor/pwrl files | grep <file>`)
```

A gap at any layer should be flagged. The most common gaps:

- **Layer 1 missing:** The change is implemented but not documented. Future readers won't know why it exists.
- **Layer 2 missing:** The change is documented but not scoped into a plan. Hard to track.
- **Layer 3 missing:** The change is planned but not sliced into tasks. Hard to execute.
- **Layer 4 missing:** The change is in a task but not in the repo. Task wasn't executed or was executed in the wrong tree.
- **Layer 5 missing:** The change is in the repo but not in the install. `npm install` wasn't run or the install was modified.
- **Layer 6 missing:** The change is in the install but not in the published package. `npm publish` wasn't run, or the wrong version was published.

## How to Prevent

### For the agent

Before declaring a task "done", walk the chain and verify all 6 layers. The current contract (U1–U5) only covers layers 1–4. The new contract extension (`code-edit-pre-flight-guard-location-2026-06-30.md`) covers layers 4–5. The full chain coverage requires the agent to explicitly check all 6.

### For the validator

Add a chain-coverage check to `pwrl-standards/scripts/validate-skills.js` (or a new `validate-pipeline.js`) that walks the chain for each change and flags any gap.

### For the postinstall script

Add a sanity check at install time: for each `pwrl-*/SKILL.md` in the install, compare its mtime to the corresponding repo file. If the install is newer than the repo, log a warning ("Edits to install path will be lost on next install").

## When to Use

- Any change that crosses multiple system layers (a new contract, a new pattern, a new dependency)
- Any review that wants to verify the change is "real" (will reach the user)
- Any audit that wants to find where a change stopped propagating

## When NOT to Use

- Single-layer changes (e.g., a typo fix in one file)
- Documentation-only changes that don't need to ship (e.g., a meeting note)
- Changes that explicitly target one layer (e.g., a user-skill in `~/.agents/`)

## Trade-offs

**Pros:**
- Generalizes the "documented vs implemented" gap to a multi-layer audit
- Catches the install-path-vs-repo-path bug at review time
- Provides a checklist for reviewers to verify change propagation
- Documents the system architecture in a useful way

**Cons:**
- More steps to verify per change
- Not all changes need to reach all 6 layers (some are layer-specific)
- The chain is a model, not a strict requirement; over-applying it adds overhead

## Related Learnings

- `decision/documented-vs-implemented-contract-gap-2026-06-29.md` — the binary version (learning vs skill) that this pattern extends
- `gotcha/install-path-vs-repo-path-divergence-2026-06-30.md` — a specific gap at layer 4–5
- `pattern/code-edit-pre-flight-guard-location-2026-06-30.md` — the architectural fix for layer 4–5
- `pattern/task-state-machine-enforcement-2026-06-29.md` — the contract this pattern audits
- `workflow/commit-message-vs-diff-verification-2026-06-30.md` — the workflow for catching overstating commits

## Lessons Learned

1. **A change is a chain, not a single step.** Each layer is a potential failure point. The chain makes the failure points explicit.
2. **The most common gap is between the repo and the install.** A change can be "in the code" (the install) and "not in the source of truth" (the repo) — a state that is hard to detect without a chain audit.
3. **Audit checklists beat ad-hoc verification.** A 6-step checklist catches more bugs than a 1-step "is it done?" check.
