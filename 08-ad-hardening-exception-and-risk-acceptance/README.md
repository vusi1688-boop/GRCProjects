# Project 08: Writing an AD Hardening Exception That Cannot Live Forever

## Overview

Every AD hardening programme hits the same wall. CIS Benchmark item X cannot be applied because a vendor application breaks, or a legacy service requires RC4, or the helpdesk cannot function without unconstrained delegation on a print cluster. These are real constraints, and pretending otherwise produces a project plan that quietly stalls.

The failure is not granting the exception. The failure is granting it in a way that has **no owner, no expiry, no compensating control, and no cost** — so it does not become a decision, it becomes the architecture.

This project takes the exceptions that inevitably fall out of [Project 06](../06-ad-tiered-administration/) and requires you to write them as **hardening debt**: quantified, owned, time-boxed, and reported upward. It is the identity-specific counterpart to [Project 05](../05-risk-acceptance-documentation/).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TWO WAYS TO WRITE THE SAME EXCEPTION                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DRIFT (what usually happens)          DEBT (what this project demands)    │
│   ────────────────────────────          ─────────────────────────────────   │
│   "Exception approved by CISO"          "Expires in 6 months; then the      │
│                                         control applies automatically"      │
│   "Vendor limitation"                   "Vendor supports AES from v9.2;     │
│                                         upgrade quoted at R1.2m, decision   │
│                                         needed by 2026-03-31"              │
│   Compensating control:                 Compensating control:               │
│   "monitoring in place"                 "EDR rule DET-221 alerts on RC4     │
│                                          service ticket requests; 3 alerts  │
│                                          in 90 days, all triaged, MTTR 14m" │
│   Cost: unstated                        Cost: 1,900 endpoints exposed to    │
│                                         Kerberoasting; one lateral-movement │
│                                         hop to Tier 0"                      │
│   Nobody reports on it                  Reported monthly to risk committee  │
│                                                                             │
│   Outcome: invisible until exploited    Outcome: visible, priced, decided   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Scenario

> **Shared scenario (continued).** Same organisation as Projects 06 and 07. The Tier 0 boundary is enforced, evidence is continuous. What remains is a list of hardening items the business could not or would not adopt. This project decides, in writing, what happens to each.

**Company:** Kopano Financial Services
**Driver:** CIS Microsoft Windows Server 2022 / Windows 11 Benchmark v3.0 alignment, plus the pentest findings from Project 06
**Constraint:** A 2026 ISO 27001 certification audit, where the auditor will ask: *"Show me your exceptions, and show me how you are monitoring them."*

### The exception backlog

Nine items. Each one is a real trade-off, not an oversight.

| ID | Hardening item | Why it is blocked | Who feels the pain | Suggested initial view |
|----|----------------|-------------------|--------------------|------------------------|
| EX-01 | Disable NTLM in the domain | Legacy ERP integration authenticates with NTLM; vendor states no timeline | Finance ERP owner | Usually over-scoped; try targeted restriction first |
| EX-02 | Enforce AES-only Kerberos (`msDS-SupportedEncryptionTypes`) | Two applications still request RC4 service tickets | App owners | Segment by SPN, not domain-wide |
| EX-03 | Remove unconstrained delegation | Print cluster and one backup agent require it | Infrastructure | Constrained delegation is often possible but slow |
| EX-04 | Disable SMBv1 | A 2014 lab instrument controller requires it | Lab operations | Network isolation is the real answer |
| EX-05 | Enforce LAPS on all endpoints | 180 endpoints on Windows 10 build 1607 cannot run Windows LAPS | Endpoint team | Legacy LAPS + documented end-of-life |
| EX-06 | Disable Print Spooler on all Tier 1 servers | Two application servers print invoices directly | Finance | Direct-IP printing may remove the need |
| EX-07 | Require PAW for all Tier 0 access | 6 PAWs exist; 4 additional engineers occasionally need access | Engineering | JIT from a shared PAW, or accept |
| EX-08 | 90-day service account rotation | Vendor appliance has fixed service account password | App owner | Vault with session-breaking rotation, or accept |
| EX-09 | Block legacy authentication in Entra ID | One mobile app uses basic auth | Sales | Conditional access scoped exception |

**Your task:** For each exception you choose to approve, produce a decision that a risk committee can act on, an auditor can verify, and an engineer can implement. For each exception you *reject*, say why — a hardening programme that accepts everything is not a programme.

---

## What You Need to Do

### Phase 1: Establish the default

