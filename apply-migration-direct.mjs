#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://ipguxdssecfexudnvtia.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.hs1lPI8D8iW5kWOQHRXBAy8JdgmpegzJgWTnIjRz8Qw';

async function executeSql(sql) {
  console.log('Executing SQL...');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      query: sql
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SQL execution failed (${response.status}): ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function runMigration(filePath, name) {
  console.log(`\n📄 Running migration: ${name}`);
  console.log('=' .repeat(60));

  try {
    const sql = await readFile(filePath, 'utf8');

    // Execute the entire migration as one block
    const result = await executeSql(sql);

    console.log('✅ Migration applied successfully!');
    if (result) {
      console.log('Result:', result);
    }
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    return false;
  }
}

async function verifyResults() {
  console.log('\n📊 Verifying migration results...');
  console.log('=' .repeat(60));

  try {
    // Check triggers
    const triggers = await executeSql(`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name LIKE '%auto_create%folder%'
    `);

    console.log('\nTriggers found:', triggers);

    // Check folder counts
    const counts = await executeSql(`
      SELECT
        COUNT(*) as total_folders,
        COUNT(DISTINCT vehicle_id) as vehicles_with_folders,
        COUNT(CASE WHEN folder_type = 'vehicle_root' THEN 1 END) as root_folders
      FROM document_folders
    `);

    console.log('\nFolder statistics:', counts);

    // Check vehicles without folders
    const vehiclesWithoutFolders = await executeSql(`
      SELECT COUNT(*) as count
      FROM vehicles v
      LEFT JOIN document_folders df ON df.vehicle_id = v.id AND df.folder_type = 'vehicle_root'
      WHERE df.id IS NULL
    `);

    console.log('\nVehicles without folders:', vehiclesWithoutFolders);

  } catch (error) {
    console.error('Error verifying results:', error.message);
  }
}

async function main() {
  console.log('🚀 APPLYING DATABASE MIGRATIONS');
  console.log('=' .repeat(60));
  console.log('Target: ', SUPABASE_URL);
  console.log('=' .repeat(60));

  const migrations = [
    {
      file: join(__dirname, 'supabase', 'migrations', '20251202000001_auto_create_vehicle_folders_trigger.sql'),
      name: 'Vehicle Folder Triggers'
    },
    {
      file: join(__dirname, 'supabase', 'migrations', '20251202000002_auto_create_deal_folders_trigger.sql'),
      name: 'Deal Folder Triggers'
    },
    {
      file: join(__dirname, 'supabase', 'migrations', '20251202000003_backfill_vehicle_folders.sql'),
      name: 'Backfill Vehicle Folders'
    },
    {
      file: join(__dirname, 'supabase', 'migrations', '20251202000004_backfill_deal_folders.sql'),
      name: 'Backfill Deal Folders'
    }
  ];

  let allSuccess = true;

  for (const migration of migrations) {
    const success = await runMigration(migration.file, migration.name);
    if (!success) {
      allSuccess = false;
      console.log('\n⚠️  Migration failed. Continue anyway? (y/n)');
      // For now, continue
    }
  }

  await verifyResults();

  if (allSuccess) {
    console.log('\n✨ All migrations completed successfully!');
    console.log('🎉 Automatic folder creation is now ACTIVE!');
  } else {
    console.log('\n⚠️  Some migrations had errors. Please check the output above.');
  }
}

main().catch(console.error);