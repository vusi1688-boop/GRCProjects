# Project 06: Defending a Tier 0 Boundary in a Flat Active Directory

## Overview

Every GRC argument in this portfolio rests on one assumption: **the evidence is true**. Active Directory is the system that decides whether that assumption survives. If an attacker owns Tier 0, they can add themselves to Domain Admins, rewrite the logs that prove your access reviews happened, and hand your auditor a clean report of a compromised estate.

That makes Tier 0 a governance problem disguised as an engineering one. This project requires you to draw a defensible administrative boundary through a flat AD, decide what belongs on the privileged side, and explain the operational cost of that decision to people who will experience it as friction.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLAT AD VS TIERED AD: THE REAL QUESTION                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FLAT MODEL                            TIERED MODEL                        │
│   ──────────                            ────────────                        │
│   Domain Admins in every team           Admin rights scoped to tier         │
│   One admin account for everything      Separate account per tier          │
│   Admin work from a daily laptop        Admin work from a PAW              │
│   Standing access, always on            Just-in-time, time-boxed            │
│   "We have MFA on VPN"                  "The control plane is isolated"     │
│                                                                             │
│   Answer to "are you segmented?"        Answer to the same question:        │
│   "Yes, we have VLANs."                 "Here is what can reach Tier 0,      │
│                                          who can log on to it, and what     │
│                                          evidence proves it."               │
│                                                                             │
│   Failure mode: SILENT. You look        Failure mode: VISIBLE. Migration    │
│   compliant until the day you don't.    breaks helpdesk tickets for weeks.  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Scenario

> **Shared scenario.** Projects 06, 07 and 08 all use the same organisation, **Kopano Financial Services**. 06 draws the boundary, 07 builds the evidence that the boundary is being respected, 08 records what you consciously leave outside it. Read them as one programme, not three essays.

**Company:** Kopano Financial Services
**Industry:** Consumer lending and short-term insurance
**Size:** 1,800 employees, ~2,400 enabled AD accounts, 140 servers, 1,900 endpoints
**Regulatory exposure:** PCI DSS 4.0 (card repayments), ISO 27001:2022 (certification in progress), POPIA
**Identity estate:** Single forest, single domain `kopano.local`, functional level 2016
**Hybrid:** Entra Connect Sync (password hash sync) to Microsoft 365, no federation
**Your role:** GRC lead supporting the identity workstream, reporting to the CISO

### What triggered the work

An insurer-mandated penetration test returned five findings. Two matter here:

| # | Finding | Severity | Why it is not just an IT ticket |
|---|---------|----------|---------------------------------|
| F-1 | 12 standing Domain Admins, 4 standing Enterprise Admins in a single-domain forest | Critical | Standing Enterprise Admin in a single-domain forest is almost never justified — it is inherited habit, not need |
| F-2 | A backup product service account holds `Replicating Directory Changes All` and has a 4-year-old password | Critical | This is DCSync. It can extract every password hash in the domain without touching a domain controller's disk |
| F-3 | Domain Admin credentials used for interactive logon on 31 workstations | High | Every compromised endpoint becomes a Tier 0 compromise |
| F-4 | 340 accounts carry `adminCount=1`; only 46 map to a current, justified role | High | Orphaned protected objects are invisible privilege |
| F-5 | Domain controllers run the Print Spooler service | Medium | A known remote-code-execution path straight into Tier 0 |

Your CISO has read the report and asked a question that sounds simple: *"Can we just remove the Domain Admins and be done?"*

The honest answer is no, and the rest of this project is the reasoning behind that answer.

### Why Tier 0 is a GRC problem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE EVIDENCE INTEGRITY ARGUMENT                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Ordinary system compromise            Tier 0 compromise                   │
│   ─────────────────────────             ───────────────────                │
│   Affects that system                   Affects every system that trusts    │
│   Logs still trustworthy                Logs are writable by the attacker   │
│   Scope is bounded                      Scope is the whole domain           │
│   Evidence for that control fails       Evidence for EVERY control fails    │
│                                                                             │
│   Consequence for your audit:                                               │
│   ───────────────────────────                                               │
│   A statement of applicability, an access review pack, and a risk           │
│   acceptance signed last quarter are all assertions about a directory      │
│   that someone else may have been able to modify.                           │
│                                                                             │
│   This is the sentence to use with a steering committee:                    │
│   "If Tier 0 falls, the rest of our compliance evidence becomes            │
│    unverifiable — and we would not know it had fallen."                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Current State

