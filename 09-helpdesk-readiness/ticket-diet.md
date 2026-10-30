# The Ticket Diet: 16 Tickets to Work Before You Apply

Sixteen tickets, all reproducible in `Vusi.lab`, chosen because they are the requests a first-line analyst actually receives. Work them in order — the first four need nothing you do not already have.

**Rules of engagement**

1. **Write the ticket first, as a user would.** Not "test drive mapping" but *"Hi, my Z drive isn't showing up since this morning, can you help? — Jane"*. Working from a vague report is the skill.
2. **Record what you got wrong.** Every ticket has a field for your first hypothesis and whether it was right. This is the most valuable column in the log.
3. **Time yourself.** Not to be fast — to be able to say "first response 10 minutes, resolved in 35" in an interview.
4. **Two tickets must be closed as "not a fault".** Real queues contain them, and how you handle them matters more than how you fix things.

---

## T-01 · Password reset with forced change

**Type / Priority:** Request / P3
**User says:** *"I've forgotten my password, I'm locked out of everything."*
**Scope:** one user.
**Steps:** verify identity before anything (in a lab, note what you *would* ask: employee number, manager name, callback to a known number — never the caller's own). Reset, force change at next logon, confirm the user can log in, and tell them to expect the prompt.

```powershell
Set-ADAccountPassword -Identity "Jane" -Reset `
  -NewPassword (Read-Host -AsSecureString "Temporary password")
Set-ADUser -Identity "Jane" -ChangePasswordAtLogon $true
```

**Confirm:** sign in on Win11_working as Jane; the change prompt must appear before the desktop.
**Ticket note:** identity verified by [method]; temporary password issued out-of-band; user changed at first logon.
**Interview point:** *"The reset is thirty seconds. The verification is the job."*

---

## T-02 · Account lockout

**Type / Priority:** Incident / P3 (P1 if a whole team is locked out)
**User says:** *"It says my account is locked and to contact the administrator."*
**Setup:** you need [finding 8](./lab-audit-and-fixes.md#8-account-lockout-threshold-is-unset--medium) done first, or this ticket cannot exist.

```powershell
Unlock-ADAccount -Identity "Jane"
# find where the bad attempts came from — this is the part that prevents a repeat
Get-WinEvent -ComputerName DC-01 -FilterHashtable @{LogName='Security'; Id=4740} -MaxEvents 5 |
  Select-Object TimeCreated, @{n='Account';e={$_.Properties[0].Value}}, @{n='Source';e={$_.Properties[1].Value}}
```

**Root cause matters:** a mapped drive reconnecting with an old password, a phone still trying the previous credential, or a service account are the usual culprits. Unlocking without finding the source guarantees the same ticket tomorrow.
**Interview point:** *"I don't just unlock. I find what is still using the old password, or I'll see the same ticket again tomorrow."*

---

## T-03 · Mapped drive Z: missing

**Type / Priority:** Incident / P2 if a department, P3 if one user
**User says:** *"My Z drive has disappeared. I can't get to my files."*
**Reproduce:** log on as the affected user on Win11_working. Check whether the drive exists but is disconnected, or never mapped.
**Hypotheses, cheapest first:**

1. GPO not applying (security filtering, link disabled, wrong OU) → `gpresult /r` shows *Applied GPOs*
2. Drive Maps preference needs the **user** to have read access to the GPO; if `Authenticated Users` was removed for filtering, the **computer** still needs read on the GPO object
3. Path wrong or share offline → `Test-Path \\DC-01\CompanyData`
4. Slow link / item-level targeting filtered the user out
5. Persistent drive deleted from the user's profile

```powershell
gpresult /r /scope:user
Get-GpoReport -Name "Map Z Drive" -ReportType Html -Path C:\Temp\z.html
Test-Path \\DC-01\CompanyData
net use Z: \\DC-01\CompanyData
```

**Also worth knowing:** a drive map is a **user** policy. Link it to the OU where users live, not where computers live — a very common lab mistake and a good thing to say out loud.
**Interview point:** *"Group Policy is the first place I look, and `gpresult /r` before I change anything — otherwise I'm guessing."*

---

## T-04 · Access denied on a departmental share

**Type / Priority:** Incident / P3 (or a request if access is legitimately needed)
**User says:** *"I get Access Denied on HR_Data. I'm supposed to have access."*
**This is a deliberate test in your lab** — John is in IT_Group and must be denied.

**Method — always rule out the token first:**

1. Was the user added to the group **after** they logged on? Group membership is baked into the logon token. The fix is log off and back on, not a permission change. This single fact resolves more "the permission didn't work" tickets than anything else.
2. Check effective group membership: `whoami /groups | findstr HR_Group`
3. Check NTFS: `icacls C:\HR_Data`
4. Check share permissions, which are evaluated *with* NTFS — most restrictive wins
5. Only then decide whether the denial is correct

```powershell
Get-ADPrincipalGroupMembership -Identity John | Select-Object Name
icacls C:\HR_Data
Get-SmbShareAccess -Name HR_Data
```

**Correct outcome for John:** denied, and you tell him to raise an access request with his manager. That is a *resolved* ticket, not a failure.
**Interview point:** *"Two of these are usually a token refresh, the third is a legitimate denial. All three end with the user knowing why."*

---

## T-05 · New starter onboarding

**Type / Priority:** Request / P3 (P1 if it is day one and they cannot work)
**User says:** *"Priya Nair starts Monday in Finance. Needs an account, email, Z: drive and access to the finance share."*
**Work the [onboarding checklist](./templates/onboarding-offboarding-checklist.md)** end to end against a real test user. Then close the ticket with the checklist attached.
**The part juniors miss:** confirm the *manager* approves group access, and confirm the user can actually log in before Monday. An account that exists but cannot authenticate is not onboarding.
**Interview point:** *"I don't close onboarding until I've logged in as the new user and seen their drive and share."*

---

## T-06 · Leaver offboarding

**Type / Priority:** Request / P2 — always time-bound to the person's last working hour
**User says:** *"Bob Green left today. Please remove access."*
**The failure this prevents:** the 41-day leaver in [Project 07](../07-ad-access-review-evidence/) who kept privileged access because the ticket said "disable" and nobody checked groups.

**Do the whole thing, in this order:** disable (not delete) → remove group memberships → move to `OU=Disabled` → document mailbox/forwarding decision → note the named person who approved → record the time access was removed.

```powershell
Disable-ADAccount -Identity "Bob"
Get-ADPrincipalGroupMembership -Identity Bob |
  Where-Object Name -ne "Domain Users" |
  ForEach-Object { Remove-ADGroupMember -Identity $_.Name -Members Bob -Confirm:$false }
Move-ADObject -Identity (Get-ADUser Bob).DistinguishedName -TargetPath "OU=Disabled,DC=Vusi,DC=lab"
```

**Why disable and not delete:** the SID must survive for mailbox delegation, file ownership and audit history. Delete after the retention period, not before.
**Evidence:** timestamped before/after of group membership, and the approval.
**Interview point:** *"Disabling is one step. Groups, drive access, mail delegation and VPN are the other four, and the timestamp matters because it's the number auditors ask for."*

---

## T-07 · Department transfer

**Type / Priority:** Request / P3
**User says:** *"Jane Smith is moving from HR to Finance from the 1st."*
**Why this ticket is harder than it looks:** it is an offboarding *and* an onboarding. Moving the OU alone changes policy, not permissions.
**Do:** move the user object → remove `HR_Group` → add `Finance_Group` → verify no residual HR access → have the user log off and on → confirm the new drive/share works and the old one does not.
**The question to ask before closing:** *"Did you remove the old access, or just add the new?"* Excessive access accumulates exactly this way.
**Interview point:** *"Transfers are where people end up with two departments' access. The removal is the part I document."*

---

## T-08 · Printer will not print

**Type / Priority:** Incident / P3 (P1 if an office or a print room is down)
**User says:** *"Nothing is printing."*
**Ask the boring questions first, in this order — this is what separates a method from a guess:**

1. Is it one user, one printer, or everyone?
2. Is the printer powered on and showing an error? (Paper, toner, jam. Yes, really. Ask.)
3. Is the job stuck in the queue on their machine or on the server?
4. Does printing work from another machine?

```powershell
Get-Service Spooler | Select-Object Status, StartType
Restart-Service Spooler -Force
Get-PrintJob -PrinterName "Finance-HP"
Remove-PrintJob -PrinterName "Finance-HP" -ID 12
```

**Also relevant:** [Project 06](../06-ad-tiered-administration/) recommends disabling the Print Spooler service on domain controllers. If you find yourself restarting the spooler *on DC-01*, you have found the reason.
**Interview point:** *"I check the physical printer before I check the driver. Users say 'nothing is printing' when the answer is paper."*

---

## T-09 · "The server can't be found"

**Type / Priority:** Incident / P2 if multiple users, P3 if one
**User says:** *"It says the network path was not found."*
**This is a DNS ticket nine times out of ten.** The method:

```powershell
Get-DnsClientServerAddress -AddressFamily IPv4      # must be DC-01 only
ipconfig /flushdns
Resolve-DnsName DC-01.vusi.lab
Test-NetConnection DC-01 -Port 445
```

If `ping DC-01` works by IP but not by name, it is DNS. If it fails by IP, it is network. If name resolution works but the share fails, it is the share or the firewall — check `Get-SmbShare`.
**Interview point:** *"If it works by IP and not by name, it's DNS. That's usually my first split."*

---

## T-10 · Slow logon

**Type / Priority:** Problem / P3
**User says:** *"Logging in takes five minutes in the morning."*
**Measure before you theorise:**

```powershell
gpresult /r
Get-WinEvent -LogName "Microsoft-Windows-GroupPolicy/Operational" -MaxEvents 20
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7000,7009,7011} -MaxEvents 10
```

**Usual causes:** a mapped drive pointing at an unreachable host and timing out, too many GPOs, DNS pointing at a resolver that does not know the domain, or an offline profile index. Slow logon is almost always something *waiting*, and the fix is removing the wait, not adding hardware.
**Interview point:** *"Slow logon is a timeout, not a performance problem. I find what's timing out."*

---

## T-11 · Software installation request

**Type / Priority:** Request / P3
**User says:** *"I need Visio installed for a project."*
**The judgment being tested:** is this approved, licensed, and safe? Installation is the easy part.
**Process:** confirm manager approval → confirm licence availability → confirm the version is supported on the build → install → confirm it launches under the user's account (an install completed as admin can still fail for a standard user) → record the licence.
**Interview point:** *"I check the licence and the approval before the download. Installing unlicensed software is a compliance problem I don't want to own."*

---

## T-12 · "Control Panel is blocked"

**Type / Priority:** Incident / P3
**User says:** *"I can't open Control Panel. It says it's been restricted by my administrator."*
**The answer may be "that is intentional".** First establish whether this user should be restricted: if they are in IT, the domain-root GPO from [finding 6](./lab-audit-and-fixes.md#6-restrict-control-panel-gpo-linked-at-the-domain-root--medium) is over-applying.

```powershell
gpresult /r /scope:user | Select-String -Pattern "Control Panel"
Get-GPOReport -Name "Restrict Control Panel" -ReportType Html -Path C:\Temp\gpo.html
```

**Correct ticket outcome for an IT user:** policy re-scoped so it applies to standard users only, and the user told what changed. **Correct outcome for a standard user:** confirm the restriction, explain the reason, offer the supported route (raise a request for the change they wanted to make).
**Interview point:** *"Some tickets are resolved by explaining a control rather than removing it."*

---

## T-13 · "The trust relationship between this workstation and the primary domain failed"

**Type / Priority:** Incident / P2
**User says:** *"I can't log in with my domain password. It worked yesterday."*
**Causes:** the computer account's password on the machine and in AD are out of step — usually a restored snapshot, a reverted VM, or a long absence from the network.

```powershell
Test-ComputerSecureChannel -Verbose          # False = broken
Test-ComputerSecureChannel -Repair -Credential (Get-Credential)
# if repair fails, rejoin
Reset-ComputerMachinePassword -Credential (Get-Credential)
```

**Avoid the rejoin as a first move:** rejoining loses the existing computer SID and its group memberships. Repair first, rejoin second, and record which one you did.
**Interview point:** *"Repair before rejoin, because rejoining changes the computer's identity and you lose its group membership."*

---

## T-14 · New PC build and domain join

**Type / Priority:** Request / P3
**Steps:** set a meaningful computer name → join the domain → **place the computer object in `OU=Workstations`, not the default `Computers` container** (the default container cannot receive group policy properly) → verify LAPS is applied → log in as the user → verify drive, wallpaper and banner policies → add the device to the asset register.
**Interview point:** *"Computers dropped in the default Computers container don't get your policies. It's a two-second mistake with a twenty-minute symptom."*

---

## T-15 · Shared mailbox / delegated access

**Type / Priority:** Request / P3
**User says:** *"I need access to the finance team's shared inbox."*
**The governance point:** access to a shared mailbox is access to *other people's* data. It needs manager approval and a recorded decision, not just a tick.
**Do:** confirm approval → grant read or full access (least privilege — read if read is enough) → confirm in the user's client → record who approved and when → note that this must be reviewed at offboarding.
**In your lab:** reproduce the pattern with a file share or a distribution group if you have no mail server, and explain the cloud equivalent in the ticket.

---

## T-16 · Suspicious email / phishing report

**Type / Priority:** Incident / P2 — treat as security, never as a nuisance
**User says:** *"I got an email that looks like it's from our bank asking me to log in. I clicked the link."*
**The method is mostly restraint:**

1. **Do not** click again, and tell the user not to forward it internally
2. Capture the sender address, subject, and full headers
3. Establish what the user did: clicked, entered credentials, downloaded
4. If credentials were entered: reset the password, revoke sessions, check for forwarding rules and MFA changes
5. Escalate to security with the evidence, per the escalation matrix
6. Record it — one report is a ticket, five reports of the same message is an incident

**Interview point:** *"My job isn't to scold the user, it's to find out what was exposed and hand security a clean record. The next person who reports the same email is a success, not a nuisance."*

---

## Stretch tickets (optional, if you have time)

| ID | Ticket | What it adds |
|----|--------|--------------|
| S-01 | BitLocker recovery key request | Identity verification under pressure; recording who received a key |
| S-02 | "My password expired while I was on leave" | Explaining policy rather than bending it |
| S-03 | Employee asks for local admin rights | The most common 'no' a service desk has to say well |
| S-04 | Same user reports the same fault a third time | Reopen analysis — the ticket that should have been a problem record |

---

## Your ticket metrics table

Fill this in as you go; quote it in interviews.

| Ticket | Type | Priority | First response (min) | Resolved (min) | Contacts | Escalated | Reopened | First hypothesis correct? |
|--------|------|----------|----------------------|----------------|----------|-----------|----------|---------------------------|
| T-01 | | | | | | | | |
| T-02 | | | | | | | | |
| T-03 | | | | | | | | |
| T-04 | | | | | | | | |
| T-05 | | | | | | | | |
| T-06 | | | | | | | | |
| T-07 | | | | | | | | |
| T-08 | | | | | | | | |
| T-09 | | | | | | | | |
| T-10 | | | | | | | | |
| T-11 | | | | | | | | |
| T-12 | | | | | | | | |
| T-13 | | | | | | | | |
| T-14 | | | | | | | | |
| T-15 | | | | | | | | |
| T-16 | | | | | | | | |
| **Totals** | | | **avg** | **avg** | | | **rate** | **% correct** |

**Two numbers worth more than the rest:**

- **Reopen rate** — a reopened ticket means you fixed the symptom or never confirmed with the user.
- **First-hypothesis accuracy** — a low number is fine and honest; it shows you test cheap hypotheses rather than guessing expensive ones.

---

## What you are actually building

Sixteen tickets is not a demonstration of technical range. It is proof of three things an employer cannot get from a certificate:

1. You can be handed something vague and turn it into a decision.
2. You write things down in a way someone else can follow.
3. When you are wrong, you say so and correct it.

That is what "help desk" means as a job. The rest is lookup.
