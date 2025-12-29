#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const output = execSync('npx tsx scripts/sync_db.ts --plan', {
  cwd: repoRoot,
  stdio: 'pipe',
});

const plan = JSON.parse(output.toString());

assert.ok(Array.isArray(plan.collections), 'Expected collections array in plan output');
assert.ok(Array.isArray(plan.relationships), 'Expected relationships array in plan output');
assert.ok(Array.isArray(plan.warnings), 'Expected warnings array in plan output');

const registrationEvent = plan.relationships.find(
  (rel) => rel.collectionId === 'registrations' && rel.attribute === 'event'
);
assert.ok(registrationEvent, 'Registration should link to Event');
assert.equal(registrationEvent.relatedCollectionId, 'events');
assert.equal(registrationEvent.onDelete, 'restrict', 'Event deletes must be restricted');
assert.equal(registrationEvent.relationshipType, 'manyToOne');

const rsvpRegistration = plan.relationships.find(
  (rel) => rel.collectionId === 'rsvps' && rel.attribute === 'registration'
);
assert.ok(rsvpRegistration, 'RSVP should link to Registration');
assert.equal(rsvpRegistration.relatedCollectionId, 'registrations');
assert.equal(rsvpRegistration.onDelete, 'cascade', 'RSVP should cascade when registration disappears');

const personMetro = plan.relationships.find(
  (rel) => rel.collectionId === 'people' && rel.attribute === 'metro'
);
assert.ok(personMetro, 'Person should link to Metro');
assert.equal(personMetro.onDelete, 'restrict', 'Metro deletion must be restricted');

assert.ok(
  plan.warnings.some((warning) => warning.includes('Event') && warning.includes('Tag')),
  'Expected warning about Event <-> Tag many-to-many relationship'
);

console.log('Sync DB plan checks passed.');
