# Tier Selection Heuristic

Reference document for the pwrl-plan-generate skill. Defines how to choose Fast, Standard, or Deep tier based on plan complexity.

## Decision Tree

```
Start
  │
  ├─ 1-3 units, LOW risk ────────────────────────────→ Fast
  │
  ├─ 1-3 units, MEDIUM or HIGH risk ──────────────────→ Standard
  │
  ├─ 4-8 units, any risk ─────────────────────────────→ Standard
  │
  ├─ 9+ units, any risk ──────────────────────────────→ Deep
  │
  ├─ 2+ high-risk areas, any unit count ──────────────→ Deep
  │
  └─ User knows better? ─────────────────────────────→ User override
```

## Selection Criteria

### Unit Count

| Units | Typical Scope               | Suggested Tier |
| ----- | --------------------------- | -------------- |
| 1-3   | Single-thread, clear scope  | Fast           |
| 1-3   | Simple but sensitive        | Standard       |
| 4-8   | Multi-file, multi-phase     | Standard       |
| 9-15  | Cross-cutting, phased       | Deep           |
| 16+   | Suggest sub-plans           | Deep (phased)  |

### Risk Level

Risk level is determined by S3 (pwrl-plan-research). Levels:

| Level  | Criteria                                         |
| ------ | ------------------------------------------------ |
| LOW    | No high-risk keywords matched; safe changes      |
| MEDIUM | 1 high-risk area (non-security, non-payment)     |
| HIGH   | 2+ high-risk areas, or security/payments/ infra  |

### Complexity Indicators

Beyond unit count and risk, consider these signals:

- **Architectural change:** New patterns, new services, refactoring core modules → bump +1 level
- **Data migration:** Schema changes, data transformation → bump to Deep
- **Third-party integration:** External API, payment gateway → bump to Standard (or Deep if high risk)
- **Multiple stakeholders:** Affects multiple teams or services → bump to Standard
- **Performance-sensitive:** Throughput/latency targets → bump to Deep
- **Security-sensitive:** Auth, encryption, PII, compliance → bump to Deep

## Tier Characteristics

### Fast Tier

- **Best for:** Bug fixes, minor features, clear-scope tweaks
- **Planning time:** <30 minutes
- **Implementation time:** <1 day
- **Sections:** Goal, Implementation Units + Verification, Related Learnings, Learning Gaps
- **Review:** Lightweight; no formal sign-off needed

### Standard Tier

- **Best for:** Most feature work, bounded refactors
- **Planning time:** 1-2 hours
- **Implementation time:** 1-5 days
- **Sections:** Standard sections + Key Technical Decisions, System-Wide Impact, Test Scenarios per unit
- **Review:** Peer review recommended

### Deep Tier

- **Best for:** Architecture, migrations, security, cross-cutting changes
- **Planning time:** 2-4 hours
- **Implementation time:** 1-3 weeks (often phased)
- **Sections:** Deep sections + High-Level Design, Alternatives, Risk Analysis, Operational Notes
- **Review:** Formal review required; stakeholder sign-off

## Upgrading / Downgrading

### Upgrade Triggers (move to higher tier)

- Risk discovered during research that wasn't known during scope
- Unit count grows during decomposition
- User requests more detail or additional sections
- Testing reveals complex edge cases

### Downgrade Triggers (move to lower tier)

- Scope clarified and simplified during decomposition
- Research confirms low risk and clear patterns
- Unit count drops significantly during refinement
- User prefers lighter plan

### Rule of Thumb

- When in doubt on a boundary (e.g., exactly 8 units), **bump up** to the higher tier.
- More detail is safer than less. A Standard plan on a Fast task is informative; a Fast plan on a Deep task is risky.

## Examples

### Example 1: Bug Fix (Fast)

```
Task: Fix login button not showing on mobile
Units: 1 (CSS fix)
Risk: LOW
Patterns: 5+ existing CSS fixes
Tier: Fast
```

### Example 2: New API Feature (Standard)

```
Task: Add user profile API endpoint
Units: 5 (DB, API, validation, tests, docs)
Risk: MEDIUM (API area)
Patterns: 3+ existing API endpoints
Tier: Standard
```

### Example 3: Payment System Migration (Deep)

```
Task: Migrate payment processor from Stripe to Braintree
Units: 12 (DB schema, integration, webhooks, tests, rollback, docs)
Risk: HIGH (payments + migration)
Patterns: 0 (new payment integration)
Tier: Deep
```

## Reference

- **Source:** Derived from Phase 4 of pwrl-plan/SKILL.md
- **Used by:** pwrl-plan-generate skill (S5)
- **Related:** `pwrl-plan/references/plan-templates.md` (S1)
