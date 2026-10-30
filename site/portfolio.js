/* GRC × Identity Governance portfolio — content and rendering.
   All site copy lives here so project descriptions are edited in one place.
   No dependencies, no build step. */

const PORTFOLIO = {
  repo: "https://github.com/vusi1688-boop/GRCProjects",
  branch: "main",

  projects: [
    {
      num: "01",
      dir: "01-pci-dss-network-segmentation",
      track: "grc",
      trackLabel: "Track A · GRC",
      title: "PCI DSS Network Segmentation Review",
      tags: ["PCI DSS 4.0", "Segmentation", "QSA scrutiny"],
      why: "Treating “we are segmented” as a risk claim that must be defended, not a diagram that must be drawn.",
      scenario:
        "MidTech Retail Solutions, ~2.4 million card transactions a year, believes its cardholder data environment is segmented. The assessment has to establish whether the segmentation genuinely reduces scope or creates false assurance.",
      decision:
        "Decide which systems are actually in scope, which trust relationships silently extend it, and where the design fails — then defend that position the way a QSA would attack it.",
      evidence: [
        "Scope determination with every exclusion justified, not assumed",
        "Trust-relationship map showing implicit paths into the CDE",
        "Documented answer to the challenge: “prove that host cannot reach cardholder data”",
        "Residual scope risk, stated in business terms"
      ],
      deliverable: "templates/scope-determination-template.md"
    },
    {
      num: "02",
      dir: "02-iso27001-statement-of-applicability",
      track: "grc",
      trackLabel: "Track A · GRC",
      title: "ISO 27001 Statement of Applicability",
      tags: ["ISO 27001:2022", "Annex A", "Exclusions"],
      why: "A SoA is where an organisation admits what it does not do. Most are written to avoid that admission.",
      scenario:
        "CloudNative Analytics: 85 fully remote staff, 100% AWS, no data centres, no mobile development, API-only product, 200+ enterprise customers requiring certification within six months.",
      decision:
        "Build a risk-driven SoA that excludes controls with a defensible argument, marks implementation status honestly, and refuses the junior instinct to include all 93 controls “to be safe”.",
      evidence: [
        "93-control assessment with a justification per exclusion",
        "Honest status split: implemented, partial, planned — no aspirational ticks",
        "Exclusion reasoning drawn from the risk register, not from convenience",
        "Identification of the controls whose exclusion is the weakest argument"
      ],
      deliverable: "templates/soa-template.md"
    },
    {
      num: "03",
      dir: "03-eu-ai-act-high-risk-assessment",
      track: "grc",
      trackLabel: "Track A · GRC",
      title: "EU AI Act High-Risk Assessment",
      tags: ["EU AI Act", "Fundamental rights", "Human oversight"],
      why: "Regulation translated into an operational decision, rather than summarised into a list of articles.",
      scenario:
        "TalentMatch AI scores and ranks candidates for 150+ enterprise clients from Amsterdam. A system that decides who gets interviewed is a system with fundamental-rights consequences.",
      decision:
        "Classify the system, assess against the high-risk obligations, evaluate whether human oversight is real or theatrical, and make a deployment recommendation that a regulator could review.",
      evidence: [
        "Classification reasoning with the boundary cases argued, not asserted",
        "Obligation-by-obligation assessment with evidence per obligation",
        "Human-oversight evaluation that distinguishes review from rubber-stamping",
        "Documented deployment decision and its conditions"
      ],
      deliverable: "templates/ai-assessment-template.md"
    },
    {
      num: "04",
      dir: "04-grc-control-automation",
      track: "grc",
      trackLabel: "Track A · GRC",
      title: "Automating a GRC Control",
      tags: ["GRC engineering", "SOC 2", "Access review"],
      why: "Manual controls fail silently. Automation moves the failure mode from invisible to visible — if you design for it.",
      scenario:
        "DataStream Technologies failed privileged access review in two consecutive audits. The quarterly spreadsheet process takes four weeks, and the data is stale before it reaches a manager.",
      decision:
        "Redesign the control around its actual intent — continuous appropriateness, not quarterly compliance — and be explicit about what must remain manual.",
      evidence: [
        "Control-intent analysis separating the compliance minimum from the security objective",
        "Failure-point analysis of all eight manual steps",
        "Detection rules and automated evidence design auditors can read",
        "A named list of what stays manual, and why automation cannot own it"
      ],
      deliverable: "templates/control-automation-design.md"
    },
    {
      num: "05",
      dir: "05-risk-acceptance-documentation",
      track: "grc",
      trackLabel: "Track A · GRC",
      title: "Risk Acceptance for a Security Gap",
      tags: ["Enterprise risk", "PCI DSS", "Board communication"],
      why: "A risk acceptance is a business decision. When security signs its own, the risk was never owned.",
      scenario:
        "FinanceFlow processes $2B a year through a legacy reconciliation system with a shared database admin account whose password is 18 months old and known to 15 people. Replacing it takes 12–18 months.",
      decision:
        "Write an acceptance a CFO can act on: plain language, specific evidence, honest trade-off, and an accountable business owner — not a permission slip written in jargon.",
      evidence: [
        "Plain-language exposure statement with comparable incidents and costs",
        "Compensating controls with realistic effectiveness claims",
        "Explicit statement of what would change the decision",
        "Signature structure that puts acceptance with the business"
      ],
      deliverable: "templates/risk-acceptance-template.md"
    },

    {
      num: "06",
      dir: "06-ad-tiered-administration",
      track: "identity",
      trackLabel: "Track B · Identity",
      title: "Defending a Tier 0 Boundary in a Flat Active Directory",
      tags: ["AD tiering", "ISO 27001", "PCI DSS 4.0", "CIS v8.1"],
      why: "If Tier 0 falls, every compliance artefact in the organisation becomes unverifiable — and nobody notices.",
      scenario:
        "Kopano Financial Services: single forest, 12 standing Domain Admins, 4 Enterprise Admins, 340 protected objects, a backup service account with DCSync-equivalent rights, and Domain Admin logons on 31 workstations. The CISO asks whether removing Domain Admins is enough. It is not.",
      decision:
        "Draw the transitive boundary — not just domain controllers, but backup, EDR, hypervisor and the hybrid sync server — then enforce it with separated admin accounts, PAWs, authentication silos and time-boxed access, sequenced around a 24/7 lending operation.",
      evidence: [
        "Tier 0 register with named owners and a dependency register",
        "Current-state measurements with the exact query used for each",
        "Target model: account tiers, enforcement controls, test that proves each",
        "Migration sequenced against helpdesk and change-window reality",
        "Residual risk with owners and review dates"
      ],
      deliverable: "templates/tier0-scoping-template.md"
    },
    {
      num: "07",
      dir: "07-ad-access-review-evidence",
      track: "identity",
      trackLabel: "Track B · Identity",
      title: "Continuous Evidence — “Show Me Last Tuesday”",
      tags: ["Audit evidence", "SOC 2", "PCI DSS 4.0", "Detection"],
      why: "A quarterly review is true on the day it is signed. An auditor asks about a different day.",
      scenario:
        "A signed 1,240-row access review turned out to reference 37 already-disabled accounts and omit 9 privileged grants created after the export. Nobody lied; the process was simply not connected to reality.",
      decision:
        "Build evidence from the audit questions backwards: what state existed on a date, who approved each change, what happened between reviews, whether leavers were removed in SLA — and what happens when collection itself stops.",
      evidence: [
        "Evidence specification: question → source → freshness → retention → confidence",
        "Seven detection rules, each mapped to an obligation and a response owner",
        "Unattributed-grant handling that never assumes approval",
        "Tamper-evidence design, with its detection-not-prevention limit stated",
        "An evidence pack with limitations on page one"
      ],
      deliverable: "templates/access-evidence-pack-template.md"
    },
    {
      num: "08",
      dir: "08-ad-hardening-exception-and-risk-acceptance",
      track: "identity",
      trackLabel: "Track B · Identity",
      title: "Hardening Exceptions as Debt, Not Drift",
      tags: ["CIS Benchmarks", "Risk acceptance", "NTLM", "Kerberos"],
      why: "An exception without an expiry is not a decision. It is the architecture, and nobody remembers choosing it.",
      scenario:
        "Nine CIS hardening items cannot be applied: NTLM still needed by the ERP, RC4 required by two applications, unconstrained delegation on a print cluster, 180 endpoints that cannot run Windows LAPS. An ISO auditor will ask how these are monitored.",
      decision:
        "Publish a default position with automatic lapse behaviour, verify each blocking constraint rather than relaying it, quantify exposure by path rather than severity label, and refuse the exceptions that have no honest compensating control.",
      evidence: [
        "Written default position and what happens on expiry",
        "Five-test assessment for every compensating control, including failures",
        "Cost model: cost of the deviation, cost to fix, effort to maintain",
        "Ten-section decision record per exception, signed by a business owner",
        "One-page debt ageing report with detection coverage"
      ],
      deliverable: "templates/ad-exception-decision-record.md"
    },
    {
      num: "09",
      dir: "09-helpdesk-readiness",
      track: "career",
      trackLabel: "Track C · Career",
      title: "Service Desk Readiness — Lab to Hireable Evidence",
      tags: ["Windows Server 2022", "Active Directory", "GPO", "Service desk"],
      why: "A home lab proves you can build a domain. A ticket log proves you can be trusted with one.",
      scenario:
        "Vusi.lab: a three-day build of a Server 2022 domain controller, a Windows 11 client, departmental OUs, RBAC file shares, Group Policy, RSAT and PowerShell provisioning — and a 30-day route into a first-line support role from Johannesburg.",
      decision:
        "Stop describing the lab as a feature list and treat it as an environment inherited by a support analyst: audit what was built wrong, work 16 simulated tickets, and convert the mistakes into interview evidence.",
      evidence: [
        "14-finding lab audit with fixes, including an over-privileged Domain Admin account",
        "16 specified tickets with expected diagnoses, root causes and metric tracking",
        "Onboarding and offboarding checklists tested end to end",
        "Escalation matrix with named limits and structured handoff format",
        "CV pack with before/after bullets and a STAR story bank",
        "30-day plan with applications starting on Day 7, not Day 30"
      ],
      deliverable: "templates/ticket-log-template.md"
    },
    {
      num: "10",
      dir: "10-career-strategy",
      track: "career",
      trackLabel: "Track C · Career",
      title: "Career Strategy — A CISO's Honest Read",
      why: "Two profiles, one wedge. Interviewers hire a sentence, not a project count.",
      scenario:
        "A GRC portfolio that can reason about risk, and an on-premises AD lab that can operate the machinery — built by someone with no professional IT experience, applying for first-line support in Johannesburg.",
      decision:
        "Stop applying for two careers. Position as an identity-minded support engineer, sequence the next twelve months behind three gates, and close the cloud gap before adding another project.",
      evidence: [
        "Honest profile assessment: what is hireable today, and what is not",
        "12-month arc in three phases, each with a pass/fail gate",
        "Certification order with the reasoning and what to skip",
        "16-build lab roadmap ordered by employer value per hour",
        "Five risks that sink career changers, and the mitigation for each",
        "Weekly log the mentor reads — including the weeks that went badly"
      ],
      deliverable: "CISO-MENTOR-REVIEW.md"
    }
  ],

  resume: "resume.html",


  skills: [
    ["Privileged access scoping", "06 · Tier 0 boundary", "Tier 0 register + dependency register"],
    ["Identity risk quantification", "06, 08", "Exposure by path, principals and effort"],
    ["Control-to-framework mapping", "Bridge document", "25-row matrix, 5 frameworks, caveats included"],
    ["Audit evidence design", "07", "Evidence spec with freshness and retention"],
    ["Detection rule design", "07", "7 rules mapped to obligations and owners"],
    ["Tamper-evidence reasoning", "07", "WORM + hash chain, with stated limits"],
    ["Exception governance", "08", "Decision record + automatic lapse clause"],
    ["Compensating control assessment", "08", "Five tests, applied honestly to failures"],
    ["Regulatory interpretation", "03", "EU AI Act assessment with a deployment decision"],
    ["Risk communication to the business", "05, 08", "Plain-language exposure and cost statements"],
    ["Control automation design", "04, 07", "Manual-vs-automated split with reasons"],
    ["Defending a decision under challenge", "all", "Written audit response packs"],
    ["Structured troubleshooting", "09", "16 tickets with hypothesis + test records"],
    ["Ticket triage and prioritisation", "09", "Priority derived from impact × urgency"],
    ["Onboarding / offboarding execution", "09", "Both checklists tested on a live account"],
    ["Escalation discipline", "09", "Matrix with named limits and handoff template"],
    ["User communication", "09", "Plain-language resolution notes and KB articles"],
    ["Career sequencing", "10", "Lab roadmap ordered by employer value"],
    ["Positioning and narrative", "10", "One wedge, one sentence, three gates"]
  ],

  ladder: [
    ["Can you state the decision you made?", "A project without a decision is a summary."],
    ["Can you show the measurement behind it?", "Counts, owners and queries — not adjectives."],
    ["Can you name what you excluded, and why?", "Exclusions are where judgment becomes visible."],
    ["Can you show a control that failed or was never tested?", "Every programme has one. Hiding it costs credibility."],
    ["Can you answer a question you were not asked?", "“Show me the 14th of May” is the real test of evidence."],
    ["Would this survive an auditor who assumes you built it to pass?", "The only standard worth holding."]
  ],

  bridge: {
    chain: [
      ["01", "PCI segmentation claim — depends on knowing what can reach the cardholder environment"],
      ["02", "SoA status statements — depend on evidence current at the assessment date"],
      ["05", "Signed risk acceptance — depends on the exposure figures being true"],
      ["→", "All of it depends on the directory that records who had access, and who could change that record"]
    ],
    proofs: [
      ["ISO 27001", "Traceability to risk assessment, and evidence that is current"],
      ["PCI DSS 4.0", "Demonstrable absence of a path to cardholder data"],
      ["CIS v8.1", "The specific safeguard implemented at your claimed IG level"],
      ["SOC 2", "Operation across the whole audit period, not at period end"],
      ["NIST CSF / 800-53", "Continuous monitoring with corrective action"]
    ],
    myths: [
      ["“One control, six frameworks — that is efficiency.”", "It usually means the references are coarse. A mapping row tells you which obligation you are addressing, never whether you addressed it."],
      ["“If it maps to nothing, it is not needed.”", "Sometimes true — and deleting institutional habit is a legitimate recommendation. But a requirement mapping to nothing is a coverage gap that belongs in your SoA."],
      ["“We are not in the CDE, so PCI does not apply.”", "A domain controller in the corporate zone that trusts a CDE workstation is a path. Requirement 12.5.2.1 asks you to confirm scope annually; a diagram is not a confirmation."],
      ["“The auditor signed it off.”", "Auditors sample. Your leaver-removal control can pass 20 samples and fail on the 21st. Design for the population, not the sample."]
    ],
    matrix: [
      ["Tier 0 register with owners", "A.5.9", "12.5.1", "1.1", "CC6.1"],
      ["Separate admin accounts per tier", "A.8.2", "7.2.2", "5.4", "CC6.3"],
      ["Just-in-time privileged access", "A.8.2", "7.2.1", "6.1", "CC6.3"],
      ["Logon restriction on Tier 0", "A.8.3", "7.2.1", "6.8", "CC6.1"],
      ["Replication rights removed", "A.8.2", "7.2.1", "5.4", "CC6.1"],
      ["DAILY privileged state snapshot", "A.5.18", "7.2.4", "5.1", "CC6.2"],
      ["Unapproved grant detection", "A.8.16", "10.4.1", "8.11", "CC7.2"],
      ["Tamper-evident evidence store", "A.5.28", "10.5.1", "8.9", "CC7.2"],
      ["Exception with owner and expiry", "A.5.36", "6.3.2", "4.1", "CC7.3"],
      ["Compensating control, tested", "A.8.16", "10.4.1", "8.11", "CC7.2"]
    ]
  }
};

