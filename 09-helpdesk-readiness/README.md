# Project 09: Service Desk Readiness — Turning a Home Lab Into Hireable Evidence

## Overview

A service desk interview is not an artefact review. It is a **behavioural and practical** test: can you take a vague complaint from an annoyed person, find the cause under time pressure, fix it without breaking something else, and explain what you did?

Most candidates prepare for this with a certificate and a list of technologies. Almost none can show what they did when something failed. Your home lab, documented honestly, is that evidence — but only if it stops being a list of things you built and becomes a **record of problems solved and decisions corrected**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHAT A HIRING MANAGER IS ACTUALLY SCREENING FOR          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   NOT this                                THIS                              │
│   ─────────                               ────                              │
│   "Knows Active Directory"                "Can reset an account and explain │
│                                            why the ticket needed to be     │
│                                            verified with the caller first" │
│                                                                             │
│   "Built a domain with GPOs"              "Found why a mapped drive didn't  │
│                                            appear, and documented it"       │
│                                                                             │
│   "Used PowerShell"                       "Automated a repeatable task and  │
│                                            knows when not to"               │
│                                                                             │
│   "Is enthusiastic about IT"              "Doesn't blame the user"          │
│                                                                             │
│   Failure mode: LISTS                     Failure mode: STORIES WITH       │
│   (impressive, unverifiable)              EVIDENCE (small, verifiable)     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Scenario (this one is real)

**Candidate:** Vusi, career changer, Johannesburg
**Target:** first-line / service desk analyst role
**Timeline:** 30 days
**Existing asset:** a home lab — `Vusi.lab`, one Windows Server 2022 domain controller (DC-01), one Windows 11 client, AD DS, DNS, file shares, GPOs, OU design, RBAC, RSAT, PowerShell provisioning
**Gap:** the lab demonstrates *building*. A service desk job is *support*. Those overlap less than people think.

### What the lab proves, and what it does not

| The lab proves | The lab does not prove |
|----------------|------------------------|
| You can stand up AD DS and DNS | That you can diagnose a broken one |
| You understand OUs, groups, RBAC | That you can work a queue of 40 tickets |
| You can build and link GPOs | That you can explain a GPO to a frustrated user |
| You can use PowerShell | That you know when a script is the wrong tool |
| You can follow a tutorial to completion | That you can work without a tutorial |

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE SHIFT THIS PROJECT REQUIRES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   BUILDING MODE (your first 3 days)        SUPPORT MODE (the job)          │
│   ─────────────────────────────────        ──────────────────────          │
│   Follow steps 1..N                        There are no steps               │
│   Success = it works at the end            Success = user is working again  │
│   Nothing is in the way                    Time pressure, 3 people waiting  │
│   You choose the pace                      Someone else sets the priority   │
│   Mistakes are invisible                   Mistakes get reported            │
│   You know what changed                    You weren't there when it broke   │
│                                                                             │
│   The bridge between the two: a TICKET LOG of problems you diagnosed,      │
│   and a LAB AUDIT of what you got wrong. Neither requires a new lab.        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What You Need to Do

### Phase 1: Audit your own lab (Day 1–2)

**Task:** Review what you built as if you had just joined as support. Write down everything you would change. This is not self-flagellation — it is the single most credible thing a junior can bring to an interview, because it shows you can be wrong in writing.

Known findings are already documented in [`lab-audit-and-fixes.md`](./lab-audit-and-fixes.md), including the one that matters most: **John Doe was made a Domain Admin so that RSAT would work.** It shouldn't have been, and the fix teaches you delegation — the exact skill a service desk uses daily.

**Deliverable:** your own audit table, in your own words, with at least 5 findings you found yourself.

---

### Phase 2: Build a ticket queue you can show (Day 2)

**Task:** Stop describing tickets. Produce them.

The cheapest credible option is **GitHub Issues on this repository** — already set up with a ticket template in [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE/service-ticket.md). It has three properties no résumé line has:

1. **A visible lifecycle** — open, in progress, resolved, with timestamps
2. **A permanent URL** an interviewer can open before the call
3. **Evidence of written communication** — the part of the job nobody practises

Label scheme:

| Label | Values | Why it matters |
|-------|--------|----------------|
| `type` | incident, request, problem, change | Service desk interviews test whether you know these differ |
| `priority` | P1, P2, P3, P4 | Priority is derived from impact × urgency, not from who shouted |
| `category` | account, access, hardware, software, network, mail | Drives routing and trend analysis |
| `status` | triaged, in-progress, waiting-on-user, waiting-on-third-party, resolved | Wait states are 40% of real ticket time |

**Target: 16 tickets closed before you apply.** Twelve of them are specified with expected diagnoses in [`ticket-diet.md`](./ticket-diet.md) — run them against your lab, then write the ticket as if a user reported it.

---

### Phase 3: Work the ticket diet (Day 3–17)

**Task:** For each ticket, follow the same discipline. It is the discipline that gets hired, not the fix.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE SEVEN-STEP TICKET DISCIPLINE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. VERIFY        who is this, and are they entitled to this change?        │
│                   (never reset a password without identity verification)    │
│                                                                             │
│  2. REPRODUCE     what exactly happens, and when did it last work?          │
│                   "It's broken" is not a symptom.                           │
│                                                                             │
│  3. SCOPE         one user, one PC, one OU, or everyone?                    │
│                   This single question decides P1 vs P4.                    │
│                                                                             │
│  4. HYPOTHESISE   name three likely causes, then test the cheapest first    │
│                   (DNS before reimaging; GPO before reinstalling)           │
│                                                                             │
│  5. FIX           smallest change that resolves it, reversible if possible  │
│                                                                             │
│  6. CONFIRM       with the user, not with yourself. "It works for me" is    │
│                   the phrase that generates the re-opened ticket.          │
│                                                                             │
│  7. RECORD        ticket notes + KB article if it will recur                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Metrics to record per ticket:** time to first response, time to resolve, number of contacts, whether it was escalated, and whether it reopened. Junior candidates who can quote their own reopen rate are memorable.

---

### Phase 4: Produce the four artefacts hiring managers ask about (Day 8–20)

| Artefact | What it proves | Template |
|----------|----------------|----------|
| Ticket log with 16 closed tickets | You can work a queue, and you write | [`templates/ticket-log-template.md`](./templates/ticket-log-template.md) |
| Two KB articles written from your own tickets | You reduce future tickets instead of absorbing them | [`templates/kb-article-template.md`](./templates/kb-article-template.md) |
| Onboarding + offboarding checklist | You understand the two workflows a service desk runs most | [`templates/onboarding-offboarding-checklist.md`](./templates/onboarding-offboarding-checklist.md) |
| Escalation matrix | You know what you must not touch | [`templates/escalation-matrix.md`](./templates/escalation-matrix.md) |

**The offboarding checklist is the one that separates you from other juniors.** Any candidate can describe a new-starter setup. Very few can explain why a leaver's disabled account must also lose group membership, mailbox delegation, VPN certificates, and local admin — and why waiting 30 days to delete it is deliberate.

---

### Phase 5: Convert the lab into interview material (Day 10–22)

**Task:** Build the story pack. See [`cv-and-interview-pack.md`](./cv-and-interview-pack.md).

Every claim in your CV must survive one follow-up question. Rewrite:

| Weak (unverifiable) | Strong (survives follow-up) |
|---------------------|-----------------------------|
| "Experience with Active Directory" | "Provisioned 8 users across 3 OUs with role-based security groups; reset passwords and enforced change-at-next-logon for 4 test accounts" |
| "Knowledge of Group Policy" | "Deployed drive mapping and security policy GPOs; diagnosed a non-applying GPO using `gpresult /r` and found the policy was linked to the wrong OU" |
| "PowerShell scripting" | "Wrote a script to provision 3 accounts from a CSV with error handling and a log file; rewrote it after the first version silently skipped a failed user" |
| "Made a user Domain Admin to install RSAT" | "Initially over-privileged an account to get RSAT working; corrected it to delegated password-reset rights on a single OU and documented why" |