### Administrative model today

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       KOPANO: FLAT ADMINISTRATIVE MODEL                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INTERNET                                                                  │
│      │                                                                      │
│      ▼                                                                      │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                        CORPORATE NETWORK (flat L2/L3)                 │ │
│   │                                                                       │ │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │ │
│   │   │  6 x DCs     │  │  2 x ADCS    │  │ Entra Connect│  ◄── TIER 0    │ │
│   │   │  (2 sites)   │  │  (web enrol) │  │   (PHS sync) │                │ │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │ │
│   │          │                 │                 │                        │ │
│   │          └─────────────────┴─────────────────┘                        │ │
│   │                            │                                          │ │
│   │                            │  same subnet, no logon restriction,      │ │
│   │                            │  same admin account                    │ │
│   │                            ▼                                          │ │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │ │
│   │   │ 60 app       │  │ 1,900        │  │ Helpdesk     │                │ │
│   │   │ servers      │  │ endpoints    │  │ consoles     │                │ │
│   │   └──────────────┘  └──────────────┘  └──────────────┘                │ │
│   │                                                                       │ │
│   │   Backup server ──── holds DCSync-equivalent rights ────► TIER 0     │ │
│   │   EDR console  ──── deploys agents with SYSTEM on DCs ──► TIER 0     │ │
│   │   Hypervisor   ──── can attach debugger to DC memory ───► TIER 0     │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   Nobody has written this boundary down. That is the actual finding.        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The four Tier 0 assets nobody puts on the list

The reason flat ADs stay flat is that the boundary is always bigger than the obvious list. Domain controllers are easy. These are not:

| Asset | Why it is Tier 0 | How it usually gets missed |
|-------|------------------|----------------------------|
| Backup server | Restores `ntds.dit`, holds credentials for DC system state | Owned by the infrastructure team, treated as "just backups" |
| EDR / SIEM agents with DC credentials | Can execute code as SYSTEM on a DC | Treated as a security tool, therefore assumed safe |
| Hypervisor management plane | Snapshot + memory read of a DC | Considered a platform team concern, not identity |
| Entra Connect Sync server | Holds a privileged sync account and can write to the cloud directory | "It's just a sync tool" — and it is internet-adjacent |

If any one of these is outside the boundary, the boundary is decorative.

---

## What You Need to Do

### Phase 1: Draw the boundary

**Task:** Produce a Tier 0 asset register with a justification for every entry, and — more importantly — a **dependency register**: what authenticates to Tier 0.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THREE QUESTIONS THAT DEFINE THE BOUNDARY                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. What can read or write the directory?                                  │
│      DCs, ADCS, Entra Connect, backup tooling, DCSync holders               │
│                                                                             │
│   2. What can execute code on something that can read or write the          │
│      directory?                                                             │
│      EDR console, patch management, hypervisor, monitoring agents,          │
│      jump hosts, PAM appliances                                             │
│                                                                             │
│   3. What can authenticate to either of the above?                          │
│      Service accounts, admin accounts, vendor support accounts,             │
│      the laptop of the person who runs it                                   │
│                                                                             │
│   The boundary is the transitive closure of those three answers.            │
│   Anything less is a diagram that will not survive a pentest.               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Deliverable:** `tier0-scoping-template.md` completed, including at least two assets the business does not currently consider privileged.

---

### Phase 2: Measure before you fix

**Task:** Quantify the current state so the change is a decision, not an opinion.

Useful starting points (adapt to your environment — do not paste these into production without reading them):

```powershell
# Standing privileged membership, resolved recursively (nesting hides privilege)
Get-ADGroupMember -Identity "Domain Admins" -Recursive |
  Select-Object SamAccountName, objectClass, distinguishedName

# Protected objects, and how many are actually justified
Get-ADUser -Filter 'adminCount -eq 1' -Properties LastLogonTimestamp, Description |
  Select-Object SamAccountName, Enabled, LastLogonTimestamp, Description

# Accounts that can replicate the directory (DCSync surface)
Get-ADUser -Filter * -Properties nTSecurityDescriptor |
  Where-Object { $_.nTSecurityDescriptor.Access |
    Where-Object { $_.ObjectType -eq '1131f6ad-9c07-11d1-f79f-00c04fc2dcd2' } }

# Accounts that never need a password change, or never expire
Get-ADUser -Filter { PasswordNeverExpires -eq $true } -Properties PasswordLastSet |
  Select-Object SamAccountName, PasswordLastSet

# Kerberoastable accounts still on RC4
Get-ADUser -Filter { ServicePrincipalName -like "*" } -Properties ServicePrincipalName, msDS-SupportedEncryptionTypes |
  Select-Object SamAccountName, ServicePrincipalName, msDS-SupportedEncryptionTypes
```

**What to report, and what to resist reporting:**

