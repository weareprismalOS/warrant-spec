/**
 * Tests for the WARRANT Reference Validator (warrant-validator.js)
 *
 * Runs the standalone Validator against all 16 conformance test vectors
 * and verifies that results match the expected outcomes.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
    validateBlueprint,
    validateSchema,
    checkInvariant1,
    checkInvariant2,
    checkInvariant3,
    checkInvariant4,
    checkInvariant5,
} from "../warrant-validator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vectorDir = resolve(__dirname, "conformance-vectors");

function loadVector(name) {
    const raw = readFileSync(
        resolve(vectorDir, `${name}.warrant.json`),
        "utf-8",
    );
    return JSON.parse(raw);
}

const INVARIANT_CHECKERS = {
    "invariant-1": checkInvariant1,
    "invariant-2": checkInvariant2,
    "invariant-3": checkInvariant3,
    "invariant-4": checkInvariant4,
};

// ===========================================================================
// Validator module — API contract tests
// ===========================================================================

describe("WARRANT Reference Validator — API", () => {
    it("exports validateBlueprint as a function", () => {
        expect(typeof validateBlueprint).toBe("function");
    });

    it("exports validateSchema as a function", () => {
        expect(typeof validateSchema).toBe("function");
    });

    it("exports all 5 invariant check functions", () => {
        expect(typeof checkInvariant1).toBe("function");
        expect(typeof checkInvariant2).toBe("function");
        expect(typeof checkInvariant3).toBe("function");
        expect(typeof checkInvariant4).toBe("function");
        expect(typeof checkInvariant5).toBe("function");
    });

    it("returns a structured result from validateBlueprint", () => {
        const result = validateBlueprint({});
        expect(result).toHaveProperty("conformant");
        expect(result).toHaveProperty("schema");
        expect(result).toHaveProperty("invariants");
        expect(result).toHaveProperty("summary");
        expect(typeof result.conformant).toBe("boolean");
        expect(Array.isArray(result.invariants)).toBe(true);
        expect(result.invariants).toHaveLength(5);
    });
});

// ===========================================================================
// Conformance level vectors — Schema validation via Validator
// ===========================================================================

describe("WARRANT Reference Validator — Conformance Level Vectors", () => {
    for (const level of ["L1", "L2", "L3", "L4"]) {
        describe(`Level ${level} — valid vector`, () => {
            const vector = loadVector(`level-${level}-valid`);
            const bp = vector.blueprint;

            it("validateBlueprint reports schema PASS", () => {
                const result = validateBlueprint(bp);
                expect(result.schema.valid).toBe(true);
            });
        });

        describe(`Level ${level} — invalid vector`, () => {
            const vector = loadVector(`level-${level}-invalid`);
            const bp = vector.blueprint;

            it("validateBlueprint reports schema FAIL", () => {
                const result = validateBlueprint(bp);
                expect(result.schema.valid).toBe(false);
                expect(result.schema.errors.length).toBeGreaterThan(0);
            });

            it("validateBlueprint reports NON-CONFORMANT", () => {
                const result = validateBlueprint(bp);
                expect(result.conformant).toBe(false);
            });
        });
    }
});

// ===========================================================================
// Invariant vectors — Cross-pillar validation via Validator
// ===========================================================================

describe("WARRANT Reference Validator — Invariant Vectors", () => {
    for (let i = 1; i <= 4; i++) {
        const target = `invariant-${i}`;
        const checker = INVARIANT_CHECKERS[target];

        describe(`Invariant ${i} — valid vector`, () => {
            const vector = loadVector(`${target}-valid`);
            const bp = vector.blueprint;

            it("passes the invariant via standalone checker", () => {
                const result = checker(bp);
                expect(result.valid).toBe(true);
                expect(result.error).toBeNull();
            });

            it("passes the invariant within validateBlueprint", () => {
                const result = validateBlueprint(bp);
                const inv = result.invariants.find((r) => r.id === target);
                expect(inv.valid).toBe(true);
            });
        });

        describe(`Invariant ${i} — invalid vector`, () => {
            const vector = loadVector(`${target}-invalid`);
            const bp = vector.blueprint;

            it("fails the invariant via standalone checker", () => {
                const result = checker(bp);
                expect(result.valid).toBe(false);
                expect(result.error).not.toBeNull();
            });

            it("error matches expected_error from vector metadata", () => {
                const result = checker(bp);
                expect(result.error).toBe(vector._vector_metadata.expected_error);
            });

            it("validateBlueprint reports NON-CONFORMANT", () => {
                const result = validateBlueprint(bp);
                expect(result.conformant).toBe(false);
            });
        });
    }
});

// ===========================================================================
// Invariant 5 — Unit tests (no dedicated vector file yet)
// ===========================================================================

describe("WARRANT Reference Validator — Invariant 5 (Guardian Alerts ↔ KPIs)", () => {
    it("passes when no guardian_alerts exist", () => {
        const result = checkInvariant5({
            runtime_observability: {},
            success_metrics: { kpis: [{ metric_id: "accuracy" }] },
        });
        expect(result.valid).toBe(true);
    });

    it("passes when no kpis exist", () => {
        const result = checkInvariant5({
            runtime_observability: {
                guardian_alerts: [{ metric_ref: "accuracy", condition: "lt", threshold: 0.9, action: "alert" }],
            },
            success_metrics: {},
        });
        expect(result.valid).toBe(true);
    });

    it("passes when all metric_refs match kpi metric_ids", () => {
        const result = checkInvariant5({
            runtime_observability: {
                guardian_alerts: [
                    { metric_ref: "accuracy", condition: "lt", threshold: 0.9, action: "alert" },
                    { metric_ref: "latency", condition: "gt", threshold: 500, action: "pause" },
                ],
            },
            success_metrics: {
                kpis: [
                    { metric_id: "accuracy", target: "95%" },
                    { metric_id: "latency", target: "200ms" },
                ],
            },
        });
        expect(result.valid).toBe(true);
    });

    it("fails when a metric_ref has no matching kpi metric_id", () => {
        const result = checkInvariant5({
            runtime_observability: {
                guardian_alerts: [
                    { metric_ref: "nonexistent_metric", condition: "lt", threshold: 0.9, action: "alert" },
                ],
            },
            success_metrics: {
                kpis: [{ metric_id: "accuracy", target: "95%" }],
            },
        });
        expect(result.valid).toBe(false);
        expect(result.error).toContain("nonexistent_metric");
    });
});

// ===========================================================================
// Full conformance — combined schema + invariant test
// ===========================================================================

describe("WARRANT Reference Validator — Full Conformance", () => {
    it("reports CONFORMANT for a fully valid L2 blueprint", () => {
        const vector = loadVector("level-L2-valid");
        const result = validateBlueprint(vector.blueprint);
        expect(result.schema.valid).toBe(true);
        // All invariants should pass for well-formed vectors
        for (const inv of result.invariants) {
            expect(inv.valid).toBe(true);
        }
    });

    it("reports NON-CONFORMANT for an empty object", () => {
        const result = validateBlueprint({});
        expect(result.conformant).toBe(false);
        expect(result.schema.valid).toBe(false);
    });

    it("summary string contains CONFORMANT or NON-CONFORMANT", () => {
        const result = validateBlueprint({});
        expect(result.summary).toMatch(/CONFORMANT/);
    });
});
