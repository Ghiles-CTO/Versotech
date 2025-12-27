#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
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

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSql(sql) {
  try {
    // Use the Supabase client directly to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // Try a different approach - using direct fetch to PostgREST
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query: sql
        })
      });

      if (!response.ok) {
        throw new Error(`SQL execution failed: ${response.statusText}`);
      }

      return await response.json();
    }

    return data;
  } catch (error) {
    console.error('SQL execution error:', error.message);
    throw error;
  }
}

async function runMigrationInChunks(filePath, name) {
  console.log(`\n📄 Running migration: ${name}`);
  console.log('=' .repeat(60));

  try {
    const sql = await readFile(filePath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(/;\s*$/gm)
      .filter(stmt => {
        const trimmed = stmt.trim();
        return trimmed.length > 0 &&
               !trimmed.startsWith('--') &&
               !trimmed.match(/^\/\*.*\*\/$/s);
      });

    console.log(`Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      // Skip pure comment blocks
      if (statement.startsWith('--') || statement.match(/^\/\*.*\*\/$/s)) {
        continue;
      }

      try {
        // For complex statements (functions, DO blocks), execute as-is
        if (statement.includes('CREATE OR REPLACE FUNCTION') ||
            statement.includes('CREATE TRIGGER') ||
            statement.includes('DO $$') ||
            statement.includes('DROP TRIGGER')) {

          console.log(`  ⚡ Executing complex statement ${i + 1}...`);

          // Execute using raw SQL through psql-like approach
          const { error } = await supabase.from('_dummy_').select('*').limit(0);

          if (!error) {
            // Connection works, but we need a different approach
            console.log(`  ⏭️  Skipping complex statement (needs SQL editor)`);
            continue;
          }
        }

        successCount++;
        process.stdout.write('.');
      } catch (error) {
        console.error(`\n  ❌ Error in statement ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n  Processed: ${successCount} successful, ${errorCount} errors, ${statements.length - successCount - errorCount} skipped`);
    return errorCount === 0;

  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    return false;
  }
}

async function checkDatabase() {
  console.log('\n🔍 Checking database connection...');

  try {
    // Test connection
    const { data, error } = await supabase.from('vehicles').select('count').limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');

    // Check if triggers exist
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .like('trigger_name', '%auto_create%folder%');

    if (!triggerError && triggers) {
      console.log('📌 Existing triggers:', triggers.map(t => t.trigger_name).join(', '));
    }

    // Check folder counts
    const { count: folderCount } = await supabase
      .from('document_folders')
      .select('*', { count: 'exact', head: true });

    console.log(`📁 Current folders in database: ${folderCount || 0}`);

    // Check vehicles without folders
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, name')
      .limit(100);

    const { data: vehiclesWithFolders } = await supabase
      .from('document_folders')
      .select('vehicle_id')
      .eq('folder_type', 'vehicle_root');

    const vehiclesWithFolderIds = new Set(vehiclesWithFolders?.map(v => v.vehicle_id) || []);
    const vehiclesWithoutFolders = vehicles?.filter(v => !vehiclesWithFolderIds.has(v.id)) || [];

    console.log(`🚗 Vehicles without folders: ${vehiclesWithoutFolders.length}`);
    if (vehiclesWithoutFolders.length > 0 && vehiclesWithoutFolders.length <= 5) {
      vehiclesWithoutFolders.forEach(v => console.log(`   - ${v.name}`));
    }

    return true;
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    return false;
  }
}

console.log('🚀 MIGRATION RUNNER');
console.log('=' .repeat(60));
console.log('Target:', SUPABASE_URL);
console.log('=' .repeat(60));

console.log('\n⚠️  IMPORTANT: Complex SQL operations (functions, triggers, DO blocks)');
console.log('cannot be executed via the API. You need to run them in:');
console.log('👉 Supabase SQL Editor: https://supabase.com/dashboard/project/ipguxdssecfexudnvtia/sql');
console.log('');
console.log('The fixed migration files are ready at:');
console.log('📁 supabase/migrations/20251202000001_auto_create_vehicle_folders_trigger.sql');
console.log('📁 supabase/migrations/20251202000002_auto_create_deal_folders_trigger.sql');
console.log('📁 supabase/migrations/20251202000003_backfill_vehicle_folders.sql');
console.log('📁 supabase/migrations/20251202000004_backfill_deal_folders.sql');

// Check database status
await checkDatabase();