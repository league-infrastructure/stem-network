#!/usr/bin/env node
/**
 * Test script to create and list events via the CRUD API
 */

import { Client, TablesDB, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const endpoint = process.env.PUBLIC_APPWRITE_ENDPOINT || 'http://localhost:8080/v1';
const projectId = process.env.PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'stem_network_db';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const tables = new TablesDB(client);

async function testCRUD() {
  console.log('🧪 Testing Event CRUD Operations\n');
  
  let createdEventId;
  
  try {
    // CREATE
    console.log('1️⃣  Creating a test event...');
      const newEvent = await tables.createRow({
        databaseId,
        tableId: 'events',
        rowId: ID.unique(),
        data: {
        slug: 'test-event-' + Date.now(),
        title: 'Test Event',
        blurb: 'A test event created by the test script',
        event_date: new Date().toISOString(),
        start_time: '14:00',
        end_time: '16:00',
        capacity: 20,
        status: 'draft',
        registration_type: 'open'
      }
    });
    createdEventId = newEvent.$id;
    console.log(`✓ Created event: ${newEvent.$id} - ${newEvent.title}\n`);
    
    // READ - List
    console.log('2️⃣  Listing all events...');
      const allEvents = await tables.listRows({
        databaseId,
        tableId: 'events',
        queries: [Query.limit(10)]
      });
    console.log(`✓ Found ${allEvents.total} events\n`);
    
    // READ - Single
    console.log('3️⃣  Reading the created event...');
      const readEvent = await tables.getRow({
        databaseId,
        tableId: 'events',
        rowId: createdEventId
      });
    console.log(`✓ Read event: ${readEvent.title}`);
    console.log(`  Status: ${readEvent.status}`);
    console.log(`  Capacity: ${readEvent.capacity}\n`);
    
    // UPDATE
    console.log('4️⃣  Updating the event...');
      const updatedEvent = await tables.updateRow({
        databaseId,
        tableId: 'events',
        rowId: createdEventId,
        data: {
        title: 'Updated Test Event',
        status: 'published',
        capacity: 25
      }
    });
    console.log(`✓ Updated event: ${updatedEvent.title}`);
    console.log(`  New status: ${updatedEvent.status}`);
    console.log(`  New capacity: ${updatedEvent.capacity}\n`);
    
    // DELETE
    console.log('5️⃣  Deleting the test event...');
      await tables.deleteRow({
        databaseId,
        tableId: 'events',
        rowId: createdEventId
      });
    console.log(`✓ Deleted event: ${createdEventId}\n`);
    
    // Verify deletion
    console.log('6️⃣  Verifying deletion...');
    try {
      await tables.getRow({ databaseId, tableId: 'events', rowId: createdEventId });
      console.log('✗ Event still exists (unexpected)');
    } catch (err) {
      if (err.code === 404) {
        console.log('✓ Event successfully deleted\n');
      } else {
        throw err;
      }
    }
    
    console.log('✅ All CRUD operations completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CRUD test:', error.message);
    
    // Cleanup if event was created
    if (createdEventId) {
      try {
          await tables.deleteRow({ databaseId, tableId: 'events', rowId: createdEventId });
        console.log('🧹 Cleaned up test event');
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
    
    process.exit(1);
  }
}

testCRUD();
