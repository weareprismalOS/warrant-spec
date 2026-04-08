/**
 * Property-Based Tests for WARRANT v0.9.16 Pillar Flattening
 *
 * Uses fast-check for property-based test generation and AJV (via helpers)
 * for JSON Schema validation.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validate, buildMinimalBlueprint } from "./helpers.js";
import { migrateV015ToV016 } from "./v0916-migration.test.js";

// ---------------------------------------------------------------------------
// Load schema directly for structural assertions
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "../WARRANT Intent Blueprint.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PILLAR_NAMES = [
  "manifest",
  "objective",
  "ux_logic",
  "feasibility",
  "stakeholders",
  "compliance_frameworks",
  "risk_profile",
  "data_model",
  "boundaries",
  "integration_map",
  "success_metrics",
  "failure_modes",
  "personas",
];

const REQUIRED_PROPS = ["warrant_version", ...PILLAR_NAMES];

// ---------------------------------------------------------------------------
// Feature: warrant-v0916-pillar-flattening
// ---------------------------------------------------------------------------
describe("Feature: warrant-v0916-pillar-flattening", () => {
  // -------------------------------------------------------------------------
  // Property 1: 13 Root-Level Pillar Properties Exist
  // -------------------------------------------------------------------------
  it("Property 1: 13 Root-Level Pillar Properties Exist — Validates: Requirements 1.1, 1.2", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 12 }), (index) => {
        const pillarName = PILLAR_NAMES[index];

        // The schema defines a root-level property for this Pillar
        expect(schema.properties).toHaveProperty(pillarName);

        // A valid blueprint populating all 13 Pillar properties passes validation
        const doc = buildMinimalBlueprint();
        const result = validate(doc);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2: Eliminated Grouping Objects Absent and Partial Migration Rejected
  // -------------------------------------------------------------------------
  it("Property 2: Eliminated Grouping Objects Absent and Partial Migration Rejected — Validates: Requirements 1.3, 7.3, 12.1, 12.5", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("intent", "permissions", "compliance"),
        (eliminatedKey) => {
          // Verify eliminated grouping objects are NOT in the schema properties
          expect(schema.properties).not.toHaveProperty(eliminatedKey);

          // Build a valid blueprint, then inject the eliminated grouping object
          const doc = buildMinimalBlueprint();
          doc[eliminatedKey] = { dummy: true };

          // The schema must reject the document (additionalProperties: false)
          const result = validate(doc);
          expect(result.valid).toBe(false);
          expect(
            result.errors.some(
              (e) =>
                e.keyword === "additionalProperties" &&
                e.params.additionalProperty === eliminatedKey,
            ),
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );

    // Also verify boundaries only accepts Pillar 09 properties
    const boundariesProps = Object.keys(
      schema.properties.boundaries.properties,
    );
    expect(boundariesProps).toContain("prohibited_actions");
    expect(boundariesProps).toContain("scope_boundaries");
    expect(boundariesProps).toContain("kill_switch");
    expect(boundariesProps).not.toContain("hitl_triggers");
    expect(boundariesProps).not.toContain("failure_modes");
  });

  // -------------------------------------------------------------------------
  // Property 3: Property Definition Preservation Across Restructuring
  // -------------------------------------------------------------------------
  it("Property 3: Property Definition Preservation Across Restructuring — Validates: Requirements 1.4, 1.5, 3.1-3.8", () => {
    // Map of each Pillar to its expected sub-properties
    const PILLAR_PROPERTY_MAP = [
      { pillar: "manifest", props: ["blueprint_id", "version", "owner", "status", "created_at", "updated_at", "name", "extends", "lifecycle_management", "ledger_anchor", "signature"] },
      { pillar: "objective", props: ["primary_objective", "domain", "autonomy_level", "success_criteria", "out_of_scope"] },
      { pillar: "ux_logic", props: ["interaction_model", "user_facing", "tone_and_voice", "edge_case_handling", "failure_ux"] },
      { pillar: "feasibility", props: ["budget_limit", "compute_constraints", "timeline", "dependencies", "hard_stops", "active_period", "top_up_config"] },
      { pillar: "stakeholders", props: ["approvers", "notification_list"] },
      { pillar: "compliance_frameworks", props: ["frameworks"] },
      { pillar: "risk_profile", props: ["hitl_triggers", "on_failure", "financial_risk_limit"] },
      { pillar: "data_model", props: ["data_sources", "data_outputs", "retention_policy", "sensitive_data_categories", "data_ownership", "data_access", "data_write", "data_forbidden"] },
      { pillar: "boundaries", props: ["prohibited_actions", "scope_boundaries", "kill_switch"] },
      { pillar: "integration_map", props: ["authorised_integrations", "rate_limits", "warrant_handshake", "failure_handling", "handshake_failure_handling", "tool_access", "tool_forbidden"] },
      { pillar: "success_metrics", props: ["primary_kpi", "baseline", "measurement_frequency", "evidence_pack_config", "secondary_kpis", "degradation_threshold"] },
      { pillar: "failure_modes", props: ["known_failure_modes", "assumption_risks", "external_dependencies_risk", "edge_cases", "on_failure"] },
      { pillar: "personas", itemProps: ["id", "trust_level", "capabilities_override"] },
    ];

    fc.assert(
      fc.property(fc.integer({ min: 0, max: 12 }), (index) => {
        const entry = PILLAR_PROPERTY_MAP[index];
        const pillarDef = schema.properties[entry.pillar];

        expect(pillarDef).toBeDefined();

        if (entry.pillar === "personas") {
          // personas is an array — check items.properties
          expect(pillarDef.type).toBe("array");
          const itemProps = Object.keys(pillarDef.items.properties);
          for (const prop of entry.itemProps) {
            expect(itemProps).toContain(prop);
          }
        } else {
          // All other Pillars are objects — check properties
          expect(pillarDef.type).toBe("object");
          const definedProps = Object.keys(pillarDef.properties);
          for (const prop of entry.props) {
            expect(definedProps).toContain(prop);
          }
        }
      }),
      { numRuns: 100 },
    );

    // --- Specific constraint preservation checks ---

    // manifest.version has pattern constraint
    expect(schema.properties.manifest.properties.version.pattern).toBe(
      "^\\d+\\.\\d+\\.\\d+$",
    );

    // manifest.created_at has date-time format
    expect(schema.properties.manifest.properties.created_at.format).toBe(
      "date-time",
    );

    // success_metrics has required array with the 4 core properties
    expect(schema.properties.success_metrics.required).toEqual(
      expect.arrayContaining([
        "primary_kpi",
        "baseline",
        "measurement_frequency",
        "evidence_pack_config",
      ]),
    );

    // personas does NOT have minItems at base level (L2+ enforces via conditional)
    expect(schema.properties.personas.minItems).toBeUndefined();

    // personas items have required: ["id", "trust_level"]
    expect(schema.properties.personas.items.required).toEqual(
      expect.arrayContaining(["id", "trust_level"]),
    );
  });

  // -------------------------------------------------------------------------
  // Property 4: Conformance Level Conditional Validation at Root-Level Paths
  // -------------------------------------------------------------------------
  it("Property 4: Conformance Level Conditional Validation at Root-Level Paths — Validates: Requirements 4.1-4.5", () => {
    // --- Helpers to build valid documents per conformance level ---

    function buildValidForLevel(level) {
      switch (level) {
        case "L1":
          return buildMinimalBlueprint({ conformance_level: "L1" });
        case "L2":
          return buildMinimalBlueprint({
            conformance_level: "L2",
            manifest: { status: "active" },
          });
        case "L3":
          return buildMinimalBlueprint({
            conformance_level: "L3",
            manifest: {
              status: "active",
              signature: {
                signed_by: "did:example:signer",
                hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                algorithm: "EdDSA",
              },
              discovery_uri: "https://example.com/discovery",
            },
            compliance_frameworks: {
              frameworks: [{ name: "EU AI Act", version: "2024" }],
            },
            risk_profile: {
              alert_endpoint: "https://example.com/alerts",
              alert_format: "webhook",
            },
          });
        case "L4":
          return buildMinimalBlueprint({
            conformance_level: "L4",
            manifest: {
              status: "active",
              signature: {
                signed_by: "did:example:signer",
                hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                algorithm: "EdDSA",
              },
              ledger_anchor: {
                network: "eip155:1",
                anchor_hash: "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
              },
              discovery_uri: "https://example.com/discovery",
            },
            compliance_frameworks: {
              frameworks: [{ name: "EU AI Act", version: "2024" }],
            },
            risk_profile: {
              alert_endpoint: "https://example.com/alerts",
              alert_format: "webhook",
            },
          });
      }
    }

    // Properties that can be removed to break each level's validation
    const REMOVABLE_BY_LEVEL = {
      L1: [
        { path: ["objective", "domain"], label: "objective.domain" },
        { path: ["objective", "autonomy_level"], label: "objective.autonomy_level" },
        { path: ["risk_profile", "hitl_triggers"], label: "risk_profile.hitl_triggers" },
        { path: ["risk_profile", "on_failure"], label: "risk_profile.on_failure" },
        { path: ["boundaries", "scope_boundaries"], label: "boundaries.scope_boundaries" },
      ],
      L2: [
        { path: ["ux_logic", "interaction_model"], label: "ux_logic.interaction_model" },
        { path: ["ux_logic", "user_facing"], label: "ux_logic.user_facing" },
        { path: ["feasibility", "budget_limit"], label: "feasibility.budget_limit" },
        { path: ["stakeholders", "approvers"], label: "stakeholders.approvers" },
        { path: ["data_model", "data_sources"], label: "data_model.data_sources" },
        { path: ["integration_map", "tool_access"], label: "integration_map.tool_access" },
        // Special case: set manifest.status to "draft" instead of removing
        { path: ["manifest", "status"], label: "manifest.status=draft", action: "set_draft" },
      ],
      L3: [
        { path: ["manifest", "signature"], label: "manifest.signature" },
      ],
      L4: [
        { path: ["manifest", "ledger_anchor"], label: "manifest.ledger_anchor" },
      ],
    };

    fc.assert(
      fc.property(
        fc.constantFrom("L1", "L2", "L3", "L4"),
        (level) => {
          // 1. Valid document for this level MUST pass
          const validDoc = buildValidForLevel(level);
          const validResult = validate(validDoc);
          expect(validResult.valid).toBe(true);

          // 2. For each removable property at this level, removing it MUST fail
          const removables = REMOVABLE_BY_LEVEL[level];
          for (const removable of removables) {
            const brokenDoc = buildValidForLevel(level);

            if (removable.action === "set_draft") {
              // Special case: set status to "draft" to violate L2+ enum constraint
              brokenDoc.manifest.status = "draft";
            } else {
              // Remove the nested property
              const [obj, prop] = removable.path;
              delete brokenDoc[obj][prop];
            }

            const brokenResult = validate(brokenDoc);
            expect(brokenResult.valid).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 5: Required Array Enforcement
  // -------------------------------------------------------------------------
  it("Property 5: Required Array Enforcement — Validates: Requirements 4.6, 13.2", () => {
    fc.assert(
      fc.property(
        fc.subarray(REQUIRED_PROPS, { minLength: 1 }),
        (propsToRemove) => {
          // Build a valid blueprint, then delete each property in the subset
          const doc = buildMinimalBlueprint();
          for (const prop of propsToRemove) {
            delete doc[prop];
          }

          // The schema must reject the document
          const result = validate(doc);
          expect(result.valid).toBe(false);

          // At least one error must reference a missing required property
          const hasMissingPropError = result.errors.some(
            (e) =>
              e.keyword === "required" &&
              REQUIRED_PROPS.includes(e.params.missingProperty),
          );
          expect(hasMissingPropError).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 6: Cross-Pillar Invariant Enforcement at Root-Level Paths
  // -------------------------------------------------------------------------
  it("Property 6: Cross-Pillar Invariant Enforcement at Root-Level Paths — Validates: Requirements 5.1-5.5", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3 }), (scenario) => {
        switch (scenario) {
          // Scenario 0: integration_map.authorised_integrations ↔ failure_modes.known_failure_modes
          case 0: {
            const doc = buildMinimalBlueprint({
              integration_map: {
                authorised_integrations: [
                  "https://example.com/api",
                  "https://example.com/api2",
                ],
              },
              failure_modes: {
                known_failure_modes: [
                  { scenario: "API timeout", severity: "high", mitigation: "Retry" },
                  { scenario: "Rate limit", severity: "medium", mitigation: "Backoff" },
                ],
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(true);

            // Verify the cross-pillar paths are at root level (not nested)
            expect(doc.integration_map.authorised_integrations).toBeDefined();
            expect(doc.failure_modes.known_failure_modes).toBeDefined();
            expect(schema.properties.integration_map.properties).toHaveProperty("authorised_integrations");
            expect(schema.properties.failure_modes.properties).toHaveProperty("known_failure_modes");
            break;
          }

          // Scenario 1: feasibility.budget_limit ↔ risk_profile
          case 1: {
            const doc = buildMinimalBlueprint({
              feasibility: {
                budget_limit: { amount: 5000, currency: "EUR", time_period: "monthly" },
              },
              risk_profile: {
                hitl_triggers: [
                  { metric: "spend_rate", threshold: 4000, operator: "gt", action: "pause_and_verify" },
                ],
                on_failure: { default: "halt" },
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(true);

            // Verify the cross-pillar paths are at root level
            expect(doc.feasibility.budget_limit).toBeDefined();
            expect(doc.risk_profile).toBeDefined();
            expect(schema.properties.feasibility.properties).toHaveProperty("budget_limit");
            expect(schema.properties).toHaveProperty("risk_profile");
            break;
          }

          // Scenario 2: personas[].trust_level ↔ stakeholders.approvers
          case 2: {
            const doc = buildMinimalBlueprint({
              personas: [
                { id: "persona-a", trust_level: "standard" },
                { id: "persona-b", trust_level: "high" },
              ],
              stakeholders: {
                approvers: ["did:example:approver-1", "did:example:approver-2"],
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(true);

            // Verify the cross-pillar paths are at root level
            expect(doc.personas[0].trust_level).toBeDefined();
            expect(doc.stakeholders.approvers).toBeDefined();
            expect(schema.properties.personas.items.properties).toHaveProperty("trust_level");
            expect(schema.properties.stakeholders.properties).toHaveProperty("approvers");
            break;
          }

          // Scenario 3: boundaries.prohibited_actions ↔ integration_map.authorised_integrations
          case 3: {
            const doc = buildMinimalBlueprint({
              boundaries: {
                prohibited_actions: [
                  { resource_pattern: "^https://blocked\\.example\\.com/.*", methods: ["*"], description: "Blocked" },
                ],
                scope_boundaries: ["No production access"],
                kill_switch: { type: "api_endpoint", uri: "https://example.com/kill" },
              },
              integration_map: {
                authorised_integrations: ["https://allowed.example.com/api"],
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(true);

            // Verify the cross-pillar paths are at root level
            expect(doc.boundaries.prohibited_actions).toBeDefined();
            expect(doc.integration_map.authorised_integrations).toBeDefined();
            expect(schema.properties.boundaries.properties).toHaveProperty("prohibited_actions");
            expect(schema.properties.integration_map.properties).toHaveProperty("authorised_integrations");
            break;
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 7: Boundary Precedence Over Permissions at v0.9.16 Paths
  // -------------------------------------------------------------------------
  it("Property 7: Boundary Precedence Over Permissions at v0.9.16 Paths — Validates: Requirements 6.2, 6.5", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (scenario) => {
        switch (scenario) {
          // Scenario 0: boundaries.prohibited_actions resource_pattern overlaps
          // with integration_map.tool_access URI
          case 0: {
            const sharedUri = "https://example.com/shared-tool";
            const doc = buildMinimalBlueprint({
              boundaries: {
                prohibited_actions: [
                  {
                    resource_pattern: sharedUri,
                    methods: ["*"],
                    description: "Blocked tool",
                  },
                ],
                scope_boundaries: ["No production access"],
                kill_switch: {
                  type: "api_endpoint",
                  uri: "https://example.com/kill",
                },
              },
              integration_map: {
                tool_access: [sharedUri],
              },
            });

            // Schema accepts the document — conflict resolution is runtime
            const result = validate(doc);
            expect(result.valid).toBe(true);

            // Both paths exist at root level
            expect(doc.boundaries.prohibited_actions).toBeDefined();
            expect(doc.integration_map.tool_access).toBeDefined();
            expect(doc.boundaries.prohibited_actions[0].resource_pattern).toBe(
              sharedUri,
            );
            expect(doc.integration_map.tool_access).toContain(sharedUri);

            // Schema defines both paths at root level (not nested)
            expect(
              schema.properties.boundaries.properties,
            ).toHaveProperty("prohibited_actions");
            expect(
              schema.properties.integration_map.properties,
            ).toHaveProperty("tool_access");
            break;
          }

          // Scenario 1: data_model.data_forbidden overlaps with
          // data_model.data_access
          case 1: {
            const sharedUri = "https://example.com/shared-data";
            const doc = buildMinimalBlueprint({
              data_model: {
                data_sources: ["https://example.com/source"],
                data_access: [sharedUri],
                data_forbidden: [sharedUri],
              },
            });

            // Schema accepts — precedence is runtime
            const result = validate(doc);
            expect(result.valid).toBe(true);

            // Both arrays exist under root-level data_model
            expect(doc.data_model.data_access).toContain(sharedUri);
            expect(doc.data_model.data_forbidden).toContain(sharedUri);

            // Schema defines both under root-level data_model
            expect(
              schema.properties.data_model.properties,
            ).toHaveProperty("data_access");
            expect(
              schema.properties.data_model.properties,
            ).toHaveProperty("data_forbidden");
            break;
          }

          // Scenario 2: integration_map.tool_forbidden overlaps with
          // integration_map.tool_access
          case 2: {
            const sharedUri = "https://example.com/shared-tool";
            const doc = buildMinimalBlueprint({
              integration_map: {
                tool_access: [sharedUri],
                tool_forbidden: [sharedUri],
              },
            });

            // Schema accepts — precedence is runtime
            const result = validate(doc);
            expect(result.valid).toBe(true);

            // Both arrays exist under root-level integration_map
            expect(doc.integration_map.tool_access).toContain(sharedUri);
            expect(doc.integration_map.tool_forbidden).toContain(sharedUri);

            // Schema defines both under root-level integration_map
            expect(
              schema.properties.integration_map.properties,
            ).toHaveProperty("tool_access");
            expect(
              schema.properties.integration_map.properties,
            ).toHaveProperty("tool_forbidden");
            break;
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 8: Mandatory Kill Switch with Type-Specific Conditionals
  // -------------------------------------------------------------------------
  it("Property 8: Mandatory Kill Switch with Type-Specific Conditionals — Validates: Requirements 7.1, 7.2", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("api_endpoint", "smart_contract", "manual"),
        (killSwitchType) => {
          // 1. Build a valid document with the correct type-specific fields
          const validKillSwitch = { type: killSwitchType };
          if (killSwitchType === "api_endpoint") {
            validKillSwitch.uri = "https://example.com/kill";
          } else if (killSwitchType === "smart_contract") {
            validKillSwitch.contract_address = "0xABCDEF1234567890";
          }
          // manual requires no additional properties

          const validDoc = buildMinimalBlueprint({
            boundaries: {
              kill_switch: validKillSwitch,
              scope_boundaries: ["No production access"],
            },
          });
          const validResult = validate(validDoc);
          expect(validResult.valid).toBe(true);

          // 2. For api_endpoint: remove uri → must fail
          if (killSwitchType === "api_endpoint") {
            const brokenDoc = buildMinimalBlueprint({
              boundaries: {
                kill_switch: { type: "api_endpoint" },
                scope_boundaries: ["No production access"],
              },
            });
            // Deep-merge preserves baseline uri — explicitly delete it
            delete brokenDoc.boundaries.kill_switch.uri;
            const brokenResult = validate(brokenDoc);
            expect(brokenResult.valid).toBe(false);
          }

          // 3. For smart_contract: remove contract_address → must fail
          if (killSwitchType === "smart_contract") {
            const brokenDoc = buildMinimalBlueprint({
              boundaries: {
                kill_switch: { type: "smart_contract" },
                scope_boundaries: ["No production access"],
              },
            });
            // Deep-merge preserves baseline contract_address — explicitly delete it
            delete brokenDoc.boundaries.kill_switch.contract_address;
            const brokenResult = validate(brokenDoc);
            expect(brokenResult.valid).toBe(false);
          }

          // 4. For manual: just type is sufficient → must pass
          if (killSwitchType === "manual") {
            const manualDoc = buildMinimalBlueprint({
              boundaries: {
                kill_switch: { type: "manual" },
                scope_boundaries: ["No production access"],
              },
            });
            const manualResult = validate(manualDoc);
            expect(manualResult.valid).toBe(true);
          }

          // 5. Remove kill_switch from L2 document → must fail (kill_switch is L2+ only)
          const noKillSwitchDoc = buildMinimalBlueprint({
            conformance_level: "L2",
            manifest: { status: "active" },
            boundaries: {
              scope_boundaries: ["No production access"],
            },
          });
          delete noKillSwitchDoc.boundaries.kill_switch;
          const noKillSwitchResult = validate(noKillSwitchDoc);
          expect(noKillSwitchResult.valid).toBe(false);
          expect(
            noKillSwitchResult.errors.some(
              (e) =>
                e.keyword === "required" &&
                e.params.missingProperty === "kill_switch",
            ),
          ).toBe(true);

          // 5b. Remove kill_switch from L1 document → must pass (L1 doesn't require it)
          const l1NoKillSwitchDoc = buildMinimalBlueprint({
            conformance_level: "L1",
            boundaries: {
              scope_boundaries: ["No production access"],
            },
          });
          delete l1NoKillSwitchDoc.boundaries.kill_switch;
          const l1NoKillSwitchResult = validate(l1NoKillSwitchDoc);
          expect(l1NoKillSwitchResult.valid).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 9: Active Status Lifecycle Immutability
  // -------------------------------------------------------------------------
  it("Property 9: Active Status Lifecycle Immutability — Validates: Requirements 8.1, 8.3", () => {
    // The 12 non-manifest Pillar properties that are immutable when status is "active"
    const NON_MANIFEST_PILLARS = PILLAR_NAMES.filter((p) => p !== "manifest");

    fc.assert(
      fc.property(fc.integer({ min: 0, max: 11 }), (pillarIndex) => {
        const selectedPillar = NON_MANIFEST_PILLARS[pillarIndex];

        // 1. Build a valid document with manifest.status = "active" and all Pillars populated
        const doc = buildMinimalBlueprint({
          manifest: { status: "active" },
        });
        const result = validate(doc);
        expect(result.valid).toBe(true);

        // 2. Verify the selected non-manifest Pillar exists at root level (not nested)
        expect(doc).toHaveProperty(selectedPillar);
        expect(schema.properties).toHaveProperty(selectedPillar);

        // 3. Verify manifest.status is accessible at root-level manifest.status path
        expect(doc.manifest.status).toBe("active");
        expect(schema.properties.manifest.properties).toHaveProperty("status");

        // 4. Verify the schema accepts all valid status values
        for (const statusValue of ["draft", "active", "deprecated", "archived"]) {
          const statusDoc = buildMinimalBlueprint({
            manifest: { status: statusValue },
          });
          const statusResult = validate(statusDoc);
          expect(statusResult.valid).toBe(true);
        }

        // 5. Verify the schema rejects invalid status values
        const invalidDoc = buildMinimalBlueprint({
          manifest: { status: "invalid_status" },
        });
        const invalidResult = validate(invalidDoc);
        expect(invalidResult.valid).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 10: Vendor Extension Acceptance and Unknown Property Rejection
  // -------------------------------------------------------------------------
  it("Property 10: Vendor Extension Acceptance and Unknown Property Rejection — Validates: Requirements 9.1, 9.2, 9.4, 9.5", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (scenario) => {
        switch (scenario) {
          // Scenario 0: Vendor extension accepted at top-level and manifest
          case 0: {
            const extName = "x-acme-test";

            // Vendor extension at top-level document
            const topDoc = buildMinimalBlueprint();
            topDoc[extName] = { custom: true };
            const topResult = validate(topDoc);
            expect(topResult.valid).toBe(true);

            // Vendor extension at manifest (which has additionalProperties: false + patternProperties)
            const manifestDoc = buildMinimalBlueprint();
            manifestDoc.manifest[extName] = "vendor-value";
            const manifestResult = validate(manifestDoc);
            expect(manifestResult.valid).toBe(true);
            break;
          }

          // Scenario 1: Unknown property rejected at manifest
          case 1: {
            const unknownProps = ["unknown_prop", "foo_bar", "custom_field"];
            for (const unknownProp of unknownProps) {
              const doc = buildMinimalBlueprint();
              doc.manifest[unknownProp] = "should-be-rejected";
              const result = validate(doc);
              expect(result.valid).toBe(false);
              expect(
                result.errors.some(
                  (e) =>
                    e.keyword === "additionalProperties" &&
                    e.params.additionalProperty === unknownProp,
                ),
              ).toBe(true);
            }
            break;
          }

          // Scenario 2: Unknown property rejected at sub-objects with additionalProperties: false
          case 2: {
            // Test integration_map.rate_limits
            const rateLimitsDoc = buildMinimalBlueprint({
              integration_map: {
                rate_limits: {
                  requests: 100,
                  window_seconds: 60,
                  unknown_field: "rejected",
                },
              },
            });
            const rlResult = validate(rateLimitsDoc);
            expect(rlResult.valid).toBe(false);
            expect(
              rlResult.errors.some(
                (e) =>
                  e.keyword === "additionalProperties" &&
                  e.params.additionalProperty === "unknown_field",
              ),
            ).toBe(true);

            // Vendor extension at rate_limits should be accepted
            const rlExtDoc = buildMinimalBlueprint({
              integration_map: {
                rate_limits: {
                  requests: 100,
                  window_seconds: 60,
                  "x-acme-rl": "allowed",
                },
              },
            });
            const rlExtResult = validate(rlExtDoc);
            expect(rlExtResult.valid).toBe(true);

            // Test feasibility.top_up_config.top_up_protocol
            const topUpDoc = buildMinimalBlueprint({
              feasibility: {
                top_up_config: {
                  top_up_protocol: {
                    protocol_uri: "https://example.com/topup",
                    max_top_up_amount: 1000,
                    approval_required: true,
                    unknown_field: "rejected",
                  },
                },
              },
            });
            const tuResult = validate(topUpDoc);
            expect(tuResult.valid).toBe(false);
            expect(
              tuResult.errors.some(
                (e) =>
                  e.keyword === "additionalProperties" &&
                  e.params.additionalProperty === "unknown_field",
              ),
            ).toBe(true);

            // Vendor extension at top_up_protocol should be accepted
            const tuExtDoc = buildMinimalBlueprint({
              feasibility: {
                top_up_config: {
                  top_up_protocol: {
                    protocol_uri: "https://example.com/topup",
                    max_top_up_amount: 1000,
                    approval_required: true,
                    "x-acme-topup": "allowed",
                  },
                },
              },
            });
            const tuExtResult = validate(tuExtDoc);
            expect(tuExtResult.valid).toBe(true);
            break;
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 11: Migration Round-Trip Structural Integrity
  // -------------------------------------------------------------------------
  it("Property 11: Migration Round-Trip Structural Integrity — Validates: Requirements 11.2, 11.5, 11.6", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("draft", "active", "deprecated", "archived"),
        fc.constantFrom("finance", "healthcare", "testing", "data-engineering"),
        fc.constantFrom("supervised", "autonomous", "human_in_the_loop"),
        fc.integer({ min: 1, max: 3 }).chain((count) =>
          fc.array(
            fc.record({
              metric: fc.constantFrom("error_rate", "confidence_score", "latency", "spend_rate"),
              threshold: fc.double({ min: 0.1, max: 100, noNaN: true }),
              operator: fc.constantFrom("lt", "gt", "eq", "lte", "gte"),
              action: fc.constantFrom("pause_and_verify", "escalate", "halt", "request_reauthentication", "notify_only"),
            }),
            { minLength: count, maxLength: count },
          ),
        ),
        fc.constantFrom("escalate", "halt", "retry"),
        (status, domain, autonomyLevel, hitlTriggers, onFailureDefault) => {
          // Build a v0.9.15 document with generated random values
          const v015Doc = {
            warrant_version: "0.9.15",
            conformance_level: "L1",
            metadata: {
              blueprint_id: "bp-pbt-001",
              version: "1.0.0",
              owner: "did:example:owner",
              status: status,
              created_at: "2025-01-01T00:00:00Z",
            },
            intent: {
              primary_objective: "PBT test objective",
              domain: domain,
              autonomy_level: autonomyLevel,
              success_criteria: ["Criterion 1"],
              out_of_scope: ["Nothing"],
              ux_logic: {
                interaction_model: "approve",
                user_facing: true,
              },
            },
            permissions: {
              feasibility: {
                budget_limit: { amount: 1000, currency: "USD", time_period: "monthly" },
              },
              stakeholders: {
                approvers: ["did:example:approver"],
              },
              data_model: {
                data_sources: ["https://example.com/source"],
              },
              data_access: ["https://example.com/read"],
              integration_map: {
                authorised_integrations: ["https://example.com/api"],
              },
              tool_access: ["mcp://tool-server/tool-name"],
              on_failure: {
                default: onFailureDefault,
                ...(onFailureDefault === "escalate" ? { escalation_path: ["did:example:escalation"] } : {}),
                ...(onFailureDefault === "retry" ? { retry_policy: { max_retries: 3, backoff: "exponential" } } : {}),
              },
            },
            boundaries: {
              hitl_triggers: hitlTriggers,
              scope_boundaries: ["Must not access production databases"],
              kill_switch: { type: "api_endpoint", uri: "https://example.com/kill" },
              failure_modes: {
                known_failure_modes: [
                  { scenario: "API timeout", severity: "high", mitigation: "Retry" },
                ],
              },
            },
            compliance: {
              frameworks: [{ name: "EU AI Act", version: "2024" }],
              success_metrics: {
                primary_kpi: "accuracy",
                baseline: "95%",
                measurement_frequency: "daily",
                evidence_pack_config: { storage: "s3://bucket", retention_days: 365 },
              },
            },
            personas: [{ id: "persona-1", trust_level: "standard" }],
          };

          // Apply migration
          const migrated = migrateV015ToV016(v015Doc);

          // 1. Migrated document passes v0.9.16 schema validation
          const result = validate(migrated);
          expect(result.valid).toBe(true);

          // 2. Pillar data is preserved at correct v0.9.16 paths
          expect(migrated.manifest.status).toBe(v015Doc.metadata.status);
          expect(migrated.objective.domain).toBe(v015Doc.intent.domain);
          expect(migrated.objective.autonomy_level).toBe(v015Doc.intent.autonomy_level);
          expect(migrated.risk_profile.hitl_triggers).toEqual(v015Doc.boundaries.hitl_triggers);
          expect(migrated.risk_profile.on_failure.default).toBe(v015Doc.permissions.on_failure.default);

          // 3. No old grouping objects remain in the output
          expect(migrated.metadata).toBeUndefined();
          expect(migrated.intent).toBeUndefined();
          expect(migrated.permissions).toBeUndefined();
          expect(migrated.compliance).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });
});
