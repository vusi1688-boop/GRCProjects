# The AD Walkthrough

**Environment:** `Vusi.lab` — DC-01 (Windows Server 2022), Win11_working (Windows 11 Pro)
**Purpose:** a complete, ordered, hand-held sequence from today's state to an environment you can operate and defend in an interview.

**How to use this:** work top to bottom. Do not skip to the parts that look interesting — Session 1 catches problems that make Session 4 fail confusingly. Every step has four parts:

- **Do** — the exact clicks or commands
- **Expect** — what a working system shows you
- **If not** — the cause and the fix, in order of likelihood
- **Capture** — the evidence file you save, because nothing counts unless you can show it

Save evidence to `C:\LabEvidence\sessionNN\` and name files by number so they sort.

---

## Session map

| Session | Focus | Time | Depends on | Produces |
|---|---|---|---|---|
| **1** | Health check, DNS, structure | 90 min | lab running | 4 captures, a working `intranet` record |
| **2** | Privilege model and delegation | 60 min | Session 1 | before/after captures, a two-line proof |
| **3** | LAPS | 45 min | Session 2 | retrieval log, audit event |
| **4** | Recycle Bin, backup, a real restore | 60 min | Session 1 | restore log with timings |
| **5** | Account policy, time, lockout | 45 min | Session 2 | policy export, a real lockout ticket |
| **6** | DHCP | 45 min | Session 1 | scope export, client `ipconfig /all` |
| **7** | File services rebuild | 60 min | Session 2 | ACL before/after, access test matrix |
| **8** | GPO discipline | 45 min | Sessions 1, 7 | `gpresult` reports |
| **9** | PowerShell toolkit with tests | 90 min | Session 2 | a git-committed module |
| **10** | Entra ID and Microsoft 365 | 2 × 60 min | a tenant | sign-in log evidence |
| **11** | Break/fix drills | 15 min each | Sessions 1–8 | one ticket per drill |

**Rule for the whole walkthrough:** if a step fails, **write down what failed before you fix it**. The failure record is worth more in an interview than the working state.

---

# Session 1 · Health check, DNS, structure

## 1.1 Snapshot first

**Do:** in your hypervisor, snapshot DC-01 and Win11_working. Name them `2026-10-30_s1_pre`.

**Why:** every destructive step from here has a way back that costs 30 seconds.

## 1.2 Open the server session properly

**Do:** log on to DC-01 as `Administrator`. Open **PowerShell as Administrator** (right-click → *Run as administrator*). Set a working folder:

```powershell
New-Item -ItemType Directory -Force -Path C:\LabEvidence\session1 | Out-Null
Set-Location C:\LabEvidence\session1
Start-Transcript -Path .\transcript.txt
```

**Expect:** `Transcript started, output file is C:\LabEvidence\session1\transcript.txt`

**Why:** `Start-Transcript` captures everything you type and everything the server answers. At the end of the session you have a text file that *is* your evidence, rather than a dozen screenshots.

## 1.3 Confirm the domain is actually healthy

**Do:**

```powershell
Get-ADDomain | Select-Object DNSRoot, NetBIOSName, DomainMode, DomainSID
Get-ADForest | Select-Object ForestMode, GlobalCatalogs, SchemaMaster
netdom query fsmo
dcdiag /test:dns /v /f:C:\LabEvidence\session1\dcdiag-dns.txt
repadmin /showrepl
```

**Expect:**
- `DNSRoot` = `Vusi.lab`, `NetBIOSName` = `VUSI`
- `netdom` lists five FSMO roles, all on `DC-01.Vusi.lab`
- `dcdiag` prints a summary ending with **"passed test DNS"** for all DNS tests
- `repadmin` shows one inbound neighbour from itself, with `0 consecutive failure(s)`

**If not:**

| Symptom | Cause | Fix |
|---|---|---|
| `dcdiag` DNS tests fail | DC's own DNS client points at a public resolver or at `127.0.0.1` only | Set the DC's DNS to its own static IP, `Restart-Service DNS`, `dcdiag /fix` |
| `repadmin` shows failures | Single DC, no replication partners | Expected in a one-DC lab — note it, do not panic |
| `netdom query fsmo` errors "The specified domain… does not exist" | Wrong credentials or DNS on the DC | Run from an elevated prompt on DC-01, verify `Get-DnsClientServerAddress` |

**Capture:** `transcript.txt`, `dcdiag-dns.txt`.

## 1.4 Find out what your DC's IP actually is

**Do:**

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"} |
  Select-Object InterfaceAlias, IPAddress, PrefixLength
Get-DnsClientServerAddress -AddressFamily IPv4
```

**Expect:** one address (e.g. `10.0.0.10`) and a DNS server list containing **that same address**.

**If not:** this is the root cause of most lab DNS problems.

```powershell
# Replace Ethernet and the IP with yours
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 10.0.0.10 -PrefixLength 24 -DefaultGateway 10.0.0.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("10.0.0.10","127.0.0.1")
Restart-Service DNS
ipconfig /registerdns
```

> **Make the DC static before DHCP exists** (Session 6). A domain controller whose address changes breaks every client's resolver.

## 1.5 The DNS test you have pending

**Do:** on **Win11_working**, open Command Prompt:

```cmd
ipconfig /all > C:\LabEvidence\session1\client-ipconfig.txt
nslookup intranet.vusi.lab > C:\LabEvidence\session1\client-nslookup.txt 2>&1
type C:\LabEvidence\session1\client-nslookup.txt
```

**Expect:**

```
Server:  DC-01.vusi.lab
Address: 10.0.0.10

Name:    intranet.vusi.lab
Address: 10.0.0.10
```

**If not** — match your output:

| Output | Meaning | Fix (in order) |
|---|---|---|
| `*** Non-existent domain` | Record missing, or you are asking the wrong DNS server | 1.5.2, then 1.5.1 |
| `*** Request timed out` | Client cannot reach DC-01 on UDP 53 | `Test-NetConnection 10.0.0.10 -Port 53`; check Windows Firewall profile on the DC |
| `Server: 8.8.8.8` or any public IP | **The client is not using the DC for DNS** — this breaks logons, GPO and drive maps, not just this record | 1.5.1 |
| Correct name, wrong address | Stale or duplicate A record | 1.5.3 |
| `Server: Unknown` but `Name/Address` correct | No reverse (PTR) record | 1.5.4 |

### 1.5.1 Fix the client's resolver

On **Win11_working**, elevated PowerShell:

