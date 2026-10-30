# CV and Interview Pack

Turning the lab into sentences that survive follow-up questions.

---

## 1. Positioning

You are not "someone with no experience". You are **a person who built and then ran a small domain, documented what went wrong, and can explain it under questioning.** That is rarer at entry level than a certificate.

**One-line positioning (use in CV profile and at the top of your LinkedIn):**

> *"IT support candidate with hands-on Windows Server 2022 and Active Directory experience in a self-built lab: domain design, RBAC, Group Policy, delegated administration and PowerShell provisioning. Documented 16 resolved support tickets, two knowledge base articles and an honest audit of my own environment's weaknesses."*

**30-second spoken version:**

> *"Over three days I built a small Windows domain from scratch — a Server 2022 domain controller, a Windows 11 client joined to it, departmental OUs, security groups, file shares with NTFS permissions, and Group Policy for drive mapping and security settings. Then I re-read my own build as if I were the support analyst inheriting it, and found real problems — including an account I had over-privileged. I fixed them, wrote them up, and I've been working a set of simulated service desk tickets against the environment since. The lab is the technical part; the tickets and the write-ups are the part I'd actually be doing in the job."*

**2-minute version:** add the specific about delegation vs Domain Admin, one ticket story, and what you would do differently at scale.

---

## 2. CV structure (2 pages, ATS-safe)

```text
Name — IT Support / Service Desk Analyst
Johannesburg, Gauteng · [email] · [phone] · github.com/vusi1688-boop/GRCProjects
[LinkedIn] · Open to first-line, desktop support and MSP help desk roles

PROFILE                    ← the positioning line above, 2-3 lines
KEY SKILLS                 ← grouped, keyword-rich, honest
LAB PROJECTS               ← the centrepiece; this is where the lab lives
CERTIFICATIONS             ← in progress is fine, stated accurately
EXPERIENCE                 ← transferable, with support framing
EDUCATION
```

**Rules that matter in South African applications:**

- **No photo, no ID number, no date of birth.** Recruiters do not need them and some ATS reject non-standard extras.
- **PDF, named** `Vusi-Surname-ServiceDesk-CV.pdf`.
- **No tables, columns or text boxes** behind important content — many ATS parse them badly. Single column, standard headings.
- **Spell out and abbreviate** key terms once each: "Active Directory (AD)", "Group Policy (GPO)", "Domain Name System (DNS)" — the ATS matches on keywords, the human reads for meaning.
- **Two pages maximum**, no exceptions at this level.

### Key skills block — honest and specific

```
Directory & Identity      Active Directory DS, OU design, security groups, RBAC,
                          delegated administration, password reset and unlock,
                          account lifecycle (onboarding / offboarding)
Windows Server            Windows Server 2022, DNS, file services, NTFS and share
                          permissions, Windows Server Backup
Endpoints                 Windows 11, domain join, RSAT, local admin management (LAPS),
                          Group Policy application and troubleshooting
Policy                    GPO creation, linking, security filtering, drive mapping,
                          security options, gpresult / Group Policy modelling
Automation                PowerShell: New-ADUser, Add-ADGroupMember, bulk provisioning
                          from CSV with logging and error handling
Service management        Ticket triage, priority by impact and urgency, escalation,
                          knowledge base writing, user communication, change logging
Governance awareness      Least privilege, privileged access separation, access
                          review evidence, risk acceptance, POPIA / ISO 27001 basics
```

If you have not done LAPS or ISO material, delete those words. Nothing here is worth an interview collapsing over.

### Rewriting your bullets

| Do not write | Write instead |
|---|---|
| Experience with Active Directory | Provisioned 8 domain accounts across 3 departmental OUs, assigned role-based security groups, and completed 4 password resets with forced change-at-next-logon |
| Knowledge of Group Policy | Deployed drive mapping, logon banner and wallpaper GPOs; diagnosed a non-applying drive map with `gpresult /r` and corrected the link target |
| PowerShell scripting | Automated creation of 3 departmental accounts from CSV with per-user error handling and a timestamped log; second version added failure handling after the first silently skipped one"
| Understanding of permissions | Configured NTFS with inheritance disabled on a departmental share; verified denial for a non-member and documented the token-refresh cause of a false "permission didn't work" report |
| Familiar with remote admin | Installed RSAT via `Add-WindowsCapability` and administered AD from a Windows 11 client; replaced an over-privileged account with OU-scoped delegated password-reset rights |

