import { describe, it, expect } from 'vitest';
import { validate, buildMinimalBlueprint } from './helpers.js';

/**
 * Unit tests for conformance level validation at v0.9.16 root-level paths.
 *
 * Validates: Requirements 4.2, 4.3, 4.4, 4.5
 */
describe('v0.9.16 conformance level validation', () => {
  // --- Requirement 4.2: L1 core Pillar population ---

  it('valid L1 document with core Pillar population passes validation', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- Requirement 4.3: L2 all Pillar population + manifest.status + kill_switch ---

  it('valid L2 document with all Pillar population + manifest.status="active" + kill_switch passes validation', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'active' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- Requirement 4.3 (Gap 4): L2 accepts "deprecated" and "archived" statuses ---

  it('L2 document with manifest.status="deprecated" passes validation (Gap 4)', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'deprecated' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('L2 document with manifest.status="archived" passes validation (Gap 4)', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'archived' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- Requirement 4.3 (Gap 4): L2 rejects "draft" status ---

  it('L2 document with manifest.status="draft" fails L2 validation (Gap 4)', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'draft' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // --- Requirement 4.4: L3 = L2 + manifest.signature + frameworks minItems:1 ---

  it('valid L3 document with L2 + manifest.signature + frameworks minItems:1 passes validation', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L3',
      manifest: {
        status: 'active',
        signature: {
          signed_by: 'did:example:signer',
          hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
          algorithm: 'EdDSA',
        },
        discovery_uri: 'https://example.com/discovery',
      },
      compliance_frameworks: {
        frameworks: [{ name: 'EU AI Act', version: '2024' }],
      },
      risk_profile: {
        alert_endpoint: 'https://example.com/alerts',
        alert_format: 'webhook',
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- Requirement 4.5: L4 = L3 + manifest.ledger_anchor ---

  it('valid L4 document with L3 + manifest.ledger_anchor passes validation', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L4',
      manifest: {
        status: 'active',
        signature: {
          signed_by: 'did:example:signer',
          hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
          algorithm: 'EdDSA',
        },
        ledger_anchor: {
          network: 'eip155:1',
          anchor_hash: 'sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        },
        discovery_uri: 'https://example.com/discovery',
      },
      compliance_frameworks: {
        frameworks: [{ name: 'EU AI Act', version: '2024' }],
      },
      risk_profile: {
        alert_endpoint: 'https://example.com/alerts',
        alert_format: 'webhook',
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });
});
