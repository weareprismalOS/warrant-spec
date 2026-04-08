import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate, buildMinimalBlueprint } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
  readFileSync(resolve(__dirname, '../WARRANT Intent Blueprint.json'), 'utf-8')
);

// =============================================================================
// Task 12.1 — v0.11.0 Backward Compatibility Tests
// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 11.4, 11.10, 11.12
// =============================================================================

describe('v0.11.0 backward compat: v0.10.0-style blueprint validates', () => {
  it('v0.10.0-style blueprint with plain URI strings in authorised_integrations validates', () => {
    // A v0.10.0-style blueprint: plain URI strings, no new v0.11.0 properties,
    // but with runtime_observability: {} added (sole required addition)
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          'https://example.com/api-a',
          'https://example.com/api-b',
        ],
      },
    });
    const { valid, errors } = validate(doc);
    expect(valid).toBe(true);
  });
});

describe('v0.11.0 backward compat: schema $id', () => {
  it('$id is https://warrant.dev/schema/v0.11.0/warrant.schema.json', () => {
    expect(schema.$id).toBe('https://warrant.dev/schema/v0.11.0/warrant.schema.json');
  });
});

describe('v0.11.0 backward compat: no v0.10.0 properties removed or renamed', () => {
  it('manifest retains blueprint_id, version, owner, status, created_at', () => {
    const manifestProps = schema.properties.manifest.properties;
    expect(manifestProps).toHaveProperty('blueprint_id');
    expect(manifestProps).toHaveProperty('version');
    expect(manifestProps).toHaveProperty('owner');
    expect(manifestProps).toHaveProperty('status');
    expect(manifestProps).toHaveProperty('created_at');
  });

  it('objective retains primary_objective, domain, autonomy_level', () => {
    const objProps = schema.properties.objective.properties;
    expect(objProps).toHaveProperty('primary_objective');
    expect(objProps).toHaveProperty('domain');
    expect(objProps).toHaveProperty('autonomy_level');
  });

  it('risk_profile retains hitl_triggers and on_failure', () => {
    const rpProps = schema.properties.risk_profile.properties;
    expect(rpProps).toHaveProperty('hitl_triggers');
    expect(rpProps).toHaveProperty('on_failure');
  });

  it('boundaries retains kill_switch and scope_boundaries', () => {
    const bProps = schema.properties.boundaries.properties;
    expect(bProps).toHaveProperty('kill_switch');
    expect(bProps).toHaveProperty('scope_boundaries');
  });

  it('integration_map retains authorised_integrations and tool_access', () => {
    const imProps = schema.properties.integration_map.properties;
    expect(imProps).toHaveProperty('authorised_integrations');
    expect(imProps).toHaveProperty('tool_access');
  });

  it('success_metrics retains primary_kpi and baseline', () => {
    const smProps = schema.properties.success_metrics.properties;
    expect(smProps).toHaveProperty('primary_kpi');
    expect(smProps).toHaveProperty('baseline');
  });

  it('failure_modes retains known_failure_modes', () => {
    const fmProps = schema.properties.failure_modes.properties;
    expect(fmProps).toHaveProperty('known_failure_modes');
  });

  it('personas retains id and trust_level in items', () => {
    const personaItemProps = schema.properties.personas.items.properties;
    expect(personaItemProps).toHaveProperty('id');
    expect(personaItemProps).toHaveProperty('trust_level');
  });
});

describe('v0.11.0 backward compat: v0.10.0 property types/formats/constraints unchanged', () => {
  it('warrant_version is still a string with semver pattern', () => {
    const wv = schema.properties.warrant_version;
    expect(wv.type).toBe('string');
    expect(wv.pattern).toBeDefined();
  });

  it('manifest.blueprint_id is still a string', () => {
    expect(schema.properties.manifest.properties.blueprint_id.type).toBe('string');
  });

  it('manifest.created_at still has format date-time', () => {
    expect(schema.properties.manifest.properties.created_at.format).toBe('date-time');
  });

  it('objective.autonomy_level still has enum constraint', () => {
    const al = schema.properties.objective.properties.autonomy_level;
    expect(al.enum).toBeDefined();
    expect(al.enum).toContain('supervised');
  });

  it('risk_profile.on_failure.default still has enum constraint', () => {
    const onFailure = schema.properties.risk_profile.properties.on_failure;
    const defaultProp = onFailure.properties.default;
    expect(defaultProp.enum).toBeDefined();
    expect(defaultProp.enum).toContain('escalate');
  });

  it('boundaries.kill_switch.type still has enum constraint', () => {
    const ks = schema.properties.boundaries.properties.kill_switch;
    const typeProp = ks.properties.type;
    expect(typeProp.enum).toBeDefined();
    expect(typeProp.enum).toContain('api_endpoint');
  });

  it('authorised_integrations items now use oneOf (string | object) — the sole type change', () => {
    const items = schema.properties.integration_map.properties.authorised_integrations.items;
    expect(items.oneOf).toBeDefined();
    expect(items.oneOf.length).toBe(2);
    // Legacy string branch still present
    const stringBranch = items.oneOf.find((b) => b.type === 'string');
    expect(stringBranch).toBeDefined();
    expect(stringBranch.format).toBe('uri');
    // Object branch present
    const objectBranch = items.oneOf.find((b) => b.type === 'object');
    expect(objectBranch).toBeDefined();
  });

  it('authorised_integrations still has uniqueItems: true', () => {
    expect(
      schema.properties.integration_map.properties.authorised_integrations.uniqueItems
    ).toBe(true);
  });
});

