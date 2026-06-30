---
title: "Extend the Pre-Flight Guard Contract to Code-Edit Location"
timestamp: 2026-06-30T00:50:00Z
category: pattern
type: PWRL Learning
severity: high
tags:
  - architecture
  - contract-enforcement
  - pre-flight-guard
  - multi-tree
  - code-edit-location
domains:
  - pwrl-work
  - pwrl-review
  - skill-architecture
  - task-management
---

# Extend the Pre-Flight Guard Contract to Code-Edit Location

## Pattern

The `Task Lifecycle Contract` in `pwrl-work/SKILL.md` (added in plan 2026-06-29-003) defines **who** owns each task file transition. It does not define **where** the agent should edit source code files. A 2026-06-29 session demonstrated that this omission is exploitable: the agent edited `~/.agents/skills/pwrl-*/SKILL.md` (the install path) instead of `~/Projects/pwrl/pwrl-*/SKILL.md` (the repo path) and the contract had nothing to say about it.

Extend the contract to specify not just **who** performs a transition but **where** it takes place. For PWRL, add a "Code-Edit Location" rule to the contract:

> **All edits to `pwrl-*/SKILL.md` files must target the repo path, never the install path. The install path is a deployment artifact; the repo is the source of truth.**

Encode as a Pre-Flight Guard at the top of `pwrl-work/SKILL.md` (or a sibling contract file), parallel to the existing task-lifecycle Pre-Flight Guards.

## Why

The existing contract is incomplete in two dimensions:

1. **Action type:** It covers task file transitions (`to-do → in-progress`, etc.) but not source code file edits.
2. **Location:** It assumes the agent already knows the right location. The agent does not — the install path and the repo path are both writable, and the agent defaults to the install path because it sees the install path first when running `pwrl init`.

A contract that does not specify action type and location is silently broader than its authors intended. The agent fills the gap with its own interpretation, which may be wrong.

## Implementation

### Add a Code-Edit Location Pre-Flight Guard to the contract

In `pwrl-work/SKILL.md`, alongside the existing `## Task Lifecycle Contract` section, add a `## Code-Edit Location` section:

```markdown
## Code-Edit Location

All edits to `pwrl-*/SKILL.md` (and other source files in this repo) must target
the repo path, never the install path.

| Tree | Path | Role |
|---|---|---|
| Repo | `~/Projects/pwrl/pwrl-*/` | Source of truth; ships via npm |
| Install | `~/.agents/skills/pwrl-*/` | Deployment artifact; one-way copy from repo |

**MUST NOT** edit the install path. The next `npm install` will overwrite the edit.
**MUST NOT** resolve file paths against `~/.agents/`. Always resolve against the
current working directory or `${REPO_ROOT}`.

If a task's `files:` array references the install path, fix the task before
executing it.
```

### Add a Code-Edit Pre-Flight Guard at the top of `pwrl-work-prepare/SKILL.md`

```markdown
## Pre-Flight Guard (Code-Edit Location)

When `pwrl-work-prepare` resolves a file path from a task's `files:` array, assert
that the path is under the repo root, not under `~/.agents/`. If the path is in
the install tree, log a violation and ask the user to fix the task before
proceeding.

Cross-reference: see `pwrl-work/SKILL.md §"Code-Edit Location"`.
```

### Optional: add a postinstall safety check

In `bin/postinstall.js`, after copying the repo to the install path, scan the install path for any file that is newer than the corresponding repo file. If found, log a warning: "Install path has been modified since install. Edits will be lost on next install."

## When to Use

- Any framework where source code lives in multiple trees (repo, install, deployed, mounted)
- Any contract that defines who may perform an action — pair the "who" with a "where"
- Any skill or workflow that the agent might execute in the wrong context

## When NOT to Use

- Single-tree projects (no install path)
- Container-based deployments where the install path is the source of truth
- Skills that explicitly target the install path (e.g., a "user-skill" the user authors in `~/.agents/`)

## Trade-offs

**Pros:**
- Closes a known gap in the existing contract
- Catches the install-path-vs-repo-path bug at task-execution time, not at review time
- Documents the rule once; cross-references in sub-skills avoid drift

**Cons:**
- Adds another section to the contract (more content to maintain)
- The Pre-Flight Guard is documentation-level; an agent that doesn't read it will still miss the rule
- Path-resolution logic may not be portable across operating systems (Windows paths differ)

## Related Learnings

- `gotcha/install-path-vs-repo-path-divergence-2026-06-30.md` — the failure mode this pattern prevents
- `pattern/implementation-layer-chain-2026-06-30.md` — the broader pattern this instantiates
- `pattern/task-state-machine-enforcement-2026-06-29.md` — the existing contract this extends
- `pattern/cross-skill-contract-enforcement-2026-06-29.md` — the parent pattern (ownership + guard + centralization)
- `decision/documented-vs-implemented-contract-gap-2026-06-29.md` — the audit pattern that revealed this gap

## Lessons Learned

1. **A contract that doesn't specify location is exploitable.** The agent will edit the first writable tree it finds, which may not be the source of truth.
2. **Pair "who" with "where" in any ownership rule.** Ownership without location is ambiguous.
3. **Pre-Flight Guards should run before the action, not after.** A guard that runs after the file has been edited is a recovery mechanism, not a prevention mechanism.
