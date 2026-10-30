# Onboarding and Offboarding Checklists

Two workflows a service desk runs more than any other — and the two where mistakes are most visible and most permanent.

**Test both end to end before you claim them.** Create a real test user, onboard them fully, log in as them, then offboard them and verify every item.

---

# Part 1 — Onboarding

## Ticket header
| Field | Value |
|-------|-------|
| Ticket ID | SD-___ |
| Start date | |
| Department / OU | |
| Line manager | |
| Approved by | |
| Equipment | Laptop / Desktop / Both — asset tag: |
| Due | *(before the start date, not on it)* |

## Approval and identity
- [ ] Manager has approved the request in writing
- [ ] Role confirmed (this determines group membership, not the person's preference)
- [ ] Start date confirmed
- [ ] Any special requirements recorded (software licence, mobile, remote access)

## Account creation
- [ ] Username follows convention (`firstinitial + surname` or as documented)
- [ ] UPN set to the domain namespace
- [ ] Created directly in the correct departmental OU, **not** in the default Users container
- [ ] Temporary password generated and delivered out-of-band (not email to a personal address)
- [ ] "User must change password at next logon" enforced
- [ ] Account enabled on the correct date, not before unless approved

```powershell
New-ADUser -Name "Priya Nair" -SamAccountName "pnair" -UserPrincipalName "pnair@Vusi.lab" `
  -Path "OU=Finance,DC=Vusi,DC=lab" `
  -AccountPassword (Read-Host -AsSecureString "Temp password") `
  -Enabled $true -ChangePasswordAtLogon $true
```

## Access and permissioning
- [ ] Added to the departmental security group only
- [ ] Any additional access requested separately, approved by the data owner
- [ ] No access granted "just in case"
- [ ] Drive mappings resolve (test as the user)
- [ ] Departmental share accessible; a share they should *not* access is confirmed denied

```powershell
Add-ADGroupMember -Identity "Finance_Group" -Members "pnair"
Get-ADPrincipalGroupMembership pnair | Select-Object Name
```

## Device
- [ ] Machine imaged / prepared
- [ ] Joined to the domain
- [ ] Computer object in `OU=Workstations`
- [ ] Local admin password managed (LAPS applied and verified)
- [ ] Encryption enabled and recovery key escrowed
- [ ] Asset tag recorded against the user

## Verify as the user — the step that gets skipped
- [ ] Logged in successfully as the new user on the assigned device
- [ ] Password change prompt appeared and was completed
- [ ] Drive mappings present
- [ ] Share access works
- [ ] Standard policies applied (banner, wallpaper, restrictions) — `gpresult /r`
- [ ] Email / collaboration account available, if applicable

## Close-out
- [ ] User / manager informed it is ready, with what to expect at first logon
- [ ] Ticket closed with checklist attached
- [ ] Ticked items reflect what was *verified*, not what was attempted

**Sign-off:** completed by ___ · verified by ___ · date ___

---

# Part 2 — Offboarding

## Ticket header
| Field | Value |
|-------|-------|
| Ticket ID | SD-___ |
| Person | |
| Last working day | |
| Access removal deadline | *(end of last working day — this is the number an auditor asks for)* |
| Approved by | *(manager or HR — must be recorded)* |
| Reason | Resignation / Dismissal / Contract end / Transfer |
| Equipment to recover | |

> **Rule:** never act on a verbal request alone. Get the approval in the ticket. An offboarding done on a phone call is an offboarding with no evidence.

## Immediately at the deadline
- [ ] Account disabled (not deleted)
- [ ] Sessions terminated / devices signed out
- [ ] All group memberships removed except `Domain Users`
- [ ] Object moved to `OU=Disabled`
- [ ] Password reset to a random unknown value (removes any cached credential)

```powershell
Disable-ADAccount -Identity "pnair"
Get-ADPrincipalGroupMembership pnair | Where-Object Name -ne "Domain Users" |
  ForEach-Object { Remove-ADGroupMember -Identity $_.Name -Members pnair -Confirm:$false }
Move-ADObject -Identity (Get-ADUser pnair).DistinguishedName -TargetPath "OU=Disabled,DC=Vusi,DC=lab"
$tmp = -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 20 | ForEach-Object { [char]$_ })
Set-ADAccountPassword -Identity pnair -Reset -NewPassword (ConvertTo-SecureString $tmp -AsPlainText -Force)
```

## Access inventory — check every one, do not assume
- [ ] File shares and departmental folders
- [ ] Email: mailbox retained / delegated / forwarded? *(decision recorded, with who approved forwarding)*
- [ ] Distribution groups and shared mailboxes
- [ ] Applications with their own accounts (this is where leavers survive)
- [ ] VPN / remote access certificates
- [ ] Local admin rights on any device
- [ ] Cloud services and SaaS (if applicable)
- [ ] Physical access: door tags, keys, lockers
- [ ] Shared credentials they were a custodian of — rotate them

## Devices and data
- [ ] Laptop and peripherals recovered and logged
- [ ] Device wiped or re-imaged before reassignment
- [ ] Data owned by the user transferred to the manager (with a record of what was transferred)
- [ ] Encrypted device recovery keys retained until wipe is confirmed

## Records
- [ ] Time access was removed recorded (this is the SLA evidence)
- [ ] Retention period noted: disabled account kept for ___ days, deletion scheduled for ___ (never delete on the day unless policy says so)
- [ ] Mailbox retention and legal hold considered
- [ ] Line manager notified of completion

## Verification
- [ ] Confirm the account cannot authenticate (attempt a logon and record the failure)
- [ ] Confirm the user no longer appears in share access lists
- [ ] Confirm no active sessions or open VPN connections

**Sign-off:** removed by ___ · verified by ___ · timestamp ___

---

## Why both checklists matter

| Onboarding failure | Consequence |
|--------------------|-------------|
| Account in the default Users container | No policy applies; the user complains for a week |
| Temporary password emailed to a personal address | Credential exposure, no audit trail |
| Group membership granted "just in case" | Excess access that never gets reviewed |
| Never tested as the user | Day-one ticket, unhappy manager, and you look unprepared |

| Offboarding failure | Consequence |
|---------------------|-------------|
| Disabled but groups left intact | Access returns the moment the account is re-enabled |
| Application accounts not checked | A live credential to departmental data, indefinitely |
| No timestamp | Cannot prove the SLA was met, in an audit or an incident review |
| Deleted immediately | Lost SID, broken file ownership and audit history |

A service desk is judged on the second column more than the first.
