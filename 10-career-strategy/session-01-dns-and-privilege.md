# Session 01 — DNS, Privilege, Recycle Bin

**Working material, not a portfolio project.** Do this in the lab, with a terminal open, in one sitting.

> **This is the fast start.** For the full ordered sequence — health check, LAPS, backup and restore, DHCP, file services, GPO discipline, PowerShell, cloud — use [`AD-WALKTHROUGH.md`](./AD-WALKTHROUGH.md). Session 1 of that document contains everything here, plus the health checks that make the rest work.

| | |
|---|---|
| **Time** | 90 minutes, including the evidence capture |
| **Prerequisites** | `Vusi.lab` running, DC-01 powered on, Win11_working logged in as John or Administrator |
| **Produces** | 3 command-output captures, 1 written paragraph, 2 fixed findings |
| **Done when** | You can answer the three questions at the bottom without looking anything up |

---

## Step 0 · Snapshot and open a record (5 min)

Take a hypervisor snapshot of both VMs. Name them `2026-10-30_session01_pre`.

Create your evidence folder on the client, so nothing lives only on the server:

```powershell
mkdir C:\LabEvidence\session01
cd C:\LabEvidence\session01
```

**Why:** from now on, every claim you make in an interview has a file behind it, timestamped. This is the habit, not the ritual.

---

## Step 1 · The DNS test you have been putting off (20 min)

### 1.1 Run it

On **Win11_working**, in Command Prompt:

```cmd
nslookup intranet.vusi.lab
```

### 1.2 Read the answer

There are five possible outcomes. Match yours, then do the fix in the same row.

| What you see | What it means | What to do |
|---|---|---|
| `Server: DC-01.vusi.lab` + `Name/Address` matching your A record | **Working.** Record resolves, client is using the right resolver | Nothing. Capture it and move on |
| `Server: Unknown` then a correct `Name/Address` | Resolving, but reverse lookup failing — no PTR record | Add a reverse zone (1.4) |
| `*** Non-existent domain` | The A record is missing, or the client is asking a DNS server that knows nothing about `vusi.lab` | 1.3 |
| `*** Request timed out` | Client cannot reach DC-01 on UDP 53 | `Test-NetConnection DC-01 -Port 53`, check the firewall profile |
| `Server: 8.8.8.8` (or any public IP) | **The real cause.** Client is not using the DC for DNS. This breaks the whole domain, not just this record | 1.3 first |

### 1.3 Fix the client's resolver — the check to run before anything else

```powershell
Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, ServerAddresses
```

If the list does not contain DC-01's IP and nothing else:

```powershell
# Replace with the correct interface name and DC-01's actual IP
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("10.0.0.10")
Clear-DnsClientCache
```

Then re-run `nslookup intranet.vusi.lab` **from the client**.

> The rule to carry into interviews: a domain-joined machine must use the domain controller for DNS. Point it at a public resolver and it can browse the web but cannot find the domain — which is why logons, drive maps and GPOs fail while "the internet works".

### 1.4 Sanity-check the server side

On **DC-01**, elevated PowerShell:

```powershell
Get-DnsServerZone
Get-DnsServerResourceRecord -ZoneName "vusi.lab" -RRType A
Get-DnsClientServerAddress -AddressFamily IPv4          # the DC must point at itself, not 127.0.0.1 only and never a public resolver
```

If the `intranet` A record is genuinely absent:

```powershell
Add-DnsServerResourceRecordA -Name "intranet" -ZoneName "vusi.lab" -IPv4Address "10.0.0.10" -CreatePtr
```

`-CreatePtr` creates the reverse record at the same time — which is exactly what was missing in the audit (finding 10). Then:

```powershell
Set-DnsServerScavenging -ScavengingState $true -ScavengingInterval 7.00:00:00 -ApplyOnAllZones
ipconfig /flushdns
nslookup intranet.vusi.lab
```

**Capture to `session01\01-dns.txt`:** the client `nslookup` output, the client's `Get-DnsClientServerAddress`, and the DC's `Get-DnsServerResourceRecord` output. Three blocks in one file, with the date at the top.

---

## Step 2 · Fix the privilege you gave away (35 min)

This is the most valuable 35 minutes in the session. It is also the story that gets you hired, so do it properly rather than quickly.

### 2.1 Record the "before"

On **DC-01**, elevated:

```powershell
Get-ADGroupMember -Identity "Domain Admins" -Recursive |
  Select-Object Name, SamAccountName, objectClass |
  Export-Csv C:\LabEvidence\session01\02-domain-admins-before.csv -NoTypeInformation
Get-ADGroupMember -Identity "Domain Admins" | Format-Table Name, SamAccountName
```

Capture the console output too — you want the *visible* before/after, not only a CSV.

### 2.2 Remove John

```powershell
Remove-ADGroupMember -Identity "Domain Admins" -Members "John" -Confirm:$false
Get-ADGroupMember -Identity "Domain Admins" | Format-Table Name, SamAccountName
```

### 2.3 Create the separate admin account

```powershell
$pw = Read-Host -AsSecureString "Password for a-john"

New-ADUser -Name "John Doe (Admin)" -SamAccountName "a-john" `
  -UserPrincipalName "a-john@Vusi.lab" `
  -Path "OU=IT,DC=Vusi,DC=lab" `
  -AccountPassword $pw -Enabled $true -ChangePasswordAtLogon $true
```

### 2.4 Create the help desk group and delegate, scoped

```powershell
New-ADGroup -Name "HelpDesk_Group" -GroupScope Global -GroupCategory Security `
  -Path "OU=Groups,DC=Vusi,DC=lab"
Add-ADGroupMember -Identity "HelpDesk_Group" -Members "a-john"
```