| Measure now | Tempting but misleading |
|-------------|-------------------------|
| Number of Tier 0 assets with no named owner | "Number of controls failing" (means nothing without scope) |
| Standing privileged accounts per tier, and who holds them | "Percentage hardened" (someone will move the denominator) |
| Accounts with interactive logon rights on Tier 0 | "Risk score" from a scanner, presented as fact |
| Time since last Tier 0 credential rotation | "Zero trust maturity level" |

---

### Phase 3: Design the target model

**Task:** Define a model you can run on a Monday morning with 1,800 users and a helpdesk that has 22 open tickets before 10:00.

| Design decision | Options | Kopano's choice and why |
|-----------------|---------|--------------------------|
| Admin accounts | One per person / one per tier / JIT only | One per person **per tier**, named `a-<sam>-t0`, `a-<sam>-t1`. Tier 0 accounts get no mailbox, cannot be targeted by helpdesk reset |
| Tier 0 access | Standing / just-in-time | JIT via Entra PIM for cloud roles, time-bound AD group membership with approval for on-prem. Standing domain admin: **3 break-glass accounts**, sealed, tested quarterly |
| Admin workstation | Daily laptop / PAW | 6 PAWs (2 per site, 2 virtual) — the expensive, unpopular, necessary decision |
| Enterprise Admins | Keep / empty | Empty in a single-domain forest; document why, in case a future acquisition needs it |
| Service accounts | Password vault / gMSA | gMSA where vendor supports it; vaulted with rotation for the rest; the backup account gets its DCSync-adjacent rights **removed** and replaced with a delegated backup role |
| Local admin | Shared local admin / LAPS | Windows LAPS on 2019+, legacy LAPS for the 2016 remainder, with a documented end date |
| Logon restriction | GPO per tier | "Deny log on" + **Protected Users** for Tier 0 accounts; authentication policy silos to enforce it, not merely request it |
| DC exposure | Print Spooler on / off | Disabled on all six DCs; printing is a workstation function |

**The non-negotiable:** every restriction must state what it protects against. "Deny log on locally" is meaningless to an auditor unless you can name the attack it prevents — in this case credential theft from a compromised endpoint using a Domain Admin token.

---

### Phase 4: Sequence the migration against real constraints

**Task:** Produce a migration plan that an operations manager will agree to, because a technically perfect plan that nobody signs is worth nothing.

```text
Week  1-2   Tier 0 register signed by CISO and infrastructure owner
Week  3-4   Break-glass accounts created, sealed, tested; PIM configured
Week  5-6   EA group emptied (after a change window); adminCount cleanup
Week  7-10  PAWs built and issued to the 6 people who actually need Tier 0
Week  11-14 Tier-separated admin accounts; logon restrictions enforced in audit-only mode
Week  15-16 Re-point backup/DCSync rights to a delegated role; rotate credentials
Week  17-18 Enforce restrictions; helpdesk runbook + 2-week hypercare
Week  19-20 Validate with the same pentest that opened the finding
```

**Constraints you must name out loud:**

- 24/7 lending operations — no change window is free
- Three legacy applications still require an interactive service logon
- Vendor support accounts that arrive with their own credentials and their own ideas
- A helpdesk measured on ticket closure time, not on privilege hygiene

---

### Phase 5: Map the boundary to obligations

**Task:** Show each technical control earning its place against a framework requirement.

| Control | ISO 27001:2022 | PCI DSS 4.0 | CIS v8.1 | SOC 2 |
|---------|----------------|-------------|----------|-------|
| Tier 0 asset register | A.5.9 | 7.2.2, 12.5.2 | 1.1, 5.5 | CC6.1 |
| Separate admin accounts per tier | A.8.2, A.5.15 | 7.2.1, 8.2.1 | 5.4, 6.8 | CC6.1, CC6.3 |
| JIT privileged access | A.8.2 | 7.2.2 | 5.4, 6.1 | CC6.3 |
| Auth silos / Protected Users | A.8.5, A.5.17 | 8.4.2, 8.3.1 | 6.5 | CC6.1 |
| Logon restriction on Tier 0 | A.8.3 | 7.2.1 | 6.8 | CC6.1 |
| Remove unintended DCSync rights | A.8.2, A.8.3 | 7.2.1 | 5.4, 6.6 | CC6.1, CC6.3 |
| Disable spooler on DCs | A.8.9 | 2.2.1, 2.2.5 | 4.1 | CC7.1 |

Cross-reference the full matrix in [`../IDENTITY-GOVERNANCE-BRIDGE.md`](../IDENTITY-GOVERNANCE-BRIDGE.md).

---

### Phase 6: State what you are not fixing

