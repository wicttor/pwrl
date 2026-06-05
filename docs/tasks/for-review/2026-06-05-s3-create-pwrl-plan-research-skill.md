---
unit-id: S3
plan: docs/plans/2026-06-05-001-slice-pwrl-plan-skill.md
status: for-review
created: 2026-06-05
dependencies: [S1, S2]
files:
  - skills/pwrl-plan-research/SKILL.md (new)
learnings: []
---

# S3: Create pwrl-plan-research Micro-Skill

## Goal

Extract Phase 2 (Research & Design) logic from monolithic `pwrl-plan/SKILL.md` into a standalone `pwrl-plan-research` micro-skill. This skill performs local codebase research and determines if external research is needed, returning findings that inform technical design.

## Context

Phase 2 handles:
- Local research: searching for patterns, tech stack versions, relevant files
- Deciding: Is external research needed? (high-risk areas + <3 local examples = yes)
- External research guidance: when to use librarian skill or web search
- Gathering technical constraints and context

This task extracts that logic as an independent skill.

**Why this matters:** Research findings inform the design decisions (U3); missing research leads to poor design choices.

**Dependency:** Depends on S1 (templates) and S2 (scoped context). Receives scoped context from S2 as input.

## Related Learnings

- **Learning: Research Strategies for Planning** (if exists at `docs/learnings/research-strategies.md`)
  - *Applicability:* Guides local vs. external research decisions; defines "high-risk areas".

**Learning Gap:** If no learning for "Pattern Discovery" exists, create one via `/pwrl-learnings` after S3 completes.

## Implementation Steps

1. **Extract Phase 2 Logic from pwrl-plan/SKILL.md**
   - Read Phase 2: Research & Design section
   - Identify all sub-steps:
     - Local Research: patterns, tech stack, relevant files
     - External Research decision: high-risk flag detection
     - External Research execution: librarian/web search guidance
     - Technical Constraints gathering
   - Map "high-risk areas": Security, Payments, APIs, complex logic, migrations

2. **Design Skill Interface**
   - **Input:** Scoped context from S2 + task description
   - **Output:** Research findings object:
     ```
     {
       "patterns_found": ["src/pattern1.ts", "src/pattern2.ts"],
       "tech_stack": {"framework": "v1.2", "db": "postgres"},
       "high_risk_detected": true|false,
       "external_research_needed": true|false,
       "external_research_guidance": "...",
       "technical_constraints": ["...", "..."],
       "external_references": ["url1", "url2"],
       "findings_summary": "..."
     }
     ```

3. **Create SKILL.md**
   - Path: `skills/pwrl-plan-research/SKILL.md`
   - Implement local research methods:
     - Search codebase for similar patterns (grep, find)
     - Identify tech stack versions (package.json, requirements.txt, etc.)
     - List relevant files affected by task

4. **Implement High-Risk Detection**
   - Detect if task involves: Security, Payments, APIs, complex algorithms, migrations
   - Algorithm: Check task description keywords + scoped context
   - Count "similar patterns found in codebase"
   - Rule: high_risk AND <3 examples = external_research_needed

5. **Implement External Research Guidance**
   - If external research needed: suggest librarian skill usage
   - Provide guidance: "High-risk area (Security) with <3 examples. Run librarian skill: /librarian [specific query]"
   - Allow user to accept or skip external research

6. **Implement Technical Constraints Gathering**
   - Document: tech stack versions, performance constraints, compatibility notes
   - Example: "Project uses Node 18+, PostgreSQL 12, React 18"
   - Return as part of findings

7. **Implement State Passing**
   - Accept scoped context from S2
   - Return findings in format consumable by S4 (pwrl-plan-design)

## Code Patterns

**Example: High-Risk Detection Logic**

