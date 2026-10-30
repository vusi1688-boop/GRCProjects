# Project 07: Continuous Evidence for AD Access — "Show Me Last Tuesday"

## Overview

Most access reviews are true on the day they are signed and unverifiable every day after. An auditor asks a reasonable question — *"how do you know privileged access was appropriate in March?"* — and the honest answer is a spreadsheet, a memory, and a screenshot.

This project requires you to design identity evidence that is **generated continuously, tamper-evident, and readable by someone who does not know your tooling**. It builds directly on the boundary drawn in [Project 06](../06-ad-tiered-administration/) and feeds the exception process in [Project 08](../08-ad-hardening-exception-and-risk-acceptance/).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACCESS REVIEW: POINT-IN-TIME VS CONTINUOUS              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   POINT-IN-TIME (what most organisations have)                              │
│   ────────────────────────────────────────────                              │
│   Quarter end → export → review → sign → file                               │
│                                                                             │
│        Jan    Feb    Mar    Apr    May    Jun                              │
│         │      ·      ·      │      ·      ·        ← 2 snapshots          │
│         ▼      ?      ?      ▼      ?      ?          2 data points         │
│                                                                             │
│   Question: "Was access appropriate on 14 May?"                            │
│   Answer:   "We reviewed it in March."                                     │
│   Auditor:  "That is not the question I asked."                            │
│                                                                             │
│                                                                             │
│   CONTINUOUS (what this project designs)                                    │
│   ────────────────────────────────────                                      │
│        Jan    Feb    Mar    Apr    May    Jun                              │
│         │      │      │      │      │      │        ← daily snapshots      │
│         ▼      ▼      ▼      ▼      ▼      ▼          + event stream       │
│                                                                             │
│   Question: "Was access appropriate on 14 May?"                            │
│   Answer:   "Here is the 14 May state, the three changes since, who        │
│              approved each, and the two that were never approved."         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Scenario

> **Shared scenario (continued).** Same organisation as Project 06. The Tier 0 boundary is now in place. The problem has moved from "can we restrict privileged access?" to "can we prove it stayed restricted?"

**Company:** Kopano Financial Services
**Context:** ISO 27001 certification audit in 11 weeks; PCI DSS 4.0 assessment in 5 months
**Audit history:** Last year, the access-review sample failed. The reviewer had signed a review that included a leaver who still held privileged access for 41 days. Nobody could show whether the leaver had *used* that access.

### What the auditor actually asked

Five questions. Every one of them is a data problem, not a policy problem.

| # | Auditor question | What would satisfy it | What Kopano has today |
|---|------------------|-----------------------|------------------------|
| Q1 | Who held privileged access on a specific date? | Reconstructable state, with provenance | A quarterly spreadsheet |
| Q2 | Who approved each grant, and when? | Approval event linked to the grant | A ticketing system that is not joined to AD |
| Q3 | What happened between reviews? | Change stream with ticket references | Nothing |
| Q4 | Were leavers removed within your SLA? | Measurable time-to-removal, per person | HR list manually reconciled |
| Q5 | Did anyone use access they should not have had? | Alert log with resolution status | No correlation at all |

### The uncomfortable finding

A control can pass an audit and still be absent. Kopano's quarterly review *looked* complete: 1,240 rows, all marked "reviewed", signed by four managers. When the GRC team compared it against AD state from the same day, **37 of the reviewed accounts had already been disabled** and **9 privileged grants created after the export were never reviewed**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE CONTROL THAT WASN'T THERE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1,240 rows reviewed    ──►  1,203 still valid                             │
│                                 37 already disabled (stale data)            │
│                                                                             │
│   +    9 privileged grants made AFTER the export      ◄── never reviewed    │
│                                                                             │
│   Result: a signed artefact asserting something that was not true.          │
│                                                                             │
│   Nobody lied. The process was simply not connected to reality.             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What You Need to Do

### Phase 1: Define the questions before the data

**Task:** Write the evidence specification. Start from the audit question, not the log source — otherwise you will collect what is easy and miss what is asked.

| Audit question | Evidence required | Source | Freshness | Retention | Confidence |
|----------------|-------------------|--------|-----------|-----------|------------|
| Q1 Who had access on date X? | Daily snapshot of privileged group membership | Directory | 24h | 13 months | High |
| Q2 Who approved a grant? | Grant event → ticket ID → approver identity | Directory + ITSM | 15m | 7 years | High |
| Q3 What changed between reviews? | Privileged change stream (add/remove/modify) | Directory event log | 15m | 13 months | Medium |
| Q4 Were leavers removed in SLA? | HR termination date vs access removal timestamp | HRIS + directory | Daily | 7 years | High |
| Q5 Was excess access used? | Interactive/network logon with privileged SID | DC security log | 15m | 13 months | Medium |
| Q6 Is the control itself running? | Pipeline success, coverage %, gaps | Automation telemetry | 1h | 13 months | High |

