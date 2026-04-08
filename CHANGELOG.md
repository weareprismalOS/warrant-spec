# Changelog

All notable changes to the WARRANT Open Standard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.11.0] - 2026-04-08

### Added

#### Specification
- IETF-style Internet-Draft: `draft-irimies-warrant-spec.md`
- 14-Pillar structure for Intent Blueprint
- Four conformance levels (L1: Structural, L2: Semantic, L3: Cryptographic, L4: Ledger-anchored)
- Five cross-Pillar validation invariants
- Lifecycle model for governance stages (draft → active → deprecated → archived)
- IPR disclosure and copyright notice (IETF Trust, BCP 78/79)

#### Schema
- JSON Schema draft-07 definition: `warrant-schema-v0.11.0.json`
- Complete 14-Pillar schema with required/optional fields
- Pattern properties for vendor extensions (`x-*`)
- Semantic versioning pattern for `warrant_version`
- ISO 8601 date-time format validation
- Enum constraints for status, conformance_level, etc.

#### Documentation
- WARRANT Thesis document explaining the governance gap and solution
- Technical Briefing for advisors and investors
- README with quick start guide
- CONTRIBUTING.md with contribution guidelines
- CODE_OF_CONDUCT.md

#### Tools
- Reference Validator implementation (`warrant-validator.js`)
  - Structural conformance via JSON Schema (AJV)
  - Computational conformance via cross-Pillar invariant enforcement
  - CLI and programmatic usage
  - Apache 2.0 licensed

#### Test Suite
- Comprehensive test suite with Vitest framework
- Conformance level tests (L1-L4)
- Cross-Pillar invariant tests (Invariants 1-5)
- Structural validation tests
- Schema metadata tests
- Lifecycle and kill-switch tests
- IETF submission readiness tests
- Version backward compatibility tests (v0.9.16, v0.10.0, v0.11.0)
- Property-based testing with fast-check
- 20+ test files covering all validation scenarios

#### Test Vectors
- Valid/invalid conformance vectors for each level (L1-L4)
- Valid/invalid invariant vectors (Invariants 1-5)
- `.warrant.json` file extension convention

#### Examples
- `sample-blueprint.json` - Complete L2 reference Intent Blueprint
- `minimal-agent.json` - Minimal example for a financial agent

### Repository Structure
```
├── spec/               # IETF-style specification drafts
├── schema/             # JSON Schema definitions
├── docs/               # Thesis and technical briefings
├── examples/           # Example Intent Blueprints
└── tools/              # Reference validator and test suite
    ├── warrant-validator.js
    ├── tests/
    └── package.json
```

### Technical Details
- Node.js ES modules (`"type": "module"`)
- Dependencies: AJV v8.x, AJV-formats v3.x, Vitest v3.x, fast-check v3.x
- Schema URI: `https://warrant.dev/schema/v0.11.0/warrant.schema.json`
- Specification expires: September 7, 2026 (per IETF 6-month draft policy)

### Authors
- Ciprian Irimies (prismalOS / prismalOS)
- Lucian Lungu (prismalOS / prismalOS)

### License
- Specification: Apache 2.0
- Code Components: Revised BSD License (as per IETF Trust Legal Provisions)
