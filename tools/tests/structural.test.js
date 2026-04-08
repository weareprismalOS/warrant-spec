import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validate, buildMinimalBlueprint } from './helpers.js';

// Load raw schema for structural inspection
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '../WARRANT Intent Blueprint.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

describe('Schema structural correctness — v0.9.16 root-level Pillar paths', () => {
  // 1. ux_logic at root (Pillar 03) — lifted from intent.ux_logic
  it('defines root-level ux_logic', () => {
    const uxLogic = schema.properties.ux_logic;
    expect(uxLogic).toBeDefined();
    expect(uxLogic.type).toBe('object');
  });

  // 2. failure_modes at root (Pillar 12) — lifted from boundaries.failure_modes
  it('defines root-level failure_modes', () => {
    const failureModes = schema.properties.failure_modes;
    expect(failureModes).toBeDefined();
    expect(failureModes.type).toBe('object');
  });

  // 3. boundaries.scope_boundaries (Pillar 09) — unchanged, still in boundaries
  it('defines boundaries.properties.scope_boundaries', () => {
    const scopeBoundaries = schema.properties.boundaries.properties.scope_boundaries;
    expect(scopeBoundaries).toBeDefined();
    expect(scopeBoundaries.type).toBe('array');
  });

  // 4. data_model.data_access with items format "uri"
  it('defines data_model.properties.data_access with items format "uri"', () => {
    const dataAccess = schema.properties.data_model.properties.data_access;
    expect(dataAccess).toBeDefined();
    expect(dataAccess.type).toBe('array');
    expect(dataAccess.items.format).toBe('uri');
  });

  // 5. data_model.data_write with items format "uri"
  it('defines data_model.properties.data_write with items format "uri"', () => {
    const dataWrite = schema.properties.data_model.properties.data_write;
    expect(dataWrite).toBeDefined();
    expect(dataWrite.type).toBe('array');
    expect(dataWrite.items.format).toBe('uri');
  });

  // 6. data_model.data_forbidden with items format "uri"
  it('defines data_model.properties.data_forbidden with items format "uri"', () => {
    const dataForbidden = schema.properties.data_model.properties.data_forbidden;
    expect(dataForbidden).toBeDefined();
    expect(dataForbidden.type).toBe('array');
    expect(dataForbidden.items.format).toBe('uri');
  });

  // 7. integration_map.tool_access with items format "uri"
  it('defines integration_map.properties.tool_access with items format "uri"', () => {
    const toolAccess = schema.properties.integration_map.properties.tool_access;
    expect(toolAccess).toBeDefined();
    expect(toolAccess.type).toBe('array');
    expect(toolAccess.items.format).toBe('uri');
  });

  // 8. integration_map.tool_forbidden with items format "uri"
  it('defines integration_map.properties.tool_forbidden with items format "uri"', () => {
    const toolForbidden = schema.properties.integration_map.properties.tool_forbidden;
    expect(toolForbidden).toBeDefined();
    expect(toolForbidden.type).toBe('array');
    expect(toolForbidden.items.format).toBe('uri');
  });

  // 9. root agent_id as string
  it('defines root properties.agent_id as string', () => {
    const agentId = schema.properties.agent_id;
    expect(agentId).toBeDefined();
    expect(agentId.type).toBe('string');
  });

  // 10. root agent_name as string
  it('defines root properties.agent_name as string', () => {
    const agentName = schema.properties.agent_name;
    expect(agentName).toBeDefined();
    expect(agentName.type).toBe('string');
  });

  // 11. root conformance_level as enum ["L1","L2","L3","L4"]
  it('defines root properties.conformance_level as enum ["L1","L2","L3","L4"]', () => {
    const cl = schema.properties.conformance_level;
    expect(cl).toBeDefined();
    expect(cl.type).toBe('string');
    expect(cl.enum).toEqual(['L1', 'L2', 'L3', 'L4']);
  });

  // 12. feasibility.budget_limit as object
  it('defines feasibility.properties.budget_limit as object', () => {
    const budgetLimit = schema.properties.feasibility.properties.budget_limit;
    expect(budgetLimit).toBeDefined();
    expect(budgetLimit.type).toBe('object');
  });

  // 13. feasibility.compute_constraints as string
  it('defines feasibility.properties.compute_constraints as string', () => {
    const cc = schema.properties.feasibility.properties.compute_constraints;
    expect(cc).toBeDefined();
    expect(cc.type).toBe('string');
  });

  // 14. feasibility.hard_stops as array
  it('defines feasibility.properties.hard_stops as array', () => {
    const hs = schema.properties.feasibility.properties.hard_stops;
    expect(hs).toBeDefined();
    expect(hs.type).toBe('array');
  });

  // 15. Eliminated grouping objects are NOT in schema.properties
  it('does not define "intent" as a root-level property', () => {
    expect(schema.properties.intent).toBeUndefined();
  });

  it('does not define "permissions" as a root-level property', () => {
    expect(schema.properties.permissions).toBeUndefined();
  });

  it('does not define "compliance" as a root-level property', () => {
    expect(schema.properties.compliance).toBeUndefined();
  });

  // 16. boundaries only contains prohibited_actions, scope_boundaries, kill_switch
  it('boundaries only contains prohibited_actions, scope_boundaries, and kill_switch', () => {
    const boundaryProps = Object.keys(schema.properties.boundaries.properties);
    expect(boundaryProps).toContain('prohibited_actions');
    expect(boundaryProps).toContain('scope_boundaries');
    expect(boundaryProps).toContain('kill_switch');
    expect(boundaryProps).not.toContain('hitl_triggers');
    expect(boundaryProps).not.toContain('failure_modes');
    expect(boundaryProps).toHaveLength(3);
  });

  // 17. A document with all v0.9.16 properties populated validates successfully
  it('validates a document with all v0.9.16 properties populated', () => {
    const doc = buildMinimalBlueprint({
      agent_id: 'did:example:agent-123',
      agent_name: 'Test Agent',
      conformance_level: 'L1',
      ux_logic: {
        interaction_model: 'approve',
        user_facing: true,
        tone_and_voice: 'professional',
        edge_case_handling: 'escalate to human',
        failure_ux: 'Notify user with error summary',
      },
      data_model: {
        data_sources: ['https://example.com/source'],
        data_access: ['https://example.com/data'],
        data_write: ['https://example.com/write'],
        data_forbidden: ['https://example.com/forbidden'],
      },
      integration_map: {
        authorised_integrations: ['https://example.com/api'],
        tool_access: ['https://example.com/tool'],
        tool_forbidden: ['https://example.com/tool-forbidden'],
      },
      feasibility: {
        budget_limit: { amount: 5000, currency: 'EUR', time_period: 'quarterly' },
        compute_constraints: 'max 8 vCPU',
        timeline: 'Q4 2025',
        dependencies: ['external-api-v3'],
        hard_stops: ['budget exhausted', 'compliance violation'],
      },
      risk_profile: {
        hitl_triggers: [
          { metric: 'error_rate', threshold: 0.5, operator: 'gt', action: 'pause_and_verify' },
        ],
        on_failure: {
          default: 'escalate',
          escalation_path: ['did:example:escalation-contact'],
        },
      },
      boundaries: {
        kill_switch: { type: 'api_endpoint', uri: 'https://example.com/kill' },
        scope_boundaries: ['No production DB access', 'No PII modification'],
      },
      failure_modes: {
        known_failure_modes: [
          { scenario: 'API timeout', severity: 'high', mitigation: 'Retry with backoff' },
        ],
        assumption_risks: ['Assumes 99.9% uptime'],
        external_dependencies_risk: ['Rate limiting'],
        edge_cases: ['Empty response'],
        on_failure: {
          default: 'halt',
        },
      },
    });

    const result = validate(doc);
    expect(result.valid).toBe(true);
  });
});
