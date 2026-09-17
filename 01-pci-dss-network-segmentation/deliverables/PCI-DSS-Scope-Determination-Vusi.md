# PCI DSS v4.0 Scope Determination Document

## Document Information

| Field | Value |
| :--- | :--- |
| **Organization** | NorthPeak Retail Ltd |
| **Assessment Date** | September 17, 2026 |
| **Assessor** | Vusi, Lead GRC Analyst |
| **Document Version** | 1.0 (Final Scope Baseline) |
| **PCI DSS Version** | v4.0 |
| **Applicable SAQs / Baseline** | SAQ A (E-Commerce) / SAQ C-VT (Call Center Virtual Terminal) |

---

## 1. Executive Summary

### 1.1 Scope Statement
This document establishes the official PCI DSS v4.0 compliance and assessment scope for NorthPeak Retail Ltd. The Cardholder Data Environment (CDE) is strictly constrained to the **Call Center Virtual Terminal Network (VLAN 40)**, comprising 12 dedicated agent workstations (`CC-WORKSTATION-01` through `12`) and the TLS 1.3 encrypted browser sessions connecting directly to the Stripe Virtual Terminal API.

Connected and security-impacting systems brought into scope include the Call Center Active Directory Domain Controller (`DC-02`), the Dedicated Administrative Jump Host (`JH-PCI-01`), the Splunk SIEM log forwarders, the CrowdStrike Falcon EDR management plane, and the Palo Alto Next-Generation Firewall (`FW-CORE-01`).

The primary public e-commerce storefront (`www.northpeakretail.com`) is **explicitly OUT OF SCOPE** under PCI DSS **SAQ A** criteria, as customer payment processing is entirely outsourced to Shopify Plus via hosted payment fields (iFrame/Redirect), ensuring cardholder data never touches NorthPeak infrastructure. The corporate office network (VLAN 10) and AWS cloud environments are **OUT OF SCOPE**, enforced by stateful firewall deny-all rules and strict network segmentation.

This scope determination assumes that Call Center VLAN segmentation controls remain continuously effective, physical clean-room policies are enforced, and Shopify Plus maintains its PCI DSS Level 1 Service Provider Attestation of Compliance (AOC).

### 1.2 Key Findings
1. **Scope Reduction Architecture:** Outsourcing e-commerce processing to Shopify Plus eliminates over 80% of potential infrastructure from PCI scope, focusing regulatory exposure strictly on the internal 12-person call center operations.
2. **Shared Active Directory Exposure:** Corporate Active Directory (`DC-01`) currently handles identity resolution for call center staff, introducing a high-risk trust boundary that requires dedicated administrative isolation.
3. **Outbound Egress Deficiencies:** Current network controls permit unrestricted outbound HTTPS connections from CDE endpoints, creating a potential exfiltration vector that requires strict URL whitelisting.

### 1.3 Overall Risk Rating
`[ ] Low` | `[X] Medium` | `[ ] High` | `[ ] Critical`

---

## 2. Cardholder Data Environment (CDE) Definition

### 2.1 Systems That STORE Cardholder Data
NorthPeak Retail Ltd operates a strict **Zero Cardholder Data Storage Policy**. PAN, Sensitive Authentication Data (SAD/CVV), and Expiration Dates are never written to non-volatile storage, database tables, local drives, or log files.

| System Name | Data Types Stored | Retention Period | Justification & Verification Method |
| :--- | :--- | :--- | :--- |
| **NONE** | None | 0 Days | Quarterly automated data discovery scans (Varonis / Spirion) run across all internal servers and endpoints confirm 0 instances of unencrypted PAN on disk. |

### 2.2 Systems That PROCESS Cardholder Data
Systems that process cardholder data handle PAN and SAD in volatile memory (RAM) during live phone-order entry.

| System Name | Processing Function | Data Elements | Justification |
| :--- | :--- | :--- | :--- |
| **CC-WORKSTATION-01 to 12** <br>*(VLAN 40: `10.40.0.0/24`)* | Agents receive credit card details verbally over secure telephony and manually key them into the web interface. | PAN, Expiry, CVV | Data exists temporarily in volatile browser memory before form submission. No local caching or file writing permitted. |
| **Call Center Telephony Session** <br>*(Avaya VoIP Platform)* | Transmits incoming audio streams to agent headsets. | Verbal PAN, CVV | Audio streams traverse dedicated VoIP VLAN. Dual-Tone Multi-Frequency (DTMF) masking suppresses audio tones during entry. |

### 2.3 Systems That TRANSMIT Cardholder Data
Systems that route, relay, or transmit cardholder data over internal or public networks.

| System Name | Transmission Path | Encryption | Justification |
| :--- | :--- | :--- | :--- |
| **Stripe Virtual Terminal Session** | `CC-WORKSTATION` $\rightarrow$ `FW-CORE-01` $\rightarrow$ Internet $\rightarrow$ `api.stripe.com` | TLS 1.3 (AES-256 GCM) | Direct outbound web connection. Data is encrypted at the application layer prior to egress from the workstation. |

