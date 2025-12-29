#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import { Client, Databases, RelationshipType, RelationMutate, Models } from 'node-appwrite';
import { parseDataModel, DataModel } from './lib/parse-mermaid.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataModelPath = path.resolve(__dirname, '..', 'docs', 'data-model.mmd');
const schemaPath = path.resolve(__dirname, '..', 'docs', 'schema.json');

interface AttributePlan {
  name: string;
  type: 'string' | 'text' | 'integer' | 'float' | 'boolean' | 'enum' | 'datetime';
  required: boolean;
  size?: number;
  values?: string[];
  array?: boolean;
  originalType: string;
}

interface CollectionPlan {
  className: string;
  collectionId: string;
  onDelete: RelationMutate;
  attributes: AttributePlan[];
}

interface RelationshipPlan {
  attribute: string;
  collectionId: string;
  relatedCollectionId: string;
  relationshipType: RelationshipType;
  required: boolean;
  onDelete: RelationMutate;
  sourceClass: string;
  targetClass: string;
  sourceMultiplicity: string;
  targetMultiplicity: string;
}

export interface SyncPlan {
  collections: CollectionPlan[];
  relationships: RelationshipPlan[];
  warnings: string[];
}

const onDeleteDefault = RelationMutate.Restrict;

function normalizeOnDelete(value: string | null | undefined): RelationMutate {
  if (!value) return onDeleteDefault;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'cascade') return RelationMutate.Cascade;
  if (normalized === 'restrict') return RelationMutate.Restrict;
  if (normalized === 'setnull') return RelationMutate.SetNull;
  return onDeleteDefault;
}

const collectionMappings: Record<string, string> = {
  Event: 'events',
  Person: 'people',
  Metro: 'metros',
  Venue: 'venues',
  Partner: 'partners',
  Flyer: 'flyers',
  JobPosting: 'jobpostings',
  EventPrototype: 'eventprototypes',
  Tag: 'tags',
  Registration: 'registrations',
  RSVP: 'rsvps',
  InstructorAssignment: 'instructorassignments',
  InstructorEvaluation: 'instructorevaluations',
};

function getCollectionId(className: string): string {
  return collectionMappings[className] ?? className.toLowerCase();
}

function mapAttributeType(type: string): AttributePlan['type'] {
  const normalized = type.trim().toLowerCase();
  if (normalized.includes('int') && !normalized.includes('point')) return 'integer';
  if (normalized === 'decimal' || normalized === 'float') return 'float';
  if (normalized === 'boolean' || normalized === 'bool') return 'boolean';
  if (normalized === 'enum') return 'enum';
  // date, time, and datetime all map to Appwrite's datetime type
  if (normalized === 'date' || normalized === 'time' || normalized === 'datetime') return 'datetime';
  // text and richtext are long strings (65535 chars)
  if (normalized === 'text' || normalized === 'richtext') return 'text';
  return 'string';
}

const enumValues: Record<string, string[]> = {
  status: ['draft', 'published', 'cancelled', 'completed', 'active', 'inactive'],
  registration_type: ['open', 'account_required', 'walk_in_only'],
  role: ['instructor', 'assistant', 'volunteer', 'mentor'],
  employment_type: ['full_time', 'part_time', 'contract', 'volunteer'],
  partner_type: ['school', 'nonprofit', 'corporate', 'government'],
  background_check_status: ['pending', 'approved', 'denied', 'expired'],
  volunteer_tier: ['beginner', 'intermediate', 'advanced', 'expert'],
  registration_source: ['web', 'app', 'phone', 'in_person', 'email'],
  relationship: ['parent', 'guardian', 'student', 'sibling'],
  sex: ['male', 'female', 'other', 'prefer_not_to_say'],
};

function isRequiredMultiplicity(multiplicity: string): boolean {
  if (!multiplicity) return false;
  if (multiplicity.includes('0')) return false;
  return true;
}

