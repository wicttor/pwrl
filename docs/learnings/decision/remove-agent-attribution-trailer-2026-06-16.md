---
title: Remove Mandatory [AGENT: ...] Attribution Trailer from Commit Protocol
timestamp: 2026-06-16
category: decision
type: PWRL Learning
tags:
  - commit-protocol
  - attribution
  - simplification
  - end-session
severity: medium
context: Part of agent infrastructure removal; end-session commit no longer needs agent attribution
---

# Remove Mandatory [AGENT: ...] Attribution Trailer from Commit Protocol

## The Question

Should the end-session commit protocol require a mandatory `[AGENT: ...]` attribution trailer as the last line of every commit message?

## Background

The `[AGENT: ...]` trailer was introduced as part of the agent-based architecture. It identified which AI agent or user authored the commit. With agent infrastructure removed and PWRL now a pure skill-based framework, the trailer has lost its original context.

## Options Considered

### Option 1: Keep Mandatory Trailer

Continue requiring `[AGENT: ...]` on every commit message.

**Pros:**
- Maintains attribution trail for commit origin
- Users who found it useful can continue using it

**Cons:**
- Adds ceremony without clear value (who reads agent attribution?)
- Introduces platform dependency (agent names are platform-specific)
- Requires validation logic and formatting rules
- Out of place in a skill-based framework

### Option 2: Make Optional

Keep the pattern but remove the mandatory requirement. Users can add attribution if they want.

**Pros:**
- Backward compatible for those who use it
- Reduces validation rules

**Cons:**
- Still references agent concept in the codebase
- Inconsistent: some commits have it, some don't
- Adds cognitive load ("should I add this?")

### Option 3: Remove Entirely (Chosen)

Remove all references to `[AGENT: ...]` trailing attribution from the commit protocol, SKILL.md, reference docs, and examples.

**Pros:**
- Clean break: no agent references anywhere in commit workflow
- Simpler commit template (subject + body, no trailer)
- Removes validation logic and formatting concerns
- Aligns with pure skill-based framework identity
- Removes ~30 lines of documentation

**Cons:**
- No explicit commit attribution metadata
- Users who liked the pattern need to add it manually

## What We Chose

**Remove entirely.** Delete all `[AGENT: ...]` references from:
- `pwrl-end-session-commit/SKILL.md` — Removed from purpose, workflow, and rules
- `pwrl-end-session-commit/references/commit-protocol.md` — Removed trailer format, validation, and examples
- `pattern/end-session-two-phase-pipeline-2026-06-16.md` — Noted the change in related update

## Why

- Agent attribution was only meaningful in agent-orchestrated workflows
- In a skill-based framework, the commit is authored by the user invoking `pwrl-end-session`
- The trailer added ceremony without actionable value
- Removes platform dependency (agent name formats vary)
- Commit attribution is still available via `git log --author`

## Impact

**Removed from protocol:**
- Trailer format specification: `[AGENT: <agent-name>]`
- Mandatory validation rule
- Agent name reference table (GitHub Copilot, Claude, etc.)
- Trailer in all commit examples

## Related

- `decision/remove-agent-infrastructure-2026-06-16.md` — Parent decision that motivated this change
- `pattern/end-session-two-phase-pipeline-2026-06-16.md` — Pattern that previously included agent trailer (now updated)
