/**
 * Bug Condition Exploration Tests for WARRANT v0.10.0 Pre-Submission Fixes
 *
 * These tests encode the EXPECTED behaviour after fixes are applied.
 * On UNFIXED code, they MUST FAIL — failure confirms the bugs exist.
 *
 * Uses fast-check for schema fault conditions and string assertions for prose faults.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validate, buildMinimalBlueprint } from "./helpers.js";

// ---------------------------------------------------------------------------
// Load schema directly for structural assertions
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "../WARRANT Intent Blueprint.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// Load prose document for string assertions
const prosePath = resolve(
  __dirname,
  "../WARRANT-ID-v0.11.0.md",
);
const prose = readFileSync(prosePath, "utf-8");

// ---------------------------------------------------------------------------
// v0.10.0 Pre-Submission Fixes
// ---------------------------------------------------------------------------
describe("v0.10.0 Pre-Submission Fixes", () => {
  // =========================================================================
  // Fault Condition — Schema
  // =========================================================================
  describe("Fault Condition — Schema", () => {
    // -----------------------------------------------------------------------
    // Property 1a: Empty budget_limit objects rejected at L2/L3/L4
    // Validates: Requirements 1.1, 2.1
    // -----------------------------------------------------------------------
    it("Property 1a: empty budget_limit {} rejected at L2+ (missing required amount, currency)", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("L2", "L3", "L4"),
          (level) => {
            // Build a valid doc for the level, then REPLACE budget_limit with empty object
            const overrides = { conformance_level: level };

            // Add level-specific fields so the ONLY failure is budget_limit
            if (level === "L3" || level === "L4") {
              overrides.manifest = {
                status: "active",
                signature: {
                  signed_by: "did:example:signer",
                  hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                  algorithm: "EdDSA",
                },
              };
              overrides.compliance_frameworks = {
                frameworks: [{ name: "EU AI Act", version: "2024" }],
              };
            }
            if (level === "L4") {
              overrides.manifest = {
                ...overrides.manifest,
                ledger_anchor: {
                  network: "eip155:1",
                  anchor_hash: "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                },
              };
            }
            if (level === "L2") {
              overrides.manifest = { status: "active" };
            }

            const doc = buildMinimalBlueprint(overrides);
            // Direct assignment to bypass deepMerge (which cannot replace an object with {})
            doc.feasibility.budget_limit = {};
            const result = validate(doc);

            // Expected: schema rejects because amount and currency are required
            expect(result.valid).toBe(false);
            expect(
              result.errors.some(
                (e) =>
                  e.keyword === "required" &&
                  (e.params.missingProperty === "amount" ||
                    e.params.missingProperty === "currency"),
              ),
            ).toBe(true);
          },
        ),
        { numRuns: 50 },
      );
    });

    // -----------------------------------------------------------------------
    // Property 1b: budget_limit with invalid currency pattern rejected
    // Validates: Requirements 1.2, 2.2
    // -----------------------------------------------------------------------
    it("Property 1b: budget_limit with non-ISO-4217 currency rejected (pattern ^[A-Z]{3}$)", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Lowercase 3-letter codes
            fc.stringOf(fc.constantFrom("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"), { minLength: 3, maxLength: 3 }),
            // Full words / long strings
            fc.constantFrom("usd", "US Dollars", "euro", "Yen", "dollars", "gbp"),
            // Mixed case
            fc.constantFrom("Usd", "eUr", "gBp"),
            // Too short / too long
            fc.constantFrom("US", "A", "USDX", "ABCD"),
            // Numbers
            fc.constantFrom("123", "1AB"),
          ),
          (invalidCurrency) => {
            const doc = buildMinimalBlueprint({
              feasibility: {
                budget_limit: {
                  amount: 1000,
                  currency: invalidCurrency,
                  time_period: "monthly",
                },
              },
            });
            const result = validate(doc);

            // Expected: schema rejects because currency doesn't match ^[A-Z]{3}$
            expect(result.valid).toBe(false);
            expect(
              result.errors.some(
                (e) => e.keyword === "pattern" && e.schemaPath.includes("currency"),
              ),
            ).toBe(true);
          },
        ),
        { numRuns: 50 },
      );
    });

    // -----------------------------------------------------------------------
    // Property 1c: budget_cap renamed to top_up_config
    // Validates: Requirements 1.3, 2.3
    // -----------------------------------------------------------------------
    it("Property 1c: schema uses top_up_config (not budget_cap) in feasibility", () => {
      const feasibilityProps = Object.keys(schema.properties.feasibility.properties);

      // budget_cap should NOT exist
      expect(feasibilityProps).not.toContain("budget_cap");

      // top_up_config SHOULD exist
      expect(feasibilityProps).toContain("top_up_config");
    });

    // -----------------------------------------------------------------------
    // Property 1d: financial_risk_limit exists in risk_profile
    // Validates: Requirements 1.8, 2.8
    // -----------------------------------------------------------------------
    it("Property 1d: risk_profile contains financial_risk_limit with amount (number) and currency (string, pattern)", () => {
      const riskProps = Object.keys(schema.properties.risk_profile.properties);

      // financial_risk_limit SHOULD exist
      expect(riskProps).toContain("financial_risk_limit");

      // Verify structure
      const frl = schema.properties.risk_profile.properties.financial_risk_limit;
      expect(frl).toBeDefined();
      expect(frl.properties.amount.type).toBe("number");
      expect(frl.properties.currency.type).toBe("string");
      expect(frl.properties.currency.pattern).toBe("^[A-Z]{3}$");
    });
  });

  // =========================================================================
  // Fault Condition — Prose
  // =========================================================================
  describe("Fault Condition — Prose", () => {
    // -----------------------------------------------------------------------
    // Issue 4: Appendix C contains timeline free-form string design decision
    // Validates: Requirements 1.4, 2.4
    // -----------------------------------------------------------------------
    it("Appendix C documents timeline as intentionally free-form string", () => {
      // Extract Appendix C content
      const appendixCMatch = prose.match(
        /## Appendix C\. Design Decisions[\s\S]*?(?=\n## [A-Z]|\n---\s*$|$)/,
      );
      expect(appendixCMatch).not.toBeNull();
      const appendixC = appendixCMatch[0];

      // Should contain a design decision about timeline being free-form
      expect(appendixC.toLowerCase()).toContain("timeline");
      expect(appendixC.toLowerCase()).toMatch(/free[- ]form/);
    });

    // -----------------------------------------------------------------------
    // Issue 5: Section 13.4 says "MUST warn" for unresolvable approvers
    // Validates: Requirements 1.5, 2.5
    // -----------------------------------------------------------------------
    it('Section 12.4 uses "MUST warn" (not "MAY warn") for unresolvable approver references', () => {
      // Find Section 12.4 content (Invariant 3: Zero-Trust Persona Exclusion)
      const section124Match = prose.match(
        /### 12\.4[\s\S]*?(?=\n### \d|\n## [A-Z]|\n---)/,
      );
      expect(section124Match).not.toBeNull();
      const section124 = section124Match[0];

      // Should contain "MUST warn" not "MAY warn"
      expect(section124).toContain("MUST warn");
      expect(section124).not.toMatch(/MAY warn/);
    });

    // -----------------------------------------------------------------------
    // Issue 6: Appendix C contains tone_and_voice conditional by-design entry
    // Validates: Requirements 1.6, 2.6
    // -----------------------------------------------------------------------
    it("Appendix C documents tone_and_voice conditional absence as by-design", () => {
      const appendixCMatch = prose.match(
        /## Appendix C\. Design Decisions[\s\S]*?(?=\n## [A-Z]|\n---\s*$|$)/,
      );
      expect(appendixCMatch).not.toBeNull();
      const appendixC = appendixCMatch[0];

      // Should contain a design decision about tone_and_voice
      expect(appendixC.toLowerCase()).toContain("tone_and_voice");
    });

    // -----------------------------------------------------------------------
    // Issue 7: Section 7.2.7 references Section 11.7 instead of stale inline list
    // Validates: Requirements 1.7, 2.7
    // -----------------------------------------------------------------------
    it("Section 13.2.7 references Section 11.7 for additionalProperties: false objects", () => {
      // Find Section 13.2.7 Parser Exploits content
      const section1327Match = prose.match(
        /#{1,4}\s*13\.2\.7\.?\s*Parser Exploits[\s\S]*?(?=\n#{1,4}\s*13\.2\.\d|\n#{1,3}\s|\n---)/,
      );
      expect(section1327Match).not.toBeNull();
      const section1327 = section1327Match[0];

      // Should reference Section 11.7
      expect(section1327).toMatch(/Section 11\.7/);
    });

    // -----------------------------------------------------------------------
    // Issue 9: warrant_version Validator guidance exists
    // Validates: Requirements 1.9, 2.9
    // -----------------------------------------------------------------------
    it('prose contains warrant_version Validator guidance ("Validators SHOULD reject")', () => {
      // The prose should contain guidance about rejecting non-published warrant_version values
      expect(prose).toMatch(/Validators SHOULD reject.*warrant_version/s);
    });

    // -----------------------------------------------------------------------
    // Issue 10: Version lineage note exists
    // Validates: Requirements 1.10, 2.10
    // -----------------------------------------------------------------------
    it('prose contains version lineage note ("v0.9.16 was an internal working draft")', () => {
      expect(prose).toContain("v0.9.16");
      // The IETF table wraps "internal working draft" across two lines with
      // pipe/whitespace separators, so we match with flexible gap.
      expect(prose.toLowerCase()).toMatch(/internal[\s|]*working[\s|]*draft/);
    });

    // -----------------------------------------------------------------------
    // Issue 11: Section 7.5 Privacy Considerations exists
    // Validates: Requirements 1.11, 2.11
    // -----------------------------------------------------------------------
    it("Section 14 Privacy Considerations exists", () => {
      // Should have a section header for 14. Privacy Considerations
      expect(prose).toMatch(/##\s*14\.\s+Privacy Considerations/);
    });
  });
});

// ===========================================================================
// Preservation — Previously Valid Documents Unchanged
// ===========================================================================
describe("Preservation — Previously Valid Documents Unchanged", () => {
  // -------------------------------------------------------------------------
  // Property 2a: budget_limit with valid amount, currency, time_period
  // validates at all conformance levels
  // **Validates: Requirements 3.1, 3.2**
  // -------------------------------------------------------------------------
  it("Property 2a: budget_limit with valid ISO 4217 currency validates at all conformance levels", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("USD", "EUR", "GBP", "JPY", "CHF"),
        fc.constantFrom("L1", "L2", "L3", "L4"),
        fc.double({ min: 0.01, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        (currency, level, amount) => {
          const overrides = {
            conformance_level: level,
            feasibility: {
              budget_limit: { amount, currency, time_period: "monthly" },
            },
          };

          // Add level-specific required fields
          if (level === "L2") {
            overrides.manifest = { status: "active" };
          }
          if (level === "L3" || level === "L4") {
            overrides.manifest = {
              status: "active",
              signature: {
                signed_by: "did:example:signer",
                hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
                algorithm: "EdDSA",
              },
              discovery_uri: "https://example.com/discovery",
            };
            overrides.compliance_frameworks = {
              frameworks: [{ name: "EU AI Act", version: "2024" }],
            };
            overrides.risk_profile = {
              alert_endpoint: "https://example.com/alerts",
              alert_format: "webhook",
            };
          }
          if (level === "L4") {
            overrides.manifest = {
              ...overrides.manifest,
              ledger_anchor: {
                network: "eip155:1",
                anchor_hash: "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
              },
            };
          }

          const doc = buildMinimalBlueprint(overrides);
          const result = validate(doc);
          expect(result.valid).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2b: top_up_protocol inside top_up_config validates correctly
  // (schema now uses top_up_config — renamed from budget_cap)
  // **Validates: Requirements 3.3**
  // -------------------------------------------------------------------------
  it("Property 2b: top_up_protocol inside top_up_config validates with required fields and optional vendor extensions", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100_000, noNaN: true, noDefaultInfinity: true }),
        fc.boolean(),
        fc.boolean(),
        (maxAmount, approvalRequired, includeVendorExt) => {
          const topUpProtocol = {
            protocol_uri: "https://example.com/topup",
            max_top_up_amount: maxAmount,
            approval_required: approvalRequired,
          };

          if (includeVendorExt) {
            topUpProtocol["x-acme-topup"] = "vendor-value";
          }

          const doc = buildMinimalBlueprint({
            feasibility: {
              top_up_config: {
                top_up_protocol: topUpProtocol,
              },
            },
          });
          const result = validate(doc);
          expect(result.valid).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2c: Conformance level conditional validation L1–L4 continues
  // without regression
  // **Validates: Requirements 3.9**
  // -------------------------------------------------------------------------
  it("Property 2c: conformance level conditional validation L1–L4 continues without regression", () => {
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

    fc.assert(
      fc.property(
        fc.constantFrom("L1", "L2", "L3", "L4"),
        (level) => {
          const doc = buildValidForLevel(level);
          const result = validate(doc);
          expect(result.valid).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2d: Vendor extensions on additionalProperties: false objects
  // accepted; unknown properties rejected
  // **Validates: Requirements 3.10**
  // -------------------------------------------------------------------------
  it("Property 2d: vendor extensions matching ^x-[a-z]+- accepted, unknown properties rejected on additionalProperties: false objects", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "manifest",
          "integration_map.rate_limits",
          "feasibility.top_up_config.top_up_protocol",
        ),
        fc.constantFrom("x-acme-ext", "x-vendor-data", "x-test-field"),
        (objectPath, vendorExtKey) => {
          // Test 1: Vendor extension is accepted
          if (objectPath === "manifest") {
            const doc = buildMinimalBlueprint();
            doc.manifest[vendorExtKey] = "vendor-value";
            const result = validate(doc);
            expect(result.valid).toBe(true);
          } else if (objectPath === "integration_map.rate_limits") {
            const doc = buildMinimalBlueprint({
              integration_map: {
                rate_limits: {
                  requests: 100,
                  window_seconds: 60,
                  [vendorExtKey]: "vendor-value",
                },
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(true);
          } else if (objectPath === "feasibility.top_up_config.top_up_protocol") {
            const doc = buildMinimalBlueprint({
              feasibility: {
                top_up_config: {
                  top_up_protocol: {
                    protocol_uri: "https://example.com/topup",
                    max_top_up_amount: 1000,
                    approval_required: true,
                    [vendorExtKey]: "vendor-value",
                  },
                },
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(true);
          }

          // Test 2: Unknown property is rejected
          const unknownProp = "unknown_field";
          if (objectPath === "manifest") {
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
          } else if (objectPath === "integration_map.rate_limits") {
            const doc = buildMinimalBlueprint({
              integration_map: {
                rate_limits: {
                  requests: 100,
                  window_seconds: 60,
                  [unknownProp]: "should-be-rejected",
                },
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(false);
          } else if (objectPath === "feasibility.top_up_config.top_up_protocol") {
            const doc = buildMinimalBlueprint({
              feasibility: {
                top_up_config: {
                  top_up_protocol: {
                    protocol_uri: "https://example.com/topup",
                    max_top_up_amount: 1000,
                    approval_required: true,
                    [unknownProp]: "should-be-rejected",
                  },
                },
              },
            });
            const result = validate(doc);
            expect(result.valid).toBe(false);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2e: risk_profile with hitl_triggers and on_failure validates
  // unchanged after financial_risk_limit addition
  // **Validates: Requirements 3.5**
  // -------------------------------------------------------------------------
  it("Property 2e: risk_profile with hitl_triggers and on_failure validates correctly", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("lt", "gt", "eq", "lte", "gte"),
        fc.constantFrom("pause_and_verify", "escalate", "halt", "request_reauthentication", "notify_only"),
        fc.constantFrom("escalate", "halt", "retry"),
        fc.double({ min: 0.01, max: 100, noNaN: true, noDefaultInfinity: true }),
        (operator, action, onFailureDefault, threshold) => {
          const doc = buildMinimalBlueprint({
            risk_profile: {
              hitl_triggers: [
                {
                  metric: "error_rate",
                  threshold,
                  operator,
                  action,
                },
              ],
              on_failure: {
                default: onFailureDefault,
                ...(onFailureDefault === "escalate" ? { escalation_path: ["did:example:escalation"] } : {}),
                ...(onFailureDefault === "retry" ? { retry_policy: { max_retries: 3, backoff: "exponential" } } : {}),
              },
            },
          });
          const result = validate(doc);
          expect(result.valid).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2f: warrant_version "0.10.0" continues to pass schema validation
  // **Validates: Requirements 3.7**
  // -------------------------------------------------------------------------
  it('Property 2f: warrant_version "0.10.0" continues to pass schema validation', () => {
    const doc = buildMinimalBlueprint({ warrant_version: "0.10.0" });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Property 2g: feasibility.timeline as free-form string continues to be
  // accepted
  // **Validates: Requirements 3.4**
  // -------------------------------------------------------------------------
  it("Property 2g: feasibility.timeline as free-form string continues to be accepted", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("Q3 2025", "End of fiscal year", "2025-12-31", "ASAP", "6 months from kickoff"),
        (timeline) => {
          const doc = buildMinimalBlueprint({
            feasibility: { timeline },
          });
          const result = validate(doc);
          expect(result.valid).toBe(true);
        },
      ),
      { numRuns: 50 },
    );
  });
});

