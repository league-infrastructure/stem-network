#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const diagramPath = path.resolve(__dirname, '..', 'docs', 'data-model.mmd');
const outputPath = path.resolve(__dirname, '..', 'docs', 'schema.json');

const visibilityMap = {
  '+': 'public',
  '-': 'private',
  '#': 'protected',
  '~': 'package'
};

function parseClasses(text) {
  const classRegex = /class\s+([A-Za-z_][\w]*)\s*\{([\s\S]*?)\}/g;
  const classes = [];
  let match;

  while ((match = classRegex.exec(text)) !== null) {
    const [, name, body] = match;
    const attributes = [];

    for (const rawLine of body.split('\n')) {
      const line = rawLine.split('%%')[0].trim();
      if (!line) continue;

      const attributeMatch = line.match(/^([+#\-~])?\s*([A-Za-z_][\w]*)\s*:\s*(.+)$/);
      if (!attributeMatch) continue;

      const [, visibilitySymbol, attrName, attrTypeRaw] = attributeMatch;
      const attrType = attrTypeRaw.trim();

      attributes.push({
        name: attrName,
        type: attrType,
        visibility: visibilitySymbol ?? null,
        visibilityName: visibilitySymbol ? visibilityMap[visibilitySymbol] ?? null : null
      });
    }

    classes.push({ name, attributes });
  }

  return classes;
}

function parseRelationships(text) {
  const withoutClasses = text.replace(/class\s+[A-Za-z_][\w]*\s*\{[\s\S]*?\}\s*/g, '');
  const relationships = [];

  for (const rawLine of withoutClasses.split('\n')) {
    const line = rawLine.split('%%')[0].trim();
    if (!line || line.startsWith('classDiagram')) continue;

    const associationMatch = line.match(/^([A-Za-z_][\w]*)\s+"([^"]+)"\s+([^\s]+)\s+"([^"]+)"\s+([A-Za-z_][\w]*)\s*(?::\s*([A-Za-z_][\w-]*))?$/);
    if (associationMatch) {
      const [, source, sourceMultiplicity, connector, targetMultiplicity, target, label] = associationMatch;
      relationships.push({
        type: 'association',
        source,
        sourceMultiplicity,
        connector,
        targetMultiplicity,
        target,
        label: label ?? null
      });
      continue;
    }

    const inheritanceMatch = line.match(/^([A-Za-z_][\w]*)\s+([<|>.:\-]+)\s+([A-Za-z_][\w]*)$/);
    if (inheritanceMatch) {
      const [, parent, connector, child] = inheritanceMatch;
      relationships.push({
        type: 'inheritance',
        parent,
        child,
        connector
      });
    }
  }

  return relationships;
}

async function main() {
  const raw = await readFile(diagramPath, 'utf8');
  const normalized = raw.replace(/\r\n?/g, '\n');

  const classes = parseClasses(normalized);
  const relationships = parseRelationships(normalized);

  const schema = {
    classes,
    relationships
  };

  await writeFile(outputPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error('Failed to generate schema:', error);
  process.exitCode = 1;
});