**The row most people omit is Q6.** An automated control that silently stopped collecting evidence is worse than a manual one, because it manufactures false confidence.

---

### Phase 2: Design the collection layer

**Task:** Specify what is collected, how, and what happens when it fails.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EVIDENCE PIPELINE (SCOPED, NOT EXHAUSTIVE)               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SOURCES                    NORMALISE              STORE            SERVE    │
│  ───────                    ─────────              ─────            ─────    │
│  ┌──────────────┐                                                        │  │
│  │ AD (LDAP)    │──┐                                                     │  │
│  │ groups, ACLs │  │     ┌──────────────┐   ┌──────────────┐             │  │
│  └──────────────┘  │     │  Identity    │   │  Immutable   │   ┌───────┐ │  │
│  ┌──────────────┐  ├────►│  graph       │──►│  evidence    │──►│ Audit │ │  │
│  │ DC security  │  │     │  (daily      │   │  store       │   │ pack  │ │  │
│  │ logs (4624,   │  │     │   snapshot + │   │  (WORM /     │   │ (PDF/ │ │  │
│  │ 4720, 4728,   │  │     │   event      │   │   versioned  │   │ JSON) │ │  │
│  │ 4732, 4672)   │  │     │   stream)    │   │   object     │   └───────┘ │  │
│  └──────────────┘  │     └──────┬───────┘   │   storage)   │             │  │
│  ┌──────────────┐  │            │           └──────────────┘             │  │
│  │ HRIS         │──┤            ▼                                        │  │
│  │ leavers      │  │     ┌──────────────┐   ┌──────────────┐             │  │
│  └──────────────┘  │     │  Rules       │──►│  Alerts      │             │  │
│  ┌──────────────┐  │     │  engine      │   │  + tickets   │             │  │
│  │ ITSM         │──┘     │  (OPA/custom)│   └──────────────┘             │  │
│  │ approvals    │        └──────────────┘                                 │  │
│  └──────────────┘                                                         │  │
│                                                                             │  │
│  FAILURE PATHS THAT MUST BE DESIGNED, NOT DISCOVERED:                      │  │
│  ────────────────────────────────────────────────────                      │  │
│  • Collector did not run yesterday        → gap recorded, alert raised     │  │
│  • A DC was offline during collection     → coverage % reported per DC     │  │
│  • ITSM join failed (no ticket)           → grant marked "unattributed"    │  │
│  • Rule not yet tuned for a new group     → untested groups listed         │  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Write detection rules that map to obligations

**Task:** Five rules minimum. Each rule states the obligation it serves and what happens on trigger.

| ID | Rule | Obligation | Trigger | Response | Owner |
|----|------|------------|---------|----------|-------|
| AD-DET-01 | Leaver retains access past SLA (24h for privileged, 72h for standard) | ISO A.5.18, A.5.11; PCI 8.2.6 | HR termination date + access present beyond SLA | Auto-ticket P1, notify line manager and CISO | IT Ops |
| AD-DET-02 | Privileged group change without a linked approved ticket | ISO A.8.2; PCI 7.2.1; SOC 2 CC6.3 | Membership change event with no ITSM reference within 30m | Revert proposal, security review | Security |
| AD-DET-03 | Tier 0 account interactive logon on non-Tier 0 host | ISO A.8.3; PCI 7.2.1 | 4624 type 2/10 with protected SID from unmanaged host | Isolate session, reset credentials, incident | Security |
| AD-DET-04 | Directory replication right granted outside the approved set | ISO A.8.2; CIS 5.4 | ACE change on domain object granting DCSync | Immediate review, P1 if unexplained | Identity |
| AD-DET-05 | Privileged account with no interactive logon in 60 days | ISO A.5.18; CIS 6.2 | Last logon age on Tier 0/1 admin accounts | Candidate for removal, manager attestation | GRC |
| AD-DET-06 | Service account password age beyond policy | PCI 8.3.9; ISO A.5.17 | `PasswordLastSet` older than threshold | Rotation ticket | App owner |
| AD-DET-07 | Kerberoastable account on weak encryption | CIS 6.5 | `msDS-SupportedEncryptionTypes` excludes AES | Migration ticket | Identity |

**Unattributed is a state, not an error.** A grant with no linked approval must be recorded as `unattributed` and aged — never silently coerce it into "approved". This is the single most useful design decision in the whole project.

---

### Phase 4: Make evidence tamper-evident

