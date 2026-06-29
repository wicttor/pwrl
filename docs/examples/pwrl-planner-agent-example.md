---
title: PWRL Planner Agent — Detailed Walkthrough
description: A concrete example of using the PWRL Planner Agent to plan a feature, walking through each phase, checkpoint, and decision point.
type: PWRL Example
timestamp: 2026-06-05
tags: [planner, agent, examples, walkthrough, pwrl-plan]
---

# PWRL Planner Agent — Detailed Walkthrough

This document walks through a concrete example of using the PWRL Planner Agent to plan a feature. Follow along to understand each phase, checkpoint, and decision point.

---

## Example Task

**Task:** "Add email notification system for user registration"

**Context:** A web application that currently sends no email notifications. When a user registers, they should receive a welcome email. When someone mentions them in a comment, they should receive a notification email.

## Prerequisites

- Agents enabled in system configuration
- `agents/pwrl-planner.agent.md` exists
- All micro-skills installed

## Walkthrough

### Step 0: Invoke the Agent

```bash
/pwrl-planner-agent "Add email notification system for user registration"
```

The agent responds:
```
PWRL Planner Agent is running the planning workflow.

Phase 1: Scope Gathering — starting...
```

---

### Phase 1: Scope Gathering

The agent calls `pwrl-plan-scope` with the task description. The scope skill:

1. **Checks for existing plans** in `docs/plans/` — none found.
2. **Validates domain** — software task, confirmed.
3. **Bootstraps context** — no existing docs, so asks clarifying questions.

**Agent output:**
```
Scope gathering complete.

Problem:
  Users don't receive email notifications for key events (registration, mentions).

Intended Behavior:
  Send welcome email on registration; send mention notification via email.

Success Criteria:
  - Welcome email sent within 30 seconds of registration
  - Mention notification sent within 2 minutes
  - Email sending is reliable (retry on failure, queue-based)

Related Learnings:
  - No relevant learnings found

Learning Gaps:
  - No learning for "Email Notification Patterns" — will add follow-up
```

**Checkpoint 1:**

```
Do you want to:
a) Yes, proceed to research
b) Adjust scope
c) Cancel planning
```

→ User selects **a)** Proceed to research.

---

### Phase 2: Research

The agent calls `pwrl-plan-research` with the scoped context. The research skill:

1. **Searches for local patterns:**
   - Finds `src/services/mailer.ts` — basic mail utility using Nodemailer (1 example, LOW confidence)
   - Finds `src/workers/email-queue.ts` — queue worker draft (incomplete)
2. **Detects high-risk areas:**
   - Email delivery reliability → MEDIUM risk
   - Third-party integration (SendGrid/Mailgun) → MEDIUM risk
3. **Decides external research needed:** Risk is MEDIUM but only 1 local example → recommends research.
4. **Generates librarian query:** `/librarian "email notification service patterns node.js transactional 2024"`

**Agent output:**
```
Research complete.

Patterns Found:
  - src/services/mailer.ts (1 example, LOW confidence)
  - src/workers/email-queue.ts (draft, incomplete)

Risk Level: MEDIUM
External Research Recommended: YES

Librarian Guidance:
  /librarian "transactional email service patterns node.js queue 2024"

Tech Stack:
  - Node.js 18, Express 4, PostgreSQL 12
  - Nodemailer (existing mail utility)
```

**Checkpoint 2:**

```
Do you want to:
a) Yes, proceed to design
b) Run external research first
c) Skip external research and proceed
d) Cancel planning
```

→ User selects **b)** Run external research first.

The agent provides the librarian command, the user runs it, then returns. The agent re-runs Phase 2 with the new findings. User selects **a)** Proceed to design.

---

### Phase 3: Design & Unit Decomposition

The agent calls `pwrl-plan-design` with context + research findings. The design skill:

1. **Estimates units:** 5 units (configuration, service, queue, integration, tests).
2. **Creates each unit with user guidance:**

