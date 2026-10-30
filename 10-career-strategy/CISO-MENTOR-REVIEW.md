# CISO Review: An Honest Read of Two Profiles

**From:** the CISO you asked to act as your mentor
**To:** Vusi — help desk candidate, Johannesburg
**Date:** 30 October 2026
**Subject:** what you have, what it is worth, what it is not, and the next twelve months

---

## Before the advice: how I read people

When I interview someone at entry level, I am not looking for knowledge. I can teach knowledge. I am looking for four things:

1. **Can you be left alone with a user?** — judgement and manners
2. **Do you know what you don't know?** — escalation discipline
3. **Do you write things down well enough that I can trust you?** — evidence
4. **Will you still be here in eighteen months, and better than when you arrived?** — trajectory

Everything I say below is measured against those four. Not against your project count.

---

## 1. The two profiles

You have built two things that look unrelated and are, in fact, the same thing read from opposite ends.

| | Profile A — GRC portfolio | Profile B — Active Directory lab |
|---|---|---|
| **What it is** | Eight written projects: segmentation, SoA, EU AI Act, control automation, risk acceptance, Tier 0 scoping, access evidence, hardening exceptions | A real domain (`Vusi.lab`), 3 days of build, now audited with 14 findings, a 16-ticket diet and a CV pack |
| **What it says about you** | You can reason about risk, write for an auditor, and defend a decision | You can actually operate the machinery those decisions describe |
| **What it is missing** | Operational proof — nobody has watched you do it under pressure | Scope and depth — one DC, one client, three days |
| **Risk in an interview** | Sounds polished and abstract; one "show me" collapses it | Sounds like a tutorial; one "why did you do that?" collapses it |

### The thing you may not have noticed

Your GRC work and your lab work describe **the same system**. Project 06 is literally the risk argument for the mistake you made on Day 3, when you put John Doe in Domain Admins to get RSAT working.

That is not a coincidence you should be embarrassed about. It is your story, and it is a good one: *"I built a domain, I over-privileged an account to move faster, then I wrote the security argument for why that was wrong, and then I fixed it properly."*

Most career changers have either theory or tinkering. You have both, and they touch. **Protect that link.** If you let either side drift, you become either "the guy with opinions" or "the guy who followed a YouTube video".

---

## 2. What you are actually selling

Not "GRC". Not "Active Directory". Those are two different jobs and applying for both makes you look undecided.

You are selling one thing:

> **An identity-minded support engineer who can operate Active Directory and Microsoft 365 day to day, and who documents and can prove that access is correct — because they understand what auditors and attackers both ask for.**

Why this is a real wedge in the Johannesburg market:

- **Every service desk has identity work in it** — resets, lockouts, group changes, onboarding, offboarding, MFA issues. It is 40–60% of the queue.
- **Almost no first-line analyst understands privilege.** They know how to add someone to a group. They do not know which groups are dangerous, or why a shared local admin password is a domain-level problem.
- **Almost no first-line analyst can evidence anything.** Ask a junior "how would you prove this leaver lost access on Friday?" and you get silence.
- **That combination is exactly what a bank, insurer or MSP needs** when it is trying to pass an audit without hiring two more people.

In an interview, that wedge sounds like: *"I'm not applying to be a GRC analyst. I want to run identity operations properly, and I happen to be able to document them in a way your auditor will accept."*

That is a hireable sentence. "I have a portfolio of nine projects" is not.

---

## 3. What I would and would not hire you for today

I will be blunt, because a mentor who flatters you is useless.

**I would hire you today for:**
- First-line service desk in an SME, or an MSP's level-1 queue
- A desktop support role with a strong identity component
- A 12-month graduate/learnership rotation where writing matters (banks and insurers run these)
- An identity-administration junior role *in an organisation mature enough to have one* — rare, but they exist in insurers and telecoms

**I would not hire you today for:**
- Second line or sysadmin. You have not run a production system, and one DC in a lab does not make an estate.
- GRC analyst. Your writing is strong; your operational scar tissue is not. A GRC analyst who has never run the control they are assessing gets found out in month two.
- Anything with "cloud" or "Azure" in the title. You have no hybrid or Entra experience yet. That is the single biggest gap between your profile and the 2026 job market.

### The gap that matters most

Look at your own lab: **on-premises only**, no cloud, no M365 administration, no Entra ID, no Intune. Meanwhile the jobs you are applying for are overwhelmingly hybrid: an on-prem AD, an Entra tenant, M365 mailboxes, Intune-managed laptops, and a ticket that says "user can't sign in" where the answer lives in *three* places at once.

Closing that gap is your highest-value project. More on that in §4.

---

## 4. The twelve months

Three phases. Each has a **gate** — a test you must pass before moving on. If you fail a gate, do not advance; that is how people end up with a title they cannot defend.

### Phase 1 · November 2026 – January 2027 — Get in the door

