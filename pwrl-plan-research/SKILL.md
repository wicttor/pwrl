---
name: pwrl-plan-research
description: "Perform local and external research to inform technical design decisions during planning."
argument-hint: "[scoped context from pwrl-plan-scope]"
---

# pwrl-plan-research — Research & Findings

**Purpose:** Second step in the planning workflow. Accepts scoped context from `pwrl-plan-scope`, performs local codebase research, detects high-risk areas, and determines if external research is needed. Returns research findings that inform the design phase (`pwrl-plan-design`).

## Interaction Method

- Use the platform's `ask_user` tool for decisions (e.g., approve external research).
- Ask one question at a time. Present findings before asking for confirmation.
- Use multiple-choice questions when possible (e.g., "Should I run external research on [topic]?").
- If input is empty or missing scoped context, ask: "Please provide a task description or run pwrl-plan-scope first to gather context."

## Input

This skill expects the scoped context object from `pwrl-plan-scope` (S2). It contains:

```yaml
scope-id: YYYY-MM-DD-NNN-scope
domain: software
problem: "..."
intended_behavior: "..."
success_criteria: ["..."]
related_learnings: ["docs/learnings/XXX.md"]
learning_gaps: ["gap_name"]
```

If the context is not provided, try to bootstrap by searching for recent scope files in `docs/plans/.scope/` or prompt the user to run `pwrl-plan-scope` first.

## Output: Research Findings

After completing the workflow, produce a research findings block (in memory or as markdown):

```yaml
research-id: YYYY-MM-DD-NNN-research
status: complete

# Research Findings

## Patterns Found
- `path/to/pattern/file` — [pattern description]

## High-Risk Detection
- Detected areas: [list]
- Risk Level: HIGH | MEDIUM | LOW
- External Research Recommended: YES | NO

## Tech Stack
- [Framework]: [version]
- [Language]: [version]
- [Database]: [version]
- [Key libraries]: [versions]

## External Research
- Needed: YES | NO
- Guidance: [librarian query or web search suggestion]
- Status: completed | skipped | declined

## Technical Constraints
- [Constraint 1]
- [Constraint 2]

## Findings Summary
[2-3 sentence overview of all findings]
```

This findings object is passed to `pwrl-plan-design` (S4) for the design phase.

## Workflow

### Step 1: Local Pattern Discovery

