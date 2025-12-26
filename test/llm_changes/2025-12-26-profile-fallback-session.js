#!/usr/bin/env node

import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script, createContext } from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const sourcePath = path.resolve(
  __dirname,
  '../../src/lib/server/appwrite.ts'
);

const source = readFileSync(sourcePath, 'utf8');

const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

const sandboxModule = { exports: {} };
const context = createContext({
  module: sandboxModule,
  exports: sandboxModule.exports,
  require,
  Buffer,
  console,
});

new Script(transpiled, { filename: sourcePath }).runInContext(context);

const { createServerClient, APPWRITE_FALLBACK_COOKIE } = sandboxModule.exports;

const fallbackCookie = 'a_session_example=secret; locale=en-US';
const encodedCookie = Buffer.from(fallbackCookie, 'utf-8').toString('base64');

const request = new Request('https://example.test/profile', {
  headers: {
    cookie: `${APPWRITE_FALLBACK_COOKIE}=${encodedCookie}`,
  },
});

const { client } = createServerClient({ request });

assert.equal(
  client.headers['X-Fallback-Cookies'],
  fallbackCookie,
  'Decoded fallback cookie should populate Appwrite header'
);

console.log('✅ createServerClient forwards fallback cookie header');
