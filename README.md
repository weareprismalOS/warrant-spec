# WARRANT Open Standard

**Workload Authorization, Risk, and Runtime Accountability for Networked Tasks**

WARRANT is an open standard that defines a declarative JSON document - the **Intent Blueprint** - for establishing pre-deployment governance boundaries, permissions, and accountability requirements for autonomous AI agents.

## Overview

The WARRANT standard addresses a critical gap in AI governance: organizations deploying autonomous agents have no standardized way to declare what those systems are authorized to do. WARRANT provides a machine-readable governance contract that:

- **Validators** verify before agent deployment
- **Enforcement Engines** enforce at runtime
- **Auditors** use to verify compliance

## MCP Compatibility

WARRANT Intent Blueprints are fully compatible with the Model Context Protocol (MCP). Any MCP-compliant agent runtime or developer tool (VS Code, Kiro, Figma, etc.) can inject a WARRANT blueprint as a context extension without custom code.

## Repository Structure

```
├── spec/               # Specification documents (IETF-style drafts)
├── schema/             # JSON Schema definitions
├── docs/               # Thesis, technical briefings
├── examples/           # Example Intent Blueprints
└── tools/              # Reference validator and test suite
    ├── warrant-validator.js
    ├── tests/          # Comprehensive test suite
    └── package.json
```

## The 14 Pillars

WARRANT organizes governance intent across 14 Pillars:

1. **Manifest** - Administrative metadata
2. **Objective** - Goals and success criteria
3. **UX Logic** - User interaction patterns
4. **Feasibility** - Resource and capability assessment
5. **Stakeholders** - Human and system actors
6. **Compliance Frameworks** - Regulatory requirements
7. **Risk Profile** - Threat modeling and mitigations
8. **Data Model** - Data handling specifications
9. **Boundaries** - Operational limits and kill-switches
10. **Integration Map** - External service connections
11. **Success Metrics** - KPIs and measurement criteria
12. **Failure Modes** - Known failure scenarios
13. **Personas** - Agent behavior profiles
14. **Runtime Observability** - Monitoring and logging

## Conformance Levels

- **L1**: Structural completeness
- **L2**: Semantic validation
- **L3**: Cryptographic signing
- **L4**: Ledger-anchored governance

## Quick Start

### Validate an Intent Blueprint

```bash
cd tools
npm install
node warrant-validator.js ../examples/sample-blueprint.json
```

### Run Test Suite

```bash
cd tools
npm test
```

## License

This specification is licensed under Apache 2.0.

## Authors

- Ciprian Irimies (prismalOS / prismalOS)
- Lucian Lungu (prismalOS / prismalOS)

## Contact

- Email: business@pathmaven.pro
- Website: https://prismalOS.com
