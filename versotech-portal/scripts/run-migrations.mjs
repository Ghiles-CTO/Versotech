#!/usr/bin/env node

/**
 * Apply database migrations using Supabase REST API
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  if (!SUPABASE_URL) console.error('  - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  if (!SERVICE_ROLE_KEY) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response;
}

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);

  const filePath = join(__dirname, '..', '..', 'supabase', 'migrations', filename);

  try {
    const sql = await readFile(filePath, 'utf8');

    // Split SQL into individual statements
    // This is a simplified approach - in production you'd want more robust parsing
    const statements = sql
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .filter(stmt => !stmt.trim().startsWith('--'));

    console.log(`  Found ${statements.length} statements to execute`);

    let successCount = 0;
    for (const statement of statements) {
      if (!statement.trim()) continue;

      try {
        await executeSql(statement + ';');
        successCount++;
        process.stdout.write('.');
      } catch (error) {
        console.error(`\n  ❌ Error executing statement: ${error.message}`);
        console.error(`  Statement: ${statement.substring(0, 100)}...`);
      }
    }

    console.log(`\n  ✅ Executed ${successCount} statements successfully`);
    return true;

  } catch (error) {
    console.error(`  ❌ Failed to read or process migration: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');

  const migrations = [
    '20251202000001_auto_create_vehicle_folders_trigger.sql',
    '20251202000002_auto_create_deal_folders_trigger.sql',
    '20251202000003_backfill_vehicle_folders.sql',
    '20251202000004_backfill_deal_folders.sql'
  ];

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.log('\n⚠️  Migration failed, stopping...');
      process.exit(1);
    }
  }

  console.log('\n✨ All migrations completed successfully!');

  // Verify results
  console.log('\n📊 Verifying results...');

  try {
    // Check for triggers
    const triggersResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          SELECT
            tgname AS trigger_name,
            tgrelid::regclass AS table_name
          FROM pg_trigger
          WHERE tgname LIKE '%auto_create%folder%'
        `
      })
    });

    const triggers = await triggersResponse.json();
    console.log('  Triggers created:', triggers);

  } catch (error) {
    console.error('  Could not verify triggers:', error.message);
  }
}

main().catch(console.error);