```javascript
// Pseudo-code for high-risk area detection
const highRiskKeywords = [
  "security", "auth", "payment", "api", "integration",
  "migration", "database", "complex", "algorithm"
];

function detectHighRisk(taskDescription) {
  return highRiskKeywords.some(keyword =>
    taskDescription.toLowerCase().includes(keyword)
  );
}

function shouldRunExternalResearch(highRisk, patternsFound) {
  return highRisk && patternsFound.length < 3;
}
```

**Example: Research Findings Output**

```markdown
# Research Findings

## Patterns Found
- `src/auth/jwt-handler.ts` — JWT pattern (3 similar files)
- `src/middleware/error-handler.ts` — Error handling pattern
- `src/services/payment.ts` — Payment integration pattern (ONLY 1 example!)

## High-Risk Detection
- Task involves: Payment APIs, Authentication
- Risk Level: HIGH (payment + <3 examples)
- External Research Recommended: YES

## Librarian Guidance
> Run: /librarian "payment gateway integration patterns node.js 2024"
> Or: /librarian "oauth2 implementation best practices"

## Tech Stack
- Node.js 18.12.0
- Express 4.18.2
- PostgreSQL 12.4
- JWT auth library: jsonwebtoken 9.0.0

## Findings Summary
Found 1 payment integration example (LOW confidence). High-risk area detected. Recommend external research on payment gateway best practices before design phase.
```

## Edge Cases

1. **No local patterns found**
   - Solution: That's OK; if high-risk, trigger external research
   - If low-risk: proceed with design based on tech stack alone

2. **Conflicting patterns found**
   - Solution: Document both patterns; note inconsistency
   - Suggest design phase clarify which pattern to follow

3. **Tech stack info unavailable**
   - Solution: Gracefully handle missing config files
   - Document: "Tech stack info unavailable; using codebase inspection"

4. **User declines external research**
   - Solution: Proceed with local findings only
   - Document: "External research skipped by user choice"

5. **Librarian skill unavailable**
   - Solution: Fall back to web search guidance
   - Document: "Librarian not available; suggest manual research"

## Testing

### Unit Test: Local Pattern Discovery

- **Input:** Task description (e.g., "add JWT authentication")
- **Verification:**
  - Skill searches codebase for auth patterns
  - Returns paths to relevant files
  - Counts number of similar examples found
  - Documents tech stack versions

### Unit Test: High-Risk Detection

- **Input:** Task descriptions (high-risk: "payment processing", low-risk: "button styling")
- **Verification:**
  - High-risk tasks are flagged correctly
  - External research decision is accurate (high-risk + <3 examples = yes)
  - Low-risk tasks skip external research suggestion

### Unit Test: External Research Guidance

- **Input:** High-risk task + <3 local examples
- **Verification:**
  - Skill suggests librarian skill with specific query
  - Guidance is actionable and specific
  - User can follow guidance without ambiguity

### Integration Test: Research → Design State Passing

- **Input:** Scoped context from S2 + findings from research
- **Verification:**
  - Findings object is valid and complete
  - Can be parsed and passed to S4 (pwrl-plan-design)
  - No information loss in state passing
  - All required fields are present

## Acceptance Criteria

✅ `skills/pwrl-plan-research/SKILL.md` exists and is functional  
✅ Local research works: finds patterns, tech stack, relevant files  
✅ High-risk detection works: identifies security, payments, APIs, complex areas  
✅ External research decision is accurate: high-risk + <3 examples triggers research  
✅ Librarian guidance is provided when external research is needed  
✅ Tech stack info is gathered and documented  
✅ Research findings output includes all required fields  
✅ State passing to S4 is clear; findings schema is well-documented  
✅ Skill works independently; tested without S4  
✅ Handles edge cases gracefully (missing files, no patterns, etc.)  

## References

- Source: Phase 2 section in `skills/pwrl-plan/SKILL.md`
- Input state: From S2 (pwrl-plan-scope)
- Used by: S4 (pwrl-plan-design) — receives research findings
- Skills: May call librarian skill for external research
- Output state: Passed to S4 for design phase