function determineRelationshipType(
  sourceMultiplicity: string,
  targetMultiplicity: string
): RelationshipType | null {
  const sourceMany = sourceMultiplicity.includes('*');
  const targetMany = targetMultiplicity.includes('*');

  if (sourceMany && targetMany) {
    return null; // Many-to-many currently unsupported
  }

  if (targetMany) {
    return RelationshipType.ManyToOne;
  }

  return RelationshipType.OneToOne;
}

export function buildSyncPlan(model: DataModel): SyncPlan {
  const collections: CollectionPlan[] = model.classes.map((cls) => {
    const attributes: AttributePlan[] = cls.attributes.map((attr) => {
      const type = mapAttributeType(attr.type);
      const base: AttributePlan = {
        name: attr.name,
        type,
        required: false,
        originalType: attr.type,
      };

      // Set size for string types
      if (type === 'string') {
        base.size = 255;
      } else if (type === 'text') {
        base.size = 65535;
      }

      if (type === 'enum') {
        base.values = enumValues[attr.name.toLowerCase()] ?? [];
      }

      if (attr.type.trim().endsWith('[]')) {
        base.array = true;
      }

      return base;
    });

    return {
      className: cls.name,
      collectionId: getCollectionId(cls.name),
      onDelete: normalizeOnDelete(cls.onDelete),
      attributes,
    };
  });

  const classMap = new Map(model.classes.map((cls) => [cls.name, cls]));
  const warnings: string[] = [];
  const relationships: RelationshipPlan[] = [];

  for (const rel of model.relationships) {
    if (!rel.label) continue;
    if (!rel.connector.includes('--')) continue;

    const relationshipType = determineRelationshipType(rel.sourceMultiplicity, rel.targetMultiplicity);
    if (!relationshipType) {
      warnings.push(
        `Skipping many-to-many relationship between ${rel.source} and ${rel.target} (${rel.label}).`
      );
      continue;
    }

    const sourceClass = classMap.get(rel.source);
    const targetClass = classMap.get(rel.target);

    if (!sourceClass || !targetClass) {
      warnings.push(`Unknown classes in relationship ${rel.source} -> ${rel.target}`);
      continue;
    }

    const attribute = rel.label;
    const required = isRequiredMultiplicity(rel.sourceMultiplicity);

    relationships.push({
      attribute,
      collectionId: getCollectionId(rel.target),
      relatedCollectionId: getCollectionId(rel.source),
      relationshipType,
      required,
      onDelete: normalizeOnDelete(sourceClass.onDelete),
      sourceClass: rel.source,
      targetClass: rel.target,
      sourceMultiplicity: rel.sourceMultiplicity,
      targetMultiplicity: rel.targetMultiplicity,
    });
  }

  return { collections, relationships, warnings };
}

function getEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  dotenv.config({ path: envPath });

  const endpoint =
    process.env.PUBLIC_APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'http://localhost:8080/v1';
  const projectId =
    process.env.PUBLIC_APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY || process.env.VITE_APPWRITE_API_KEY;
  const databaseId =
    process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || 'stem_network_db';

  if (!projectId || !apiKey) {
    throw new Error('Missing Appwrite credentials. Set PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY in .env');
  }

  return { endpoint, projectId, apiKey, databaseId };
}

async function ensureDatabaseExists(databases: Databases, databaseId: string): Promise<boolean> {
  try {
    await databases.get(databaseId);
    console.log(`  📦 Database "${databaseId}" exists`);
    return false;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 404) {
      await databases.create(databaseId, databaseId);
      console.log(`  📦 Created database "${databaseId}"`);
      return true;
    } else {
      throw error;
    }
  }
}

async function ensureCollectionExists(
  databases: Databases,
  databaseId: string,
  collectionId: string,
  name: string
): Promise<boolean> {
  try {
    await databases.createCollection(databaseId, collectionId, name);
    console.log(`    ✨ Created collection "${collectionId}"`);
    return true;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 409) {
      console.log(`    📁 Collection "${collectionId}" exists`);
      return false;
    }
    throw error;
  }
}

