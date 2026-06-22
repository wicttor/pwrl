# Edge Cases — Research Phase

This file documents seven edge cases encountered during the research phase (S3) and recommended handling for each.

## Edge Case 1: No Local Patterns Found (Zero Examples)

**Condition:** The codebase search finds no existing implementations or patterns matching the task.

**Handling:**

1. Set confidence to LOW
2. Document: "No local patterns found; design will be from first principles"
3. If the task is high-risk: strongly recommend external research
4. If the task is low-risk: proceed with external guidance if available; otherwise accept design risk
5. Pass to downstream skills (S4, S5) with note: "LOW confidence — external guidance was [applied/declined]"

**Risk:** Designing without local patterns increases the chance of reinventing patterns already used elsewhere.

---

## Edge Case 2: Conflicting Local Patterns

**Condition:** Two or more different approaches exist in the codebase for the same concept (e.g., `auth/jwt.ts` and `auth/session.ts` both in production).

**Handling:**

1. Document both patterns
2. Identify the differences (trade-offs, contexts, versions)
3. Ask user via `ask_user_question`: "Two different auth approaches exist in the codebase. Which should this task follow, or should we unify them?"
4. Options:
   - **Follow JWT approach:** Document rationale
   - **Follow session approach:** Document rationale
   - **Unify (recommended):** Add a learning gap noting that conflicting patterns should be reconciled
5. Pass the chosen pattern (or gap) to downstream skills

**Note:** Conflicting patterns often indicate technical debt or team disagreement. Document for future refactoring.

---

## Edge Case 3: Missing Tech Stack Info

**Condition:** The codebase has no config files (`package.json`, `composer.json`, `requirements.txt`, `go.mod`, etc.) from which to detect frameworks, languages, or versions.

**Handling:**

1. Document: "Tech stack auto-detection failed. Tech stack unverified."
2. Use alternative detection methods:
   - Inspect directory structure for clues (src/, app/, lib/, etc.)
   - Examine file extensions (_.py → Python, _.go → Go, \*.js → Node.js)
   - Ask user via `ask_user_question`: "What's your tech stack? (e.g., Node.js v18, Express, PostgreSQL)"
3. Collect tech stack info from user if available
4. Pass to downstream skills with note: "Tech stack manually verified" or "Auto-detected"

---

## Edge Case 4: User Declines External Research (High-Risk Task)

**Condition:** External research is recommended (high-risk + few patterns), but user declines.

**Handling:**

1. Proceed with local findings only
2. Add a risk note to research findings: "External research was declined. Task involves high-risk area(s): [areas]. Proceed with caution."
3. Pass this note to downstream skills (especially S5: generate)
4. Suggest that the design phase (S4) or generation phase (S5) add a "Risk Mitigation" section to the plan
5. Recommend extra reviews before implementation

**Impact:** Proceeding without external research on high-risk tasks increases implementation risk; compensate with thorough code review.

---

## Edge Case 5: Two Conflicting High-Risk Areas

**Condition:** The task involves multiple high-risk areas simultaneously (e.g., "migrate payment system" = migrations + payments = 2 critical areas).

**Handling:**

1. Set risk level to HIGH (multiple high-risk areas)
2. For each high-risk area, generate separate external research queries:
   - Query 1: "Payments migration patterns..."
   - Query 2: "Payment system zero-downtime migration..."
3. Ask user: "This task has multiple high-risk areas. Should I research each separately?"
4. If approved: Generate all queries and suggest prioritizing them
5. Pass all research findings to downstream skills with priority ordering

**Impact:** Multiple high-risk areas require deeper planning and potentially longer timelines.

---

## Edge Case 6: Librarian/Web Search Unavailable

**Condition:** The librarian skill is not available, and user cannot perform manual web search.

**Handling:**

1. Document: "Automated external research unavailable"
2. Provide the suggested query as plain text:

   ```
   Suggested external research query:
   [query]

   You can research this manually via:
   - GitHub repositories
   - Official documentation
   - Blog posts and articles
   - Stack Overflow
   ```

3. Offer to store the query in a file for later research
4. Proceed with local findings; note that external research is pending
5. Pass to downstream skills with note: "External research pending"

---

## Edge Case 7: Research Context Too Large

**Condition:** Many patterns found (10+ examples), making the research findings overwhelming.

**Handling:**

1. Summarize the top 5-7 most relevant patterns
2. Document: "[total] patterns found; showing most relevant [count]"
3. Criteria for "most relevant":
   - Most recent implementations (files modified recently)
   - Most commonly used (most imports/references)
   - Most similar to task scope (keyword match strength)
   - Production code (not test or example code)
4. Offer user option: "Would you like details on all [total] patterns, or is this summary sufficient?"
5. Pass summarized findings to downstream skills
6. Note: Full list can be reviewed if needed later

---

## Summary

| Edge Case                       | Key Decision                            | Blocker? |
| ------------------------------- | --------------------------------------- | -------- |
| No local patterns               | Rely on external research or principles | No       |
| Conflicting local patterns      | Choose one or unify; add gap            | No       |
| Missing tech stack info         | Auto-detect or ask user                 | No       |
| User declines external research | Proceed; document risk                  | No       |
| Multiple high-risk areas        | Research each separately                | No       |
| Librarian/search unavailable    | Provide manual research guidance        | No       |
| Too many patterns found         | Summarize top 5-7; offer full review    | No       |

---

## Integration Notes

- These edge cases are part of the research workflow (S3 in `pwrl-plan-research/SKILL.md`)
- Edge case decisions are documented in the Research Findings object
- Research findings (including edge case notes) are passed to S4 (design) and S5 (generate)
