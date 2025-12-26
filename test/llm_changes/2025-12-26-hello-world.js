#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagePath = path.resolve(__dirname, '../../src/routes/+page.svelte');
const contents = readFileSync(pagePath, 'utf8');

assert.ok(contents.includes('Hello, World!'), 'Root page should render Hello, World! heading');
assert.ok(
  contents.includes('Welcome to the minimal STEM Network app.'),
  'Root page should welcome users to the minimal app'
);

console.log('✅ Root page renders Hello World message');
