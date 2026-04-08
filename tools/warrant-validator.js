/**
 * WARRANT Reference Validator v0.11.0
 *
 * A standalone, conformant Validator implementation for the WARRANT
 * Intent Blueprint standard (draft-irimies-warrant-intent-blueprint-00).
 *
 * Performs both:
 *   1. Structural conformance — JSON Schema draft-07 validation
 *   2. Computational conformance — Cross-Pillar invariant enforcement
 *
 * An Intent Blueprint must pass BOTH mechanisms to be considered conformant.
 *
 * Usage (programmatic):
 *   import { validateBlueprint } from './warrant-validator.js';
 *   const result = validateBlueprint(blueprintObject);
 *
 * Usage (CLI):
 *   node warrant-validator.js path/to/blueprint.warrant.json
 *
 * Licensed under CC BY 4.0, consistent with the WARRANT specification.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

// ---------------------------------------------------------------------------
// Schema loading
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "WARRANT Intent Blueprint.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// ---------------------------------------------------------------------------
// AJV instance
// ---------------------------------------------------------------------------
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const ajvValidate = ajv.compile(schema);

// ---------------------------------------------------------------------------
// Utility: extract URI from authorised_integrations item
// Per Section 3.3.7 — items may be plain URI strings or objects with .uri
// ---------------------------------------------------------------------------
function extractIntegrationUri(item) {
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null && typeof item.uri === "string")
    return item.uri;
  return null;
}

// ===========================================================================
// Phase 1: Structural Conformance (JSON Schema)
// ===========================================================================

/**
 * Validate a blueprint against the WARRANT v0.11.0 JSON Schema.
 * @param {object} blueprint - The Intent Blueprint document.
 * @returns {{ valid: boolean, errors: Array }}
 */
export function validateSchema(blueprint) {
  const valid = ajvValidate(blueprint);
  return {
    valid: !!valid,
    errors: ajvValidate.errors ? [...ajvValidate.errors] : [],
  };
}

// ===========================================================================
// Phase 2: Computational Conformance (Cross-Pillar Invariants)
// ===========================================================================

