import { describe, it, expect } from 'vitest';
import { validate, buildMinimalBlueprint } from './helpers.js';

// =============================================================================
// Task 10.1 — Tier 1 property tests
// =============================================================================

describe('Tier 1: alert_endpoint and alert_format in risk_profile', () => {
  it('accepts valid alert_endpoint URI', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_endpoint: 'https://alerts.example.com/webhook',
        alert_format: 'webhook',
      },
    });
    const { valid } = validate(doc);
    expect(valid).toBe(true);
  });

  it('accepts alert_format "syslog"', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_endpoint: 'https://alerts.example.com/syslog',
        alert_format: 'syslog',
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts alert_format "cloudevents"', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_endpoint: 'https://alerts.example.com/ce',
        alert_format: 'cloudevents',
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects invalid alert_format enum value', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        alert_endpoint: 'https://alerts.example.com/webhook',
        alert_format: 'email',
      },
    });
    expect(validate(doc).valid).toBe(false);
  });
});

describe('Tier 1: data_sovereignty_region in data_model', () => {
  it('accepts valid ISO 3166-1 alpha-2 code "US"', () => {
    const doc = buildMinimalBlueprint({
      data_model: { data_sovereignty_region: 'US' },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts valid code "DE"', () => {
    const doc = buildMinimalBlueprint({
      data_model: { data_sovereignty_region: 'DE' },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects lowercase code "us"', () => {
    const doc = buildMinimalBlueprint({
      data_model: { data_sovereignty_region: 'us' },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects 3-character code "USA"', () => {
    const doc = buildMinimalBlueprint({
      data_model: { data_sovereignty_region: 'USA' },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects digits "12"', () => {
    const doc = buildMinimalBlueprint({
      data_model: { data_sovereignty_region: '12' },
    });
    expect(validate(doc).valid).toBe(false);
  });
});

describe('Tier 1: controls in compliance_frameworks.frameworks[]', () => {
  it('accepts valid control with control_id and pillars', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [
          {
            name: 'EU AI Act',
            version: '2024',
            controls: [
              { control_id: 'Art. 9(1)', pillars: ['risk_profile', 'data_model'] },
            ],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects empty control_id', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [
          {
            name: 'EU AI Act',
            version: '2024',
            controls: [{ control_id: '', pillars: ['risk_profile'] }],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects invalid Pillar name in pillars', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [
          {
            name: 'EU AI Act',
            version: '2024',
            controls: [{ control_id: 'Art. 9(1)', pillars: ['nonexistent_pillar'] }],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects empty pillars array', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [
          {
            name: 'EU AI Act',
            version: '2024',
            controls: [{ control_id: 'Art. 9(1)', pillars: [] }],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('accepts runtime_observability as a valid Pillar name', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [
          {
            name: 'EU AI Act',
            version: '2024',
            controls: [{ control_id: 'Art. 15', pillars: ['runtime_observability'] }],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });
});

describe('Tier 1: discovery_uri in manifest', () => {
  it('accepts valid discovery_uri', () => {
    const doc = buildMinimalBlueprint({
      manifest: { discovery_uri: 'https://example.com/blueprints/bp-001' },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('manifest with additionalProperties: false does not reject discovery_uri', () => {
    const doc = buildMinimalBlueprint({
      manifest: { discovery_uri: 'https://example.com/blueprints/bp-001' },
    });
    const { valid, errors } = validate(doc);
    const additionalPropErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath === '/manifest'
    );
    expect(additionalPropErrors).toHaveLength(0);
    expect(valid).toBe(true);
  });
});

describe('Tier 1: explainability_uri in ux_logic', () => {
  it('accepts valid explainability_uri', () => {
    const doc = buildMinimalBlueprint({
      ux_logic: { explainability_uri: 'https://example.com/explain' },
    });
    expect(validate(doc).valid).toBe(true);
  });
});

describe('Tier 1: all new properties are optional at L1/L2', () => {
  it('L1 blueprint validates without any Tier 1 properties', () => {
    const doc = buildMinimalBlueprint({ conformance_level: 'L1' });
    expect(validate(doc).valid).toBe(true);
  });

  it('L2 blueprint validates without any Tier 1 properties', () => {
    const doc = buildMinimalBlueprint({
      conformance_level: 'L2',
      manifest: { status: 'active' },
      ux_logic: { interaction_model: 'approve', user_facing: true },
      feasibility: {
        budget_limit: { amount: 1000, currency: 'USD' },
      },
      stakeholders: { approvers: ['did:example:approver'] },
      data_model: { data_sources: ['https://example.com/source'] },
      boundaries: {
        kill_switch: { type: 'api_endpoint', uri: 'https://example.com/kill' },
        scope_boundaries: ['Must not access production databases'],
        prohibited_actions: [],
      },
      integration_map: {
        tool_access: ['mcp://tool-server/tool-name'],
      },
      failure_modes: {
        known_failure_modes: [
          { scenario: 'API timeout', severity: 'high', mitigation: 'Retry' },
        ],
      },
      personas: [{ id: 'persona-1', trust_level: 'standard' }],
    });
    expect(validate(doc).valid).toBe(true);
  });
});


// =============================================================================
// Task 10.2 — Tier 2 property tests
// =============================================================================

describe('Tier 2: authorised_integrations oneOf (string | object)', () => {
  it('accepts plain URI strings (legacy backward compat)', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: ['https://example.com/api'],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts enriched objects with uri + justification', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          {
            uri: 'https://example.com/api',
            justification: 'Required for data retrieval',
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts mixed array (string + object items)', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          'https://example.com/legacy-api',
          {
            uri: 'https://example.com/new-api',
            justification: 'New enriched integration',
            protocol_version: '2.0',
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects enriched object when justification is empty string', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          { uri: 'https://example.com/api', justification: '' },
        ],
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects enriched object when uri is missing', () => {
    const doc = buildMinimalBlueprint({
      integration_map: {
        authorised_integrations: [
          { justification: 'Some reason' },
        ],
      },
    });
    expect(validate(doc).valid).toBe(false);
  });
});

describe('Tier 2: drift_detection in risk_profile', () => {
  it('accepts valid drift_detection with threshold 0', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        drift_detection: { threshold: 0, action: 'alert' },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts valid drift_detection with threshold 0.5', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        drift_detection: { threshold: 0.5, action: 'pause' },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts valid drift_detection with threshold 1', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        drift_detection: { threshold: 1, action: 'halt' },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects threshold < 0', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        drift_detection: { threshold: -0.1, action: 'alert' },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects threshold > 1', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        drift_detection: { threshold: 1.1, action: 'alert' },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects invalid action enum', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        drift_detection: { threshold: 0.5, action: 'ignore' },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('accepts optional evaluation_interval', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        drift_detection: {
          threshold: 0.5,
          action: 'alert',
          evaluation_interval: 'hourly',
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });
});

describe('Tier 2: circuit_breaker in failure_modes', () => {
  it('accepts valid circuit_breaker with required fields', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 30,
          success_threshold: 3,
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects failure_threshold < 1', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 0,
          half_open_after_seconds: 30,
          success_threshold: 3,
        },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects half_open_after_seconds < 1', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 0,
          success_threshold: 3,
        },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('rejects success_threshold < 1', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 30,
          success_threshold: 0,
        },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('accepts on_open "halt"', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 30,
          success_threshold: 3,
          on_open: 'halt',
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts on_open "fallback"', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 30,
          success_threshold: 3,
          on_open: 'fallback',
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts on_open "escalate"', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 30,
          success_threshold: 3,
          on_open: 'escalate',
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects invalid on_open enum value', () => {
    const doc = buildMinimalBlueprint({
      failure_modes: {
        circuit_breaker: {
          failure_threshold: 5,
          half_open_after_seconds: 30,
          success_threshold: 3,
          on_open: 'retry',
        },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });
});


// =============================================================================
// Task 10.3 — Tier 3 and Pillar 14 property tests
// =============================================================================

describe('Tier 3: governance_workflow in risk_profile', () => {
  it('accepts valid governance_workflow with auto_approve_policy + exception_routing', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        governance_workflow: {
          auto_approve_policy: 'all_within_bounds',
          exception_routing: [
            { condition: 'amount > 10000', route_to: 'finance-team' },
          ],
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts all auto_approve_policy enum values', () => {
    for (const policy of ['all_within_bounds', 'low_risk_only', 'none']) {
      const doc = buildMinimalBlueprint({
        risk_profile: {
          governance_workflow: {
            auto_approve_policy: policy,
            exception_routing: [],
          },
        },
      });
      expect(validate(doc).valid).toBe(true);
    }
  });

  it('rejects invalid auto_approve_policy enum', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        governance_workflow: {
          auto_approve_policy: 'always',
          exception_routing: [],
        },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('accepts optional review_sla_seconds', () => {
    const doc = buildMinimalBlueprint({
      risk_profile: {
        governance_workflow: {
          auto_approve_policy: 'none',
          exception_routing: [
            { condition: 'data export', route_to: 'security-team' },
          ],
          review_sla_seconds: 3600,
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });
});

describe('Tier 3: crosswalks in compliance_frameworks', () => {
  it('accepts valid crosswalks with framework + mappings', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [{ name: 'EU AI Act', version: '2024' }],
        crosswalks: [
          {
            framework: 'EU AI Act',
            mappings: [
              {
                regulation_clause: 'Art. 9(1)',
                warrant_pillar: 'risk_profile',
                coverage_status: 'full',
              },
            ],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects invalid warrant_pillar enum in crosswalks', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [{ name: 'EU AI Act', version: '2024' }],
        crosswalks: [
          {
            framework: 'EU AI Act',
            mappings: [
              {
                regulation_clause: 'Art. 9(1)',
                warrant_pillar: 'nonexistent_pillar',
              },
            ],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('accepts runtime_observability as valid warrant_pillar in crosswalks', () => {
    const doc = buildMinimalBlueprint({
      compliance_frameworks: {
        frameworks: [{ name: 'ISO 42001', version: '2023' }],
        crosswalks: [
          {
            framework: 'ISO 42001',
            mappings: [
              {
                regulation_clause: 'Clause 6.1',
                warrant_pillar: 'runtime_observability',
              },
            ],
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts coverage_status enum values', () => {
    for (const status of ['full', 'partial', 'planned']) {
      const doc = buildMinimalBlueprint({
        compliance_frameworks: {
          frameworks: [{ name: 'NIST AI RMF', version: '1.0' }],
          crosswalks: [
            {
              framework: 'NIST AI RMF',
              mappings: [
                {
                  regulation_clause: 'Govern 1.1',
                  warrant_pillar: 'manifest',
                  coverage_status: status,
                },
              ],
            },
          ],
        },
      });
      expect(validate(doc).valid).toBe(true);
    }
  });
});

describe('Tier 3: discovery_protocol in manifest', () => {
  it('accepts valid discovery_protocol with well_known_endpoint', () => {
    const doc = buildMinimalBlueprint({
      manifest: {
        discovery_protocol: {
          well_known_endpoint: 'https://example.com/.well-known/warrant-discovery',
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts optional refresh_interval_seconds >= 60', () => {
    const doc = buildMinimalBlueprint({
      manifest: {
        discovery_protocol: {
          well_known_endpoint: 'https://example.com/.well-known/warrant-discovery',
          refresh_interval_seconds: 60,
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects refresh_interval_seconds < 60', () => {
    const doc = buildMinimalBlueprint({
      manifest: {
        discovery_protocol: {
          well_known_endpoint: 'https://example.com/.well-known/warrant-discovery',
          refresh_interval_seconds: 59,
        },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });

  it('manifest with additionalProperties: false accepts discovery_protocol', () => {
    const doc = buildMinimalBlueprint({
      manifest: {
        discovery_protocol: {
          well_known_endpoint: 'https://example.com/.well-known/warrant-discovery',
        },
      },
    });
    const { errors } = validate(doc);
    const additionalPropErrors = errors.filter(
      (e) => e.keyword === 'additionalProperties' && e.instancePath === '/manifest'
    );
    expect(additionalPropErrors).toHaveLength(0);
  });
});

describe('Pillar 14: runtime_observability', () => {
  it('is required at root level — omitting it fails validation', () => {
    const doc = buildMinimalBlueprint();
    delete doc.runtime_observability;
    expect(validate(doc).valid).toBe(false);
  });

  it('empty runtime_observability: {} is valid (all sub-properties optional)', () => {
    const doc = buildMinimalBlueprint({ runtime_observability: {} });
    expect(validate(doc).valid).toBe(true);
  });
});

describe('Pillar 14: intent_traceability', () => {
  it('accepts valid intent_traceability with reasoning_manifest_uri + log_format', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        intent_traceability: {
          reasoning_manifest_uri: 'https://example.com/reasoning',
          log_format: 'json',
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts all log_format enum values', () => {
    for (const fmt of ['json', 'opentelemetry', 'custom']) {
      const doc = buildMinimalBlueprint({
        runtime_observability: {
          intent_traceability: {
            reasoning_manifest_uri: 'https://example.com/reasoning',
            log_format: fmt,
          },
        },
      });
      expect(validate(doc).valid).toBe(true);
    }
  });

  it('accepts optional log_retention_days', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        intent_traceability: {
          reasoning_manifest_uri: 'https://example.com/reasoning',
          log_format: 'json',
          log_retention_days: 90,
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });
});

describe('Pillar 14: heartbeat', () => {
  it('accepts valid heartbeat with broadcast_uri + interval_seconds >= 10', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        heartbeat: {
          broadcast_uri: 'https://example.com/heartbeat',
          interval_seconds: 30,
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts interval_seconds exactly 10', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        heartbeat: {
          broadcast_uri: 'https://example.com/heartbeat',
          interval_seconds: 10,
        },
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects interval_seconds < 10', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        heartbeat: {
          broadcast_uri: 'https://example.com/heartbeat',
          interval_seconds: 9,
        },
      },
    });
    expect(validate(doc).valid).toBe(false);
  });
});

describe('Pillar 14: guardian_alerts', () => {
  it('accepts valid guardian_alerts array items', () => {
    const doc = buildMinimalBlueprint({
      runtime_observability: {
        guardian_alerts: [
          {
            metric_ref: 'task_completion_rate',
            threshold: 0.9,
            operator: 'lt',
            action: 'alert',
          },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts all operator enum values', () => {
    for (const op of ['lt', 'gt', 'eq', 'lte', 'gte']) {
      const doc = buildMinimalBlueprint({
        runtime_observability: {
          guardian_alerts: [
            { metric_ref: 'kpi-1', threshold: 1, operator: op, action: 'alert' },
          ],
        },
      });
      expect(validate(doc).valid).toBe(true);
    }
  });

  it('accepts all action enum values', () => {
    for (const act of ['alert', 'pause', 'halt', 'escalate']) {
      const doc = buildMinimalBlueprint({
        runtime_observability: {
          guardian_alerts: [
            { metric_ref: 'kpi-1', threshold: 1, operator: 'gt', action: act },
          ],
        },
      });
      expect(validate(doc).valid).toBe(true);
    }
  });
});

describe('Tier cross-cutting: kpis in success_metrics', () => {
  it('accepts valid kpis array with metric_id', () => {
    const doc = buildMinimalBlueprint({
      success_metrics: {
        kpis: [
          { metric_id: 'task_completion_rate', description: 'Rate of task completion' },
        ],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('accepts kpis with only required metric_id', () => {
    const doc = buildMinimalBlueprint({
      success_metrics: {
        kpis: [{ metric_id: 'error_rate' }],
      },
    });
    expect(validate(doc).valid).toBe(true);
  });

  it('rejects kpis item with empty metric_id', () => {
    const doc = buildMinimalBlueprint({
      success_metrics: {
        kpis: [{ metric_id: '' }],
      },
    });
    expect(validate(doc).valid).toBe(false);
  });
});
