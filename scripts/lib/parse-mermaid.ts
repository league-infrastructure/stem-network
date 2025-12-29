/**
 * Shared Mermaid class diagram parser
 * Used by sync_db.ts and generate-schema.js
 */

export interface AttributeDefinition {
  name: string;
  type: string;
  visibility: string | null;
  visibilityName: string | null;
}

export interface ClassDefinition {
  name: string;
  attributes: AttributeDefinition[];
  onDelete: string | null;
}

export interface RelationshipDefinition {
  source: string;
  target: string;
  sourceMultiplicity: string;
  targetMultiplicity: string;
  label: string | null;
  connector: string;
}

export interface DataModel {
  classes: ClassDefinition[];
  relationships: RelationshipDefinition[];
}

const visibilityMap: Record<string, string> = {
  '+': 'public',
  '-': 'private',
  '#': 'protected',
  '~': 'package',
};

function parseAttributes(body: string): AttributeDefinition[] {
  const attributes: AttributeDefinition[] = [];
  const lines = body.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.split('%%')[0].trim();
    if (!line || line.startsWith('//')) continue;

    const attributeMatch = line.match(/^([+#\-~])?\s*([A-Za-z_][\w]*)\s*:\s*(.+)$/);
    if (!attributeMatch) continue;

    const [, visibilitySymbol, attrName, attrTypeRaw] = attributeMatch;
    attributes.push({
      name: attrName.trim(),
      type: attrTypeRaw.trim(),
      visibility: visibilitySymbol ?? null,
      visibilityName: visibilitySymbol ? visibilityMap[visibilitySymbol] ?? null : null,
    });
  }

  return attributes;
}

/**
 * Parse a Mermaid class diagram into a structured DataModel
 */
export function parseDataModel(content: string): DataModel {
  const normalized = content.replace(/\r\n?/g, '\n');

  // Match classes with optional onDelete annotation
  const classRegex = /(?:%%\s*onDelete:\s*(\w+)\s*\n\s*)?class\s+([A-Za-z_][\w]*)\s*\{([\s\S]*?)\}\s*/g;
  const classes: ClassDefinition[] = [];
  let match: RegExpExecArray | null;

  while ((match = classRegex.exec(normalized)) !== null) {
    const [, onDeleteRaw, className, body] = match;
    const attributes = parseAttributes(body);
    classes.push({
      name: className,
      attributes,
      onDelete: onDeleteRaw?.trim().toLowerCase() ?? null,
    });
  }

  // Remove class blocks to parse relationships
  const classBlockPattern = /(?:%%\s*onDelete:\s*\w+\s*\n\s*)?class\s+[A-Za-z_][\w]*\s*\{[\s\S]*?\}\s*/g;
  const withoutClasses = normalized.replace(classBlockPattern, '');

  const relationships: RelationshipDefinition[] = [];
  const lines = withoutClasses.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.split('%%')[0].trim();
    if (!line || line.startsWith('//') || line === 'classDiagram') continue;

    // Match association: ClassName "multiplicity" connector "multiplicity" ClassName : label
    const associationMatch = line.match(
      /^([A-Za-z_][\w]*)\s+"([^"]+)"\s+([^\s]+)\s+"([^"]+)"\s+([A-Za-z_][\w]*)\s*(?::\s*([A-Za-z_][\w-]*))?$/
    );

    if (associationMatch) {
      const [, source, sourceMultiplicity, connector, targetMultiplicity, target, label] = associationMatch;
      relationships.push({
        source,
        target,
        sourceMultiplicity,
        targetMultiplicity,
        connector,
        label: label ?? null,
      });
      continue;
    }

    // Match inheritance: ClassName connector ClassName
    const inheritanceMatch = line.match(/^([A-Za-z_][\w]*)\s+([<|>.:\-]+)\s+([A-Za-z_][\w]*)$/);
    if (inheritanceMatch) {
      const [, source, connector, target] = inheritanceMatch;
      relationships.push({
        source,
        target,
        sourceMultiplicity: '',
        targetMultiplicity: '',
        connector,
        label: null,
      });
    }
  }

  return { classes, relationships };
}