```powershell
Get-DnsClientServerAddress -InterfaceAlias "Ethernet" -AddressFamily IPv4
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("10.0.0.10")
Clear-DnsClientCache
ipconfig /flushdns
```

Re-run `nslookup`. This single setting explains the majority of "the domain doesn't work but the internet does" tickets.

### 1.5.2 Confirm the zone and record exist

On **DC-01**:

```powershell
Get-DnsServerZone | Select-Object ZoneName, ZoneType, IsReverseLookupZone, IsDsIntegrated
Get-DnsServerResourceRecord -ZoneName "vusi.lab" -RRType A |
  Select-Object HostName, RecordType, @{n='IP';e={$_.RecordData.IPv4Address}}
```

**Expect:** a primary, AD-integrated zone named `vusi.lab`, containing at minimum `@`, domain controllers, and an `intranet` A record.

**If `intranet` is missing:**

```powershell
Add-DnsServerResourceRecordA -Name "intranet" -ZoneName "vusi.lab" -IPv4Address "10.0.0.10"
```

### 1.5.3 Clean duplicates and enable scavenging

```powershell
Get-DnsServerResourceRecord -ZoneName "vusi.lab" -RRType A |
  Group-Object HostName | Where-Object Count -gt 1

Set-DnsServerScavenging -ScavengingState $true -ScavengingInterval 7.00:00:00 -RefreshInterval 7.00:00:00 -NoRefreshInterval 7.00:00:00 -ApplyOnAllZones
Get-DnsServerZoneAging -ZoneName "vusi.lab"
```

**Why it matters:** stale A records cause "the server can't be found" tickets that look like network faults. Scavenging is the fix, and it is a legitimate interview answer.

### 1.5.4 Add the reverse zone and a PTR

```powershell
Add-DnsServerPrimaryZone -NetworkId "10.0.0.0/24" -ReplicationScope "Domain"
Add-DnsServerResourceRecordPtr -Name "10" -ZoneName "0.0.10.in-addr.arpa" -PtrDomainName "intranet.vusi.lab"
Get-DnsServerResourceRecord -ZoneName "0.0.10.in-addr.arpa"
```

**Capture:** `client-nslookup.txt`, `client-ipconfig.txt`, plus on the DC a `Get-DnsServerZone` export.

## 1.6 Rebuild the OU structure without breaking anything

**Do (DC-01, elevated):**

```powershell
# Look before you move
Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName
Get-ADUser -Filter * -SearchBase "DC=Vusi,DC=lab" | Select-Object Name, DistinguishedName

# The typo
Rename-ADObject -Identity "OU=Finanace,DC=Vusi,DC=lab" -NewName "Finance"

# Structure to add
"Users","Computers","Groups","ServiceAccounts","Disabled" | ForEach-Object {
  if (-not (Get-ADOrganizationalUnit -Filter "Name -eq '$_'" -SearchBase "DC=Vusi,DC=lab" -ErrorAction SilentlyContinue)) {
    New-ADOrganizationalUnit -Name $_ -Path "DC=Vusi,DC=lab" -ProtectedFromAccidentalDeletion $true
  }
}
New-ADOrganizationalUnit -Name "Workstations" -Path "OU=Computers,DC=Vusi,DC=lab" -ProtectedFromAccidentalDeletion $true
```

**Expect:** no errors; `Get-ADOrganizationalUnit -Filter *` now shows `Users`, `Computers`, `Groups`, `ServiceAccounts`, `Disabled`, and `Finance`.

**If not:** `Rename-ADObject` fails with *"The object already exists"* if both spellings exist — check with the first command and remove the empty one rather than renaming blindly.

## 1.7 Move users and computers into the new tree

```powershell
# Users: verify the target OU first, then move one at a time and check
Move-ADObject -Identity (Get-ADUser Jane).DistinguishedName -TargetPath "OU=HR,OU=Users,DC=Vusi,DC=lab"
Move-ADObject -Identity (Get-ADUser John).DistinguishedName -TargetPath "OU=IT,OU=Users,DC=Vusi,DC=lab"

# Create the department OUs under Users, then move the rest
"HR","IT","Finance" | ForEach-Object {
  New-ADOrganizationalUnit -Name $_ -Path "OU=Users,DC=Vusi,DC=lab" -ProtectedFromAccidentalDeletion $true
}
Get-ADUser -Filter * -SearchBase "OU=Finance,DC=Vusi,DC=lab" |
  ForEach-Object { Move-ADObject -Identity $_.DistinguishedName -TargetPath "OU=Finance,OU=Users,DC=Vusi,DC=lab" }

# Computers: out of the default container, which cannot receive GPO properly
Get-ADComputer -Filter * | Select-Object Name, DistinguishedName
Move-ADObject -Identity (Get-ADComputer "WIN11_working").DistinguishedName `
  -TargetPath "OU=Workstations,OU=Computers,DC=Vusi,DC=lab"
```

**Expect:** users under `OU=Users\OU=<dept>`, the client under `OU=Computers\OU=Workstations`.

**If not:** *"Cannot find an object"* means the name is ambiguous — use `Get-ADUser -Filter {SamAccountName -eq "John"}` and pipe its `DistinguishedName`.

> **The lesson to remember:** a computer left in the default `CN=Computers` container gets inconsistent policy application. That is a twenty-minute symptom from a two-second mistake, and it is a good interview answer.

## 1.8 Verify GPOs survived the moves

**Do:**

```powershell
Get-GPO -All | Select-Object DisplayName, GpoStatus, @{n='Links';e={($_.LinksTo) -join '; '}}
```

**Expect:** your drive map, banner and wallpaper GPOs listed, with links that now point at OUs rather than the domain root.

**If a link broke:** re-link in **Group Policy Management** → right-click the target OU → *Link an Existing GPO*. Do **not** re-create the GPO.

**Capture:** `transcript.txt` (stop it with `Stop-Transcript`), plus `Get-GPO -All | Out-File gpos.txt`.

---

# Session 2 · The privilege model

This is the session that changes how you talk about yourself. Do not rush it.

## 2.1 Record the "before"

```powershell
New-Item -ItemType Directory -Force -Path C:\LabEvidence\session2 | Out-Null
Get-ADGroupMember -Identity "Domain Admins" -Recursive |
  Select-Object Name, SamAccountName, objectClass |
  Export-Csv C:\LabEvidence\session2\da-before.csv -NoTypeInformation
