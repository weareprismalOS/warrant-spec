import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load raw schema for structural inspection
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '../WARRANT Intent Blueprint.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

// --- Requirement 10.1 ---
describe('Schema $id and version', () => {
  it('$id is https://warrant.dev/schema/v0.11.0/warrant.schema.json', () => {
    expect(schema.$id).toBe('https://warrant.dev/schema/v0.11.0/warrant.schema.json');
  });
});

// --- Requirements 1.1, 1.2 ---
describe('13 root-level Pillar property names', () => {
  const PILLAR_NAMES = [
    'manifest',
    'objective',
    'ux_logic',
    'feasibility',
    'stakeholders',
    'compliance_frameworks',
    'risk_profile',
    'data_model',
    'boundaries',
    'integration_map',
    'success_metrics',
    'failure_modes',
    'personas',
  ];

  it.each(PILLAR_NAMES)('defines root-level property "%s"', (name) => {
    expect(schema.properties[name]).toBeDefined();
  });

  it('has exactly 13 Pillar properties (plus non-Pillar root properties)', () => {
    for (const name of PILLAR_NAMES) {
      expect(schema.properties).toHaveProperty(name);
    }
  });
});

// --- Requirement 1.3 ---
describe('Eliminated grouping objects absent', () => {
  it.each(['intent', 'permissions', 'compliance'])(
    '"%s" is NOT in schema.properties',
    (name) => {
      expect(schema.properties[name]).toBeUndefined();
    }
  );
});

// --- Requirement 7.3 ---
describe('Boundaries narrowed to Pillar 09 only', () => {
  it('boundaries only contains prohibited_actions, scope_boundaries, kill_switch', () => {
    const boundaryProps = Object.keys(schema.properties.boundaries.properties);
    expect(boundaryProps.sort()).toEqual(
      ['kill_switch', 'prohibited_actions', 'scope_boundaries'].sort()
    );
  });

  it('boundaries does not contain hitl_triggers', () => {
    expect(schema.properties.boundaries.properties.hitl_triggers).toBeUndefined();
  });

  it('boundaries does not contain failure_modes', () => {
    expect(schema.properties.boundaries.properties.failure_modes).toBeUndefined();
  });
});

// --- Requirement 3.6 ---
describe('manifest contains all former metadata sub-properties', () => {
  const MANIFEST_PROPS = [
    'blueprint_id',
    'version',
    'owner',
    'status',
    'created_at',
    'extends',
    'lifecycle_management',
    'ledger_anchor',
    'signature',
  ];

  it.each(MANIFEST_PROPS)('manifest has property "%s"', (prop) => {
    expect(schema.properties.manifest.properties[prop]).toBeDefined();
  });
});

// --- Requirement 3.6 (Gap 2) ---
describe('manifest.version pattern and manifest.created_at format', () => {
  it('manifest.version has pattern "^\\d+\\.\\d+\\.\\d+$"', () => {
    const versionProp = schema.properties.manifest.properties.version;
    expect(versionProp.pattern).toBe('^\\d+\\.\\d+\\.\\d+$');
  });

  it('manifest.created_at has format "date-time"', () => {
    const createdAtProp = schema.properties.manifest.properties.created_at;
    expect(createdAtProp.format).toBe('date-time');
  });
});

// --- Requirement 3.7 (Gap 1) ---
describe('success_metrics required array and properties', () => {
  it('success_metrics has required: ["primary_kpi", "baseline", "measurement_frequency", "evidence_pack_config"]', () => {
    expect(schema.properties.success_metrics.required).toEqual(
      expect.arrayContaining([
        'primary_kpi',
        'baseline',
        'measurement_frequency',
        'evidence_pack_config',
      ])
    );
    expect(schema.properties.success_metrics.required).toHaveLength(4);
  });

  it('success_metrics includes secondary_kpis property', () => {
    expect(schema.properties.success_metrics.properties.secondary_kpis).toBeDefined();
  });

  it('success_metrics includes degradation_threshold property', () => {
    expect(schema.properties.success_metrics.properties.degradation_threshold).toBeDefined();
  });
});

// --- Requirement 3.8 (Gap 5) ---
describe('personas minItems and item-level required', () => {
  it('personas does NOT have minItems at base level (L2+ enforces via conditional)', () => {
    expect(schema.properties.personas.minItems).toBeUndefined();
  });

  it('personas items have required: ["id", "trust_level"]', () => {
    expect(schema.properties.personas.items.required).toEqual(
      expect.arrayContaining(['id', 'trust_level'])
    );
    expect(schema.properties.personas.items.required).toHaveLength(2);
  });
});

// --- Requirements 9.2, 9.5 (Gap 3) ---
describe('manifest additionalProperties and patternProperties for vendor extensions', () => {
  it('manifest has additionalProperties: false', () => {
    expect(schema.properties.manifest.additionalProperties).toBe(false);
  });

  it('manifest has patternProperties for vendor extensions (^x-[a-z]+-)', () => {
    expect(schema.properties.manifest.patternProperties).toBeDefined();
    expect(schema.properties.manifest.patternProperties['^x-[a-z]+-']).toBeDefined();
  });
});
