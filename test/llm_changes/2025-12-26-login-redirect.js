#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script, createContext } from 'node:vm';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.resolve(
  __dirname,
  '../../src/routes/login/+page.server.ts'
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

const mockEnv = {
  PUBLIC_APPWRITE_ENDPOINT: 'https://cloud.example.test/v1',
  PUBLIC_APPWRITE_PROJECT_ID: 'proj123',
};

const redirectCalls = [];

const context = createContext({
  module: sandboxModule,
  exports: sandboxModule.exports,
  require: (specifier) => {
    if (specifier === '@sveltejs/kit') {
      return {
        redirect: (status, location) => {
          const error = new Error('redirect');
          error.status = status;
          error.location = location;
          throw error;
        },
      };
    }
    if (specifier === '$env/static/public') {
      return mockEnv;
    }
    throw new Error(`Unexpected import: ${specifier}`);
  },
  URL,
  console,
});

new Script(transpiled, { filename: sourcePath }).runInContext(context);

const { load } = sandboxModule.exports;

const baseUrl = new URL('https://app.test/login');

try {
  await load({ url: baseUrl });
  assert.fail('Expected redirect to be thrown');
} catch (error) {
  assert.equal(error.status, 302, 'Redirect should use 302 status');
  assert.equal(
    error.location,
    'https://cloud.example.test/v1/account/sessions/oauth2/google?project=proj123&success=https%3A%2F%2Fapp.test%2Fprofile&failure=https%3A%2F%2Fapp.test%2Flogin%3Ffailure%3D1'
  );
}

const failureUrl = new URL('https://app.test/login?failure=1');
const failureResult = await load({ url: failureUrl });
assert.deepEqual(failureResult, { failed: true });

console.log('✅ login page redirects to Appwrite OAuth endpoint and exposes failure state');