type ExistingAttribute = Models.AttributeString | Models.AttributeInteger | Models.AttributeFloat | Models.AttributeBoolean | Models.AttributeEnum | Models.AttributeRelationship | Models.AttributeDatetime;

interface AttributeDiff {
  key: string;
  field: string;
  expected: string | number | boolean;
  actual: string | number | boolean;
}

async function getExistingAttributes(
  databases: Databases,
  databaseId: string,
  collectionId: string
): Promise<Map<string, ExistingAttribute>> {
  try {
    const result = await databases.listAttributes(databaseId, collectionId);
    const map = new Map<string, ExistingAttribute>();
    for (const attr of result.attributes) {
      map.set(attr.key, attr as ExistingAttribute);
    }
    return map;
  } catch (error: unknown) {
    // Collection might not exist yet
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 404) {
      return new Map();
    }
    throw error;
  }
}

function compareAttribute(planned: AttributePlan, existing: ExistingAttribute): AttributeDiff[] {
  const diffs: AttributeDiff[] = [];

  // Compare type
  // Note: both 'string' and 'text' in our schema map to 'string' in Appwrite
  const plannedAppwriteType = planned.type === 'text' ? 'string' : planned.type;
  if (existing.type !== plannedAppwriteType) {
    diffs.push({
      key: planned.name,
      field: 'type',
      expected: planned.type,
      actual: existing.type,
    });
  }

  // Compare size for string/text attributes
  if ((planned.type === 'string' || planned.type === 'text') && 'size' in existing) {
    const expectedSize = planned.size ?? (planned.type === 'text' ? 65535 : 255);
    if (existing.size !== expectedSize) {
      diffs.push({
        key: planned.name,
        field: 'size',
        expected: expectedSize,
        actual: existing.size,
      });
    }
  }

  // Compare enum values
  if (planned.type === 'enum' && 'elements' in existing && planned.values) {
    const existingValues = (existing as Models.AttributeEnum).elements ?? [];
    const plannedValues = planned.values;
    const missingValues = plannedValues.filter((v) => !existingValues.includes(v));
    const extraValues = existingValues.filter((v) => !plannedValues.includes(v));
    if (missingValues.length > 0 || extraValues.length > 0) {
      diffs.push({
        key: planned.name,
        field: 'enum values',
        expected: plannedValues.join(', '),
        actual: existingValues.join(', '),
      });
    }
  }

  return diffs;
}

