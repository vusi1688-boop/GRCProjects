# GRC Portfolio 2026: Decision-Making Under Real Constraints

A practical portfolio of Governance, Risk, and Compliance projects that demonstrate **judgment, not memorization** — combined with an Active Directory identity track and a service desk readiness track built from a real home lab. These projects mirror how security decisions are actually made inside organizations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GRC PROFESSIONAL MINDSET                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                │
│   │  Activity   │  ≠   │   Impact    │  =   │  Judgment   │                │
│   │  (Weak)     │      │  (Strong)   │      │  (Goal)     │                │
│   └─────────────┘      └─────────────┘      └─────────────┘                │
│                                                                             │
│   Control mappings     Risk-driven         Defending decisions             │
│   Policy templates     decisions           under uncertainty               │
│   Framework lists      Business context    Trade-off analysis              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why This Portfolio Exists

The GRC market has matured. Framework familiarity is assumed. Documentation alone is no longer impressive.

**What organizations actually need:**
- People who can interpret requirements
- Professionals who balance competing priorities
- Individuals who defend decisions when challenged

**What this portfolio demonstrates:**
- Understanding of *why* controls exist
- Judgment about *when* controls matter and when they don't
- Ability to justify security decisions when answers aren't obvious

---

## Portfolio Projects

The portfolio runs in three tracks. The **GRC track** builds the arguments. The **Identity Governance track** builds the ground those arguments stand on: Active Directory is the system that records who had access, so it is the system that decides whether any compliance claim is verifiable. The **Service Desk track** is the practical route in — a real lab, audited honestly, worked as a ticket queue.

### Track A — GRC Decision-Making

| # | Project | Framework/Domain | Core Skill Demonstrated |
|---|---------|------------------|------------------------|
| 01 | [PCI DSS Network Segmentation Review](./01-pci-dss-network-segmentation/) | PCI DSS | Defending risk claims under audit scrutiny |
| 02 | [ISO 27001 Statement of Applicability](./02-iso27001-statement-of-applicability/) | ISO 27001 | Risk-driven control exclusions |
| 03 | [EU AI Act High-Risk Assessment](./03-eu-ai-act-high-risk-assessment/) | EU AI Act | Translating regulation to operational reality |
| 04 | [GRC Control Automation](./04-grc-control-automation/) | GRC Engineering | Bridging governance and engineering |
| 05 | [Risk Acceptance Documentation](./05-risk-acceptance-documentation/) | Enterprise Risk | Communicating risk to business leaders |

### Track B — Identity Governance in Active Directory

One shared scenario, **Kopano Financial Services**, read as a single programme: draw the boundary, prove it holds, own what is left.

| # | Project | Framework/Domain | Core Skill Demonstrated |
|---|---------|------------------|------------------------|
| 06 | [Defending a Tier 0 Boundary](./06-ad-tiered-administration/) | AD architecture, ISO 27001, PCI DSS 4.0 | Scoping privileged access and defending the boundary |
| 07 | [Continuous Access Evidence](./07-ad-access-review-evidence/) | Audit evidence, SOC 2, PCI DSS 4.0 | Making "who had access on this date" answerable |
| 08 | [Hardening Exceptions as Debt](./08-ad-hardening-exception-and-risk-acceptance/) | CIS Benchmarks, risk acceptance | Time-boxed, owned, priced exceptions |

### Track C — Service Desk Readiness

The practical track: turning a real home lab into evidence for a first-line support role, starting from **Vusi.lab** (Windows Server 2022 domain controller + Windows 11 client).

| # | Project | Domain | Core Skill Demonstrated |
|---|---------|--------|------------------------|
| 09 | [Service Desk Readiness](./09-helpdesk-readiness/) | Windows Server, AD, GPO, service management | Auditing your own build honestly, working a ticket queue, converting mistakes into interview evidence |
| 10 | [Career Strategy](./10-career-strategy/) | Career positioning, lab roadmap, certification order | Choosing a wedge, sequencing skill acquisition by employer value, honest self-assessment |

**Start here if you are reviewing my work:** [`IDENTITY-GOVERNANCE-BRIDGE.md`](./IDENTITY-GOVERNANCE-BRIDGE.md) — the matrix that connects every AD control to its obligation, plus the four mapping myths that make such matrices dangerous.

```
          TRACK A asks:  "Is this risk decision defensible?"
          TRACK B asks:  "Is the evidence for it true, current, complete?"

   01  Segmentation claim ─┐
   02  SoA status claims ──┤
   05  Risk acceptance ────┤
                            ▼
          ┌───────────────────────────────────┐
          │ 06  The directory that records    │
          │     who had access, and           │
          │     who could change that record  │
          └─────────────────┬─────────────────┘
                            ▼
          ┌───────────────────────────────────┐
          │ 07  Evidence that survives a      │
          │     hostile question              │
          └─────────────────┬─────────────────┘
                            ▼
          ┌───────────────────────────────────┐
          │ 08  What is left, priced and      │
          │     expiring                      │
          └───────────────────────────────────┘

          A GRC professional who cannot explain 06-08 is asserting things
          about a system they have not examined. That is the point of the
          combined portfolio.
```