Get-ADGroupMember -Identity "Domain Admins" | Format-Table Name, SamAccountName
Get-ADUser -Filter 'adminCount -eq 1' -Properties adminCount |
  Select-Object Name, SamAccountName
```

**Capture:** `da-before.csv` **and** a clean console screenshot. You want both the machine-readable and the human-visible record.

## 2.2 Remove the over-privilege

```powershell
Remove-ADGroupMember -Identity "Domain Admins" -Members "John" -Confirm:$false
Get-ADGroupMember -Identity "Domain Admins" | Format-Table Name, SamAccountName
```

**Expect:** John is gone; `Administrator` remains.

**If not:** *"The specified account is not a member"* — he was already removed; move on and note it.

> If John's **primary** daily account is the only account you have with admin ability, create the admin account (2.3) **before** removing him, or you will lock yourself out of the console. In this lab you still have `Administrator`, so removal is safe.

## 2.3 Create the separate administrative account

```powershell
$pw = Read-Host -AsSecureString "Password for a-john"
New-ADUser -Name "John Doe (Admin)" -SamAccountName "a-john" `
  -UserPrincipalName "a-john@Vusi.lab" `
  -Path "OU=IT,OU=Users,DC=Vusi,DC=lab" `
  -AccountPassword $pw -Enabled $true -ChangePasswordAtLogon $true `
  -Description "Administrative account - not for email or browsing"
```

**Expect:** the account exists and is enabled.

**Why a separate account:** a daily account that reads email is one phishing click from being a domain compromise. This is the Tier 0 argument from Project 06, applied to yourself.

## 2.4 Create the help desk group

```powershell
New-ADGroup -Name "HelpDesk_Group" -GroupScope Global -GroupCategory Security `
  -Path "OU=Groups,DC=Vusi,DC=lab" -Description "Delegated password reset and unlock, OU=Users only"
Add-ADGroupMember -Identity "HelpDesk_Group" -Members "a-john"
```

## 2.5 Delegate — the exact clicks

**Do (on DC-01):**

1. **Server Manager** → *Tools* → **Active Directory Users and Computers**
2. In the left pane, right-click **`OU=Users`** *(the OU, not the domain root)* → **Delegate Control…**
3. **Next** → **Add…** → type `HelpDesk_Group` → **Check Names** → **OK** → **Next**
4. Select **Create a custom task to delegate** → **Next**
5. Select **Only the following objects in the folder** → tick **User objects** → **Next**
6. **Permissions** page: tick **General**, and tick **Property-specific** → then in the right-hand list tick:
   - **Read all user information**? — no; instead proceed to step 7; this page grants object-level rights
7. **Next** → **Finish**

Then repeat for the actual rights. **Second pass, same wizard, same OU:**

1. Right-click **`OU=Users`** → **Delegate Control…** → **Next** → **Add** `HelpDesk_Group` → **Next**
2. **Delegate the following common tasks** (not custom this time) → tick:
   - ☑ **Reset user passwords and force password change at next logon**
   - ☑ **Read all user information**
3. **Next** → **Finish**

**Third pass, for unlock rights** — this one is property-level and is the one people forget:

```powershell
# Grant write on lockoutTime only, so the help desk can unlock an account but change nothing else
dsacls "OU=Users,DC=Vusi,DC=lab" /I:S /G "VUSI\HelpDesk_Group:WP;lockoutTime;user"
```

**Expect:** `The command completed successfully.`

> **Why three passes:** password reset is an *extended right* (`User-Force-Change-Password`), unlock is a *property write* (`lockoutTime`), and reading attributes is object-level. They are three different permission types — which is exactly what an interviewer is probing when they ask "what can your help desk do?"

## 2.6 Verify the rights you actually granted

```powershell
dsacls "OU=Users,DC=Vusi,DC=lab" > C:\LabEvidence\session2\dsacls-users.txt
dsacls "OU=Users,DC=Vusi,DC=lab" | Select-String -Pattern "HelpDesk"
(Get-Acl "AD:OU=Users,DC=Vusi,DC=lab").Access |
  Where-Object IdentityReference -like "*HelpDesk*" |
  Format-List IdentityReference, ActiveDirectoryRights, ObjectType, AccessControlType
```

**Expect:** at least two entries for `VUSI\HelpDesk_Group`: one with `ExtendedRight` (the reset) and one with `WriteProperty` on `lockoutTime`. Extra: `ReadProperty`/`GenericRead`.

## 2.7 Prove the boundary — the step almost nobody does

**Do (on Win11_working):**

1. Sign out of `John`, sign in as **`VUSI\a-john`**
2. Open **Active Directory Users and Computers** (RSAT already installed)
3. Navigate to **`OU=Users` → `OU=HR`** → right-click **Jane Smith** → **Reset Password…** → set a temporary password → tick *User must change password at next logon* → **OK**
4. **Expect: success.**
5. Now navigate to **`OU=IT`** and try to reset **another user's** password, or try to reset the **Administrator** account
6. **Expect: "Access is denied."** Note the exact wording on screen
7. Also try: right-click `OU=Users` → **New → User**. **Expect: access denied** — deletion and creation were never granted
8. Sign out and back in as Jane with the temporary password → **Expect: the change-password prompt appears before the desktop**

**Write these two lines in your own words:**

> *"a-john reset Jane's password in OU=Users successfully. a-john was denied when attempting to reset a user outside OU=Users — the error shown was: **[exact text]**."*

**Capture:** screenshot of the success **and** the denial → `session2\delegation-proof.png`; the `dsacls` text file; `da-before.csv` and `da-after.csv`.

## 2.8 Optional hardening worth knowing about

Only after 2.7 works:

```powershell
# Adds the admin account to Protected Users: no NTLM, no RC4/DES, no credential caching, no unconstrained delegation
Add-ADGroupMember -Identity "Protected Users" -Members "a-john"
```

**Warning:** Protected Users breaks things that rely on cached credentials or NTLM. Do it on the *admin* account in a lab, observe what changes, and be ready to explain both the benefit and the breakage. Do not do it to Jane.

---

# Session 3 · LAPS

## 3.1 Check whether the schema is extended

```powershell
New-Item -ItemType Directory -Force -Path C:\LabEvidence\session3 | Out-Null
Get-ADObject -SearchBase (Get-ADRootDSE).SchemaNamingContext `
  -Filter 'Name -eq "msLAPS-Password"' | Select-Object Name, DistinguishedName
```

**Expect after extension:** the attribute exists. If it returns nothing, the schema is not extended.

## 3.2 Extend and grant permissions

```powershell
Update-LapsADSchema -Verbose

