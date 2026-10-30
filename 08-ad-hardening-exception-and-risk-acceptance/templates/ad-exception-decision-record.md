# AD Hardening Exception Decision Record

> One record per exception. Do not combine multiple exceptions into one document.
> If any required section is empty, the exception is **not approved**.

## Document Information
| Field | Value |
|-------|-------|
| Exception ID | EX-[NN] |
| Organisation | [Company Name] |
| Benchmark / control source | [CIS Windows Server 2022 v3.0 / internal standard / pentest finding] |
| Control reference | [e.g. CIS 2.3.11.4] |
| Author | [Name] |
| Version | 1.0 |
| Date raised | [Date] |

---

## 1. What Is Not Applied

| Field | Value |
|-------|-------|
| Control requirement (verbatim) | [Quote the benchmark text] |
| Current state | [What is actually configured] |
| Delta | [Exact difference] |
| Assets affected | [Count + list or reference] |
| Data classification of affected assets | [Public / Internal / Confidential / Cardholder / PII] |

---

## 2. Scope

| Dimension | Included | Excluded | Justification for exclusions |
|-----------|----------|----------|------------------------------|
| Systems / servers | | | |
| Endpoints | | | |
| Service accounts | | | |
| Users / groups | | | |
| Network segments | | | |
| Environments (prod/non-prod) | | | |

**Scope discipline test:** can someone else determine whether a given system is in scope from this section alone? Yes / No

---

## 3. Why (Verified Constraint)

| Claim | Verified by | Verification date | Evidence reference |
|-------|-------------|-------------------|--------------------|
| [Vendor states no support for X] | | | |
| [Application breaks when X applied] | | | |
| [Contract requires X until date] | | | |

### 3.1 Verification method
| Method | Used | Notes |
|--------|------|-------|
| Vendor documentation / support case | Yes / No | |
| Controlled test in non-production | Yes / No | |
| Attempted change with rollback tested | Yes / No | |
| Relayed by another team without evidence | Yes / No | ← if only this, the exception is unverified |

---

## 4. Exposure Analysis

| Question | Answer |
|----------|--------|
| How many principals could traverse this gap? | |
| Is any affected asset on a path to Tier 0? | Yes / No — which path |
| What does this give an attacker they do not already have? | |
| Realistic exploitation effort (tooling, time, skill) | |
| Blast radius in business terms | |
| Would existing detection fire? (rule ID) | |
| Data or regulatory exposure (POPIA / PCI / GDPR) | |

### 4.1 Severity rationale
| Factor | Rating | Reasoning |
|--------|--------|-----------|
| Likelihood | Low / Med / High | |
| Impact | Low / Med / High / Critical | |
| Detection likelihood | Low / Med / High | |
| **Overall** | | [Must be a reasoning statement, not only a label] |

---

## 5. Compensating Controls

| ID | Control | Type | Owner | Tested | Last test | Result |
|----|---------|------|-------|--------|-----------|--------|
| CC-01 | [Detection rule DET-xxx] | Detective | | Yes / No | | |
| CC-02 | [Network restriction] | Preventive | | | | |
| CC-03 | [Attestation] | Administrative | | | | |

### 5.1 Five-test assessment
| Test | Pass / Fail | Evidence |
|------|-------------|----------|
| 1. Detects rather than documents | | |
| 2. Independent of the protected asset | | |
| 3. Tested, with a record | | |
| 4. Has an owner and a response SLA | | |
| 5. Reduces the specific path | | |

**If any test fails, state the gap here and treat it as residual risk:**
> *[e.g. "Test 3 fails: DET-221 has a written test plan but has not been exercised. First test scheduled 2026-03-10. Until then this exception has no verified detection and is escalated to the risk committee."]*

---

## 6. Ownership

| Role | Name | Accountable for | Contact |
|------|------|-----------------|---------|
| Business risk owner (signs) | | Accepting the residual risk | |
| Technical owner | | Implementing compensating controls | |
| Monitoring owner | | Alert response within SLA | |
| GRC oversight | | Reporting and expiry management | |

> The business risk owner must be the person whose operation depends on the exception, not a member of the security team.

---

## 7. Expiry

| Field | Value |
|-------|-------|
| Expiry date | [YYYY-MM-DD — max 12 months] |
| Maximum permitted duration | [Policy limit] |
| Renewal requires | Fresh exposure analysis + compensating control test + risk committee approval |
| 30-day notification to | [Owner] |
| Behaviour at expiry | Item enters standard change process and the control is **applied automatically** |
| Escalation if unaddressed at expiry +30 days | Risk committee + internal audit, recorded as unapproved deviation |

### 7.1 Remediation plan
| Milestone | Date | Owner | Status |
|-----------|------|-------|--------|
| Vendor engaged / business case | | | |
| Budget approved | | | |
| Change scheduled | | | |
| Control applied | | | |

---

## 8. Cost

| Item | Amount / Effort | Basis |
|------|-----------------|-------|
| Cost of the deviation (annualised) | | |
| One-off cost to fix | | |
| Ongoing effort to maintain the exception | [hrs/month, team] | |
| Opportunity cost / blocked projects | | |

**Statement:** *[One sentence a CFO would accept, e.g. "We are accepting a medium exposure on two service accounts to avoid a R900k ERP upgrade this financial year. The alternative is a three-week change window in Q3."]*

---

## 9. Decision

| Decision | Tick |
|----------|------|
| Approved as stated | |
| Approved with conditions (list below) | |
| Rejected — control must be applied by [date] | |
| Deferred — additional information required | |

**Conditions:**
1.
2.

**Reasoning:**
> *[2–4 sentences. What was weighed, what was discounted, and what would change the decision.]*

---

## 10. Signatures

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| Business risk owner | | | | |
| CISO (recommendation) | | | | |
| Risk committee (if above threshold) | | | | |
| Internal audit (notified) | | | | |

---

## 11. Review History

| Date | Reviewer | Outcome | Change | New expiry |
|------|----------|---------|--------|------------|
| | | Renewed / Amended / Closed | | |

### 11.1 Closure record (on remediation)
| Field | Value |
|-------|-------|
| Control applied on | |
| Verified by | |
| Compensating controls retired on | |
| Evidence of closure | |
| Recorded in debt report | Yes / No |
