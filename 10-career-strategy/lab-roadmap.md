# Lab Roadmap: Sixteen Builds, Ordered by What They Prove

The rule for every item: **each build must produce either a ticket, a KB article, or a runbook.** A build with no written output is a hobby, not evidence.

Effort estimates assume a functioning `Vusi.lab` and 2–3 hours a week in the lab.

---

## Where you are

| Have | Do not have |
|---|---|
| One Server 2022 DC, one Windows 11 client | A second DC, replication, or failover experience |
| AD DS, DNS (forward zone), file shares, GPOs | DHCP, printing, ticketing, monitoring |
| OUs, security groups, RBAC on shares | Delegation model, LAPS, tiering |
| RSAT, basic PowerShell provisioning | Cloud: Entra ID, M365, Intune, hybrid sync |
| A written audit of 14 findings | A restore ever performed |

Your profile is **on-premises, single-node, three days old**. The market hires for **hybrid, multi-system, under pressure**. Close that distance deliberately, in this order.

---

## Phase 1 · November 2026 – January 2027

### 1. Privilege repair and the delegation model
**Effort:** 3 hrs · **Depends on:** audit findings 1, 2
**Build:** remove John from Domain Admins; create `a-john`; create `HelpDesk_Group`; delegate password reset and read on `OU=Users` only; verify with `Get-Acl`; document what the help desk can and cannot do.
**Proves:** you understand that privilege is the product, not an inconvenience.
**Evidence:** before/after `Get-ADGroupMember`, `Get-Acl` output, a one-page delegation statement.
**Interview probe:** "What can your help desk *not* do?" — you must answer without pausing.

### 2. LAPS
**Effort:** 2 hrs · **Depends on:** none
**Build:** extend schema, grant read/reset to `HelpDesk_Group`, apply policy via GPO, retrieve a password as a help desk user, verify the retrieval is auditable.
**Proves:** you can eliminate shared local admin passwords, which every auditor asks about.
**Evidence:** `Get-LapsADPassword` output, GPO settings, screenshot of the audit event.
**Interview probe:** "How would you get local admin on a user's laptop?" — the answer is LAPS, not a shared password.

### 3. Backup and a real restore
**Effort:** 3 hrs · **Depends on:** none
**Build:** enable AD Recycle Bin; schedule `wbadmin` system state backup; **delete a test user, restore from backup**, then restore a second test user from the Recycle Bin and compare the two.
**Proves:** you have done the thing everyone says they can do.
**Evidence:** restore log, timing, and a note on what broke during the restore.
**Interview probe:** "Have you ever restored anything?" — a yes with a story beats a polished no.

### 4. A real ticketing system
**Effort:** 4 hrs · **Depends on:** a spare VM or Docker
**Build:** deploy **GLPI** or **osTicket**; configure categories, priorities, SLA targets, a queue and a knowledge base; migrate your 16 simulated tickets into it.
**Proves:** you have used an ITSM tool, not just GitHub issues.
**Evidence:** queue screenshot, SLA report, one closed ticket with full history.
**Interview probe:** "Which ticketing systems have you used?" — most juniors have used none.

### 5. DHCP
**Effort:** 2 hrs · **Depends on:** static IP on DC-01
**Build:** install the DHCP role, authorise it in AD, create a scope, add reservations for DC-01 and the client, set scope options 003 (router), 006 (DNS = DC), 015 (domain).
**Proves:** you understand option 006 is why "the internet works but the domain doesn't".
**Evidence:** scope export, `ipconfig /all` from the client showing the DC as DNS.
**Interview probe:** "A laptop gets an IP but can't join the domain — why?" — option 006 or a stale lease.

### 6. Break/fix drills (first set)
**Effort:** 1 hr per drill · **Depends on:** items 1–5
**Build:** deliberately break the lab, then fix it without looking at your own notes. Ten drills:

| # | Break it | Expected diagnosis |
|---|---|---|
| 1 | Point the client's DNS at 8.8.8.8 | Domain resolution fails; logon fails |
| 2 | Set the client clock 15 minutes fast | Kerberos authentication fails |
| 3 | Remove a user from a group after they logged on | Access still denied until re-logon (token) |
| 4 | Disable the GPO link | Drive map disappears at next logon |
| 5 | Wrong password five times | Lockout ticket; find the source with event 4740 |
| 6 | Delete a computer object | Trust relationship failure; repair vs rejoin |
| 7 | Stop the Spooler on the print server | Jobs queue, nothing prints |
| 8 | Change the share permission to Read | Users can open but not save |
| 9 | Move the user to the wrong OU | Policies stop applying; `gpresult` shows it |
| 10 | Reset the DC's time source | Widespread logon failures, hard to spot |

**Proves:** you can diagnose without instructions — the actual job.
**Evidence:** one ticket per drill, with your first hypothesis and whether it was right.
**This is the single most valuable item on this list.** Do it before any new build.

### 7. Entra ID and M365 administration basics
**Effort:** 5 hrs · **Depends on:** a tenant
**Tenant options, in order of cost:** a Microsoft 365 Developer tenant if you qualify; a free Entra ID tier tenant plus one M365 Business Basic seat; or an employer's sandbox once hired.
**Build:** create cloud-only users, groups (assigned and dynamic), assign licences, enable SSPR, enforce MFA, review sign-in logs, configure a conditional access policy **in report-only** mode, then read what it *would* have blocked.
**Proves:** you can operate the half of identity the jobs are actually about.
**Evidence:** sign-in log with a failed-then-successful MFA, SSPR reset record, report-only policy output.
**Interview probe:** "A user can't sign in to Outlook but can sign in to Teams — where do you look?" — conditional access, licence, or client auth.