# Let computer objects write their own password, and let the help desk read/reset it
Set-LapsADComputerSelfPermission -Identity "OU=Workstations,OU=Computers,DC=Vusi,DC=lab"
Set-LapsADReadPasswordPermission  -Identity "OU=Workstations,OU=Computers,DC=Vusi,DC=lab" -AllowedPrincipals "VUSI\HelpDesk_Group"
Set-LapsADResetPasswordPermission -Identity "OU=Workstations,OU=Computers,DC=Vusi,DC=lab" -AllowedPrincipals "VUSI\HelpDesk_Group"
```

**Expect:** verbose output, no red errors.

**If not:** *"Access denied"* on `Update-LapsADSchema` → you are not in Schema Admins (required once, briefly) and need to be. *"The specified directory service attribute or value does not exist"* on the `Set-*` commands → schema extension did not complete.

## 3.3 Configure the policy

**Do (Group Policy Management):**

1. Create a GPO named `LAPS - Workstations`, linked to **`OU=Workstations`**
2. Edit → **Computer Configuration → Policies → Administrative Templates → System → LAPS**
3. Set:
   - **Configure password backup directory** → **Enabled** → *Backup Directory:* **Active Directory**
   - **Password Settings** → **Enabled** → *Password Length:* **20**, *Password Complexity:* **Large letters, small letters, numbers, special characters**, *Password Age (Days):* **30**
   - **Name of administrator account to manage** → **Enabled** → leave blank (defaults to the built-in Administrator)
4. On the client: `gpupdate /force`

**Expect:** `gpresult /r` on the client shows `LAPS - Workstations` under *Applied Group Policy Objects*.

## 3.4 Retrieve a password like the help desk would

On **Win11_working**, signed in as `a-john`:

```powershell
gpupdate /force
Get-LapsADPassword -Identity $env:COMPUTERNAME -AsPlainText
```

**Expect:** a `Destination`, an `Account`, a `Password`, and a `PasswordUpdateTime` within the last hour.

**If not:**

| Symptom | Cause | Fix |
|---|---|---|
| *"Password not found"* | Policy has not processed, or the computer cannot write to AD | `gpupdate /force`, wait 10 minutes, check `Get-LapsADPassword -Identity WIN11_working` from the DC |
| `Get-LapsADPassword` not recognised | Managing from a machine without the LAPS PowerShell module | Run it on DC-01, or install RSAT: `Add-WindowsCapability -Online -Name Rsat.ActiveDirectory.DS-LAPS~~~~0.0.1.0` |
| *"Access denied"* | `a-john` not in the group granted read permission | Re-run `Set-LapsADReadPasswordPermission`; check group membership in a **new** logon |

## 3.5 Verify the retrieval is auditable

```powershell
# On the DC: who read a LAPS password, and when
Get-WinEvent -LogName "Microsoft-Windows-LAPS/Operational" -MaxEvents 20 |
  Select-Object TimeCreated, Id, Message
```

**Expect:** an event recording the password retrieval, with the account that read it.

**Capture:** `session3\laps-retrieval.txt` (the `Get-LapsADPassword` output with the password itself redacted), the GPO settings report, and the audit event.

> **Redact before publishing:** never commit a real LAPS password, even a lab one. Show the command and the structure, blank the secret. Build the habit now.

---

# Session 4 · Recycle Bin, backup, and a real restore

## 4.1 Recycle Bin

```powershell
Get-ADOptionalFeature -Filter 'Name -eq "Recycle Bin Feature"' | Select-Object Name, EnabledScopes

Enable-ADOptionalFeature -Identity 'CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=Vusi,DC=lab' `
  -Scope ForestOrConfigurationSet -Target "Vusi.lab" -Confirm:$false

Get-ADOptionalFeature -Filter 'Name -eq "Recycle Bin Feature"' | Select-Object Name, EnabledScopes
```

**Expect:** `EnabledScopes` was empty, now contains `CN=Partitions,CN=Configuration,DC=Vusi,DC=lab`.

**If not:** *"Insufficient access rights"* → you need Enterprise Admins/Schema Admins for this one-time change.

> **Warning:** this is one-way and permanently increases the size of deletions. Do it deliberately, not casually.

## 4.2 Test a restore — the step that makes the claim true

```powershell
New-ADUser -Name "Test Restore" -SamAccountName "testrestore" -Path "OU=Users,DC=Vusi,DC=lab" -Enabled $false
Remove-ADUser -Identity "testrestore" -Confirm:$false

Get-ADObject -Filter 'SamAccountName -eq "testrestore"' -IncludeDeletedObjects |
  Select-Object Name, Deleted, LastKnownParent

Get-ADObject -Filter 'SamAccountName -eq "testrestore"' -IncludeDeletedObjects | Restore-ADObject
Get-ADUser -Identity "testrestore" | Select-Object Name, Enabled, DistinguishedName
```

**Expect:** the object appears with `Deleted : True`, then `Restore-ADObject` succeeds and the user is a normal object again.

**If not:** *"Cannot find an object with identity…"* → you forgot `-IncludeDeletedObjects`.

Clean up afterwards:

```powershell
Remove-ADUser -Identity "testrestore" -Confirm:$false
```

## 4.3 System state backup (needs a second volume)

**Do:** add a second virtual disk to DC-01 (20 GB is plenty), bring it online, format it as `E:`.

```powershell
Get-Disk | Select-Object Number, FriendlyName, OperationalStatus, PartitionStyle
Get-Volume | Select-Object DriveLetter, FileSystemLabel, SizeRemaining

Install-WindowsFeature Windows-Server-Backup
wbadmin start systemstatebackup -backupTarget:E: -quiet
wbadmin get versions
```

**Expect:** `wbadmin get versions` lists a version with a timestamp and `System State` in the components.

**If not:**

| Symptom | Cause | Fix |
|---|---|---|
| *"There is no backup target"* | `E:` missing, not formatted, or is the system volume | Attach and format a separate disk; backups cannot live on the volume they protect |
| *"The backup operation failed"* with VSS errors | Volume Shadow Copy service issue | `vssadmin list writers`, restart the failed writer, retry |

## 4.4 Restore it once

This is uncomfortable and that is the point.

**Do:**

```powershell
wbadmin get versions                       # note the version identifier
# In a lab only, after a snapshot:
wbadmin start systemstaterecovery -version:MM/DD/YYYY-HH:MM -quiet
```

