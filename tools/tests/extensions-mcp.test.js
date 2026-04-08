import { describe, it, expect } from 'vitest';
import { validate, buildMinimalBlueprint } from './helpers.js';

// ---------------------------------------------------------------------------
// Vendor extension tests (Requirements 6.3, 10.4)
// Pattern: ^x-[a-z]+-  (at least one lowercase letter followed by a dash)
// ---------------------------------------------------------------------------

describe('Vendor extension acceptance (x-vendor-* properties)', () => {
  // Helper: build a doc without conformance_level to avoid conditional validation
  function baseDoc(overrides) {
    const doc = buildMinimalBlueprint(overrides);
    delete doc.conformance_level;
    return doc;
  }

  it('accepts a root-level vendor extension x-acme-custom', () => {
    const doc = baseDoc();
    doc['x-acme-custom'] = { foo: 'bar' };
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('accepts a manifest-level vendor extension x-acme-metadata', () => {
    const doc = baseDoc();
    doc.manifest['x-acme-metadata'] = 'extra-info';
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('accepts a rate_limits-level vendor extension x-acme-rl', () => {
    const doc = baseDoc({
      integration_map: {
        rate_limits: {
          requests: 100,
          window_seconds: 60,
          'x-acme-rl': 'custom-rate-info',
        },
      },
    });
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('accepts a capabilities_override-level vendor extension x-acme-cap', () => {
    const doc = baseDoc();
    doc.personas = [
      {
        id: 'persona-1',
        trust_level: 'standard',
        capabilities_override: {
          deny_all_writes: false,
          restrict_tool_access: [],
          'x-acme-cap': true,
        },
      },
    ];
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });

  it('rejects an unknown property at root level (not matching x-vendor-* pattern)', () => {
    const doc = baseDoc();
    doc['unknown_prop'] = true;
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.keyword === 'additionalProperties')).toBe(true);
  });

  it('rejects an unknown property at manifest level', () => {
    const doc = baseDoc();
    doc.manifest['not_a_vendor_ext'] = 'nope';
    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.keyword === 'additionalProperties')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// MCP URI tests (Requirement 13.3)
// AJV's URI format validation follows RFC 3986. mcp:// is a valid URI scheme.
// ---------------------------------------------------------------------------

describe('MCP URI acceptance (mcp:// in tool arrays)', () => {
  function baseDoc(overrides) {
    const doc = buildMinimalBlueprint(overrides);
    delete doc.conformance_level;
    return doc;
  }

  it('accepts mcp://tool-server/tool-name in tool_access', () => {
    const doc = baseDoc({
      integration_map: {
        tool_access: ['mcp://tool-server/tool-name'],
      },
    });
    delete doc.conformance_level;
    const result = validate(doc);

    // AJV's URI format follows RFC 3986 — mcp:// is a valid scheme.
    // If this test fails, AJV does not accept mcp:// as a valid URI.
    if (!result.valid) {
      const formatError = result.errors.find(
        (e) => e.keyword === 'format' && e.params?.format === 'uri'
      );
      if (formatError) {
        // Document the behavior: AJV rejects mcp:// as a URI
        console.warn(
          'NOTE: AJV rejects mcp:// as a valid URI. This is documented behavior.'
        );
      }
    }
    expect(result.valid).toBe(true);
  });

  it('accepts mcp://tool-server/forbidden-tool in tool_forbidden', () => {
    const doc = baseDoc({
      integration_map: {
        tool_forbidden: ['mcp://tool-server/forbidden-tool'],
      },
    });
    delete doc.conformance_level;
    const result = validate(doc);
    expect(result.valid).toBe(true);
  });
});