**Task:** Define what happens when an exception is not explicitly granted. Without this, everything is a negotiation and the loudest team wins.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE DEFAULT MUST BE WRITTEN DOWN FIRST                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DEFAULT POSITION                                                          │
│   ────────────────                                                          │
│   Benchmark items with a "critical" or "high" CIS profile score are         │
│   applied by default. Deviation requires a signed exception with an         │
│   owner, a compensating control, and an expiry date.                        │
│                                                                             │
│   EXPIRY BEHAVIOUR (the part everyone forgets)                              │
│   ────────────────────────────────────────────                              │
│   30 days before expiry  → owner notified, extension or remediation plan    │
│   Expiry date reached    → exception lapses; item enters standard change    │
│                            process and is applied                           │
│   Expiry + 30 days       → escalated to risk committee as an unapproved     │
│                            deviation; reported to internal audit            │
│                                                                             │
│   The clause "upon expiry, the control applies automatically" is what        │
│   converts an exception into a decision. Without it, expiry is decorative.   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Quantify the exposure, not the vibes

**Task:** Replace "risk is low" with something specific. For identity exceptions, the useful questions are about *paths*, not severity scores.

| Question | Why it changes the decision |
|----------|-----------------------------|
| How many principals could traverse this gap? | 1 service account ≠ 1,900 endpoints |
| What does it get an attacker that they do not already have? | If they already have Tier 1 admin, RC4 may add little |
| Is the affected asset on a path to Tier 0? | The Project 06 boundary tells you |
| Is there detection that would fire? | Untested detection is not a compensating control |
| What is the realistic exploitation effort? | Public tooling vs. bespoke development |
| What is the blast radius in business terms? | Card data, customer records, payment disruption |

**Worked example — EX-02 (RC4 remains enabled for two SPNs):**

```
What it enables        Kerberoasting: request a service ticket, crack offline
Principals exposed     2 service accounts (svc-reports, svc-archive)
Path to Tier 0         None directly; both are Tier 1. But one is a member of
                       Backup Operators → Tier 0 adjacency, unresolved
Detection              DET-221 (RC4 service ticket requests) — tested quarterly
Effort                 Trivial; hashcat + wordlist; 2-8 hours for weak password
Business impact        If cracked: archive data exposed (customer records, POPIA)
Residual if accepted   Medium — with 20-char rotated passwords, compromise risk
                       drops materially but is not eliminated
```

Compare that against the sentence most exceptions actually contain: *"Risk: medium. Compensating controls: monitoring."*

---

### Phase 3: Define what makes a compensating control legitimate

**Task:** For each exception, specify a compensating control and prove it works. Apply this test:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FIVE TESTS FOR A COMPENSATING CONTROL                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DETECTS, NOT MERELY DOCUMENTS                                           │
│     ✗ "We review delegation quarterly"                                      │
│     ✓ "DET-104 alerts on new delegation ACEs within 15 minutes"             │
│                                                                             │
│  2. INDEPENDENT OF THE THING IT PROTECTS                                    │
│     ✗ A control that runs on the same server that could be compromised      │
│     ✓ Detection in a separate platform with its own credentials             │
│                                                                             │
│  3. TESTED, WITH A RECORD                                                   │
│     ✗ "Tested during implementation"                                        │
│     ✓ "Tested 2026-02-14 and 2026-05-14 via purple-team exercise;           │
│        detection fired in 3 of 3 attempts; ticket references attached"      │
│                                                                             │
│  4. HAS AN OWNER AND A RESPONSE                                              │
│     ✗ "Security team monitors"                                              │
│     ✓ "Alert routes to identity on-call; P2; response within 4h;            │
│        named owner: N. Mokoena"                                             │
│                                                                             │
│  5. REDUCES THE SPECIFIC PATH, NOT GENERAL RISK                             │
│     ✗ "MFA everywhere else"                                                 │
│     ✓ "NTLM relay path blocked by SMB signing + EPA on the affected hosts"  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

An exception with a compensating control that fails test 1 or 3 is a risk acceptance with extra words. Say so in your deliverable.

---

### Phase 4: Price the debt

**Task:** Express each accepted exception in terms the CFO recognises. Three currencies: money, exposure, and management effort.

| Exception | Annual cost of the deviation | One-off cost to fix | Effort to maintain the exception | Decision |
|-----------|------------------------------|---------------------|----------------------------------|----------|
| EX-01 NTLM | Unquantified; blocks a key lateral-movement mitigation | R 900k (ERP upgrade) | Quarterly review + monitoring | Scope down |
| EX-03 Unconstrained delegation | Expands Tier 0 reach | R 250k | Monitoring + attestation | Fix |
| EX-05 LAPS gap (180 devices) | 180 endpoints without unique local admin passwords | R 0 (refresh cycle) | Monthly report | Accept with end date |
| EX-08 Fixed service password | Single credential to a payment-adjacent appliance | R 0 (vault) | Manual rotation 2×/yr | Fix |
| EX-09 Basic auth | Credential replay exposure | R 40k (app rewrite) | Weekly review | Accept 6 months |

**The line to include:** *"An exception that costs nothing to maintain and nothing to fix is almost always a decision nobody has made yet."*

---

### Phase 5: Write the decision record

**Task:** One page per exception. Not a policy, not a paragraph in a risk register.