describe('v0.11.0 backward compat: mixed authorised_integrations array validates', () => {
  it('accepts mixed array of string + object items', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          'https://example.com/legacy-api',
          {
            uri: 'https://example.com/new-api',
            justification: 'Enriched integration for audit trail',
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts array with multiple legacy strings only', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          'https://example.com/api-1',
          'https://example.com/api-2',
          'https://example.com/api-3',
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts array with multiple enriched objects only', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          { uri: 'https://example.com/api-1', justification: 'Reason A' },
          { uri: 'https://example.com/api-2', justification: 'Reason B', protocol_version: '1.0' },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });
});

describe('v0.11.0 backward compat: additionalProperties: false objects accept new properties', () => {
  it('manifest accepts discovery_uri (additionalProperties: false)', () => {
    const doc = buildMinimalBlueprint({
      manifest: { discovery_uri: 'https://example.com/bp/001' },
    });
    const { valid, errors } = validate(doc);
    const apErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath === '/manifest'
    );
    expect(apErrors).toHaveLength(0);
    expect(valid).toBe(true);
  });

  it('manifest accepts discovery_protocol (additionalProperties: false)', () => {
    const doc = buildMinimalBlueprint({
      manifest: {
        discovery_protocol: {
          well_known_endpoint: 'https://example.com/.well-known/warrant-discovery',
        },
      },
    });
    const { valid, errors } = validate(doc);
    const apErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath === '/manifest'
    );
    expect(apErrors).toHaveLength(0);
    expect(valid).toBe(true);
  });

  it('runtime_observability accepts all sub-properties (additionalProperties: false)', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        intent_traceability: {
          reasoning_manifest_uri: 'https://example.com/reasoning',
          log_format: 'json',
        },
        heartbeat: {
          broadcast_uri: 'https://example.com/heartbeat',
          interval_seconds: 30,
        },
        guardian_alerts: [
          { metric_ref: 'kpi-1', threshold: 0.9, operator: 'lt', action: 'alert' },
        ],
      },
    });
    const { valid, errors } = validate(doc);
    const apErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath.startsWith('/runtime_observability')
    );
    expect(apErrors).toHaveLength(0);
    expect(valid).toBe(true);
  });

  it('risk_profile accepts alert_endpoint, alert_format, drift_detection, governance_workflow', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_endpoint: 'https://alerts.example.com/webhook',
        alert_format: 'webhook',
        drift_detection: { threshold: 0.5, action: 'alert' },
        governance_workflow: {
          auto_approve_policy: 'low_risk_only',
          exception_routing: [{ condition: 'high value', route_to: 'finance' }],
        },
      },
    });
    const { valid, errors } = validate(doc);
    const apErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath === '/risk_profile'
    );
    expect(apErrors).toHaveLength(0);
    expect(valid).toBe(true);
  });

  it('failure_modes accepts circuit_breaker', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 30,
          success_threshold: 3,
        },
      },
    });
    const { valid, errors } = validate(doc);
    const apErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath === '/failure_modes'
    );
    expect(apErrors).toHaveLength(0);
    expect(valid).toBe(true);
  });

  it('compliance_frameworks accepts crosswalks', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [{ name: 'EU AI Act', version: '2024' }],
        crosswalks: [
          {
            framework: 'EU AI Act',
            mappings: [{ regulation_clause: 'Art. 9', warrant_pillar: 'risk_profile' }],
          },
        ],
      },
    });
    const { valid, errors } = validate(doc);
    const apErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath === '/compliance_frameworks'
    );
    expect(apErrors).toHaveLength(0);
    expect(valid).toBe(true);
  });
});
