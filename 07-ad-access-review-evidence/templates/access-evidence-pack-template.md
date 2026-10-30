# AD Access Evidence Specification and Pack

## Document Information
| Field | Value |
|-------|-------|
| Organisation | [Company Name] |
| Period covered | [Start] – [End] |
| Author | [Your Name] |
| Version | 1.0 |
| Evidence owner | [Name / Role] |
| Auditor audience | [ISO 27001 / PCI DSS / SOC 2 / internal] |
| Retention requirement | [X years] |

---

## 1. Scope

| Item | In scope | Out of scope | Why out of scope |
|------|----------|--------------|------------------|
| Directory | [kopano.local] | [Other domain] | |
| Privileged tiers | | | |
| Applications | | [Legacy apps with no API] | No programmatic access; manual attestation only |
| Cloud identity | [Entra ID roles] | | |
| Contractors | | | |
| Vendors | | | |

---

## 2. Evidence Specification

| ID | Audit question | Evidence required | Source | Latency | Freshness at signing | Retention | Confidence | Gaps |
|----|----------------|-------------------|--------|---------|----------------------|-----------|------------|------|
| E-01 | Who held privileged access on date X? | Daily group membership snapshot | AD | 24h | ≤24h | 13 months | High | |
| E-02 | Who approved a grant? | Grant → ticket → approver | AD + ITSM | 15m | ≤1h | 7 years | High | |
| E-03 | What changed between reviews? | Privileged change stream | DC logs | 15m | ≤1h | 13 months | Medium | |
| E-04 | Were leavers removed in SLA? | HR date vs removal timestamp | HRIS + AD | Daily | ≤24h | 7 years | High | |
| E-05 | Was excess access used? | Privileged logon events | DC logs | 15m | ≤1h | 13 months | Medium | |
| E-06 | Is collection itself working? | Coverage + pipeline telemetry | Automation | 1h | ≤1h | 13 months | High | |

### 2.1 Collection failure handling
| Failure | Detection | Recorded as | Alert to | Response SLA |
|---------|-----------|-------------|----------|--------------|
| Collector did not run | Heartbeat missing | `GAP` record for that date | Platform on-call | 1h |
| Domain controller unreachable | Per-DC coverage < 100% | Coverage percentage in pack | Identity team | 4h |
| ITSM join failure | Unmatched grant | `unattributed` state | Security | 24h |
| Rule not applicable to new group | Group not in rule scope | Listed in untested-groups appendix | GRC | 7 days |
| Evidence store write failure | Ingest error | Backlog + gap | Platform on-call | 1h |

---

## 3. Collection Architecture

```
[AD LDAP] ─┐
[DC events] ─┤→ [Normalise] → [Identity graph] → [Immutable store] → [Evidence pack]
[HRIS] ──────┤                        │
[ITSM] ──────┘                        └→ [Rules engine] → [Alerts / tickets]
```

| Component | Implementation | Owner | Criticality | Tested |
|-----------|----------------|-------|-------------|--------|
| Collector | | | | |
| Normaliser | | | | |
| Identity graph store | | | | |
| Rules engine | | | | |
| Evidence store (WORM) | | | | |
| Alert routing | | | | |
| Pack generator | | | | |

### 3.1 Integrity design
| Layer | Mechanism | Protects against | Known limit |
|-------|-----------|------------------|-------------|
| At rest | Object lock, versioning, no delete | Retroactive edits | Cost; retention must be right |
| Integrity | Hash chain, hourly root published to separate account | Undetected tampering | Detect, not prevent |
| Separation | Evidence in separate account/domain from directory | Tier 0 compromise reaching evidence | Operational complexity |
| Offline | Monthly signed digest filed externally | Even the evidence store being wrong | Monthly granularity |
| Access | Break-glass only, dual control, session recorded | Insider editing | Requires audit of audit access |

---

## 4. Detection Rules