**The structure of every bullet:** verb + object + scale + outcome. No adjectives.

---

## 3. The project section (where the lab goes)

Do not bury the lab under "Education" or "Interests". It is your strongest evidence; give it its own section.

```text
LAB PROJECTS

Active Directory Home Lab — Vusi.lab                        2026
Windows Server 2022 domain controller (DC-01), Windows 11 Pro client
· Built a departmental OU structure (HR, IT, Finance), role-based security groups
  and departmental file shares with inheritance disabled and explicit ACLs.
· Deployed GPOs for drive mapping, logon banner, desktop standardisation and
  Control Panel restriction; troubleshot application using gpresult and GPO reports.
· Provisioned users in bulk with PowerShell from CSV, adding error handling and
  logging after an unhandled failure in the first version.
· Audited the completed build as an inheriting support analyst, documented 14
  findings and remediated the highest-risk items — including replacing an
  over-privileged Domain Admin account with delegated, OU-scoped rights.

Service Desk Simulation — 16 resolved tickets                     2026
· Worked a simulated queue covering account, access, Group Policy, DNS, printer,
  logon and security-report categories; recorded response and resolution times,
  first-hypothesis accuracy and reopen rate.
· Produced two knowledge base articles and an onboarding/offboarding checklist
  tested end to end.

Compliance Portfolio — github.com/vusi1688-boop/GRCProjects        2026
· Eight written projects across ISO 27001, PCI DSS, CIS Benchmarks and identity
  governance, including a service desk readiness pack and hardware-verified lab audit.
```

**Link it.** A GitHub link that opens to closed tickets, a template and a KB article is worth more than three more bullets.

---

## 4. STAR story bank

Eight stories. Write each in 150 words maximum and rehearse aloud, not in your head. Four must come from the lab; two can come from any previous job or study; two should be about communication and pressure.

| # | Competency being tested | Story prompt | Your story |
|---|---|---|---|
| 1 | **Ownership of a mistake** | "Tell me about a time you got something wrong." | The Domain Admin over-privilege → [script below] |
| 2 | **Methodical troubleshooting** | "Walk me through a problem you solved." | Drive mapping or access-denied ticket |
| 3 | **Communication with a non-technical person** | "How do you explain something technical to a user?" | Explaining a restriction or a wait |
| 4 | **Prioritisation under pressure** | "How do you handle several urgent things at once?" | Ticket queue with a P1 mixed in |
| 5 | **Learning quickly** | "Tell me about learning something new fast." | DNS, delegation or LAPS — something you did not know a week ago |
| 6 | **Disagreeing or saying no** | "When have you had to refuse a request?" | Local admin request, or a permission you should not grant |
| 7 | **Working with a difficult person** | "Tell me about a time someone was frustrated with you." | A user whose ticket took longer than they wanted |
| 8 | **Following process under temptation** | "Have you ever bent the rules to help someone?" | Password reset without full verification — and why you did not |

### Script for story 1 (the one that wins the interview)

Write it in your own words; this is the shape.

> **Situation:** "While building my lab, I needed to run Active Directory Users and Computers from my Windows 11 machine. I installed RSAT, but the console wouldn't let me do anything. The fastest way to unblock myself was to add my test user to Domain Admins — so I did."
>
> **Task:** "A few days later I was reviewing the build against security practice, and I realised what I'd done. I'd given a normal account — one that reads email and browses the web — full control of the domain."
>
> **Action:** "I removed the account from Domain Admins and did it properly: I delegated only password reset and read rights to a group, scoped to the HR organisational unit, then verified with `Get-Acl` that the rights were exactly what I intended. I also created a separate admin account so day-to-day work and admin work aren't the same identity."
>
> **Result:** "I wrote it up in my lab audit. What I took from it is that I reached for the biggest hammer because it was the one I could find. RSAT needed local admin on the workstation and delegation in AD — I'd conflated two different requirements. Now I check what a task actually needs before I grant anything, and I know what a delegated permission looks like when it's done correctly."

