# Service Ticket Log

> One row per ticket. If a row has no root cause, the ticket is not closed — it is waiting.

## Ticket ID
`SD-___`

## Reported
| Field | Value |
|-------|-------|
| Date / time reported | |
| Reported by | |
| Contact method | Phone / Email / Walk-up / Chat |
| Verbatim user report | *"..."* |
| Actual symptom (your words) | |
| Affected user(s) | |
| Affected system / host | |
| Last known working | |
| Ticket type | Incident / Request / Problem / Change |
| Category | Account / Access / Hardware / Software / Network / Mail / Security |
| Impact | One user / Team / Department / Site / Organisation |
| Urgency | Low / Medium / High / Critical |
| **Priority (derived)** | P1 / P2 / P3 / P4 |
| Priority reasoning | *e.g. "3 users in Finance blocked from invoicing = high impact, high urgency → P2"* |

---

## Triage

**Scope established:** one user / one machine / one department / everyone
**Is it a known issue?** KB reference or "no"
**Can it wait?** yes / no — and who agreed

### Hypotheses (cheapest first)
| # | Hypothesis | Test | Result |
|---|------------|------|--------|
| 1 | | | Confirmed / Rejected |
| 2 | | | |
| 3 | | | |

**First hypothesis correct?** Yes / No

---

## Investigation

| Time | Action | Output / observation |
|------|--------|----------------------|
| | | |
| | | |
| | | |

**Commands / tools used:**
```
```

**Evidence captured:** screenshot / command output / event log / export — file references below
- 

---

## Root cause

> *One or two sentences. "The GPO was linked to the Computers OU, but a drive map is a user policy" — not "GPO issue".*

**Is this the cause, or the symptom?** (If symptom, open a Problem record — reference:)

---

## Resolution

| Field | Value |
|-------|-------|
| Action taken | |
| Change type | Configuration / Identity / Hardware / User education / No fault |
| Reversible? | Yes / No — rollback: |
| Verified with user | Yes / No — how: |
| Verified by | *(you / second pair of eyes)* |
| Resolved at | |

**User communication sent:**
> *Plain language, no jargon, tells them what happened and what to do if it recurs.*

---

## Closure

| Metric | Value |
|--------|-------|
| Time to first response | |
| Time to resolution | |
| Number of contacts | |
| Escalated? | Yes / No — to whom / why |
| Reopened? | Yes / No |
| KB article created? | Yes / No — link |
| Follow-up needed? | Yes / No — what |

**What I would do differently next time:**
> *Required field. One sentence. This is the one that gets read in an interview.*

---

## Related

- Linked tickets:
- Project reference (e.g. `09-helpdesk-readiness/lab-audit-and-fixes.md#finding-6`):
- Framework / control relevance (optional): *e.g. this is the leaver-removal SLA in Project 07*
