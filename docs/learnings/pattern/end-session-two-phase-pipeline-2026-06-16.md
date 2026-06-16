---
title: End-Session Two-Phase Micro-Skill Pipeline
date: 2026-06-16
category: pattern
tags:
  - skill-architecture
  - micro-skill
  - end-session
  - workflow
  - commit
severity: high
context: Decomposed pwrl-end-session into two micro-skills (checkpoint + commit) with optional learnings chain
---

# End-Session Two-Phase Micro-Skill Pipeline

## What It Is

A concrete application of micro-skill decomposition to the session-ending workflow. The end-session process is split into two focused phases (checkpoint → commit) with an optional third chain to learnings extraction, all orchestrated via a skill pipeline.

**Structure:**
- **Phase 1 — Checkpoint:** Verify repository state, review changes, confirm session completion
- **Phase 2 — Commit:** Draft structured commit message with agent attribution, stage files, create commit
- **Phase 3 (Optional):** Chain to learnings extraction from the commit

## Why It Matters

Before a session commit, there's always a verification step (what changed? is it ready? are there unfinished items?). Combining verification and commit into one operation is error-prone — users skip the review or commit prematurely. Splitting them ensures:

1. **Checkpoint as gate:** Commit doesn't happen without explicit user confirmation after reviewing changes
2. **Structured commit messages:** Drafting is separated from verification, allowing focus on message quality
3. **Agent attribution:** `[AGENT: ...]` trailer is enforced as a mandatory commit message component
4. **Clean history:** Each commit represents a deliberate session boundary

## When to Use

- **Any session-ending workflow** that involves committing code changes
- **Multi-developer environments** where commit attribution matters
- **Projects with changelog requirements** — the commit phase can detect version bumps and update CHANGELOG.md

## Artifact Flow

```
Phase 1 (Checkpoint) output:
  checkpoint_artifact:
    approved_files: [file paths]
    session_summary: string
    user_confirmation: boolean

↓ (passed to Phase 2)

Phase 2 (Commit) output:
  commit_artifact:
    commit_sha: string
    message: string
    version_bumped: boolean

↓ (optional chain)

Phase 3 (Learnings):
  Uses commit SHA + changed files as extraction source
```

## Key Design Decisions

1. **Pure pipeline, no branching** — Each phase has one input and one output; no conditional paths within phases
2. **Explicit artifacts** — Each phase produces a typed artifact that serves as both output and input contract
3. **Commit message template** — Imperative subject (≤50 chars), body with why/decisions/next steps, mandatory `[AGENT: ...]` trailer
4. **No automatic push** — User retains control over when to push; commit is local only
5. **Optional learnings chain** — Not forced; user decides after commit succeeds

## Related

- `pattern/skill-decomposition-agent-orchestration-2026-06-05.md` — General decomposition pattern this applies
- `workflow/compact-after-every-unit-2026-06-08.md` — Related commit-granularity workflow
- `decision/interaction-modes-for-user-engagement.md` — Detailed vs Yolo interaction modes
- Commit `f5aa0d4` — First session using this two-phase pipeline