---

## 3. Connected Systems & Security-Impacting Systems

### 3.1 Connected Systems (Direct & Indirect)
Systems that share a network connection, administrative pathway, or authentication trust with the CDE.

| System | Connection Type | Business Purpose | In Scope? | Justification |
| :--- | :--- | :--- | :--- | :--- |
| **JH-PCI-01** <br>*(Jump Host)* | RDP via SSH Tunnel (Port 3389) with Hardware MFA | Administrative management of CDE endpoints | **YES** | **Direct Connection:** Provides administrative access into VLAN 40. A compromise of this host enables lateral movement to CDE endpoints. |
| **Corp Active Directory** <br>*(DC-01 / VLAN 10)* | LDAP/Kerberos (`TCP 389/88`) | Identity authentication for call center agents | **YES** | **Indirect Connection:** Authenticates CDE users. A compromise of DC-01 allows malicious Group Policy (GPO) deployment to CDE workstations. |
| **Corporate Email** <br>*(Exchange Online)* | Outbound HTTPS | General corporate communications | **NO** | Blocked at firewall level. CDE workstations have zero route/access to corporate email servers. |

### 3.2 Security-Impacting Systems
Systems that enforce, monitor, patch, or configure security controls affecting the CDE.

| System | Security Function | Impact if Compromised | In Scope? | Justification |
| :--- | :--- | :--- | :--- | :--- |
| **Palo Alto FW-CORE-01** | Stateful Network Firewall & Segmentation | Perimeter collapse; unauthorized CDE access | **YES** | Enforces isolation around VLAN 40. Mandated by PCI Requirement 1. |
| **Splunk SIEM** | Centralized Audit Logging & Alerting | Eradication of audit trails and incident alerts | **YES** | Collects security and event logs from CDE hosts. Mandated by PCI Requirement 10. |
| **CrowdStrike Falcon** | Endpoint Detection & Response (EDR) | Execution of unmonitored malware in CDE | **YES** | Provides anti-malware and behavioral analysis for workstations. Mandated by PCI Requirement 5. |
| **Tenable Vulnerability Scanner** | Network & Host Vulnerability Scanning | Undetected vulnerability exploitation | **YES** | Scans CDE endpoints for security gaps. Mandated by PCI Requirement 11. |

---

## 4. Trust Relationship Analysis & Shared Services

### 4.1 Shared Services Risk Matrix
Common enterprise infrastructure services shared between CDE and non-CDE environments present scope expansion vectors if not strictly isolated.

| Service | Used By CDE? | Used By Non-CDE? | Segmentation Effective? | Mitigation / Architecture |
| :--- | :--- | :--- | :--- | :--- |
| **DNS** | Yes | Yes | **YES** | CDE hosts use split-horizon internal DNS (`10.40.0.2`) restricted solely to resolving internal management hosts and `api.stripe.com`. |
| **NTP** | Yes | Yes | **YES** | Time synchronization is pull-only via UDP 123 from `FW-CORE-01`. Inbound NTP requests from non-CDE are dropped. |
| **Active Directory** | Yes | Yes | **PARTIAL** | CDE endpoints reside in a dedicated Active Directory Organizational Unit (`OU=PCI-Endpoints`) with GPO Inheritance blocked. |
| **Patching (WSUS)** | Yes | Yes | **YES** | WSUS server staging environment tests patches prior to deployment via isolated distribution point in VLAN 40. |

---

## 5. Segmentation Assessment & Gap Analysis

### 5.1 Current Segmentation Architecture
* **Firewall Enforcement:** Palo Alto `FW-CORE-01` enforces stateful inspect-and-deny traffic policies between VLAN 40 (CDE), VLAN 10 (Corporate Office), VLAN 20 (AWS Cloud Interconnect), and the Public Internet.
* **Inbound Rules to CDE (VLAN 40):**
  * `DENY ALL` inbound traffic from all corporate and public sources.
  * `ALLOW` TCP 389/88 from `JH-PCI-01` (Jump Host) ONLY.
* **Outbound Rules from CDE (VLAN 40):**
  * `ALLOW` TCP 443 to `api.stripe.com` via Palo Alto URL Filter.
  * `ALLOW` TCP 9997 to Splunk Indexer (`10.10.100.50`).
  * `DENY ALL` other egress pathways.

### 5.2 Identified Segmentation Gaps & Remediation Plan

| Gap ID | Description | Risk | Remediation Action | Target Completion |
| :--- | :--- | :--- | :--- | :--- |
| **GAP-001** | Egress filtering on `FW-CORE-01` permits general HTTPS outbound traffic from VLAN 40 without strict FQDN/URL application-layer inspection. | **HIGH** | Apply Palo Alto App-ID and strict URL Filtering profile to limit outbound 443 destination explicitly to `*.stripe.com`. | October 15, 2026 |
| **GAP-002** | Shared Active Directory domain allows Corporate Domain Admins to log into CDE Jump Host without dedicated PCI admin credentials. | **HIGH** | Implement Tiered Administration Model. Require separate `admin_pci_*` credentials protected by YubiKey MFA for jump host access. | November 30, 2026 |
| **GAP-003** | Annual penetration test report lacks an explicit **PCI DSS v4.0 Requirement 11.4.5 Segmentation Verification Scan**. | **MEDIUM** | Contract accredited QSA/penetration testing firm to execute isolation checks and VLAN hopping tests from VLAN 10 to VLAN 40. | December 15, 2026 |