1. Read the scoped context to understand the task.
2. Search the codebase for patterns relevant to the task using `grep` and `find`:
   - Search for similar implementations (e.g., if task is "add auth", search for auth patterns)
   - Search in common directories: `src/`, `app/`, `lib/`, `services/`, `api/`
   - Search config files for tech stack versions: `package.json`, `composer.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `Gemfile`, etc.
3. For each pattern found:
   - Record the file path
   - Count how many similar examples exist
   - Describe the pattern briefly
   - Rate confidence: HIGH (3+ examples), MEDIUM (1-2 examples), LOW (0 examples)
4. If no relevant config files found, inspect codebase structure for clues: languages, frameworks, directory structure.

### Step 2: High-Risk Area Detection

1. Scan the task description and scoped context for high-risk keywords:

   | Area            | Keywords                                       |
   | --------------- | ---------------------------------------------- |
   | Security        | auth, jwt, oauth, session, encryption, ssl     |
   | Payments        | payment, billing, stripe, checkout, invoice    |
   | APIs            | api, rest, graphql, endpoint, integration      |
   | Migrations      | migration, upgrade, data, schema, version      |
   | Complex Logic   | algorithm, analysis, processing, computation   |
   | Infrastructure  | deploy, kubernetes, docker, scaling, network   |

2. If any keyword matches, set `high_risk_detected: true`.
3. Map risk level:
   - HIGH: 2+ high-risk areas OR security/payments/infrastructure
   - MEDIUM: 1 high-risk area that's not security/payments
   - LOW: No high-risk areas detected

### Step 3: External Research Decision

1. Apply the decision rule:
   ```
   should_run_external_research = high_risk_detected AND patterns_found_count < 3
   ```
2. If `should_run_external_research` is true:
   - Recommend external research.
   - Generate a specific query for the librarian skill or web search.
   - Ask the user: "This task involves high-risk area(s) ([areas]) with only [count] local example(s). Should I run external research?"
   - Options: yes, no, skip
3. If user accepts: Provide specific librarian guidance with query.
4. If user declines or if research is not needed: Proceed with local findings only.

### Step 4: External Research Guidance (if needed)

1. Generate a targeted librarian or web search query:
   - Include the specific area (e.g., "payment gateway")
   - Include the tech stack context (e.g., "node.js express")
   - Include scope (e.g., "best practices", "patterns", "migration guide")
2. Provide the guidance as a runnable command:
   ```
   /librarian "oauth2 implementation patterns javascript 2024"
   ```
   or
   ```
   Web search: "payment gateway stripe integration node.js best practices"
   ```
3. If the librarian skill is expected to be available, mention its usage explicitly.
4. If librarian is unavailable, suggest manual external research with the query.

### Step 5: Technical Constraints Gathering

1. Document all technical constraints found:
   - Framework and language versions from config files
   - Performance requirements or implications
   - Compatibility notes (e.g., "must support IE11", "must work with existing auth")
   - Deployment constraints (e.g., "must run on AWS Lambda")
   - Integration constraints (e.g., "must use existing logging framework")
2. If constraints are not obvious from codebase, ask the user:
   - "Are there any technical constraints or requirements I should be aware of?"
   - Collect any additional constraints the user mentions.

### Step 6: Present and Confirm

1. Present the full research findings to the user via `ask_user`.
2. Ask: "Are these findings sufficient to proceed to design?"
3. If confirmed: Return the research findings object.
4. If corrections needed: Iterate on steps 1-5 as needed based on feedback.
5. **Do not proceed to design/generation** — this skill only performs research.

## Edge Cases

### 1. No local patterns found (zero examples)
- Set confidence to LOW.
- If high-risk: external research is strongly recommended.
- If low-risk: proceed; note "No local patterns found; design from scratch."

### 2. Conflicting patterns
- If two different approaches exist for the same concept (e.g., `auth/jwt.ts` and `auth/session.ts`), document both.
- Note the inconsistency for the design phase.

### 3. Missing tech stack info
- No `package.json`, `composer.json`, etc. found.
- Document: "Tech stack auto-detection failed. Verify manually."
- Suggest user provide tech stack details.

### 4. User declines external research for high-risk task
- Proceed with local findings.
- Add a risk note: "External research was declined. Risk: HIGH. Proceed with caution."
- The design phase (S4) should consider this risk.

### 5. Two conflicting high-risk areas
- Example: "migrate payment system" (payments + migration = 2 high-risk areas)
- Risk level: HIGH (multiple high-risk areas)
- External research strongly recommended for each area.

### 6. Librarian/web search unavailable
- Fall back: Provide the search query as a suggestion for the user to run manually.
- Document: "Automated external research unavailable. Suggested manual query: [query]"

### 7. Research context too large
- If many patterns found (10+), summarize the top 5 most relevant.
- Note: "[count] patterns found; showing most relevant."

## State Passing (to S4: pwrl-plan-design)

After completing this skill, the research findings object is passed to `pwrl-plan-design`. The findings use a simple markdown format with a YAML frontmatter section (see "Output: Research Findings" above).

**Schema contract (stable):**

| Field                     | Type    | Required | Description                                       |
| ------------------------- | ------- | -------- | ------------------------------------------------- |
| `patterns_found`          | array   | yes      | File paths and descriptions of local patterns      |
| `high_risk_detected`      | boolean | yes      | Whether high-risk areas were identified            |
| `risk_level`              | string  | yes      | "HIGH", "MEDIUM", or "LOW"                         |
| `external_research_needed`| boolean | yes      | Whether external research is recommended           |
| `tech_stack`              | object  | yes      | Tech stack versions and libraries found            |
| `external_guidance`       | string  | no       | Librarian query or web search guidance             |
| `technical_constraints`   | array   | yes      | List of constraints found or gathered              |
| `findings_summary`        | string  | yes      | 2-3 sentence summary                               |

**Versioning:** Fields will only be added, never removed or renamed. Downstream skills should handle extra fields gracefully.

## References

- **Source:** Phase 2 of `pwrl-plan/SKILL.md`
- **Input:** Scoped context from `pwrl-plan-scope` (S2)
- **Downstream:** `pwrl-plan-design` (S4) — receives research findings
- **Skills:** May invoke librarian skill for external research
- **Config:** `package.json`, `composer.json`, etc. for tech stack detection