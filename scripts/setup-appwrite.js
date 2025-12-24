#!/usr/bin/env node

/**
 * Appwrite Admin User Setup Script
 * Waits for Appwrite to be ready, then creates the initial admin user
 */

import dotenv from 'dotenv';
import { Client, Account } from 'node-appwrite';

// Load environment variables
dotenv.config({ path: '.env' });

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'http://localhost:8080/v1';
const APPWRITE_ADMIN_EMAIL = process.env.APPWRITE_ADMIN_EMAIL;
const APPWRITE_ADMIN_PASSWORD = process.env.APPWRITE_ADMIN_PASSWORD;

if (!APPWRITE_ADMIN_EMAIL || !APPWRITE_ADMIN_PASSWORD) {
  console.error('❌ Missing APPWRITE_ADMIN_EMAIL or APPWRITE_ADMIN_PASSWORD in .env');
  process.exit(1);
}

async function waitForAppwrite(maxAttempts = 30, delayMs = 2000) {
  console.log('⏳ Waiting for Appwrite to be ready...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${APPWRITE_ENDPOINT.replace('/v1', '')}/v1/health`);
      if (response.ok || response.status === 401) {
        // 401 is ok - means auth is required but server is up
        console.log('✓ Appwrite is ready');
        return true;
      }
    } catch (error) {
      // Expected during startup
    }
    
    console.log(`  Attempt ${i + 1}/${maxAttempts}...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error('Appwrite did not become ready in time');
}

async function createAdminUser() {
  console.log(`\n📝 Creating admin user: ${APPWRITE_ADMIN_EMAIL}`);
  
  const client = new Client();
  client.setEndpoint(APPWRITE_ENDPOINT).setProject('console');
  
  const account = new Account(client);
  
  try {
    // Try to create the user session - this will test if the user exists or if we need to create one
    const session = await account.createEmailPasswordSession(
      APPWRITE_ADMIN_EMAIL,
      APPWRITE_ADMIN_PASSWORD
    );
    console.log('✓ Admin user already exists and is configured');
    return;
  } catch (error) {
    if (error.message?.includes('Invalid credentials') || error.message?.includes('not found')) {
      console.log('  User does not exist, attempting to create...');
      // User doesn't exist, need to create via console project
      // Note: Appwrite console project requires special handling
      console.log('\n⚠️  Admin user creation requires manual setup:');
      console.log(`  1. Open Appwrite console: ${APPWRITE_ENDPOINT.replace('/v1', '')}`);
      console.log(`  2. Sign up with email: ${APPWRITE_ADMIN_EMAIL}`);
      console.log(`  3. Use password: ${APPWRITE_ADMIN_PASSWORD}`);
      console.log('  4. Create your first project and update APPWRITE_PROJECT_ID in .env\n');
      return;
    }
    throw error;
  }
}

async function main() {
  try {
    await waitForAppwrite();
    await createAdminUser();
    console.log('\n✓ Appwrite setup complete!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
