import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Load the Internet-Draft document
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const idPath = resolve(__dirname, '../WARRANT-ID-v0.11.0.md');
const idContent = readFileSync(idPath, 'utf-8');

// ---------------------------------------------------------------------------
// Requirement 1: Self-Contained Internet-Draft Document
// ---------------------------------------------------------------------------
describe('IETF Internet-Draft — Front Matter and Boilerplate', () => {
  // Req 1.1: Abstract section
  it('contains an Abstract section', () => {
    expect(idContent).toMatch(/^## Abstract/m);
  });

  // Req 1.2: Intended Status header (Experimental)
  it('contains Intended Status header declaring Experimental', () => {
    expect(idContent).toMatch(/Intended Status:\s*Experimental/);
  });

  // Req 1.3: Expires header with valid date
  it('contains an Expires header with a valid date', () => {
    const expiresMatch = idContent.match(/Expires:\s*(.+)/);
    expect(expiresMatch).not.toBeNull();
    // Verify the date string contains a recognisable month and year
    expect(expiresMatch[1]).toMatch(/\w+\s+\d{1,2},\s+\d{4}/);
  });

  // Req 1.4: Author section with actual author values
  it('contains Author section with actual author values', () => {
    expect(idContent).toContain('Ciprian Irimies');
    expect(idContent).toContain('Lucian Lungu');
    expect(idContent).toContain('prismalOS / prismalOS');
  });

  // Req 1.5: TLP copyright notice
  it('contains the IETF Trust Legal Provisions copyright notice', () => {
    expect(idContent).toContain('IETF Trust');
    expect(idContent).toMatch(/Copyright.*IETF Trust/);
    expect(idContent).toContain('BCP 78');
  });

  // Req 1.7: RFC 2119/8174 boilerplate in Introduction
  it('contains RFC 2119/8174 Requirements Language boilerplate', () => {
    expect(idContent).toMatch(/Requirements Language/);
    expect(idContent).toMatch(/BCP 14\s*\[RFC2119\]\s*\[RFC8174\]/);
    expect(idContent).toContain('MUST');
    expect(idContent).toContain('SHALL');
  });
});


// ---------------------------------------------------------------------------
// Requirement 2: Structured References Section
// ---------------------------------------------------------------------------
describe('IETF Internet-Draft — References Section', () => {
  // Req 2.1: Normative and Informative subsections
  it('has a References section with Normative and Informative subsections', () => {
    expect(idContent).toMatch(/^#+\s.*Normative References/m);
    expect(idContent).toMatch(/^#+\s.*Informative References/m);
  });

  // Req 2.2: RFC 2119 as Normative Reference
  it('lists RFC 2119 as a Normative Reference', () => {
    const normSection = extractSection(idContent, 'Normative References', 'Informative References');
    expect(normSection).toContain('[RFC2119]');
    expect(normSection).toMatch(/RFC 2119/);
  });

  // Req 2.3: RFC 8174 as Normative Reference
  it('lists RFC 8174 as a Normative Reference', () => {
    const normSection = extractSection(idContent, 'Normative References', 'Informative References');
    expect(normSection).toContain('[RFC8174]');
    expect(normSection).toMatch(/RFC 8174/);
  });

  // Req 2.4: RFC 8785 as Normative Reference
  it('lists RFC 8785 as a Normative Reference', () => {
    const normSection = extractSection(idContent, 'Normative References', 'Informative References');
    expect(normSection).toContain('[RFC8785]');
    expect(normSection).toMatch(/RFC 8785/);
  });

  // Req 2.5 + 2.6: CAIP-2 as Normative Reference with stability note
  it('lists CAIP-2 as a Normative Reference with stability note', () => {
    const normSection = extractSection(idContent, 'Normative References', 'Informative References');
    expect(normSection).toContain('[CAIP-2]');
    expect(normSection).toMatch(/Chain Agnostic Standards Alliance/i);
    expect(normSection).toMatch(/CASA/);
    expect(normSection).toMatch(/not an\s+IETF.published document/i);
  });

  // Req 2.7: RFC 6838 as Informative Reference
  it('lists RFC 6838 as an Informative Reference', () => {
    const infoSection = extractSection(idContent, 'Informative References', 'Appendix');
    expect(infoSection).toContain('[RFC6838]');
    expect(infoSection).toMatch(/RFC 6838/);
  });

  // Req 2.8: JSON Schema draft-07 as Informative Reference
  it('lists JSON Schema draft-07 as an Informative Reference', () => {
    const infoSection = extractSection(idContent, 'Informative References', 'Appendix');
    expect(infoSection).toMatch(/JSON.Schema/i);
    expect(infoSection).toMatch(/draft-07|draft-handrews-json-schema/i);
  });
});

// ---------------------------------------------------------------------------
// Requirement 3: IANA Considerations Section
// ---------------------------------------------------------------------------
describe('IETF Internet-Draft — IANA Considerations', () => {
  // Req 3.1: IANA Considerations section exists
  it('contains an IANA Considerations section', () => {
    expect(idContent).toMatch(/^#+\s.*IANA Considerations/m);
  });

  // Req 3.2: Proposed media type descriptions for Experimental status
  it('describes application/warrant+json as a proposed media type', () => {
    const ianaSection = extractSection(idContent, 'IANA Considerations', 'Licensing');
    expect(ianaSection).toMatch(/application\/warrant\+json/);
    expect(ianaSection).toMatch(/proposed|Standards Track/i);
  });

  it('describes application/warrant+yaml as informational', () => {
    const ianaSection = extractSection(idContent, 'IANA Considerations', 'Licensing');
    expect(ianaSection).toMatch(/application\/warrant\+yaml/);
    expect(ianaSection).toMatch(/informational|non-normative/i);
  });
});

// ---------------------------------------------------------------------------
// Requirement 4: Schema Governance
// ---------------------------------------------------------------------------
describe('IETF Internet-Draft — Schema Governance', () => {
  // Req 4.1: Schema Governance subsection within Security Considerations
  it('contains a Schema URI Governance subsection in Security Considerations', () => {
    const securitySection = extractSection(idContent, 'Security Considerations', 'Privacy Considerations');
    expect(securitySection).toMatch(/Schema.*URI.*Governance|Schema.*Governance/i);
  });
});

// ---------------------------------------------------------------------------
// Requirement 7: Document Consistency — Conventions and Definitions
// ---------------------------------------------------------------------------
describe('IETF Internet-Draft — Conventions and Definitions', () => {
  // Req 7.4: Conventions and Definitions section present
  it('contains a Conventions and Definitions section', () => {
    expect(idContent).toMatch(/^#+\s.*Conventions and Definitions/m);
  });
});

// ---------------------------------------------------------------------------
// Helper: extract text between two section headings
// ---------------------------------------------------------------------------
function extractSection(content, startHeading, endHeading) {
  const startRe = new RegExp(`^#+\\s.*${escapeRegex(startHeading)}`, 'm');
  const endRe = new RegExp(`^#+\\s.*${escapeRegex(endHeading)}`, 'm');

  const startMatch = startRe.exec(content);
  if (!startMatch) return '';

  const afterStart = content.slice(startMatch.index);
  const endMatch = endRe.exec(afterStart.slice(startMatch[0].length));
  if (!endMatch) return afterStart;

  return afterStart.slice(0, startMatch[0].length + endMatch.index);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