**Task:** Specify integrity. If an attacker with Tier 0 access can edit the evidence, the evidence proves nothing (see Project 06's argument).

| Layer | Control | What it buys you | Limit to state openly |
|-------|---------|------------------|-----------------------|
| Transport | TLS, signed ingestion | Evidence not altered in flight | Does not protect at rest |
| At rest | Object lock / WORM bucket, versioning, no delete | Evidence cannot be rewritten retroactively | Storage cost |
| Integrity | Hash chain or Merkle root published hourly to a separate account | Retroactive edits detectable | Not prevention |
| Separation | Evidence store in a different account/domain than the directory | Tier 0 compromise does not reach evidence | Requires real segregation |
| Offline | Monthly digest exported to a signed PDF, filed externally | An auditor can verify independently | Manual, monthly granularity |

**Honest caveat to include in the design:** hash chaining detects tampering *after the fact*; it does not prevent it. Say so, then describe what makes tampering detectable within your response window.

---

### Phase 5: Design the audit pack

**Task:** Produce one artefact that answers Q1–Q6 without an interview.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACCESS EVIDENCE PACK (ONE QUARTER)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Scope and period            what was measured, what was out of scope   │
│  2. Control operation summary   days collected / days expected, gaps named │
│  3. Population                 every privileged principal, with tier       │
│  4. Attestation                per-manager statement: state at date,       │
│                                 changes since, who approved               │
│  5. Exceptions                 open, aged, owner, decision (links to 08)  │
│  6. Alerts                     rule, count, time-to-resolution            │
│  7. Sample reconstruction     "show me 14 May" appendix, reproducible     │
│  8. Limitations               what the pack does not prove — stated first │
│                                                                             │
│  AUDITOR TEST: can a competent stranger answer their own question          │
│  from this pack, without asking you? If not, the pack is a status report.  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Section 8 is the differentiator.** Most audit packs are written to look complete. Stating limitations first — "this proves access existed and changed; it does not prove the change was *appropriate*, which requires manager judgement recorded in section 4" — makes the rest credible.

---

### Phase 6: Compare against the alternatives, honestly

**Task:** Justify build vs buy, and say what each option cannot do.

| Option | Strength | Real limitation | Fit for Kopano |
|--------|----------|-----------------|----------------|
| Quarterly manual review | Cheap, human judgement | Point-in-time, stale on signature | Fails Q1–Q3 |
| Identity governance platform (IGA tool) | Workflows, attestation UI, connectors | Connector gaps for legacy; cost; still needs clean data | Strong for attestation |
| Custom pipeline + rules engine | Matches your actual controls | You own the failure modes and on-call | Strong for evidence |
| Managed compliance monitoring | Fast start, auditor-familiar reports | Limited custom rules; data leaves your estate | Partial |
| **Hybrid (recommended)** | IGA for attestation workflow, custom pipeline for state + change evidence | Two systems to reconcile | Yes |

### Phase 7: State the residual risk

| Risk | Why it remains | Mitigation | Residual |
|------|----------------|------------|----------|
| Evidence tampering by a Tier 0 insider | Hash chain detects, does not prevent | Offline monthly digest; separation of duties | Medium |
| Legacy applications with no API | Cannot collect state | Manual quarterly attestation, flagged in pack | Medium |
| Rule tuning lag for new groups | New privileged group not covered | Weekly coverage report; default-deny on unmanaged groups | Low |
| Alert fatigue | 200+ events/day possible | Tiered response, suppression with expiration and owner | Medium |
| HRIS data quality | Late terminations recorded | Reconcile against payroll; exception process | Medium |

---

## Success Criteria

| Criteria | Evidence |
|----------|----------|
| **Questions drive data** | Every collection point traces to a stated audit question |
| **Freshness quantified** | Each evidence type has a stated latency and retention |
| **Failures are designed** | Missing collection produces a recorded gap, not silence |
| **Unattributed is honest** | Grants without approval are aged, not assumed |
| **Tamper-evidence is real** | WORM/hash chain plus separation of the evidence store |
| **Answerable without you** | A stranger can reconstruct a date from the pack |
| **Limitations stated** | Section 8 exists and is not buried |

### Red Flags (Weak Project)

- "We automate the review" without describing what happens when automation stops
- Screenshot-based evidence with no collection timestamp or scope
- 100% coverage claimed across systems that have no API
- Rules that only detect the obvious leaver case
- A dashboard presented as evidence
- No statement of what the pack cannot prove
- Evidence stored in the same directory/account it describes

---

## Deliverables Checklist

```
□ Evidence specification: question → source → freshness → retention → confidence
□ Collection architecture with designed failure paths
□ Minimum 5 detection rules, each mapped to an obligation
□ Unattributed-grant handling policy
□ Tamper-evidence design with stated limits
□ One completed evidence pack for a real (or realistic) quarter
□ Sample reconstruction for a specific date
□ Coverage and gap report (what was not collected, and why)
□ Residual risk register
□ 5-minute walkthrough: "question asked → answer shown"
```

---

## Reflection Questions

1. Which audit question could you not answer even after all this work, and why?
2. Where did "unattributed" expose something the manual review had been hiding?
3. What is the weakest link in your tamper-evidence chain, and would you say so in front of an auditor?
4. If the pipeline breaks for nine days, what does your pack say — and who notices?
5. How would you prove the control works to someone who assumes you built it to pass?

---

*Evidence is not a report you produce. It is a property of the system that you can demonstrate on demand — for any date, including the ones you were not watching.*
