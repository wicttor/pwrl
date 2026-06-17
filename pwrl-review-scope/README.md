# pwrl-review-scope Micro-Skill

**Phase 1 of pwrl-review Pipeline**

Validates that code changes match requirements and detects scope creep.

## Purpose

Ensure reviewed code doesn't introduce unrelated changes:

- All required files are modified
- No unrelated files changed
- Dependencies justified if present

## Input

- Branch name or PR number
- Unit/task requirements (if available)

## Processing

1. **Extract Requirements** — Identify what files should change
2. **Compare to Actual** — Get list of modified files from branch
3. **Categorize Files** — Required, supporting, unrelated, bonus
4. **Detect Creep** — Flag suspicious unrelated changes
5. **Get Approval** — User confirms scope is acceptable

## Output

Scope artifact with:

- `files_required`, `files_supporting`, `files_questioned`
- `scope_verdict` (on-target/justified/creep-detected)
- `user_approval: true/false`
- `ready_for_analysis: true`

## Scope Verdicts

| Verdict        | Meaning                                                  | Action                                          |
| -------------- | -------------------------------------------------------- | ----------------------------------------------- |
| on-target      | All required files, no unrelated                         | Proceed to analysis                             |
| justified      | Unrelated changes but necessary (e.g., fix import cycle) | Document reason, proceed                        |
| creep-detected | Significant unrelated changes                            | Ask user to justify or return to implementation |

## Testing

See `tests/pwrl-review/scope-validation.test.ts` (20-25 tests):

- Requirements extraction
- File analysis and categorization
- Scope creep detection
- User approval flow

## Error Cases

| Error                    | Recovery                              |
| ------------------------ | ------------------------------------- |
| Requirements not found   | Ask user: what files should change?   |
| Scope creep unacceptable | Return to implementation for revision |
| File not found           | Verify branch name and remote         |

## Next Phase

Passes scope artifact to `pwrl-review-prepare` for review preparation.