/* ------------------------------------------------------------------ */

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

const projectLink = (repo, branch, p, label) => {
  const a = el("a", "card-link", label);
  a.href = `${repo}/blob/${branch}/${p.dir}/README.md`;
  a.target = "_blank";
  a.rel = "noopener";
  return a;
};

function renderProjects() {
  const grid = document.getElementById("project-grid");
  const { repo, branch } = PORTFOLIO;

  PORTFOLIO.projects.forEach((p) => {
    const card = el("article", `card track-${p.track}`);
    card.dataset.track = p.track;

    const top = el("div", "card-top");
    top.append(el("span", "card-num", p.num));
    top.append(el("span", "card-track", p.trackLabel));
    card.append(top);

    card.append(el("h3", null, p.title));
    card.append(el("p", "card-why", p.why));

    const tags = el("div", "tags");
    p.tags.forEach((t) => tags.append(el("span", "tag", t)));
    card.append(tags);

    const btn = el("button", "card-toggle", "What it demonstrates");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");

    const body = el("div", "card-body");
    body.hidden = true;

    const fields = [
      ["Scenario", p.scenario],
      ["The decision", p.decision],
      ["Evidence produced", null]
    ];

    fields.forEach(([label, text]) => {
      const f = el("div", "field");
      f.append(el("h4", null, label));
      if (text) {
        f.append(el("p", null, text));
      } else {
        const ul = el("ul");
        p.evidence.forEach((e) => ul.append(el("li", null, e)));
        f.append(ul);
      }
      body.append(f);
    });

    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      body.hidden = open;
      card.classList.toggle("is-open", !open);
      btn.textContent = open ? "What it demonstrates" : "Close";
    });

    card.append(btn);
    card.append(body);
    card.append(projectLink(repo, branch, p, `Read project ${p.num} →`));
    grid.append(card);
  });

  const chips = document.querySelectorAll(".chip");
  const note = document.getElementById("filter-note");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const track = chip.dataset.track;
      document.querySelectorAll(".card").forEach((card) => {
        card.hidden = track !== "all" && card.dataset.track !== track;
      });
      note.innerHTML =
        track === "career"
          ? "Projects 09–10 are the career track: an honest lab audit, 16 worked tickets, and a twelve-month plan with gates."
          : track === "identity"
          ? "Projects 06–08 share one scenario (<em>Kopano Financial Services</em>): draw the boundary, prove it held, own what is left."
          : track === "grc"
            ? "Projects 01–05 build defensible GRC decisions across five frameworks."
            : "Projects 06–08 share one scenario (<em>Kopano Financial Services</em>) and read as a single programme.";
    });
  });
}