---

Track C sits underneath the other two in a different way. It is where the identity knowledge becomes a daily job: resetting a password without breaking a delegation model, disabling an account properly, and knowing which requests you must escalate. See [`09-helpdesk-readiness/`](./09-helpdesk-readiness/) for the 30-day plan, the ticket diet and the CV pack, and [`10-career-strategy/`](./10-career-strategy/) for the CISO review, the twelve-month arc, and the [`AD-WALKTHROUGH`](./10-career-strategy/AD-WALKTHROUGH.md) — eleven hand-held sessions from a fresh lab to an environment you can defend.

---

## The Difference Between Weak and Strong GRC Work

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        WEAK GRC PROJECT                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  • Screenshots of compliance dashboards                                      │
│  • Control mappings without context                                          │
│  • Copied policy templates                                                   │
│  • Lists of frameworks "worked with"                                         │
│  • Diagrams without defensible arguments                                     │
│                                                                              │
│  Result: Looks like coursework. AI can produce this.                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        STRONG GRC PROJECT                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  • Scenario with realistic constraints                                       │
│  • Documented assumptions and trade-offs                                     │
│  • Explicit decisions with justifications                                    │
│  • Anticipated challenges and responses                                      │
│  • Clear explanation of residual risk                                        │
│                                                                              │
│  Result: Demonstrates judgment. Shows how you think.                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## How to Use This Portfolio

### For Learning
1. Work through each project sequentially
2. Complete all exercises and document your reasoning
3. Record a walkthrough explaining your decisions (Loom or similar)
4. Have your work reviewed by a peer or mentor

### For Job Applications
1. Fork this repository
2. Complete 2-3 projects thoroughly (depth over breadth)
3. Customize scenarios to industries you're targeting
4. Include your video walkthroughs in applications

**Suggested combinations**

| Target role | Complete | Why this pairing |
|-------------|----------|------------------|
| GRC Analyst / Compliance | 02, 05, 08 | Risk-driven exclusions, owned risk acceptance, time-boxed exceptions |
| IAM / Identity Governance | 06, 07, 08 | Boundary, evidence, and honest debt in one narrative |
| Security Engineer → GRC | 04, 06, 07 | Automation design plus the evidence it must produce |
| Audit / Assurance | 01, 07 | Defending a claim, then proving it for any date |
| AI Governance | 03 + 02 | Regulation translated into a scoped, defensible SoA |
| Service desk / first line | 09 + 06 + 07 | Ticket discipline, plus why the privileged account you touch matters |

Do not complete all eight at a shallow level. Two projects with real measurements, a named owner, and a documented failure beat eight with diagrams.

### Project Structure (Each Folder)
```
project-folder/
├── README.md           # Project overview and instructions
├── scenario.md         # Detailed scenario description
├── templates/          # Working templates to complete
├── examples/           # Reference examples (not to copy)
└── deliverables/       # Your completed work goes here
```

---

## Success Metrics

Your project is strong if you can answer "yes" to these questions:

| Question | Why It Matters |
|----------|----------------|
| Would this survive a real audit? | Auditors challenge assumptions |
| Can I explain this to a non-technical executive? | GRC bridges technical and business |
| Have I documented what I *excluded* and why? | Exclusions show judgment |
| Did I identify where the argument breaks down? | Honesty builds credibility |
| Can I walk someone through my reasoning in 5 minutes? | Communication is the job |

---

## Real GRC Truth

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   "Real GRC work is messy. Requirements are vague. Business constraints     │
│    are real. Perfect compliance is almost never achievable. And most of     │
│    the job involves explaining uncomfortable truths to people who would     │
│    rather hear simple answers."                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/vusi1688-boop/GRCProjects.git

# Navigate to a project
cd GRCProjects/06-ad-tiered-administration

# Read the project README
# Complete the exercises
# Document your reasoning
# Record your walkthrough
```

### Browsable portfolio site

The whole portfolio is also presented as a static site — projects, skills matrix and evidence framing on one page, with no build step:

```bash
# From the repository root
python3 -m http.server 8000
# then open http://localhost:8000/site/
```

It is plain HTML, CSS and a small amount of JavaScript, so it can be hosted on GitHub Pages, Netlify or S3 without any tooling. Content is generated from `site/portfolio.js`, so edits to project descriptions happen in one place. There is also a print-ready CV at [`site/resume.html`](./site/resume.html) — open it and use Print → Save as PDF.

---

## Contributing

Found ways to improve these projects? Contributions welcome:
- Additional realistic scenarios
- Industry-specific variations
- Improved templates
- Feedback on exercise clarity

---

## License

MIT License - Use these projects for learning and professional development.

---

*These projects are designed to help you prove that you can help an organization make better security decisions. That is what makes a GRC professional stand out in 2026.*