**Expect:** an authoritative restore process that requires a restart. Record: how long the backup took, how long the restore took, what broke afterwards (logon, replication, DFS), and whether you needed the snapshot.

**Capture:** `session4\backup-restore.txt` with both timings and a short note on what failed.

> **The interview answer this earns:** *"I've restored a domain controller. The backup took X, the restore took Y, and the first thing I had to fix afterwards was Z."* Almost no junior candidate can say that.

---

# Session 5 · Account policy, lockout and time

## 5.1 Look at the current policy

```powershell
New-Item -ItemType Directory -Force -Path C:\LabEvidence\session5 | Out-Null
Get-ADDefaultDomainPasswordPolicy | Format-List
```

**Expect:** `LockoutThreshold : 0` — meaning accounts never lock. That is why you have never seen a lockout ticket.

## 5.2 Set a lab-appropriate policy

```powershell
Set-ADDefaultDomainPasswordPolicy -Identity Vusi.lab `
  -LockoutThreshold 5 `
  -LockoutDuration 00:15:00 `
  -LockoutObservationWindow 00:15:00 `
  -MinPasswordLength 12 `
  -PasswordHistoryCount 10 `
  -ComplexityEnabled $true

Get-ADDefaultDomainPasswordPolicy | Format-List
```

**Expect:** the new values are reflected. The observation window should be **at least** as long as the lockout duration, or the counter resets before the lockout expires.

## 5.3 Create a real lockout and work it as a ticket

```powershell
# On the client, deliberately fail 5 times:
1..5 | ForEach-Object { net use \\DC-01\IPC$ /user:VUSI\Jane "wrong$($_)" 2>$null }
```

Then, on the DC, investigate before fixing:

```powershell
Search-ADAccount -LockedOut | Select-Object Name, LockedOut, LastLogonDate
Get-ADUser Jane -Properties LockedOut, BadLogonCount, LastBadPasswordAttempt |
  Select-Object Name, LockedOut, BadLogonCount, LastBadPasswordAttempt

# Where did the bad attempts come from? This is the part that prevents a repeat.
Get-WinEvent -ComputerName DC-01 -FilterHashtable @{LogName='Security'; Id=4740} -MaxEvents 5 |
  Select-Object TimeCreated,
    @{n='Account';e={$_.Properties[0].Value}},
    @{n='CallerComputer';e={$_.Properties[1].Value}}
```

**Expect:** Jane is locked; event `4740` names the caller computer.

**Then fix it properly:**

```powershell
Unlock-ADAccount -Identity Jane
```

**Capture:** `session5\lockout.txt` with the `4740` output and the unlock, plus a ticket entry. The lesson: *unlocking without finding the caller guarantees the ticket returns tomorrow.*

## 5.4 Time — the ticket nobody expects

```powershell
# On the DC
w32tm /query /status
w32tm /query /configuration | Select-String "Type|NtpServer"

# On the client
w32tm /query /source
w32tm /resync /rediscover
```