function renderBridge() {
  const host = document.getElementById("bridge-body");
  const b = PORTFOLIO.bridge;

  // 1. dependency chain
  const dep = el("div", "bridge-block");
  dep.append(el("h3", null, "Why identity sits underneath every other claim"));
  dep.append(
    el(
      "p",
      null,
      "Most GRC artefacts are assertions about who had access and whether that changed. If the directory that records those facts can be modified undetected, the assertions are unverifiable."
    )
  );
  const chain = el("div", "chain");
  b.chain.forEach(([k, v]) => {
    const row = el("div", "chain-row");
    row.append(el("span", null, k));
    row.append(el("span", null, v));
    chain.append(row);
  });
  dep.append(chain);
  host.append(dep);

  // 2. same control, five proofs
  const proofs = el("div", "bridge-block");
  proofs.append(el("h3", null, "Same control, five different proofs"));
  proofs.append(
    el("p", null, "“Privileged access is reviewed and restricted” appears in every framework for a different reason. Knowing why is what lets you answer in the auditor's own language.")
  );
  const pl = el("div", "chain");
  b.proofs.forEach(([k, v]) => {
    const row = el("div", "chain-row");
    row.append(el("span", null, k));
    row.append(el("span", null, v));
    pl.append(row);
  });
  proofs.append(pl);
  host.append(proofs);

  // 3. selected matrix
  const mx = el("div", "bridge-block");
  mx.append(el("h3", null, "Selected mappings"));
  mx.append(
    el("p", null, "Ten of twenty-five rows from the bridge document. Each row identifies an obligation; none of them claims the control works. That claim needs a test record.")
  );
  const wrap = el("div", "table-wrap");
  const table = el("table", "matrix");
  const thead = el("thead");
  const htr = el("tr");
  ["AD control", "ISO 27001:2022", "PCI DSS 4.0", "CIS v8.1", "SOC 2"].forEach((h) =>
    htr.append(el("th", null, h))
  );
  thead.append(htr);
  const tbody = el("tbody");
  b.matrix.forEach((row) => {
    const tr = el("tr");
    row.forEach((cell, i) => tr.append(el("td", i === 0 ? null : "pnum", cell)));
    tbody.append(tr);
  });
  table.append(thead, tbody);
  wrap.append(table);
  mx.append(wrap);
  host.append(mx);

  // 4. myths
  const myths = el("div", "bridge-block");
  myths.append(el("h3", null, "Four myths this matrix is built to break"));
  const list = el("div", "myths");
  b.myths.forEach(([head, body]) => {
    const m = el("div", "myth");
    m.append(el("strong", null, head));
    m.append(el("span", null, body));
    list.append(m);
  });
  myths.append(list);
  host.append(myths);
}

function renderSkills() {
  const tbody = document.getElementById("skills-body");
  PORTFOLIO.skills.forEach(([skill, where, artefact]) => {
    const tr = el("tr");
    tr.append(el("td", null, skill));
    tr.append(el("td", "pnum", where));
    tr.append(el("td", null, artefact));
    tbody.append(tr);
  });
}

function renderLadder() {
  const ol = document.getElementById("ladder");
  PORTFOLIO.ladder.forEach(([q, note]) => {
    const li = el("li");
    const inner = el("div");
    inner.append(el("span", "ladder-q", q));
    inner.append(el("small", null, note));
    li.append(inner);
    ol.append(li);
  });
}

function wireLinks() {
  ["repo-link-top", "repo-link-foot"].forEach((id) => {
    const a = document.getElementById(id);
    if (a) a.href = PORTFOLIO.repo;
  });
}

function wireTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("theme");
  const stored = (() => {
    try { return localStorage.getItem("portfolio-theme"); } catch { return null; }
  })();
  const initial = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  root.setAttribute("data-theme", initial);

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("portfolio-theme", next); } catch { /* ignore */ }
  });
}

renderProjects();
renderBridge();
renderSkills();
renderLadder();
wireLinks();
wireTheme();
