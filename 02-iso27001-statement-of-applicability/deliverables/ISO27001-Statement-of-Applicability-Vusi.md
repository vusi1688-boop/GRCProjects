# ISO/IEC 27001:2022 Statement of Applicability (SoA)

## Document Control

| Field | Detail |
| :--- | :--- |
| **Organization** | CloudNative Analytics Ltd |
| **ISMS Scope** | Information Security Management System covering the design, development, operations, and support of the CloudNative Analytics B2B SaaS Platform hosted in AWS (eu-west-1). |
| **Standard Version** | ISO/IEC 27001:2022 |
| **Document Version** | 1.0 (Final) |
| **Approved By** | Vusi, Lead GRC Analyst / Chief Information Security Officer |
| **Last Review Date** | September 17, 2026 |

---

## Executive Summary & Control Statistics

CloudNative Analytics Ltd operates as a **100% cloud-native, fully remote SaaS organization**. This Statement of Applicability reflects a risk-driven selection of ISO 27001:2022 Annex A controls tailored specifically to our cloud operational model and risk profile.

### Control Summary Breakdown (ISO 27001:2022 — 93 Controls Total)

| Theme | Total Controls | Included | Excluded | Implemented | Partial | Planned |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **5. Organizational Controls** | 37 | 35 | 2 | 30 | 3 | 2 |
| **6. People Controls** | 8 | 8 | 0 | 7 | 1 | 0 |
| **7. Physical Controls** | 14 | 2 | 12 | 2 | 0 | 0 |
| **8. Technological Controls** | 34 | 33 | 1 | 28 | 3 | 2 |
| **TOTALS** | **93** | **78** | **15** | **67** | **7** | **4** |

---

## Key Strategic Exclusions Baseline

The following 15 controls are formally determined to be **NOT APPLICABLE** to CloudNative Analytics Ltd and are excluded from the ISMS scope:

1. **Control 5.11 (Return of assets):** Excluded for physical assets; physical assets non-existent in corporate scope (laptop remote wipe enforced via MDM).
2. **Control 5.35 (Independent review of information security):** Excluded for internal physical infrastructure; AWS SOC 2 Type II reports relied upon.
3. **Controls 7.1 to 7.10, 7.12, 7.13 (12 Physical Controls):** Excluded — Organization operates 100% remote with zero physical premises, data centers, or leased offices.
4. **Control 8.14 (Redundancy of information processing facilities):** Excluded for physical power/hardware; handled natively by AWS Multi-AZ architecture.

---

## Detailed Annex A Control Table (Sample Baseline & Core Focus Areas)

> Status Key: **IMP** = Implemented | **PAR** = Partially Implemented | **PLN** = Planned | **EXC** = Excluded / Not Applicable

### Theme 5: Organizational Controls (37 Controls)

| Control ID & Title | App? (Y/N) | Status | Risk Linkage | Justification / Applicability Rationale | Evidence / Primary Source Reference |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **5.1 Policies for info sec** | Y | IMP | R-001, R-003 | Essential governance framework for ISMS operation and regulatory compliance. | ISMS-POL-01 (Master Security Policy) |
| **5.2 Info sec roles/resp** | Y | IMP | Governance | Mandated for organizational accountability across remote engineering teams. | Org Chart, Role Responsibility Matrix |
| **5.3 Segregation of duties** | Y | IMP | R-004 | Ensures developers cannot deploy code directly to production without PR review. | GitHub Branch Protection Rules, AWS IAM |
| **5.8 Info sec in project mgmt** | Y | PAR | R-003 | Security gates required in CI/CD pipeline and product feature planning. | Jira Security Epics, PR Checklists |
| **5.11 Return of assets** | N | EXC | N/A | **EXCLUSION:** Company operates a remote MDM-wiped asset model. Employee hardware ownership transfers or remote cryptographically wiped upon exit. | MDM Remote Wipe Logs, Offboarding Policy |
| **5.23 Info sec for cloud services**| Y | IMP | R-003, R-005 | Core risk: AWS cloud misconfiguration. Mandates continuous CSPM monitoring. | Wiz.io CSPM Dashboard, AWS Security Hub |

---

### Theme 6: People Controls (8 Controls)