**Task:** Write the residual risk down before someone finds it in an audit.

| Not fixed in this phase | Why | Residual risk | Owner |
|-------------------------|-----|---------------|-------|
| 2 legacy service accounts need non-expiring passwords | Vendor limitation, replacement FY28 | Kerberoastable if RC4 remains | App owner |
| ADCS web enrolment remains internet-adjacent | Certificate renewal project Q3 | Template misconfiguration → domain takeover | PKI owner |
| Tier 1 server admins can still reach some Tier 1 data stores | Business requirement | Tier 1 lateral movement | Infra manager |
| Vendor support accounts are shared | Contract terms | Unattributable privileged activity | Procurement |

See [`../08-ad-hardening-exception-and-risk-acceptance/`](../08-ad-hardening-exception-and-risk-acceptance/) for how that last row becomes a signed decision.

---

### Phase 7: Defend it

The point of this project is the conversation, not the diagram. Prepare for these:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       AUDITOR CHALLENGE / RESPONSE                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Q: "How do you know your administrative boundary is effective?"             │
│                                                                              │
│  WEAK:    "We implemented Microsoft's tier model and use GPOs."              │
│                                                                              │
│  STRONG:  "Three evidence types. One, a Tier 0 register listing 14 assets    │
│            with named owners, signed at each quarterly review. Two, an       │
│            automated test that alerts when a privileged group changes or     │
│            a Tier 0 account logs on interactively to a non-Tier 0 host —     │
│            here are 90 days of results including the 3 exceptions. Three,    │
│            an independent pentest that repeated the original attack path    │
│            and failed. I can show you the ticket that closed it."           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Q: "Domain Admins now has 3 accounts. Aren't those the same risk?"          │
│                                                                              │
│  WEAK:    "Those are break-glass accounts, so it's fine."                    │
│                                                                              │
│  STRONG:  "They are sealed, tested quarterly, excluded from interactive      │
│            logon except from two PAWs, and any use pages the CISO. Standing  │
│            access for 12 people and 3 controlled accounts are different      │
│            risk profiles, and I can quantify the difference: 12 ongoing     │
│            credential-theft opportunities versus 4 scheduled tests a year." │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Q: "What stops someone rebuilding a flat model next quarter?"              │
│                                                                              │
│  STRONG:  "A change-detection rule on privileged group membership, the      │
│            requirement that any Tier 0 change carries a PAM ticket, and a   │
│            named owner in the register who is asked to attest quarterly.     │
│            Controls without an owner decay in about two quarters."         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

| Criteria | Evidence |
|----------|----------|
| **Boundary is defensible** | Register includes dependencies and transitive reachability, not just DCs |
| **Current state quantified** | Counts, owners, and DCSync holders — with the query used to get them |
| **Trade-offs explicit** | PAW cost, helpdesk friction, and 3 legacy exceptions stated plainly |
| **Migration is realistic** | Sequenced against operations, with audit-only stages before enforcement |
| **Residual risk owned** | Each gap has a name against it and a review date |
| **Argument survives challenge** | Can answer "how do you know?" with evidence types, not intentions |

### Red Flags (Weak Project)

- Tier 0 defined as "the domain controllers" and nothing else
- No mention of backup, EDR, hypervisor, or Entra Connect
- "Implemented Microsoft's tier model" with no evidence of enforcement
- Percentage-hardened metrics with no scope statement
- Every gap framed as "will be remediated Q4" with no owner
- No mention of what breaks for the helpdesk

---

## Deliverables Checklist

```
□ Tier 0 asset register with named owners and justification per asset
□ Dependency register (what authenticates to Tier 0)
□ Current-state measurements with the exact query/method used
□ Target administrative model, one table, decisions justified
□ Migration plan sequenced against operational constraints
□ Control-to-framework mapping (ISO 27001, PCI DSS 4.0, CIS v8.1, SOC 2)
□ Enforcement evidence design (what proves the boundary is respected)
□ Residual risk register with owners and review dates
□ Audit response pack: 5 challenges and defensible answers
□ 5-minute walkthrough of the boundary and its enforcement
```

---

## Reflection Questions

1. Which Tier 0 asset was hardest to get onto the register, and what did that tell you about ownership in the organisation?
2. Where did you choose friction for the business, and how did you justify it to someone whose ticket queue got longer?
3. What is the strongest argument against your own boundary — and does it hold?
4. If the CISO approved only half your plan, which half would you keep, and why?
5. What would you monitor to know the boundary is decaying rather than breached?

---

*The boundary is not a diagram. It is a set of enforceable statements about what can reach your directory — and a small number of people who will notice when that changes.*
