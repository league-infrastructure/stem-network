#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseDataModel } from './lib/parse-mermaid.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const diagramPath = path.resolve(__dirname, '..', 'docs', 'data-model.mmd');
const outputPath = path.resolve(__dirname, '..', 'docs', 'schema.json');

async function main() {
  const raw = await readFile(diagramPath, 'utf8');
  const model = parseDataModel(raw);

  const schema = {
    classes: model.classes,
    relationships: model.relationships.map((rel) => ({
      type: rel.connector.includes('<|') || rel.connector.includes('|>') ? 'inheritance' : 'association',
      source: rel.source,
      sourceMultiplicity: rel.sourceMultiplicity || undefined,
      connector: rel.connector,
      targetMultiplicity: rel.targetMultiplicity || undefined,
      target: rel.target,
      label: rel.label,
      // For inheritance, also provide parent/child aliases
      ...(rel.connector.includes('<|') || rel.connector.includes('|>')
        ? { parent: rel.source, child: rel.target }
        : {}),
    })),
  };

  await writeFile(outputPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error('Failed to generate schema:', error);
  process.exitCode = 1;
});