### 8. Hybrid identity with Entra Connect
**Effort:** 5 hrs · **Depends on:** item 7, a second server VM
**Build:** install Entra Connect on a member server; enable password hash sync; sync one OU only; verify UPN matching; break the sync (stop the service, change a password) and observe; then document which attributes are authoritative where.
**Proves:** you understand why a cloud password and an on-prem password can disagree.
**Evidence:** sync log, a synced user with `onPremisesSyncEnabled`, a documented failure and fix.
**Interview probe:** "User changed their password on-prem and can't log into M365. Why?" — sync lag, or the account was cloud-authoritative.

---

## Phase 2 · February – May 2027

Do these **while employed**, if possible. They are what turn a first-line analyst into an identity/sysadmin candidate.

### 9. Second domain controller and replication
**Build:** promote a second DC, verify replication (`repadmin /showrepl`, `dcdiag`), move a FSMO role, power off the first DC and observe what breaks, then document the DNS client dependency.
**Proves:** you have seen replication fail and know the three commands that diagnose it.

### 10. Intune and device compliance
**Depends on:** Business Premium or a developer tenant.
**Build:** enrol the Windows 11 client, create a compliance policy (BitLocker, firewall, minimum OS), a configuration profile, and a conditional access policy that blocks non-compliant devices.
**Proves:** you can answer "why can't this laptop get email?" — a compliance failure, not a password problem.

### 11. A PowerShell toolkit with tests
**Build:** turn your provisioning script into a small module: `New-LabUser`, `Disable-LabUser`, `Get-LabAccessReport`, each with comment-based help, `-WhatIf` support, a log file, and **Pester tests**.
**Proves:** you write code someone else could run safely. This is how juniors get noticed by engineers.
**Evidence:** the module in git with a passing test run.

### 12. Access review evidence loop
**Build:** a scheduled job that snapshots privileged group membership daily, joins it against HR termination dates, flags unattributed grants, and writes a quarterly pack with coverage and limitations.
**Proves:** you can produce audit evidence as a by-product of operations, not as a quarterly panic. This directly operationalises Project 07.
**Interview probe:** "How would you prove access was appropriate in March?" — you have a real answer with a script behind it.

### 13. Monitoring and health checks
**Build:** a scheduled health script (DC services, replication, free disk, backup status, expiring certificates, accounts with old passwords) that emails a daily summary and alerts on failure. Add a simple dashboard if you want (Grafana + a text file is enough).
**Proves:** you know a control that nobody monitors is a control that will fail quietly.

### 14. Hardening baseline and tiering
**Build:** apply a CIS Level 1 subset, with exceptions documented per Project 08 (owner, expiry, compensating control). Split admin accounts by tier. Restrict interactive logon on the DC.
**Proves:** you can apply a benchmark *and* explain what you could not apply. Most people can only do the first.

### 15. Security operations basics
**Build:** Sysmon on the client and DC, log forwarding to Wazuh (free) or Splunk Free, then detect four things: password spray (4625 pattern), new Domain Admin added (4728), service account logon from a workstation (4624 type 3 with a service account), and a new scheduled task.
**Proves:** you can do more than manage accounts — you can see abuse.
**Interview probe:** "How would you notice if a help desk account was compromised?" — you have a rule, not an opinion.

### 16. Break/fix drills, second set — incident style
**Build:** run five drills with a person acting as an angry user, on a timer, with no notes, while narrating. One of them should be a phishing report where credentials were entered.
**Proves:** pressure performance, which is what the job actually is.

---

## Sequencing: what to do if you can only do five

| Priority | Build | Reason |
|---|---|---|
| 1 | Break/fix drills (#6) | The only item that maps directly to daily work |
| 2 | Delegation + LAPS (#1, #2) | Closes the biggest security gap in your own lab |
| 3 | Entra ID + M365 (#7) | The gap between your profile and the market |
| 4 | Ticketing system (#4) | You cannot claim service desk experience without one |
| 5 | Backup and restore (#3) | The question you currently cannot answer |

Everything else can follow employment.

---

## Evidence discipline (applies to all sixteen)

| Rule | Why |
|---|---|
| Capture **command output**, not just screenshots | Text survives, screenshots are unverifiable and age badly |
| Include the date and the host in every capture | An untimestamped screenshot is not evidence |
| Keep a `lab-notes/` folder per build with what broke | The failures are the interesting part |
| Sanitise before publishing | Never publish a real tenant, a real domain name, or a real user's data — in a lab of your own it is fine, but build the habit now |
| One build = one ticket or one KB article | No output, no claim |
| Version changes as git commits | "What did I change and when" answered by `git log` |

---

## What this roadmap is not

It is not a curriculum to finish. It is a queue ordered by **employer value per hour**. When you get a job, the queue changes — real incidents will reorder it, and that is the point. The roadmap's job is to make sure you are never choosing between "learn something" and "learn something useful".

If you complete items 1–8 and get hired, you are on schedule. If you complete all sixteen and are still unemployed, the problem was never the lab.
