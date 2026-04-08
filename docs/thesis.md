**WARRANT**

Workload Authorization, Risk, and Runtime

Accountability for Networked Tasks

*Technical Briefing for Advisors & Investors*

The open standard for pre-deployment AI agent governance.

An Intent Blueprint that declares what an AI agent is authorised to do -
before it does anything at all.

**prismalOS** \| v0.11.0 \| March 2026 \| CC BY 4.0

**THE GOVERNANCE GAP**

Autonomous AI agents are entering production environments at scale -
executing transactions, managing infrastructure, interacting with
external services, and making independent decisions across trust
boundaries without real-time human oversight.

The governance tools built for human-initiated software actions do not
work for autonomous agents. Existing approaches fall into three
categories, and all three have the same blind spot:

**Runtime-Only Monitoring:** detects violations after they happen. No
pre-deployment contract. Reactive, not preventive.

**Post-Hoc Audit:** produces compliance evidence retrospectively.
Valuable for regulators, useless for real-time prevention.

**Policy-as-Code (OPA/Rego):** encodes rules as executable policies, but
lacks a holistic governance document covering intent, permissions,
compliance, risk, and boundaries in a unified structure.

The result is a **semantic gap**: organisations deploy agents without a
machine-readable declaration of what those agents are authorised to do.
No contract exists between the agent, the platform, and the governance
layer. This is the gap WARRANT closes.

**WHAT WARRANT IS**

WARRANT is an open standard that defines a declarative JSON document -
the Intent Blueprint - that establishes pre-deployment governance
boundaries, permissions, and accountability requirements for autonomous
AI agents.

The Intent Blueprint is a machine-readable governance contract.
Validators verify it before agent deployment. Enforcement Engines
enforce its boundaries at runtime. The standard is vendor-agnostic, free
to implement without royalty or licensing fees, and licensed under CC BY
4.0.

+:----------------+:----------------+:----------------+:----------------+
| **14**          | **4**           | **5**           | **0**           |
|                 |                 |                 |                 |
| Governance      | Conformance     | Cross-Pillar    | Licensing Fees  |
| Pillars         | Levels          | Invariants      |                 |
+-----------------+-----------------+-----------------+-----------------+

**UNIQUE ADVANTAGE**

