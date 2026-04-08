import { describe, it, expect } from 'vitest';
import { validate } from './helpers.js';

// ---------------------------------------------------------------------------
// Deterministic migration transform: v0.9.15 → v0.9.16
// Implements the rules from design section 3A.
// ---------------------------------------------------------------------------

/**
 * Migrate a v0.9.15-structured WARRANT Intent Blueprint to v0.9.16.
 *
 * Applies the deterministic path transformation rules:
 *   metadata.*                        → manifest.*
 *   intent.{objective fields}         → objective.*
 *   intent.ux_logic.*                 → ux_logic.*
 *   permissions.feasibility.*         → feasibility.* (+ active_period, top_up_config from budget_cap)
 *   permissions.stakeholders.*        → stakeholders.*
 *   permissions.data_model.*          → data_model.* (+ data_access, data_write, data_forbidden)
 *   permissions.integration_map.*     → integration_map.* (+ tool_access, tool_forbidden)
 *   permissions.on_failure.*          → risk_profile.on_failure.*
 *   boundaries.hitl_triggers          → risk_profile.hitl_triggers
 *   boundaries.{prohibited_actions, scope_boundaries, kill_switch} → boundaries.* (unchanged)
 *   boundaries.failure_modes.*        → failure_modes.*
 *   compliance.frameworks             → compliance_frameworks.frameworks
 *   compliance.success_metrics.*      → success_metrics.*
 *   personas                          → personas (unchanged)
 *   warrant_version                   → "0.9.16"
 *
 * @param {object} v015Doc - A v0.9.15-structured document.
 * @returns {object} A v0.9.16-structured document.
 */
export function migrateV015ToV016(v015Doc) {
  const doc = structuredClone(v015Doc);
  const v016 = {};

  // --- Top-level scalars ---
  v016.warrant_version = '0.10.0';
  if (doc.agent_id) v016.agent_id = doc.agent_id;
  if (doc.agent_name) v016.agent_name = doc.agent_name;
  if (doc.conformance_level) v016.conformance_level = doc.conformance_level;

  // --- metadata.* → manifest.* ---
  if (doc.metadata) {
    v016.manifest = { ...doc.metadata };
  }

  // --- intent fields → objective + ux_logic ---
  if (doc.intent) {
    const objective = {};
    const intentObjFields = [
      'primary_objective', 'success_criteria', 'out_of_scope', 'domain', 'autonomy_level',
    ];
    for (const field of intentObjFields) {
      if (doc.intent[field] !== undefined) {
        objective[field] = doc.intent[field];
      }
    }
    v016.objective = objective;

    if (doc.intent.ux_logic) {
      v016.ux_logic = { ...doc.intent.ux_logic };
    }
  }

  // --- permissions → feasibility, stakeholders, data_model, integration_map, risk_profile.on_failure ---
  if (doc.permissions) {
    // feasibility.* + active_period + top_up_config (from budget_cap)
    const feasibility = doc.permissions.feasibility
      ? { ...doc.permissions.feasibility }
      : {};
    if (doc.permissions.active_period !== undefined) {
      feasibility.active_period = doc.permissions.active_period;
    }
    if (doc.permissions.budget_cap !== undefined) {
      feasibility.top_up_config = doc.permissions.budget_cap;
    }
    v016.feasibility = feasibility;

    // stakeholders.*
    if (doc.permissions.stakeholders) {
      v016.stakeholders = { ...doc.permissions.stakeholders };
    }

    // data_model.* + data_access, data_write, data_forbidden
    const dataModel = doc.permissions.data_model
      ? { ...doc.permissions.data_model }
      : {};
    if (doc.permissions.data_access !== undefined) {
      dataModel.data_access = doc.permissions.data_access;
    }
    if (doc.permissions.data_write !== undefined) {
      dataModel.data_write = doc.permissions.data_write;
    }
    if (doc.permissions.data_forbidden !== undefined) {
      dataModel.data_forbidden = doc.permissions.data_forbidden;
    }
    v016.data_model = dataModel;

    // integration_map.* + tool_access, tool_forbidden
    const integrationMap = doc.permissions.integration_map
      ? { ...doc.permissions.integration_map }
      : {};
    if (doc.permissions.tool_access !== undefined) {
      integrationMap.tool_access = doc.permissions.tool_access;
    }
    if (doc.permissions.tool_forbidden !== undefined) {
      integrationMap.tool_forbidden = doc.permissions.tool_forbidden;
    }
    v016.integration_map = integrationMap;

    // on_failure → risk_profile.on_failure
    if (doc.permissions.on_failure) {
      v016._permissionsOnFailure = doc.permissions.on_failure;
    }
  }

  // --- boundaries → boundaries (narrowed) + risk_profile.hitl_triggers + failure_modes ---
  if (doc.boundaries) {
    const boundaries = {};
    boundaries.prohibited_actions = doc.boundaries.prohibited_actions !== undefined
      ? doc.boundaries.prohibited_actions
      : [];
    if (doc.boundaries.scope_boundaries !== undefined) {
      boundaries.scope_boundaries = doc.boundaries.scope_boundaries;
    }
    if (doc.boundaries.kill_switch !== undefined) {
      boundaries.kill_switch = doc.boundaries.kill_switch;
    }
    v016.boundaries = boundaries;

    // hitl_triggers → risk_profile.hitl_triggers
    const riskProfile = {};
    if (doc.boundaries.hitl_triggers !== undefined) {
      riskProfile.hitl_triggers = doc.boundaries.hitl_triggers;
    }
    // Merge on_failure from permissions
    if (v016._permissionsOnFailure) {
      riskProfile.on_failure = v016._permissionsOnFailure;
    }
    v016.risk_profile = riskProfile;

    // failure_modes.*
    if (doc.boundaries.failure_modes) {
      v016.failure_modes = { ...doc.boundaries.failure_modes };
    }
  } else {
    // Still build risk_profile from permissions.on_failure if boundaries absent
    if (v016._permissionsOnFailure) {
      v016.risk_profile = { on_failure: v016._permissionsOnFailure };
    }
  }
  delete v016._permissionsOnFailure;

  // --- compliance → compliance_frameworks + success_metrics ---
  if (doc.compliance) {
    if (doc.compliance.frameworks !== undefined) {
      v016.compliance_frameworks = { frameworks: doc.compliance.frameworks };
    }
    if (doc.compliance.success_metrics) {
      v016.success_metrics = { ...doc.compliance.success_metrics };
    }
  }

  // --- personas (unchanged) ---
  if (doc.personas) {
    v016.personas = doc.personas;
  }

  // --- runtime_observability (v0.11.0 required Pillar 14) ---
  v016.runtime_observability = {};

  return v016;
}

