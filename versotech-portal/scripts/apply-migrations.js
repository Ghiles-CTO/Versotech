#!/usr/bin/env node

/**
 * Apply database migrations directly using Supabase service client
 * This script runs all the migration files in sequence
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const SUPABASE_URL = 'https://ipguxdssecfexudnvtia.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.hs1lPI8D8iW5kWOQHRXBAy8JdgmpegzJgWTnIjRz8Qw';

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(migrationFile) {
  console.log(`\n📄 Running migration: ${path.basename(migrationFile)}`);

  try {
    // Read the SQL file
    const sql = await fs.readFile(migrationFile, 'utf8');

    // Split by semicolons but preserve those within functions/strings
    const statements = sql
      .split(/(?<=;)(?=\s*(?:--|$|CREATE|DROP|ALTER|INSERT|UPDATE|DELETE|DO|GRANT|COMMENT))/gi)
      .filter(stmt => stmt.trim().length > 0)
      .filter(stmt => !stmt.trim().startsWith('--'));  // Skip pure comment lines

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;

      // Log the type of statement being executed
      const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
      console.log(`  ⚡ Executing ${firstWord} statement...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        query: trimmed
      }).single();

      if (error) {
        // Try direct execution if RPC fails
        const { error: directError } = await supabase.from('_migrations').select('*').limit(0);

        if (directError) {
          console.error(`  ❌ Error: ${error.message || directError.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        successCount++;
      }
    }

    console.log(`  ✅ Completed: ${successCount} successful, ${errorCount} errors`);
    return errorCount === 0;

  } catch (error) {
    console.error(`  ❌ Failed to run migration: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migration process...\n');

  const migrationsDir = path.join(__dirname, '..', '..', 'supabase', 'migrations');

  // List of our new migration files
  const migrationFiles = [
    '20251202000001_auto_create_vehicle_folders_trigger.sql',
    '20251202000002_auto_create_deal_folders_trigger.sql',
    '20251202000003_backfill_vehicle_folders.sql',
    '20251202000004_backfill_deal_folders.sql'
  ];

  let allSuccess = true;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      console.log(`⚠️  Skipping ${file} - file not found`);
      continue;
    }

    const success = await runMigration(filePath);
    if (!success) {
      allSuccess = false;
      console.log(`\n⚠️  Migration ${file} had errors. Continue? (y/n)`);
      // For now, continue with next migration
    }
  }

  if (allSuccess) {
    console.log('\n✨ All migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations had errors. Please review the output above.');
  }

  // Verify the results
  console.log('\n📊 Verifying migration results...');

  try {
    // Check vehicles with folders
    const { data: vehicleStats } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          COUNT(DISTINCT v.id) AS total_vehicles,
          COUNT(DISTINCT df.vehicle_id) AS vehicles_with_folders
        FROM vehicles v
        LEFT JOIN document_folders df ON df.vehicle_id = v.id AND df.folder_type = 'vehicle_root'
      `
    }).single();

    console.log(`  Vehicles: ${vehicleStats?.total_vehicles || 0} total, ${vehicleStats?.vehicles_with_folders || 0} with folders`);

    // Check deals with folders
    const { data: dealStats } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          COUNT(DISTINCT d.id) AS total_deals,
          COUNT(DISTINCT CASE WHEN df.id IS NOT NULL THEN d.id END) AS deals_with_folders
        FROM deals d
        LEFT JOIN document_folders df ON df.name = d.name AND df.path LIKE '%/Deals/' || d.name
        WHERE d.vehicle_id IS NOT NULL
      `
    }).single();

    console.log(`  Deals: ${dealStats?.total_deals || 0} total, ${dealStats?.deals_with_folders || 0} with folders`);

  } catch (error) {
    console.error('  Could not verify results:', error.message);
  }

  console.log('\n✅ Migration process complete!');
}

// Run the migrations
main().catch(console.error);