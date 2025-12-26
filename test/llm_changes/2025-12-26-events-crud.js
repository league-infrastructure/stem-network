#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminPath = path.resolve(__dirname, '../../src/lib/server/appwrite-admin.ts');
const listPagePath = path.resolve(__dirname, '../../src/routes/events/+page.server.ts');

const adminContents = readFileSync(adminPath, 'utf8');
const listContents = readFileSync(listPagePath, 'utf8');

assert.ok(
  adminContents.includes('export class AppwriteAdmin'),
  'Appwrite admin helper should export a class'
);

assert.ok(
  listContents.includes('new AppwriteAdmin'),
  'Events page should use the shared Appwrite admin helper'
);

assert.ok(
  listContents.includes("Query.orderDesc('event_date')"),
  'Events page should sort events by event_date'
);

assert.ok(
  listContents.includes('tables.listRows({'),
  'Events page should call TablesDB.listRows with the object-style signature'
);

console.log('✅ Events CRUD uses shared Appwrite admin helper');