/**
 * Invariant 1: Integration ↔ Failure Modes (Section 12.2)
 *
 * Every integration declared in integration_map.authorised_integrations
 * and integration_map.tool_access SHALL have a corresponding failure
 * scenario in failure_modes.known_failure_modes.
 *
 * v0.11.0: Handles both plain URI strings and enriched objects in
 * authorised_integrations per Section 3.3.7.
 *
 * @param {object} bp - The Intent Blueprint document.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkInvariant1(bp) {
  // Collect all integration URIs
  const rawIntegrations = bp.integration_map?.authorised_integrations ?? [];
  const toolAccess = bp.integration_map?.tool_access ?? [];

  const integrationUris = rawIntegrations
    .map(extractIntegrationUri)
    .filter(Boolean);
  const allUris = [...integrationUris, ...toolAccess];

  // Collect all related_integration values from failure modes
  const failureModes = bp.failure_modes?.known_failure_modes ?? [];
  const covered = new Set(
    failureModes.map((fm) => fm.related_integration).filter(Boolean),
  );

  for (const uri of allUris) {
    if (!covered.has(uri)) {
      return {
        valid: false,
        error: `Integration '${uri}' in authorised_integrations has no corresponding entry in failure_modes.known_failure_modes with matching related_integration`,
      };
    }
  }
  return { valid: true, error: null };
}

/**
 * Invariant 2: Financial Risk ≤ Budget (Section 12.3)
 *
 * When both risk_profile.financial_risk_limit and feasibility.budget_limit
 * are present with matching currencies, the risk amount SHALL NOT exceed
 * the budget amount.
 *
 * @param {object} bp - The Intent Blueprint document.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkInvariant2(bp) {
  const riskLimit = bp.risk_profile?.financial_risk_limit;
  const budgetLimit = bp.feasibility?.budget_limit;

  // Invariant is trivially satisfied if either is absent
  if (!riskLimit || !budgetLimit) return { valid: true, error: null };

  // Only compare when currencies match
  if (riskLimit.currency && budgetLimit.currency) {
    if (riskLimit.currency !== budgetLimit.currency) {
      // Different currencies — invariant doesn't apply per spec
      // (same-currency comparison only)
      return { valid: true, error: null };
    }
  }

  if (riskLimit.amount > budgetLimit.amount) {
    return {
      valid: false,
      error: `risk_profile.financial_risk_limit.amount (${riskLimit.amount}) exceeds feasibility.budget_limit.amount (${budgetLimit.amount}) for currency ${budgetLimit.currency}`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Invariant 3: Zero-Trust Persona Exclusion (Section 12.4)
 *
 * No Persona with trust_level "zero" SHALL appear in
 * stakeholders.approvers.
 *
 * Matching: Each entry in stakeholders.approvers is matched against
 * personas[].id. If matching persona has trust_level "zero", the
 * invariant is violated.
 *
 * @param {object} bp - The Intent Blueprint document.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkInvariant3(bp) {
  const personas = bp.personas ?? [];
  const approvers = bp.stakeholders?.approvers ?? [];
  const approverSet = new Set(approvers);

  for (const persona of personas) {
    if (persona.trust_level === "zero" && approverSet.has(persona.id)) {
      return {
        valid: false,
        error: `Persona '${persona.id}' has trust_level 'zero' but appears in stakeholders.approvers`,
      };
    }
  }
  return { valid: true, error: null };
}

/**
 * Invariant 4: Boundary ↔ Integration Consistency (Section 12.5)
 *
 * No entry in boundaries.prohibited_actions SHALL conflict with an
 * entry in integration_map.authorised_integrations or tool_access.
 *
 * v0.11.0: Handles both plain URI strings and enriched objects in
 * authorised_integrations per Section 3.3.7. Extracts .uri from objects.
 *
 * @param {object} bp - The Intent Blueprint document.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkInvariant4(bp) {
  const prohibitedActions = bp.boundaries?.prohibited_actions ?? [];
  const rawIntegrations = bp.integration_map?.authorised_integrations ?? [];
  const toolAccess = bp.integration_map?.tool_access ?? [];

  // Extract URIs from both plain strings and enriched objects
  const integrationUris = rawIntegrations
    .map(extractIntegrationUri)
    .filter(Boolean);
  const allUris = [...integrationUris, ...toolAccess];

  for (const action of prohibitedActions) {
    const pattern = action.resource_pattern;
    if (!pattern) continue;

    let regex;
    try {
      regex = new RegExp(pattern);
    } catch {
      // If the pattern is not a valid regex, skip this action
      continue;
    }

    for (const uri of allUris) {
      if (regex.test(uri)) {
        return {
          valid: false,
          error: `Prohibited action pattern '${pattern}' matches authorised integration '${uri}'`,
        };
      }
    }
  }
  return { valid: true, error: null };
}

/**
 * Invariant 5: Success Metric ↔ Observability Consistency (Section 12.6)
 *
 * Every metric_ref in runtime_observability.guardian_alerts[] SHALL
 * match a metric_id in success_metrics.kpis[].
 *
 * Activation precondition: Both guardian_alerts and kpis must be
 * present and non-empty. When either is absent/empty, the invariant
 * does not apply.
 *
 * @param {object} bp - The Intent Blueprint document.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function checkInvariant5(bp) {
  const guardianAlerts =
    bp.runtime_observability?.guardian_alerts ?? [];
  const kpis = bp.success_metrics?.kpis ?? [];

  // Activation precondition: both arrays must be present and non-empty
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

// ---------------------------------------------------------------------------
// All invariant checkers
// ---------------------------------------------------------------------------
const INVARIANT_CHECKERS = [
  { id: "invariant-1", name: "Integration ↔ Failure Modes", check: checkInvariant1 },
  { id: "invariant-2", name: "Financial Risk ≤ Budget", check: checkInvariant2 },
  { id: "invariant-3", name: "Zero-Trust Persona Exclusion", check: checkInvariant3 },
  { id: "invariant-4", name: "Boundary ↔ Integration Consistency", check: checkInvariant4 },
  { id: "invariant-5", name: "Success Metric ↔ Observability", check: checkInvariant5 },
];

// ===========================================================================
// Combined Validator
// ===========================================================================

/**
 * Validate a WARRANT Intent Blueprint for full conformance.
 *
 * Performs both structural conformance (JSON Schema) and computational
 * conformance (cross-Pillar invariants). An Intent Blueprint must pass
 * BOTH mechanisms to be considered conformant.
 *
 * @param {object} blueprint - The Intent Blueprint document.
 * @returns {{
 *   conformant: boolean,
 *   schema: { valid: boolean, errors: Array },
 *   invariants: Array<{ id: string, name: string, valid: boolean, error: string|null }>,
 *   summary: string
 * }}
 */