| ID | Rule | Obligation | Logic (plain language) | Severity | Response | Owner |
|----|------|------------|------------------------|----------|----------|-------|
| AD-DET-01 | Leaver past SLA | ISO A.5.18; PCI 8.2.6 | HR termination date + access still present beyond 24h (privileged) / 72h (standard) | P1 | Auto-ticket, line manager + CISO | IT Ops |
| AD-DET-02 | Unapproved privileged grant | ISO A.8.2; SOC 2 CC6.3 | Group change with no approved ticket within 30m | P1 | Security review, revert proposal | Security |
| AD-DET-03 | Tier 0 logon off-boundary | ISO A.8.3; PCI 7.2.1 | Interactive/remote logon with protected SID on non-Tier 0 host | P1 | Session isolate, credential reset | Security |
| AD-DET-04 | Replication right change | CIS 5.4 | ACE granting DCSync outside approved set | P1 | Immediate review | Identity |
| AD-DET-05 | Dormant privileged account | ISO A.5.18 | No interactive logon 60 days | P3 | Manager attestation or removal | GRC |
| AD-DET-06 | Service password age | PCI 8.3.9 | Password age > policy threshold | P3 | Rotation ticket | App owner |
| AD-DET-07 | Kerberoastable weak crypto | CIS 6.5 | RC4-only SPN account | P2 | Migration ticket | Identity |

### 4.1 Rule tuning and suppression
| Rule | Suppression allowed | Expiry | Approver | Review |
|------|--------------------|--------|----------|--------|
| | Yes / No | Max 90 days | | Monthly |

---

## 5. Unattributed Grants

| Grant ID | Principal | Group | Detected | Ticket searched | Outcome | Aged (days) | Decision |
|----------|-----------|-------|----------|-----------------|---------|-------------|----------|
| | | | | | Unattributed | | Remove / Exception |

**Policy statement:**
> *[State that unattributed grants are aged and escalated, never assumed approved, and that the count appears on the front page of every pack.]*

---

## 6. Quarterly Evidence Pack

### 6.1 Limitations (read this first)
> *[Example: "This pack demonstrates which principals held privileged access, when membership changed, and whether each change carries an approval artefact. It does not demonstrate that approved access was appropriate to the individual's role — that judgement is recorded in section 6.4 by the accountable manager. Coverage excludes two legacy applications (listed in 6.2) which are attested manually. No integrity guarantee is claimed beyond the mechanisms in 3.1."]*

### 6.2 Coverage and gaps
| Measure | Expected | Actual | Coverage % | Gap dates | Explanation |
|---------|----------|--------|------------|-----------|-------------|
| Days collected | | | | | |
| Domain controllers covered | | | | | |
| Privileged principals reconciled | | | | | |
| Grants matched to approvals | | | | | |
| Leavers reconciled to HRIS | | | | | |

### 6.3 Population
| Tier | Principals | Standing privileged | JIT only | Break-glass | Dormant >60d | Ownerless |
|------|------------|---------------------|----------|-------------|--------------|-----------|
| Tier 0 | | | | | | |
| Tier 1 | | | | | | |
| Tier 2 | | | | | | |
| Service accounts | | | | | | |

### 6.4 Attestation
| Manager | Scope (systems + tier) | State reviewed as at | Changes since previous attestation | Approved | Declined | Not returned | Signed |
|---------|------------------------|----------------------|------------------------------------|----------|----------|--------------|--------|
| | | | | | | | |

### 6.5 Exceptions and ageing
| Exception ID | Description | Opened | Age (days) | Owner | Risk accepted by | Next review |
|--------------|-------------|--------|------------|-------|------------------|-------------|
| | | | | | | |

### 6.6 Alert summary
| Rule | Triggered | Resolved | Mean time to resolve | False positive rate | Open > SLA |
|------|-----------|----------|----------------------|---------------------|------------|
| | | | | | |

### 6.7 Reconstruction appendix
| Requested date | Question | Answer | Evidence reference | Method (reproducible) |
|----------------|----------|--------|--------------------|------------------------|
| [14 May] | Who held Tier 0 access? | | | Snapshot `snapshot-YYYY-MM-DD.json` |

### 6.8 Distribution
| Recipient | Purpose | Date | Version hash |
|-----------|---------|------|--------------|
| | | | |

---

## 7. Residual Risk

| ID | Risk | Why it remains | Compensating control | Owner | Review | Accepted by |
|----|------|----------------|----------------------|-------|--------|-------------|
| | | | | | | |

---

## 8. Build vs Buy Decision

| Option | Considered | Rejected because | Chosen |
|--------|------------|------------------|--------|
| Quarterly manual | | | |
| IGA platform | | | |
| Custom pipeline | | | |
| Managed monitoring | | | |
| Hybrid | | | |