Required sections:

1. **What is not applied** — the exact benchmark item / control ID
2. **Scope** — precisely which systems, accounts, or OUs; not "the estate"
3. **Why** — the technical or contractual constraint, verified rather than reported
4. **Exposure** — quantified per Phase 2
5. **Compensating controls** — per Phase 3, with test records
6. **Owner** — the person, not the team; accountable for remediation *and* monitoring
7. **Expiry** — with the automatic-lapse clause
8. **Cost of the deviation and cost to fix** — per Phase 4
9. **Decision** — approve / approve with conditions / reject
10. **Signature** — business risk owner, not security alone

**Who signs matters.** Security can recommend. The business unit that owns the constraint accepts the risk. If security signs its own exception, the auditor will say — correctly — that the risk was never owned.

---

### Phase 6: Make the backlog visible

**Task:** Design the reporting that stops exceptions accumulating. A list of 40 open exceptions with no ageing is a sign of a programme in retreat.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HARDENING DEBT REPORT (MONTHLY, ONE PAGE)                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OPEN EXCEPTIONS BY AGE                                                     │
│  ────────────────────────                                                   │
│  <90 days        ████████████████  8   ← healthy: recent decisions          │
│  90-180 days     ██████            3                                       │
│  180-365 days    ████              2   ← needs a plan or a decision         │
│  >365 days       ██                1   ← audit finding in waiting           │
│                                                                             │
│  THE FOUR NUMBERS THE COMMITTEE ACTUALLY READS                              │
│  ─────────────────────────────────────────────                              │
│  1. Open exceptions, and how many expire in the next 30 days                │
│  2. Exceptions per owner — concentration reveals where debt lives           │
│  3. Detection coverage: % of exceptions with a *tested* compensating        │
│     control (this is the number that moves; target 100%)                    │
│  4. Exceptions that lapsed and were escalated as unapproved deviations      │
│                                                                             │
│  Do not report: total risk score. It changes nothing and invites debate     │
│  about the formula instead of the decision.                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 7: Answer the audit question

The ISO auditor will ask three things about exceptions. Prepare the answers, not the documents.

| Question | Weak | Strong |
|----------|------|--------|
| "Show me your exceptions" | A spreadsheet of 40 rows | 14 active exceptions, each with scope, owner, expiry, and test record — plus the 26 that lapsed and were remediated, with closure evidence |
| "How do you know the compensating control works?" | "It's configured" | "Tested quarterly, last test 2026-05-14, detection fired 3/3, here is the exercise record" |
| "What happens when an exception expires?" | "We review it" | "It lapses automatically. Two lapsed last year; both were escalated as unapproved deviations and remediated within 30 days. Here is the escalation record." |

---

## Success Criteria

| Criteria | Evidence |
|----------|----------|
| **Default is explicit** | Written default position and automatic-lapse behaviour |
| **Exposure quantified** | Paths and principals, not severity labels |
| **Compensating controls pass the five tests** | At least one tested with a record; failures named as failures |
| **Debt is priced** | Cost of deviation, cost to fix, effort to maintain |
| **Risk is owned by business** | Signatures from the accountable business owner |
| **Expiry is enforceable** | Lapse behaviour described and demonstrated |
| **Backlog is visible** | One-page ageing report with detection coverage |
| **Some exceptions rejected** | Justification for refusal, not blanket approval |

### Red Flags (Weak Project)

- Every requested exception approved
- "Compensating control: monitoring" with no detection rule, owner, or test
- Exceptions without expiry, or expiries repeatedly extended with no renewal decision
- Security signing its own risk acceptances
- Scope written as "the estate" or "all users"
- Severity scores presented as impact analysis
- No rejected exceptions — a sign the default position is negotiable
- Debt report that only shows the count, never the age

---

## Deliverables Checklist

```
□ Written default position and expiry/lapse behaviour
□ Exposure analysis for each exception (paths, principals, effort, blast radius)
□ Compensating control specification with five-test assessment
□ At least one control test record (or a documented test plan)
□ Cost model: deviation cost, fix cost, maintenance effort
□ Completed decision record per approved exception (10 sections)
□ At least two rejected exceptions with reasoning
□ Business owner signatures (not security-only)
□ One-page monthly hardening debt report
□ Audit response pack for the three exception questions
□ 5-minute walkthrough: "here is an exception, here is why it expires"
```

---

## Reflection Questions

1. Which exception was hardest to refuse, and what made it defensible to refuse?
2. Where did your compensating control fail the five tests — and did you say so or write around it?
3. What is the real cost of your longest-running exception, in business terms?
4. If the risk committee doubled your remediation budget, which exception would you fix first and what would you still leave alone?
5. What would an attacker with the exception list in hand do on Monday morning?

---

*An exception is a decision with an expiry date. Without the expiry, it is not a decision — it is the architecture, and nobody remembers choosing it.*