**Why this works:** it is a real error, fixed, verified, and generalised into a principle. Any interviewer who has run a help desk has seen this mistake in production.

---

## 5. Technical scenario script — "a user can't log in"

They are testing method, not the answer. Say the method out loud.

> *"First I'd establish scope — is it one user or is the whole floor down? That changes it from a P3 to a P1 and changes who I tell. Then: is it a password problem, a lockout, an expired password, or a machine problem? I'd check the account state in AD — locked, disabled, expired. If it's locked, I'd unlock and then find what's still using the old password, because otherwise it locks again. If it's 'trust relationship failed', that's the computer account, and I'd repair it before considering a rejoin. Throughout, I'd keep the user updated — even 'I'm still working on it' is better than silence."*

**What not to do:** jump to "I'd reset the password". It is the most common answer and it signals guessing.

---

## 6. The questions you will be asked, and the shape of a good answer

| Question | What they are really asking | Good shape |
|---|---|---|
| "Why help desk?" | Will you stay, or is this a waiting room? | Genuine interest in the service side: users, process, learning breadth. Say what you want to grow into (2nd line, cloud) — ambition is fine if it includes the current role |
| "You have no professional IT experience. Why you?" | Can you evidence capability? | Point to the lab, the 16 tickets, the audit, the KB articles. Offer the link |
| "How do you handle an angry user?" | Do you take it personally? | Listen, acknowledge, don't defend, give a time commitment you can keep, follow up |
| "What would you do if you didn't know the answer?" | Will you invent something? | Say so, check the KB, ask a colleague, tell the user when you will come back with an answer — then come back |
| "What does DNS do?" | Baseline | One sentence, then the practical consequence: domain machines must use the DC; public DNS breaks name resolution and therefore logons |
| "Difference between share and NTFS permissions?" | Baseline, plus judgment | Both evaluated, most restrictive wins, share for access and NTFS for granularity |
| "What's a GPO and how does it apply?" | Understanding, not memorisation | Linked to site/domain/OU, applied to users or computers, order LSDOU, filtered by security group; `gpresult` to prove it |
| "What's the difference between an incident and a request?" | Whether you understand the queue | Incident = something broken, restore service. Request = something wanted, follow the process. Problem = why it keeps breaking |
| "What would you escalate?" | Do you know your limits? | Anything you're not authorised for, anything touching privileged access or security incidents, anything outside your knowledge *and* outside your time budget |

---

## 7. Questions to ask them

Ask two or three. They are part of the assessment.

1. "What does the first week look like for someone in this role — shadowing, or straight onto the queue?"
2. "What's the split between phone, ticket and walk-up support?"
3. "How is escalation handled — is there a defined matrix, and who do I hand off to?"
4. "What's the team's biggest recurring ticket category, and has anyone tried to fix the cause?"
5. "What does progression from first line look like here?"

Question 4 is the one that marks you as someone who thinks about causes rather than volume.

---

## 8. Before the first interview

- [ ] CV rewritten with verifiable bullets, two pages, PDF
- [ ] GitHub link works, and the top of the repo has the service desk pack in it
- [ ] 8 STAR stories written, at least 4 rehearsed aloud
- [ ] Recorded yourself answering "walk me through a problem you solved" — watch for filler, apology and silence
- [ ] Practised resetting a password and unlocking an account while narrating out loud
- [ ] Ready to say "I don't know, I'd look it up here" without flinching
- [ ] Have one question ready about their queue, escalation or recurring issues

---

## 9. What not to do

| Don't | Because |
|-------|---------|
| Claim experience you do not have | One follow-up question ends the interview, and the interview ends the application |
| Present the lab as production work | Say "self-built lab" plainly; it is respected, misleading is not |
| Defend the Domain Admin decision | Owning it is the differentiator. Defending it is disqualifying |
| Bad-mouth a previous employer or a "difficult user" | Interviewers assume you will describe them the same way |
| Answer with only yes or no | Silence reads as no experience; narrate your reasoning |
| Say "I'm a quick learner" | Every candidate says it. Show one thing you learned in a week instead |

---

*The lab got you the interview. The 16 tickets, the audit and the mistake you can explain get you the job.*
