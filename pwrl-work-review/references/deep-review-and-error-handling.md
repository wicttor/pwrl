# Deep Review Mode & Error Handling (pwrl-work-review)

Reference for `pwrl-work-review` §"Optional Deep Review Mode" and §"Error Handling". Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

## Optional Deep Review Mode

For complex or high-risk changes, offer deep review:

```
/pwrl-work-review docs/tasks/for-review/ --deep
```

Deep review adds:

- **Performance:** Any obvious regressions? (N+1 queries, memory leaks)
- **Security:** New vulnerabilities? (XSS, injection, auth bypass)
- **Accessibility:** UI changes only (ARIA labels, keyboard nav, contrast)
- **API contracts:** Breaking changes? (new required params, removed fields)
- **DB migrations:** Safe? (backward compatible, rollback plan)

For detailed analysis, use the dedicated `/pwrl-review` skill.

## Error Handling

| Scenario                       | Handling                                           |
| ------------------------------ | -------------------------------------------------- |
| No duplications found          | Log "No duplications detected" (normal)            |
| Git diff parsing fails         | Log error, ask user to verify git state, retry     |
| Design spec not found          | Skip design comparison, continue                   |
| Tests fail after consolidation | Revert consolidation, mark as blocked, investigate |
| Unrelated changes in diff      | Warn user, ask to remove or explain                |
