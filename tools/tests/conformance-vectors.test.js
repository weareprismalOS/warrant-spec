import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validate } from './helpers.js';

// ---------------------------------------------------------------------------
// Load all vector files
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const vectorDir = resolve(__dirname, 'conformance-vectors');
const vectorFiles = readdirSync(vectorDir)
  .filter((f) => f.endsWith('.warrant.json'))
  .sort();

/** Load and parse a vector file by name (without extension). */
function loadVector(name) {
  const raw = readFileSync(resolve(vectorDir, `${name}.warrant.json`), 'utf-8');
  return JSON.parse(raw);
}

/** All 16 expected vector names. */
const EXPECTED_VECTORS = [
  'invariant-1-valid',
  'invariant-1-invalid',
  'invariant-2-valid',
  'invariant-2-invalid',
  'invariant-3-valid',
  'invariant-3-invalid',
  'invariant-4-valid',
  'invariant-4-invalid',
  'invariant-5-valid',
  'invariant-5-invalid',
  'level-L1-valid',
  'level-L1-invalid',
  'level-L2-valid',
  'level-L2-invalid',
  'level-L3-valid',
  'level-L3-invalid',
  'level-L4-valid',
  'level-L4-invalid',
];

const REQUIRED_METADATA_FIELDS = [
  'vector_id',
  'target',
  'target_description',
  'expected_result',
  'expected_error',
  'warrant_version',
  'notes',
];

const VALID_TARGETS = [
  'invariant-1',
  'invariant-2',
  'invariant-3',
  'invariant-4',
  'invariant-5',
  'level-L1',
  'level-L2',
  'level-L3',
  'level-L4',
];

// ---------------------------------------------------------------------------
// Invariant check functions (test-local logic)
// ---------------------------------------------------------------------------

/**
 * Invariant 1: Integration ↔ Failure Modes
 * Every entry in integration_map.authorised_integrations and
 * integration_map.tool_access has a corresponding entry in
 * failure_modes.known_failure_modes with matching related_integration.
 * @returns {{ valid: boolean, error: string|null }}
 */
function checkInvariant1(bp) {
  const integrations = [
    ...(bp.integration_map?.authorised_integrations ?? []),
    ...(bp.integration_map?.tool_access ?? []),
  ];
  const failureModes = bp.failure_modes?.known_failure_modes ?? [];
  const covered = new Set(
    failureModes.map((fm) => fm.related_integration).filter(Boolean),
  );

  for (const integration of integrations) {
    if (!covered.has(integration)) {
      return {
        valid: false,
        error: `Integration '${integration}' in authorised_integrations has no corresponding entry in failure_modes.known_failure_modes with matching related_integration`,
      };
    }
  }
  return { valid: true, error: null };
}

/**
 * Invariant 2: Financial Risk ≤ Budget
 * risk_profile.financial_risk_limit.amount does not exceed
 * feasibility.budget_limit.amount (same currency).
 * @returns {{ valid: boolean, error: string|null }}
 */