| Focus | Detail |
|---|---|
| Primary goal | **A job.** Any first-line role in a real environment. Better a busy MSP than a quiet corporate desk — you learn faster and see more failure modes |
| Lab focus | Finish the current audit findings; add the two things that make you look operational: **LAPS** and a **working backup/restore drill**; deploy a ticketing system (GLPI or osTicket) so you have used one |
| Cloud focus | **Entra ID + M365 administration.** Free tier is enough: create users, licences, groups, SSPR, MFA, sign-in logs, conditional access in report-only |
| Certification | **MS-900** if budget allows, otherwise Microsoft Learn SC-900 path completed free and stated accurately |
| Output | 16 tickets closed, 2 KB articles, CV v2, 40 applications, one recorded walkthrough |
| **Gate 1** | You can reset a password, explain delegation, and read a sign-in log **live on a screen share while talking**, without referring to notes |

### Phase 2 · February – May 2027 — Become the identity person on the desk

| Focus | Detail |
|---|---|
| Situation | You are employed. You now have real tickets, a real queue and a real manager |
| Lab focus | Hybrid identity: Entra Connect (or cloud sync), password hash sync, seamless SSO; then Intune basics — compliance policy, conditional access, device enrolment |
| Work focus | Volunteer for the ugly work: offboarding, access reviews, licence clean-up, LAPS rollout, MFA resets. It is unglamorous, visible, and it is the wedge |
| Certification | **SC-300** (Identity and Access Administrator) — this is the credential that matches your positioning. AZ-800 only if you are moving toward sysadmin |
| Output | One sanitised case note published per month: what broke, what you changed, what the evidence was. No customer data, no screenshots of real tenants |
| **Gate 2** | You have personally run an access review or an offboarding cycle end to end, and can show the evidence pack you produced |

### Phase 3 · June – October 2027 — Choose the fork deliberately

At this point you will have two credible directions. Choose one, not both:

**Fork A — Identity/sysadmin:** L2 engineer → identity administrator → IAM engineer. Certifications: SC-300 done, then AZ-104 or AZ-800, then SC-100 if you go architectural. Your GRC writing becomes the thing that gets you invited to the meetings where access models are decided.

**Fork B — GRC with operational credibility:** GRC analyst → security/compliance analyst in a regulated firm. Your differentiator is that you have *run* the controls you audit, which is rare and valuable. Certifications: ISO 27001 Lead Implementer, then CISA later if you want audit.

**Gate 3** | You can explain, in five minutes and without slides, a decision you made in production that you would make differently now.

### Why not just chase certifications for a year

Because a certificate gets you the interview and never the job. In this market, the ordering that works is: **job first, certification alongside the job, specialisation after the job.** Certificates obtained before employment tend to expire before they pay.

---

## 5. Certifications — the honest order

| Order | Certification | Why | When |
|---|---|---|---|
| 1 | **MS-900** (M365 Fundamentals) or the free SC-900 learning path | Cheap, fast, signals cloud direction. Do this before A+ if money is tight | Now – Dec 2026 |
| 2 | **CompTIA A+** | Only if the local HR filter demands it. Many MSPs do not; banks often do. It is expensive and slow relative to its signal | Only if applications stall |
| 3 | **SC-300** (Identity and Access Administrator) | The credential for your wedge. Far more differentiating than A+ at this level | Feb – May 2027 |
| 4 | **AZ-800 / AZ-104** | If you take Fork A and want sysadmin depth | Mid 2027 |
| 5 | **Security+** | Useful, generic, expensive. Buy it when an employer pays | When sponsored |

**What to skip:** any bootcamp promising a job, any "GRC certification" before you have operated a control, and any paid course whose content exists free on Microsoft Learn.

**The rule:** never let a certification claim outrun what you can demonstrate. A candidate with SC-300 who cannot open a sign-in log is worse off than one with no certification who can.

---

## 6. The 90-day plan, and the weekly rhythm

Your `09-helpdesk-readiness/30-day-plan.md` is the November plan. I am extending it, not replacing it.

| Week block | Theme | Non-negotiable output |
|---|---|---|
| Weeks 1–2 | Repair the lab, work 8 tickets | Findings 1, 2, 4 fixed; 8 tickets closed |
| Weeks 3–4 | Finish the queue, CV, applications | 16 tickets; 20 applications out |
| Weeks 5–6 | **Cloud** — Entra ID + M365 admin basics | A cloud section in the lab with users, groups, SSPR, MFA, sign-in logs |
| Weeks 7–8 | Ticketing system + LAPS + backup drill | Used a real ITSM tool; restore proven |
| Weeks 9–10 | Interviews in volume, mock practice | 40 applications; 2 mock interviews recorded |
| Weeks 11–12 | Consolidate, reflect, decide Fork A or B tentatively | Written reflection; sanitisd case note #1 |

**The weekly rhythm — four hours, every week, no exceptions:**

| Time | Activity |
|---|---|
| 2.5 hrs | Hands-on lab: build, break, fix |
| 45 min | Write-up: one ticket, one KB article, or one case note |
| 30 min | Market: applications, follow-ups, one LinkedIn conversation with someone doing the job |
| 15 min | Friday review: what did I get wrong this week? |