| Control ID & Title | App? (Y/N) | Status | Risk Linkage | Justification / Applicability Rationale | Evidence / Primary Source Reference |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **6.1 Screening** | Y | IMP | R-004 | Background checks required for all remote employees prior to issuing credentials. | Checkr Background Screening Reports |
| **6.2 Terms of employment** | Y | IMP | Governance | Non-disclosure agreements (NDAs) and Acceptable Use Policy embedded in contracts. | Executed Employee Contracts (DocuSign) |
| **6.3 Info sec awareness/training**| Y | IMP | R-001, R-002 | Mandatory security training upon hire and annually for remote workforce. | KnowBe4 Training Completion Logs |
| **6.5 Responsibilities after exit** | Y | IMP | R-001, R-004 | Access revocation within 24 hours of termination notice. | Okta Offboarding Automated Workflow Logs |

---

### Theme 7: Physical Controls (14 Controls) — Primary Exclusion Domain

| Control ID & Title | App? (Y/N) | Status | Risk Linkage | Justification / Applicability Rationale | Alternative Measures / Defense |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **7.1 Physical perimeter** | **N** | **EXC** | N/A | **EXCLUSION:** CloudNative Analytics owns/leases zero physical offices or server rooms. 100% remote. | Control 8.1 (MDM Disk Encryption) + AWS Physical Security SOC 2 Report |
| **7.2 Physical entry** | **N** | **EXC** | N/A | **EXCLUSION:** No company physical entry points exist to secure or monitor. | See Control 7.1 Defense |
| **7.3 Securing offices/rooms** | **N** | **EXC** | N/A | **EXCLUSION:** Zero corporate physical office spaces. | Acceptable Remote Work Policy (POL-08) |
| **7.4 Physical monitoring** | **N** | **EXC** | N/A | **EXCLUSION:** No physical premises for CCTV or guard monitoring. | AWS SOC 2 Type II Report (Third-Party) |
| **7.7 Clear desk / clear screen** | Y | IMP | R-002 | Applicable to remote employee home environments. Enforces 5-min screen lock. | Jamf / Intune MDM Screen Saver Policy |
| **7.8 Equipment siting/protection**| **N** | **EXC** | N/A | **EXCLUSION:** No on-premise servers, power supplies, or network racks exist. | AWS Infrastructure Redundancy |
| **7.14 Disposal of assets** | Y | IMP | R-002 | Applies to employee laptop disposal/decommissioning. | Blancco Erasure Certificates / E-Waste Vendor |

---

### Theme 8: Technological Controls (34 Controls)

| Control ID & Title | App? (Y/N) | Status | Risk Linkage | Justification / Applicability Rationale | Evidence / Primary Source Reference |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **8.1 User endpoint devices** | Y | IMP | R-002 | Full disk encryption (FileVault/BitLocker), MDM enrollment, auto-patching enforced on all laptops. | Jamf Pro Dashboard, Intune Compliance Reports |
| **8.2 Privileged access rights** | Y | IMP | R-001, R-003 | AWS IAM zero-standing-privilege model using Okta SSO with short-lived STS tokens. | AWS IAM Identity Center Configuration |
| **8.9 Config management** | Y | IMP | R-003 | Infrastructure as Code (Terraform) enforcing immutable cloud deployment configuration. | GitHub Terraform Repos, AWS Config |
| **8.24 Use of cryptography** | Y | IMP | R-001, R-005 | TLS 1.3 in transit; AES-256 at rest across S3, RDS, DynamoDB via AWS KMS. | AWS KMS Policy Audits |
| **8.28 Secure coding** | Y | IMP | R-001 | SAST/DAST automated scans running in GitHub Actions CI/CD pipelines. | Snyk Scans, SonarQube Reports |

---

## Detailed Exclusion Defense Pack (Auditor Challenge Preparation)

This section documents the explicit risk, architectural justification, and alternative controls for excluded Annex A controls to be presented to the ISO 27001 Certification Auditor.

### Exclusion Defense 1: Controls 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8, 7.9, 7.11, 7.12, 7.13 (Physical Security Theme)

#### Exclusion Statement
Physical security perimeter controls are formally evaluated as **NOT APPLICABLE** to CloudNative Analytics Ltd.

