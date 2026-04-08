---
title: "WARRANT: Workload Authorization, Risk, and Runtime Accountability for Networked Tasks"
abbrev: "WARRANT"
docname: draft-irimies-warrant-intent-blueprint-00
category: exp
ipr: trust200902
license: Apache-2.0

author:
  -
    fullname: "Ciprian Irimies"
    organization: "prismalOS / prismalOS"
    email: "ciprian@pathmaven.pro"
  -
    fullname: "Lucian Lungu"
    organization: "prismalOS / prismalOS"
    email: "lucian@pathmaven.pro"

normative:

informative:

stand_alone: yes
pi: [toc, sortrefs, symrefs]

date: 2026-03-07

---

Internet-Draft                                    C. Irimies, L. Lungu
Intended Status: Experimental                    prismalOS / prismalOS
Expires: September 7, 2026                            March 7, 2026


         WARRANT: Workload Authorization, Risk, and Runtime
            Accountability for Networked Tasks
              draft-irimies-warrant-intent-blueprint-00

## Abstract

   This document defines WARRANT (Workload Authorization, Risk, and
   Runtime Accountability for Networked Tasks), an open standard that
   specifies a declarative JSON document format - the Intent Blueprint
   - for establishing pre-deployment governance boundaries, permissions,
   and accountability requirements for autonomous AI agents.

   The Intent Blueprint provides a machine-readable governance contract
   that Validators verify before agent deployment and Enforcement
   Engines enforce at runtime. The standard organises governance intent
   across 14 Pillars covering the full scope of an autonomous agent's
   operational boundaries: Manifest, Objective, UX Logic, Feasibility,
   Stakeholders, Compliance, Risk Profile, Data Model, Boundaries,
   Integration Map, Success Metrics, Failure Modes, Personas, and
   Runtime Observability.

   WARRANT defines four conformance levels (L1 through L4) that
   provide a graduated path from structural completeness to
   cryptographically verifiable, ledger-anchored governance. Five
   cross-Pillar validation invariants ensure consistency across Pillar
   boundaries. A lifecycle model governs the stages from authoring
   through validation, enforcement, and audit.

   This specification is intended for platform architects, AI safety
   engineers, compliance officers, and tooling developers who design,
   deploy, or audit autonomous agent systems. It is applicable to any
   orchestration platform that manages autonomous agents operating
   within defined governance boundaries.

## Status of This Memo

   This Internet-Draft is submitted in full conformance with the
   provisions of BCP 78 and BCP 79.

   Internet-Drafts are working documents of the Internet Engineering
   Task Force (IETF). Note that other groups may also distribute
   working documents as Internet-Drafts. The list of current
   Internet-Drafts is at https://datatracker.ietf.org/drafts/current/.

   Internet-Drafts are draft documents valid for a maximum of six
   months and may be updated, replaced, or obsoleted by other documents
   at any time. It is inappropriate to use Internet-Drafts as reference
   material or to cite them other than as "work in progress."

   This Internet-Draft will expire on September 7, 2026.

