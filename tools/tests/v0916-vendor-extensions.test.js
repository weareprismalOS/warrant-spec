import { describe, it, expect } from "vitest";
import { validate, buildMinimalBlueprint } from "./helpers.js";

// ---------------------------------------------------------------------------
// Vendor extension tests at v0.9.16 root-level Pillar objects
// Validates: Requirements 9.1
//
// Objects with additionalProperties: false (require patternProperties for x-vendor-*):
//   - manifest
//   - integration_map.rate_limits
//   - feasibility.top_up_config.top_up_protocol
//
// Tests remove conformance_level to avoid conditional validation interference.
// ---------------------------------------------------------------------------

/**
 * Build a doc without conformance_level to avoid conditional validation.
 */
function baseDoc(overrides) {
  const doc = buildMinimalBlueprint(overrides);
  delete doc.conformance_level;
  return doc;
}

describe("Vendor extensions at v0.9.16 root-level Pillar objects", () => {
  // -----------------------------------------------------------------------
  // 1. Vendor extension at root-level object passes
  // -----------------------------------------------------------------------
  it("accepts x-vendor-* property at the root-level object", () => {
    const doc = baseDoc();
    doc["x-acme-global"] = { custom: true };
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 2. Vendor extension at manifest (additionalProperties: false) passes
  // -----------------------------------------------------------------------
  it("accepts x-vendor-* property at manifest (additionalProperties: false)", () => {
    const doc = baseDoc();
    doc.manifest["x-acme-manifest"] = "extra-manifest-info";
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 3. Vendor extension at integration_map.rate_limits (additionalProperties: false) passes
  // -----------------------------------------------------------------------
  it("accepts x-vendor-* property at integration_map.rate_limits (additionalProperties: false)", () => {
    const doc = baseDoc({
      integration_map: {
        rate_limits: {
          requests: 100,
          window_seconds: 60,
          "x-acme-ratelimit": "burst-mode",
        },
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 4. Vendor extension at feasibility.top_up_config.top_up_protocol (additionalProperties: false) passes
  // -----------------------------------------------------------------------
  it("accepts x-vendor-* property at feasibility.top_up_config.top_up_protocol (additionalProperties: false)", () => {
    const doc = baseDoc({
      feasibility: {
        top_up_config: {
          top_up_protocol: {
            protocol_uri: "https://example.com/topup",
            max_top_up_amount: 1000,
            approval_required: true,
            "x-acme-topup": { auto_notify: true },
          },
        },
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 5. Unknown (non-vendor) property at manifest is rejected
  // -----------------------------------------------------------------------
  it("rejects unknown (non-vendor) property at manifest", () => {
    const doc = baseDoc();
    doc.manifest["not_a_vendor_ext"] = "should fail";
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.keyword === "additionalProperties")
    ).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 6. Unknown (non-vendor) property at integration_map.rate_limits is rejected
  // -----------------------------------------------------------------------
  it("rejects unknown (non-vendor) property at integration_map.rate_limits", () => {
    const doc = baseDoc({
      integration_map: {
        rate_limits: {
          requests: 100,
          window_seconds: 60,
          bogus_field: "should fail",
        },
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.keyword === "additionalProperties")
    ).toBe(true);
  });
});