function checkInvariant2(bp) {
  const riskLimit = bp.risk_profile?.financial_risk_limit;
  const budgetLimit = bp.feasibility?.budget_limit;

  // If no financial_risk_limit is declared, invariant is trivially satisfied
  if (!riskLimit || !budgetLimit) return { valid: true, error: null };

  if (riskLimit.amount > budgetLimit.amount) {
    return {
      valid: false,
      error: `risk_profile.financial_risk_limit.amount (${riskLimit.amount}) exceeds feasibility.budget_limit.amount (${budgetLimit.amount}) for currency ${budgetLimit.currency}`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Invariant 3: Zero-Trust Persona Exclusion
 * No persona with trust_level "zero" appears in stakeholders.approvers.
 * @returns {{ valid: boolean, error: string|null }}
 */
function checkInvariant3(bp) {
  const personas = bp.personas ?? [];
  const approvers = bp.stakeholders?.approvers ?? [];
  const approverSet = new Set(approvers);

  for (const persona of personas) {
    if (persona.trust_level === 'zero' && approverSet.has(persona.id)) {
      return {
        valid: false,
        error: `Persona '${persona.id}' has trust_level 'zero' but appears in stakeholders.approvers`,
      };
    }
  }
  return { valid: true, error: null };
}

/**
 * Invariant 4: Boundary ↔ Integration Consistency
 * No boundaries.prohibited_actions[].resource_pattern regex matches
 * any entry in integration_map.authorised_integrations.
 * @returns {{ valid: boolean, error: string|null }}
 */
function checkInvariant4(bp) {
  const prohibitedActions = bp.boundaries?.prohibited_actions ?? [];
  const integrations = bp.integration_map?.authorised_integrations ?? [];

  for (const action of prohibitedActions) {
    const pattern = action.resource_pattern;
    if (!pattern) continue;
    const regex = new RegExp(pattern);
    for (const integration of integrations) {
      if (regex.test(integration)) {
        return {
          valid: false,
          error: `Prohibited action pattern '${pattern}' matches authorised integration '${integration}'`,
        };
      }
    }
  }
  return { valid: true, error: null };
}

/**
 * Invariant 5: Success Metric ↔ Observability Consistency
 * Every metric_ref in runtime_observability.guardian_alerts[] MUST match
 * a metric_id in success_metrics.kpis[].
 * @returns {{ valid: boolean, error: string|null }}
 */
function checkInvariant5(bp) {
  const guardianAlerts = bp.runtime_observability?.guardian_alerts ?? [];
  const kpis = bp.success_metrics?.kpis ?? [];

  if (guardianAlerts.length === 0 || kpis.length === 0) {
    return { valid: true, error: null };
  }

  const validMetricIds = new Set(kpis.map((kpi) => kpi.metric_id));

  for (const alert of guardianAlerts) {
    if (!validMetricIds.has(alert.metric_ref)) {
      return {
        valid: false,
        error: `Guardian alert metric_ref '${alert.metric_ref}' has no corresponding metric_id in success_metrics.kpis`,
      };
    }
  }
  return { valid: true, error: null };
}

const INVARIANT_CHECKERS = {
  'invariant-1': checkInvariant1,
  'invariant-2': checkInvariant2,
  'invariant-3': checkInvariant3,
  'invariant-4': checkInvariant4,
  'invariant-5': checkInvariant5,
};

// ===========================================================================
// Task 12.1 — Vector format and metadata tests
// ===========================================================================
describe('Conformance vector format and metadata', () => {
  it('has exactly 18 vector files', () => {
    expect(vectorFiles).toHaveLength(18);
  });

  for (const name of EXPECTED_VECTORS) {
    describe(`${name}.warrant.json`, () => {
      it('is valid JSON with only _vector_metadata and blueprint keys', () => {
        const raw = readFileSync(
          resolve(vectorDir, `${name}.warrant.json`),
          'utf-8',
        );
        const parsed = JSON.parse(raw);
        const keys = Object.keys(parsed);
        expect(keys).toHaveLength(2);
        expect(keys).toContain('_vector_metadata');
        expect(keys).toContain('blueprint');
      });

      it('has _vector_metadata with all required fields and a blueprint object', () => {
        const vector = loadVector(name);
        expect(vector).toHaveProperty('_vector_metadata');
        expect(vector).toHaveProperty('blueprint');
        expect(typeof vector.blueprint).toBe('object');

        const meta = vector._vector_metadata;
        for (const field of REQUIRED_METADATA_FIELDS) {
          expect(meta).toHaveProperty(field);
        }

        // vector_id must match filename stem
        expect(meta.vector_id).toBe(name);

        // target must be one of the 8 valid values
        expect(VALID_TARGETS).toContain(meta.target);

        // target_description must be a non-empty string
        expect(typeof meta.target_description).toBe('string');
        expect(meta.target_description.length).toBeGreaterThan(0);

        // expected_result must be "valid" or "invalid"
        expect(['valid', 'invalid']).toContain(meta.expected_result);

        // warrant_version must be "0.11.0"
        expect(meta.warrant_version).toBe('0.11.0');

        // notes must be a non-empty string
        expect(typeof meta.notes).toBe('string');
        expect(meta.notes.length).toBeGreaterThan(0);
      });

      if (name.includes('-invalid')) {
        it('has non-null expected_error for invalid vector', () => {
          const vector = loadVector(name);
          expect(vector._vector_metadata.expected_error).not.toBeNull();
          expect(typeof vector._vector_metadata.expected_error).toBe('string');
        });
      }

      if (name.includes('-valid') && !name.includes('-invalid')) {
        it('has null expected_error for valid vector', () => {
          const vector = loadVector(name);
          expect(vector._vector_metadata.expected_error).toBeNull();
        });
      }
    });
  }
});

// ===========================================================================
// Task 12.2 — Invariant vector validation tests
// ===========================================================================
describe('Invariant vector validation', () => {
  for (let i = 1; i <= 5; i++) {
    const target = `invariant-${i}`;
    const checker = INVARIANT_CHECKERS[target];

    describe(`Invariant ${i} — valid vector`, () => {
      const vector = loadVector(`${target}-valid`);
      const bp = vector.blueprint;

      it('passes schema validation', () => {
        const result = validate(bp);
        expect(result.valid).toBe(true);
      });

      it('passes the targeted invariant check', () => {
        const result = checker(bp);
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    describe(`Invariant ${i} — invalid vector`, () => {
      const vector = loadVector(`${target}-invalid`);
      const bp = vector.blueprint;

      it('fails the targeted invariant check', () => {
        const result = checker(bp);
        expect(result.valid).toBe(false);
        expect(result.error).not.toBeNull();
      });

      it('error matches expected_error from metadata', () => {
        const result = checker(bp);
        expect(result.error).toBe(vector._vector_metadata.expected_error);
      });
    });
  }
});

// ===========================================================================
// Task 12.3 — Conformance level vector validation tests
// ===========================================================================
describe('Conformance level vector validation', () => {
  for (const level of ['L1', 'L2', 'L3', 'L4']) {
    describe(`Level ${level} — valid vector`, () => {
      const vector = loadVector(`level-${level}-valid`);
      const bp = vector.blueprint;

      it('passes schema validation at the declared level', () => {
        const result = validate(bp);
        expect(result.valid).toBe(true);
      });
    });

    describe(`Level ${level} — invalid vector`, () => {
      const vector = loadVector(`level-${level}-invalid`);
      const bp = vector.blueprint;

      it('fails schema validation at the declared level', () => {
        const result = validate(bp);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  }
});
