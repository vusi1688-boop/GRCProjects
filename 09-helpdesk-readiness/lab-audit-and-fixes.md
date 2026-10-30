# Lab Audit: Vusi.lab Reviewed as a Service Desk Would Find It

**Purpose:** a written review of the three-day lab build, from the perspective of someone joining as support. Every finding is something you can speak to in an interview, and every "Fix" is something you can do in under an hour.

**Rule for this document:** findings are ranked by what they say about your *judgment*, not by how hard they are to fix. A typo in an OU name is harmless. An over-privileged account is not.

---

## Summary

| # | Finding | Severity | Time to fix | Interview value |
|---|---------|----------|-------------|-----------------|
| 1 | Domain Admin granted to enable RSAT | **Critical** | 20 min | Highest |
| 2 | No separate administrative account | High | 15 min | High |
| 3 | Domain Users has Modify on all of `C:\CompanyData` | High | 30 min | High |
| 4 | No AD Recycle Bin | High | 5 min | Medium |
| 5 | No backup of the domain controller | High | 45 min | Medium |
| 6 | Restrict-Control-Panel GPO linked at domain root | Medium | 20 min | High |
| 7 | No local administrator password management (LAPS) | Medium | 40 min | High |
| 8 | Account lockout threshold is unset (0 = never) | Medium | 10 min | Medium |
| 9 | OU typo (`Finanace`) and no Computers/Groups structure | Low | 10 min | Low |
| 10 | No reverse lookup zone; DNS scavenging not enabled | Low | 15 min | Medium |
| 11 | No VM snapshot before each change | Medium | 2 min | Medium |
| 12 | Provisioning script has no error handling or logging | Medium | 30 min | High |
| 13 | No change record for privileged actions | Medium | ongoing | High |
| 14 | Single DC, no monitoring, no time-source check | Medium | 30 min | Low |

---

## 1. Domain Admin granted to enable RSAT — Critical

**What happened:** John Doe, a standard user, was added to Domain Admins so that Active Directory Users and Computers could be opened from the Windows 11 client.

**Why it is wrong:** two separate requirements were conflated.

| Requirement | What it actually needs |
|-------------|------------------------|
| Install RSAT on Windows 11 | **Local administrator** on the workstation (or an elevated install via your own admin rights) |
| Manage AD objects remotely | **Delegated permissions** in AD for the specific objects and tasks |

Neither requires Domain Admin. Domain Admin is Tier 0: it can change any object in the domain, reset any password including other admins', and modify the directory's own security. A help desk account holding it means every phishing email sent to that person is a domain compromise.

This is exactly the failure in [Project 06](../06-ad-tiered-administration/) — one of the twelve standing Domain Admins that a pentest flags. You have now seen it from the inside, which is worth more in an interview than any definition.

**Fix — remove the membership:**

```powershell
# On DC-01, in an elevated PowerShell session
Get-ADGroupMember -Identity "Domain Admins" | Select-Object Name, SamAccountName
Remove-ADGroupMember -Identity "Domain Admins" -Members "John" -Confirm:$false
```

**Fix — delegate what the help desk actually needs:** use **Active Directory Users and Computers → right-click the OU → Delegate Control**, and grant `HelpDesk_Group` only:

- Reset user passwords and force password change at next logon
- Read all user information
- (Optionally) Modify the membership of a group

Do not delegate at the domain root. Scope it to the OUs the help desk supports.

**Verify the delegation is narrow:**

```powershell
(Get-Acl "AD:OU=HR,DC=Vusi,DC=lab").Access |
  Format-Table IdentityReference, ActiveDirectoryRights, AccessControlType -AutoSize
```

**Evidence to capture:** before/after screenshot of `Get-ADGroupMember "Domain Admins"`, plus the `Get-Acl` output showing only the two rights you granted.

**The sentence for your interview:** *"I initially over-privileged a test account to get RSAT working. I corrected it to delegated password-reset rights scoped to one OU, because RSAT needs local admin on the workstation and delegation in AD — not Domain Admin. Leaving it would have made every help desk login a domain-level risk."*

---

## 2. No separate administrative account — High

**What happened:** John uses one account for email, browsing and administration.

