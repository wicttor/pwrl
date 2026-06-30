---
title: "Verify the Commit Message Against the Diff Before Merging"
timestamp: 2026-06-30T00:50:00Z
category: workflow
type: PWRL Learning
severity: high
tags:
  - process
  - git
  - commit-message
  - verification
  - commit-hygiene
domains:
  - pwrl-work
  - pwrl-end-session
  - git
  - code-review
---

# Verify the Commit Message Against the Diff Before Merging

## The Workflow

Before pushing or merging any commit, verify that the commit's claimed scope matches the file list in the diff. A commit message that overstates the work is a bug — it misleads reviewers, makes `git bisect` unreliable, and breaks the audit trail.

## The Procedure

1. **Extract the scope claims from the commit message.** Read the title and body. List every concrete noun phrase: file names, function names, "U1", "U2", "the contract", "Pre-Flight Guard", etc.

2. **Extract the actual file list from the diff.** Run:
   ```bash
   git show <commit-hash> --stat --name-only
   ```

3. **For each scope claim, verify at least one file in the diff supports it.** A claim like "U1: add Task Lifecycle Contract" should correspond to a diff that includes `pwrl-work/SKILL.md` (or similar). A claim like "fix race condition" should correspond to a diff that touches the affected file.

4. **Block the push if any claim is unsupported.** Do not assume the message is wrong; the agent may have used a different filename than expected. Investigate before proceeding.

5. **If claims are accurate but the message is still misleading** (e.g., vague, missing context), fix the message with `git commit --amend` before pushing.

## The Failure Mode This Prevents

Commit `7dcb487` (2026-06-30) is titled "feat: enforce task lifecycle contract across pwrl-work and pwrl-review" and its body lists U1–U7 as implemented. The actual diff is:

```
CHANGELOG.md                                       |   5 +
docs/learnings/INDEX.md                            |   1 +
docs/learnings/pattern/task-state-machine-...md    | 107 +
7× task file (status: for-review)                  | 2+ each
package.json                                       | 2+-
```

**Zero `pwrl-*/SKILL.md` files** were touched. The title claims U1–U5 are implemented; the diff shows they are not. A simple commit-message-vs-diff verification would have caught this before the commit was pushed.

## When to Use

- Before any `git push` to a shared branch
- Before any PR merge
- As part of `pwrl-end-session-checkpoint` — the commit verification should be a quality gate, not an after-the-fact check
- For any commit that claims to "implement" or "fix" or "add" specific named features

## When NOT to Use

- Trivial commits (single-file typo fixes, version bumps with a single line changed)
- Commits where the title accurately scopes the work and the body is empty
- Squash merges where the body is auto-generated

## Trade-offs

**Pros:**
- Catches the "the message lies" bug at commit time, not at review time
- Cheap to run (one `git show` and a few minutes of inspection)
- Forces the author to reconcile the message with the diff before pushing

**Cons:**
- Adds a manual verification step to every commit
- Not automatable in full (the matching of claims to files requires semantic understanding)
- Can be over-applied (every commit does not need a deep audit; routine commits can use a lighter check)

## A Lighter Check for Routine Commits

For commits that are not claiming to "implement" a multi-file change, a lighter check is sufficient:

```bash
# 1. The first line of the commit should match the primary file in the diff
git show <commit> --stat --name-only | head -1
git log -1 --format=%s <commit>

# 2. The number of files in the diff should be consistent with the claim
# (e.g., "fix typo" should be 1 file; "refactor X" should be 1-N files; "implement Y" should be N+M files)
git show <commit> --stat --name-only | tail -n +2 | wc -l
```

## Related Learnings

- `gotcha/install-path-vs-repo-path-divergence-2026-06-30.md` — the underlying bug this workflow catches
- `pattern/implementation-layer-chain-2026-06-30.md` — the meta-pattern (claims must propagate through every layer)

## Lessons Learned

1. **A commit message is a contract.** The author is claiming "this commit does X." Reviewers trust the claim. If the claim is false, the trust is broken.
2. **The diff is the source of truth.** The message is a human-readable description; the diff is the actual change. When they disagree, the diff wins.
3. **Verification is cheap; recovery is expensive.** A 30-second check at commit time saves hours of confusion at review or bisect time.
