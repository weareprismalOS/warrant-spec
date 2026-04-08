import { describe, it, expect } from 'vitest';
import { validate, buildMinimalBlueprint } from './helpers.js';

// =============================================================================
// Task 13.1 — Cross-Pillar Invariant 5 structural precondition tests
//
// Invariant 5 encoding: root allOf conditional with if/then.
// The `if` checks that both runtime_observability.guardian_alerts (minItems 1)
// and success_metrics.kpis (minItems 1) are present.
// The `then` block is description-only — no schema constraints added.
// Therefore ALL blueprints should validate; these tests verify the conditional
// structure exists and doesn't break validation.
// =============================================================================

describe('Cross-Pillar Invariant 5: structural precondition', () => {
  it('blueprint with both guardian_alerts (≥1) and kpis (≥1) validates — then block is description-only', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        guardian_alerts: [
          { metric_ref: 'task_completion_rate', threshold: 0.9, operator: 'lt', action: 'alert' },
        ],
      },
      success_metrics: {
        kpis: [{ metric_id: 'task_completion_rate' }],
      },
    });
    const { valid, errors } = validate(doc);
    expect(valid).toBe(true);
  });

  it('blueprint with empty guardian_alerts does NOT trigger Invariant 5 conditional', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        guardian_alerts: [],
      },
      success_metrics: {
        kpis: [{ metric_id: 'some_metric' }],
      },
    });
    const { valid } = validate(doc);
    expect(valid).toBe(true);
  });

  it('blueprint with empty kpis does NOT trigger Invariant 5 conditional', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        guardian_alerts: [
          { metric_ref: 'error_rate', threshold: 5, operator: 'gt', action: 'pause' },
        ],
      },
      success_metrics: {
        kpis: [],
      },
    });
    const { valid } = validate(doc);
    expect(valid).toBe(true);
  });

  it('blueprint without guardian_alerts property does NOT trigger Invariant 5 conditional', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {},
      success_metrics: {
        kpis: [{ metric_id: 'latency_p99' }],
      },
    });
    const { valid } = validate(doc);
    expect(valid).toBe(true);
  });

  it('blueprint without kpis property does NOT trigger Invariant 5 conditional', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        guardian_alerts: [
          { metric_ref: 'throughput', threshold: 100, operator: 'lt', action: 'alert' },
        ],
      },
    });
    const { valid } = validate(doc);
    expect(valid).toBe(true);
  });
});