async function deleteAttribute(
  databases: Databases,
  databaseId: string,
  collectionId: string,
  key: string
): Promise<void> {
  await databases.deleteAttribute(databaseId, collectionId, key);
  // Wait for deletion to complete
  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function createAttributeByType(
  databases: Databases,
  databaseId: string,
  collectionId: string,
  attribute: AttributePlan
): Promise<void> {
  const key = attribute.name;
  switch (attribute.type) {
    case 'integer':
      await databases.createIntegerAttribute(databaseId, collectionId, key, attribute.required);
      break;
    case 'float':
      await databases.createFloatAttribute(databaseId, collectionId, key, attribute.required);
      break;
    case 'boolean':
      await databases.createBooleanAttribute(databaseId, collectionId, key, attribute.required);
      break;
    case 'datetime':
      await databases.createDatetimeAttribute(databaseId, collectionId, key, attribute.required);
      break;
    case 'enum': {
      const values = attribute.values && attribute.values.length > 0 ? attribute.values : ['active', 'inactive'];
      await databases.createEnumAttribute(databaseId, collectionId, key, values, attribute.required);
      break;
    }
    case 'string': {
      const size = attribute.size ?? 255;
      await databases.createStringAttribute(databaseId, collectionId, key, size, attribute.required);
      break;
    }
    case 'text': {
      const size = attribute.size ?? 65535;
      await databases.createStringAttribute(databaseId, collectionId, key, size, attribute.required);
      break;
    }
  }
}

async function syncAttribute(
  databases: Databases,
  databaseId: string,
  collectionId: string,
  attribute: AttributePlan,
  existingAttributes: Map<string, ExistingAttribute>,
  migrate: boolean = false
): Promise<{ created: boolean; migrated: boolean; diffs: AttributeDiff[] }> {
  const key = attribute.name;
  const existing = existingAttributes.get(key);

  if (existing) {
    const diffs = compareAttribute(attribute, existing);
    if (diffs.length > 0) {
      if (migrate) {
        console.log(`      🔄 Migrating attribute "${key}"...`);
        for (const diff of diffs) {
          console.log(`         ${diff.field}: ${diff.actual} → ${diff.expected}`);
        }
        // Delete and recreate
        await deleteAttribute(databases, databaseId, collectionId, key);
        await createAttributeByType(databases, databaseId, collectionId, attribute);
        console.log(`      ✅ Migrated attribute "${key}"`);
        return { created: false, migrated: true, diffs };
      } else {
        console.log(`      ⚠️  Attribute "${key}" exists but differs:`);
        for (const diff of diffs) {
          console.log(`         ${diff.field}: expected ${diff.expected}, got ${diff.actual}`);
        }
        return { created: false, migrated: false, diffs };
      }
    }
    console.log(`      · Attribute "${key}" exists (matches)`);
    return { created: false, migrated: false, diffs: [] };
  }

  // Attribute doesn't exist, create it
  try {
    await createAttributeByType(databases, databaseId, collectionId, attribute);
    console.log(`      ✨ Created attribute "${key}" (${attribute.type})`);
    return { created: true, migrated: false, diffs: [] };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 409) {
      // Race condition - attribute was created between check and create
      console.log(`      · Attribute "${key}" exists`);
      return { created: false, migrated: false, diffs: [] };
    }
    throw error;
  }
}

async function createRelationship(
  databases: Databases,
  databaseId: string,
  plan: RelationshipPlan
): Promise<boolean> {
  try {
    await databases.createRelationshipAttribute(
      databaseId,
      plan.collectionId,
      plan.relatedCollectionId,
      plan.relationshipType,
      false,
      plan.attribute,
      undefined,
      plan.onDelete
    );
    console.log(`    ✨ Created relationship "${plan.attribute}" (${plan.collectionId} → ${plan.relatedCollectionId})`);
    return true;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 409) {
      console.log(`    · Relationship "${plan.attribute}" exists`);
      return false;
    }
    throw error;
  }
}

async function loadPlan(): Promise<SyncPlan> {
  console.log(`📖 Reading data model from ${dataModelPath}`);
  const fileContent = await readFile(dataModelPath, 'utf8');
  const model = parseDataModel(fileContent);
  console.log(`   Found ${model.classes.length} classes and ${model.relationships.length} relationships`);
  console.log('');
  return buildSyncPlan(model);
}

async function writeSchema(plan: SyncPlan): Promise<void> {
  const schema = {
    collections: plan.collections,
    relationships: plan.relationships,
    warnings: plan.warnings,
  };
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
  console.log(`📝 Schema written to ${schemaPath}`);
}