Now delegate. **Use the wizard** — it teaches the model, and the model is what you are being tested on:

1. On DC-01, open **Active Directory Users and Computers**
2. Right-click **`OU=Users`** → **Delegate Control**
3. Add **`HelpDesk_Group`**
4. Choose **Delegate the following common tasks** → tick **Reset user passwords and force password change at next logon** and **Read all user information**
5. **Next** → **Finish**

Then grant unlock rights — a different permission type, and the one people forget:

```powershell
dsacls "OU=Users,DC=Vusi,DC=lab" /I:S /G "VUSI\HelpDesk_Group:WP;lockoutTime;user"
```

> **Why two steps:** password reset is an *extended right* (`User-Force-Change-Password`); unlock is a *property write* (`lockoutTime`). Writing `pwdLastSet` does **not** let anyone set a password — that is the mistake to avoid, and the reason to verify with a real reset rather than trusting the wizard.

> **Scope discipline:** you delegated on `OU=Users`, not on the domain root. That is the difference between a help desk and a second Domain Admin. Never delegate at the domain root.

Verify the rights you actually granted:

```powershell
dsacls "OU=Users,DC=Vusi,DC=lab" | Select-String "HelpDesk_Group"
(Get-Acl "AD:OU=Users,DC=Vusi,DC=lab").Access |
  Where-Object IdentityReference -like "*HelpDesk*" |
  Format-List IdentityReference, ActiveDirectoryRights, ObjectType, AccessControlType
```

**Capture to `session01\02-delegation.txt`:** the `dsacls` lines for HelpDesk_Group and the `Get-Acl` output.

### 2.5 Prove it — the part almost nobody does

On **Win11_working**:

1. Log off John. Log on as **`VUSI\a-john`**
2. Open **Active Directory Users and Computers** (RSAT is already installed)
3. Reset the password of a test user in `OU=Users` — **it must succeed**
4. Try the same on a user in `OU=IT` or on an account outside `OU=Users` — **it must fail**

Write down what you saw. Two lines:

> *"a-john could reset Jane's password in OU=Users. a-john could not reset a user outside OU=Users: the error was [exact error]."*

That sentence is the whole point of the session. It is the difference between *"I have AD experience"* and *"I understand why delegated rights beat Domain Admin rights."*

**Capture:** a screenshot of the successful reset **and** the failure message. `session01\02-proof.png`

---

## Step 3 · Enable the AD Recycle Bin (5 min)

**Check first** — it is a one-way change:

```powershell
Get-ADOptionalFeature -Filter 'Name -eq "Recycle Bin Feature"' |
  Select-Object Name, EnabledScopes
```

If `EnabledScopes` is empty, enable it:

```powershell
Enable-ADOptionalFeature -Identity 'CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=Vusi,DC=lab' `
  -Scope ForestOrConfigurationSet -Target "Vusi.lab" -Confirm:$false
```

Verify, then **test it once** so you can say you have used it:

```powershell
Get-ADOptionalFeature -Filter 'Name -eq "Recycle Bin Feature"' | Select-Object EnabledScopes

# create a throwaway user, delete it, restore it
New-ADUser -Name "Test Restore" -SamAccountName "testrestore" `
  -Path "OU=Users,DC=Vusi,DC=lab" -Enabled $false
Remove-ADUser -Identity "testrestore" -Confirm:$false

Get-ADObject -Filter 'SamAccountName -eq "testrestore"' -IncludeDeletedObjects |
  Restore-ADObject
Get-ADUser -Identity "testrestore" | Select-Object Name, Enabled, DistinguishedName
Remove-ADUser -Identity "testrestore" -Confirm:$false
```

**Capture to `session01\03-recycle-bin.txt`:** the `EnabledScopes` result before and after, and the successful restore.

> Interview question this prepares: *"Have you ever restored a deleted account?"* — "Yes, from the AD Recycle Bin, and I tested it before I needed it."

---

## Step 4 · Write the paragraph (10 min)

Not a document. One paragraph, in your own words, in `10-career-strategy/weekly-log.md` under Week 1.

Answer three things:

1. What the DNS test actually returned, and what that told you
2. What you removed, what you created instead, and what the new account cannot do
3. Which of these three fixes would have been hardest to explain to a manager who asked "why does this matter?"

That third question is the one that turns an action into judgment.

---

## Step 5 · Open the first eight tickets (15 min) — optional today

If you have time left, create GitHub issues for **T-01, T-02, T-03, T-04, T-05, T-06, T-09, T-13** using the issue template. Write each one **as the user would report it**, not as a task. Do not work them yet — a visible backlog is the point.

---

## Done criteria

You are finished when you can answer all three without notes:

- **"A user can browse the web but cannot log into the domain. What is the first thing you check?"**
  → The client's DNS server setting. It must be the DC, not a public resolver.
- **"What can your help desk account do, and what can it not?"**
  → Reset passwords and unlock accounts for users in `OU=Users`, nothing outside it, no privileged group changes, no changes to computers.
- **"Why not just give them Domain Admin?"**
  → Because Domain Admin can change any object in the domain, including other admins, and one phished help desk credential then becomes a domain compromise. Delegation gives the task without the blast radius.

---

## The three outputs to send back

Paste or attach these and I will review them as I would in a real handover:

1. `01-dns.txt`
2. `02-delegation.txt` **plus** the two-line proof in 2.5
3. `03-recycle-bin.txt`

If something failed, send the failure. A failed step with your analysis is worth more than three clean steps, and it is what the weekly log's "Failed" field is for.