**Why it matters:** credential theft. A single account that can both read a phishing email and reset domain passwords is one click from compromise. The standard fix is an everyday account plus a separate admin account, used only for admin tasks.

**Fix:**

```powershell
New-ADUser -Name "John Doe (Admin)" -SamAccountName "a-john" `
  -UserPrincipalName "a-john@Vusi.lab" `
  -Path "OU=IT,DC=Vusi,DC=lab" `
  -AccountPassword (Read-Host -AsSecureString "Admin password") `
  -Enabled $true -ChangePasswordAtLogon $true

Add-ADGroupMember -Identity "HelpDesk_Group" -Members "a-john"
```

Then log off `John`, log on as `a-john` for admin work only, and note the habit in your lab notes: *"no admin tasks from the daily account."*

**Evidence:** two accounts, one group membership each, and a written note explaining the split.

---

## 3. Domain Users has Modify on all of `C:\CompanyData` — High

**What happened:** `Domain Users` was granted Modify on the share root; HR-specific data was then correctly restricted in `C:\HR_Data`.

**What is right about it:** using **share = Everyone/Full Control plus NTFS to control access** is Microsoft's documented model. It is not a mistake. What *is* a mistake is leaving it undefended in an interview — if you cannot explain why, it reads as carelessness.

**What is actually wrong:** a single flat `CompanyData` root where every employee can modify every file means one user can delete or encrypt another department's work. There is also no backup, so "modify" effectively includes "destroy".

**Fix — read-only root, write access through groups:**

```powershell
# Inspect first. Never change permissions you have not looked at.
icacls C:\CompanyData

# Remove the broad inherited-style grant, then re-add read-only at the root
icacls C:\CompanyData /remove:g "VUSI\Domain Users"
icacls C:\CompanyData /grant "VUSI\Domain Users:(OI)(CI)(RX)"

# Department write access by group only
icacls C:\CompanyData\HR /grant "VUSI\HR_Group:(OI)(CI)(M)"
icacls C:\CompanyData\IT /grant "VUSI\IT_Group:(OI)(CI)(M)"
```

Then re-test with Jane and John and record both outcomes.

**Evidence:** `icacls` output before and after, plus the access test for each user.

---

## 4. No AD Recycle Bin — High

**The help desk scenario:** a manager asks you to delete a leaver's account. You delete the wrong one. Without the Recycle Bin, restoring means an authoritative restore from backup — if a backup exists.

**Fix:**

```powershell
Get-ADOptionalFeature -Filter 'Name -eq "Recycle Bin Feature"'

Enable-ADOptionalFeature -Identity 'CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=Vusi,DC=lab' `
  -Scope ForestOrConfigurationSet -Target "Vusi.lab"
