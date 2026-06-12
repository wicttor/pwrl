# pwrl-review-prepare Micro-Skill

**Phase 2 of pwrl-review Pipeline**

Prepares for code review by gathering artifacts and configuring analysis tools.

## Purpose

Setup review environment:

- Gather diff and LOC changes
- Establish review baselines
- Configure analysis tools
- Identify review scope

## Input

Scope artifact from `pwrl-review-scope` with approved scope_verdict

## Processing

1. **Gather Artifacts** — Get source/target branches, diff, modified files
2. **Establish Baseline** — Calculate LOC changes, file types, complexity
3. **Identify Scope** — New files, modified files, test files, docs
4. **Configure Tools** — Setup linter, test framework, coverage
5. **Check Environment** — Verify build/test tools available

## Output

Prepare artifact with:

- `source_branch`, `target_branch`, `base_commit`
- `files_modified` (count + list)
- `loc_added`, `loc_deleted`
- `review_scope` (code_quality, security, performance, documentation, test_coverage)
- `tools_configured` (linter, test_framework, coverage_tool)
- `ready_for_analysis: true`

## Review Scope Configuration

| Check         | When Enabled    | When Disabled            |
| ------------- | --------------- | ------------------------ |
| Code Quality  | Always          | Never                    |
| Security      | Always          | Never                    |
| Performance   | Complex changes | Config/doc-only changes  |
| Documentation | Docs modified   | Code-only changes        |
| Test Coverage | Code modified   | Docs/config-only changes |

## Testing

See `tests/pwrl-review/prepare-review.test.ts` (20-25 tests):

- Artifact gathering
- Baseline establishment
- Review scope configuration
- Tool detection

## Next Phase

Passes prepare artifact to `pwrl-review-analyze` for code analysis.