**Expect:** the DC reports a sane source (the hypervisor's time integration or a domain hierarchy source); the client reports `Source: DC-01.vusi.lab`.

**Then break it once, on purpose:** set the client's clock 10 minutes fast, log on, and observe the Kerberos failure. Fix with `w32tm /resync`. Write down the error — you will see it in a real job.

---

# Session 6 · DHCP

## 6.1 Install and authorise

```powershell
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerInDC -DnsName "DC-01.vusi.lab" -IPAddress 10.0.0.10
Restart-Service dhcpserver
netsh dhcp add securitygroups
Restart-Service dhcpserver
```

**Expect:** `Add-DhcpServerInDC` succeeds silently; the service is running.

**If not:** *"The DHCP service failed to see a directory server"* → the DHCP server's network adapter points at itself for DNS but the AD domain is unreachable; verify `nltest /dsgetdc:Vusi.lab`.

## 6.2 Create the scope and options

```powershell
Add-DhcpServerv4Scope -Name "Lab LAN" -StartRange 10.0.0.100 -EndRange 10.0.0.200 `
  -SubnetMask 255.255.255.0 -State Active

Set-DhcpServerv4OptionValue -ScopeId 10.0.0.0 -Router 10.0.0.1 -DnsServer 10.0.0.10 -DnsDomain "vusi.lab"

Add-DhcpServerv4ExclusionRange -ScopeId 10.0.0.0 -StartRange 10.0.0.1 -EndRange 10.0.0.99
Add-DhcpServerv4Reservation -ScopeId 10.0.0.0 -IPAddress 10.0.0.10 -ClientId (Get-ADComputer DC-01 -Properties * | Select-Object -ExpandProperty Name) -Description "DC-01"

Get-DhcpServerv4Scope
Get-DhcpServerv4OptionValue -ScopeId 10.0.0.0
```

**Expect:** the scope is active with options `003 Router`, `006 DNS Servers`, `015 DNS Domain Name`.

**If the reservation errors:** reservations need the client's MAC address; for the DC, use its NIC address from `Get-NetAdapter | Select-Object MacAddress`. Reservations are optional in a lab — a static IP on the DC is what actually matters.

## 6.3 Test from the client

On **Win11_working**:

```powershell
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Remove-NetIPAddress -InterfaceAlias "Ethernet" -Confirm:$false -ErrorAction SilentlyContinue
ipconfig /release
ipconfig /renew
ipconfig /all > C:\LabEvidence\session6\client-dhcp.txt
```

**Expect:** an address in `10.0.0.100–200`, `DHCP Enabled : Yes`, `DNS Servers : 10.0.0.10`, `Connection-specific DNS Suffix : vusi.lab`.

**Capture:** `client-dhcp.txt` and `Get-DhcpServerv4Scope | Export-Csv`.

> **The interview answer:** *"I'd check DHCP option 006 before almost anything else when a machine gets an address but can't reach the domain."*

---

# Session 7 · File services rebuild

## 7.1 See what you actually have

```powershell
New-Item -ItemType Directory -Force -Path C:\LabEvidence\session7 | Out-Null
Get-SmbShare | Select-Object Name, Path, Description
Get-SmbShareAccess -Name CompanyData
icacls C:\CompanyData
icacls C:\HR_Data
```

**Expect:** `Everyone` with Full Control at the share level (that is Microsoft's documented model — do not panic), and `Domain Users:(M)` on `C:\CompanyData` (that is the problem).

## 7.2 Rebuild the tree

```powershell
$root = "C:\CompanyData"
"Common","HR","IT","Finance" | ForEach-Object {
  New-Item -ItemType Directory -Force -Path (Join-Path $root $_) | Out-Null
}

# Inherit nothing from the root where departments live; each gets explicit rights
icacls "$root\HR"      /inheritance:d
icacls "$root\IT"      /inheritance:d
icacls "$root\Finance" /inheritance:d
```

**Expect:** `Successfully processed 1 files` per command.

## 7.3 Set the rights deliberately

```powershell
# Root: read-only for everyone in the domain, so nobody can restructure it
icacls $root /remove:g "VUSI\Domain Users"
icacls $root /grant "VUSI\Domain Users:(OI)(CI)(RX)"
icacls $root /grant "VUSI\Domain Admins:(OI)(CI)(F)"

# Common: everyone can read and write (drop-box style)
icacls "$root\Common" /grant "VUSI\Domain Users:(OI)(CI)(M)"

# Departments: group-based modify, inherited users denied by removing them
foreach ($d in @{HR="HR_Group"; IT="IT_Group"; Finance="Finance_Group"}.GetEnumerator()) {
  $path = Join-Path $root $d.Key
  icacls $path /remove:g "VUSI\Domain Users" 2>$null
  icacls $path /grant "VUSI\$($d.Value):(OI)(CI)(M)"
  icacls $path /grant "VUSI\Domain Admins:(OI)(CI)(F)"
}
icacls "$root\HR"
```

**Expect:** on `HR`, ACL contains `HR_Group:(OI)(CI)(M)` and `Domain Admins:(OI)(CI)(F)`, and **not** `Domain Users:(M)`.

## 7.4 Share it once, with the right model

```powershell
if (-not (Get-SmbShare -Name "CompanyData" -ErrorAction SilentlyContinue)) {
  New-SmbShare -Name "CompanyData" -Path "C:\CompanyData" -FullAccess "VUSI\Domain Admins"
} else {
  Grant-SmbShareAccess -Name "CompanyData" -AccountName "VUSI\Domain Admins" -AccessRight Full -Force
}
Set-SmbShare -Name "CompanyData" -FolderEnumerationMode AccessBased -Force
Get-SmbShareAccess -Name "CompanyData"
```

**Why AccessBased enumeration:** users only see folders they can open. It reduces "why can't I see HR's folder" tickets and reduces disclosure.

> **The sentence to memorise:** share permissions set the ceiling, NTFS sets the detail, and the more restrictive of the two wins. `Everyone/Full` at share level with NTFS doing the work is a normal, defensible design — as long as you can say why.

## 7.5 Test the matrix and record it

```powershell
# Run as each user on the client
$u = "VUSI\Jane"; $p = Read-Host "Jane password" -AsSecureString
New-PSDrive -Name Z -PSProvider FileSystem -Root "\\DC-01\CompanyData" -Credential (New-Object System.Management.Automation.PSCredential($u,$p))
Get-ChildItem Z:\
Test-Path "Z:\HR\test.txt"
```

**Record a table — this is your evidence:**

| User | Group | `\Common` | `\HR` | `\IT` | `\Finance` |
|---|---|---|---|---|---|
| Jane | HR_Group | Read/Write | **Read/Write** | Denied | Denied |
| John | IT_Group | Read/Write | Denied | **Read/Write** | Denied |
| Alice | Finance_Group | Read/Write | Denied | Denied | **Read/Write** |

**If a user can open a folder they should not:** check token refresh first (log off and on), then `icacls` on the folder, then `whoami /groups` on the client.

---

# Session 8 · GPO discipline

## 8.1 See what applies, and why

```powershell
# On the client
gpresult /r /scope:user  > C:\LabEvidence\session8\gpresult-user.txt
gpresult /r /scope:computer > C:\LabEvidence\session8\gpresult-computer.txt
gpresult /h C:\LabEvidence\session8\gpresult.html
```

**Expect:** four sections — *Applied Group Policy Objects*, *The following GPOs were not applied because they were filtered out*, *The user is a member of…*, and *Last time Group Policy was applied*.

## 8.2 Fix the domain-root restriction

**Do (GPMC):**

1. Open **Group Policy Management**
2. Select the **`Vusi.lab`** domain node → *Linked Group Policy Objects* tab
3. Find your `Restrict Control Panel` GPO → right-click → **Delete** the *link* (not the GPO)
4. Right-click **`OU=Users\OU=HR`** → **Link an Existing GPO** → choose it
5. Repeat for `OU=IT`? **No** — IT needs the exception. Link it to HR and Finance only
6. On the client: `gpupdate /force`, then `gpresult /r`

**Expect:** Jane (HR) has the restriction; John/a-john (IT) does not.

**Why:** a policy linked at the domain root applies to everyone including administrators, which guarantees it will be worked around rather than obeyed.

## 8.3 Prove a policy is applying to the right population

```powershell
Get-GPOReport -Name "Restrict Control Panel" -ReportType Html -Path C:\LabEvidence\session8\gpo-report.html
Get-GPInheritance -Target "OU=Users,DC=Vusi,DC=lab"
Get-GPResultantSetOfPolicy -Computer WIN11_working -User "VUSI\Jane" -ReportType Html -Path C:\LabEvidence\session8\rsoP.html
```

**Expect:** the report shows the link targets and the security filtering.

> **The three GPO questions to be able to answer:** where is it linked, who does it apply to (filtering), and what actually applied (resultant set). Most juniors know only the first.

---

# Session 9 · PowerShell toolkit

## 9.1 Structure

```
C:\LabToolkit\
├── LabToolkit.psd1        module manifest
├── LabToolkit.psm1        functions
├── public\
│   ├── New-LabUser.ps1
│   ├── Disable-LabUser.ps1
│   └── Get-LabAccessReport.ps1
├── tests\
│   └── LabToolkit.Tests.ps1
└── new-hires.sample.csv
```

## 9.2 A function that fails loudly and safely

```powershell
function New-LabUser {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$SamAccountName,
        [Parameter(Mandatory)][string]$Department,
        [string]$LogPath = "C:\LabToolkit\logs\provisioning.log"
    )

    if (Get-ADUser -Filter "SamAccountName -eq '$SamAccountName'" -ErrorAction SilentlyContinue) {
        throw "User '$SamAccountName' already exists."
    }

    $ou = "OU=$Department,OU=Users,DC=Vusi,DC=lab"
    if (-not (Get-ADOrganizationalUnit -Identity $ou -ErrorAction SilentlyContinue)) {
        throw "Target OU '$ou' does not exist."
    }

    if (-not $PSCmdlet.ShouldProcess($SamAccountName, "Create AD user in $Department")) { return }

    try {
        $temp = -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 20 | ForEach-Object {[char]$_})
        New-ADUser -Name $Name -SamAccountName $SamAccountName `
            -UserPrincipalName "$SamAccountName@Vusi.lab" -Path $ou `
            -AccountPassword (ConvertTo-SecureString $temp -AsPlainText -Force) `
            -Enabled $true -ChangePasswordAtLogon $true -ErrorAction Stop

        Add-ADGroupMember -Identity "$Department`_Group" -Members $SamAccountName -ErrorAction Stop

        New-Item -ItemType Directory -Force -Path (Split-Path $LogPath) | Out-Null
        "$(Get-Date -Format s) OK   $SamAccountName ($Department) temp issued" |
            Out-File $LogPath -Append
        [pscustomobject]@{ User = $SamAccountName; OU = $ou; Status = "Created" }
    }
    catch {
        "$(Get-Date -Format s) FAIL $SamAccountName — $($_.Exception.Message)" |
            Out-File $LogPath -Append
        Write-Error "Failed for $SamAccountName : $($_.Exception.Message)"
    }
}
```

## 9.3 Test it

```powershell
Install-Module Pester -Scope CurrentUser -Force -SkipPublisherCheck