```

This is a one-way change and must be done before you need it.

**Evidence:** `EnabledScopes` populated in the `Get-ADOptionalFeature` output.

---

## 5. No backup of the domain controller — High

**Why it matters:** everything in this lab lives in one `ntds.dit`. Corruption, a bad change, or an accidental deletion ends the lab.

**Fix:**

```powershell
Install-WindowsFeature Windows-Server-Backup
wbadmin start systemstatebackup -backupTarget:E: -quiet
```

Then restore it once. A backup you have never restored is a hope, not a backup — and "I tested the restore" is a sentence very few junior candidates can say.

**Also:** take a hypervisor snapshot before each risky change, and name it with the date and reason.

---

## 6. Restrict-Control-Panel GPO linked at the domain root — Medium

**What happened:** the policy that hides the Control Panel was linked at the domain level, so it applies to everyone including IT.

**Why it matters:** three separate lessons, each a common interview question.

1. **Link where the setting should apply.** Link to `OU=Users` or the departmental OUs, not the domain.
2. **Exclusions need security filtering or WMI filters**, not a new GPO. Remove `Authenticated Users` from the scope, add the group that should receive it.
3. **IT staff will always need exceptions.** A policy that blocks an admin from Control Panel will be worked around, not obeyed.

**Verify what actually applied, which is the skill:**

```powershell
gpresult /r
gpresult /h C:\Temp\gpresult.html
```

**The help desk ticket this generates:** *"I can't open Control Panel."* First question: is it one user or the whole department? Second: which GPO is applying? Third: is this an intended restriction or a broken link? That is a two-minute ticket instead of a twenty-minute one.

---

## 7. No local administrator password management — Medium

**Why it matters:** every Windows install in the lab shares the same local admin password, and every domain-joined machine had the same one at build time. If one endpoint's local admin credential leaks, every endpoint is exposed.

**Fix — Windows LAPS (built into Server 2022 / Windows 11, April 2023 updates onward):**

```powershell
# On the DC, once: extend schema and grant the managing group rights
Update-LapsADSchema
Set-LapsADReadPasswordPermission -Identity "OU=Workstations,DC=Vusi,DC=lab" -AllowedPrincipals "VUSI\HelpDesk_Group"
Set-LapsADResetPasswordPermission -Identity "OU=Workstations,DC=Vusi,DC=lab" -AllowedPrincipals "VUSI\HelpDesk_Group"
```

Then retrieve a password as the help desk would:

```powershell
Get-LapsADPassword -Identity "WIN11_working" -AsPlainText
```

**This is a daily help desk task**, and being able to say "we manage local admin passwords with LAPS, and the help desk can read one on request with an audit trail" is a strong answer.

---

## 8. Account lockout threshold is unset — Medium

**Check the current state:**

```powershell
Get-ADDefaultDomainPasswordPolicy
```

If `LockoutThreshold` is `0`, accounts never lock — which is why you have never received a lockout ticket. Real environments lock at 5–10 attempts, and the service desk gets several a day.

**Fix (lab-appropriate):**

```powershell
Set-ADDefaultDomainPasswordPolicy -Identity Vusi.lab `
  -LockoutThreshold 5 -LockoutDuration 00:15:00 -LockoutObservationWindow 00:15:00
```

Then deliberately lock an account by entering a wrong password five times, and work the ticket: unlock with `Unlock-ADAccount`, verify identity, and explain to the "user" why it happened.

**Interview relevance:** lockout tickets are the single most common first-line request. Having a real one in your log matters.

---

## 9. OU typo and missing structure — Low

`OU=Finanace` is a typo. It is harmless technically and mildly damaging professionally — it is the kind of thing that appears in a screenshot.

**Fix:**

```powershell
Rename-ADObject -Identity "OU=Finanace,DC=Vusi,DC=lab" -NewName "Finance"
```

**Structure to add while you are there:**

```text
DC=Vusi,DC=lab
├── OU=Users
│   ├── OU=HR
│   ├── OU=IT
│   └── OU=Finance
├── OU=Computers
│   └── OU=Workstations
├── OU=Groups
│   ├── OU=Security
│   └── OU=Distribution
├── OU=ServiceAccounts
└── OU=Disabled
```

Separating users from computers from groups is what makes GPO targeting and delegation possible later. **Move disabled accounts to `OU=Disabled`** rather than leaving them in place — it keeps them visible to the offboarding process and out of the way of every group policy.

---

## 10. DNS hygiene — Low, but high interview value

**Findings:**

- Only a forward lookup zone exists; a reverse zone is missing, so `nslookup 10.0.0.10` fails
- Scavenging is not enabled, so stale records will accumulate — and stale records cause exactly the "server not found" tickets you will be handling

**Check and fix:**

```powershell
Get-DnsServerZone
Get-DnsClientServerAddress -AddressFamily IPv4     # client must point at DC-01 only
Get-DnsServerZoneAging -ZoneName "vusi.lab"
Set-DnsServerScavenging -ScavengingState $true -ScavengingInterval 7.00:00:00
```

**The rule to remember:** a domain-joined machine must use the domain controller for DNS. Pointing a client at a public resolver breaks AD because public DNS knows nothing about `vusi.lab`. This single sentence answers a large share of first-line interview questions.

**Your pending test, interpreted:**

```
> nslookup intranet.vusi.lab

Server:  DC-01.vusi.lab
Address: 10.0.0.10        ← the resolver being asked (must be DC-01)

Name:    intranet.vusi.lab
Address: 10.0.0.10        ← the A record you created
```

