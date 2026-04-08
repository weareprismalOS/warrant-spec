import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

// ---------------------------------------------------------------------------
// Load schema
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "../WARRANT Intent Blueprint.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// ---------------------------------------------------------------------------
// AJV instance with format validation (uri, date-time, etc.)
// ---------------------------------------------------------------------------
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const ajvValidate = ajv.compile(schema);

/**
 * Validate a document against the WARRANT Intent Blueprint schema.
 * @param {object} doc - The document to validate.
 * @returns {{ valid: boolean, errors: Array }} Validation result.
 */
export function validate(doc) {
  const valid = ajvValidate(doc);
  return {
    valid: !!valid,
    errors: ajvValidate.errors ? [...ajvValidate.errors] : [],
  };
}

// ---------------------------------------------------------------------------
// Deep-merge utility
// ---------------------------------------------------------------------------

/**
 * Deep-merge `source` into `target`. Arrays are replaced, not concatenated.
 * Returns a new object — neither input is mutated.
 */
function deepMerge(target, source) {
  if (source === undefined) return structuredClone(target);
  if (
    typeof target !== "object" ||
    target === null ||
    Array.isArray(target) ||
    typeof source !== "object" ||
    source === null ||
    Array.isArray(source)
  ) {
    return structuredClone(source);
  }

  const result = structuredClone(target);
  for (const key of Object.keys(source)) {
    result[key] = deepMerge(result[key], source[key]);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Minimal L1-valid blueprint baseline
// ---------------------------------------------------------------------------

const MINIMAL_BLUEPRINT = {
  warrant_version: "0.11.0",
  conformance_level: "L1",
  manifest: {
    blueprint_id: "bp-test-001",
    version: "1.0.0",
    owner: "did:example:owner",
    status: "draft",
    created_at: "2025-01-01T00:00:00Z",
  },
  objective: {
    primary_objective: "Test objective",
    domain: "testing",
    autonomy_level: "supervised",
    success_criteria: ["Criterion 1"],
    out_of_scope: ["Nothing"],
  },
  ux_logic: {
    interaction_model: "approve",
    user_facing: true,
  },
  feasibility: {
    budget_limit: { amount: 1000, currency: "USD", time_period: "monthly" },
  },
  stakeholders: {
    approvers: ["did:example:approver"],
  },
  compliance_frameworks: {
    frameworks: [{ name: "EU AI Act", version: "2024" }],
  },
  risk_profile: {
    hitl_triggers: [
      {
        metric: "error_rate",
        threshold: 0.5,
        operator: "gt",
        action: "pause_and_verify",
      },
    ],
    on_failure: {
      default: "escalate",
      escalation_path: ["did:example:escalation-contact"],
    },
  },
  data_model: {
    data_sources: ["https://example.com/source"],
  },
  boundaries: {
    prohibited_actions: [],
    kill_switch: {
      type: "api_endpoint",
      uri: "https://example.com/kill",
    },
    scope_boundaries: ["Must not access production databases"],
  },
  integration_map: {
    authorised_integrations: ["https://example.com/api"],
    tool_access: ["mcp://tool-server/tool-name"],
  },
  success_metrics: {
    primary_kpi: "accuracy",
    baseline: "95%",
    measurement_frequency: "daily",
    evidence_pack_config: { storage: "s3://bucket", retention_days: 365 },
  },
  failure_modes: {
    known_failure_modes: [
      { scenario: "API timeout", severity: "high", mitigation: "Retry" },
    ],
  },
  personas: [{ id: "persona-1", trust_level: "standard" }],
  runtime_observability: {},
};

/**
 * Build a minimal L1-valid WARRANT Intent Blueprint.
 * Pass `overrides` to deep-merge selective changes on top of the baseline.
 *
 * @param {object} [overrides] - Partial document to deep-merge over the baseline.
 * @returns {object} A fresh blueprint object.
 */
export function buildMinimalBlueprint(overrides) {
  return deepMerge(MINIMAL_BLUEPRINT, overrides);
}