Every other standard in the AI agent ecosystem solves a downstream
problem: how agents communicate (Google[']{dir="rtl"}s A2A Protocol),
how agents invoke tools (Anthropic[']{dir="rtl"}s MCP), or how runtime
policies are evaluated (OPA/Rego). None of them answer the upstream
question: what is this agent authorised to do before it starts
operating?

WARRANT is the only standard that occupies this pre-deployment
governance layer. It doesn[']{dir="rtl"}t compete with A2A, MCP, or
OPA - it complements all of them by providing the declarative governance
contract that those runtime systems can enforce.

**Shift-Left Governance**

WARRANT requires agents to declare their objectives, permissions,
boundaries, and compliance posture before deployment. This enables
governance review, approval workflows, and automated validation before
an agent begins operating - not after damage has occurred.

**14-Pillar Coverage in a Single Document**

No other standard covers Manifest, Objective, UX Logic, Feasibility,
Stakeholders, Compliance, Risk Profile, Data Model, Boundaries,
Integration Map, Success Metrics, Failure Modes, Personas, and Runtime
Observability in a single, machine-validatable document. This breadth
ensures governance gaps between dimensions are detected through
Cross-Pillar Invariants before deployment.

**Graduated Conformance (L1--L4)**

Organisations start with lightweight L1 blueprints (semantic intent
declaration) and progressively adopt cryptographic signing (L3) and
immutable ledger anchoring (L4) as their governance maturity increases.
No other standard provides this adoption ramp.

**Deny-by-Default with Kill Switch Mandate**

Any resource or tool not explicitly listed in an access-granting array
is implicitly forbidden. Every deployed agent at L2+ must have a kill
switch that cannot be intercepted, deferred, or overridden by the agent
under governance. Hard boundaries are enforced unconditionally; softer
thresholds pause for human review.

**COMPETITIVE POSITIONING**

  ------------------------ ------------- -------------- ------------ -----------
  **Capability**           **WARRANT**   **OPA/Rego**   **A2A        **MCP**
                                                        Protocol**   

  Pre-deployment intent    ✓             \-             \-           \-
  declaration                                                        

  Machine-validatable      ✓             ✓              \-           \-
  governance                                                         

  14-dimension coverage    ✓             \-             \-           \-

  Cross-pillar consistency ✓             \-             \-           \-
  checks                                                             

  Graduated conformance    ✓             \-             \-           \-
  levels (L1--L4)                                                    

  Cryptographic signing &  ✓             \-             \-           \-
  ledger anchoring                                                   

  Kill switch mandate      ✓             \-             \-           \-

  Deny-by-default          ✓             ✓              \-           ✓
  permissions                                                        

  Regulatory crosswalk     ✓             \-             \-           \-
  mappings                                                           

  Runtime observability    ✓             \-             \-           \-
  protocol                                                           

  Vendor-agnostic / open   ✓             ✓              ✓            ✓
  standard                                                           

  Agent-to-agent           \-            \-             ✓            \-
  communication                                                      

  Tool discovery &         \-            \-             \-           ✓
  invocation                                                         
  ------------------------ ------------- -------------- ------------ -----------

WARRANT is designed to complement, not replace, runtime systems. The
Intent Blueprint serves as the declarative governance contract that
runtime tools enforce. MCP-compatible tool URIs work natively within
WARRANT[']{dir="rtl"}s integration_map and boundaries Pillars.

**FEATURE SUMMARY**

**Governance Architecture**

**14-Pillar Flat Structure:** every Pillar maps to a single root-level
JSON property. No recursive traversal - Enforcement Engines access any
Pillar with a single lookup.

**Cross-Pillar Invariants:** five normative consistency checks (e.g.,
every integration must have a failure mode, every guardian alert must
reference a measurable KPI) enforced during validation.

**Conformance Levels L1--L4:** graduated path from structural
completeness (L1) through executable (L2), cryptographically signed
(L3), to ledger-anchored (L4).

**Lifecycle Model:** four stages (Draft → Validation → Locked →
Distribution) with immutability after locking and
rollback-with-version-increment rules.

**Security & Enforcement**

**Kill Switch:** mandatory at L2+. Highest-priority enforcement
mechanism - overrides all other permissions, boundaries, and intent.

**5-Level Precedence Hierarchy:** Boundaries \> Compliance \> Risk
Profile \> Data Model / Integration Map \> Objective. Non-configurable.

**Cryptographic Signing:** RFC 8785 canonicalization + SHA-256 +
EdDSA/RS256/ES256. Signature-first verification at L3+.

**Ledger Anchoring:** CAIP-2 network identifiers for chain-agnostic
tamper evidence at L4.

**Inheritance Controls:** ["]{dir="rtl"}append" merge strategy forbidden
for all permission arrays to prevent privilege escalation.

**Runtime Operations**

**Guardian Alerts:** configurable metric-threshold-action rules with
webhook, syslog, and CloudEvents payload formats.

**Circuit Breaker:** per-integration fault containment with
closed/open/half-open state machine.

**Heartbeat Protocol:** push-based liveness signal with jitter to
prevent thundering-herd synchronisation.

**Drift Detection:** configurable divergence threshold with
alert/pause/halt actions.

**Intent Traceability:** structured reasoning logs (JSON, OpenTelemetry,
or custom) linking every agent action to its declared objective.

**Discovery Protocol:** HTTP-based .well-known endpoint for inventorying
governed agents and detecting ungoverned Shadow AI.

**Compliance & Interoperability**

**Regulatory Crosswalks:** structured mappings between EU AI Act, ISO
42001, NIST AI RMF, and WARRANT Pillars.

**Compliance Controls:** granular traceability from specific framework
clauses to WARRANT Pillars.

**MCP Compatibility:** mcp:// URIs work natively in tool_access and
tool_forbidden arrays.

**Vendor Extensions:** x-{vendor}- pattern for proprietary metadata
without breaking validation.

**IANA Media Types:** application/warrant+json (normative) and
application/warrant+yaml (informational).

**VALUE TO THE MARKET**

The AI agent governance market is projected to grow rapidly as
enterprises move from pilot to production deployments. The structural
problem is clear: there is no standard way to declare, validate, and
enforce what an autonomous agent is allowed to do. WARRANT provides this
missing layer.

**For Enterprises Deploying AI Agents**

**Regulatory readiness:** structured compliance mappings to EU AI Act,
ISO 42001, and NIST AI RMF reduce the time and cost of governance
audits. The crosswalk mechanism turns regulatory alignment from a manual
exercise into a machine-verifiable property.

**Shift-left risk reduction:** governance violations are caught during
validation, before deployment - not in production logs after the damage
is done.

**Shadow AI detection:** the discovery protocol provides real-time
inventory of governed and ungoverned agents, closing the visibility gap
that plagues enterprise AI programmes.

**Auditability at every level:** from lightweight intent declarations
(L1) to immutable ledger-anchored evidence (L4), enterprises choose the
governance depth that matches their risk appetite.

**For Platform & Tooling Builders**

**Integration surface:** the flat 14-Pillar JSON structure with single
root-level property lookups makes WARRANT trivial to parse and enforce
from any orchestration platform.

**Conformance test suite:** 16 normative test vectors (valid + invalid
pairs for each invariant and conformance level) enable independent
implementers to verify their validators without black-box certification.

**Extensibility without fragmentation:** vendor extension properties
allow platform-specific metadata while preserving interoperability
across the ecosystem.

**MCP-native:** WARRANT[']{dir="rtl"}s tool_access and tool_forbidden
arrays already support mcp:// URIs, meaning any MCP-compatible platform
gets governance enforcement out of the box.

**For the AI Governance Ecosystem**

**Open standard, zero lock-in:** CC BY 4.0 license, no patents, no
royalties. Anyone can implement, fork, or build on WARRANT.

**Interoperability layer:** WARRANT doesn[']{dir="rtl"}t replace A2A,
MCP, or OPA - it provides the governance contract they can enforce. This
makes it the connective tissue between communication, tooling, and
policy layers.

**Graduated adoption:** the L1--L4 conformance ramp means organisations
aren[']{dir="rtl"}t forced into heavyweight governance on day one. They
can start lightweight and mature into cryptographic and ledger-anchored
governance as their deployments scale.

**BUSINESS ADVANTAGES FOR ADOPTERS**

Organisations that adopt WARRANT gain structural advantages in risk
management, compliance velocity, and operational control that compound
as their AI agent deployments scale.

**Reduce Compliance Costs**

The EU AI Act, NIST AI RMF, and ISO 42001 all require documented
governance structures for high-risk AI systems. Without a standard
format, every compliance audit starts from scratch.
WARRANT[']{dir="rtl"}s structured crosswalks and machine-validatable
blueprints turn governance audits from manual document reviews into
automated validation runs. The evidence pack mechanism generates
audit-ready artefacts as a byproduct of normal operations.

**Accelerate Time-to-Deploy**

Pre-deployment validation catches governance gaps before they become
production incidents. The conformance level system means teams can
deploy with L1 governance during prototyping and progressively tighten
to L2/L3/L4 as they move toward production - without rebuilding their
governance infrastructure.

**Prevent Costly Incidents**

The kill switch mandate, deny-by-default permissions, 5-level precedence
hierarchy, and circuit breaker mechanism are designed to contain
failures before they cascade. Guardian alerts provide real-time
notification when thresholds are breached. Drift detection catches slow
divergence from declared intent. These mechanisms work together as
defence-in-depth for autonomous operations.

**Unlock Enterprise Sales**

For AI agent vendors, WARRANT compliance is a sales accelerator.
Enterprise procurement increasingly demands documented governance for AI
systems. A WARRANT-compliant agent comes with a machine-readable
governance contract that procurement and compliance teams can evaluate
programmatically - removing a major friction point in enterprise AI
adoption.

**Future-Proof Against Regulatory Change**

The crosswalk mechanism is framework-agnostic. When new regulations
emerge, organisations add new crosswalk mappings to existing blueprints
rather than rebuilding governance from scratch. The 14-Pillar structure
is broad enough to accommodate regulatory requirements that
don[']{dir="rtl"}t yet exist.

**PRISMALOS BUSINESS ADVANTAGES**

prismalOS is the company behind WARRANT. As the authoring organisation
of the open standard, prismalOS occupies a structurally advantaged
position in the emerging AI agent governance market.

**Standard Author Advantage**

prismalOS defined the conceptual model, the 14-Pillar architecture, the
conformance level system, and the cross-pillar invariants. This means
prismalOS understands the standard at a depth that no competitor can
replicate through implementation alone. Every design decision, every
trade-off, and every extension point was shaped by
prismalOS[']{dir="rtl"}s understanding of what enterprises need for
production AI agent governance.

**First-Mover in an Empty Category**

The pre-deployment AI agent governance layer has no incumbent. Runtime
monitoring, post-hoc audit, and policy-as-code exist, but no product
occupies the ["]{dir="rtl"}declarative governance contract" space.
prismalOS is defining and commercialising this category simultaneously.

**Open Standard as Distribution Moat**

By releasing WARRANT as a CC BY 4.0 open standard, prismalOS creates a
distribution mechanism that proprietary competitors cannot match. Every
organisation that adopts WARRANT becomes a potential customer for
prismalOS[']{dir="rtl"}s commercial tooling (Validator, Enforcement
Engine, audit dashboards, compliance automation). The standard spreads;
the tooling monetises.

**Commercialisation Layers**

prismalOS commercialises WARRANT through multiple revenue layers:

**Validator-as-a-Service:** hosted validation and conformance testing
for Intent Blueprints.

**Enforcement Engine:** runtime enforcement platform that reads WARRANT
blueprints and enforces boundaries on deployed agents.

**Compliance Automation:** automated crosswalk generation, evidence pack
production, and regulatory audit preparation.

**Consulting & Advisory:** enterprise onboarding, custom Pillar
configuration, and governance architecture for organisations deploying
AI agents at scale.

**Defensibility**

prismalOS[']{dir="rtl"}s competitive moat is structural, not just
technical. The combination of standard authorship, first-mover
positioning, open-standard distribution, and multi-layer
commercialisation creates a defensible position that strengthens as
ecosystem adoption grows. Competitors building WARRANT-compatible
tooling validate the standard and expand the addressable market - which
benefits prismalOS as the canonical implementation and governance
authority.

*prismalOS · Defining the trust layer for AI agents*

WARRANT v0.11.0 \| Open Standard \| CC BY 4.0
