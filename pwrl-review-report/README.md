# pwrl-review-report Micro-Skill

**Phase 4 of pwrl-review Pipeline**

Generates comprehensive review report and determines approval status.

## Purpose

Compile findings into actionable report:

- Format findings by category
- Calculate approval verdict
- Display to user
- Get final approval

## Input

Analyze artifact from `pwrl-review-analyze` with:

- findings (organized by category)
- issues_found (count by severity)
- integration_check (status)

## Processing

1. **Format Report** — Organize findings by category with line numbers
2. **Calculate Verdict** — Determine approval status based on issues
3. **Generate Recommendation** — Explain what needs to happen next
4. **Display to User** — Show formatted report with verdict
5. **Get Approval** — Ask user: approve / request changes / needs clarification
6. **Generate Artifact** — Create report artifact with decision

## Output

Report artifact with:

- `verdict` (approved/request-changes/rejected)
- `issues_summary` (critical, major, minor counts)
- `findings` (by category with line numbers)
- `integration_status` (builds, tests, imports status)
- `recommendation` (clear action for user)
- `user_approval: true/false`
- `ready_to_ship: true/false`

## Approval Verdicts

| Verdict         | Criteria                                 | Action                          |
| --------------- | ---------------------------------------- | ------------------------------- |
| APPROVED        | 0 critical, <5 major, checks pass        | Proceed to merge                |
| REQUEST CHANGES | 1-2 critical (fixable), 5-10 major       | Return to implementation to fix |
| REJECTED        | >2 critical, >10 major, build/tests fail | Significant rework needed       |

## Report Format

```
────────────────────────────────────
CODE REVIEW REPORT
────────────────────────────────────
Unit:           U2
Reviewer:       pwrl-review
Reviewed:       2026-06-12 14:30

VERDICT: [APPROVED / REQUEST CHANGES / REJECTED]

Issues Found:   N total
  Critical:     X (must fix)
  Major:        Y (should fix)
  Minor:        Z (nice to fix)

────────────────────────────────────
CRITICAL ISSUES (Must Fix)
────────────────────────────────────
1. file.ts:line
   Issue description
   Suggestion

────────────────────────────────────
INTEGRATION STATUS
────────────────────────────────────
Build:          ✓/✗
Tests:          ✓/✗
Imports:        ✓/✗

────────────────────────────────────
RECOMMENDATION
────────────────────────────────────
[Personalized recommendation based on verdict]
```

## Testing

See `tests/pwrl-review/report-generation.test.ts` (25-30 tests):

- Report formatting
- Approval decision logic
- Recommendation generation
- User interaction handling
- Issue severity breakdown
- Display formatting
- Edge cases (clean reviews, all critical, etc.)

## User Interaction

**Display verdict, ask user:**

- `yes` → Approve and proceed
- `no` → Reject and return to implementation
- `clarify` → Ask specific questions

## Integration with pwrl-work

When used after `pwrl-work-execute`:

- If **APPROVED** → Work is ready for pull request creation
- If **REQUEST CHANGES** → Return to `pwrl-work-execute` to fix
- If **REJECTED** → Significant rework in `pwrl-work-execute`

## Error Cases

| Error                   | Recovery                         |
| ----------------------- | -------------------------------- |
| Findings list empty     | Treat as clean review (approved) |
| All issues critical     | Set to REJECTED                  |
| Report generation fails | Use plain text format            |
| User can't decide       | Provide detailed explanation     |

## End State

Report artifact ready for shipping or rework decision made.
