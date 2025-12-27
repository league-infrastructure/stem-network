import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outputPath = path.resolve(repoRoot, 'docs', 'schema.json');

if (existsSync(outputPath)) {
  rmSync(outputPath);
}

execSync('node scripts/generate-schema.js', { cwd: repoRoot, stdio: 'inherit' });

const schema = JSON.parse(readFileSync(outputPath, 'utf8'));

assert.ok(Array.isArray(schema.classes), 'Classes array missing');
assert.ok(Array.isArray(schema.relationships), 'Relationships array missing');

const person = schema.classes.find((cls) => cls.name === 'Person');
assert.ok(person, 'Person class missing');
assert.ok(person.attributes.some((attr) => attr.name === 'first_name'), 'Person.first_name missing');

const event = schema.classes.find((cls) => cls.name === 'Event');
assert.ok(event, 'Event class missing');
assert.ok(event.attributes.some((attr) => attr.name === 'event_date'), 'Event.event_date missing');

const metroEvent = schema.relationships.find(
  (rel) => rel.type === 'association' && rel.source === 'Metro' && rel.target === 'Event'
);
assert.ok(metroEvent, 'Metro -> Event association missing');
assert.strictEqual(metroEvent.sourceMultiplicity, '1', 'Incorrect source multiplicity for Metro -> Event');
assert.strictEqual(metroEvent.targetMultiplicity, '0..*', 'Incorrect target multiplicity for Metro -> Event');

const inheritance = schema.relationships.find(
  (rel) => rel.type === 'inheritance' && rel.parent === 'Event' && rel.child === 'EventPrototype'
);
assert.ok(inheritance, 'EventPrototype inheritance missing');

console.log('Schema generation script verified.');
