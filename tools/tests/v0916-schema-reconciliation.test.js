/**
 * Schema–Spec Reconciliation — Bug Condition Exploration Tests
 *
 * Property 1 (Fault Condition): daily_limit_eur Accepted by Unfixed Schema
 *
 * These tests encode the EXPECTED (correct) behaviour: the schema SHOULD
 * reject documents containing `feasibility.top_up_config.daily_limit_eur`.
 *
 * On the UNFIXED schema the test is expected to FAIL — failure confirms
 * the bug exists (daily_limit_eur is still accepted).
 *
 * Validates: Requirements 1.1, 2.1
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validate, buildMinimalBlueprint } from "./helpers.js";

describe("Schema–Spec Reconciliation: Bug Condition Exploration", () => {
  // -----------------------------------------------------------------------
  // Property 1: Fault Condition — daily_limit_eur MUST be rejected
  // -----------------------------------------------------------------------
  // For any numeric daily_limit_eur value (≥ 0), a document that places it
  // inside feasibility.top_up_config SHOULD be rejected with an
  // additionalProperties error on top_up_config.
  //
  // **Validates: Requirements 1.1, 2.1**
  // -----------------------------------------------------------------------
  it("Property 1: daily_limit_eur in top_up_config is rejected as additionalProperties violation", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        (dailyLimit) => {
          const doc = buildMinimalBlueprint({
            feasibility: {
              top_up_config: {
                daily_limit_eur: dailyLimit,
                top_up_protocol: {
                  protocol_uri: "https://example.com/topup",
                  max_top_up_amount: 500,
                  approval_required: true,
                },
              },
            },
          });

          const result = validate(doc);

          // Expected: schema rejects the document
          expect(result.valid).toBe(false);

          // Expected: at least one error is an additionalProperties violation
          // on the top_up_config object mentioning daily_limit_eur
          const hasAdditionalPropsError = result.errors.some(
            (err) =>
              err.keyword === "additionalProperties" &&
              err.params?.additionalProperty === "daily_limit_eur"
          );
          expect(hasAdditionalPropsError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -----------------------------------------------------------------------
  // Sanity check: top_up_config with only top_up_protocol (no daily_limit_eur)
  // is accepted — confirms the bug is specifically about daily_limit_eur
  // -----------------------------------------------------------------------
  it("top_up_config with only top_up_protocol (no daily_limit_eur) is accepted", () => {
    const doc = buildMinimalBlueprint({
      feasibility: {
        top_up_config: {
          top_up_protocol: {
            protocol_uri: "https://example.com/topup",
            max_top_up_amount: 500,
            approval_required: true,
          },
        },
      },
    });

    const result = validate(doc);
    expect(result.valid).toBe(true);
  });
});

// =========================================================================
// Property 2: Preservation — Baseline behaviour to preserve across the fix
// =========================================================================

describe("Schema–Spec Reconciliation: Preservation Properties", () => {
  // -----------------------------------------------------------------------
  // Property 2a: top_up_protocol validates correctly inside top_up_config
  //
  // For all valid top_up_protocol objects (required fields + optional vendor
  // extensions), top_up_config containing only top_up_protocol validates.
  //
  // **Validates: Requirements 3.1**
  // -----------------------------------------------------------------------
  it("Property 2a: top_up_config with valid top_up_protocol (+ optional vendor extensions) validates", () => {
    const vendorKeyArb = fc.stringMatching(/^x-[a-z]+-[a-z]+$/);
    const vendorValueArb = fc.oneof(fc.string(), fc.integer(), fc.boolean());

    const topUpArb = fc.record({
      protocol_uri: fc.webUrl(),
      max_top_up_amount: fc.double({ min: 0, max: 1e6, noNaN: true, noDefaultInfinity: true }),
      approval_required: fc.boolean(),
    });

    const vendorExtArb = fc.array(
      fc.tuple(vendorKeyArb, vendorValueArb),
      { minLength: 0, maxLength: 3 }
    );

    fc.assert(
      fc.property(topUpArb, vendorExtArb, (topUp, vendorPairs) => {
        const topUpWithVendor = { ...topUp };
        for (const [k, v] of vendorPairs) {
          topUpWithVendor[k] = v;
        }

        const doc = buildMinimalBlueprint({
          feasibility: {
            top_up_config: {
              top_up_protocol: topUpWithVendor,
            },
          },
        });

        const result = validate(doc);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // -----------------------------------------------------------------------
  // Property 2b: budget_limit is required at L2, L3, L4
  //
  // For all conformance levels in {L2, L3, L4}, removing budget_limit from
  // feasibility causes validation failure.
  //
  // **Validates: Requirements 3.2**
  // -----------------------------------------------------------------------
  it("Property 2b: removing feasibility.budget_limit causes validation failure at L2, L3, L4", () => {
    const levelArb = fc.constantFrom("L2", "L3", "L4");

    fc.assert(
      fc.property(levelArb, (level) => {
        const doc = buildMinimalBlueprint({
          conformance_level: level,
          manifest: {
            status: "active",
            signature: {
              signed_by: "did:example:signer",
              hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
              algorithm: "ES256",
            },
            ledger_anchor: {
              network: "eip155:1",
              anchor_hash: "sha256:deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
            },
          },
          boundaries: {
            kill_switch: {
              type: "api_endpoint",
              uri: "https://example.com/kill",
            },
            scope_boundaries: ["boundary-1"],
          },
          integration_map: {
            authorised_integrations: ["https://example.com/api"],
            tool_access: ["mcp://tool-server/tool-name"],
          },
          failure_modes: {
            known_failure_modes: [
              { scenario: "timeout", severity: "high", mitigation: "retry" },
            ],
          },
        });

        // Remove budget_limit to trigger the L2+ required check
        delete doc.feasibility.budget_limit;

        const result = validate(doc);
        expect(result.valid).toBe(false);

        const hasBudgetError = result.errors.some(
          (err) =>
            err.keyword === "required" &&
            err.params?.missingProperty === "budget_limit"
        );
        expect(hasBudgetError).toBe(true);
      }),
      { numRuns: 30 }
    );
  });

  // -----------------------------------------------------------------------
  // Property 2c: on_failure configs validate on both risk_profile and
  // failure_modes
  //
  // For all valid on_failure configurations, schema validation accepts them.
  //
  // **Validates: Requirements 3.3, 3.4**
  // -----------------------------------------------------------------------
  it("Property 2c: valid on_failure configs accepted on risk_profile and failure_modes", () => {
    const defaultArb = fc.constantFrom("escalate", "halt", "retry");
    const backoffArb = fc.constantFrom("linear", "exponential", "fixed");

    const riskOnFailureArb = fc.record({
      default: defaultArb,
      failure_ux: fc.string({ minLength: 1, maxLength: 50 }),
      edge_case_handling: fc.string({ minLength: 1, maxLength: 50 }),
      escalation_path: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: 1,
        maxLength: 3,
      }),
      retry_policy: fc.record({
        max_retries: fc.integer({ min: 1, max: 10 }),
        backoff: backoffArb,
      }),
    });

    const failureModesOnFailureArb = fc.record({
      default: defaultArb,
      escalation_path: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: 1,
        maxLength: 3,
      }),
      retry_policy: fc.record({
        max_retries: fc.integer({ min: 1, max: 10 }),
        backoff: backoffArb,
      }),
    });

    fc.assert(
      fc.property(
        riskOnFailureArb,
        failureModesOnFailureArb,
        (riskOnFailure, fmOnFailure) => {
          const doc = buildMinimalBlueprint({
            risk_profile: {
              hitl_triggers: [
                {
                  metric: "error_rate",
                  threshold: 0.5,
                  operator: "gt",
                  action: "pause_and_verify",
                },
              ],
              on_failure: riskOnFailure,
            },
            failure_modes: {
              known_failure_modes: [
                { scenario: "timeout", severity: "high", mitigation: "retry" },
              ],
              on_failure: fmOnFailure,
            },
          });

          const result = validate(doc);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -----------------------------------------------------------------------
  // Property 2d: stakeholders.approvers accepts string arrays
  //
  // For all string arrays, schema continues to accept them.
  //
  // **Validates: Requirements 3.5**
  // -----------------------------------------------------------------------
  it("Property 2d: stakeholders.approvers accepts string arrays", () => {
    const approversArb = fc.uniqueArray(
      fc.string({ minLength: 1, maxLength: 50 }),
      { minLength: 1, maxLength: 5, comparator: (a, b) => a === b }
    );

    fc.assert(
      fc.property(approversArb, (approvers) => {
        const doc = buildMinimalBlueprint({
          stakeholders: { approvers },
        });

        const result = validate(doc);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // -----------------------------------------------------------------------
  // Property 2e: additionalProperties: false on root and capabilities_override
  //
  // Unknown properties are rejected; vendor extensions (^x-[a-z]+-) accepted.
  //
  // **Validates: Requirements 3.6, 3.8**
  // -----------------------------------------------------------------------
  it("Property 2e: root object rejects unknown props but accepts vendor extensions", () => {
    const unknownKeyArb = fc.stringMatching(/^unknown_[a-z]{3,8}$/);
    const vendorKeyArb = fc.stringMatching(/^x-[a-z]+-[a-z]+$/);

    fc.assert(
      fc.property(unknownKeyArb, vendorKeyArb, (unknownKey, vendorKey) => {
        // Unknown property → rejected
        const docBad = buildMinimalBlueprint();
        docBad[unknownKey] = "should-be-rejected";
        const badResult = validate(docBad);
        expect(badResult.valid).toBe(false);
        const hasAdditionalErr = badResult.errors.some(
          (e) =>
            e.keyword === "additionalProperties" &&
            e.params?.additionalProperty === unknownKey
        );
        expect(hasAdditionalErr).toBe(true);

        // Vendor extension → accepted
        const docGood = buildMinimalBlueprint();
        docGood[vendorKey] = "vendor-value";
        const goodResult = validate(docGood);
        expect(goodResult.valid).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  it("Property 2e: capabilities_override rejects unknown props but accepts vendor extensions", () => {
    const unknownKeyArb = fc.stringMatching(/^unknown_[a-z]{3,8}$/);
    const vendorKeyArb = fc.stringMatching(/^x-[a-z]+-[a-z]+$/);

    fc.assert(
      fc.property(unknownKeyArb, vendorKeyArb, (unknownKey, vendorKey) => {
        // Unknown property → rejected
        const docBad = buildMinimalBlueprint({
          personas: [
            {
              id: "persona-1",
              trust_level: "standard",
              capabilities_override: {
                [unknownKey]: true,
              },
            },
          ],
        });
        const badResult = validate(docBad);
        expect(badResult.valid).toBe(false);
        const hasAdditionalErr = badResult.errors.some(
          (e) =>
            e.keyword === "additionalProperties" &&
            e.params?.additionalProperty === unknownKey
        );
        expect(hasAdditionalErr).toBe(true);

        // Vendor extension → accepted
        const docGood = buildMinimalBlueprint({
          personas: [
            {
              id: "persona-1",
              trust_level: "standard",
              capabilities_override: {
                [vendorKey]: "vendor-value",
              },
            },
          ],
        });
        const goodResult = validate(docGood);
        expect(goodResult.valid).toBe(true);
      }),
      { numRuns: 50 }
    );
  });
});