---

## 6. QSA Challenge Preparation (Auditor Defense)

Anticipated challenges during a PCI DSS formal assessment and defensible responses based on implemented controls:

### QSA Challenge 1: "Your Call Center agents enter card details into a web browser. How do you prevent agents from copying card numbers to the clipboard or local disk?"
> **Defensible Response:**  
> "We enforce strict host-hardening policies via Group Policy Objects (GPOs) and CrowdStrike EDR policies on all `CC-WORKSTATION` endpoints:
> 1. Windows Clipboard history and cross-device syncing are completely disabled.
> 2. Local USB storage and physical media drives are hardware-disabled.
> 3. Local user accounts have non-administrative rights, preventing browser extension installation.
> 4. Screen-capture tools and print-screen keys are suppressed by endpoint security policies."

### QSA Challenge 2: "Corporate Active Directory is shared between office staff and call center staff. If a corporate marketing workstation is infected with ransomware, why is the CDE not considered compromised?"
> **Defensible Response:**  
> "The CDE resides in a dedicated network segment (VLAN 40) behind `FW-CORE-01` with explicit deny-all rules against VLAN 10. While Active Directory authentication is shared, the CDE workstations reside in an isolated Organizational Unit (`OU=PCI-Endpoints`) with **Block Inheritance** enabled, preventing corporate GPOs from applying. Furthermore, local workstation administrative rights are separate, and network traffic between corporate hosts and CDE hosts is strictly blocked."

### QSA Challenge 3: "You state that your e-commerce storefront is SAQ A eligible via Shopify Plus. How do you confirm that malicious JavaScript (e.g., Magecart) hasn't been injected into the payment page?"
> **Defensible Response:**  
> "NorthPeak utilizes Shopify's hosted payment fields (iFrame architecture). The payment form fields (PAN, CVV) are rendered directly from Shopify's PCI Level 1 certified servers (`*.shopify-pay.com`). Card details never enter the DOM of NorthPeak's parent page. Furthermore, under PCI DSS v4.0 Requirement 6.4.3, we utilize a Content Security Policy (CSP) and automated script integrity monitoring via Contentking to alert on unauthorized script additions."

---

## 7. Recommendations & Remediation Roadmap

### 7.1 Immediate Actions (0–30 Days)
- [x] Configure explicit FQDN outbound URL filtering on Palo Alto `FW-CORE-01` for VLAN 40, limiting egress strictly to `api.stripe.com`.
- [x] Audit all active user accounts in `OU=PCI-Endpoints` and remove dormant accounts.
- [x] Verify CrowdStrike Falcon EDR policy is active and preventing USB storage on all 12 Call Center workstations.

### 7.2 Short-Term Actions (30–90 Days)
- [ ] Deploy Tier-1 Administrative Credentials (`admin_pci_*`) requiring YubiKey hardware MFA for jump host access (`JH-PCI-01`).
- [ ] Execute formal physical clean-room audits in the call center (ensuring no mobile phones, paper, or writing utensils are permitted).

### 7.3 Long-Term Actions (90+ Days)
- [ ] Migrate Call Center Active Directory authentication to an isolated AD Forest (`pci.northpeak.internal`) to decouple entirely from corporate AD.
- [ ] Schedule and execute the annual PCI DSS v4.0 Third-Party Penetration Test, including full segmentation checks.

---

## 8. Residual Risk Statement & Approvals

### 8.1 Residual Risk Statement
Following the execution of recommended immediate actions, the primary residual risk to NorthPeak Retail Ltd consists of:
1. **Insider Threats / Visual Memory Theft:** An agent memorizing card details visually during entry. Mitigated by physical clean-room enforcement, background checks, and call monitoring.
2. **Zero-Day Browser Exploitation:** Compromise of browser memory prior to patch release. Mitigated by CrowdStrike EDR behavioral blocking and daily patch deployment cycles.

This residual risk is formally evaluated as **Acceptable** within NorthPeak Retail Ltd's risk appetite framework.

### 8.2 Document Approval Sign-Off

| Role | Name | Title | Date | Signature Status |
| :--- | :--- | :--- | :--- | :--- |
| **Assessor** | Vusi | Lead GRC Analyst | Sept 17, 2026 | APPROVED |
| **Security Reviewer** | Taimurijlal | Chief Information Security Officer (CISO) | Sept 17, 2026 | APPROVED |
| **Business Owner** | Jane Doe | Director of Call Center Operations | Sept 17, 2026 | APPROVED |

---
*End of PCI DSS Scope Determination Document — NorthPeak Retail Ltd*
