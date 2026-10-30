# Tier 0 Scoping and Boundary Register

## Document Information
| Field | Value |
|-------|-------|
| Organisation | [Company Name] |
| Directory / Forest | [domain.local] |
| Author | [Your Name] |
| Version | 1.0 |
| Date | [Date] |
| Boundary owner | [Name / Role] |
| CISO approval | [Name / Date] |
| Next review | [Date] |

---

## 1. Boundary Definition

### 1.1 In-scope criteria
An asset is Tier 0 if it meets **any** of the following. Tick those that apply and record the specific evidence.

| Criterion | Applies to this asset? | Notes |
|-----------|------------------------|-------|
| Stores or replicates directory credentials (NTDS, SYSVOL, backup of either) | Yes / No | |
| Can read or write directory objects | Yes / No | |
| Can issue or manage certificates trusted for domain authentication | Yes / No | |
| Can execute code as SYSTEM or equivalent on a domain controller | Yes / No | |
| Can control the hypervisor or storage layer hosting a domain controller | Yes / No | |
| Holds a service account with directory replication rights | Yes / No | |
| Is required to build, back up, restore, or monitor any of the above | Yes / No | |
| Is an administrative workstation permitted to access any of the above | Yes / No | |

### 1.2 Boundary statement
> *[One paragraph the CISO can sign. State what is inside, what is explicitly outside, and the criterion used to decide. Example: "Tier 0 comprises the directory control plane and every asset capable of reading, writing, executing against, or restoring it. It includes six domain controllers, two certification authorities, the hybrid identity sync server, the backup platform holding system state, the endpoint agent management plane with domain controller coverage, the hypervisor management cluster, and six privileged access workstations. File servers, application servers, and endpoints are Tier 1 and Tier 2 respectively and are out of scope for privileged logon."]*

---

## 2. Tier 0 Asset Register

| ID | Asset | Function | Why Tier 0 | Owner | Hosting / Location | In backup scope | Last reviewed |
|----|-------|----------|------------|-------|--------------------|-----------------|---------------|
| T0-001 | [DC-01] | Domain controller | Holds NTDS | | | Yes / No | |
| T0-002 | [DC-02] | Domain controller | Holds NTDS | | | | |
| T0-003 | [ADCS-01] | Certificate authority | Issues auth certificates | | | | |
| T0-004 | [SYNC-01] | Directory synchronisation | Writes to cloud directory | | | | |
| T0-005 | [BKP-01] | Backup server | Stores system state | | | | |
| T0-006 | [EDR-CON] | Agent management console | Code execution on DCs | | | | |
| T0-007 | [HV-CL-01] | Hypervisor cluster | Hosts DCs | | | | |
| T0-008 | [PAW-01] | Administrative workstation | Trusted to reach Tier 0 | | | | |
| | | | | | | | |

### 2.1 Assets the business did not consider privileged
| Asset | Nobody listed it because | Consequence if reached | Action |
|-------|--------------------------|------------------------|--------|
| | "It's only backups" | | |
| | "It's a security tool" | | |
| | "Platform team owns it" | | |

---

## 3. Dependency Register

What authenticates to, or is trusted by, the Tier 0 assets above. This is where flat models usually fail.

| ID | Source | Relationship | Credential type | Stored where | Rotation | Owner |
|----|--------|--------------|-----------------|--------------|----------|-------|
| D-001 | [Backup agent] | DCSync-equivalent replication rights | Service account | Config file on BKP-01 | [Never / 4 years] | |
| D-002 | [EDR] | SYSTEM execution on all DCs | Agent certificate | | | |
| D-003 | [Entra Connect] | Directory replication + cloud write | Sync account | Local DPAPI | | |
| D-004 | [Monitoring] | WMI / event collection from DCs | Domain account | | | |
| D-005 | [Vendor support] | Remote privileged access | Shared account | Vendor vault | | |
| | | | | | | |

### 3.1 Tier escalation paths identified
| Path | From tier | To tier | Mechanism | Blocked? | How |
|------|-----------|---------|-----------|----------|-----|
| Admin logs into daily laptop | 0 | 2 | Credential theft of admin token | Yes / No | |
| App server admin resets DA password | 1 | 0 | WriteDACL on domain object | | |
| Backup operator restores DC system state | 0 | 0 | Legitimate, uncontrolled | | |
| Certificate template allows requester-supplied SAN | 2 | 0 | ESC1 certificate abuse | | |
| Hypervisor admin reads DC memory | 0 | 0 | Snapshot | | |

---

## 4. Current State Measurements

| Measure | Value | Method / query used | Date |
|---------|-------|--------------------|------|
| Standing Domain Admin accounts | | `Get-ADGroupMember -Recursive` | |
| Standing Enterprise Admin accounts | | | |
| Break-glass accounts | | | |
| Accounts with `adminCount=1` | | `Get-ADUser -Filter 'adminCount -eq 1'` | |
| Accounts with directory replication rights | | ACE on domain object | |
| Domain Admin interactive logons on non-Tier 0 hosts | | Event 4624 with privileged SID, host inventory | |
| Service accounts with non-expiring passwords | | `PasswordNeverExpires -eq $true` | |
| Kerberoastable accounts on RC4 | | `msDS-SupportedEncryptionTypes` | |
| Tier 0 assets with no named owner | | This register | |
| Domain controllers with Print Spooler running | | `Get-Service Spooler` per DC | |