## Copyright Notice

   Copyright (c) 2026 IETF Trust and the persons identified as the
   document authors. All rights reserved.

   This document is subject to BCP 78 and the IETF Trust's Legal
   Provisions Relating to IETF Documents
   (https://trustee.ietf.org/license-info) in effect on the date of
   publication of this document. Please review these documents
   carefully, as they describe your rights and restrictions with
   respect to this document. Code Components extracted from this
   document must include Revised BSD License text as described in

## NIST AI RMF 1.0 Alignment (v0.11.0)

WARRANT v0.11.0 fully implements the four core functions of the NIST AI Risk Management Framework:

| NIST Function | WARRANT Pillar(s) | Implementation |
|---------------|------------------------------------|----------------|
| Govern | 1. Manifest + 5. Stakeholders | Policy ownership & accountability |
| Map | 2. Objective + 7. Risk Profile | Context & threat modeling |
| Measure | 11. Success Metrics + 14. Observability | KPIs and runtime monitoring |
| Manage | 9. Boundaries + 12. Failure Modes | Kill-switches & mitigation controls |

Full mapping table available in `docs/nist-ai-rmf-mapping.md` (to be added).

### EU AI Act (2026) Support

- **Article 9 (Risk Management)** → Covered by Pillars 7 + 12 + Conformance L2/L3
- **Article 12 (Record-Keeping)** → Covered by L4 Ledger-Anchored + immutable Intent Blueprint
- **High-Risk Systems** → Full support via signed + ledger-anchored blueprints (L3/L4)
   Section 4.e of the Trust Legal Provisions and are provided without
   warranty as described in the Revised BSD License.

## IPR Disclosure

   The authors have no knowledge of any intellectual property rights
   (IPR) that are relevant to this document. The IETF has been notified
   of no intellectual property claims relating to this specification.
   For information on IETF IPR policy, see
   https://www.ietf.org/about/note-well/.

## Table of Contents

   (To be generated)


## 1. Introduction

   As autonomous AI agents assume increasingly complex roles in
   networked environments - executing transactions, managing
   infrastructure, and interacting with external services - a
   governance gap has emerged. Existing access control and
   authorisation frameworks were designed for human-initiated actions
   and do not adequately address the unique risks posed by autonomous
   software agents that operate continuously, make independent
   decisions, and interact across trust boundaries without real-time
   human oversight.

   WARRANT (Workload Authorization, Risk, and Runtime Accountability
   for Networked Tasks) addresses this gap by defining a declarative,
   machine-readable governance format - the Intent Blueprint - that
   establishes pre-deployment boundaries, permissions, and
   accountability requirements for autonomous agents. The Intent
   Blueprint is a JSON document that serves as a governance contract:
   Validators verify it before agent deployment, and Enforcement
   Engines enforce its boundaries at runtime.

   The WARRANT standard is vendor-agnostic and applicable to any
   orchestration platform that manages autonomous agents. It organises
   governance intent across 14 Pillars covering the full scope of an
   agent's operational boundaries: Manifest, Objective, UX Logic,
   Feasibility, Stakeholders, Compliance, Risk Profile, Data Model,
   Boundaries, Integration Map, Success Metrics, Failure Modes,
   Personas, and Runtime Observability.

   WARRANT defines four conformance levels (L1 through L4) that
   provide a graduated path from structural completeness to
   cryptographically verifiable, ledger-anchored governance. Five
   cross-Pillar validation invariants ensure consistency across Pillar
   boundaries. A lifecycle model governs the stages from authoring
   through validation, enforcement, and audit.

   This document specifies the WARRANT Intent Blueprint format
   version 0.11.0. It is a self-contained specification that includes
   the normative Pillar definitions, conformance level requirements,
   cross-Pillar invariants, lifecycle model, security and privacy
   considerations, and a conformance test vector suite for independent
   implementers.

### 1.1. Requirements Language

   The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
   NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED",
   "MAY", and "OPTIONAL" in this document are to be interpreted as
   described in BCP 14 [RFC2119] [RFC8174] when, and only when, they
   appear in all capitals, as shown here.


## 2. Conventions and Definitions

   This section defines the technical terms used throughout this
   document. These definitions are consistent with the terminology
   established in the WARRANT specification and are used in normative
   text with the meanings described below.

   Intent Blueprint:
   :   A WARRANT JSON document declaring the pre-deployment boundaries,
       permissions, and governance intent for an autonomous agent.

   Validator:
   :   The component that validates Intent Blueprints against the
       WARRANT JSON Schema and cross-Pillar invariants.

   Enforcement Engine:
   :   The component that enforces Intent Blueprint boundaries at agent
       runtime.

   Orchestrator:
   :   The platform component that manages agent lifecycle, deployment,
       and coordination.

   Implementation:
   :   A software system that implements the WARRANT specification,
       including Validator and/or Enforcement Engine functionality.

   Cross-Pillar Invariant:
   :   A normative consistency check spanning multiple Pillar properties
       that Validators enforce during the Validation lifecycle stage.

   Conformance Test Vector:
   :   A sample Intent Blueprint document with a known-valid or
       known-invalid expected result, used by independent implementers
       to verify their Validator implementations.

   Pillar:
   :   One of the 14 governance domains that organise the properties of
       an Intent Blueprint.

   Conformance Level:
   :   One of four graduated levels (L1 through L4) that define the
       minimum structural and cryptographic requirements for an Intent
       Blueprint.

   Lifecycle Stage:
   :   One of four conceptual stages (Draft, Validation, Locking,
       Distribution) that govern the mutability and processing of an
       Intent Blueprint.


## 3. Pillar Map Table

   The WARRANT framework defines 14 Pillars that collectively describe
   the full scope of an autonomous agent's pre-deployment intent. Each
   Pillar maps to a single root-level JSON property in the Intent
   Blueprint Schema. Implementations SHALL treat the Pillar Map table
   as the authoritative reference for locating Pillar data within an
   Intent Blueprint document.

### 3.1. Normative Pillar-to-JSON Mapping (v0.11.0)

   In v0.11.0, each Pillar maps to exactly one root-level property.
   No Pillar is distributed across multiple JSON sections. Enforcement
   Engines locate Pillar data by direct root-level property access
   without recursive traversal of intermediate grouping objects.

   +-----------+-----------------------+--------------------------+
   | Pillar #  | Pillar Name           | v0.11.0 JSON Path        |
   +-----------+-----------------------+--------------------------+
   | 01        | Manifest              | manifest                 |
   | 02        | Objective             | objective                |
   | 03        | UX Logic              | ux_logic                 |
   | 04        | Feasibility           | feasibility              |
   | 05        | Stakeholders          | stakeholders             |
   | 06        | Compliance            | compliance_frameworks    |
   | 07        | Risk Profile          | risk_profile             |
   | 08        | Data Model            | data_model               |
   | 09        | Boundaries            | boundaries               |
   | 10        | Integration Map       | integration_map          |
   | 11        | Success Metrics       | success_metrics          |
   | 12        | Failure Modes         | failure_modes            |
   | 13        | Personas              | personas                 |
   | 14        | Runtime Observability | runtime_observability    |
   +-----------+-----------------------+--------------------------+

              Table 1: v0.11.0 Pillar Map

   A conformant Intent Blueprint at any conformance level MUST include
   JSON properties corresponding to all 14 Pillars. The degree to
   which each Pillar's property must be populated depends on the
   declared conformance level (see Section 4).

   The flattened structure eliminates the need for recursive traversal
   of grouping objects when locating Pillar data. Enforcement Engines
   and Validators can access any Pillar's data with a single root-level
   property lookup.

### 3.2. Structural Change Summary

   _Note: The structural flattening described in this section was
   introduced in version 0.10.0. Version 0.11.0 builds on this
   flattened foundation with additive property enhancements
   (Section 3.3) and a new Pillar (Section 3.4). The table below
   is retained for historical reference._

   The following intermediate grouping objects from v0.9.15 are
   eliminated or narrowed in v0.10.0:

   +----------------------------+---------------------+------------------+
   | v0.9.15 Grouping Object    | v0.10.0 Disposition | Affected Pillars |
   +----------------------------+---------------------+------------------+
   | metadata                   | Renamed to manifest | Pillar 01        |
   |                            | at root level       |                  |
   +----------------------------+---------------------+------------------+
   | intent                     | REMOVED. Properties | Pillars 02, 03   |
   |                            | distributed to      |                  |
   |                            | objective and       |                  |
   |                            | ux_logic            |                  |
   +----------------------------+---------------------+------------------+
   | permissions                | REMOVED. Properties | Pillars 04, 05,  |
   |                            | distributed to      | 07 (partial),    |
   |                            | feasibility,        | 08, 10           |
   |                            | stakeholders,       |                  |
   |                            | data_model,         |                  |
   |                            | integration_map,    |                  |
   |                            | risk_profile        |                  |
   +----------------------------+---------------------+------------------+
   | boundaries                 | NARROWED to Pillar  | Pillar 09        |
   |                            | 09 only.            | (retained), 07   |
   |                            | hitl_triggers moved | and 12           |
   |                            | to risk_profile,    | (extracted)      |
   |                            | failure_modes moved |                  |
   |                            | to failure_modes    |                  |
   +----------------------------+---------------------+------------------+
   | compliance                 | REMOVED. Properties | Pillars 06, 11   |
   |                            | distributed to      |                  |
   |                            | compliance_         |                  |
   |                            | frameworks and      |                  |
   |                            | success_metrics     |                  |
   +----------------------------+---------------------+------------------+
   | personas                   | UNCHANGED (already  | Pillar 13        |
   |                            | root-level)         |                  |
   +----------------------------+---------------------+------------------+

              Table 2: v0.9.15 to v0.10.0 Structural Changes

### 3.3. v0.11.0 Property Additions

   This section defines the normative property additions introduced
   in v0.11.0. Properties are organised by tier: Tier 1 (non-breaking
   additions), Tier 2 (medium-complexity changes), Tier 3 (strategic
   extensions), and Pillar 14 (Runtime Observability).

#### 3.3.1. risk_profile.alert_endpoint

   Pillar: 07 (Risk Profile)

   Property path: "risk_profile.alert_endpoint"
   Type: string (format: uri)
   Required: OPTIONAL at L1/L2; REQUIRED at L3/L4

   The "alert_endpoint" property declares a URI to which the
   Enforcement Engine SHALL send real-time notifications when risk
   thresholds are breached or operational anomalies are detected.
   Implementations MUST validate that the value conforms to the URI
   format per RFC 3986.

#### 3.3.2. risk_profile.alert_format

   Pillar: 07 (Risk Profile)

   Property path: "risk_profile.alert_format"
   Type: string (enum: "webhook", "syslog", "cloudevents")
   Required: OPTIONAL at L1/L2; REQUIRED at L3/L4

   The "alert_format" property declares the payload format used when
   sending notifications to the "alert_endpoint". Implementations
   SHALL support all three enumerated formats.

   Conditional dependency: WHEN "alert_endpoint" is present in
   "risk_profile", the Schema SHALL require "alert_format" to also
   be present. This dependency is encoded as an "if/then" conditional
   within the "risk_profile" object definition.

#### 3.3.3. data_model.data_sovereignty_region

   Pillar: 08 (Data Model)

   Property path: "data_model.data_sovereignty_region"
   Type: string (pattern: "^[A-Z]{2}$")
   Required: OPTIONAL at all conformance levels

   The "data_sovereignty_region" property declares the jurisdiction
   in which data governed by the Intent Blueprint MUST remain, using
   an ISO 3166-1 alpha-2 country code. Enforcement Engines SHOULD
   restrict data operations to infrastructure located within the
   declared region. This property is an informational declaration;
   enforcement depends on the runtime environment's ability to verify
   infrastructure location.

#### 3.3.4. compliance_frameworks.frameworks[].controls

   Pillar: 06 (Compliance)

   Property path: "compliance_frameworks.frameworks[].controls"
   Type: array of objects
   Required: OPTIONAL

   The "controls" property provides granular traceability from
   specific compliance framework clauses to WARRANT Pillars. Each
   object in the array SHALL have:

   -  "control_id" (string, minLength 1): Identifier of the
      framework clause or control (e.g., "Art. 9(1)").

   -  "pillars" (array of strings, minItems 1): WARRANT Pillar
      names that address this control. Each value MUST be one of
      the 14 Pillar names: "manifest", "objective", "ux_logic",
      "feasibility", "stakeholders", "compliance_frameworks",
      "risk_profile", "data_model", "boundaries", "integration_map",
      "success_metrics", "failure_modes", "personas",
      "runtime_observability".

   Control objects SHALL NOT contain additional properties beyond
   "control_id" and "pillars".

#### 3.3.5. manifest.discovery_uri

   Pillar: 01 (Manifest)

   Property path: "manifest.discovery_uri"
   Type: string (format: uri)
   Required: OPTIONAL at L1/L2; REQUIRED at L3/L4

   The "discovery_uri" property declares the canonical URI from which
   the JSON representation of this Intent Blueprint can be retrieved.
   A GET request to the "discovery_uri" SHALL return the canonical
   JSON representation with Content-Type "application/warrant+json".
   The endpoint SHOULD support HTTP ETag-based conditional requests
   for cache validation. At L3 and L4, the endpoint SHOULD require
   TLS 1.2 or higher.

#### 3.3.6. ux_logic.explainability_uri

   Pillar: 03 (UX Logic)

   Property path: "ux_logic.explainability_uri"
   Type: string (format: uri)
   Required: OPTIONAL at all conformance levels

   The "explainability_uri" property declares a URI pointing to the
   agent's reasoning trace or explanation endpoint. The response
   format at this endpoint is implementation-defined and outside the
   scope of this standard. WHEN "ux_logic.user_facing" is "true",
   implementations SHOULD populate "explainability_uri" to support
   end-user transparency.

#### 3.3.7. integration_map.authorised_integrations (oneOf Migration)

   Pillar: 10 (Integration Map)

   Property path: "integration_map.authorised_integrations" items
   Type: oneOf (string | object)
   Required: No change to array requirement

   As of v0.11.0, each item in the "authorised_integrations" array
   MAY be either:

   (a) A plain URI string (format: uri). This format is DEPRECATED
       as of v0.11.0 and SHALL be removed in v1.0.0.

   (b) An object with the following properties:

       -  "uri" (string, format: uri): REQUIRED. The integration
          endpoint URI.

       -  "justification" (string, minLength 1): REQUIRED. A
          human-readable justification for the integration.

       -  "protocol_version" (string): OPTIONAL. Version pin for
          the integration protocol.

       The object SHALL NOT contain additional properties beyond
       "uri", "justification", and "protocol_version".

   The "uniqueItems" constraint on the array is preserved. Cross-
   Pillar Invariants 1 and 4 SHALL extract the "uri" property from
   object-format items for matching purposes.

#### 3.3.8. risk_profile.drift_detection

   Pillar: 07 (Risk Profile)

   Property path: "risk_profile.drift_detection"
   Type: object
   Required: OPTIONAL at all conformance levels

   The "drift_detection" property declares parameters for detecting
   semantic drift between declared intent and observed agent
   behaviour. The object SHALL have:

   -  "threshold" (number, minimum 0, maximum 1): REQUIRED. The
      maximum acceptable divergence score.

   -  "action" (string, enum: "alert", "pause", "halt"): REQUIRED.
      The action to take when observed divergence exceeds the
      threshold.

   -  "evaluation_interval" (string, enum: "every_request",
      "hourly", "daily", "weekly"): OPTIONAL. The frequency of
      drift evaluation.

   The divergence scoring algorithm is implementation-defined.
   Implementations SHOULD document their scoring methodology.

#### 3.3.9. failure_modes.circuit_breaker

   Pillar: 12 (Failure Modes)

   Property path: "failure_modes.circuit_breaker"
   Type: object
   Required: OPTIONAL at all conformance levels

   The "circuit_breaker" property declares fault-tolerance parameters
   for containing cascading failures from unreliable integrations.
   The object SHALL have:

   -  "failure_threshold" (integer, minimum 1): REQUIRED. The number
      of consecutive failures before the circuit opens.

   -  "half_open_after_seconds" (integer, minimum 1): REQUIRED. The
      duration in seconds before the circuit transitions from open
      to half-open.

   -  "success_threshold" (integer, minimum 1): REQUIRED. The number
      of consecutive successes in half-open state before the circuit
      closes.

   -  "on_open" (string, enum: "halt", "fallback", "escalate"):
      OPTIONAL. The action when the circuit opens.

   The circuit breaker operates per-integration. Each
   "authorised_integrations" item maintains independent circuit
   breaker state.

#### 3.3.10. risk_profile.governance_workflow

   Pillar: 07 (Risk Profile)

   Property path: "risk_profile.governance_workflow"
   Type: object
   Required: OPTIONAL at all conformance levels

   The "governance_workflow" property declares a policy for automating
   routine governance decisions and routing exceptions to human
   reviewers. The object SHALL have:

   -  "auto_approve_policy" (string, enum: "all_within_bounds",
      "low_risk_only", "none"): REQUIRED. Specifies which categories
      of agent actions are automatically approved.

   -  "exception_routing" (array of objects): REQUIRED. Each object
      SHALL have:

      *  "condition" (string, minLength 1): REQUIRED. The exception
         trigger condition.

      *  "route_to" (string, minLength 1): REQUIRED. The human or
         team identifier for exception review.

   -  "review_sla_seconds" (integer, minimum 1): OPTIONAL. The
      maximum time for human review before the configured
      "on_failure" action triggers.

   This property does not affect conformance level classification.

#### 3.3.11. compliance_frameworks.crosswalks

   Pillar: 06 (Compliance)

   Property path: "compliance_frameworks.crosswalks"
   Type: array of objects
   Required: OPTIONAL at all conformance levels

   The "crosswalks" property provides structured mappings between
   regulatory framework clauses and WARRANT Pillars for cross-
   framework regulatory coverage analysis. Each object SHALL have:

   -  "framework" (string, minLength 1): REQUIRED. The regulatory
      framework identifier (e.g., "EU AI Act", "ISO 42001").

   -  "mappings" (array of objects): REQUIRED. Each mapping object
      SHALL have:

      *  "regulation_clause" (string, minLength 1): REQUIRED. The
         specific clause or section of the regulatory framework.

      *  "warrant_pillar" (string, enum of 14 Pillar names):
         REQUIRED. The WARRANT Pillar that addresses this clause.

      *  "coverage_status" (string, enum: "full", "partial",
         "planned"): OPTIONAL. The coverage status of this mapping.

   Crosswalks are informational and do not constitute legal or
   regulatory compliance certification. The relationship between
   "controls" (Section 3.3.4, per-framework clause-to-Pillar
   mappings) and "crosswalks" (cross-framework regulatory mappings)
   is complementary: both MAY coexist in the same Intent Blueprint.

#### 3.3.12. manifest.discovery_protocol

   Pillar: 01 (Manifest)

   Property path: "manifest.discovery_protocol"
   Type: object
   Required: OPTIONAL at all conformance levels

   The "discovery_protocol" property declares how the agent's
   blueprint metadata is exposed for automated discovery. The object
   SHALL have:

   -  "well_known_endpoint" (string, format: uri): REQUIRED. The
      URI of the ".well-known/warrant-discovery" endpoint.

   -  "refresh_interval_seconds" (integer, minimum 60): OPTIONAL.
      How often the discovery index is refreshed.

#### 3.3.13. runtime_observability (Pillar 14)

   Pillar: 14 (Runtime Observability)

   Property path: "runtime_observability"
   Type: object
   Required: REQUIRED at root level (all conformance levels)

   Pillar 14 consolidates runtime monitoring concerns into a single
   root-level property. The "runtime_observability" object MAY
   contain the following sub-properties (all OPTIONAL):

   "intent_traceability" (object):

   -  "reasoning_manifest_uri" (string, format: uri): REQUIRED when
      "intent_traceability" is present. The endpoint where the agent
      publishes structured reasoning logs.

   -  "log_format" (string, enum: "json", "opentelemetry", "custom"):
      REQUIRED when "intent_traceability" is present. The format of
      reasoning trace entries.

   -  "log_retention_days" (integer, minimum 1): OPTIONAL. How long
      reasoning logs MUST be retained.

   "heartbeat" (object):

   -  "broadcast_uri" (string, format: uri): REQUIRED when
      "heartbeat" is present. The endpoint to which the agent sends
      heartbeat signals.

   -  "interval_seconds" (integer, minimum 10): REQUIRED when
      "heartbeat" is present. The frequency of heartbeat broadcasts
      in seconds. Enforcement Engines SHOULD apply plus or minus 10%
      random jitter to prevent thundering-herd synchronisation.

   "guardian_alerts" (array of objects):

   Each item SHALL have:

   -  "metric_ref" (string, minLength 1): REQUIRED. Identifier
      referencing a KPI in "success_metrics.kpis[].metric_id".
      Cross-Pillar Invariant 5 applies.

   -  "threshold" (number): REQUIRED. The threshold value for the
      alert.

   -  "operator" (string, enum: "lt", "gt", "eq", "lte", "gte"):
      REQUIRED. The comparison operator.

   -  "action" (string, enum: "alert", "pause", "halt", "escalate"):
      REQUIRED. The action to take when the threshold is breached.

   The "runtime_observability" object supports vendor extension
   properties matching the pattern "^x-[a-z]+-".

#### 3.3.14. success_metrics.kpis

   Pillar: 11 (Success Metrics)

   Property path: "success_metrics.kpis"
   Type: array of objects
   Required: OPTIONAL at all conformance levels

   The "kpis" property provides structured KPI identifiers for
   Cross-Pillar Invariant 5 cross-referencing. Each object SHALL
   have:

   -  "metric_id" (string, minLength 1): REQUIRED. A unique
      identifier for this KPI. Referenced by
      "runtime_observability.guardian_alerts[].metric_ref".

   -  "description" (string): OPTIONAL. A human-readable description
      of the KPI.

   The existing "primary_kpi" and "secondary_kpis" properties in
   "success_metrics" remain unchanged for backward compatibility.


## 4. Conformance Levels

   The WARRANT standard defines four conformance levels that provide
   a graduated path from structural completeness to cryptographically
   verifiable, ledger-anchored governance. The level definitions are
   unchanged from v0.9.14; only the validation paths are updated to
   v0.11.0 root-level Pillar properties.

### 4.1. Conformance Level Definitions

   +-------+----------------+----------------------------------------------+
   | Level | Name           | Summary                                      |
   +-------+----------------+----------------------------------------------+
   | L1    | Semantic       | Core intent declaration with all 14 Pillars  |
   |       |                | present                                      |
   +-------+----------------+----------------------------------------------+
   | L2    | Executable     | Fully populated, active, runtime-enforceable |
   |       |                | blueprint                                    |
   +-------+----------------+----------------------------------------------+
   | L3    | Cryptographic  | Cryptographically signed blueprint with       |
   |       |                | tamper evidence                              |
   +-------+----------------+----------------------------------------------+
   | L4    | Ledger         | Immutably anchored blueprint with distributed|
   |       |                | audit trail                                  |
   +-------+----------------+----------------------------------------------+

              Table 3: Conformance Level Definitions

### 4.2. v0.1-to-v0.9.14 Mapping (Retained)

   The following normative mapping table from v0.9.14 shows how the
   initial v0.1 conformance levels correspond to the L1-L4 hierarchy:

   +-------------+----------------------------------------+
   | v0.1 Level  | v0.9.14+ Level                         |
   +-------------+----------------------------------------+
   | Partial     | L1 (Semantic)                          |
   +-------------+----------------------------------------+
   | Standard    | L2 (Executable) + L3 (Cryptographic)   |
   +-------------+----------------------------------------+
   | Auditable   | L4 (Ledger)                            |
   +-------------+----------------------------------------+

              Table 4: v0.1 to v0.9.14 Level Mapping

### 4.3. Minimum Requirements per Level (v0.11.0 Paths)

#### 4.3.1. L1 (Semantic)

   -  All 14 Pillars MUST be present (i.e., the corresponding
      root-level JSON properties exist in the document).

   -  Core Pillars -- 01 (Manifest), 02 (Objective), 06 (Compliance),
      07 (Risk Profile), 09 (Boundaries) -- MUST meet the following
      minimum population:

      *  "manifest": 5 administrative baseline fields
         ("blueprint_id", "version", "owner", "status", "created_at").

      *  "objective": "domain" and "autonomy_level" populated.

      *  "compliance_frameworks": "frameworks" array exists (proving
         Pillar presence), but no "minItems" constraint on "frameworks"
         at L1.

      *  "risk_profile": "hitl_triggers" containing at least one entry
         ("minItems: 1") and "on_failure" populated with a default
         action.

      *  "boundaries": "scope_boundaries" containing at least one
         entry ("minItems: 1"). "prohibited_actions" SHALL exist but
         SHALL NOT require "minItems" at L1.

   -  The 15 required top-level properties ("warrant_version",
      "manifest", "objective", "ux_logic", "feasibility",
      "stakeholders", "compliance_frameworks", "risk_profile",
      "data_model", "boundaries", "integration_map", "success_metrics",
      "failure_modes", "personas", "runtime_observability") MUST be
      present.

#### 4.3.2. L2 (Executable)

   -  All L1 requirements MUST be satisfied.

   -  "manifest.status" MUST be "active", "deprecated", or "archived"
      (any non-draft status).

   -  "boundaries.kill_switch" MUST be defined and valid (see
      Section 8 for kill switch requirements).

   -  ALL non-core Pillars MUST be populated:

      *  "ux_logic": "interaction_model" and "user_facing" populated.

      *  "feasibility": "budget_limit" populated.

      *  "stakeholders": "approvers" populated.

      *  "data_model": "data_sources" populated.

      *  "integration_map": "tool_access" populated.

      *  "success_metrics": populated (at least one property present).

      *  "failure_modes": "known_failure_modes" containing at least
         one entry ("minItems: 1").

      *  "personas": populated (at least one persona entry).

#### 4.3.3. L3 (Cryptographic)

   -  All L2 requirements MUST be satisfied.

   -  "manifest.signature" MUST be present with valid "signed_by",
      "hash", and "algorithm" properties.

   -  The signature MUST use RFC 8785 JSON Canonicalization Scheme
      and SHA-256.

   -  "compliance_frameworks.frameworks" MUST contain at least one
      entry ("minItems: 1").

   -  "risk_profile.alert_endpoint" MUST be present (format: uri).

   -  "risk_profile.alert_format" MUST be present (enum: "webhook",
      "syslog", "cloudevents").

   -  "manifest.discovery_uri" MUST be present (format: uri).

   These properties are essential for monitored governance workflows
   with cryptographic signing. Cryptographically signed blueprints
   participating in governance workflows MUST declare alert endpoints
   and discovery URIs to enable real-time monitoring and automated
   blueprint inventory.

#### 4.3.4. L4 (Ledger)

   -  All L3 requirements MUST be satisfied (including
      "risk_profile.alert_endpoint", "risk_profile.alert_format",
      and "manifest.discovery_uri").

   -  "manifest.ledger_anchor" MUST be present with valid "network"
      and "anchor_hash" properties.

   -  The "network" value MUST conform to CAIP-2 (Chain Agnostic
      Improvement Proposal 2).

### 4.4. Conformance Level Validation Matrix (v0.11.0)

   The following matrix summarises the validation conditions at each
   conformance level. "Yes" indicates the condition is required at
   that level.

   +----------------------------------------------+-----+-----+-----+-----+
   | Condition                                    | L1  | L2  | L3  | L4  |
   +----------------------------------------------+-----+-----+-----+-----+
   | 15 required top-level properties present     | Yes | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | runtime_observability present                | Yes | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | manifest 5 baseline fields                   | Yes | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | objective.domain + autonomy_level            | Yes | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | compliance_frameworks.frameworks exists       | Yes | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | risk_profile.hitl_triggers minItems:1 +      | Yes | Yes | Yes | Yes |
   | on_failure                                   |     |     |     |     |
   +----------------------------------------------+-----+-----+-----+-----+
   | boundaries.scope_boundaries minItems:1       | Yes | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | ux_logic.interaction_model + user_facing     |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | feasibility.budget_limit                     |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | stakeholders.approvers                       |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | data_model.data_sources                      |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | integration_map.tool_access                  |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | success_metrics populated                    |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | failure_modes.known_failure_modes minItems:1 |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | personas populated                           |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | manifest.status = active, deprecated, or     |     | Yes | Yes | Yes |
   | archived                                     |     |     |     |     |
   +----------------------------------------------+-----+-----+-----+-----+
   | boundaries.kill_switch defined + valid       |     | Yes | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | manifest.signature present + valid           |     |     | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | compliance_frameworks.frameworks minItems:1  |     |     | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | risk_profile.alert_endpoint                  |  -  |  -  | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | risk_profile.alert_format                    |  -  |  -  | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | manifest.discovery_uri                       |  -  |  -  | Yes | Yes |
   +----------------------------------------------+-----+-----+-----+-----+
   | manifest.ledger_anchor present + valid       |     |     |     | Yes |
   +----------------------------------------------+-----+-----+-----+-----+

              Table 5: Conformance Level Validation Matrix

   Key v0.11.0 change: The required top-level properties are now 15
   (warrant_version + 14 Pillars), not 7. All validation paths
   reference root-level Pillar properties. L2 status validation
   accepts "active", "deprecated", or "archived" -- not just "active".

### 4.5. Self-Contained Conformance Level Blocks

   Each conformance level's "allOf" block in the JSON Schema is
   intentionally self-contained (non-cumulative). Each level (L1, L2,
   L3, L4) re-declares all requirements from scratch rather than
   referencing or extending the previous level's block.

   This design choice prioritises clarity and avoids JSON Schema
   composition complexity. Implementers modifying requirements at one
   level MUST manually propagate changes to all higher levels. For
   example, adding a new L2 requirement means the same requirement
   must also be added to the L3 and L4 "allOf" blocks.

### 4.6. Optional conformance_level Declaration

   The "conformance_level" property is OPTIONAL in the root "required"
   array. When "conformance_level" is absent from an Intent Blueprint
   document, only structural (non-level-specific) validation applies --
   the 15 required top-level properties must be present, and each
   Pillar's property-level "required" fields are enforced, but no
   level-specific conditional validation fires. None of the "if"/"then"
   blocks in the schema's "allOf" array will match, so L1-L4
   requirements are not applied.

   Production deployments SHOULD always declare a "conformance_level"
   to ensure full validation coverage.

   Validators SHOULD warn when "conformance_level" is absent, as the
   document will pass schema validation with only structural checks
   and no level-specific enforcement.


## 5. Lifecycle Stage Model

   The WARRANT standard defines a normative lifecycle progression
   consisting of four conceptual stages. The lifecycle governs the
   mutability and processing of an Intent Blueprint from initial
   authoring through validation, enforcement, and audit.

### 5.1. Status Values

   The "manifest.status" field SHALL use the following enumerated
   values:

   +-------------+-----------------------------------------------------+
   | Status      | Description                                         |
   +-------------+-----------------------------------------------------+
   | draft       | Blueprint is under construction; unrestricted        |
   |             | modification is permitted.                          |
   +-------------+-----------------------------------------------------+
   | active      | Blueprint has passed Stage 3 (Locking); no content  |
   |             | modification permitted.                             |
   +-------------+-----------------------------------------------------+
   | deprecated  | Blueprint is superseded; terminal state.             |
   +-------------+-----------------------------------------------------+
   | archived    | Blueprint is retired from use; terminal state.       |
   +-------------+-----------------------------------------------------+

              Table 6: Lifecycle Status Values

### 5.2. Conceptual Lifecycle Stages

   The normative lifecycle progression consists of four conceptual
   stages:

                                                          Rollback:
                                                          requires
                                                          manifest.version
                                                          increment +
                                                          new signature
      +--------+     +------------+     +--------+     +--------------+
      | Draft  |---->| Validation |---->| Locked |---->| Distribution |
      +--------+     +------------+     +--------+     +--------------+
          ^               |                  |
          |               |                  |
          +---------------+                  |
          | (Author recalls)                 |
          +----------------------------------+

   Stage mapping to "manifest.status":

   +------------------+--------------------+---------------------------+
   | Conceptual Stage | manifest.status    | Notes                     |
   +------------------+--------------------+---------------------------+
   | Draft            | draft              | Initial authoring phase.  |
   +------------------+--------------------+---------------------------+
   | Validation       | draft              | Still draft; validation   |
   |                  |                    | checks are being          |
   |                  |                    | performed.                |
   +------------------+--------------------+---------------------------+
   | Locked           | active             | Content is frozen; active |
   |                  |                    | indicates post-Locking.   |
   +------------------+--------------------+---------------------------+
   | Distribution     | active             | Signed and distributable; |
   |                  |                    | still active status.      |
   +------------------+--------------------+---------------------------+

              Table 7: Stage to Status Mapping

### 5.3. Transition Preconditions

   Validation to Locked:

   -  All declared conformance-level checks MUST pass using v0.11.0
      root-level Pillar paths.

   -  All cross-Pillar validation invariants MUST pass (see
      Section 12).

   -  Upon successful validation, "manifest.status" transitions from
      "draft" to "active".

   Locked to Distribution:

   -  A valid "manifest.signature" object MUST be present at the
      root-level "manifest" property.

   -  No content modification is permitted once the blueprint is
      locked.

   -  The signature MUST cover the canonicalized (RFC 8785) document
      content.

   Locked to Draft (Rollback):

   -  Rollback from Locked to Draft is permitted but REQUIRES:

      *  A new "manifest.version" increment.

      *  A new "manifest.signature" (the previous signature is
         invalidated).

   -  "manifest.status" transitions from "active" back to "draft".

### 5.4. Modification Rules (v0.11.0)

   "draft" status:
   :   Unrestricted modification of all sections is permitted.

   "active" status (post-Locking):
   :   No modification to the following 13 non-manifest root-level
       Pillar properties is permitted: "objective", "ux_logic",
       "feasibility", "stakeholders", "compliance_frameworks",
       "risk_profile", "data_model", "boundaries", "integration_map",
       "success_metrics", "failure_modes", "personas",
       "runtime_observability". A Validator
       SHALL reject any modification to these properties when
       "manifest.status" is "active".

   "deprecated" status:
   :   Terminal state. No further transitions are permitted. The
       blueprint MAY still be read but SHALL NOT be enforced by an
       Enforcement Engine.

   "archived" status:
   :   Terminal state. No further transitions are permitted. The
       blueprint is retired from operational use.

### 5.5. Version Increment on Rollback

   IF an Intent Blueprint transitions from "active" to "draft"
   (rollback), THEN the Validator SHALL require:

   1.  A new "manifest.version" value that is a valid semantic version
       increment over the previous version.

   2.  A new "manifest.signature" to be generated after modifications
       are complete and the blueprint re-enters the Locking stage.


## 6. Permissions Semantics

   The WARRANT standard defines a deny-by-default permissions model
   with explicit access-granting arrays and a normative precedence
   hierarchy for conflict resolution.

### 6.1. Deny-by-Default Principle

   Any data resource or tool not explicitly listed in an
   access-granting property ("data_model.data_access",
   "data_model.data_write", "integration_map.tool_access") is
   implicitly forbidden. An Enforcement Engine SHALL deny access to
   any resource or tool that does not appear in the relevant
   access-granting array, even if no explicit prohibition exists in
   "data_model.data_forbidden" or "integration_map.tool_forbidden".

   The v0.11.0 permission array paths are:

   +-------------------+----------------------------+------------------+
   | Permission Array  | v0.11.0 Path               | Pillar           |
   +-------------------+----------------------------+------------------+
   | Data read access  | data_model.data_access     | 08 (Data Model)  |
   +-------------------+----------------------------+------------------+
   | Data write access | data_model.data_write      | 08 (Data Model)  |
   +-------------------+----------------------------+------------------+
   | Data forbidden    | data_model.data_forbidden  | 08 (Data Model)  |
   +-------------------+----------------------------+------------------+
   | Tool access       | integration_map.tool_access| 10 (Integration  |
   |                   |                            | Map)             |
   +-------------------+----------------------------+------------------+
   | Tool forbidden    | integration_map.           | 10 (Integration  |
   |                   | tool_forbidden             | Map)             |
   +-------------------+----------------------------+------------------+

              Table 8: v0.11.0 Permission Array Paths

### 6.2. Conflict Precedence

   1.  "data_model.data_forbidden" SHALL override
       "data_model.data_access" and "data_model.data_write". If a URI
       appears in both "data_model.data_forbidden" and
       "data_model.data_access" (or "data_model.data_write"), the
       Enforcement Engine SHALL deny access to that resource.

   2.  "integration_map.tool_forbidden" SHALL override
       "integration_map.tool_access". If a URI appears in both
       "integration_map.tool_forbidden" and
       "integration_map.tool_access", the Enforcement Engine SHALL
       deny invocation of that tool.

   3.  The overall normative precedence hierarchy (from highest to
       lowest priority) is:

       Boundaries (Pillar 09) > Compliance Frameworks (Pillar 06) >
       Risk Profile (Pillar 07) > Data Model / Integration Map
       (Pillars 08, 10) > Objective (Pillar 02)

       This means that "boundaries.prohibited_actions" entries override
       all permission grants in "integration_map.tool_access" or
       "data_model.data_access". Compliance constraints override risk
       profile and permission grants. Risk profile escalation triggers
       override permission grants. This hierarchy is absolute and
       SHALL NOT be configurable by the Intent Blueprint author.

### 6.3. Relationship Between Granular and Descriptive Permissions

   Granular permission arrays ("data_model.data_access",
   "data_model.data_write", "data_model.data_forbidden",
   "integration_map.tool_access", "integration_map.tool_forbidden")
   are the enforceable declarations. Enforcement Engines SHALL use
   these arrays to make access-control decisions at runtime.

   Descriptive properties ("data_model.data_sources",
   "data_model.data_outputs", "data_model.retention_policy",
   "data_model.sensitive_data_categories", "data_model.data_ownership",
   "integration_map.authorised_integrations",
   "integration_map.rate_limits", "integration_map.warrant_handshake")
   provide contextual information about the data landscape and
   integration topology. These properties are informational and
   SHALL NOT be used as the sole basis for access-control decisions.

### 6.4. Append Forbidden for Permission Arrays

   When an Intent Blueprint inherits from a parent document via
   "manifest.extends", the "array_merge_strategy" property governs
   how array values are merged. The "append" strategy SHALL NOT be
   applied to any of the following permission arrays:

   -  data_model.data_access
   -  data_model.data_write
   -  data_model.data_forbidden
   -  integration_map.tool_access
   -  integration_map.tool_forbidden

   This restriction prevents unintended privilege escalation through
   inheritance. A Validator SHALL reject any Intent Blueprint where
   "array_merge_strategy" is "append" and the merge applies to one
   or more of the above permission arrays. The "replace" strategy
   MUST be used instead, requiring the child document to explicitly
   declare the complete set of permissions.


## 7. File Format Conventions

   This section defines the canonical serialization format and
   non-normative convenience formats for WARRANT Intent Blueprints.

### 7.1. Canonical Serialization

   The canonical serialization format for WARRANT Intent Blueprints
   is JSON:

   -  WARRANT files using JSON serialization SHALL use the file
      extension ".warrant.json".

   -  JSON is the normative format. All Schema validation, conformance
      checking, cryptographic signing (RFC 8785 canonicalization), and
      ledger anchoring operations SHALL be performed against the JSON
      serialization.

### 7.2. Non-Normative YAML Serialization

   YAML serialization is a non-normative convenience format:

   -  WARRANT files using YAML serialization SHALL use the file
      extension ".warrant.yaml".

   -  Implementations that accept YAML input SHOULD convert to JSON
      before performing validation, signing, or any normative
      operation.

   -  In the event of any discrepancy between a JSON and YAML
      representation of the same Intent Blueprint, the JSON
      serialization SHALL be authoritative.

### 7.3. Conformance Testing Independence

   Conformance of an Intent Blueprint is determined by two
   complementary mechanisms:

   1.  Structural conformance -- determined by validation against the
       WARRANT JSON Schema. The Schema enforces property presence,
       type constraints, enumerated values, conditional requirements
       per conformance level (L1-L4), and "additionalProperties"
       restrictions. Structural conformance is fully machine-checkable
       using any JSON Schema draft-07 validator.

   2.  Computational conformance -- determined by evaluation of the
       cross-Pillar validation invariants defined in Section 12.
       These invariants require mathematical comparison, set
       intersection, and cross-object lookups that exceed the
       capabilities of JSON Schema draft-07. A conformant Validator
       MUST implement these checks as application logic external to
       the JSON Schema engine.

   Both mechanisms are normative. An Intent Blueprint that passes
   structural validation but fails any cross-Pillar invariant
   (Section 12) is non-conformant and SHALL NOT transition from the
   Validation stage to the Locking stage.

   No reference to a particular product, runtime, or platform is
   required or implied.


## 8. Kill Switch and Boundary Enforcement

   The WARRANT standard defines a mandatory kill switch mechanism and
   a normative precedence hierarchy for boundary enforcement.

### 8.1. Mandatory Kill Switch

   The "boundaries.kill_switch" property remains mandatory. The
   "boundaries" object scope is narrowed to Pillar 09 content only
   ("prohibited_actions", "scope_boundaries", "kill_switch"). The
   "hitl_triggers" property (Pillar 07) and "failure_modes" property
   (Pillar 12) have been removed from "boundaries" and placed in
   their respective root-level Pillar objects ("risk_profile" and
   "failure_modes").

   Every conformant Intent Blueprint at L2 or above MUST include a
   valid "kill_switch" declaration within the "boundaries" root-level
   property. This ensures that every deployed agent can be immediately
   terminated by an authorized party at any time, regardless of the
   agent's current operational state.

### 8.2. Kill Switch as Highest-Priority Enforcement Mechanism

   When the kill switch is activated, the Enforcement Engine SHALL
   immediately terminate the agent's execution. No other declaration
   in the Intent Blueprint -- including active permissions, pending
   HITL approvals, in-progress operations, or persona-level overrides
   -- SHALL delay or prevent termination. The kill switch operates as
   an out-of-band mechanism that cannot be intercepted, deferred, or
   overridden by the agent under governance.

### 8.3. Normative Precedence Hierarchy

   The normative 5-level precedence hierarchy references v0.11.0
   root-level Pillar names:

      Priority 1 (highest):  Boundaries           (Pillar 09)
      Priority 2:            Compliance Frameworks (Pillar 06)
      Priority 3:            Risk Profile          (Pillar 07)
      Priority 4:            Data Model /          (Pillars 08, 10)
                             Integration Map
      Priority 5 (lowest):   Objective             (Pillar 02)

   Enforcement Engines SHALL apply the precedence hierarchy
   Boundaries > Compliance Frameworks > Risk Profile > Data Model /
   Integration Map > Objective when evaluating agent actions at
   runtime. A prohibition declared in "boundaries.prohibited_actions"
   overrides any permission grant in "integration_map.tool_access" or
   "data_model.data_access". A compliance constraint overrides a risk
   profile threshold. A risk profile escalation trigger overrides a
   permission grant. This hierarchy is absolute and SHALL NOT be
   configurable by the Intent Blueprint author.

### 8.4. Prohibited Actions Override Permission Grants

   Consistent with the Boundaries > Data Model / Integration Map
   precedence, when a "boundaries.prohibited_actions" entry matches a
   resource granted in "integration_map.tool_access",
   "data_model.data_access", or "data_model.data_write", the
   Enforcement Engine SHALL enforce the prohibition:

   If a URI or resource pattern appears in both
   "boundaries.prohibited_actions" and any permission-granting array
   ("integration_map.tool_access", "data_model.data_access",
   "data_model.data_write"), the Enforcement Engine SHALL deny access
   to that resource. The prohibition takes effect regardless of the
   specificity of the permission grant. Validators SHOULD warn authors
   when a prohibited action conflicts with a permission grant, but the
   document remains valid -- the prohibition simply takes precedence
   at runtime.

### 8.5. Boundaries vs. Risk Profile

   The following table distinguishes the Boundaries (Pillar 09) and
   Risk Profile (Pillar 07) enforcement models:

   +----------------------+---------------------------+---------------------------+
   | Aspect               | Boundaries (Pillar 09)    | Risk Profile (Pillar 07)  |
   +----------------------+---------------------------+---------------------------+
   | Purpose              | Define absolute           | Define escalation         |
   |                      | prohibitions -- WHAT to   | thresholds -- WHEN to     |
   |                      | prohibit                  | escalate                  |
   +----------------------+---------------------------+---------------------------+
   | Override semantics   | NOT overridable by human  | Overridable by human      |
   |                      | decision                  | decision (via HITL        |
   |                      |                           | approval)                 |
   +----------------------+---------------------------+---------------------------+
   | Enforcement          | Hard enforcement: action  | Soft enforcement: action  |
   |                      | is blocked               | is paused for human       |
   |                      | unconditionally           | review                    |
   +----------------------+---------------------------+---------------------------+
   | JSON paths           | boundaries.               | risk_profile.             |
   |                      | prohibited_actions,       | hitl_triggers,            |
   |                      | boundaries.               | risk_profile.on_failure   |
   |                      | scope_boundaries,         |                           |
   |                      | boundaries.kill_switch    |                           |
   +----------------------+---------------------------+---------------------------+
   | Precedence level     | Priority 1 (highest)      | Priority 3                |
   +----------------------+---------------------------+---------------------------+

              Table 9: Boundaries vs. Risk Profile

   Boundaries define the absolute operational envelope of an agent. A
   boundary prohibition cannot be overridden, waived, or approved by
   any human operator, persona, or external system. If an action is
   prohibited by "boundaries.prohibited_actions" or falls outside
   "boundaries.scope_boundaries", the Enforcement Engine SHALL deny
   the action unconditionally.

   Risk Profile thresholds, by contrast, define conditions under which
   an agent's execution is paused for human review. When a
   "risk_profile.hitl_triggers" metric crosses its declared threshold,
   the Enforcement Engine SHALL pause execution and request human
   approval. A human operator with sufficient trust level MAY approve
   the action, allowing execution to continue.

### 8.6. Failure Handler Precedence

   The WARRANT schema defines two "on_failure" objects at different
   Pillars:

   -  "risk_profile.on_failure" (Pillar 07) -- the authoritative
      runtime failure handler. Enforcement Engines SHALL use this
      object to determine failure response behaviour at runtime.

   -  "failure_modes.on_failure" (Pillar 12) -- an informational,
      planning-level failure handler. This object documents the
      intended failure response for known failure scenarios and is
      used during the design and review phases.

   When both objects are populated and their "default" values conflict
   (e.g., "risk_profile.on_failure.default" is "escalate" while
   "failure_modes.on_failure.default" is "halt"), the Enforcement
   Engine SHALL use "risk_profile.on_failure.default" as the
   authoritative value.

   This separation reflects the distinction between runtime
   enforcement (Risk Profile, Pillar 07) and design-time documentation
   (Failure Modes, Pillar 12).


## 9. Persona Model

   The WARRANT standard defines a persona model with a unified trust
   level ordering and trust-constrained permissions.

### 9.1. Unified Trust Level Ordering

   The normative trust level ordering is:

      zero < supervised < low < standard < semi-autonomous < high
      < autonomous

   +-------------------+------+------------------------------------------+
   | Trust Level       | Rank | Description                              |
   +-------------------+------+------------------------------------------+
   | zero              | 0    | No trust. The persona has no autonomous  |
   |                   |      | capabilities.                            |
   +-------------------+------+------------------------------------------+
   | supervised        | 1    | Fully supervised. Every action requires   |
   |                   |      | human approval.                          |
   +-------------------+------+------------------------------------------+
   | low               | 2    | Low trust. Limited autonomous actions     |
   |                   |      | within narrow boundaries.                |
   +-------------------+------+------------------------------------------+
   | standard          | 3    | Standard trust. Routine autonomous        |
   |                   |      | actions within declared permissions.      |
   +-------------------+------+------------------------------------------+
   | semi-autonomous   | 4    | Elevated trust. Broad autonomous actions  |
   |                   |      | with periodic human checkpoints.         |
   +-------------------+------+------------------------------------------+
   | high              | 5    | High trust. Extensive autonomous actions  |
   |                   |      | with minimal human oversight.            |
   +-------------------+------+------------------------------------------+
   | autonomous        | 6    | Full autonomy. The persona may act        |
   |                   |      | without human intervention.              |
   +-------------------+------+------------------------------------------+

              Table 10: Trust Level Ordering

### 9.2. Trust-Constrained Permissions

   Each permission grant in the "data_model" and "integration_map"
   root-level Pillar properties MAY declare a minimum trust level
   required for its use. When a persona attempts to exercise a
   permission, the Enforcement Engine SHALL compare the persona's
   "trust_level" against the minimum trust level required by the
   permission.

### 9.3. deny_all_writes Override

   When a persona's "capabilities_override.deny_all_writes" is set to
   "true", the Enforcement Engine SHALL deny all write operations for
   that persona regardless of permissions granted in the "data_model"
   and "integration_map" root-level Pillar properties. This override
   operates at the same precedence level as Boundaries (Priority 1).

   The "deny_all_writes" override applies to all write targets
   declared in "data_model.data_write" and any write-capable tools
   declared in "integration_map.tool_access". The Enforcement Engine
   SHALL interpret "write operation" broadly to include any action
   that creates, modifies, or deletes data in an external system.

### 9.4. Persona-Specific Tool Restrictions

   The "capabilities_override.restrict_tool_access" property is an
   array of URI-formatted strings identifying tools that the persona
   is prohibited from invoking, even if those tools appear in the
   global "integration_map.tool_access" array.

   The "restrict_tool_access" restriction is additive with
   "integration_map.tool_forbidden": a tool denied by either
   "integration_map.tool_forbidden" (global) or
   "capabilities_override.restrict_tool_access" (persona-specific)
   SHALL be denied. The union of both denial lists applies.

### 9.5. Term Disambiguation: supervised

   The string value "supervised" appears in two distinct enumeration
   contexts within the WARRANT schema:

   -  In "objective.autonomy_level": "supervised" indicates the
      agent-level operational mode -- the agent operates under human
      supervision as its default autonomy posture.

   -  In "personas[].trust_level": "supervised" (Numeric Rank 1)
      indicates the persona-level trust classification -- every action
      by this persona requires human approval before execution.

   These are semantically distinct. An agent with "autonomy_level" of
   "supervised" may contain personas with trust levels ranging from
   "zero" to "autonomous". The agent-level autonomy mode and
   persona-level trust level are independent dimensions.


## 10. Compliance Framework Guidance

   This section describes how Intent Blueprint authors declare
   alignment with regulatory or governance frameworks.

### 10.1. Framework Declarations in Intent Blueprints

   The "compliance_frameworks.frameworks" array allows Intent Blueprint
   authors to declare which regulatory or governance frameworks the
   blueprint aligns with:

   Intent Blueprint authors SHOULD populate the
   "compliance_frameworks.frameworks" array with entries corresponding
   to the regulatory, governance, or industry frameworks that informed
   the blueprint's design.

   Example "compliance_frameworks.frameworks" entry (v0.11.0):

      {
        "compliance_frameworks": {
          "frameworks": [
            { "name": "NIST AI RMF", "version": "1.0" },
            { "name": "EU AI Act", "version": "2024" }
          ]
        }
      }

### 10.2. Informational Nature of Framework Declarations

   Framework declarations in the "compliance_frameworks.frameworks"
   array are informational. They represent the Intent Blueprint
   author's assertion that the blueprint was designed with the
   referenced framework in mind. The WARRANT specification does not
   itself certify compliance with any external framework, and
   Validators SHALL NOT interpret the presence of a framework entry
   as proof of compliance with that framework.

### 10.3. L3/L4 Conformance Requirement

   Intent Blueprints declaring a "conformance_level" of L3
   (Cryptographic) or L4 (Ledger) SHALL include at least one entry in
   the "compliance_frameworks.frameworks" array ("minItems: 1"). A
   Validator SHALL reject any L3 or L4 Intent Blueprint where the
   "compliance_frameworks.frameworks" array is empty or absent.


## 11. Extension and Inheritance Semantics

   The WARRANT standard supports Intent Blueprint inheritance and
   vendor extension properties.

### 11.1. Inheritance via manifest.extends

   The WARRANT standard supports Intent Blueprint inheritance through
   the "manifest.extends" object. A child Intent Blueprint MAY declare
   a parent document by specifying a "uri" and an
   "array_merge_strategy". When a child document declares
   "manifest.extends", the Validator SHALL resolve the parent document
   and merge its contents with the child document according to the
   rules defined in this section.

### 11.2. Deep Merge Semantics

   When a child Intent Blueprint inherits from a parent via
   "manifest.extends", the merge operation proceeds recursively
   through the document tree. Child properties override parent
   properties at the leaf level.

   Rules:

   1.  Scalar properties: Child's value replaces parent's value.

   2.  Object properties: Merge recurses into the object at the leaf
       level.

   3.  Array properties: Governed by "array_merge_strategy" in
       "manifest.extends".

   4.  Absent properties: Parent properties not in child are
       inherited; child properties not in parent are retained.

   Example (v0.11.0 paths): If a parent defines
   "ux_logic.interaction_model" as "notify" and the child defines
   "ux_logic.interaction_model" as "approve", the resolved document
   SHALL use "approve". If the parent defines "ux_logic.tone_and_voice"
   as "professional" and the child does not define
   "ux_logic.tone_and_voice", the resolved document SHALL inherit
   "professional" from the parent.

### 11.3. Array Merge Strategies

   +-------------+-----------------------------------------------------+
   | Strategy    | Behaviour                                           |
   +-------------+-----------------------------------------------------+
   | append      | Child's array elements appended to parent's.        |
   |             | Subject to restrictions (see Section 11.4).         |
   +-------------+-----------------------------------------------------+
   | replace     | Child's array completely replaces parent's array.   |
   +-------------+-----------------------------------------------------+
   | intersect   | Resolved array contains only elements present in    |
   |             | both parent's and child's arrays.                   |
   +-------------+-----------------------------------------------------+

              Table 11: Array Merge Strategies

### 11.4. Append Forbidden for Permission Arrays

   The "append" merge strategy SHALL NOT be applied to any of the
   following permission arrays:

   -  data_model.data_access
   -  data_model.data_write
   -  data_model.data_forbidden
   -  integration_map.tool_access
   -  integration_map.tool_forbidden

   A Validator SHALL reject any Intent Blueprint where
   "array_merge_strategy" is "append" and the inheritance merge
   applies to one or more of the above permission arrays. When
   inheriting permission arrays, the "replace" strategy MUST be used.

### 11.5. Circular Inheritance Detection

   Maximum inheritance depth is 10 layers. Self-reference rejection
   rules are unchanged from v0.9.14.

### 11.6. Vendor Extension Properties

   Vendor extension properties are non-normative. They allow
   implementers to attach vendor-specific metadata, configuration, or
   annotations to an Intent Blueprint without violating schema
   validation.

   Rules:

   1.  Extension properties MUST match the pattern "^x-[a-z]+-"
       (e.g., "x-acme-priority", "x-myorg-deployment-region").

   2.  The Schema permits extension properties via "patternProperties"
       at the top-level object and at each of the 14 root-level Pillar
       objects that use "additionalProperties: false".

   3.  Validators SHALL NOT reject documents containing vendor
       extension properties that conform to the "^x-[a-z]+-" pattern.

   4.  Validators SHALL NOT require the presence of any vendor
       extension property.

   5.  Enforcement Engines are not required to process, interpret, or
       enforce vendor extension properties.

### 11.7. Objects with additionalProperties: false (v0.11.0)

   The following table lists which objects carry
   "additionalProperties: false" and confirms that all such objects
   include the "patternProperties" rule for vendor extensions:

   +----------------------------------------------+-------+-------+
   | Object                                       | addtl | patt  |
   |                                              | Props | Props |
   |                                              | false | x-    |
   +----------------------------------------------+-------+-------+
   | Root object (/)                               | Yes   | Yes   |
   +----------------------------------------------+-------+-------+
   | manifest                                     | Yes   | Yes   |
   +----------------------------------------------+-------+-------+
   | feasibility.top_up_config                    | Yes   | Yes   |
   +----------------------------------------------+-------+-------+
   | feasibility.top_up_config.top_up_protocol    | Yes   | Yes   |
   +----------------------------------------------+-------+-------+
   | integration_map.rate_limits                  | Yes   | Yes   |
   +----------------------------------------------+-------+-------+
   | personas[].capabilities_override             | Yes   | Yes   |
   +----------------------------------------------+-------+-------+

              Table 12: Objects with additionalProperties: false

   All other root-level Pillar objects that did not have
   "additionalProperties: false" in v0.9.15 retain the default
   behavior (additional properties allowed).

   Vendor extension properties on the eliminated grouping objects
   ("intent", "permissions", "compliance") are no longer applicable
   in v0.11.0. See Appendix A (Migration Guide) for guidance on
   relocating vendor extensions from eliminated grouping objects.

### 11.8. Extension Properties and Conformance Classification

   The presence or absence of vendor extension properties
   ("x-{vendor}-*") SHALL NOT affect the conformance level
   classification of an Intent Blueprint.


## 12. Cross-Pillar Validation Invariants

   The WARRANT standard defines normative cross-Pillar consistency
   checks that Validators SHALL enforce during the Validation
   lifecycle stage. All invariant paths reference v0.11.0 root-level
   Pillar properties.

### 12.1. Overview

   Cross-Pillar validation invariants are enforced during the
   Validation stage (see Section 5.2). An Intent Blueprint failing
   any cross-Pillar invariant check SHALL NOT transition from the
   Validation stage to the Locking stage. Validators SHALL evaluate
   all invariants and report all violations, not just the first
   violation encountered.

   Cross-Pillar invariant enforcement applies to all Intent Blueprints
   entering the Validation stage, regardless of whether
   "conformance_level" is declared. The invariants are structural
   consistency checks that are independent of conformance level. A
   document without a declared "conformance_level" still MUST pass
   all five invariants before transitioning from "draft" to "active".

### 12.2. Invariant 1: Integration / Failure Modes

   Every integration declared in Integration Map (Pillar 10) SHALL
   have a corresponding failure scenario in Failure Modes (Pillar 12).

   URI Extraction: As of v0.11.0, "authorised_integrations" items
   MAY be either plain URI strings or enriched objects. The Validator
   SHALL extract the integration URI as follows:

   -  If the item is a string, use the string value directly.

   -  If the item is an object, use the value of "item.uri".

   For each extracted URI from
   "integration_map.authorised_integrations" and each "mcp://" or
   other URI in "integration_map.tool_access", the Validator SHALL
   verify that at least one entry in
   "failure_modes.known_failure_modes" describes a failure scenario
   corresponding to that integration. Validators SHALL reject
   blueprints where an integration lacks a corresponding failure
   scenario.

   Matching Algorithm: A failure scenario "corresponds to" an
   integration when the "related_integration" field on the
   "known_failure_modes" entry matches the integration URI. At L1
   conformance, the "related_integration" field is OPTIONAL; when
   absent, Validators MAY fall back to substring matching between the
   "scenario" text and the integration URI. At L2+ conformance, the
   "related_integration" field is REQUIRED on every
   "known_failure_modes" entry -- Validators SHALL reject L2+
   blueprints where any "known_failure_modes" entry lacks an explicit
   "related_integration" field. Implementations SHOULD prefer explicit
   "related_integration" matching over heuristic text matching at all
   conformance levels.

### 12.3. Invariant 2: Financial Risk <= Budget

   The financial risk limit in Risk Profile (Pillar 07) SHALL NOT
   exceed the budget limit in Feasibility (Pillar 04).

   When both "risk_profile.financial_risk_limit.amount" and
   "feasibility.budget_limit.amount" are present and their respective
   "currency" values match, the Validator SHALL verify that
   "risk_profile.financial_risk_limit.amount" does not exceed
   "feasibility.budget_limit.amount". Validators SHALL reject
   blueprints where the risk limit exceeds the budget.

### 12.4. Invariant 3: Zero-Trust Persona Exclusion

   No Persona with "trust_level" of "zero" SHALL appear in the
   approvers list in Stakeholders (Pillar 05).

   The Validator SHALL verify that no persona whose "trust_level" is
   "zero" appears in the approvers list within
   "stakeholders.approvers". Validators SHALL reject blueprints where
   a zero-trust persona is listed as an approver.

   Matching Algorithm: The Validator SHALL enforce this invariant by
   matching each entry in "stakeholders.approvers" against
   "personas[].id". Approver strings MUST correspond to persona
   identifiers declared in the "personas" array. For each approver
   string that matches a "personas[].id" value, the Validator SHALL
   check the matched persona's "trust_level". If the matched persona
   has "trust_level" of "zero", the invariant is violated and the
   Validator SHALL reject the blueprint.

   Approver strings that do not match any "personas[].id" value are
   not subject to this invariant check. Validators MUST warn about
   unresolvable approver references but SHALL NOT reject the document
   solely on that basis.

### 12.5. Invariant 4: Boundary / Integration Consistency

   No entry in "boundaries.prohibited_actions" (Pillar 09) SHALL
   conflict with an entry in authorised integrations within
   Integration Map (Pillar 10).

   URI Extraction: As of v0.11.0, "authorised_integrations" items
   MAY be either plain URI strings or enriched objects. The Validator
   SHALL extract the integration URI as follows:

   -  If the item is a string, use the string value directly.

   -  If the item is an object, use the value of "item.uri".

   The Validator SHALL verify that no resource pattern in
   "boundaries.prohibited_actions" matches any extracted URI from
   "integration_map.authorised_integrations" or any resource declared
   in "integration_map.tool_access". Validators SHALL reject
   blueprints where a prohibited action matches an authorised
   integration.

### 12.6. Invariant 5: Success Metric / Observability Consistency

   Every "metric_ref" declared in
   "runtime_observability.guardian_alerts[]" SHALL match a
   "metric_id" in "success_metrics.kpis[]".

   This invariant prevents "phantom alerts" - guardian alert rules
   that reference non-existent KPIs. A phantom alert is invalid
   because the Enforcement Engine cannot evaluate a threshold against
   a metric that has no corresponding KPI definition.

   Activation Precondition: This invariant is active only when both
   of the following conditions are met:

   -  "runtime_observability.guardian_alerts" is present and contains
      at least one item.

   -  "success_metrics.kpis" is present and contains at least one
      item.

   When either array is absent or empty, the invariant does not
   apply and the Validator SHALL NOT report a violation.

   Matching Algorithm: For each item in
   "runtime_observability.guardian_alerts", the Validator SHALL
   extract the "metric_ref" value and search for a matching
   "metric_id" in "success_metrics.kpis[]". The match is an exact
   string comparison (case-sensitive). If no "kpis[]" entry has a
   "metric_id" equal to the "metric_ref", the Validator SHALL reject
   the blueprint and report the unresolved metric reference.

   Schema Encoding Note: JSON Schema draft-07 cannot express
   cross-array referential integrity natively (i.e., "for each item
   in array A, a field must match a field in some item of array B").
   The schema encodes the structural precondition - both arrays
   present and non-empty - using a conditional "if/then" block in
   the root "allOf" array. The semantic cross-reference check
   (metric_ref matches metric_id) is a Validator-level concern that
   MUST be implemented by conformant Validator implementations.

### 12.7. Stage Transition Gate

   All five invariants MUST pass before a Validator permits the
   Validation to Locking transition. The invariants are evaluated
   using v0.11.0 root-level paths.


## 13. Security Considerations

   This section describes the threat model and security mitigations
   for the WARRANT Intent Blueprint format.

### 13.1. Threat Model

   The WARRANT security model addresses threats to the integrity,
   authenticity, and enforcement of Intent Blueprints across their
   lifecycle. All threat categories reference v0.11.0 root-level
   Pillar paths.

### 13.2. Threat Categories

#### 13.2.1. Semantic Drift

   Mitigation: Lifecycle locking (Section 5) ensures that once an
   Intent Blueprint reaches the "active" status via "manifest.status",
   no modification to the 13 non-manifest root-level Pillar properties
   ("objective", "ux_logic", "feasibility", "stakeholders",
   "compliance_frameworks", "risk_profile", "data_model", "boundaries",
   "integration_map", "success_metrics", "failure_modes", "personas",
   "runtime_observability")
   is permitted. Version pinning via "warrant_version" and
   "manifest.version" ties each blueprint to a specific schema version
   and document revision. Implementations SHOULD re-validate blueprints
   against the governing schema at regular intervals to detect
   environmental drift.

#### 13.2.2. Persona Spoofing

   Mitigation: Implementations SHOULD authenticate persona identity
   using JWT-based persona authentication. The "warrant_persona" claim
   in a JWT token binds a runtime identity to a declared persona in
   the Intent Blueprint. Enforcement Engines SHOULD verify the
   "warrant_persona" claim against the "personas" array before granting
   persona-specific permissions or trust levels.

#### 13.2.3. Downgrade Attacks

   Mitigation: Implementations SHOULD require a declared
   "conformance_level" in the "manifest" section. Validators SHALL
   enforce the full validation requirements for the declared
   conformance level and SHALL NOT silently fall back to a lower
   level. If the declared conformance level cannot be satisfied (e.g.,
   missing "manifest.signature" for L3), the Validator SHALL reject
   the document rather than downgrade it.

#### 13.2.4. Privilege Escalation via Inheritance

   Mitigation: The "array_merge_strategy: append" is forbidden for
   all permission arrays ("data_model.data_access",
   "data_model.data_write", "data_model.data_forbidden",
   "integration_map.tool_access", "integration_map.tool_forbidden")
   as specified in Section 6.4. Validators SHALL reject any Intent
   Blueprint where "append" merge strategy is applied to permission
   arrays. The "replace" strategy MUST be used instead, requiring the
   child document to explicitly declare the complete set of
   permissions.

#### 13.2.5. Kill Switch Bypass

   Mitigation: The kill switch is mandatory at L2+ (the L2, L3, and
   L4 conformance level conditional blocks require "kill_switch" in
   the "boundaries" object). The kill switch is the single
   highest-priority enforcement mechanism; activation of the kill
   switch overrides all other permissions, boundaries, and intent
   declarations. Enforcement Engines SHALL implement the kill switch
   as an out-of-band mechanism that cannot be intercepted or
   overridden by the agent under governance. Validators SHALL reject
   any Intent Blueprint that omits the "kill_switch" property from
   the "boundaries" section.

#### 13.2.6. Document Substitution

   Mitigation: L3 and L4 Intent Blueprints require cryptographic
   signing. The signature covers the RFC 8785 canonicalized JSON
   content of the document. For L4 documents, the ledger anchor
   provides an additional tamper-evidence mechanism: the "anchor_hash"
   in "manifest.ledger_anchor" is computed over the canonicalized
   document and recorded on an immutable ledger. Any modification to
   the document will produce a hash mismatch that Validators SHALL
   detect and reject. The "manifest.signature" object contains the
   cryptographic signature at the root-level "manifest" property.

#### 13.2.7. Parser Exploits

   Mitigation: The WARRANT Schema enforces "additionalProperties:
   false" on several objects (see Section 11.7 for the complete list),
   with the exception of vendor extension properties matching
   "^x-[a-z]+-". This strict schema validation ensures that only
   declared properties and vendor extensions are accepted at these
   objects. Implementations SHOULD additionally enforce limits on
   document size, nesting depth, and array length to prevent resource
   exhaustion attacks on parsers. The flattened v0.11.0 structure
   reduces maximum nesting depth compared to v0.9.15.

#### 13.2.8. Handshake Target Manipulation

   Mitigation: Implementations SHOULD validate all URIs in
   "integration_map.tool_access", "integration_map.tool_forbidden",
   "data_model.data_access", "data_model.data_write", and
   "integration_map.authorised_integrations" against an allowlist of
   known-good endpoints. The Schema enforces URI format validation on
   permission arrays. For L3/L4 documents, the cryptographic signature
   in "manifest.signature" covers all URI values, ensuring that any
   modification to endpoint URIs invalidates the signature.

### 13.3. v0.10.0-Specific Security Considerations

#### 13.3.1. Partial Migration Risk

   Threat: An Intent Blueprint may contain a mix of v0.9.15 nested
   paths (inside grouping objects "intent", "permissions",
   "compliance") and v0.10.0 root-level Pillar properties, resulting
   in ambiguous or incomplete enforcement.

   Mitigation: Validators SHALL reject documents that contain both
   the old grouping objects ("intent", "permissions", "compliance")
   and the new root-level Pillar properties simultaneously. A document
   declaring "warrant_version" of "0.10.0" or later MUST use
   exclusively the flattened root-level structure. Partial migration
   is not permitted.

#### 13.3.2. Signature Invalidation

   Threat: Structural migration from v0.9.15 to v0.10.0 changes the
   JSON structure of the document, invalidating any existing
   cryptographic signatures and ledger anchors.

   Mitigation: All L3 and L4 signatures and ledger anchors are
   invalidated by the structural migration and MUST be regenerated
   against the v0.10.0 canonicalized form. Migration tools SHALL log
   that "manifest.signature" and "manifest.ledger_anchor" from the
   source document are invalidated and require regeneration. Validators
   SHALL reject any v0.10.0 document that carries a signature computed
   against the v0.9.15 structure.

#### 13.3.3. Reduced Nesting Depth

   Benefit: The flattened v0.10.0 structure reduces the maximum
   nesting depth of Intent Blueprint documents. Validators SHOULD
   enforce a reduced maximum nesting depth limit for v0.10.0 documents
   compared to v0.9.15, as the elimination of intermediate grouping
   objects removes one level of nesting for most Pillar data.

#### 13.3.4. Transition Period

   Guidance: During a transition period, Enforcement Engines receiving
   documents with "warrant_version" prior to "0.10.0" SHALL continue
   to enforce using the nested path model (v0.9.15 paths). Enforcement
   Engines SHALL NOT attempt to interpret v0.9.15 documents using
   v0.10.0 paths or vice versa. The "warrant_version" field is the
   authoritative indicator of which path model applies.

#### 13.3.5. Grouping Object Detection

   Mitigation: IF a Validator detects the presence of any eliminated
   grouping object ("intent", "permissions", or the v0.9.15
   "compliance" structure) in a document declaring "warrant_version"
   of "0.10.0" or later, THEN the Validator SHALL reject the document
   as non-conformant. This prevents hybrid documents that could
   confuse Enforcement Engines about which path model to use.

#### 13.3.6. Version Value Validation

   Guidance: Validators SHOULD reject "warrant_version" values that
   do not correspond to a published WARRANT specification version.
   The schema pattern validates syntactic correctness but does not
   constrain the value to known versions. Implementations SHOULD
   maintain a registry of published specification versions and reject
   documents declaring an unrecognized "warrant_version".

   Published Version Registry:

   +-----------+-------------+------------------------------------------+
   | Version   | Status      | Notes                                    |
   +-----------+-------------+------------------------------------------+
   | 0.9.14    | Superseded  | Initial public schema release            |
   +-----------+-------------+------------------------------------------+
   | 0.9.15    | Superseded  | Added non-empty Pillar enforcement at    |
   |           |             | L1+                                      |
   +-----------+-------------+------------------------------------------+
   | 0.10.0    | Superseded  | Pillar flattening; v0.9.16 was internal  |
   |           |             | working draft                            |
   +-----------+-------------+------------------------------------------+
   | 0.11.0    | Current     | Pillar 14 (runtime_observability);       |
   |           |             | 5 Cross-Pillar Invariants; Tier 1/2/3    |
   |           |             | property additions                       |
   +-----------+-------------+------------------------------------------+

              Table 13: Published Version Registry

   This table is normative. Future specification versions MUST be
   appended to this registry upon publication. A formal registry
   mechanism (e.g., IANA registry or well-known URL) will be
   established when the specification reaches standards-track status.

### 13.3.7. v0.11.0-Specific Security Considerations

#### 13.3.7.1. Alert Endpoint Spoofing

   Threat: An attacker could redirect alert notifications by
   modifying the `alert_endpoint` URI in the `risk_profile`, causing
   real-time breach notifications to be sent to an attacker-controlled
   endpoint instead of the legitimate security operations centre.

   Mitigation: At L3 and above, the cryptographic signature covers
   the `alert_endpoint` value; any modification invalidates the
   signature. Enforcement Engines SHOULD validate the
   `alert_endpoint` against an allowlist of approved notification
   endpoints before dispatching alerts.

#### 13.3.7.2. Discovery URI Information Disclosure

   Threat: The `discovery_uri` in `manifest` exposes the blueprint's
   canonical location, potentially revealing organisational structure,
   internal hostnames, or deployment topology to unauthorised parties.

   Mitigation: Implementations SHOULD require authentication for
   `discovery_uri` access. Field-level masking SHOULD redact
   sensitive fields (such as `data_model.data_sources`,
   `integration_map.authorised_integrations`, and
   `boundaries.prohibited_actions`) in discovery responses to
   mitigate governance reconnaissance attacks.

#### 13.3.7.3. Explainability URI Data Leakage

   Threat: The `explainability_uri` in `ux_logic` may expose
   reasoning traces containing sensitive business logic, proprietary
   decision-making algorithms, or confidential data referenced during
   agent reasoning.

   Mitigation: Implementations SHOULD require authentication and
   authorisation for explainability endpoint access. Reasoning traces
   SHOULD be filtered to remove sensitive data before exposure.
   Implementations SHOULD apply role-based access controls to limit
   which users or systems can retrieve reasoning traces.

#### 13.3.7.4. Drift Detection Evasion

   Threat: An agent could manipulate its behaviour to stay just below
   the `drift_detection.threshold` while still deviating from its
   declared intent, effectively evading drift detection by making
   small, incremental deviations that individually fall below the
   configured threshold.

   Mitigation: Implementations SHOULD use multiple drift metrics and
   SHOULD NOT rely solely on a single threshold. The
   `evaluation_interval` SHOULD be set to the most frequent practical
   value to reduce the window for incremental evasion.
   Implementations SHOULD consider cumulative drift scoring across
   evaluation intervals in addition to point-in-time threshold
   checks.

#### 13.3.7.5. Heartbeat Metadata Exposure

   Threat: Heartbeat signals broadcast to the `broadcast_uri` may
   leak operational metadata including agent identity, blueprint
   status, timing patterns, and conformance level, enabling an
   attacker to fingerprint agents and infer organisational deployment
   patterns.

   Mitigation: Heartbeat payloads SHOULD contain only the minimum
   required fields as specified in the normative heartbeat payload
   structure. Implementations SHOULD use TLS 1.2 or higher for
   heartbeat transmission. The `broadcast_uri` endpoint SHOULD
   require authentication to prevent unauthorised monitoring of
   heartbeat traffic.

#### 13.3.7.6. Reasoning Manifest Sensitive Business Logic

   Threat: Structured reasoning logs published to the
   `reasoning_manifest_uri` may contain proprietary decision-making
   logic, confidential chain-of-thought reasoning, or references to
   sensitive business data that could be exploited by competitors or
   malicious actors.

   Mitigation: Implementations SHOULD apply access controls to the
   `reasoning_manifest_uri` endpoint. Log entries SHOULD be
   classified by sensitivity level, and implementations SHOULD
   support filtering or redaction of sensitive entries before
   exposure. The `reasoning_manifest_uri` endpoint SHOULD require
   authentication and authorisation equivalent to or stricter than
   the controls applied to the `explainability_uri`.

### 13.4. Normative Cryptographic Requirements

#### 13.4.1. RFC 8785 Canonicalization

   All L3 and L4 Intent Blueprints MUST use RFC 8785 JSON
   Canonicalization Scheme (JCS) before computing signature hashes.
   Implementations MUST exclude the "manifest.signature" property from
   the JSON object before performing canonicalization. Only
   "manifest.signature" is excluded -- the remainder of the "manifest"
   object and all other root-level properties are included in the
   canonicalized payload.

#### 13.4.2. Signature Computation Workflow

   The normative procedure for computing or verifying a cryptographic
   signature on an Intent Blueprint is:

   a.  Exclude signature: Remove the "manifest.signature" property
       from the JSON object. If computing a new signature, treat
       "manifest.signature" as absent. If verifying an existing
       signature, extract and set aside the "manifest.signature" value
       before proceeding.

   b.  Canonicalize: Serialize the remaining JSON object (without
       "manifest.signature") using RFC 8785 JSON Canonicalization
       Scheme (JCS). The output is a deterministic byte sequence.

   c.  Hash: Compute the SHA-256 hash over the canonicalized byte
       output from step (b).

   d.  Sign or verify: Using the algorithm declared in
       "manifest.signature.algorithm" (which MUST be one of EdDSA,
       RS256, or ES256):

       -  Signing: Generate the cryptographic signature over the hash
          from step (c).

       -  Verification: Verify the extracted signature against the
          hash from step (c).

   e.  Reinsert signature: After signing, place the signature value,
       algorithm identifier, signer identity ("signed_by"), and hash
       into the "manifest.signature" object and reinsert it into the
       document.

   This workflow ensures that the signature is never part of its own
   hash input, preventing circular dependencies.

#### 13.4.3. Algorithm Restrictions

   The "manifest.signature.algorithm" field SHALL restrict signing to:
   EdDSA, RS256, ES256.

#### 13.4.4. Signature-First Verification

   Validators SHOULD verify the "manifest.signature" before processing
   any other section of the Intent Blueprint for L3 and L4 documents.
   Verification follows the same exclusion workflow defined in
   Section 13.4.2: extract "manifest.signature", canonicalize the
   remaining document, compute the hash, and verify the signature.

#### 13.4.5. Ledger Anchor Hash Verification

   IF a "manifest.ledger_anchor.anchor_hash" does not match the
   SHA-256 hash of the RFC 8785 canonicalized document (computed per
   the exclusion workflow in Section 13.4.2), THEN the Validator
   SHALL reject the Intent Blueprint as tampered.

### 13.5. Schema URI Governance

   The WARRANT JSON Schema declares a canonical identifier via the
   JSON Schema "$id" keyword:

      https://warrant.dev/schema/v0.11.0/warrant.schema.json

   This URI serves as a namespace identifier for schema resolution,
   enabling Validators and tooling to retrieve or reference the
   authoritative schema definition for a given specification version.

#### 13.5.1. Namespace Disclaimer

   The "$id" URI uses the "warrant.dev" domain as a stable namespace
   for schema hosting and resolution. The presence of this domain in
   the "$id" URI does not imply endorsement by, affiliation with, or
   any commercial relationship with the domain registrant beyond the
   hosting and availability of the schema resource. The "$id" URI is
   a technical namespace identifier, not an assertion of origin or
   sponsorship.

#### 13.5.2. Governance Commitment

   The WARRANT specification retains the "warrant.dev" domain for
   the schema "$id" URI (resolution option (c) as evaluated during
   specification development). The following governance commitments
   apply to all published "$id" URIs:

   a.  Long-term availability: The "$id" URI SHALL remain resolvable
       and return the corresponding schema document for the lifetime
       of the specification version it identifies. The domain
       operator commits to maintaining URI availability through
       standard web hosting practices, including redundancy and
       monitoring.

   b.  Transfer provisions: If the "warrant.dev" domain changes
       ownership, the new owner SHALL either (1) continue to host
       and serve the schema at the existing "$id" URI, or
       (2) transfer schema hosting responsibilities to a neutral
       body (such as an IETF-managed namespace or a community
       standards organisation) and establish HTTP redirects from the
       original URI to the new location. The specification editors
       SHALL document any such transfer in a subsequent revision of
       this document.

   c.  Versioned URI immutability: Once a specification version is
       released, the schema content served at its "$id" URI is
       immutable. The schema document at a published "$id" URI SHALL
       NOT be modified after release. New schema versions SHALL be
       published under new versioned URIs (e.g., a future v0.11.0
       schema would use a distinct "$id" URI).

#### 13.5.3. Local Schema Resolution Fallback

   Validators and implementations SHOULD support local or bundled
   schema resolution as a fallback mechanism when the "$id" URI is
   unreachable. Implementations MAY bundle a copy of the schema
   corresponding to the WARRANT version they support and resolve
   "$id" references against the local copy. This ensures that
   validation can proceed in air-gapped environments, during network
   outages, or when the remote schema host is temporarily
   unavailable.

   When using local schema resolution, implementations SHOULD verify
   that the bundled schema matches the expected version by checking
   the "$id" value within the schema document itself.

#### 13.5.4. Schema Version and Specification Version

   The version component in the "$id" URI (v0.11.0) corresponds to
   the WARRANT specification version. The schema and specification
   versions are aligned: each specification release produces a
   corresponding schema with a matching version in its "$id" URI.
   Implementers SHOULD use the "$id" version to confirm that their
   Validator is operating against the intended specification version.


## 14. Privacy Considerations

   Intent Blueprints may contain or reference personal data, identity
   information, and sensitive operational details. Implementations and
   authors MUST consider the following privacy principles when
   constructing, validating, and storing Intent Blueprints.

### 14.1. Data Minimization

   Intent Blueprints SHOULD declare only the minimum data sources
   required for the agent's stated purpose. The
   "data_model.data_sources" array (Pillar 08) SHOULD enumerate only
   those sources the agent actively consumes. Similarly,
   "data_model.data_outputs" SHOULD be limited to outputs the agent
   is designed to produce. Authors MUST NOT include speculative or
   precautionary data source declarations that exceed the agent's
   operational scope.

### 14.2. Retention Obligations

   The "data_model.retention_policy" field (Pillar 08) MUST be set to
   the shortest retention period consistent with the agent's
   operational and regulatory needs. Validators SHOULD flag Intent
   Blueprints where "data_model.retention_policy" is absent or set to
   an indefinite retention period. Organizations deploying agents MUST
   ensure that the declared retention policy aligns with applicable
   data protection regulations.

### 14.3. Sensitive Data Categories

   The "data_model.sensitive_data_categories" field (Pillar 08) SHOULD
   enumerate all categories of sensitive data the agent may process,
   including but not limited to personally identifiable information
   (PII), financial records, health data, and biometric identifiers.
   Validators SHOULD warn when an Intent Blueprint declares sensitive
   data categories but lacks a corresponding
   "data_model.retention_policy".

### 14.4. Cross-Border Data Flows

   When agents operate across jurisdictions, the Intent Blueprint
   SHOULD document applicable data protection frameworks in the
   "compliance_frameworks" field. Authors SHOULD identify
   jurisdictional constraints that affect data residency, transfer
   mechanisms, and processing limitations. Validators MAY flag Intent
   Blueprints that declare "data_model.data_sources" spanning multiple
   jurisdictions without corresponding "compliance_frameworks" entries.

### 14.5. Persona Privacy

   The "personas" array (Pillar 13) may contain identity-related
   information about human stakeholders, approvers, and operators.
   Entries in "personas" SHOULD use pseudonymous identifiers rather
   than directly identifying information such as full names or email
   addresses. When "personas" entries reference external identity
   providers, the Intent Blueprint SHOULD document the identity
   resolution mechanism without embedding credentials or tokens.


## 15. IANA Considerations

   This document requests registration of two media types with IANA.
   The formal registration templates per RFC 6838 [RFC6838] are
   provided in Appendix E.

### 15.1. application/warrant+json (Normative)

   The `application/warrant+json` media type identifies a WARRANT
   Intent Blueprint document serialised as JSON. This is the normative
   serialization format for the WARRANT standard. All conformant
   Validators MUST accept Intent Blueprints in this format.

   The formal registration template is in Appendix E.1.

### 15.2. application/warrant+yaml (Informational)

   The `application/warrant+yaml` media type identifies a WARRANT
   Intent Blueprint document serialised as YAML. This is an
   informational, non-normative convenience format. YAML serialization
   is provided for human readability during authoring and review;
   JSON (`application/warrant+json`) remains the normative format for
   validation, signing, and machine interchange.

   The formal registration template is in Appendix E.2.

   A full IANA media type registration template per RFC 6838 will be
   provided upon advancement to Standards Track, noting that this
   media type is informational only - JSON is the normative format.

### 15.3. Private Enterprise Number (PEN)

   This document requests the allocation of a Private Enterprise
   Number (PEN) from the IANA SMI Network Management Private
   Enterprise Codes registry [IANA-PEN-REGISTRY].

   This PEN will be used as the enterprise root for structured data
   parameters in Syslog messages (RFC 5424) generated by WARRANT
   Enforcement Engines, as specified in Appendix G.2.

   Pending allocation, the temporary placeholder `TBD` is used
   throughout this document.

## 16. Licensing and Intellectual Property

### 16.1. Specification Text License

   The WARRANT Internet-Draft specification text is licensed under
   Creative Commons Attribution 4.0 International (CC BY 4.0).

### 16.2. JSON Schema License

   The WARRANT Intent Blueprint JSON Schema is licensed under
   Creative Commons Attribution 4.0 International (CC BY 4.0).

### 16.3. Intellectual Property Statement

   The WARRANT standard is free to implement without royalty or
   licensing fees. No patent claims are asserted against conformant
   implementations.

### 16.4. Attribution Requirements for Derivative Works

   CC BY 4.0 attribution requirements apply to derivative works of
   the specification text and Schema artifacts.


## 17. References

### 17.1. Normative References

   [RFC2119]  Bradner, S., "Key words for use in RFCs to Indicate
              Requirement Levels", BCP 14, RFC 2119,
              DOI 10.17487/RFC2119, March 1997,
              <https://www.rfc-editor.org/info/rfc2119>.

   [RFC8174]  Leiba, B., "Ambiguity of Uppercase vs Lowercase in
              RFC 2119 Key Words", BCP 14, RFC 8174,
              DOI 10.17487/RFC8174, May 2017,
              <https://www.rfc-editor.org/info/rfc8174>.

   [RFC8785]  Rundgren, A., Jordan, B., and S. Erdtman, "JSON
              Canonicalization Scheme (JCS)", RFC 8785,
              DOI 10.17487/RFC8785, June 2020,
              <https://www.rfc-editor.org/info/rfc8785>.

   [CAIP-2]   Chain Agnostic Standards Alliance, "CAIP-2: Blockchain
              ID Specification", December 2019,
              <https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md>.

              NOTE: CAIP-2 is a community standard maintained by the
              Chain Agnostic Standards Alliance (CASA) and is not an
              IETF-published document. Its stability is governed by
              the CASA process.

### 17.2. Informative References

   [RFC6838]  Freed, N., Klensin, J., and T. Hansen, "Media Type
              Specifications and Registration Procedures", BCP 13,
              RFC 6838, DOI 10.17487/RFC6838, January 2013,
              <https://www.rfc-editor.org/info/rfc6838>.

   [JSON-SCHEMA-07]  Wright, A., Andrews, H., Hutton, B., and G. Dennis,
              "JSON Schema: A Media Type for Describing JSON
              Documents", draft-handrews-json-schema-01,
              December 2017,
              <https://json-schema.org/draft-07/json-schema-release-notes.html>.

   [RFC7841]  Halpern, J., Ed., Daigle, L., Ed., and O. Kolkman, Ed.,
              "RFC Streams, Headers, and Boilerplates", RFC 7841,
              DOI 10.17487/RFC7841, May 2016,
              <https://www.rfc-editor.org/info/rfc7841>.

   [CC-BY-4.0]  Creative Commons, "Attribution 4.0 International",
              November 2013,
              <https://creativecommons.org/licenses/by/4.0/>.


## Appendix A. Migration Guide (v0.9.15 to v0.10.0)

   _Note: The WARRANT Intent Blueprint structure was fundamentally flattened
   in version 0.10.0. This appendix documents that foundational transition.
   For the incremental changes from v0.10.0 to v0.11.0, see Appendix F._

   This appendix is normative. It provides the authoritative set of
   deterministic path transformation rules for migrating Intent
   Blueprints from v0.9.14/v0.9.15 to v0.10.0. Implementations
   providing migration tooling MUST apply these rules.

### A.1. Summary of Structural Changes

   The v0.10.0 release is a breaking structural change from v0.9.15.
   The intermediate grouping objects ("intent", "permissions",
   "compliance") are eliminated, "metadata" is renamed to "manifest",
   and "boundaries" is narrowed to Pillar 09 content only. Each of the
   14 Pillars is promoted to a dedicated root-level property.

### A.2. Deterministic Path Transformation Rules

   The following table provides the complete set of 27 path
   transformation rules. Each rule is deterministic -- there is exactly
   one v0.10.0 target path for each v0.9.15 source path.

   +-------------------------------+-----------------------------------+-----------------+
   | v0.9.15 Path                  | v0.10.0 Path                      | Rule Type       |
   +-------------------------------+-----------------------------------+-----------------+
   | metadata.*                    | manifest.*                        | Rename          |
   | intent.primary_objective      | objective.primary_objective       | Move+restructure|
   | intent.success_criteria       | objective.success_criteria        | Move+restructure|
   | intent.out_of_scope           | objective.out_of_scope            | Move+restructure|
   | intent.domain                 | objective.domain                  | Move+restructure|
   | intent.autonomy_level         | objective.autonomy_level          | Move+restructure|
   | intent.ux_logic.*             | ux_logic.*                        | Lift            |
   | permissions.feasibility.*     | feasibility.*                     | Lift            |
   | permissions.active_period     | feasibility.active_period         | Move            |
   | permissions.budget_cap        | feasibility.top_up_config         | Move            |
   | permissions.stakeholders.*    | stakeholders.*                    | Lift            |
   | permissions.data_model.*      | data_model.*                      | Lift+merge      |
   | permissions.data_access       | data_model.data_access            | Move            |
   | permissions.data_write        | data_model.data_write             | Move            |
   | permissions.data_forbidden    | data_model.data_forbidden         | Move            |
   | permissions.integration_map.* | integration_map.*                 | Lift+merge      |
   | permissions.tool_access       | integration_map.tool_access       | Move            |
   | permissions.tool_forbidden    | integration_map.tool_forbidden    | Move            |
   | permissions.on_failure.*      | risk_profile.on_failure.*         | Move            |
   | boundaries.hitl_triggers      | risk_profile.hitl_triggers        | Move            |
   | boundaries.prohibited_actions | boundaries.prohibited_actions     | Unchanged       |
   | boundaries.scope_boundaries   | boundaries.scope_boundaries       | Unchanged       |
   | boundaries.kill_switch        | boundaries.kill_switch            | Unchanged       |
   | boundaries.failure_modes.*    | failure_modes.*                   | Lift            |
   | compliance.frameworks         | compliance_frameworks.frameworks  | Move+wrap       |
   | compliance.success_metrics.*  | success_metrics.*                 | Lift            |
   | personas                      | personas                          | Unchanged       |
   +-------------------------------+-----------------------------------+-----------------+

### A.3. Rule Type Definitions

   +------------------+------------------------------------------------------+
   | Rule Type        | Description                                          |
   +------------------+------------------------------------------------------+
   | Rename           | The grouping object is renamed at root level. All    |
   |                  | sub-properties are preserved.                        |
   | Move+restructure | Individual properties are extracted from a grouping  |
   |                  | object and placed into a new root-level object.      |
   | Lift             | A nested object is lifted from its grouping object   |
   |                  | to become a root-level property. Internal structure  |
   |                  | is unchanged.                                        |
   | Move             | A property is moved from one grouping object to a    |
   |                  | different root-level Pillar object.                  |
   | Lift+merge       | A nested object is lifted to root level and          |
   |                  | additional properties from the same grouping object  |
   |                  | are merged into it.                                  |
   | Move+wrap        | A property is moved and wrapped in a new container   |
   |                  | object at root level.                                |
   | Unchanged        | The path is identical in v0.9.15 and v0.10.0         |
   |                  | (property remains within the same root-level         |
   |                  | object).                                             |
   +------------------+------------------------------------------------------+

### A.4. Post-Migration Requirements

   After applying all transformation rules, the following post-
   migration steps are REQUIRED:

   1. Version update: The "warrant_version" field MUST be updated to
      "0.10.0".

   2. Signature invalidation: Any "manifest.signature" (formerly
      "metadata.signature") from the source document is invalidated by
      the structural transformation and MUST be regenerated against the
      v0.10.0 canonicalized form. Migration tools SHALL log that the
      signature requires regeneration.

   3. Ledger anchor invalidation: Any "manifest.ledger_anchor"
      (formerly "metadata.ledger_anchor") from the source document is
      invalidated by the structural transformation and MUST be
      regenerated. Migration tools SHALL log that the ledger anchor
      requires regeneration.

   4. Vendor extension relocation: Vendor extension properties
      ("x-{vendor}-*") present on eliminated grouping objects
      ("intent", "permissions", "compliance") SHALL be migrated to the
      top-level object or to the most semantically appropriate root-
      level Pillar object. The migration tool SHALL log each such
      relocation.

   5. Grouping object removal: After all properties have been
      migrated, the eliminated grouping objects ("intent",
      "permissions", "compliance") MUST be removed from the document.
      The "boundaries" object MUST contain only Pillar 09 properties
      ("prohibited_actions", "scope_boundaries", "kill_switch").

   6. Dual "on_failure" clarification: The v0.10.0 schema defines
      "on_failure" in both "risk_profile" (Pillar 07) and
      "failure_modes" (Pillar 12). The migration path
      "permissions.on_failure.*" to "risk_profile.on_failure.*" is
      authoritative for runtime failure handling. The
      "failure_modes.on_failure" object is a planning-level declaration
      inherited from the v0.9.15 "boundaries.failure_modes" structure.
      See Section 8.6 for normative precedence when both are populated.

### A.5. Round-Trip Structural Integrity

   For all valid v0.9.15 Intent Blueprints, applying the migration
   transformation rules defined in Appendix A.2 and then serializing
   to JSON SHALL produce a valid v0.10.0 Intent Blueprint that passes
   schema validation. All Pillar data is preserved; only structural
   nesting changes. The semantic content of every Pillar property in
   the source document SHALL be present at the corresponding v0.10.0
   root-level path in the migrated document.

### A.6. Step-by-Step Migration Checklist

   Step  1: Validate the source document against the v0.9.15 schema.
            Migration SHALL NOT proceed on invalid source documents.

   Step  2: Rename "metadata" to "manifest" at root level
            (Rule: Rename).

   Step  3: Extract "intent.primary_objective",
            "intent.success_criteria", "intent.out_of_scope",
            "intent.domain", "intent.autonomy_level" into a new
            "objective" root-level object
            (Rule: Move+restructure).

   Step  4: Lift "intent.ux_logic" to root-level "ux_logic"
            (Rule: Lift).

   Step  5: Lift "permissions.feasibility" to root-level
            "feasibility", then move "permissions.active_period" and
            "permissions.budget_cap" into "feasibility" (renaming
            "budget_cap" to "top_up_config")
            (Rules: Lift, Move).

   Step  6: Lift "permissions.stakeholders" to root-level
            "stakeholders" (Rule: Lift).

   Step  7: Lift "permissions.data_model" to root-level "data_model",
            then move "permissions.data_access",
            "permissions.data_write", "permissions.data_forbidden"
            into "data_model" (Rules: Lift+merge, Move).

   Step  8: Lift "permissions.integration_map" to root-level
            "integration_map", then move "permissions.tool_access",
            "permissions.tool_forbidden" into "integration_map"
            (Rules: Lift+merge, Move).

   Step  9: Move "permissions.on_failure" into a new "risk_profile"
            root-level object, then move "boundaries.hitl_triggers"
            into "risk_profile" (Rule: Move).

   Step 10: Narrow "boundaries" to Pillar 09 only: retain
            "prohibited_actions", "scope_boundaries", "kill_switch".
            Remove "hitl_triggers" and "failure_modes" from
            "boundaries".

   Step 11: Lift "boundaries.failure_modes" to root-level
            "failure_modes" (Rule: Lift).

   Step 12: Move "compliance.frameworks" into a new
            "compliance_frameworks" root-level object
            (Rule: Move+wrap).

   Step 13: Lift "compliance.success_metrics" to root-level
            "success_metrics" (Rule: Lift).

   Step 14: Remove the eliminated grouping objects ("intent",
            "permissions", "compliance") from the document.

   Step 15: Relocate any vendor extension properties from eliminated
            grouping objects to the top-level object or most
            semantically appropriate root-level Pillar object.

   Step 16: Update "warrant_version" to "0.10.0".

   Step 17: Regenerate "manifest.signature" if the source document
            was L3+.

   Step 18: Regenerate "manifest.ledger_anchor" if the source
            document was L4.

   Step 19: Validate the migrated document against the v0.10.0
            schema.

   Tip: Run the migrated blueprint through a WARRANT v0.10.0
   Validator after each step to catch issues incrementally rather
   than at the end.

## Appendix B. MCP Compatibility

   This appendix is non-normative. It provides informational guidance
   on how WARRANT tool permission declarations map to the Model
   Context Protocol (MCP) tool declaration model.

### B.1. Updated Path References

   All MCP compatibility references use v0.11.0 paths:

   +-----------------------------------+-----------------------------------+---------------------------+
   | WARRANT Property (v0.9.15)        | WARRANT Property (v0.11.0)        | MCP Concept               |
   +-----------------------------------+-----------------------------------+---------------------------+
   | permissions.tool_access           | integration_map.tool_access       | MCP tool declaration      |
   |                                   |                                   | (allow)                   |
   | permissions.tool_forbidden        | integration_map.tool_forbidden    | MCP tool declaration      |
   |                                   |                                   | (deny)                    |
   +-----------------------------------+-----------------------------------+---------------------------+

   When an MCP-compatible Enforcement Engine evaluates a tool
   invocation request, it SHOULD:

   1. Resolve the tool's "mcp://" URI against the MCP tool server
      registry.

   2. Check whether the URI appears in "integration_map.tool_access"
      (authorized) or "integration_map.tool_forbidden" (prohibited).

   3. Apply the WARRANT deny-by-default principle: if the tool URI
      does not appear in "integration_map.tool_access", the invocation
      is implicitly denied.

   4. Apply the WARRANT conflict precedence: if the tool URI appears
      in both "integration_map.tool_access" and
      "integration_map.tool_forbidden", the prohibition in
      "integration_map.tool_forbidden" takes precedence (see
      Section 6.2).

### B.2. MCP Compatibility Remains Optional

   MCP compatibility is optional. Validators and Enforcement Engines
   are not required to resolve or verify "mcp://" URIs.

## Appendix C. Design Decisions

   _Note: Several decisions documented here relate to the structural migration
   from v0.9.15 to v0.10.0. They are preserved here because v0.11.0 builds
   directly upon this flattened structure._

   This appendix is non-normative. It documents intentional design
   decisions that have been raised in external assessments and
   confirmed as by-design. These decisions are recorded here to
   prevent re-assessment and to provide rationale for implementers.

### C.1. L1 compliance_frameworks No minItems

   The "compliance_frameworks.frameworks" array exists at L1 (proving
   Pillar presence), but no "minItems" constraint is applied to
   "frameworks" at L1. Only at L3+ does the conditional validation
   add "minItems: 1".

   Rationale: L1 (Semantic) requires Pillar presence, not population.
   Compliance framework enumeration is an L3 (Cryptographic) concern
   where the frameworks under which the blueprint is governed must be
   explicitly declared before signing.

### C.2. L1 prohibited_actions No minItems

   The "boundaries.prohibited_actions" array SHALL exist at L1 but
   SHALL NOT require "minItems". An empty "prohibited_actions" array
   passes L1 validation.

   Rationale: At L1, the author is declaring the existence of the
   Boundaries Pillar. Detailed prohibited action enumeration is a
   progressive disclosure concern addressed at higher conformance
   levels.

### C.3. L2 status Accepts deprecated/archived

   The L2 conditional validation for "manifest.status" accepts
   "active", "deprecated", or "archived" -- not just "active". Any
   non-draft status satisfies the L2 requirement.

   Rationale: Deprecated and archived blueprints have already passed
   through the active lifecycle stage. Requiring "active" only would
   prevent L2 validation of blueprints that have been legitimately
   retired, creating an inconsistency where a blueprint could pass L2
   validation when active but fail after deprecation.

### C.4. Self-Contained allOf Blocks

   Each conformance level's "allOf" block in the JSON Schema is
   intentionally self-contained (non-cumulative). Each level (L1, L2,
   L3, L4) re-declares all requirements from scratch rather than
   referencing or extending the previous level's block.

   Rationale: This design choice prioritises clarity and avoids JSON
   Schema composition complexity. Implementers modifying requirements
   at one level MUST manually propagate changes to all higher levels.
   For example, adding a new L2 requirement means the same requirement
   must also be added to the L3 and L4 "allOf" blocks.

### C.5. feasibility.timeline Free-Form String

   The "feasibility.timeline" property is defined as
   "{ \"type\": \"string\" }" with no "format" or "pattern"
   constraint. It does not enforce ISO 8601 or any other date format.

   Rationale: Timeline values in governance contexts are frequently
   expressed in human-readable terms such as "Q3 2025", "End of fiscal
   year", or "6 months from kickoff". Enforcing a machine-parseable
   date format would exclude these common expressions and reduce the
   field's utility for early-stage intent declaration.

   Advisory: When a machine-parseable deadline is intended, authors
   SHOULD use ISO 8601 format (e.g., "2025-09-30T23:59:59Z").
   Enforcement Engines MAY attempt to parse "timeline" values as
   ISO 8601 and apply temporal enforcement when parsing succeeds, but
   MUST NOT reject documents where "timeline" is not a valid ISO 8601
   string.

### C.6. No tone_and_voice Conditional When user_facing:true

   The schema does not include a conditional rule requiring
   "tone_and_voice" when "ux_logic.user_facing" is "true". An author
   may set "user_facing: true" without providing "tone_and_voice", and
   the document will pass validation at all conformance levels.

   Rationale: This is by-design, consistent with the progressive
   disclosure model. UX presentation details such as "tone_and_voice"
   are L2+ concerns and are optional even at L2. The "user_facing"
   flag declares that the agent interacts with end users; the specifics
   of how it communicates (tone, voice, style) are refinement details
   that may not be known during initial intent declaration.

### C.7. Optional conformance_level

   The "conformance_level" property is OPTIONAL in the root "required"
   array. When "conformance_level" is absent from an Intent Blueprint
   document, only structural (non-level-specific) validation applies.
   None of the "if"/"then" blocks in the schema's "allOf" array will
   match, so L1-L4 requirements are not applied.

   Rationale: This supports the progressive adoption model. Unleveled
   documents can exist as lightweight drafts. Production deployments
   SHOULD always declare a "conformance_level" to ensure full
   validation coverage.

### C.8. on_failure Precedence (risk_profile Authoritative)

   The v0.10.0 schema defines "on_failure" in both "risk_profile"
   (Pillar 07) and "failure_modes" (Pillar 12). When both are
   populated, "risk_profile.on_failure" is authoritative for runtime
   failure handling.

   Rationale: The "risk_profile.on_failure" object carries the
   operational runtime failure policy (halt, retry, escalate). The
   "failure_modes.on_failure" object is a planning-level declaration
   inherited from the v0.9.15 "boundaries.failure_modes" structure.
   The risk profile is the authoritative source because it is the
   Pillar responsible for runtime risk management, while failure modes
   is the Pillar responsible for failure analysis and documentation.

### C.9. Field-Level Constraints Ported from v0.9.14

   The following field-level constraints were ported from the v0.9.14
   schema to v0.10.0:

   1.  manifest.blueprint_id: pattern "^[a-zA-Z0-9][a-zA-Z0-9._-]
       {0,254}$" (max 255 chars, alphanumeric start) replaces the
       previous "minLength: 1".

   2.  manifest.name: new optional field with "minLength: 1,
       maxLength: 512".

   3.  manifest.updated_at: new optional field with
       "format: \"date-time\"".

   4.  manifest.signature.hash: pattern "^[a-f0-9]{64}$" (exact
       SHA-256 hex, 64 chars) replaces the previous "minLength: 1".

   5.  personas[].id: pattern "^[a-zA-Z0-9][a-zA-Z0-9._-]{0,126}$"
       (max 127 chars, alphanumeric start) added alongside existing
       "minLength: 1".

   6.  feasibility.active_period: now requires "timezone",
       "window_start", "window_end".

   7.  feasibility.active_period.days: "uniqueItems: true" added.

   8.  boundaries.prohibited_actions[]: "description" added to
       required array; "resource_pattern" gets "minLength: 1";
       "methods" gets "minItems: 1".

   9.  boundaries.kill_switch.contract_address: "minLength: 1" added.

   10. success_metrics.measurement_frequency: changed from free-form
       string to enum ["hourly", "daily", "weekly", "monthly",
       "quarterly", "annually", "on_demand"].

   11. success_metrics.evidence_pack_config: now requires "storage"
       and "retention_days"; "storage" gets "format: \"uri\"".

   12. risk_profile.on_failure.retry_policy.max_retries: "minimum"
       changed from 0 to 1, "maximum: 100" added (use "halt" instead
       of 0 retries).

   13. failure_modes.on_failure.retry_policy: same constraints as
       risk_profile version.

   Rationale: These constraints were present in v0.9.14 and were
   inadvertently omitted during the v0.10.0 Pillar Flattening
   restructure. Restoring them improves validation strictness without
   changing the semantic model.

### C.10. Conditional Validations Ported from v0.9.14

   Two conditional validations from v0.9.14 are ported to v0.10.0:

   1. integration_map: when "warrant_handshake" is "true",
      "handshake_failure_handling" is required. The
      "failure_handling" and "handshake_failure_handling" fields are
      new to the v0.10.0 "integration_map" object.

   2. failure_modes.on_failure: when "default" is "escalate",
      "escalation_path" is required. This mirrors the existing
      conditional on "risk_profile.on_failure".
   Rationale: These conditionals enforce that authors provide
   necessary operational context when enabling features that require
   it. Without "handshake_failure_handling", an Enforcement Engine
   would have no instructions for handling handshake failures. Without
   "escalation_path", an escalation action has no target.

### C.11. JSON Schema Draft-07 Selection

    The WARRANT Schema targets JSON Schema draft-07
    (draft-handrews-json-schema-01) rather than a newer draft such as
    draft 2020-12 (formerly draft 2019-09).

    Rationale:

    1.  Ecosystem breadth: Draft-07 has the widest validator
        implementation coverage across programming languages (e.g.,
        ajv for JavaScript/TypeScript, jsonschema for Python, everit
        for Java, gojsonschema for Go). Locking to a stable,
        widely-implemented draft reduces implementation barriers for
        conformant Validators across diverse technology stacks.

    2.  Expressiveness gap irrelevance: The features introduced in
        draft 2020-12 - "$dynamicRef", "prefixItems", and the
        "unevaluated*" keywords - do not meaningfully improve the
        expressiveness gap identified in the WARRANT specification.
        The five cross-Pillar invariants (Section 12) require
        application logic regardless of the JSON Schema draft used.
        Cross-array referential integrity (e.g., Invariant 5:
        metric_ref matches metric_id) cannot be expressed in any
        JSON Schema draft and must be implemented by the Validator
        as external application logic.

    3.  Stability: Draft-07 has been stable since December 2017 and
        is well-understood by implementers. Newer drafts are still
        evolving in some validator implementations, which could
        introduce inconsistencies across independent Validator
        implementations.

    4.  Forward migration: Migration to a newer draft is possible in
        a future WARRANT specification version if ecosystem adoption
        justifies the transition. Such a migration would be a
        non-breaking change - the structural schema semantics are
        identical between draft-07 and draft 2020-12, and the
        cross-Pillar invariants remain external to the schema engine
        regardless of draft version.

### C.12. additionalProperties: false Rationale

   The `additionalProperties: false` constraint is omitted from most
   root-level Pillar objects and nested objects, with exceptions only
   for explicitly constrained structures like the manifest `signature`.

   Rationale: The WARRANT JSON Schema prioritises implementation adoption
   by allowing for straightforward vendor extensions. Setting
   `additionalProperties: false` broadly would render any custom or vendor-specific fields
   (even those matching the `patternProperties` for vendor schemas) invalid unless explicitly
   accounted for in the schema. While this omission carries the risk
   that a misspelled property (e.g., `max_retries` instead of the hypothetical
   `maximum_retries`) is silently ignored, the standard accepts this trade-off
   in favour of extensibility. Validators MAY implement strict-mode checking outside
   of the base schema enforcement if authors wish to catch typographical errors.

## Appendix D. Conformance Test Vectors

   This appendix is non-normative. However, the test vectors
   themselves are normative companion artifacts to this specification.
   Independent implementers SHOULD use these vectors to verify their
   Validator implementations.

### D.1. Overview

   The WARRANT conformance test vector suite provides 18 reference
   Intent Blueprints with known-valid and known-invalid expected
   results. The suite is distributed alongside this specification in
   the `tests/conformance-vectors/` directory and covers:

   -  Cross-Pillar invariants 1 through 5 (10 vectors: 5 valid +
      5 invalid)

   -  Conformance levels L1 through L4 (8 vectors: 4 valid +
      4 invalid)

   A companion README file (`tests/conformance-vectors/README.md`)
   provides additional detail on the vector format, metadata fields,
   and validation instructions.

### D.2. Vector Format

   Each vector file is a JSON object containing `_vector_metadata`
   and the test payload in `blueprint`. This wrapper prevents the
   vector itself from being misidentified as a usable Blueprint.

       {
         "_vector_metadata": {
           "vector_id":          "invariant-1-invalid",
           "target":             "invariant-1",
           "target_description": "Integration mapping to failure modes",
           "expected_result":    "invalid",
           "expected_error":     "integration missing from failure_modes",
           "warrant_version":    "0.11.0",
           "notes":              "Requires cross-Pillar object comparison"
         },
         "blueprint": {
            // ... WARRANT Intent Blueprint payload ...
         }
       }

   Validator implementations SHOULD extract the `blueprint` object and
   assert that its validation matches `expected_result` and
   `expected_error`. Valid blueprints (`"expected_result": "valid"`)
   will carry a `null` `expected_error`.

   The canonical collection of current (v0.11.0) test vectors is
   maintained in the `tests/conformance-vectors` directory of the
   WARRANT reference implementation repository.

### D.3. Metadata Fields

   The `_vector_metadata` object contains the following fields:

      vector_id           Unique identifier for the vector (e.g.,
                          "invariant-1-invalid", "level-L2-valid").

      target              Validation target being tested. One of:
                          "invariant-1", "invariant-2", "invariant-3",
                          "invariant-4", "invariant-5", "level-L1",
                          "level-L2", "level-L3", "level-L4".

      target_description  Human-readable description of the target.

      expected_result     "valid" or "invalid".

      expected_error      Expected error description for invalid
                          vectors; null for valid vectors.

      warrant_version     WARRANT specification version ("0.11.0").

      notes               Additional context for implementers.

### D.4. File Naming Convention

   Vector files follow the naming pattern:

      {target}-{valid|invalid}.warrant.json

   where {target} is the invariant number or conformance level
   identifier (e.g., "invariant-1", "level-L2").

### D.5. Vector Inventory

   Table D-1 lists the 10 invariant test vectors.

      +--------------------------------------+-----------+---------+
      | File                                 | Invariant | Result  |
      +--------------------------------------+-----------+---------+
      | invariant-1-valid.warrant.json       | 1         | valid   |
      | invariant-1-invalid.warrant.json     | 1         | invalid |
      | invariant-2-valid.warrant.json       | 2         | valid   |
      | invariant-2-invalid.warrant.json     | 2         | invalid |
      | invariant-3-valid.warrant.json       | 3         | valid   |
      | invariant-3-invalid.warrant.json     | 3         | invalid |
      | invariant-4-valid.warrant.json       | 4         | valid   |
      | invariant-4-invalid.warrant.json     | 4         | invalid |
      | invariant-5-valid.warrant.json       | 5         | valid   |
      | invariant-5-invalid.warrant.json     | 5         | invalid |
      +--------------------------------------+-----------+---------+

      Table D-1: Invariant Test Vectors

   Invariant descriptions:

      Invariant 1   Integration / Failure Modes: every integration
                    in integration_map.authorised_integrations has a
                    corresponding failure scenario in
                    failure_modes.known_failure_modes.

      Invariant 2   Financial Risk <= Budget: the value of
                    risk_profile.financial_risk_limit does not exceed
                    feasibility.budget_limit (same currency).

      Invariant 3   Zero-Trust Persona Exclusion: no Persona with
                    trust_level "zero" appears in
                    stakeholders.approvers.

      Invariant 4   Boundary / Integration Consistency: no entry in
                    boundaries.prohibited_actions conflicts with an
                    authorised integration in integration_map.

      Invariant 5   Success Metric / Observability Consistency:
                    every metric_ref in runtime_observability.
                    guardian_alerts references a metric_id in
                    success_metrics.kpis. No phantom alerts.

   Table D-2 lists the 8 conformance level test vectors.

      +--------------------------------------+-------+---------+
      | File                                 | Level | Result  |
      +--------------------------------------+-------+---------+
      | level-L1-valid.warrant.json          | L1    | valid   |
      | level-L1-invalid.warrant.json        | L1    | invalid |
      | level-L2-valid.warrant.json          | L2    | valid   |
      | level-L2-invalid.warrant.json        | L2    | invalid |
      | level-L3-valid.warrant.json          | L3    | valid   |
      | level-L3-invalid.warrant.json        | L3    | invalid |
      | level-L4-valid.warrant.json          | L4    | valid   |
      | level-L4-invalid.warrant.json        | L4    | invalid |
      +--------------------------------------+-------+---------+

      Table D-2: Conformance Level Test Vectors

   Note: L3 and L4 vectors use placeholder signature and ledger
   anchor values. These vectors test structural validation, not
   cryptographic verification.

### D.5. Instructions for Independent Implementers

   To verify a Validator implementation against the conformance test
   vector suite:

   1.  Obtain the vector files from the `tests/conformance-vectors/`
       directory distributed with this specification.

   2.  For each vector file:

       a.  Parse the JSON file.

       b.  Extract the `blueprint` object. Discard the
           `_vector_metadata` wrapper (it is test harness metadata,
           not part of the Intent Blueprint).

       c.  Validate the blueprint against the WARRANT v0.11.0 JSON
           Schema.

       d.  For invariant vectors (files prefixed with "invariant-"),
           also run the cross-Pillar invariant check identified by
           the `target` field in `_vector_metadata`.

       e.  Compare the validation result against the
           `expected_result` field ("valid" or "invalid").

       f.  For invalid vectors, verify that the error produced by
           the Validator corresponds to the description in the
           `expected_error` field.

   3.  A conformant Validator MUST produce the correct result (pass
       or fail) for all 16 vectors.

   All vector files are independently parseable as standard JSON. No
   test harness, build tools, or WARRANT repository dependencies are
   required to execute the vectors.


## Appendix E. IANA Media Type Registration Templates

   This appendix provides the formal media type registration templates
   per RFC 6838 [RFC6838] for the two WARRANT media types described
   in Section 15.

### E.1. application/warrant+json

   Type name:
   :   application

   Subtype name:
   :   warrant+json

   Required parameters:
   :   None.

   Optional parameters:
   :   "version" -- The WARRANT specification version that the
       document conforms to (e.g., "0.11.0"). When present, recipients
       MAY use this parameter to select the appropriate JSON Schema
       for validation. When absent, recipients SHOULD inspect the
       "warrant_version" property within the document body.

   Encoding considerations:
   :   Binary (UTF-8 encoded JSON per RFC 8259). The content MUST be
       valid JSON. Implementations MUST use UTF-8 encoding without
       byte order mark (BOM).

   Security considerations:
   :   WARRANT Intent Blueprints declare governance boundaries for
       autonomous AI agents. Tampering with a blueprint could cause
       an agent to operate outside its intended boundaries. At L3
       (Cryptographic) and above, documents include a digital
       signature over the RFC 8785 canonicalized content; recipients
       SHOULD verify the signature before enforcement. At L4
       (Ledger), a ledger anchor hash provides additional tamper
       evidence. See Section 14 of this specification for a full
       security analysis covering semantic drift, persona spoofing,
       downgrade attacks, privilege escalation, kill switch bypass,
       document substitution, parser exploits, and handshake target
       manipulation.

   Interoperability considerations:
   :   WARRANT documents are validated against a JSON Schema (draft-07)
       published at the URI specified in the schema's "$id" field.
       Implementations MUST support JSON Schema draft-07 validation.
       Cross-Pillar invariant checks (Section 12) require
       computational validation beyond JSON Schema structural checks.
       The specification includes 18 conformance test vectors
       (Appendix D) for interoperability verification.

   Published specification:
   :   This document (draft-warrant-intent-blueprint-00).

   Applications that use this media type:
   :   AI agent orchestration platforms, governance Validators,
       runtime Enforcement Engines, compliance audit tools, and
       agent deployment pipelines that manage autonomous agents
       operating within defined governance boundaries.

   Fragment identifier considerations:
   :   The fragment identifier syntax is that of "application/json"
       as specified in RFC 8259. JSON Pointer (RFC 6901) MAY be used
       to reference specific properties within the document (e.g.,
       "#/manifest/status" or "#/boundaries/kill_switch").

   Additional information:

      Deprecated alias names for this type:  N/A
      Magic number(s):  N/A
      File extension(s):  .warrant.json
      Macintosh file type code(s):  N/A

   Person and email address to contact for further information:
   :   Ciprian Irimies <ciprian@pathmaven.pro>,
       Lucian Lungu <lucian@pathmaven.pro>

   Intended usage:
   :   COMMON

   Restrictions on usage:
   :   None.

   Author:
   :   Ciprian Irimies, Lucian Lungu

   Change controller:
   :   IETF (iesg@ietf.org) or the document authors, depending on
       the intended status of the specification at the time of
       registration.

### E.2. application/warrant+yaml

   Type name:
   :   application

   Subtype name:
   :   warrant+yaml

   Required parameters:
   :   None.

   Optional parameters:
   :   "version" -- The WARRANT specification version (e.g., "0.11.0").

   Encoding considerations:
   :   Binary (UTF-8 encoded YAML). The content MUST be valid YAML
       1.2 that is round-trippable to JSON without data loss.

   Security considerations:
   :   Same considerations as application/warrant+json (see E.1).
       Additionally, YAML parsers are known to have broader attack
       surface than JSON parsers. Implementations SHOULD use safe
       YAML loading modes that disable arbitrary code execution,
       object instantiation, and file inclusion directives.
       Cryptographic signing (L3+) MUST be performed on the JSON
       serialization (application/warrant+json), not the YAML
       representation. YAML is an authoring convenience; JSON is the
       normative format for validation, signing, and interchange.

   Interoperability considerations:
   :   YAML documents MUST be convertible to the equivalent JSON
       representation without semantic loss. Validation SHOULD be
       performed against the JSON Schema after conversion to JSON.
       YAML-specific features (anchors, aliases, tags, multi-document
       streams) MUST NOT be used in WARRANT YAML documents.

   Published specification:
   :   This document (draft-warrant-intent-blueprint-00).

   Applications that use this media type:
   :   Human-readable authoring tools, code review systems, and
       configuration management pipelines where YAML readability
       is preferred during the Draft lifecycle stage.

   Fragment identifier considerations:
   :   N/A. YAML does not have a standardised fragment identifier
       syntax. Implementations requiring fragment references SHOULD
       convert to JSON and use JSON Pointer (RFC 6901).

   Additional information:

      Deprecated alias names for this type:  N/A
      Magic number(s):  N/A
      File extension(s):  .warrant.yaml, .warrant.yml
      Macintosh file type code(s):  N/A

   Person and email address to contact for further information:
   :   Ciprian Irimies <ciprian@pathmaven.pro>,
       Lucian Lungu <lucian@pathmaven.pro>

   Intended usage:
   :   COMMON

   Restrictions on usage:
   :   This media type is informational. The normative serialization
       format is application/warrant+json. Cryptographic operations
       (signing, hash computation) MUST NOT be performed on the YAML
       representation.

   Author:
   :   Ciprian Irimies, Lucian Lungu

   Change controller:
   :   IETF (iesg@ietf.org) or the document authors, depending on
       the intended status of the specification at the time of
       registration.


## Appendix F. Migration Guide (v0.10.0 to v0.11.0) {#appendix-f}

   This appendix is normative. It provides the authoritative migration
   path for evolving Intent Blueprints from v0.10.0 to v0.11.0.
   Implementations providing migration tooling MUST apply these rules.
   Conformant Validators MUST accept v0.10.0 blueprints that have been
   migrated according to this guide.

### F.1. Summary of Changes

   The v0.11.0 release introduces one breaking change and multiple
   non-breaking additions. The breaking change is the addition of
   `runtime_observability` as a required root-level property (Pillar
   14). All other changes are additive optional properties that do not
   require modification of existing blueprints.

   +----------------------------+----------+---------------------------+
   | Change                     | Type     | Migration Action          |
   +----------------------------+----------+---------------------------+
   | runtime_observability      | Breaking | Add runtime_observability |
   |   (Pillar 14)              |          |   : {} to blueprint root  |
   | authorised_integrations    | Compat   | No action required;       |
   |   oneOf (string | object)  |          |   plain URIs still valid  |
   | alert_endpoint             | Additive | Optional; add for L3/L4   |
   | alert_format               | Additive | Optional; add for L3/L4   |
   | data_sovereignty_region    | Additive | Optional; no action       |
   | controls                   | Additive | Optional; no action       |
   | discovery_uri              | Additive | Optional; add for L3/L4   |
   | explainability_uri         | Additive | Optional; no action       |
   | drift_detection            | Additive | Optional; no action       |
   | circuit_breaker            | Additive | Optional; no action       |
   | governance_workflow         | Additive | Optional; no action       |
   | crosswalks                 | Additive | Optional; no action       |
   | discovery_protocol         | Additive | Optional; no action       |
   | kpis                       | Additive | Optional; no action       |
   +----------------------------+----------+---------------------------+

### F.2. Breaking Change: runtime_observability (Pillar 14)

   The sole breaking change in v0.11.0 is the addition of
   `runtime_observability` as a required root-level property. Existing
   v0.10.0 blueprints MUST add this property to pass validation against
   the v0.11.0 schema.

   Minimal migration (all conformance levels):

   ```json
   {
     "runtime_observability": {}
   }
   ```

   All sub-properties within `runtime_observability` are optional.
   Adding an empty object satisfies the schema requirement. Blueprints
   MAY populate `intent_traceability`, `heartbeat`, and
   `guardian_alerts` sub-properties as operational needs dictate.

### F.3. Authorised Integrations Format Evolution

   The `integration_map.authorised_integrations` array items now
   support a `oneOf` construct accepting both plain URI strings and
   enriched objects. Existing plain URI strings continue to validate
   without modification.

   Legacy format (still valid):

   ```json
   "authorised_integrations": [
     "https://api.example.com/v1"
   ]
   ```

   Enriched format (recommended for new blueprints):

   ```json
   "authorised_integrations": [
     {
       "uri": "https://api.example.com/v1",
       "justification": "Primary data retrieval endpoint",
       "protocol_version": "1.0"
     }
   ]
   ```

   Mixed arrays containing both formats are valid. The plain URI
   string format is DEPRECATED as of v0.11.0 and will be removed in
   v1.0.0. Implementers SHOULD migrate to the enriched object format
   at their earliest convenience.

### F.4. L3/L4 Conformance Level Additions

   Blueprints at conformance level L3 or L4 MUST add the following
   properties to pass v0.11.0 validation:

   1. `risk_profile.alert_endpoint` -- URI for real-time alert
      delivery (string, format: uri).

   2. `risk_profile.alert_format` -- Alert payload format (string,
      enum: "webhook", "syslog", "cloudevents").

   3. `manifest.discovery_uri` -- Canonical blueprint retrieval URI
      (string, format: uri).

   These properties are optional at L1 and L2.

### F.5. Signature and Ledger Anchor Regeneration

   L3 and L4 blueprints that include `manifest.signature` or
   `manifest.ledger_anchor` MUST regenerate these values after
   migration. The addition of `runtime_observability` and any new
   optional properties changes the document structure, invalidating
   existing cryptographic signatures and ledger anchors.

   Migration steps for L3/L4:

   1. Add `runtime_observability: {}` to the blueprint root.
   2. Add `alert_endpoint`, `alert_format`, and `discovery_uri`.
   3. Remove the existing `signature` and `ledger_anchor` values.
   4. Re-sign the updated blueprint per the signing procedure in
      Section 5.
   5. Re-anchor the signed blueprint to the ledger if applicable.

### F.6. Version Bump

   Update the `warrant_version` property from "0.10.0" to "0.11.0":

   ```json
   {
     "warrant_version": "0.11.0"
   }
   ```


## Appendix G. Alert Payload Structures {#appendix-g}

   This appendix is normative. It defines the payload structures for
   each `alert_format` value supported by the `risk_profile.
   alert_endpoint` mechanism. Enforcement Engines MUST produce
   payloads conforming to the structure specified for the declared
   `alert_format` value.

### G.1. Webhook Format (alert_format: "webhook")

   When `alert_format` is "webhook", the Enforcement Engine MUST send
   an HTTP POST request to the `alert_endpoint` URI with a JSON body
   containing the following fields:

   +------------------+-----------+-----------------------------------+
   | Field            | Type      | Description                       |
   +------------------+-----------+-----------------------------------+
   | alert_id         | string    | Unique identifier for this alert  |
   |                  |           |   instance (UUID recommended).    |
   | metric_ref       | string    | Identifier of the metric that     |
   |                  |           |   triggered the alert. Matches    |
   |                  |           |   guardian_alerts[].metric_ref.   |
   | threshold        | number    | Configured threshold value.       |
   | observed_value   | number    | Actual observed value that        |
   |                  |           |   triggered the alert.            |
   | operator         | string    | Comparison operator (lt, gt, eq,  |
   |                  |           |   lte, gte).                      |
   | action           | string    | Action taken (alert, pause, halt, |
   |                  |           |   escalate).                      |
   | timestamp        | string    | ISO 8601 date-time of the alert.  |
   | blueprint_id     | string    | Value of manifest.blueprint_id.   |
   +------------------+-----------+-----------------------------------+

   Example webhook payload:

   ```json
   {
     "alert_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
     "metric_ref": "task_completion_rate",
     "threshold": 0.90,
     "observed_value": 0.82,
     "operator": "lt",
     "action": "alert",
     "timestamp": "2025-01-15T14:30:00Z",
     "blueprint_id": "blueprint-sample-001"
   }
   ```

   The Content-Type header MUST be "application/json". The
   Enforcement Engine SHOULD include an "X-WARRANT-Signature" header
   containing an HMAC-SHA256 signature of the payload body for
   webhook authenticity verification.

### G.2. Syslog Format (alert_format: "syslog")

   When `alert_format` is "syslog", the Enforcement Engine MUST send
   a message conforming to RFC 5424 (The Syslog Protocol) to the
   `alert_endpoint` URI. The alert data MUST be encoded as
   structured data using WARRANT-specific SD-IDs.

   SD-ID: warrant-alert@TBD

   Structured data parameters:

   +------------------+-------------------------------------------+
   | SD-PARAM         | Description                               |
   +------------------+-------------------------------------------+
   | alertId          | Unique alert identifier.                  |
   | metricRef        | Metric that triggered the alert.          |
   | threshold        | Configured threshold value.               |
   | observedValue    | Actual observed value.                    |
   | operator         | Comparison operator.                      |
   | action           | Action taken.                             |
   | blueprintId      | Value of manifest.blueprint_id.           |
   +------------------+-------------------------------------------+

   Example syslog message (RFC 5424 format):

   ```
   <165>1 2025-01-15T14:30:00Z agent.example.com warrant-engine
   - - [warrant-alert@TBD alertId="a1b2c3d4"
   metricRef="task_completion_rate" threshold="0.90"
   observedValue="0.82" operator="lt" action="alert"
   blueprintId="blueprint-sample-001"]
   Guardian alert triggered: task_completion_rate below threshold
   ```

   The facility MUST be set to local use (facility code 20, local4)
   and the severity MUST reflect the action: "alert" maps to
   Warning (4), "pause" maps to Error (3), "halt" maps to Critical
   (2), "escalate" maps to Alert (1).

### G.3. CloudEvents Format (alert_format: "cloudevents")

   When `alert_format` is "cloudevents", the Enforcement Engine MUST
   send an HTTP POST request to the `alert_endpoint` URI with a
   CloudEvents v1.0 envelope conforming to the CloudEvents HTTP
   Protocol Binding specification.

   Required CloudEvents attributes:

   +------------------+-------------------------------------------+
   | Attribute        | Value                                     |
   +------------------+-------------------------------------------+
   | specversion      | "1.0"                                     |
   | type             | "dev.warrant.alert.v1"                    |
   | source           | URI identifying the Enforcement Engine.   |
   | id               | Unique alert identifier (UUID).           |
   | time             | ISO 8601 timestamp of the alert.          |
   | datacontenttype  | "application/json"                        |
   +------------------+-------------------------------------------+

   The `data` field MUST contain a JSON object with the same fields
   as the webhook payload (Section G.1): `alert_id`, `metric_ref`,
   `threshold`, `observed_value`, `operator`, `action`, `timestamp`,
   and `blueprint_id`.

   Example CloudEvents payload:

   ```json
   {
     "specversion": "1.0",
     "type": "dev.warrant.alert.v1",
     "source": "https://enforcement.example.com/engine-01",
     "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
     "time": "2025-01-15T14:30:00Z",
     "datacontenttype": "application/json",
     "data": {
       "alert_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
       "metric_ref": "task_completion_rate",
       "threshold": 0.90,
       "observed_value": 0.82,
       "operator": "lt",
       "action": "alert",
       "timestamp": "2025-01-15T14:30:00Z",
       "blueprint_id": "blueprint-sample-001"
     }
   }
   ```

   The Content-Type header MUST be "application/cloudevents+json;
   charset=UTF-8".


## Appendix H. Circuit Breaker State Machine {#appendix-h}

   This appendix is normative. It defines the state machine for the
   `failure_modes.circuit_breaker` mechanism. Enforcement Engines
   implementing circuit breaker support MUST conform to the state
   transitions defined herein.

### H.1. States

   The circuit breaker operates in one of three states:

   Closed:
   :   Normal operation. Requests to the integration are permitted.
       The Enforcement Engine tracks consecutive failures. This is
       the initial state for all integrations.

   Open:
   :   Fault state. Requests to the integration are blocked. The
       Enforcement Engine executes the `on_open` action (if
       declared). A timer begins counting toward
       `half_open_after_seconds`.

   Half-Open:
   :   Probe state. A limited number of requests are permitted to
       test whether the integration has recovered. The Enforcement
       Engine tracks consecutive successes.

### H.2. State Transitions

   The following transition rules are normative:

   ```
   +--------+     failure_count >=      +------+
   |        |     failure_threshold     |      |
   | Closed +------------------------->+ Open |
   |        |                           |      |
   +---+----+                           +--+---+
       ^                                   |
       |  success_count >=                 | half_open_after_seconds
       |  success_threshold                | elapsed
       |                                   v
       |                              +----+-----+
       +------------------------------+ Half-Open|
         (consecutive successes)      +----+-----+
                                           |
                                           | any failure
                                           v
                                        +--+---+
                                        | Open |
                                        +------+
   ```

   Transition rules:

   1. Closed to Open: When the number of consecutive failures to an
      integration reaches `failure_threshold`, the circuit MUST
      transition to the Open state.

   2. Open to Half-Open: When `half_open_after_seconds` has elapsed
      since the circuit entered the Open state, the circuit MUST
      transition to the Half-Open state.

   3. Half-Open to Closed: When the number of consecutive successes
      in the Half-Open state reaches `success_threshold`, the circuit
      MUST transition to the Closed state and reset all counters.

   4. Half-Open to Open: When any request fails in the Half-Open
      state, the circuit MUST immediately transition back to the
      Open state and restart the `half_open_after_seconds` timer.

### H.3. Per-Integration State Tracking

   The circuit breaker operates independently for each entry in
   `integration_map.authorised_integrations`. Each integration
   maintains its own failure counter, success counter, and circuit
   state. A circuit opening for one integration MUST NOT affect the
   circuit state of other integrations.

   For object-format integration items, the `uri` property identifies
   the integration for state tracking purposes. For legacy string-
   format items, the string value itself serves as the identifier.

### H.4. on_open Action Execution

   When the circuit transitions to the Open state, the Enforcement
   Engine MUST execute the `on_open` action if declared:

   halt:
   :   The Enforcement Engine MUST stop all operations that depend
       on the affected integration and trigger the `risk_profile.
       on_failure` default action.

   fallback:
   :   The Enforcement Engine MUST route requests to the fallback
       mechanism defined in `failure_modes.known_failure_modes[]`
       for the affected integration.

   escalate:
   :   The Enforcement Engine MUST notify the governance workflow
       (if declared) or the `alert_endpoint` (if declared) that
       the circuit has opened, and await human intervention.

   If `on_open` is not declared, the Enforcement Engine MUST default
   to blocking requests to the affected integration without
   additional action.


## Appendix I. Heartbeat Protocol {#appendix-i}

   This appendix is normative. It defines the push-based liveness
   signal specification for the `runtime_observability.heartbeat`
   mechanism. Enforcement Engines implementing heartbeat support
   MUST conform to the protocol defined herein.

### I.1. Protocol Overview

   The heartbeat protocol is a push-based liveness signal broadcast
   by a governed agent at a configurable frequency. It complements
   the pull-based `discovery_uri` (Section 7) and `discovery_protocol`
   (Appendix K) mechanisms by providing real-time status updates
   without requiring polling.

### I.2. Payload Structure

   Each heartbeat signal MUST be an HTTP POST request to the
   `broadcast_uri` with a JSON body containing the following fields:

   +--------------------+-----------+---------------------------------+
   | Field              | Type      | Description                     |
   +--------------------+-----------+---------------------------------+
   | agent_id           | string    | Unique identifier of the agent  |
   |                    |           |   instance.                     |
   | blueprint_id       | string    | Value of manifest.blueprint_id. |
   | timestamp          | string    | ISO 8601 date-time of the       |
   |                    |           |   heartbeat.                    |
   | status             | string    | Agent status. Enum: "alive",    |
   |                    |           |   "degraded", "shutting_down".  |
   +--------------------+-----------+---------------------------------+

   The `status` field MUST be one of:

   alive:
   :   The agent is operating normally within declared boundaries.

   degraded:
   :   The agent is operational but one or more integrations or
       metrics are outside normal parameters.

   shutting_down:
   :   The agent is in the process of graceful shutdown. This SHOULD
       be the final heartbeat before the agent stops broadcasting.

   Example heartbeat payload:

   ```json
   {
     "agent_id": "agent-prod-001",
     "blueprint_id": "blueprint-sample-001",
     "timestamp": "2025-01-15T14:30:00Z",
     "status": "alive"
   }
   ```

   The Content-Type header MUST be "application/json".

### I.3. Interval Enforcement

   The Enforcement Engine MUST broadcast heartbeat signals at the
   frequency specified by `heartbeat.interval_seconds`. To prevent
   thundering-herd synchronisation when large fleets of agents share
   the same broadcast interval, Enforcement Engines SHOULD apply a
   random jitter of plus or minus 10% to each interval.

   For example, with `interval_seconds` of 30, the actual interval
   for each broadcast SHOULD be randomly selected from the range
   [27, 33] seconds.

### I.4. Missed Heartbeat Detection

   Monitoring systems receiving heartbeat signals SHOULD classify an
   agent as "unresponsive" when three consecutive heartbeats are
   missed. A heartbeat is considered missed when no signal is
   received within `interval_seconds` plus the 10% jitter tolerance.

   The detection threshold of three consecutive missed heartbeats
   provides tolerance for transient network issues while ensuring
   timely detection of agent failures. Upon detecting an
   unresponsive agent, the monitoring system SHOULD trigger the
   configured `risk_profile.on_failure` action.

   For L3 and L4 blueprints, the heartbeat payload SHOULD include
   the `signature_hash` from `manifest.signature.hash` to enable
   real-time signature verification without retrieving the full
   blueprint.


## Appendix J. Reasoning Manifest Entry Structure {#appendix-j}

   This appendix is normative. It defines the structured log entry
   format for the `runtime_observability.intent_traceability`
   mechanism. Enforcement Engines implementing intent traceability
   MUST produce log entries conforming to the structure defined
   herein.

### J.1. Entry Fields

   Each Reasoning Manifest entry MUST contain the following fields:

   +-------------------+-----------+----------------------------------+
   | Field             | Type      | Description                      |
   +-------------------+-----------+----------------------------------+
   | entry_id          | string    | Unique identifier for this log   |
   |                   |           |   entry (UUID recommended).      |
   | timestamp         | string    | ISO 8601 date-time of the action.|
   | action            | string    | Type of action performed. Enum:  |
   |                   |           |   "tool_call", "data_read",      |
   |                   |           |   "data_write".                  |
   | reasoning         | string    | Human-readable justification     |
   |                   |           |   linking the action to the      |
   |                   |           |   declared objective.            |
   | inputs            | object    | Input parameters provided to the |
   |                   |           |   action (structure is action-   |
   |                   |           |   type dependent).               |
   | outputs           | object    | Output or result of the action   |
   |                   |           |   (structure is action-type      |
   |                   |           |   dependent).                    |
   | confidence_score  | number    | Optional. Value between 0 and 1  |
   |                   |           |   indicating the agent's         |
   |                   |           |   confidence that this action    |
   |                   |           |   aligns with the declared       |
   |                   |           |   objective.                     |
   +-------------------+-----------+----------------------------------+

   The `reasoning` field MUST contain human-readable text that allows
   a non-technical reviewer to follow the agent's reasoning from the
   declared objective to the specific action taken.

### J.2. Log Format: JSON (log_format: "json")

   When `log_format` is "json", each entry MUST be serialized as a
   single JSON object, one per line (JSON Lines format). The entry
   MUST contain all fields from Section J.1.

   Example JSON entry:

   ```json
   {
     "entry_id": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
     "timestamp": "2025-01-15T14:30:00Z",
     "action": "tool_call",
     "reasoning": "Retrieving customer data to fulfil primary objective of generating quarterly report",
     "inputs": {
       "tool": "database_query",
       "target_uri": "https://api.example.com/customers"
     },
     "outputs": {
       "status": 200,
       "record_count": 150
     },
     "confidence_score": 0.95
   }
   ```

### J.3. Log Format: OpenTelemetry (log_format: "opentelemetry")

   When `log_format` is "opentelemetry", each entry MUST be encoded
   as an OpenTelemetry Span with WARRANT-specific attributes. The
   span attributes MUST include:

   - `warrant.entry_id` -- The entry identifier.
   - `warrant.action` -- The action type enum value.
   - `warrant.reasoning` -- The justification text.
   - `warrant.confidence_score` -- The confidence value (if present).

   The `inputs` and `outputs` fields MUST be encoded as span events
   named "warrant.input" and "warrant.output" respectively.

   Implementations MUST use the OpenTelemetry Logs or Spans data
   model as defined by the OpenTelemetry specification. The trace
   context SHOULD be propagated to enable correlation with
   distributed traces.

### J.4. Log Format: Custom (log_format: "custom")

   When `log_format` is "custom", the entry structure is
   implementation-defined. However, the entry MUST contain at minimum
   the `entry_id`, `timestamp`, `action`, and `reasoning` fields
   from Section J.1 in a format that is machine-parseable.

   Implementations using the "custom" format MUST document their
   entry structure and publish the documentation at the
   `reasoning_manifest_uri` endpoint with a `Content-Type` header
   that identifies the format.


## Appendix K. Discovery Protocol {#appendix-k}

   This appendix is normative. It defines the HTTP-based discovery
   protocol for inventorying WARRANT-governed agents and detecting
   ungoverned Shadow AI. Enforcement Engines and Orchestrators
   exposing agent blueprint metadata for discovery MUST conform to
   the protocol defined herein.

### K.1. Well-Known Endpoint

   A conformant discovery endpoint MUST respond to HTTP GET requests
   at the path `/.well-known/warrant-discovery`. The response MUST
   have Content-Type "application/json" and contain a JSON array of
   agent metadata objects.

   The endpoint URI is declared in the Intent Blueprint via
   `manifest.discovery_protocol.well_known_endpoint`.

### K.2. Response Format

   The discovery response MUST be a JSON array where each element is
   an object with the following fields:

   +--------------------+-----------+---------------------------------+
   | Field              | Type      | Description                     |
   +--------------------+-----------+---------------------------------+
   | agent_id           | string    | Unique identifier of the agent  |
   |                    |           |   instance.                     |
   | blueprint_id       | string    | Value of manifest.blueprint_id  |
   |                    |           |   from the agent's blueprint.   |
   | discovery_uri      | string    | URI from which the full Intent  |
   |                    |           |   Blueprint can be retrieved.   |
   | status             | string    | Lifecycle status. Enum: "draft",|
   |                    |           |   "active", "deprecated",       |
   |                    |           |   "archived", "ungoverned",     |
   |                    |           |   "unresponsive".               |
   | conformance_level  | string    | Declared conformance level.     |
   |                    |           |   Enum: "L1", "L2", "L3", "L4".|
   +--------------------+-----------+---------------------------------+

   Note: The `status` field in the discovery response has a different
   value space than `manifest.status` in the Intent Blueprint schema.
   The discovery-specific values "ungoverned" and "unresponsive" are
   used exclusively in discovery responses to classify agents that
   lack a valid blueprint or fail to respond to health checks,
   respectively. Implementations MUST NOT attempt to validate
   discovery response objects against the Intent Blueprint schema.

   Agents without a valid WARRANT Intent Blueprint MUST be classified
   with `status` of "ungoverned" in the discovery response, enabling
   Shadow AI detection.

   Example discovery response:

   ```json
   [
     {
       "agent_id": "agent-prod-001",
       "blueprint_id": "blueprint-sample-001",
       "discovery_uri": "https://agents.example.com/bp/sample-001",
       "status": "active",
       "conformance_level": "L3"
     },
     {
       "agent_id": "agent-prod-002",
       "blueprint_id": "unknown",
       "discovery_uri": "",
       "status": "ungoverned",
       "conformance_level": "L1"
     }
   ]
   ```

### K.3. Security Requirements

   The discovery endpoint MUST require TLS 1.2 or higher for all
   connections. Mutual TLS (mTLS) is RECOMMENDED for enterprise
   deployments to authenticate both the client and the server.

   For blueprints where `risk_profile.hitl_triggers` contains low-threshold
   or "critical" severity interrupts, the discovery endpoint SHOULD enforce
   the following additional protections:

   Rate limiting:
   :   Maximum 60 requests per minute per client. Implementations
       SHOULD use standard HTTP 429 (Too Many Requests) responses
       with a Retry-After header when the limit is exceeded.

   Field-level masking:
   :   Sensitive fields MUST be redacted in discovery responses to
       mitigate governance reconnaissance attacks. The following
       fields MUST be masked when present in the full blueprint
       retrieved via `discovery_uri`:

       - `data_model.data_sources`
       - `integration_map.authorised_integrations`
       - `boundaries.prohibited_actions`

       Masked fields SHOULD be replaced with a placeholder value
       such as "[REDACTED]" or omitted entirely from the response.

### K.4. Refresh Interval

   The `manifest.discovery_protocol.refresh_interval_seconds` property
   specifies how often the discovery index is refreshed. The minimum
   value is 60 seconds. Governance tooling SHOULD respect this
   interval and avoid polling more frequently than the declared
   refresh rate.

   When the refresh interval elapses, the discovery endpoint MUST
   re-scan for active agents and update the response accordingly.
   The endpoint SHOULD support HTTP ETag-based conditional requests
   to enable efficient cache validation by governance tooling.


## Appendix L. Compliance Crosswalk Reference Mappings {#appendix-l}

   This appendix is non-normative. It provides informational reference
   mappings between major regulatory frameworks and WARRANT Pillars.
   These mappings are starting points for compliance analysis.
   Organisations MUST validate the mappings against their specific
   regulatory interpretations and jurisdictional requirements. These
   mappings do not constitute legal or regulatory compliance
   certification.

### L.1. EU AI Act Reference Mappings

   The following table maps key EU AI Act articles to WARRANT Pillars.
   Coverage status indicates the degree to which the WARRANT Pillar
   addresses the regulatory requirement.

   +-------------------+---------------------------+-----------+
   | EU AI Act Article | WARRANT Pillar(s)         | Coverage  |
   +-------------------+---------------------------+-----------+
   | Art. 9 (Risk      | risk_profile,             | Full      |
   |   Management)     |   runtime_observability   |           |
   | Art. 13           | ux_logic, manifest        | Full      |
   |   (Transparency)  |                           |           |
   | Art. 14 (Human    | risk_profile              | Full      |
   |   Oversight)      |   (hitl_triggers),        |           |
   |                   |   stakeholders            |           |
   | Art. 15 (Accuracy,| success_metrics,          | Partial   |
   |   Robustness,     |   failure_modes,          |           |
   |   Cybersecurity)  |   boundaries              |           |
   | Art. 10 (Data     | data_model                | Full      |
   |   Governance)     |                           |           |
   | Art. 11 (Technical| manifest (signature,      | Full      |
   |   Documentation)  |   ledger_anchor),         |           |
   |                   |   compliance_frameworks   |           |
   | Art. 12 (Record-  | runtime_observability     | Full      |
   |   Keeping)        |   (intent_traceability)   |           |
   +-------------------+---------------------------+-----------+

### L.2. ISO 42001 Reference Mappings

   The following table maps ISO 42001 (AI Management System) clauses
   to WARRANT Pillars.

   +-------------------+---------------------------+-----------+
   | ISO 42001 Clause  | WARRANT Pillar(s)         | Coverage  |
   +-------------------+---------------------------+-----------+
   | 4. Context of the | manifest, objective,      | Full      |
   |   Organisation    |   stakeholders            |           |
   | 5. Leadership     | stakeholders,             | Partial   |
   |                   |   risk_profile            |           |
   |                   |   (governance_workflow)    |           |
   | 6. Planning       | objective, feasibility,   | Full      |
   |                   |   risk_profile            |           |
   | 7. Support        | integration_map,          | Partial   |
   |                   |   feasibility             |           |
   | 8. Operation      | boundaries,               | Full      |
   |                   |   integration_map,        |           |
   |                   |   runtime_observability   |           |
   | 9. Performance    | success_metrics,          | Full      |
   |                   |   runtime_observability   |           |
   |                   |   (guardian_alerts)        |           |
   | 10. Improvement   | failure_modes,            | Partial   |
   |                   |   risk_profile            |           |
   |                   |   (drift_detection)       |           |
   +-------------------+---------------------------+-----------+

### L.3. NIST AI RMF Reference Mappings

   The following table maps NIST AI Risk Management Framework (AI
   RMF 1.0) functions to WARRANT Pillars.

   +-------------------+---------------------------+-----------+
   | NIST AI RMF       | WARRANT Pillar(s)         | Coverage  |
   |   Function        |                           |           |
   +-------------------+---------------------------+-----------+
   | GOVERN            | compliance_frameworks,    | Full      |
   |                   |   stakeholders,           |           |
   |                   |   risk_profile            |           |
   |                   |   (governance_workflow)    |           |
   | MAP               | objective, data_model,    | Full      |
   |                   |   integration_map,        |           |
   |                   |   personas                |           |
   | MEASURE           | success_metrics,          | Full      |
   |                   |   runtime_observability   |           |
   |                   |   (guardian_alerts),       |           |
   |                   |   risk_profile            |           |
   |                   |   (drift_detection)       |           |
   | MANAGE            | failure_modes,            | Full      |
   |                   |   boundaries,             |           |
   |                   |   risk_profile            |           |
   |                   |   (circuit_breaker)       |           |
   +-------------------+---------------------------+-----------+

   Note: The NIST AI RMF functions are high-level categories. The
   mappings above indicate which WARRANT Pillars provide the
   governance structures most relevant to each function. Detailed
   sub-category mappings should be developed using the `crosswalks`
   schema property (Section 7) with per-clause granularity.


## Appendix M. Competitive Landscape {#appendix-m}

   This appendix is non-normative. It positions the WARRANT standard
   relative to other agent governance approaches in the emerging AI
   governance ecosystem. This analysis is vendor-agnostic and does
   not name specific products or implementations.

### M.1. Governance Approach Categories

   The current landscape of agent governance approaches can be
   broadly categorised as follows:

   Runtime-Only Monitoring:
   :   Approaches that focus exclusively on observing agent behaviour
       at runtime without requiring pre-deployment intent declaration.
       These systems detect anomalies and policy violations after
       they occur but lack a declarative governance contract that
       specifies what the agent is authorised to do before
       deployment.

   Post-Hoc Audit:
   :   Approaches that provide retrospective analysis of agent
       actions through log aggregation and compliance reporting.
       These systems are valuable for regulatory evidence but do
       not prevent governance violations in real-time.

   Policy-as-Code:
   :   Approaches that encode governance rules as executable policies
       evaluated at runtime. These systems provide enforcement but
       typically lack the holistic, multi-dimensional governance
       structure that covers intent, permissions, compliance, risk,
       and operational boundaries in a single document.

### M.2. WARRANT Differentiators

   The WARRANT standard occupies a distinct position in the
   governance landscape through the following differentiators:

   Pre-Deployment Intent Declaration:
   :   WARRANT requires agents to declare their objectives,
       permissions, boundaries, and compliance posture before
       deployment. This "shift-left" approach enables governance
       review, approval workflows, and automated validation before
       an agent begins operating, rather than relying solely on
       runtime detection.

   14-Pillar Coverage:
   :   The WARRANT framework addresses 14 distinct governance
       dimensions (Manifest, Objective, UX Logic, Feasibility,
       Stakeholders, Compliance Frameworks, Risk Profile, Data
       Model, Boundaries, Integration Map, Success Metrics, Failure
       Modes, Personas, Runtime Observability) in a single,
       machine-validatable document. This breadth ensures that
       governance gaps between dimensions are identified through
       Cross-Pillar Invariants.

   Conformance Levels:
   :   The four-level conformance system (L1 through L4) provides a
       graduated adoption path. Organisations can begin with
       lightweight L1 blueprints and progressively adopt
       cryptographic signing (L3) and immutable ledger anchoring
       (L4) as their governance maturity increases.

   Cross-Pillar Invariants:
   :   WARRANT defines five invariants that enforce consistency
       across Pillars (e.g., every authorised integration must have
       a failure mode, every guardian alert must reference a
       measurable KPI). These invariants prevent governance gaps
       that single-dimension approaches cannot detect.

### M.3. Complementary Positioning

   WARRANT is designed to complement, not replace, runtime monitoring
   and policy-as-code systems. The Intent Blueprint serves as the
   declarative governance contract that runtime systems enforce. The
   `alert_endpoint`, `heartbeat`, and `discovery_protocol` mechanisms
   in v0.11.0 provide the integration points between the declarative
   blueprint and runtime enforcement infrastructure.


## Appendix N. Future Work and Roadmap {#appendix-n}

   This appendix is non-normative. It documents planned enhancements
   and their dependency relationships to provide transparency for
   future contributors and implementers.

### N.1. Tier 3 Dependency Graph

   The following diagram illustrates the dependency relationships
   between Tier 1, Tier 2, and Tier 3 features. Tier 3 features
   build on foundations established by Tier 1 and Tier 2.

   ```
   Tier 1 (v0.11.0)              Tier 2 (v0.11.0)
   +-----------------+           +---------------------+
   | alert_endpoint  +---------->| drift_detection     |
   | alert_format    |     +---->| circuit_breaker     |
   +-----------------+     |     +---------------------+
   | discovery_uri   +--+  |
   +-----------------+  |  |     Tier 3 (v0.11.0)
   | controls        +--+--+--->+---------------------+
   +-----------------+  |  |    | governance_workflow  |
   | explainability  |  |  |    |   depends on:        |
   |   _uri          +--+  |    |   - alert_endpoint   |
   +-----------------+  |  |    |   - hitl_triggers    |
                        |  |    +---------------------+
                        |  +--->| crosswalks           |
                        |       |   depends on:        |
                        |       |   - controls         |
                        |       +---------------------+
                        +------>| discovery_protocol   |
                        |       |   depends on:        |
                        |       |   - discovery_uri    |
                        |       +---------------------+
                        +------>| intent_traceability  |
                                |   depends on:        |
                                |   - explainability   |
                                |     _uri             |
                                +---------------------+
                                | heartbeat            |
                                |   depends on:        |
                                |   - discovery_uri    |
                                |   - discovery        |
                                |     _protocol        |
                                +---------------------+
   ```

   Dependency details:

   - `governance_workflow` (Req 13) builds on `alert_endpoint`
     (Req 1) for exception notification and `hitl_triggers` for
     human-in-the-loop escalation.

   - `crosswalks` (Req 14) builds on `compliance_frameworks.
     frameworks[].controls` (Req 3) for granular control mapping
     within individual frameworks.

   - `discovery_protocol` (Req 15) builds on `manifest.discovery_uri`
     (Req 4) as the foundational retrieval mechanism for individual
     blueprints.

   - `intent_traceability` (Req 17) builds on `explainability_uri`
     (Req 5) and `authorised_integrations[].justification` (Req 6)
     for structured reasoning evidence.

   - `heartbeat` (Req 18) builds on `discovery_uri` (Req 4) and
     `discovery_protocol` (Req 15) for push-based liveness
     signalling.

### N.2. Potential v1.0.0 Changes

   The following changes are under consideration for the v1.0.0
   release:

   1. Removal of the deprecated plain URI string format in
      `authorised_integrations`. As of v0.11.0, the plain string
      format is deprecated in favour of the enriched object format
      with `uri`, `justification`, and optional `protocol_version`.
      In v1.0.0, only the object format will be accepted.

   2. Promotion of select Tier 3 optional properties to required
      status at higher conformance levels, based on adoption
      feedback and operational experience.

   3. Formal IANA registration of the `application/warrant+json`
      and `application/warrant+yaml` media types.

### N.3. Future Considerations

   The following capabilities are under investigation for future
   versions beyond v1.0.0:

   Distributed Tracing Integration:
   :   Native support for OpenTelemetry trace context propagation
       within the `runtime_observability` Pillar, enabling
       end-to-end tracing of agent actions across distributed
       systems.

   Canary Analysis:
   :   Declarative canary deployment parameters within the
       `risk_profile`, allowing agents to be deployed incrementally
       with automated rollback based on `guardian_alerts` thresholds.

   Multi-Agent Coordination:
   :   Schema extensions for declaring inter-agent dependencies,
       shared resource boundaries, and coordinated governance
       workflows when multiple WARRANT-governed agents operate
       within the same environment.

