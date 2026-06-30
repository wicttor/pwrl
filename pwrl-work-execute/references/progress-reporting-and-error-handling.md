# Progress Reporting & Error Handling (pwrl-work-execute)

Reference for `pwrl-work-execute` §"Progress Reporting" and §"Error Handling & Recovery". Kept out of SKILL.md to keep the latter under the OKF 80–300 line standard.

## Progress Reporting

### Inline

```
[1/2] Executing task U1: Add email validation
  → Reading target files...
  → Writing test first... ✓ FAIL (expected)
  → Implementing feature...
  → Running tests... ✓ PASS
  → Task complete: for-review
```

### Serial

```
[1/5] Spawning subagent for task U1...
[2/5] Subagent U1 completed: for-review ✓
[3/5] Spawning subagent for task U2 (depends on U1)...
[4/5] Subagent U2 completed: for-review ✓
[5/5] Running full test suite...
[✓] All tests pass
[✓] Creating commit: "Implement U1, U2: Add user validation"
```

### Parallel

```
[1/4] Spawning 4 parallel subagents...
  [U1] Starting... [U2] Starting... [U3] Starting... [U4] Starting...
[✓] All subagents complete
[✓] Aggregating results: 4 completed, 0 failed
[✓] Running full integration test suite...
[✓] All tests pass
[✓] Creating commit: "Implement U1, U2, U3, U4"
```

## Error Handling & Recovery

| Scenario                    | Handling                                     | Recovery                           |
| --------------------------- | -------------------------------------------- | ---------------------------------- |
| Task execution crashes      | Catch error, mark `blocked`, log stack trace | Retry task after fix               |
| Test failure                | Mark `blocked`, show failing test output     | Fix tests or implementation, retry |
| Quality gate fails          | Mark `blocked`, show gate reason             | Address issue, retry               |
| Subagent timeout (parallel) | Kill subagent, mark failed                   | Re-run as serial or fix            |
| Git error during commit     | Log error, show git state                    | Fix git state, retry commit        |
| Parallel safety violation   | Downgrade to serial, warn                    | Continue safely in serial          |

### User Prompts for Blocked Tasks

- "Task [unitId] is blocked due to [reason]. Would you like to retry, skip, or investigate?"
- Retry: Re-execute the task
- Skip: Mark as skipped (add to backlog)
- Investigate: Provide details for manual intervention