---

## 5. Target Model

### 5.1 Account and tier matrix
| Tier | Account naming | Interactive logon allowed on | Mailbox | MFA required | Standing or JIT | Max standing holders |
|------|----------------|------------------------------|---------|--------------|-----------------|----------------------|
| Tier 0 | `a-<sam>-t0` | Tier 0 hosts and PAWs only | No | Yes | JIT + 3 break-glass | 0 standing |
| Tier 1 | `a-<sam>-t1` | Tier 1 servers and PAWs | No | Yes | JIT | |
| Tier 2 | `a-<sam>-t2` | Workstations | No | Yes | Vaulted | |
| User | `<sam>` | Workstations | Yes | Yes | n/a | n/a |
| Service (managed) | `gmsa-<app>$` | n/a | n/a | n/a | gMSA | n/a |
| Service (legacy) | `svc-<app>` | n/a | No | n/a | Vault + rotation | n/a |

### 5.2 Enforcement controls
| Control | Implementation | Enforces or requests? | Test that proves it |
|---------|----------------|-----------------------|---------------------|
| Tier 0 logon restriction | Deny log on + Protected Users | Enforces | Attempt logon from non-PAW; expect failure 4625 |
| Authentication policy silo | Auth silo bound to Tier 0 accounts | Enforces | Validate `Get-ADAuthenticationPolicySilo` binding |
| JIT privileged access | PIM / time-bound group membership | Enforces | Show activation log with approver |
| Break-glass | 2–3 sealed accounts, monitored | Detects | Quarterly test record + alert |
| Local admin | Windows LAPS | Enforces | `Get-LapsADPassword` retrievable only by authorised group |
| Service accounts | gMSA or vaulted rotation | Enforces | Rotation log with credential age |
| DC service hygiene | Spooler disabled, unnecessary roles removed | Enforces | Service state report from all DCs |

---

## 6. Migration Plan

| Phase | Weeks | Change | Rollback | Operational impact | Owner | Approval required |
|-------|-------|--------|----------|--------------------|-------|-------------------|
| 1 | 1–2 | Register signed; owners confirmed | n/a | None | | CISO |
| 2 | 3–4 | Break-glass created, tested; PIM configured | Disable accounts | None | | |
| 3 | 5–6 | Enterprise Admins emptied; adminCount cleanup | Re-add to group | Low | | CAB |
| 4 | 7–10 | PAWs built and issued | Revert to existing hosts | High — 6 users | | CIO |
| 5 | 11–14 | Tier accounts created; restrictions in audit-only | Remove deny ACEs | Medium | | CAB |
| 6 | 15–16 | DCSync rights replaced; credentials rotated | Restore from documented config | Medium — backup regression risk | | CAB + vendor |
| 7 | 17–18 | Restrictions enforced | GPO rollback | High — helpdesk | | CAB |
| 8 | 19–20 | Re-test with independent pentest | n/a | None | | CISO |

### 6.1 Known constraints
| Constraint | Affected phase | Mitigation |
|------------|----------------|------------|
| 24/7 operations | 7 | Audit-only period, on-call briefed |
| 3 legacy apps require interactive service logon | 5 | Time-bound exception (see Project 08) |
| Vendor support accounts are shared | 6 | Vaulting with session recording |
| Helpdesk measured on closure time | 7 | Update SLA definition before enforcement |

---

## 7. Framework Mapping

| Control | ISO 27001:2022 | PCI DSS 4.0 | CIS v8.1 | SOC 2 | Evidence reference |
|---------|----------------|-------------|----------|-------|--------------------|
| Tier 0 register | A.5.9 | 12.5.2 | 1.1 | CC6.1 | |
| Separate admin accounts | A.8.2 | 7.2.1, 8.2.1 | 5.4 | CC6.1 | |
| JIT access | A.8.2 | 7.2.2 | 6.1 | CC6.3 | |
| Logon restriction | A.8.3 | 7.2.1 | 6.8 | CC6.1 | |
| Authentication silos | A.8.5 | 8.4.2 | 6.5 | CC6.1 | |
| DCSync rights removed | A.8.2 | 7.2.1 | 5.4 | CC6.1 | |
| DC hardening | A.8.9 | 2.2.1 | 4.1 | CC7.1 | |

---

## 8. Residual Risk

| ID | Gap | Why accepted for now | Risk | Compensating control | Owner | Review date | Accepted by |
|----|-----|----------------------|------|----------------------|-------|-------------|-------------|
| R-01 | | | | | | | |
| R-02 | | | | | | | |

---

## 9. Audit Response Pack

| Likely challenge | Weak answer to avoid | Your answer (evidence-based) |
|------------------|----------------------|------------------------------|
| "How do you know the boundary is effective?" | | |
| "Why are there still Domain Admins?" | | |
| "What stops this decaying?" | | |
| "Show me a time the control failed." | | |
| "Who owns this?" | | |

---

## Sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| CISO | | Approved / Conditional / Rejected | |
| Infrastructure owner | | | |
| Identity platform owner | | | |
| Internal audit (review) | | | |
