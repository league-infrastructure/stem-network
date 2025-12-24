#!/usr/bin/env node

/**
 * Initialize Appwrite Database
 * Parses docs/data-model.mmd (Mermaid class diagram) and creates Appwrite collections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import { parse } from '@mermaid-js/parser';

// Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Load environment variables
const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'http://localhost:8080/v1';
const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
const apiKey = process.env.VITE_APPWRITE_API_KEY;
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || 'stem_network_db';

if (!projectId || !apiKey) {
  console.error('❌ Missing VITE_APPWRITE_PROJECT_ID or VITE_APPWRITE_API_KEY');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

/**
 * Parse Mermaid class diagram and extract class definitions
 */
function parseDataModel(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Use fallback regex-based parsing directly
  console.log('📝 Using regex-based parser for Mermaid diagram...');
  return parseDataModelFallback(content);
}

/**
 * Fallback parser using regex (in case Mermaid parser fails)
 */
function parseDataModelFallback(content) {
  const classes = {};
  const classRegex = /class\s+(\w+)\s*\{([^}]+)\}/g;
  
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    const attributesText = match[2];
    
    const attributes = attributesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.startsWith('+'))
      .map(line => {
        const parts = line.split(':').map(p => p.trim());
        const name = parts[0].substring(1); // Remove leading +
        const type = parts[1] || 'string';
        return { name, type };
      });
    
    classes[className] = {
      name: className,
      attributes
    };
  }
  
  return classes;
}

/**
 * Convert class name to collection ID (with pluralization)
 */
function getCollectionId(className) {
  // Special mappings for common cases
  const specialMappings = {
    'Event': 'events',
    'Person': 'people',
    'Metro': 'metros',
    'Venue': 'venues',
    'Partner': 'partners',
    'Flyer': 'flyers',
    'JobPosting': 'jobpostings',
    'EventPrototype': 'eventprototypes',
    'Tag': 'tags',
    'Registration': 'registrations',
    'RSVP': 'rsvps',
    'InstructorAssignment': 'instructorassignments',
    'InstructorEvaluation': 'instructorevaluations',
  };
  
  // Use special mapping if available, otherwise use lowercase
  return specialMappings[className] || className.toLowerCase();
}

/**
 * Map Mermaid types to Appwrite attribute types
 */
function mapAttributeType(mermaidType) {
  const typeMap = {
    'int': 'integer',
    'integer': 'integer',
    'string': 'string',
    'text': 'string',
    'richtext': 'string',
    'date': 'string', // Store as ISO string
    'time': 'string',
    'datetime': 'string',
    'decimal': 'float',
    'float': 'float',
    'boolean': 'boolean',
    'bool': 'boolean',
    'enum': 'enum', // Use proper enum type instead of string
    'media': 'string', // Store as file URL/ID
    'string[]': 'string', // Store as JSON array string
  };
  
  const normalized = (mermaidType || 'string').toLowerCase().trim();
  return typeMap[normalized] || 'string';
}

/**
 * Get enum values for known enums based on attribute name
 */
function getEnumValues(attrName) {
  // Common enum values based on attribute name
  const enumMap = {
    'status': ['draft', 'published', 'cancelled', 'completed', 'active', 'inactive'],
    'registration_type': ['open', 'account_required', 'walk_in_only'],
    'role': ['instructor', 'assistant', 'volunteer', 'mentor'],
    'employment_type': ['full_time', 'part_time', 'contract', 'volunteer'],
    'partner_type': ['school', 'nonprofit', 'corporate', 'government'],
    'background_check_status': ['pending', 'approved', 'denied', 'expired'],
    'volunteer_tier': ['beginner', 'intermediate', 'advanced', 'expert'],
    'registration_source': ['web', 'app', 'phone', 'in_person', 'email'],
    'relationship': ['parent', 'guardian', 'student', 'sibling'],
    'sex': ['male', 'female', 'other', 'prefer_not_to_say'],
  };
  
  return enumMap[attrName] || ['active', 'inactive'];
}

/**
 * Create or update database and collections
 */
