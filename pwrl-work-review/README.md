# pwrl-work-review Micro-Skill

**Phase 4 of pwrl-work Pipeline**

Reviews code quality and scope before shipping to main branch.

## Purpose

Verify implementation quality:

- Scope matches task (no unrelated changes)
- Code quality is good (logic, style, security)
- Tests are adequate and meaningful
- Documentation is updated

## Input

Execute artifact from `pwrl-work-execute` with:

- Files changed, tests passing, build/lint status, coverage

## Processing

1. **Scope check** — Verify files match task, no scope creep
2. **Diff review** — Check code quality, security, style
3. **Test review** — Verify adequate coverage, meaningful tests
4. **Documentation check** — README, comments, types updated
5. **Get approval** — Display summary, ask yes/no/needs-changes
6. **Generate artifact** — YAML frontmatter with review details

## Output

Review artifact with:

- `scope_check: "pass" | "creep"`
- `diff_review: "pass" | "issues-found"`
- `flagged_items` (if any)
- `tests_adequate: true/false`
- `documentation_updated: true/false`
- `approval: "approved" | "rejected" | "needs-changes"`
- `ready_to_ship: true/false`
- `change_requests` (if needs-changes)

## Checkpoints

- Files touched match task description
- No unrelated changes or bonus features
- Code logic is correct and efficient
- No security issues (SQL injection, XSS, etc.)
- Code style consistent with project
- Tests are clear and maintainable
- Documentation reflects behavior changes
- No debug code or commented code

## Testing

See `tests/pwrl-work/review-quality.test.ts` (30+ tests):

- Scope validation (on-target, creep, justified)
- Diff quality checks
- Test adequacy verification
- Documentation checks
- Approval confirmation and rejection
- Change request recording

## Approval Decision

**Approve (ready to ship):** All checks pass, code quality good
**Needs Changes:** Specific issues to fix before shipping
**Reject (return to execute):** Significant problems require rework

## Next Phase

Passes review artifact to `pwrl-work-ship` for merge and completion.