#### Business Context
CloudNative Analytics Ltd operates as a fully remote-first entity incorporated in the UK. The company:
- Operates no physical corporate offices, headquarters, or satellite spaces.
- Maintains zero physical server rooms, network infrastructure, or physical media archives.
- Hosts 100% of customer production data and application microservices in AWS `eu-west-1`.
- Registers its corporate address at a virtual registered-agent mail handling location where no processing or data storage occurs.

#### Risk Assessment Linkage & Alternative Measures
Physical risks associated with endpoint loss and cloud infrastructure are completely mitigated by non-physical technical controls:

| Physical Risk | Excluded ISO Control | Alternative Technical / Organizational Control |
| :--- | :--- | :--- |
| Laptop Theft from Remote Worker | 7.1, 7.2, 7.3 | **Control 8.1:** FileVault 256-bit XTS AES encryption mandated via MDM. Remote wipe trigger upon 3 failed password attempts or network check-in failure. |
| Unauthorized Physical Data Center Entry | 7.1, 7.2, 7.4 | **Control 5.23 & AWS SOC 2:** AWS assumes physical security responsibility. AWS physical security controls reviewed annually via SOC 2 Type II report. |
| Media / Storage Theft | 7.10 | **Control 8.24:** Customer data encrypted at rest using AWS KMS Customer Managed Keys. Physical disk theft from AWS yields unreadable ciphertext. |

#### Evidence of Non-Applicability
1. **Companies House / Corporate Registration:** Confirms registered agent office usage.
2. **AWS Billing & Architecture Diagrams:** Confirms 100% cloud footprint.
3. **HR Remote-First Contracts:** Proves 100% of staff work under remote employment agreements.

#### Auditor Q&A Defense Script
> **Auditor Question:** *"What happens if an employee rents a desk at a WeWork or co-working space? Does that not become a physical office requiring perimeter controls?"*  
> **Response:** *"No. Under policy `POL-08 (Remote Working Policy)`, co-working spaces are classified as untrusted public environments, identical to coffee shops. Employees are prohibited from leaving devices unattended, screens must auto-lock after 5 minutes, screen privacy filters are issued, and public Wi-Fi access requires mandatory connection through our corporate Cloudflare Zero Trust tunnel."*

---

### Exclusion Defense 2: Control 8.14 (Redundancy of Information Processing Facilities)

#### Exclusion Statement
On-premise hardware redundancy and physical facility redundancy controls are **NOT APPLICABLE** as physical facilities are not operated by CloudNative Analytics Ltd.

#### Business Context
CloudNative Analytics relies entirely on AWS cloud infrastructure for application hosting and data processing.

#### Risk Assessment Linkage & Alternative Measures
Facilities redundancy is delegated to AWS cloud architecture and replaced with logical cloud resilience:
- **Logical Cloud Redundancy:** Multi-Availability Zone (Multi-AZ) RDS database deployment across 3 distinct physical data centers in `eu-west-1`.
- **Auto-Scaling Groups:** Kubernetes (EKS) clusters configured across multiple AZs with automated node recovery.
- **Disaster Recovery:** Infrastructure as Code (Terraform) templates stored in GitHub enable full environment deployment to `eu-central-1` in under 2 hours.

#### Auditor Q&A Defense Script
> **Auditor Question:** *"How do you satisfy ISO 27001 disaster recovery expectations without managing redundant hardware?"*  
> **Response:** *"We fulfill control intent through logical redundancy rather than physical hardware maintenance. Our RTO (Recovery Time Objective) is 2 hours and RPO (Recovery Point Objective) is 15 minutes, verified via bi-annual automated Terraform deployment tests into secondary AWS regions."*

---

## Statement of Applicability Sign-Off

This Statement of Applicability has been prepared in accordance with ISO/IEC 27001:2022 Requirement 6.1.3(d) and reflects the actual operational context of CloudNative Analytics Ltd.

| Role | Name | Date | Signature |
| :--- | :--- | :--- | :--- |
| **Lead GRC Assessor** | Vusi | September 17, 2026 | SIGNED |
| **Chief Technology Officer** | Alex Mercer | September 17, 2026 | SIGNED |
| **External Lead Auditor** | *(ISO Certification Body)* | Pending Stage 2 Audit | PENDING |

---
*End of ISO/IEC 27001:2022 Statement of Applicability — CloudNative Analytics Ltd*
