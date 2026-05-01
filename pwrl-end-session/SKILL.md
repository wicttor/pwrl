---
name: pwrl-end-session
description: Create a single clear commit at session end capturing state and next steps.
argument-hint: "[Optional: reason for ending session or switching tasks]"
---

# End Session

Produce one well-documented commit when a session ends. Use `#ask-user` for confirmations, include an `[AGENT: …]` trailer, and do not push automatically.

## Flow (concise)

1. Pre-flight
   - Run `git status` or `get_changed_files`. If no changes, inform the user and exit.
   - If changes exist, show files and ask which to stage.

2. Confirm
   - Ask the user to confirm session completion. If not confirmed, list open todos and stop.

3. Prepare message
   - Subject: imperative, ≤50 chars, no trailing period.
   - Body: explain why and what changed (wrap ~72 chars).
     - If a plan was followed during the session, reference it.
     - If during the session the agent switched tasks, explain the reason and next steps.
     - If the commit is partial work, explain the current state and next steps.
     - If the commit is a fix, explain the issue and how it was resolved.
     - If the commit is a new feature, explain the feature and its value.
     - If the commit is a refactor, explain what was refactored and why.
     - If the commit is a revert, explain what was reverted and why.
     - List all the skills used during the session.
     - If the commit has changes from other sessions, explain the context and how (or if) it relates to the current session.
   - Append `[AGENT: {AGENT_NAME}]` on the last line.
   - Present subject + body to the user for approval.

4. Commit
   - Stage selected files and run the commit.
   - Return and display the commit SHA.

## Rules (short)

- Verify the working tree before starting.
- Commit partial work if needed, but explain state and next steps in the body.
- The `[AGENT: …]` trailer is mandatory.
- Do not push to remote automatically.

## Acceptance Criteria

- Input: user confirms completion and there are changes to commit.
- Output: a created commit containing `[AGENT: …]` and a clear body; commit SHA returned.
