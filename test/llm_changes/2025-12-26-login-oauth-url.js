#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Script, createContext } from 'node:vm';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.resolve(__dirname, '../../src/lib/auth/oauth.ts');
const source = readFileSync(sourcePath, 'utf8');

const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

const moduleSandbox = { exports: {} };
const context = createContext({ module: moduleSandbox, exports: moduleSandbox.exports });

new Script(transpiled, { filename: sourcePath }).runInContext(context);

const { buildOAuthUrl } = moduleSandbox.exports;

assert.ok(typeof buildOAuthUrl === 'function', 'buildOAuthUrl should be exported');

const endpoint = 'https://cloud.example.test/v1/';
const projectId = 'project123';
const successUrl = 'https://app.test/profile';
const failureUrl = 'https://app.test/login?error=oauth';

const fullUrl = buildOAuthUrl({
  endpoint,
  projectId,
  provider: 'google',
  successUrl,
  failureUrl,
});

assert.equal(
  fullUrl,
  'https://cloud.example.test/v1/account/sessions/oauth2/google?project=project123&success_url=https%3A%2F%2Fapp.test%2Fprofile&failure_url=https%3A%2F%2Fapp.test%2Flogin%3Ferror%3Doauth',
  'OAuth URL should include success and failure callbacks'
);

const trimmedUrl = buildOAuthUrl({
  endpoint: 'https://cloud.example.test/v1///',
  projectId,
  provider: 'google',
  successUrl,
  failureUrl,
});

assert.equal(
  trimmedUrl,
  fullUrl,
  'Trailing slashes should not change the generated URL'
);

const withoutFailure = buildOAuthUrl({
  endpoint,
  projectId,
  provider: 'google',
  successUrl,
});

const parsedWithoutFailure = new URL(withoutFailure);
assert.ok(
  !parsedWithoutFailure.searchParams.has('failure_url'),
  'failure_url query parameter should be absent when not provided'
);

console.log('✅ buildOAuthUrl generates expected OAuth endpoints');