async function initializeDatabase() {
  try {
    console.log(`🔧 Initializing database: ${databaseId}`);
    
    // Create database if it doesn't exist
    let database;
    try {
      database = await databases.get(databaseId);
      console.log(`✓ Database exists: ${databaseId}`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`📦 Creating database: ${databaseId}`);
        database = await databases.create(databaseId, databaseId);
        console.log(`✓ Database created`);
      } else {
        throw error;
      }
    }
    
    // Parse data model
    const dataModelPath = path.join(process.cwd(), 'docs/data-model.mmd');
    console.log(`\n📖 Parsing data model: ${dataModelPath}`);
    const classes = parseDataModel(dataModelPath);
    
    console.log(`✓ Found ${Object.keys(classes).length} classes\n`);
    
    // Delete existing collections to recreate with attributes
    console.log('\n🗑️  Cleaning up existing collections...');
    const existingCollections = await databases.listCollections(databaseId);
    for (const collection of existingCollections.collections) {
      try {
        await databases.deleteCollection(databaseId, collection.$id);
        console.log(`  ✓ Deleted collection: ${collection.$id}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to delete ${collection.$id}: ${error.message}`);
      }
    }
    
    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n📝 Creating collections with attributes...');
    
    // Create collections for each class
    for (const [className, classData] of Object.entries(classes)) {
      const collectionId = getCollectionId(className);
      
      try {
        console.log(`\n📦 Creating collection: ${collectionId}`);
        
        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          className
        );
        console.log(`✓ Collection created: ${collectionId}`);
        
        // Add attributes to the collection
        if (classData.attributes && classData.attributes.length > 0) {
          for (const attr of classData.attributes) {
            try {
              const attrType = mapAttributeType(attr.type);
              const attrId = attr.name.toLowerCase();
              
              // Use the appropriate Appwrite SDK method based on type
              if (attrType === 'integer') {
                await databases.createIntegerAttribute(databaseId, collectionId, attrId, false);
              } else if (attrType === 'float') {
                await databases.createFloatAttribute(databaseId, collectionId, attrId, false);
              } else if (attrType === 'boolean') {
                await databases.createBooleanAttribute(databaseId, collectionId, attrId, false);
              } else if (attrType === 'enum') {
                // Use proper enum type with values
                const enumValues = getEnumValues(attrId);
                await databases.createEnumAttribute(databaseId, collectionId, attrId, enumValues, false);
              } else {
                // Default to string for text, dates, etc.
                await databases.createStringAttribute(databaseId, collectionId, attrId, 255, false);
              }
              
              console.log(`  ✓ Added attribute: ${attrId} (${attr.type})`);
            } catch (attrError) {
              if (attrError.code === 409) {
                // Attribute already exists
                console.log(`  ℹ️  Attribute already exists: ${attr.name}`);
              } else {
                console.log(`  ⚠️  Failed to add attribute ${attr.name}: ${attrError.message}`);
              }
            }
          }
        }
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Collection already exists (retrying): ${collectionId}`);
          try {
            // Get the collection and add missing attributes
            const collection = await databases.getCollection(databaseId, collectionId);
            console.log(`✓ Collection exists: ${collectionId}`);
            
            if (classData.attributes && classData.attributes.length > 0) {
              for (const attr of classData.attributes) {
                try {
                  const attrType = mapAttributeType(attr.type);
                  const attrId = attr.name.toLowerCase();
                  
                  if (attrType === 'integer') {
                    await databases.createIntegerAttribute(databaseId, collectionId, attrId, false);
                  } else if (attrType === 'float') {
                    await databases.createFloatAttribute(databaseId, collectionId, attrId, false);
                  } else if (attrType === 'boolean') {
                    await databases.createBooleanAttribute(databaseId, collectionId, attrId, false);
                  } else if (attrType === 'enum') {
                    const enumValues = getEnumValues(attrId);
                    await databases.createEnumAttribute(databaseId, collectionId, attrId, enumValues, false);
                  } else {
                    await databases.createStringAttribute(databaseId, collectionId, attrId, 255, false);
                  }
                  
                  console.log(`  ✓ Added attribute: ${attrId} (${attr.type})`);
                  
                  // Add delay between attributes to allow Appwrite to process each one
                  await new Promise(resolve => setTimeout(resolve, 100));
                } catch (attrError) {
                  if (attrError.code !== 409) {
                    console.log(`  ⚠️  Failed to add attribute ${attr.name}: ${attrError.message}`);
                  }
                }
              }
            }
          } catch (retryError) {
            console.log(`⚠️  Failed to add attributes to ${collectionId}: ${retryError.message}`);
          }
        } else {
          console.log(`⚠️  Failed to create collection ${collectionId}: ${error.message}`);
          throw error;
        }
      }
    }
    
    console.log(`\n✓ Database initialization complete!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Visit Appwrite console at ${endpoint.replace('/v1', '')}`);
    console.log(`  2. Navigate to the ${databaseId} database`);
    console.log(`  3. Review and customize collection attributes as needed`);
    console.log(`  4. Run: npm run dev`);
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