The fourth row is the one that gets you hired. Everyone makes that mistake. Almost nobody can explain it.

---

### Phase 6: Interview under realistic pressure (Day 18–28)

**Task:** Practise the three formats you will actually face.

| Format | What they test | How to prepare |
|--------|----------------|----------------|
| Behavioural ("tell me about a time…") | Whether you blame users | STAR stories, one per competency, using lab and non-lab examples |
| Technical scenario ("a user can't log in, walk me through it") | Whether you follow a method | Talk through the seven-step discipline out loud, not the answer |
| Live/remote task (screen share, reset a password) | Whether you narrate while working | Record yourself doing it; watch for silence and apologies |

**The trap in technical scenarios:** candidates jump to a fix to look fast. Interviewers mark down uncontrolled guessing. Say *"I'd start by establishing scope — is it one user or everyone? That decides whether this is a P1 —"* and you are already ahead of most first-line applicants.

---

### Phase 7: Apply from Day 7, not Day 30

**Task:** Run applications in parallel with the preparation. A 30-day plan that ends with "start applying" is a 60-day plan.

| Week | Applications | Reasoning |
|------|--------------|-----------|
| 1 | 5 | Deliberately early, low-stakes calls — the first interviews are practice |
| 2 | 10 | Feedback from week 1 corrects your CV before the main push |
| 3 | 15 | Highest volume once artefacts exist |
| 4 | 10 + follow-ups | Follow-ups convert better than new applications |

Target service desk, first-line support, IT support technician, desktop support, and **MSP help desk** roles. In Johannesburg, MSPs interview faster and train harder than in-house desks — the trade-off is workload. Say so in interviews; it shows you understand the job.

---

## Success Criteria

| Criteria | Evidence |
|----------|----------|
| **Self-audit is honest** | At least one finding is a mistake you made, not a missing feature |
| **Tickets are real** | 16 closed tickets with timestamps, notes and resolution |
| **Escalation is understood** | You can name three things you must not attempt alone |
| **Communication is written** | KB articles a stranger could follow |
| **Priority is derived** | You can justify P1 vs P4 by impact × urgency, not by tone |
| **Claims survive follow-up** | Every CV line has a story and an artefact behind it |
| **Mistake is owned** | The Domain Admin over-privilege is explained in a way that shows judgment |

### Red Flags (Weak Candidate)

- Lab described as a list of features with no problems encountered
- "I've never had a real job, so I don't have examples" (the lab is full of examples)
- Domain Admin granted to a help desk account and defended
- Tickets described but not recorded
- Escalating everything, or escalating nothing
- Blaming users in any story, even obliquely
- Certificates listed with no artefact behind them

---

## Deliverables Checklist

```
□ Lab audit with 5+ findings you found yourself (including over-privilege)
□ GitHub Issues ticket queue with labels and template
□ 16 closed tickets with notes and resolution
□ Ticket metrics: response time, resolution time, reopen rate
□ 2 KB articles written from your own tickets
□ Onboarding checklist (tested end-to-end on a new test user)
□ Offboarding checklist (tested end-to-end on a test leaver)
□ Escalation matrix with named limits
□ CV rewritten with verifiable claims
□ 8 STAR stories, at least 4 from the lab
□ 5-minute recorded walkthrough: "one ticket, start to finish"
□ Application log with 40 applications by Day 30
```

---

## Reflection Questions

1. Which ticket took you longest, and what made it slow — the technology, or the information?
2. Where did you fix the symptom and only later find the cause?
3. What did you escalate that you could have solved, and what did you attempt that you should have escalated?
4. Which of your lab decisions would you reverse if a real company owned this environment?
5. If a user says "it was working yesterday", what is your first question — and why that one?

---

*A service desk hires people who make other people's days shorter. Your lab proves you can build a domain. Your ticket log proves you can be trusted with one.*
