# The Identity-Governance Bridge

**How Active Directory controls become compliance arguments — and where that argument breaks.**

This document connects Projects 06–08 to the rest of the portfolio. It exists because most AD-to-framework mappings are produced by searching a spreadsheet for keyword matches, and the resulting table is worse than useless: it reassures people who have not tested anything.

---

## 1. Why identity work sits underneath everything else

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GRC CLAIMS REST ON DIRECTORY INTEGRITY                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Project 01  PCI segmentation claim        ── relies on ──┐                │
│   Project 02  ISO 27001 SoA status          ── relies on ──┤                │
│   Project 05  Risk acceptance signature     ── relies on ──┤                │
│   Any  "access review completed" statement  ── relies on ──┤                │
│   Any  "logs reviewed daily" statement      ── relies on ──┤                │
│                                                             ▼               │
│                                              ┌───────────────────────────┐  │
│                                              │  AD integrity: who can    │  │
│                                              │  change the authoritative │  │
│                                              │  record of who had access │  │
│                                              └───────────────────────────┘  │
│                                                             │               │
│   If that answer is "an attacker, silently", every claim     │               │
│   above is an assertion about a record you cannot verify.    │               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Use this framing when you need a steering committee to fund identity work.** Nobody funds "AD hardening". People fund "the evidence our ISO certification depends on".

---

## 2. The mapping matrix

Read this as a starting point for a conversation, not a compliance conclusion.

| # | AD control (what it actually does) | ISO 27001:2022 | PCI DSS 4.0 | CIS v8.1 | SOC 2 | NIST 800-53r5 | Project |
|---|-----------------------------------|----------------|-------------|----------|-------|---------------|---------|
| 1 | Tier 0 asset inventory with named owners | A.5.9, A.5.37 | 12.5.1, 12.5.2 | 1.1 | CC6.1 | CM-8, AC-2 | 06 |
| 2 | Separate administrative accounts per tier | A.8.2 | 7.2.2, 8.2.1 | 5.4 | CC6.3 | AC-6(5), AC-5 | 06 |
| 3 | Just-in-time privileged access with approval | A.8.2, A.5.18 | 7.2.1 | 6.1, 6.8 | CC6.3 | AC-6(7) | 06 |
| 4 | Break-glass accounts, sealed and tested | A.5.18, A.8.2 | 7.2.1 | 5.4 | CC6.3 | AC-2(2) | 06 |
| 5 | Logon restriction on Tier 0 hosts | A.8.3, A.8.20 | 7.2.1 | 6.8 | CC6.1 | AC-3, AC-17 | 06 |
| 6 | Authentication policy silos + Protected Users | A.8.5, A.5.17 | 8.3.1, 8.4.2 | 6.3, 6.5 | CC6.1 | IA-2, IA-5 | 06 |
| 7 | Removal of unintended directory replication rights | A.8.2, A.8.3 | 7.2.1, 2.2.2 | 5.4 | CC6.1, CC6.3 | AC-6, AC-6(10) | 06 |
| 8 | Privileged access workstations | A.8.1, A.5.15 | 7.2.1 | 4.1, 6.8 | CC6.1 | AC-17, SC-7 | 06 |
| 9 | LAPS on all endpoints | A.8.2, A.8.1 | 2.2.2, 8.2.1 | 4.7, 5.4 | CC6.1 | IA-5, CM-6 | 06, 08 |
| 10 | gMSA / vaulted service accounts | A.5.17, A.8.2 | 8.2.6, 8.6.1 | 5.5 | CC6.1 | IA-5, AC-2 | 06 |
| 11 | DC service hygiene (Spooler, roles, protocols) | A.8.9 | 2.2.4, 2.2.5 | 4.8 | CC7.1 | CM-7 | 06 |
| 12 | Daily privileged-access state snapshots | A.5.18, A.5.28 | 7.2.4, 10.5.1 | 5.1 | CC6.2 | AC-2(j), AU-11 | 07 |
| 13 | Leaver access removal within SLA | A.5.11, A.5.18 | 8.2.1, 8.2.2 | 5.3, 6.2 | CC6.2 | AC-2(3) | 07 |
| 14 | Privileged change stream joined to approvals | A.8.2, A.5.18 | 7.2.1, 10.2.1 | 5.1, 8.2 | CC6.3, CC7.2 | AC-2, AU-2 | 07 |
| 15 | Detection of unapproved privileged grants | A.8.16 | 10.4.1, 7.2.1 | 8.11 | CC7.2 | AU-6, SI-4 | 07 |
| 16 | Detection of Tier 0 logon off-boundary | A.8.16, A.8.3 | 10.4.1 | 8.11 | CC7.2 | SI-4, AC-3 | 07 |
| 17 | Tamper-evident evidence storage | A.5.28, A.8.15 | 10.5.1, 10.7 | 8.9, 8.10 | CC7.2, CC7.3 | AU-9, AU-11 | 07 |
| 18 | Automated collection-coverage monitoring | A.8.16 | 10.7 | 8.9 | CC7.2 | CA-7 | 07 |
| 19 | Written hardening default and lapse behaviour | A.5.36, A.8.9 | 2.2.1 | 4.1 | CC7.1 | CM-6, CA-5 | 08 |
| 20 | Exception decision records with owners and expiry | A.5.36, A.5.5 | 12.5.2, 6.3.2 | 4.1 | CC7.3 | CA-5, RA-3 | 08 |
| 21 | Compensating controls, tested with records | A.8.16, A.5.28 | 10.4.1 | 8.11 | CC7.2 | SI-4, AU-6 | 08 |
| 22 | Hardening debt ageing report to risk committee | A.5.36 | 12.5.2.1 | n/a | CC7.3 | CA-7, PM-9 | 08 |
| 23 | NTLM restriction / SMB signing / channel binding | A.8.5, A.8.20 | 2.2.4, 8.3.1 | 4.1, 6.5 | CC6.1 | SC-8, IA-5 | 06, 08 |
| 24 | Kerberos encryption hardening | A.8.5 | 8.3.1 | 6.5 | CC6.1 | IA-5, SC-13 | 08 |
| 25 | Constrained delegation replacing unconstrained | A.8.2, A.8.3 | 7.2.1 | 5.4 | CC6.1 | AC-6, SC-7 | 08 |

