---
title: "Always Grep the Repo Path; the Install Can Lie"
timestamp: 2026-06-30T00:50:00Z
category: gotcha
type: PWRL Learning
severity: high
tags:
  - process
  - verification
  - acceptance-criteria
  - repo-vs-install
  - grep-discipline
domains:
  - pwrl-work
  - pwrl-review
  - verification
---

# Always Grep the Repo Path; the Install Can Lie

## The Gotcha

The 7 task files for plan 2026-06-29-003 (U1–U7) declare `files: [/home/wicttor/.agents/skills/pwrl-*/SKILL.md, ...]` in their frontmatter. The acceptance-criteria verification commands in the same files all run `grep` against the install path:

```bash
# Wrong: greps the install, which can have divergent content
grep "## Task Lifecycle Contract" /home/wicttor/.agents/skills/pwrl-work/SKILL.md
```

If the agent (or a human reviewer) runs these commands, they will return PASS because the changes ARE in the install — but the published npm package (which uses the repo path) does not contain the changes. The verification lies.

The correct command targets the repo path:

```bash
# Right: greps the repo, which is what ships
grep "## Task Lifecycle Contract" /home/wicttor/Projects/pwrl/pwrl-work/SKILL.md
```

## How to Detect

Before running any verification command in a task file, look at the file paths:

- If paths start with `/home/wicttor/.agents/`, the command will lie. Fix the task before running the command.
- If paths start with `/home/wicttor/Projects/pwrl/` (or any repo root), the command is correct.

You can also run a one-time audit:

```bash
grep -rn "/home/wicttor/.agents/skills/" /home/wicttor/Projects/pwrl/docs/tasks/ 2>&1 | head
```

Any matches are tasks that need to be fixed.

## How to Prevent

### For task authoring

All file paths in `Acceptance Criteria` and `Verification Commands` sections must use the **repo path**, not the install path. Use a consistent pattern:

- Hard-coded repo path: `/home/wicttor/Projects/pwrl/pwrl-*/SKILL.md`
- Dynamic via pwd: `$(pwd)/pwrl-*/SKILL.md` (assuming the agent is in the repo root)
- Variable: `${REPO_ROOT}/pwrl-*/SKILL.md` (if the repo root is parameterized)

### For the validator

Add a check in `pwrl-standards/scripts/validate-skills.js` (or a new `validate-tasks.js`) that flags any task file referencing `/home/wicttor/.agents/skills/` in its body or frontmatter. The check should run as part of the standard OKF conformance audit.

### For the agent

When the user invokes `/pwrl-work` on a task, the first step (before any file edits) is to verify the task's file paths target the repo. If they target the install path, fix the task first.

## When This Gotcha Applies

- Any task that targets files in a multi-tree project (repo + install + deployed)
- Any acceptance-criteria verification that uses absolute file paths
- Any code review that greps file paths without verifying the tree

## When This Gotcha Doesn't Apply

- Single-tree projects
- Tasks that explicitly target the install path (e.g., "add a user-skill in `~/.agents/`")
- Verifications that use `git show` (which always targets the repo)

## Related Learnings

- `gotcha/install-path-vs-repo-path-divergence-2026-06-30.md` — the failure mode this gotcha instantiates
- `pattern/code-edit-pre-flight-guard-location-2026-06-30.md` — the architectural fix

## Lessons Learned

1. **The install can lie.** Verification must target the tree that ships, not the tree the agent sees first.
2. **Hard-coded paths in tasks are a maintenance burden.** A future improvement is to parameterize repo paths so tasks are portable across machines.
3. **Verifications should be runnable in CI.** If a verification command can only be run on a developer's local machine (with their specific install path), it's not really a verification — it's a manual check.