# tests\LabToolkit.Tests.ps1
Describe "New-LabUser" {
    It "creates a user in the right OU" {
        New-LabUser -Name "Test User" -SamAccountName "tuser" -Department "HR"
        (Get-ADUser tuser).DistinguishedName | Should -BeLike "*OU=HR,OU=Users,DC=Vusi,DC=lab"
    }
    It "refuses a duplicate" {
        { New-LabUser -Name "Test User" -SamAccountName "tuser" -Department "HR" } |
            Should -Throw "*already exists*"
    }
    It "supports WhatIf without changing anything" {
        New-LabUser -Name "Ghost" -SamAccountName "ghost" -Department "HR" -WhatIf
        Get-ADUser ghost -ErrorAction SilentlyContinue | Should -BeNullOrEmpty
    }
}

Invoke-Pester .\tests
```

**Expect:** three passing tests.

**Capture:** a git commit in the repo, plus the Pester output. This is the single strongest engineering artefact a junior can produce.

---

# Session 10 · Entra ID and Microsoft 365

## 10.1 Get a tenant — legitimately

| Option | Cost | Notes |
|---|---|---|
| Microsoft 365 Developer Program sandbox | Free if eligible | Best; includes sample data and Intune |
| Free Entra ID tenant + one M365 Business Basic seat | Low monthly | Enough for users, groups, SSPR, MFA, sign-in logs |
| Employer sandbox | Free | **Only with written permission**, and never in a production tenant |

**Do not** build a lab in a customer or employer tenant without written approval. That is a career-ending mistake, and stating the rule out loud in an interview is a positive signal.

## 10.2 The 10 tasks that map to real tickets

```powershell
Install-Module Microsoft.Graph -Scope CurrentUser -Force
Connect-MgGraph -Scopes "User.ReadWrite.All","Group.ReadWrite.All","AuditLog.Read.All","Policy.Read.All"

# 1. create a user
$pw = @{ ForceChangePasswordNextSignIn = $true; Password = "ChangeMe-$(Get-Random -Minimum 1000 -Maximum 9999)!" }
New-MgUser -DisplayName "Jane Smith" -UserPrincipalName "jane@yourtenant.onmicrosoft.com" `
  -MailNickname "jane" -AccountEnabled -PasswordProfile $pw -UsageLocation "ZA"

# 2. group, assigned and dynamic
New-MgGroup -DisplayName "HR_Cloud" -MailEnabled:$false -SecurityEnabled -MailNickname "hr_cloud"
New-MgGroup -DisplayName "All-ZA-Staff" -MailEnabled:$false -SecurityEnabled -MailNickname "allza" `
  -GroupTypes "Dynamic" -MembershipRule '(user.country -eq "South Africa")' -MembershipRuleProcessingState "On"

# 3. licence, 4. sign-in logs, 5. MFA status
Get-MgSubscribedSku | Select-Object SkuPartNumber, ConsumedUnits
Get-MgAuditLogSignIn -Top 20 | Select-Object CreatedDateTime, UserPrincipalName, AppDisplayName, Status
Get-MgUser -Filter "userPrincipalName eq 'jane@yourtenant.onmicrosoft.com'" | Select-Object DisplayName, Id
```

**Then in the portal:**

6. **Password reset → Properties → None / Selected / All** — set *Selected* for one group and test the registration flow
7. **Security → Authentication methods → MFA** — require it for one group
8. **Protection → Conditional Access → New policy** in **Report-only**: require MFA for all users, then read *Insights and reporting* to see what it *would* have blocked
9. **Users → Jane → Authentication methods** — require re-registration after a simulated loss
10. **Users → Jane → Revoke sessions**, then confirm the sign-in failure

**Capture:** a sign-in log extract showing a failed MFA attempt followed by success, and a report-only policy outcome. Redact tenant IDs.

> **The questions this prepares:** "A user can sign into Teams but not Outlook — where do you look?" (conditional access, licence assignment, client auth). "A user changed their password on-prem and can't get into M365 — why?" (sync lag, or the object is cloud-authoritative).

---

# Session 11 · Break/fix drills

One drill per sitting. For each: break it, **write the ticket as a user would**, diagnose without looking at your own notes, fix, and record your first hypothesis and whether it was right.

| # | Break it like this | You should land on |
|---|---|---|
| 1 | Point the client's DNS at `8.8.8.8` | Domain resolution fails; logon fails; internet still works |
| 2 | Set the client clock 10 minutes fast | Kerberos `KRB_AP_ERR_SKEW`; logon fails |
| 3 | Add Jane to `Finance_Group` while she is logged on | Access still denied until re-logon (token) |
| 4 | Disable the Z: drive GPO link | Drive missing at next logon; `gpresult` shows the GPO not applied |
| 5 | Fail Jane's password 5 times | Lockout ticket; find the caller with event 4740 |
| 6 | Delete the client's computer object | Trust relationship failure; repair before rejoin |
| 7 | Stop the Spooler on DC-01 | Nothing prints; remember the audit recommended disabling it entirely |
| 8 | Set the share to `Read` for Domain Users | Users can open files but cannot save — a *different* complaint from Access Denied |
| 9 | Move a user out of their department OU | Policies stop applying; `gpresult` reveals the OU |
| 10 | Stop the `Netlogon` service on the DC | Logons fail; `dcdiag` shows it; this is a P1 |
| 11 | Uninstall the LAPS GPO from the workstation OU | `Get-LapsADPassword` returns nothing; password ages past policy |
| 12 | Delete an OU with a user in it (Recycle Bin on) | Restore path is different for containers — document what works |

---

# Building your evidence pack

Every claim you make in an interview should map to a file. Fill this in as you go.

| Claim | Evidence file | Session |
|---|---|---|
| "Fixed an over-privileged admin account" | `session2\da-before.csv`, `da-after.csv`, `delegation-proof.png` | 2 |
| "Delegated least privilege and proved the boundary" | `session2\dsacls-users.txt` + the two-line proof | 2 |
| "Implemented LAPS" | `session3\laps-retrieval.txt`, audit event | 3 |
| "Restored a deleted account" | `session4\` recycle bin output | 4 |
| "Restored a domain controller" | `session4\backup-restore.txt` with timings | 4 |
| "Diagnosed a lockout to the source" | `session5\lockout.txt` with event 4740 | 5 |
| "Built a DHCP scope with correct options" | `session6\client-dhcp.txt` | 6 |
| "Designed group-based file permissions and tested them" | access matrix table + `icacls` output | 7 |
| "Troubleshot Group Policy application" | `session8\gpresult.html` | 8 |
| "Wrote a tested PowerShell module" | git commit + Pester output | 9 |
| "Administered Entra ID and M365" | sign-in log extract, report-only policy | 10 |

**The test:** pick any row, open the file, and imagine an interviewer asking "show me". If you hesitate, the claim is not ready to make.

---

# Appendix A · Command cheat sheet

```powershell
# Domain health
Get-ADDomain | fl DNSRoot, NetBIOSName, DomainMode
netdom query fsmo
dcdiag /test:dns /v
repadmin /showrepl
Get-ADOptionalFeature -Filter 'Name -eq "Recycle Bin Feature"' | fl Name, EnabledScopes