// ---------------------------------------------------------------------------
// v0.9.15 sample document (old nested grouping structure)
// ---------------------------------------------------------------------------

const V015_DOCUMENT = {
  warrant_version: '0.9.15',
  agent_id: 'did:example:agent-migration-test',
  agent_name: 'Migration Test Agent',
  conformance_level: 'L1',

  metadata: {
    blueprint_id: 'bp-migration-001',
    version: '1.0.0',
    owner: 'did:example:owner',
    status: 'draft',
    created_at: '2025-01-15T10:00:00Z',
  },

  intent: {
    primary_objective: 'Automate data processing pipeline',
    domain: 'data-engineering',
    autonomy_level: 'supervised',
    success_criteria: ['Process 1000 records/hour', 'Error rate < 1%'],
    out_of_scope: ['Production database writes', 'Financial transactions'],
    ux_logic: {
      interaction_model: 'approve',
      user_facing: true,
      tone_and_voice: 'professional',
      failure_ux: 'Notify user with error summary',
    },
  },

  permissions: {
    feasibility: {
      budget_limit: { amount: 5000, currency: 'EUR', time_period: 'monthly' },
      compute_constraints: 'max 8 vCPU, 32GB RAM',
      timeline: 'Q2 2025',
      dependencies: ['external-api-v3'],
      hard_stops: ['budget exhausted', 'timeline exceeded'],
    },
    active_period: {
      timezone: 'UTC',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      window_start: '08:00',
      window_end: '18:00',
    },
    budget_cap: {
      top_up_protocol: {
        protocol_uri: 'https://billing.example.com/top-up',
        max_top_up_amount: 500,
        approval_required: true,
      },
    },
    stakeholders: {
      approvers: ['did:example:approver-1', 'did:example:approver-2'],
      notification_list: ['did:example:notify-1'],
    },
    data_model: {
      data_sources: ['https://api.example.com/data'],
      data_outputs: ['https://storage.example.com/results'],
      retention_policy: '90 days',
      sensitive_data_categories: ['PII'],
      data_ownership: 'organization',
    },
    data_access: ['https://api.example.com/read'],
    data_write: ['https://storage.example.com/write'],
    data_forbidden: ['https://internal.example.com/secrets'],
    integration_map: {
      authorised_integrations: ['https://api.example.com'],
      rate_limits: { requests: 100, window_seconds: 60 },
      warrant_handshake: true,
      handshake_failure_handling: 'Halt and notify operator if handshake fails within 5 seconds',
    },
    tool_access: ['mcp://tool-server/tool-name'],
    tool_forbidden: ['mcp://unverified-exchange/trade'],
    on_failure: {
      default: 'escalate',
      escalation_path: ['did:example:escalation-contact'],
      retry_policy: { max_retries: 3, backoff: 'exponential' },
    },
  },

  boundaries: {
    hitl_triggers: [
      { metric: 'error_rate', threshold: 0.5, operator: 'gt', action: 'pause_and_verify' },
      { metric: 'confidence_score', threshold: 0.3, operator: 'lt', action: 'escalate' },
    ],
    prohibited_actions: [
      { resource_pattern: '^mcp://unverified/.*', methods: ['*'], description: 'Block unverified tools' },
    ],
    scope_boundaries: ['Must not access production databases', 'Must not modify user accounts'],
    kill_switch: { type: 'api_endpoint', uri: 'https://kill.example.com/terminate' },
    failure_modes: {
      known_failure_modes: [
        { scenario: 'API timeout', severity: 'high', mitigation: 'Retry with backoff' },
        { scenario: 'Data corruption', severity: 'critical', mitigation: 'Halt and alert' },
      ],
      assumption_risks: ['Assumes API uptime > 99.9%'],
      external_dependencies_risk: ['Third-party rate limiting'],
      edge_cases: ['Empty response payload'],
    },
  },

  compliance: {
    frameworks: [{ name: 'EU AI Act', version: '2024' }],
    success_metrics: {
      primary_kpi: 'task_completion_rate',
      baseline: '85%',
      measurement_frequency: 'daily',
      evidence_pack_config: { storage: 's3://evidence-bucket', retention_days: 365 },
      secondary_kpis: ['response_time_p95', 'error_rate'],
      degradation_threshold: '10% below baseline',
    },
  },

  personas: [
    {
      id: 'persona-ops',
      trust_level: 'standard',
      capabilities_override: { deny_all_writes: false, restrict_tool_access: [] },
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests — Requirements 14.5, 11.2, 11.5
// ---------------------------------------------------------------------------

describe('v0.9.15 → v0.9.16 migration round-trip', () => {
  const migrated = migrateV015ToV016(V015_DOCUMENT);

  it('migrated document passes v0.9.16 schema validation', () => {
    const result = validate(migrated);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('warrant_version is updated to "0.10.0"', () => {
    expect(migrated.warrant_version).toBe('0.10.0');
  });

  // --- manifest (from metadata) ---
  it('metadata.* → manifest.*', () => {
    expect(migrated.manifest.blueprint_id).toBe(V015_DOCUMENT.metadata.blueprint_id);
    expect(migrated.manifest.version).toBe(V015_DOCUMENT.metadata.version);
    expect(migrated.manifest.owner).toBe(V015_DOCUMENT.metadata.owner);
    expect(migrated.manifest.status).toBe(V015_DOCUMENT.metadata.status);
    expect(migrated.manifest.created_at).toBe(V015_DOCUMENT.metadata.created_at);
  });

  // --- objective (from intent fields) ---
  it('intent.{objective fields} → objective.*', () => {
    expect(migrated.objective.primary_objective).toBe(V015_DOCUMENT.intent.primary_objective);
    expect(migrated.objective.domain).toBe(V015_DOCUMENT.intent.domain);
    expect(migrated.objective.autonomy_level).toBe(V015_DOCUMENT.intent.autonomy_level);
    expect(migrated.objective.success_criteria).toEqual(V015_DOCUMENT.intent.success_criteria);
    expect(migrated.objective.out_of_scope).toEqual(V015_DOCUMENT.intent.out_of_scope);
  });

  // --- ux_logic (from intent.ux_logic) ---
  it('intent.ux_logic.* → ux_logic.*', () => {
    expect(migrated.ux_logic.interaction_model).toBe(V015_DOCUMENT.intent.ux_logic.interaction_model);
    expect(migrated.ux_logic.user_facing).toBe(V015_DOCUMENT.intent.ux_logic.user_facing);
    expect(migrated.ux_logic.tone_and_voice).toBe(V015_DOCUMENT.intent.ux_logic.tone_and_voice);
    expect(migrated.ux_logic.failure_ux).toBe(V015_DOCUMENT.intent.ux_logic.failure_ux);
  });

  // --- feasibility (from permissions.feasibility + active_period + top_up_config from budget_cap) ---
  it('permissions.feasibility.* → feasibility.*', () => {
    expect(migrated.feasibility.budget_limit).toEqual(V015_DOCUMENT.permissions.feasibility.budget_limit);
    expect(migrated.feasibility.compute_constraints).toBe(V015_DOCUMENT.permissions.feasibility.compute_constraints);
    expect(migrated.feasibility.timeline).toBe(V015_DOCUMENT.permissions.feasibility.timeline);
    expect(migrated.feasibility.dependencies).toEqual(V015_DOCUMENT.permissions.feasibility.dependencies);
    expect(migrated.feasibility.hard_stops).toEqual(V015_DOCUMENT.permissions.feasibility.hard_stops);
  });

  it('permissions.active_period → feasibility.active_period', () => {
    expect(migrated.feasibility.active_period).toEqual(V015_DOCUMENT.permissions.active_period);
  });

  it('permissions.budget_cap → feasibility.top_up_config', () => {
    expect(migrated.feasibility.top_up_config).toEqual(V015_DOCUMENT.permissions.budget_cap);
  });

  // --- stakeholders (from permissions.stakeholders) ---
  it('permissions.stakeholders.* → stakeholders.*', () => {
    expect(migrated.stakeholders.approvers).toEqual(V015_DOCUMENT.permissions.stakeholders.approvers);
    expect(migrated.stakeholders.notification_list).toEqual(V015_DOCUMENT.permissions.stakeholders.notification_list);
  });

  // --- data_model (from permissions.data_model + data_access/write/forbidden) ---
  it('permissions.data_model.* → data_model.*', () => {
    expect(migrated.data_model.data_sources).toEqual(V015_DOCUMENT.permissions.data_model.data_sources);
    expect(migrated.data_model.data_outputs).toEqual(V015_DOCUMENT.permissions.data_model.data_outputs);
    expect(migrated.data_model.retention_policy).toBe(V015_DOCUMENT.permissions.data_model.retention_policy);
    expect(migrated.data_model.sensitive_data_categories).toEqual(V015_DOCUMENT.permissions.data_model.sensitive_data_categories);
    expect(migrated.data_model.data_ownership).toBe(V015_DOCUMENT.permissions.data_model.data_ownership);
  });

  it('permissions.data_access → data_model.data_access', () => {
    expect(migrated.data_model.data_access).toEqual(V015_DOCUMENT.permissions.data_access);
  });

  it('permissions.data_write → data_model.data_write', () => {
    expect(migrated.data_model.data_write).toEqual(V015_DOCUMENT.permissions.data_write);
  });

  it('permissions.data_forbidden → data_model.data_forbidden', () => {
    expect(migrated.data_model.data_forbidden).toEqual(V015_DOCUMENT.permissions.data_forbidden);
  });

  // --- integration_map (from permissions.integration_map + tool_access/forbidden) ---
  it('permissions.integration_map.* → integration_map.*', () => {
    expect(migrated.integration_map.authorised_integrations).toEqual(V015_DOCUMENT.permissions.integration_map.authorised_integrations);
    expect(migrated.integration_map.rate_limits).toEqual(V015_DOCUMENT.permissions.integration_map.rate_limits);
    expect(migrated.integration_map.warrant_handshake).toBe(V015_DOCUMENT.permissions.integration_map.warrant_handshake);
  });

  it('permissions.tool_access → integration_map.tool_access', () => {
    expect(migrated.integration_map.tool_access).toEqual(V015_DOCUMENT.permissions.tool_access);
  });

  it('permissions.tool_forbidden → integration_map.tool_forbidden', () => {
    expect(migrated.integration_map.tool_forbidden).toEqual(V015_DOCUMENT.permissions.tool_forbidden);
  });

  // --- risk_profile (from boundaries.hitl_triggers + permissions.on_failure) ---
  it('boundaries.hitl_triggers → risk_profile.hitl_triggers', () => {
    expect(migrated.risk_profile.hitl_triggers).toEqual(V015_DOCUMENT.boundaries.hitl_triggers);
  });

  it('permissions.on_failure.* → risk_profile.on_failure.*', () => {
    expect(migrated.risk_profile.on_failure).toEqual(V015_DOCUMENT.permissions.on_failure);
  });

  // --- boundaries (narrowed to Pillar 09 only) ---
  it('boundaries retains prohibited_actions, scope_boundaries, kill_switch', () => {
    expect(migrated.boundaries.prohibited_actions).toEqual(V015_DOCUMENT.boundaries.prohibited_actions);
    expect(migrated.boundaries.scope_boundaries).toEqual(V015_DOCUMENT.boundaries.scope_boundaries);
    expect(migrated.boundaries.kill_switch).toEqual(V015_DOCUMENT.boundaries.kill_switch);
  });

  it('boundaries does NOT contain hitl_triggers or failure_modes', () => {
    expect(migrated.boundaries.hitl_triggers).toBeUndefined();
    expect(migrated.boundaries.failure_modes).toBeUndefined();
  });

  // --- failure_modes (from boundaries.failure_modes) ---
  it('boundaries.failure_modes.* → failure_modes.*', () => {
    expect(migrated.failure_modes.known_failure_modes).toEqual(V015_DOCUMENT.boundaries.failure_modes.known_failure_modes);
    expect(migrated.failure_modes.assumption_risks).toEqual(V015_DOCUMENT.boundaries.failure_modes.assumption_risks);
    expect(migrated.failure_modes.external_dependencies_risk).toEqual(V015_DOCUMENT.boundaries.failure_modes.external_dependencies_risk);
    expect(migrated.failure_modes.edge_cases).toEqual(V015_DOCUMENT.boundaries.failure_modes.edge_cases);
  });

  // --- compliance_frameworks (from compliance.frameworks) ---
  it('compliance.frameworks → compliance_frameworks.frameworks', () => {
    expect(migrated.compliance_frameworks.frameworks).toEqual(V015_DOCUMENT.compliance.frameworks);
  });

  // --- success_metrics (from compliance.success_metrics) ---
  it('compliance.success_metrics.* → success_metrics.*', () => {
    expect(migrated.success_metrics.primary_kpi).toBe(V015_DOCUMENT.compliance.success_metrics.primary_kpi);
    expect(migrated.success_metrics.baseline).toBe(V015_DOCUMENT.compliance.success_metrics.baseline);
    expect(migrated.success_metrics.measurement_frequency).toBe(V015_DOCUMENT.compliance.success_metrics.measurement_frequency);
    expect(migrated.success_metrics.evidence_pack_config).toEqual(V015_DOCUMENT.compliance.success_metrics.evidence_pack_config);
    expect(migrated.success_metrics.secondary_kpis).toEqual(V015_DOCUMENT.compliance.success_metrics.secondary_kpis);
    expect(migrated.success_metrics.degradation_threshold).toBe(V015_DOCUMENT.compliance.success_metrics.degradation_threshold);
  });

  // --- personas (unchanged) ---
  it('personas preserved unchanged', () => {
    expect(migrated.personas).toEqual(V015_DOCUMENT.personas);
  });

  // --- No old grouping objects in output ---
  it('migrated document does not contain old grouping objects', () => {
    expect(migrated.metadata).toBeUndefined();
    expect(migrated.intent).toBeUndefined();
    expect(migrated.permissions).toBeUndefined();
    expect(migrated.compliance).toBeUndefined();
  });

  // --- Scalar passthrough ---
  it('agent_id and agent_name are preserved', () => {
    expect(migrated.agent_id).toBe(V015_DOCUMENT.agent_id);
    expect(migrated.agent_name).toBe(V015_DOCUMENT.agent_name);
  });

  it('conformance_level is preserved', () => {
    expect(migrated.conformance_level).toBe(V015_DOCUMENT.conformance_level);
  });
});