That Friday question is the entire mechanism. Twelve months of honest Friday reviews beats any certification path.

---

## 7. Five risks that could sink this

**Risk 1 — Volume without depth.**
You have produced a lot of documents quickly. That is an asset now and a liability in three months if the interviewer's second question is "show me". **Mitigation:** for every artefact, one live demonstration you can perform on demand. Cap yourself at three claims per interview that you would happily be tested on.

**Risk 2 — The AI-polished vocabulary problem.**
Your written work is articulate. Articulate plus junior is a combination interviewers test hard, because the failure mode — a candidate who talks like a senior and freezes on a live console — is common and expensive. **Mitigation:** deliberately use simpler language in interviews than in documents. Say "I didn't know, so I checked the ticket history" instead of "I performed a root-cause analysis". Never describe something you have not done.

**Risk 3 — The unfocused profile.**
Nine projects across GRC, identity and service desk can read as *"hasn't decided"*. **Mitigation:** one sentence, always the same one (§2). GRC is your differentiator, not your second application. Apply for support roles only, and let the GRC work explain **why you are unusually good at the identity half of the queue**.

**Risk 4 — No humans.**
Your portfolio is all self-authored. There is no manager, no colleague, no mentor, no reference who has seen you work. **Mitigation, starting this month:** two people who can vouch for you. Options: a community IT project (church, NGO, school — real users, real constraints), a volunteer help desk at a local organisation, or a structured mentorship. This is the single weakest part of your profile and no document fixes it.

**Risk 5 — The market is not waiting.**
South African entry-level IT hiring is competitive, favour referrals, and moves through agencies and internal networks more than cold applications. **Mitigation:** 40 applications is the floor, not the target. Ten warm conversations (LinkedIn, community, alumni, recruiters) will outperform a hundred cold applications. Track conversations separately from applications.

---

## 8. What not to do — the mentor's list

1. **Do not add a tenth project before you have closed sixteen tickets.** Breadth is the enemy of a hireable junior.
2. **Do not claim the lab is production experience.** Say "self-built lab" plainly, every time. It is respected.
3. **Do not defend the Domain Admin decision.** Own it. It is the best material you have.
4. **Do not apply for GRC roles yet.** Not because you could not learn them, but because you would be competing against people with two years of audit exposure and no operational story — the reverse of your profile.
5. **Do not buy another course until the current one is finished.** The most common failure pattern I see in career changers is collecting beginnings.
6. **Do not let the writing become a substitute for the work.** A beautiful audit of a lab with no LAPS deployment is a document, not a skill.
7. **Do not bad-mouth a user, a manager or an employer in any interview, ever.** It is the fastest way to fail a service desk interview, and it costs nothing to avoid.
8. **Do not skip the boring lab items** — DHCP, printing, backup, time sync, ticketing. They are 70% of the actual job and where juniors are exposed.

---

## 9. How I will assess you at each gate

| Gate | What I actually do | What fails |
|---|---|---|
| Gate 1 | Screen share, no notes: "a user can't log in." Then: "why did you do that first?" | Jumping to a password reset; silence while working; no scope question |
| Gate 2 | "Show me the evidence from the last offboarding you did." | A screenshot with no timestamp; no group-removal record; "I think it was handled" |
| Gate 3 | "Tell me a decision you'd reverse." | A humble-brag answer; a story where nobody was at fault; no lesson that changed behaviour |

None of these test knowledge. All three test whether I would let you near a production directory.

---

## 10. This week — assignments

Numbered, small, do them in order.

1. **Finish the pending DNS test** and interpret the result in writing. Two sentences: what you saw, what it means.
2. **Fix findings 1, 2 and 4** (Domain Admin removal, separate admin account, recycle bin) and screenshot before/after.
3. **Write your positioning sentence** — the one in §2, in your own words, in a note you keep. If it takes more than two lines, it is not finished.
4. **Create the ticket queue** and open the first eight tickets as issues, written as users would report them.
5. **Draft the Entra ID section of the lab** — a paragraph describing what you will build in weeks 5–6. Planning it now means you start it, rather than admire it.
6. **Find one human.** One person doing the job you want, on LinkedIn or in your network, and send them a short, specific message asking one question. Not "please mentor me". Ask about their queue.
7. **Book the MS-900** or write down the date you will. A date, not an intention.

Reply to me in this repo — commit a short file `10-career-strategy/weekly-log.md` with what you did, what failed, and what you would do differently. One paragraph per week. I will read it as the CISO who has to decide whether to put you in front of a service desk.

---

## The last thing I will say

You are not behind. You are early, and early with documentation is a genuinely unusual position — most people your stage have a certificate and no evidence, or evidence and no ability to explain it.

What will decide this is not how much you write over the next twelve months. It is whether, at the end of it, you can sit in a room with someone who has twenty years of scar tissue and answer their questions honestly, without reaching for a document.

Write less. Run more. Own the mistake.

— *CISO*