# Who has what
Get-ADGroupMember "Domain Admins" -Recursive | ft Name, SamAccountName
Get-ADPrincipalGroupMembership Jane | ft Name
Get-ADUser -Filter 'adminCount -eq 1' | ft Name, SamAccountName
dsacls "OU=Users,DC=Vusi,DC=lab"

# Accounts
Search-ADAccount -LockedOut | ft Name, LockedOut
Unlock-ADAccount Jane
Set-ADAccountPassword Jane -Reset -NewPassword (Read-Host -AsSecureString)
Set-ADUser Jane -ChangePasswordAtLogon $true
Search-ADAccount -AccountExpired -UsersOnly
Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly

# Policy
gpresult /r
gpupdate /force
Get-ADDefaultDomainPasswordPolicy | fl
Get-GPO -All | ft DisplayName, GpoStatus

# DNS
nslookup intranet.vusi.lab
Resolve-DnsName intranet.vusi.lab
Get-DnsServerResourceRecord -ZoneName vusi.lab
ipconfig /flushdns
Get-DnsClientServerAddress

# Files
icacls C:\CompanyData
Get-SmbShare; Get-SmbShareAccess -Name CompanyData
whoami /groups

# LAPS
Get-LapsADPassword -Identity WIN11_working -AsPlainText
Update-LapsADSchema

# Time
w32tm /query /status
w32tm /resync /rediscover
```

---

# Appendix B · Error → cause → fix

| Error you see | Most likely cause | First fix |
|---|---|---|
| `Access is denied` on a password reset | Delegation missing, or the object is outside the delegated OU | `dsacls` on the OU; confirm the user's OU |
| `The specified account does not exist` | Wrong `SamAccountName`, or wrong domain prefix | `Get-ADUser -Filter * \| ? SamAccountName -eq "<name>"` |
| `Cannot find an object with identity` on restore | Missing `-IncludeDeletedObjects` | Add the switch |
| `The object already exists` | Duplicate name, or a leftover disabled object | Search including disabled objects |
| `The trust relationship between this workstation and the primary domain failed` | Computer account password mismatch | `Test-ComputerSecureChannel -Repair` before rejoining |
| GPO not applying | Wrong link target, security filtering, or the object is in `CN=Computers` | `gpresult /r`, then `Get-GPInheritance` |
| `nslookup` times out | Client cannot reach UDP 53, or firewall | `Test-NetConnection DC-01 -Port 53` |
| Domain works but internet does not | DC has no forwarder | Configure DNS forwarders on DC-01 |
| `The DHCP service failed to see a directory server` | DC unreachable for authorisation | `nltest /dsgetdc:Vusi.lab`, then re-authorise |
| LAPS `Password not found` | Policy not applied, or computer has not written it yet | `gpupdate /force`, wait, retry from the DC |
| `wbadmin` "no backup target" | Target is the system volume or not formatted | Attach a separate disk |
| Logon fails after a clock change | Kerberos skew > 5 minutes | `w32tm /resync /rediscover` |
| `Add-WindowsCapability` fails | WSUS/GPO blocking optional components, or no internet | Install RSAT on the DC, or fix the update source |
| `The RPC server is unavailable` | Firewall, or the target service is down | `Test-NetConnection`, check the service |

---

# Appendix C · The twenty questions this walkthrough prepares you for

1. What does a domain controller do?
2. Why must domain machines use the DC for DNS?
3. What's the difference between share and NTFS permissions?
4. How does Group Policy apply, and in what order?
5. How do you find out why a GPO isn't applying?
6. What is the difference between an OU and a group?
7. How do you reset a password without giving someone Domain Admin?
8. What can a delegated help desk account do, and what can't it?
9. Where do you put a computer object, and why does it matter?
10. What happens to a user's group membership when they log on?
11. A user changed their password on-prem and can't sign into M365. Why?
12. How do you unlock an account and stop it happening again?
13. What is LAPS and what problem does it solve?
14. How would you get local admin on a user's laptop?
15. What happens if a user's clock is wrong?
16. A machine has an IP but can't join the domain. First two checks?
17. How do you restore a deleted user?
18. What is the difference between disabling and deleting a leaver's account?
19. How would you prove a leaver lost access on a specific date?
20. What would you never do on a production domain controller without approval?

If you can answer all twenty **and show the file behind each one**, you are no longer a candidate with a home lab. You are a candidate with an operating record.

---

*Work top to bottom. Capture everything. Send back the failures.*