export function validateBlueprint(blueprint) {
  // Phase 1: Structural conformance
  const schemaResult = validateSchema(blueprint);

  // Phase 2: Computational conformance
  const invariantResults = INVARIANT_CHECKERS.map(({ id, name, check }) => {
    const result = check(blueprint);
    return { id, name, valid: result.valid, error: result.error };
  });

  const allInvariantsPass = invariantResults.every((r) => r.valid);
  const conformant = schemaResult.valid && allInvariantsPass;

  // Build summary
  const schemaStatus = schemaResult.valid
    ? "PASS"
    : `FAIL (${schemaResult.errors.length} error(s))`;
  const invariantStatus = allInvariantsPass
    ? "PASS (5/5)"
    : `FAIL (${invariantResults.filter((r) => !r.valid).length} violation(s))`;

  const summary = conformant
    ? `CONFORMANT — Schema: ${schemaStatus}, Invariants: ${invariantStatus}`
    : `NON-CONFORMANT — Schema: ${schemaStatus}, Invariants: ${invariantStatus}`;

  return { conformant, schema: schemaResult, invariants: invariantResults, summary };
}

// ===========================================================================
// CLI Interface
// ===========================================================================

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("WARRANT Reference Validator v0.11.0");
    console.log(
      "Usage: node warrant-validator.js <blueprint.warrant.json> [--verbose]",
    );
    console.log("");
    console.log("Validates a WARRANT Intent Blueprint for full conformance:");
    console.log("  1. Structural conformance (JSON Schema draft-07)");
    console.log("  2. Computational conformance (5 Cross-Pillar Invariants)");
    process.exit(0);
  }

  const filePath = resolve(args[0]);
  const verbose = args.includes("--verbose");

  let rawContent;
  try {
    rawContent = readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`Error: Cannot read file '${filePath}': ${err.message}`);
    process.exit(2);
  }

  let doc;
  try {
    doc = JSON.parse(rawContent);
  } catch (err) {
    console.error(`Error: Invalid JSON in '${filePath}': ${err.message}`);
    process.exit(2);
  }

  // Handle test vector wrapper format
  const blueprint = doc.blueprint ?? doc;

  console.log("WARRANT Reference Validator v0.11.0");
  console.log("═".repeat(50));
  console.log(`File: ${filePath}`);
  console.log(
    `Declared version: ${blueprint.warrant_version ?? "(none)"}`,
  );
  console.log(
    `Declared level: ${blueprint.conformance_level ?? "(none)"}`,
  );
  console.log("");

  const result = validateBlueprint(blueprint);

  // Schema results
  console.log(`Schema Validation: ${result.schema.valid ? "✅ PASS" : "❌ FAIL"}`);
  if (!result.schema.valid && verbose) {
    for (const err of result.schema.errors.slice(0, 20)) {
      console.log(`  → ${err.instancePath || "/"}: ${err.message}`);
    }
    if (result.schema.errors.length > 20) {
      console.log(
        `  ... and ${result.schema.errors.length - 20} more error(s)`,
      );
    }
  }

  // Invariant results
  console.log("");
  console.log("Cross-Pillar Invariants:");
  for (const inv of result.invariants) {
    const icon = inv.valid ? "✅" : "❌";
    console.log(`  ${icon} ${inv.id}: ${inv.name}`);
    if (!inv.valid && inv.error) {
      console.log(`     → ${inv.error}`);
    }
  }

  // Overall result
  console.log("");
  console.log("═".repeat(50));
  console.log(
    result.conformant
      ? "✅ CONFORMANT — Blueprint passes all checks"
      : "❌ NON-CONFORMANT — Blueprint failed one or more checks",
  );

  process.exit(result.conformant ? 0 : 1);
}