**Numbering caveat:** PCI DSS v4.0.1 renumbered several sub-requirements and ISO 27001:2022 replaced the 2013 Annex A entirely. Verify every reference against the version your auditor is assessing. Presenting a v3.2.1 reference in a v4.0 assessment is a small error that costs a lot of credibility.

---

## 3. Four myths this matrix is designed to break

### Myth 1: "One control, six frameworks — that's efficiency"

Rows 2 and 3 map to six references each. That is not because the control is powerful; it is because the reference is coarse. `AC-6` (least privilege) is satisfied by the existence of a policy in some organisations and by enforced technical restrictions in others. **A mapping row tells you which obligation you are addressing. It never tells you whether you addressed it.**

The discipline: for every mapping, write the sentence an auditor would accept as evidence. If you cannot write it, the row is a claim, not a control.

### Myth 2: "If it maps to nothing, it isn't needed"

The inverse is more useful. If a control maps to nothing in any framework you are assessed against, ask whether it is real risk management or institutional habit. Sometimes the answer is habit — and deleting it is a legitimate recommendation. Row 22 (debt ageing) maps weakly to technical standards because it is a *governance* control, and that is fine; it maps to CA-7 and PM-9, which is where continuous monitoring and risk management live.

If a *requirement* maps to nothing in your control set, that is a coverage gap, and it should appear in your SoA justification (Project 02) rather than being quietly omitted.

### Myth 3: "We're not in the CDE, so PCI doesn't apply"

