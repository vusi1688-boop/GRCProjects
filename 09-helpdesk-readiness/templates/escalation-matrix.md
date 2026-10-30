# Escalation Matrix

> Most first-line mistakes are not technical. They are escalation mistakes: keeping something too long, or handing it on with no information. This matrix removes the judgement from the moment you are least able to make it.

## 1. When to escalate

Escalate when **any** of these is true:

| Trigger | Why |
|---------|-----|
| Outside your authorised access | You cannot act, and trying wastes the user's time |
| Outside the first-line knowledge scope | Guessing causes more damage than a fast handoff |
| Time budget exceeded (e.g. 30 minutes on one ticket) | Someone else can do it in five |
| Multiple users or a whole site affected | Impact is above your authority |
| Security-related (phishing, malware, suspicious sign-in, data loss) | Time-critical and evidence-sensitive |
| Possible data breach or POPIA relevance | Notification obligations start the clock early |
| Requests to change privilege, policy or a protected group | Not a first-line decision |
| User is distressed, threatening or the request is unethical | Escalate upward, not sideways |

## 2. Severity and priority

**Priority = impact × urgency.** Not the tone of the email, and not who asked.

| Priority | Definition | Response | Update frequency | Escalate to |
|---|---|---|---|---|
| **P1** | Critical service unavailable to a site / all users, or a suspected security breach | Immediate | Every 30 min | Service desk lead + on-call immediately |
| **P2** | Department blocked, or a single-user security incident | 30 min | Every 2 hours | Second line within 30 min |
| **P3** | Individual user cannot work, workaround unavailable | 2 hours | Daily | Second line if unresolved in 4h |
| **P4** | Request, cosmetic, or a user with a workaround | 1 working day | Every 2 days | Queue |

**Impact × urgency worked examples**

| Situation | Impact | Urgency | Priority |
|-----------|--------|---------|----------|
| No one can log in, morning | Site-wide | Critical | **P1** |
| Finance share inaccessible for all of Finance, month end | Department | High | **P1/P2** |
| User clicked a phishing link and entered their password | One user, high harm | Critical | **P2** |
| One user's mapped drive missing | Individual | Medium | **P3** |
| New starter laptop for someone starting in two weeks | Individual | Low | **P4** |
| Printer jams repeatedly in one office | Team | Medium | **P3** |

## 3. Who to escalate to

Define this for your environment; the rows are the roles, not names.

| Category | First line handles | Escalate to | Notify |
|----------|--------------------|-------------|--------|
| Password reset / unlock | Yes | — | — |
| Group membership (standard) | With approval | AD administrator (if outside delegated OU) | Manager |
| P1 outage | Triage only | Infrastructure / on-call engineer | Service desk lead, on-call manager |
| Server or DC faults | Triage only | Server / infrastructure team | Duty manager |
| Network, DNS, firewall | Diagnostics only | Network team | Duty manager |
| Security incident / phishing | Contain and capture | Security team | CISO / duty manager |
| Data loss or suspected breach | Preserve, do not remediate alone | Security + data owner (POPIA) | Information officer |
| Application bugs | Collect symptoms | Application owner / vendor | Service desk lead |
| Hardware failure under warranty | Diagnose | Vendor / hardware team | Asset owner |

## 4. How to escalate — the handoff

A handoff without these six items is a reassignment, not an escalation.

```
1. WHO     user, department, contact, location
2. WHAT    symptom, verbatim report, what changed
3. SCOPE   one user / department / site; since when
4. DONE    exact checks run, with output
5. TRIED   what you changed and whether it helped
6. IMPACT  business consequence, including any deadline
```

**Escalation note template:**

> *[P2] Finance share \\\\DC-01\\Finance inaccessible for all 6 Finance users since 08:10 today. Symptom: "network path not found". Verified: DNS resolves DC-01 correctly from two clients; `Test-NetConnection DC-01 -Port 445` fails from one, succeeds from another; `Get-SmbShare Finance` shows the share present on the server. Users confirmed they worked at 17:30 yesterday. I have not changed any permissions. Business impact: month-end invoicing blocked. Escalating to Network team — please advise whether this is a firewall rule change.*

**What that note does for you:** it makes you look competent even though you did not fix it, and it makes the second-line engineer's first 20 minutes unnecessary. That is the whole point.

## 5. What you must not do without explicit authority

- Reset a password without verifying identity
- Grant or remove privileged group membership (Domain Admins, Enterprise Admins, schema admins)
- Change a domain-level GPO
- Restore or delete a user account
- Reimage a device that may contain evidence of an incident
- Publish, forward or discuss user data outside the team
- Bypass a control "because the user needs it today" — including disabling antivirus, firewall, or a restriction
- Attempt anything on a production domain controller

**The sentence to practise:** *"I'm not authorised to change that, but I can escalate it now with everything the engineer needs. Here's what I've already checked."* A refusal with a next step is a service, not a wall.

## 6. My limits (complete in your own words)

| Task | I can do alone | I can do with approval | I escalate |
|------|----------------|------------------------|------------|
| Password reset | | | |
| Account unlock | | | |
| Group membership change | | | |
| Create user | | | |
| Disable / delete user | | | |
| GPO change | | | |
| Local admin rights | | | |
| Anything on a domain controller | | | |
| Security incident response | | | |
| Data restore | | | |

---

## 7. Review

| Version | Date | Change | Owner |
|---------|------|--------|-------|
| 1.0 | | Created from lab escalation scope | |
