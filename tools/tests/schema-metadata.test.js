import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load raw schema JSON for metadata inspection
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '../WARRANT Intent Blueprint.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

describe('Schema metadata — $id, $schema, title, and license annotation', () => {
  it('$schema is http://json-schema.org/draft-07/schema#', () => {
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
  });

  it('$id is https://warrant.dev/schema/v0.11.0/warrant.schema.json', () => {
    expect(schema.$id).toBe('https://warrant.dev/schema/v0.11.0/warrant.schema.json');
  });

  it('description contains "CC BY 4.0" license annotation', () => {
    expect(schema.description).toContain('CC BY 4.0');
  });

  it('title is "WARRANT Intent Blueprint"', () => {
    expect(schema.title).toBe('WARRANT Intent Blueprint');
  });
});
