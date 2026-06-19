# Edge Cases — Scope Gathering

This file documents seven edge cases encountered during the scope-gathering phase (S2) and the recommended handling for each.

## Edge Case 1: Existing Plan is Outdated

**Condition:** A plan exists for the task, but it's old (created >30 days ago) and may no longer reflect current priorities.

**Handling:**

1. Show a summary of the plan: title, date created, status, goal
2. Ask via `ask_user_questions`: "This plan was created on [date]. Is it still relevant, or should we create a new plan?"
3. Offer options:
   - **Resume:** Accept the old plan as-is and proceed
   - **Update:** Keep the plan but refresh context (learnings, requirements, tech stack)
   - **Create New:** Archive the old plan and start fresh
4. If "Resume": Set `existing_plan.action: resume`
5. If "Update": Add a note to the plan: "Updated context on [date]"
6. If "Create New": Move old plan to archive; set `existing_plan.action: create-new`

**Default behavior:** If the user is unsure, default to "Create New" to avoid stale planning assumptions.

---

## Edge Case 2: Multiple Existing Plans Found

**Condition:** More than one plan file exists for what appears to be the same task (e.g., `2026-06-01-001-auth-plan.md` and `2026-06-03-003-authentication-plan.md`).

**Handling:**

1. List all found plans with titles and dates
2. Ask via `ask_user_questions`: "Multiple plans found. Which one should I use, or create new?"
3. Offer options:
   - List each plan name (user selects one)
   - **None of these — create new**
4. If user selects one: Treat as single existing plan (proceed to Step 1)
5. If "Create new": Note that old plans exist and ask if they should be archived

**Prevention tip:** Encourage unique task descriptions and consistent naming to avoid duplicates.

---

## Edge Case 3: No Learnings Indexed Yet

**Condition:** The `docs/learnings/INDEX.md` file is missing or empty (project hasn't indexed learnings yet).

**Handling:**

1. Set `Related Learnings: []` (empty list)
2. Set `Learning Gaps:` to note: "No learnings indexed yet — consider documenting patterns via /pwrl-learnings as implementation progresses"
3. Proceed normally; this is not a blocker
4. During implementation, encourage documentation of new learnings using `/pwrl-learnings` skill

**Impact:** The plan will proceed without leveraging past learnings; new learnings will be captured during implementation.

---

## Edge Case 4: No Brainstorms/Requirements Directories

**Condition:** The project doesn't have `docs/brainstorms/` or `docs/requirements/` directories, so no pre-existing requirements can be searched.

**Handling:**

1. Silently skip the search for brainstorms and requirements
2. Set `Requirements Found: []` (empty list)
3. Proceed with bootstrap approach in Step 3 (ask user directly for problem, behavior, criteria)
4. This is normal for some projects; proceed without error

**Impact:** No documented requirements will be included, but context from the user will be used instead.

---

## Edge Case 5: User Provides Very Vague Input

**Condition:** Initial task description is unclear or too high-level (e.g., "plan the redesign", "improve performance", "fix bugs").

**Handling:**

1. Ask clarifying questions in sequence:
   - "Is this a new feature, a bug fix, a refactor, or a performance improvement?"
   - "What specific area or module does this affect?"
   - "Who is the primary user or stakeholder?"
2. After 2 clarifying questions, if still unclear:
   - Ask user to provide a written description or reference document
   - Say: "Could you provide more details in writing? For example, a problem statement or requirements doc?"
3. Do not proceed to downstream skills until Problem Frame is reasonably clear

**Retry logic:** After clarification, return to Step 3 (Bootstrap Problem Context) with the refined input.

---

## Edge Case 6: Non-Software Domain

**Condition:** User indicates the task is not software/code-focused (e.g., "plan a company retreat", "restructure marketing team").

**Handling:**

1. Set `domain: non-software`
2. Explain: "This planning skill is optimized for software engineering tasks. For non-software planning (projects, organizational changes, events), consider using a general-purpose planning template instead."
3. Offer user two options:
   - **Proceed anyway:** Use the skill with simplified context (no code-specific concepts)
   - **Exit:** Stop here; user seeks alternative planning approach
4. If user chooses to proceed:
   - Proceed with Steps 2-6 normally
   - Downstream skills will adapt (non-code-focused units in S4, generic plan in S5)

**Note:** Non-software planning is supported but not optimized. Recommend universal planning tools for non-software work.

---

## Edge Case 7: Learning Gaps Identified

**Condition:** During Step 4, the scope-gathering reveals areas where the team lacks documented expertise (e.g., task involves "serverless deployment" but no learnings exist on this topic).

**Handling:**

1. Identify and document each gap:
   - **Gap name:** E.g., "Serverless deployment patterns"
   - **Context:** Why it's relevant to this task
   - **Follow-up action:** E.g., "Research during spike phase; document via /pwrl-learnings"
2. Include gaps in the output `Learning Gaps` list
3. Suggest that downstream skills (especially S5: generate) add a "Follow-up Learning" section in the final plan
4. Gaps are **not blockers**; proceed with planning despite gaps
5. Encourage capturing learnings during implementation

**Integration:** The learning gaps are passed to S5 (generate), which can include them in the final plan's "Learning Gaps" section with recommended follow-up actions.

---

## Summary

| Edge Case                   | Key Decision                          | Blocker? |
| --------------------------- | ------------------------------------- | -------- |
| Outdated existing plan      | Resume, Update, or Create New         | No       |
| Multiple existing plans     | Select one or create new              | No       |
| No learnings indexed        | Proceed; gaps noted                   | No       |
| No requirements directories | Skip search; bootstrap from user      | No       |
| Vague user input            | Ask clarifying questions              | Yes\*    |
| Non-software domain         | Proceed with adapted approach or exit | No       |
| Learning gaps identified    | Document; pass to downstream; track   | No       |

\*Vague input becomes a blocker only if clarification doesn't resolve it after 2-3 attempts.