**Agent output (after creating all units):**
```
Design complete. 5 units created. Complexity hint: Standard.

U1: Email Service Configuration
  Scope: Configure email provider settings (SendGrid API key, templates)
  Files: src/config/email.ts, .env.example
  Approach: Use environment variables for provider config; support SendGrid and SMTP fallback

U2: Email Service Provider
  Scope: Implement email sending interface with SendGrid provider
  Files: src/services/email/provider.ts, src/services/email/sendgrid.ts
  Approach: Interface-based design; SendGrid implementation; error handling with retry

U3: Email Queue Worker
  Scope: Create background queue for email delivery with retry logic
  Files: src/workers/email-queue.ts, src/jobs/email-job.ts
  Approach: Use existing queue infrastructure; add exponential backoff for retries

U4: Event-Driven Email Triggers
  Scope: Wire up registration and mention events to email queue
  Files: src/events/registration.ts, src/events/mention.ts
  Approach: Event listeners that push email jobs to queue

U5: Integration Tests
  Scope: Test email flow from event trigger to queue to delivery
  Files: tests/integration/email-flow.test.ts
  Approach: Mock SendGrid API; verify queue processing and delivery
```

**Checkpoint 3:**

```
Do you want to:
a) Yes, proceed to plan generation
b) Adjust units
c) Cancel planning
```

→ User selects **a)** Proceed to plan generation.

---

### Phase 4: Plan Generation

The agent calls `pwrl-plan-generate` with all accumulated state. The generate skill:

1. **Selects tier:** Standard (5 units, MEDIUM risk).
2. **Loads Standard template** from `pwrl-plan/references/plan-templates.md`.
3. **Renders plan sections** with context, units, decisions, system-wide impact.
4. **Embeds learnings:** No related learnings found (gap noted).
5. **Generates filename:** `2026-06-05-001-email-notification-system.md`.

**Agent output:**
```
Plan generated: docs/plans/2026-06-05-001-email-notification-system.md
Tier: Standard
Sections: Overview, Key Technical Decisions, Implementation Units,
          System-Wide Impact, Related Learnings, Learning Gaps
```

**Checkpoint 4:**

```
Do you want to:
a) Yes, save the plan
b) Regenerate with different tier
c) Cancel
```

→ User selects **a)** Yes, save the plan.

---

### Final Output

```
✅ Plan saved to docs/plans/2026-06-05-001-email-notification-system.md

📝 Preview:
  Implement email notification system using SendGrid API with queue-based
  delivery. Key components: Email Service Configuration, SendGrid Provider,
  Queue Worker, Event Triggers, Integration Tests.

Next step: Run /pwrl-tasks docs/plans/2026-06-05-001-email-notification-system.md
```

---

## Key Takeaways

- **4 phases** with **4 checkpoints** — user controls the pace
- **~6 minutes** for a medium-complexity task
- **5 units** decomposed from a single task description
- **Learnings gaps** automatically tracked for post-implementation documentation
- **Plan saved** with proper naming and tier selection

## Full Plan Output (First ~30 lines)

```markdown
---
id: 2026-06-05-001
status: active
tier: Standard
created: 2026-06-05
updated: 2026-06-05
---

# Email Notification System (Standard)

**Date:** 2026-06-05 | **Type:** feat

## Overview

Implement email notification system to send welcome emails on user
registration and mention notifications. Uses SendGrid API with queue-based
delivery for reliability and exponential backoff for retries.

## Key Technical Decisions

- **Email Provider**: Use SendGrid for transactional emails with SMTP fallback
- **Queue Infrastructure**: Use existing Bull queue with Redis backend
- **Template Management**: Store email templates as Handlebars files in
  `src/templates/email/`
- **Retry Strategy**: Exponential backoff with max 3 retries, 24-hour TTL
```

---

## Next Steps After This Plan

1. **Create task files:** `/pwrl-tasks docs/plans/2026-06-05-001-email-notification-system.md`
2. **Start implementation:** `/pwrl-work docs/tasks/to-do/2026-06-05-u1-*.md`
3. **Document learnings:** `/pwrl-learnings "Email Notification Patterns"`
4. **End session:** `/pwrl-end-session`