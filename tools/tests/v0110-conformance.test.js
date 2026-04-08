import { describe, it, expect } from 'vitest';
import { validate, buildMinimalBlueprint } from './helpers.js';

/**
 * Unit tests for v0.11.0 conformance level validation.
 *
 * Validates: Requirements 1.3, 10.1, 10.2, 10.3, 10.4, 10.5
 */

// ---------------------------------------------------------------------------
// Helpers for building L3/L4 blueprints
// ---------------------------------------------------------------------------

const L3_SIGNATURE = {
  signed_by: 'did:example:signer',
  hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  algorithm: 'EdDSA',
};

const L4_LEDGER_ANCHOR = {
  network: 'eip155:1',
  anchor_hash: 'sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
};

function buildL3Blueprint(overrides) {
  return buildMinimalBlueprint({
    conformance_level: 'L3',
    manifest: {
      status: 'active',
      signature: L3_SIGNATURE,
      discovery_uri: 'https://example.com/blueprints/bp-001',
    },
    risk_profile: {
      alert_endpoint: 'https://alerts.example.com/webhook',
      alert_format: 'webhook',
    },
    ...overrides,
  });
}

function buildL4Blueprint(overrides) {
  return buildMinimalBlueprint({
    conformance_level: 'L4',
    manifest: {
      status: 'active',
      signature: L3_SIGNATURE,
      ledger_anchor: L4_LEDGER_ANCHOR,
      discovery_uri: 'https://example.com/blueprints/bp-001',
    },
    risk_profile: {
      alert_endpoint: 'https://alerts.example.com/webhook',
      alert_format: 'webhook',
    },
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// 11.1 — L3/L4 new requirements
// ---------------------------------------------------------------------------

describe('v0.11.0 conformance level validation — L3/L4 new requirements', () => {
  // --- L3 valid ---

  it('L3 blueprint with alert_endpoint + alert_format + discovery_uri passes', () => {
    const doc = buildL3Blueprint();
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- L3 missing new required properties ---

  it('L3 blueprint missing alert_endpoint fails validation', () => {
    const doc = buildL3Blueprint();
    delete doc.risk_profile.alert_endpoint;
    delete doc.risk_profile.alert_format; // remove both to avoid conditional dep error
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('alert_endpoint'))).toBe(true);
  });

  it('L3 blueprint missing alert_format fails validation', () => {
    const doc = buildL3Blueprint();
    delete doc.risk_profile.alert_format;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('alert_format'))).toBe(true);
  });

  it('L3 blueprint missing discovery_uri fails validation', () => {
    const doc = buildL3Blueprint();
    delete doc.manifest.discovery_uri;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('discovery_uri'))).toBe(true);
  });

  // --- L4 inherits L3 requirements ---

  it('L4 blueprint with all L3 + L4 requirements passes', () => {
    const doc = buildL4Blueprint();
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('L4 blueprint missing alert_endpoint fails validation', () => {
    const doc = buildL4Blueprint();
    delete doc.risk_profile.alert_endpoint;
    delete doc.risk_profile.alert_format;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('alert_endpoint'))).toBe(true);
  });

  it('L4 blueprint missing alert_format fails validation', () => {
    const doc = buildL4Blueprint();
    delete doc.risk_profile.alert_format;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('alert_format'))).toBe(true);
  });

  it('L4 blueprint missing discovery_uri fails validation', () => {
    const doc = buildL4Blueprint();
    delete doc.manifest.discovery_uri;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('discovery_uri'))).toBe(true);
  });

  // --- L1 and L2 do NOT require new properties ---

  it('L1 blueprint passes without alert_endpoint, alert_format, discovery_uri', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('L2 blueprint passes without alert_endpoint, alert_format, discovery_uri', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'active' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- drift_detection and circuit_breaker NOT required at any level ---

  it('drift_detection is NOT required at L3', () => {
    const doc = buildL3Blueprint();
    // No drift_detection — should still pass
    expect(doc.risk_profile.drift_detection).toBeUndefined();
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('circuit_breaker is NOT required at L3', () => {
    const doc = buildL3Blueprint();
    expect(doc.failure_modes.circuit_breaker).toBeUndefined();
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('drift_detection is NOT required at L4', () => {
    const doc = buildL4Blueprint();
    expect(doc.risk_profile.drift_detection).toBeUndefined();
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('circuit_breaker is NOT required at L4', () => {
    const doc = buildL4Blueprint();
    expect(doc.failure_modes.circuit_breaker).toBeUndefined();
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- Existing v0.10.0 conformance requirements still enforced ---

  it('L3 still requires manifest.signature (v0.10.0 requirement)', () => {
    const doc = buildL3Blueprint();
    delete doc.manifest.signature;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('signature'))).toBe(true);
  });

  it('L4 still requires manifest.ledger_anchor (v0.10.0 requirement)', () => {
    const doc = buildL4Blueprint();
    delete doc.manifest.ledger_anchor;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('ledger_anchor'))).toBe(true);
  });
});


// ---------------------------------------------------------------------------
// 11.2 — alert_endpoint → alert_format conditional dependency
// ---------------------------------------------------------------------------

describe('v0.11.0 alert_endpoint → alert_format conditional dependency', () => {
  it('blueprint with alert_endpoint but no alert_format fails validation', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_endpoint: 'https://alerts.example.com/webhook',
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message?.includes('alert_format'))).toBe(true);
  });

  it('blueprint with both alert_endpoint and alert_format passes', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_endpoint: 'https://alerts.example.com/webhook',
        alert_format: 'webhook',
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('blueprint with alert_format but no alert_endpoint passes (no reverse dependency)', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_format: 'syslog',
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('blueprint with neither alert_endpoint nor alert_format passes', () => {
    const doc = buildMinimalBlueprint();
    expect(doc.risk_profile.alert_endpoint).toBeUndefined();
    expect(doc.risk_profile.alert_format).toBeUndefined();
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });
});
