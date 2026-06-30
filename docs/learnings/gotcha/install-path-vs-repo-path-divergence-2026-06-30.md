---
title: "Edit the Repo Path; the Install Path Is Read-Only After Install"
timestamp: 2026-06-30T00:50:00Z
category: gotcha
type: PWRL Learning
severity: critical
tags:
  - process
  - deployment
  - postinstall
  - npm
  - skills-directory
  - repo-vs-install
domains:
  - pwrl-work
  - pwrl-review
  - deployment
  - skill-architecture
---

# Edit the Repo Path; the Install Path Is Read-Only After Install

## The Gotcha

PWRL skills live in two locations:

- **Repo path** (the source of truth): `~/Projects/pwrl/pwrl-*/`
- **Install path** (a deployment artifact): `~/.agents/skills/pwrl-*/`

The install path is created by `npm install` (or `pwrl init`) by copying files from the repo. **It is a one-way copy.** Edits made in the install path do not propagate back to the repo. The next `npm install` will silently overwrite the install with the (unchanged) repo files.

In a 2026-06-29 session, the agent made all 5 SKILL.md edits for plan 2026-06-29-003 in `~/.agents/skills/pwrl-*/` (the install path). The commit was titled "feat: enforce task lifecycle contract across pwrl-work and pwrl-review". The actual diff contained only docs, CHANGELOG, package.json, and 7 task files — zero SKILL.md changes in the repo. The published npm package contained none of the work.

## How to Detect

Before editing any file, run:

```bash
realpath <file-you-are-about-to-edit>
```

If the resolved path is under `~/.agents/`, you are about to edit a deployment artifact. Stop and edit the repo path instead.

You can also run a one-time check at session start:

```bash
diff -rq ~/Projects/pwrl/pwrl-*/SKILL.md ~/.agents/skills/pwrl-*/SKILL.md 2>&1 | head
```

If the two trees differ, the install has diverged from the repo. Decide which is the source of truth (always the repo) and either copy the repo forward (`cp -r ~/Projects/pwrl/pwrl-* ~/.agents/skills/`) or reset the install (`rm -rf ~/.agents/skills/pwrl-*` and re-run `pwrl init`).

## How to Prevent

### For task authoring

All `files:` paths in task frontmatter must use the **repo path**, never the install path. For example:

```yaml
# CORRECT
files:
  - /home/wicttor/Projects/pwrl/pwrl-work/SKILL.md

# WRONG (will be lost on next install)
files:
  - /home/wicttor/.agents/skills/pwrl-work/SKILL.md
```

Audit existing tasks and fix any that reference the install path. Add a validator check in `pwrl-standards/scripts/validate-skills.js` (or a new `validate-tasks.js`) that flags install-path references in `files:` arrays.

### For the postinstall script

Optionally add an inverse direction: refuse to copy if the install path is newer than the repo path on the same file. This would have caught the original bug at install time.

### For the agent

When the user invokes `/pwrl-work` on a task that names a file, resolve the file path against `${REPO_ROOT}` (the current working directory or the `pwd` of the `pwrl` repo) before reading or writing. Never resolve against `~/.agents/`.

## When This Gotcha Applies

- Any project that ships skills, configs, or templates via `npm install` + postinstall
- Any project that maintains a "source of truth" repo and a "deployed" copy
- Any monorepo with a published package that includes source files

## When This Gotcha Doesn't Apply

- Single-tree projects (no install path)
- Container-based deployments where the install path IS the source of truth (Docker images built from the install path)
- Skills or configs that are user-managed and not part of a published package

## Related Learnings

- `gotcha/verify-against-repo-not-install-2026-06-30.md` — the verification corollary: always grep the repo, not the install
- `pattern/code-edit-pre-flight-guard-location-2026-06-30.md` — the architectural fix: add a code-edit location Pre-Flight Guard
- `pattern/implementation-layer-chain-2026-06-30.md` — the meta-pattern: implementation must propagate through every layer (learning → plan → task → repo → install → published)
- `decision/documented-vs-implemented-contract-gap-2026-06-29.md` — the parent decision that this gotcha instantiates
- `pattern/task-state-machine-enforcement-2026-06-29.md` — the contract this gotcha sidesteps

## Lessons Learned

1. **The source of truth is the repo, not the install.** A copy of the source is a deployment artifact, not a working copy. Treating it as a working copy is the source of the bug.
2. **The install path is ephemeral.** Edits there can be lost at any time without warning. Anything that needs to persist must live in the repo.
3. **Verification must run against the shipping tree.** If you `grep` the install, the install will report success even when the published package is missing the change.
