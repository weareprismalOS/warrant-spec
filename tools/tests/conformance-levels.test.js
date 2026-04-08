import { describe, it, expect } from 'vitest';
import { validate, buildMinimalBlueprint } from './helpers.js';

describe('Conformance level validation', () => {
  // 1. Minimal L1 document validates
  it('minimal L1 document validates', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // 2. L1 document missing a required Pillar field fails
  it('L1 document missing a required Pillar field fails', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    delete doc.objective.domain;
    delete doc.objective.autonomy_level;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 3. Full L2 document validates
  it('full L2 document validates', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'active' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // 4. L2 document with non-active status fails
  it('L2 document with non-active status fails', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'draft' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 5. L3 document with signature validates
  it('L3 document with signature validates', () => {
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

  // 6. L3 document without signature fails
  it('L3 document without signature fails', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L3',
      manifest: { status: 'active' },
    });
    // Ensure no signature is present
    delete doc.manifest.signature;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 7. L3 document without compliance frameworks fails
  it('L3 document without compliance frameworks fails', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L3',
      manifest: {
        status: 'active',
        signature: {
          signed_by: 'did:example:signer',
          hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
          algorithm: 'EdDSA',
        },
      },
      compliance_frameworks: {
        frameworks: [],
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 8. L4 document with signature + ledger anchor validates
  it('L4 document with signature + ledger anchor validates', () => {
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

  // 9. L4 document without ledger anchor fails
  it('L4 document without ledger anchor fails', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L4',
      manifest: {
        status: 'active',
        signature: {
          signed_by: 'did:example:signer',
          hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
          algorithm: 'EdDSA',
        },
      },
    });
    // Ensure no ledger_anchor is present
    delete doc.manifest.ledger_anchor;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 10. Document without conformance_level validates
  it('document without conformance_level validates', () => {
    const doc = buildMinimalBlueprint();
    delete doc.conformance_level;
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // --- v0.9.16: L1 requirement enforcement ---

  // 11. L1 with empty scope_boundaries fails
  it('L1 with empty scope_boundaries array fails', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    doc.boundaries.scope_boundaries = [];
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 12. L1 with empty hitl_triggers fails
  it('L1 with empty hitl_triggers array fails', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    doc.risk_profile.hitl_triggers = [];
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 13. L1 without risk_profile.on_failure fails
  it('L1 without risk_profile.on_failure fails', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    delete doc.risk_profile.on_failure;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 14. L1 without objective.domain fails
  it('L1 without objective.domain fails', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    delete doc.objective.domain;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 15. L1 without objective.autonomy_level fails
  it('L1 without objective.autonomy_level fails', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    delete doc.objective.autonomy_level;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 16. L1 without compliance_frameworks.frameworks fails
  it('L1 without compliance_frameworks.frameworks fails', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    delete doc.compliance_frameworks.frameworks;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // --- v0.9.16: L2 status acceptance ---

  // 17. L2 with manifest.status="deprecated" passes
  it('L2 with manifest.status="deprecated" passes', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'deprecated' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // 18. L2 with manifest.status="archived" passes
  it('L2 with manifest.status="archived" passes', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'archived' },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });
});