PCI DSS 4.0 scoping is about where cardholder data *flows and can be reached*, and the segmented estate still needs to prove the segmentation holds (see [Project 01](./01-pci-dss-network-segmentation/)). AD is the classic failure: a domain controller in the corporate zone that trusts a workstation in the CDE is a path, and paths count. Requirement 12.5.2.1 asks you to *confirm* scope annually — a diagram is not a confirmation.

### Myth 4: "The auditor signed it off, so it's fine"

Auditors sample. Your row 13 (leaver removal within SLA) can pass a sample of 20 and fail on the 21st. The design goal in Project 07 is not to satisfy a sample; it is to make the population answerable. Say that out loud in an interview — it distinguishes you from people who think compliance is a sampling exercise.

---

## 4. Reading the frameworks together

The same AD control appears in each framework for a different reason. Knowing *why* each one wants it is what lets you answer a challenge in the auditor's own language.

| Framework | What it is really asking about identity | The question behind the question |
|-----------|------------------------------------------|----------------------------------|
| **ISO 27001:2022** | Is access risk-managed and evidenced within your ISMS? | "Show me your risk assessment drove this control, and your evidence is current" |
| **PCI DSS 4.0** | Can cardholder data be reached by anyone who should not reach it? | "Prove the path does not exist" |
| **CIS Controls v8.1** | Have you implemented the specific safeguard, at the stated IG level? | "Which implementation group are you claiming, and can you show the safeguard" |
| **SOC 2** | Did the control operate throughout the period, not just at period end? | "Show me operation across the whole window" |
| **NIST CSF 2.0 / 800-53** | Is the control part of a managed, continuously monitored programme? | "How do you know it is still working today" |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAME CONTROL, FIVE DIFFERENT PROOFS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Control: "Privileged access is reviewed and restricted"                    │
│                                                                             │
│  ISO 27001 wants     →  traceability to risk assessment + current evidence  │
│  PCI DSS wants       →  demonstrable absence of a path to cardholder data   │
│  CIS wants           →  safeguard implemented as specified, at your IG      │
│  SOC 2 wants         →  operation across the audit period (populations)     │
│  NIST wants          →  continuous monitoring with corrective action        │
│                                                                             │
│  One artefact can serve all five only if it was designed as:                │
│  state + change + approval + coverage + response                            │
│  ─────────────────────────────────────────────────────────────              │
│  Which is exactly what Project 07 specifies.                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. The bridge in one page (for interview use)

If someone asks *"how does your identity work relate to your GRC work?"*, this is the structure of a good answer:

1. **The claim** — every compliance statement is a claim about who had access and whether that changed.
2. **The dependency** — those claims are only as good as the integrity of the directory that records them.
3. **The boundary** — so Tier 0 is scoped, enforced and owned (Project 06).
4. **The evidence** — so state, change and approval are answerable for any date, not just review dates (Project 07).
5. **The honesty** — so what remains unhardened is priced, owned and expiring (Project 08).
6. **The limit** — mapping a control to six references proves intent, not effectiveness; effectiveness is a test record and a coverage number.

Then offer the hardest question yourself: *"Ask me what would happen if the evidence pipeline broke for a week."* Answering your own challenge is more persuasive than surviving theirs.

---

## 6. Where this bridge does not reach

State these limits rather than letting an auditor find them:

| Limit | Consequence | Covered by |
|-------|-------------|------------|
| Cloud identity (Entra ID roles, service principals, workload identities) | AD-focused controls miss cloud-only privilege | Out of scope for 06–08; a natural Project 10 |
| Non-Windows directory (LDAP-based apps, SaaS IdPs, Linux SSSD) | Identity graph incomplete | Project 07 §2 gap register |
| Application-level RBAC inside business systems | Privileged access inside an app is invisible to AD evidence | Requires app-level evidence |
| Physical and supply-chain access | Not identity | Project 02 SoA |
| Insider with legitimate Tier 0 access acting maliciously | Detection, not prevention | Project 07 rules + Project 08 monitoring |

---

*The mapping is the beginning of an argument. The evidence is the argument. Never let a completed matrix be mistaken for a completed control.*