| Symptom | Most likely cause | First action |
|---------|-------------------|--------------|
| `Non-existent domain` | Record missing, or client using the wrong DNS server | `Get-DnsClientServerAddress`; check the A record exists |
| `DNS request timed out` | Client cannot reach DC-01 on UDP 53 | `Test-NetConnection DC-01 -Port 53`; check firewall |
| Correct name, wrong IP | Stale or duplicate record | Check for a second A record; enable scavenging |
| Works on DC, fails on client | Client DNS points at a public resolver | Set the client's DNS to DC-01's IP |

---

## 11. No snapshot before changes — Medium

Not a technical control, but the reason a lab survives. Snapshot before: schema changes, permission changes, GPO linking at domain level, and anything involving `Remove-`.

Name snapshots `2026-10-30_before-laps-schema` so you can prove what you were doing and when.

---

## 12. Provisioning script has no error handling or logging — Medium

**What you have:** a working batch creation script. **What it does not do:** tell you when it fails.

If user 3 of 5 fails, the loop continues and you believe you created five accounts. That is how a real onboarding ticket becomes "the new starter has no account" on day one.

**Fix — one user at a time, logged:**

```powershell
$users = Import-Csv .\new-hires.csv
$log   = ".\provisioning-$(Get-Date -Format yyyyMMdd).log"

foreach ($u in $users) {
    try {
        New-ADUser -Name $u.Name -SamAccountName $u.Sam -Path $u.OU `
            -AccountPassword (ConvertTo-SecureString $u.TempPassword -AsPlainText -Force) `
            -Enabled $true -ChangePasswordAtLogon $true `
            -ErrorAction Stop
        Add-ADGroupMember -Identity $u.Group -Members $u.Sam -ErrorAction Stop
        "$(Get-Date -Format s) OK   $($u.Sam)" | Out-File $log -Append
    }
    catch {
        "$(Get-Date -Format s) FAIL $($u.Sam) — $($_.Exception.Message)" | Out-File $log -Append
    }
}
```

**Two more judgment points worth mentioning in an interview:**

1. **Do not store temporary passwords in a CSV that lives in the repo or on a share.** Generate them, deliver them out-of-band, force change at first logon. The script above does this only for lab convenience.
2. **A script is the wrong tool for one user.** It is the right tool for a batch, a repeatable process, and anything that must be logged. Knowing when *not* to automate is a senior-sounding answer from a junior candidate.

---

## 13. No change record for privileged actions — Medium

You promoted a user to Domain Admin, changed file permissions and linked a GPO. None of it is recorded anywhere but in chat history.

For a lab, a simple change log is enough — the same four fields a service desk uses:

| Field | Example |
|-------|---------|
| What changed | Removed John from Domain Admins |
| Why | Over-privileged; RSAT needs delegation, not DA |
| Rollback | `Add-ADGroupMember -Identity "Domain Admins" -Members John` |
| Verified by | John can still reset passwords in OU=HR via delegated rights |

Put it in `09-helpdesk-readiness/change-log.md`. Four lines per change. It takes two minutes and it is the difference between "I built things" and "I operated an environment".

---

## 14. Single DC, no monitoring, no time check — Medium

**The Kerberos connection:** domain authentication fails if the client's clock is more than 5 minutes out. Time sync is a real first-line ticket, and almost no junior candidate knows it.

```powershell
w32tm /query /status        # on the DC
w32tm /resync               # on a client that has drifted
Get-Service w32time | Select-Object Status
```

**The monitoring point:** you have no idea the DC is healthy until something breaks. Even a scheduled task writing `dcdiag /test:replications` and free disk space to a text file is enough to have an answer for "how do you know the domain is up?"

---

## What to do with this document

1. **Do findings 1, 2 and 4 today.** They take under 45 minutes and they change how you talk about the lab.
2. **Screenshot the before and after** of each, and put both in your evidence folder.
3. **Write the interview answer for finding 1 in your own words** — not mine. It has to sound like you.
4. **Add the rest to `PROGRESS.md`** and work them across the 30 days.

You are not being marked on a clean lab. You are being marked on whether you can look at your own work and say what is wrong with it. That is the whole job.
