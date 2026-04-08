import { describe, it, expect } from 'vitest';
import { validate, buildMinimalBlueprint } from './helpers.js';

describe('Lifecycle status values', () => {
  /**
   * For status tests, we remove conformance_level from the baseline so that
   * conditional validation (e.g. L2 requiring "active") doesn't interfere.
   */
  function buildStatusDoc(status) {
    const doc = buildMinimalBlueprint({ manifest: { status } });
    delete doc.conformance_level;
    return doc;
  }

  // 1. Document with status "draft" validates
  it('accepts status "draft"', () => {
    const result = validate(buildStatusDoc('draft'));
    expect(result.valid).toBe(true);
  });

  // 2. Document with status "active" validates
  it('accepts status "active"', () => {
    const result = validate(buildStatusDoc('active'));
    expect(result.valid).toBe(true);
  });

  // 3. Document with status "deprecated" validates
  it('accepts status "deprecated"', () => {
    const result = validate(buildStatusDoc('deprecated'));
    expect(result.valid).toBe(true);
  });

  // 4. Document with status "archived" validates
  it('accepts status "archived"', () => {
    const result = validate(buildStatusDoc('archived'));
    expect(result.valid).toBe(true);
  });

  // 5. Document with invalid status fails
  it('rejects invalid status "locked"', () => {
    const result = validate(buildStatusDoc('locked'));
    expect(result.valid).toBe(false);
  });
});

describe('Kill switch types', () => {
  // 6. Kill switch type "api_endpoint" with uri validates
  it('accepts kill switch type "api_endpoint" with uri', () => {
    const doc = buildMinimalBlueprint({
      boundaries: {
        kill_switch: {
          type: 'api_endpoint',
          uri: 'https://example.com/kill',
        },
      },
    });
    delete doc.conformance_level;
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // 7. Kill switch type "smart_contract" with contract_address validates
  it('accepts kill switch type "smart_contract" with contract_address', () => {
    const doc = buildMinimalBlueprint({
      boundaries: {
        kill_switch: {
          type: 'smart_contract',
          contract_address: '0x1234567890abcdef',
        },
      },
    });
    delete doc.conformance_level;
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // 8. Kill switch type "manual" (no extra fields) validates
  it('accepts kill switch type "manual" with no extra fields', () => {
    const doc = buildMinimalBlueprint({
      boundaries: {
        kill_switch: {
          type: 'manual',
        },
      },
    });
    delete doc.conformance_level;
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // 9. Kill switch type "api_endpoint" without uri fails
  it('rejects kill switch type "api_endpoint" without uri', () => {
    const doc = buildMinimalBlueprint({
      boundaries: {
        kill_switch: {
          type: 'api_endpoint',
        },
      },
    });
    delete doc.conformance_level;
    // The baseline kill_switch has a uri — remove it to test the conditional requirement
    delete doc.boundaries.kill_switch.uri;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 10. Kill switch type "smart_contract" without contract_address fails
  it('rejects kill switch type "smart_contract" without contract_address', () => {
    const doc = buildMinimalBlueprint({
      boundaries: {
        kill_switch: {
          type: 'smart_contract',
        },
      },
    });
    delete doc.conformance_level;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 11. L1 document without kill_switch in boundaries passes (kill_switch is L2+ only)
  it('accepts L1 document without kill_switch in boundaries', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    delete doc.boundaries.kill_switch;
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  // 12. L2 document without kill_switch in boundaries fails
  it('rejects L2 document without kill_switch in boundaries', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'active' },
    });
    delete doc.boundaries.kill_switch;
    const result = validate(doc);
    expect(result.valid).toBe(false);
  });

  // 13. Document without conformance_level and without kill_switch passes
  it('accepts unleveled document without kill_switch in boundaries', () => {
    const doc = buildMinimalBlueprint();
    delete doc.conformance_level;
    delete doc.boundaries.kill_switch;
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });
});