async function applyPlan(plan: SyncPlan, migrate: boolean = false): Promise<void> {
  const { endpoint, projectId, apiKey, databaseId } = getEnv();

  console.log(`🔗 Connecting to Appwrite at ${endpoint}`);
  console.log(`   Project: ${projectId}`);
  console.log(`   Database: ${databaseId}`);
  if (migrate) {
    console.log('   ⚠️  MIGRATE MODE: Will delete and recreate mismatched attributes (DATA LOSS)');
  }
  console.log('');

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  console.log('📦 Ensuring database exists...');
  await ensureDatabaseExists(databases, databaseId);
  console.log('');

  let collectionsCreated = 0;
  let attributesCreated = 0;
  let attributesMigrated = 0;
  let attributesWithDiffs = 0;
  let relationshipsCreated = 0;
  const allDiffs: { collection: string; diffs: AttributeDiff[] }[] = [];

  console.log(`📁 Syncing ${plan.collections.length} collections...`);
  for (const collection of plan.collections) {
    const created = await ensureCollectionExists(databases, databaseId, collection.collectionId, collection.className);
    if (created) collectionsCreated++;

    // Fetch existing attributes for comparison
    const existingAttributes = await getExistingAttributes(databases, databaseId, collection.collectionId);

    for (const attribute of collection.attributes) {
      const result = await syncAttribute(databases, databaseId, collection.collectionId, attribute, existingAttributes, migrate);
      if (result.created) attributesCreated++;
      if (result.migrated) attributesMigrated++;
      if (result.diffs.length > 0 && !result.migrated) {
        attributesWithDiffs++;
        allDiffs.push({ collection: collection.collectionId, diffs: result.diffs });
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  console.log('');

  if (plan.relationships.length > 0) {
    console.log(`🔗 Syncing ${plan.relationships.length} relationships...`);
    for (const relationship of plan.relationships) {
      const created = await createRelationship(databases, databaseId, relationship);
      if (created) relationshipsCreated++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log('');
  }

  console.log('📊 Summary:');
  console.log(`   Collections: ${collectionsCreated} created, ${plan.collections.length - collectionsCreated} already existed`);
  console.log(`   Attributes:  ${attributesCreated} created, ${attributesMigrated} migrated`);
  console.log(`   Relationships: ${relationshipsCreated} created, ${plan.relationships.length - relationshipsCreated} already existed`);

  if (attributesWithDiffs > 0) {
    console.log('');
    console.log(`⚠️  ${attributesWithDiffs} attribute(s) need migration (use --migrate to update, WARNING: data loss):`);
    for (const { collection, diffs } of allDiffs) {
      for (const diff of diffs) {
        console.log(`   • ${collection}.${diff.key}: ${diff.field} should be ${diff.expected}, is ${diff.actual}`);
      }
    }
  }
}

function isMainModule(): boolean {
  const currentUrl = pathToFileURL(process.argv[1] ?? '').href;
  return import.meta.url === currentUrl;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: npm run sync_db [-- [options]]

Options:
  --plan         Print the generated sync plan as JSON.
  --dry-run      Show planned collections and relationships without applying changes.
  --schema-only  Write schema.json only, do not sync to database.
  --migrate      Delete and recreate attributes that have type/size mismatches.
                 WARNING: This will cause data loss for affected attributes!
  --help         Show this help message.
`);
    return;
  }

  const plan = await loadPlan();

  // Always write the schema
  await writeSchema(plan);

  if (args.includes('--plan')) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (plan.warnings.length > 0) {
    for (const warning of plan.warnings) {
      console.warn(`⚠️  ${warning}`);
    }
  }

  if (args.includes('--schema-only')) {
    console.log('✅ Schema written (--schema-only mode, skipping database sync)');
    return;
  }

  if (args.includes('--dry-run')) {
    console.log('🔍 Dry run: planned collections and relationships');
    for (const collection of plan.collections) {
      console.log(`• Collection ${collection.collectionId} (${collection.className})`);
      for (const attribute of collection.attributes) {
        console.log(`   - Attribute ${attribute.name} [${attribute.type}]`);
      }
    }
    for (const relationship of plan.relationships) {
      console.log(
        `• Relationship ${relationship.attribute}: ${relationship.collectionId} -> ${relationship.relatedCollectionId} (${relationship.relationshipType}, onDelete=${relationship.onDelete})`
      );
    }
    return;
  }

  const migrate = args.includes('--migrate');
  await applyPlan(plan, migrate);
  console.log('✅ Database sync complete');
}

if (isMainModule()) {
  main().catch((error) => {
    console.error('❌ Failed to sync database:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
