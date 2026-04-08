# WARRANT Conformance Test Vectors

## Purpose

This directory contains 16 reference test vectors for the WARRANT v0.10.0
specification. Independent implementers can use these vectors to verify that
their Validator produces correct results for known-valid and known-invalid
Intent Blueprints.

The suite covers:

- **Cross-Pillar invariants 1–4** (8 vectors: 4 valid + 4 invalid)
- **Conformance levels L1–L4** (8 vectors: 4 valid + 4 invalid)

## File Naming Convention

```
{target}-{valid|invalid}.warrant.json
```

Examples:

| File | Description |
|------|-------------|
| `invariant-1-valid.warrant.json` | Passes Invariant 1 (Integration ↔ Failure Modes) |
| `invariant-1-invalid.warrant.json` | Violates Invariant 1 |
| `level-L2-valid.warrant.json` | Passes L2 conformance validation |
| `level-L2-invalid.warrant.json` | Fails L2 conformance validation |

## Vector Format

Each file is a standalone JSON document with two top-level keys:

```json
{
  "_vector_metadata": {
    "vector_id": "invariant-1-valid",
    "target": "invariant-1",
    "target_description": "Integration ↔ Failure Modes",
    "expected_result": "valid",
    "expected_error": null,
    "warrant_version": "0.10.0",
    "notes": "All integrations have corresponding failure scenarios"
  },
  "blueprint": {
    // The actual WARRANT Intent Blueprint to validate
  }
}
```

### `_vector_metadata` Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `vector_id` | Yes | string | Unique identifier matching the filename stem |
| `target` | Yes | string | The invariant or conformance level under test. One of: `invariant-1`, `invariant-2`, `invariant-3`, `invariant-4`, `level-L1`, `level-L2`, `level-L3`, `level-L4` |
| `target_description` | Yes | string | Human-readable description of the target |
| `expected_result` | Yes | string | `"valid"` or `"invalid"` |
| `expected_error` | Yes | string or null | Expected error description for invalid vectors; `null` for valid vectors |
| `warrant_version` | Yes | string | WARRANT specification version (`"0.10.0"`) |
| `notes` | Yes | string | Additional context for implementers |

### `blueprint`

The `blueprint` value is the complete WARRANT Intent Blueprint document to
validate. It is the only input to your Validator - the `_vector_metadata`
wrapper is test harness metadata and is not part of the blueprint.

## Vector Inventory

### Invariant Vectors

| File | Invariant | Result | Description |
|------|-----------|--------|-------------|
| `invariant-1-valid.warrant.json` | 1: Integration ↔ Failure Modes | valid | All integrations have corresponding failure scenarios |
| `invariant-1-invalid.warrant.json` | 1: Integration ↔ Failure Modes | invalid | Integration without matching failure scenario |
| `invariant-2-valid.warrant.json` | 2: Financial Risk ≤ Budget | valid | Risk within budget |
| `invariant-2-invalid.warrant.json` | 2: Financial Risk ≤ Budget | invalid | Risk exceeds budget |
| `invariant-3-valid.warrant.json` | 3: Zero-Trust Persona Exclusion | valid | No zero-trust persona in approvers |
| `invariant-3-invalid.warrant.json` | 3: Zero-Trust Persona Exclusion | invalid | Zero-trust persona listed as approver |
| `invariant-4-valid.warrant.json` | 4: Boundary ↔ Integration Consistency | valid | No prohibited action conflicts |
| `invariant-4-invalid.warrant.json` | 4: Boundary ↔ Integration Consistency | invalid | Prohibited action conflicts with authorised integration |

### Conformance Level Vectors

| File | Level | Result | Description |
|------|-------|--------|-------------|
| `level-L1-valid.warrant.json` | L1 | valid | All 13 Pillars present with core Pillars populated |
| `level-L1-invalid.warrant.json` | L1 | invalid | Missing required Pillar |
| `level-L2-valid.warrant.json` | L2 | valid | L1 + active status + kill switch + all Pillars fully populated |
| `level-L2-invalid.warrant.json` | L2 | invalid | L2 declared but missing required field |
| `level-L3-valid.warrant.json` | L3 | valid | L2 + signature with placeholder values |
| `level-L3-invalid.warrant.json` | L3 | invalid | L3 declared but missing signature |
| `level-L4-valid.warrant.json` | L4 | valid | L3 + ledger anchor with placeholder values |
| `level-L4-invalid.warrant.json` | L4 | invalid | L4 declared but missing ledger anchor |

Note: L3/L4 vectors use placeholder signature and ledger values. These vectors
test structural validation, not cryptographic verification.

## How to Use

1. **Parse** the JSON file.
2. **Extract** the `blueprint` object (ignore `_vector_metadata`).
3. **Validate** the blueprint against the WARRANT v0.10.0 JSON Schema.
4. **For invariant vectors**, also run the cross-Pillar invariant check
   targeted by `_vector_metadata.target`:
   - Invariant 1: Every integration in `integration_map.authorised_integrations`
     has a corresponding failure scenario in `failure_modes.known_failure_modes`.
   - Invariant 2: `risk_profile.financial_risk_limit` does not exceed
     `feasibility.budget_limit` (same currency).
   - Invariant 3: No Persona with `trust_level: "zero"` appears in
     `stakeholders.approvers`.
   - Invariant 4: No `boundaries.prohibited_actions` entry conflicts with
     an authorised integration in `integration_map`.
5. **Compare** the result against `_vector_metadata.expected_result`
   (`"valid"` or `"invalid"`).
6. **For invalid vectors**, verify the error matches
   `_vector_metadata.expected_error`.

All vector files are independently parseable as standard JSON. No test harness,
build tools, or WARRANT repository dependencies are required.
