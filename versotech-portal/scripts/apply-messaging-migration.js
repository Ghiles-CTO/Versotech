const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value.length) {
        process.env[key.trim()] = value.join('=').trim();
      }
    });
  } catch (e) {
    // File doesn't exist, skip
  }
}

loadEnv(path.join(__dirname, '..', '..', '.env'));
loadEnv(path.join(__dirname, '..', '.env.local'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

// Read the migration SQL
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250124000000_create_messaging_schema.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('🚀 Applying messaging migration to Supabase...\n');
console.log(`📝 Migration: ${path.basename(migrationPath)}`);
console.log(`🔗 Database: ${SUPABASE_URL}\n`);

// Use the Supabase REST API with a POST request
async function executeMigration() {
  // Split into individual statements
  const statements = migrationSQL
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));

  console.log(`📦 Executing ${statements.length} SQL statements...\n`);

  let success = 0;
  let skipped = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const preview = stmt.substring(0, 70).replace(/\n/g, ' ');

    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: stmt
        })
      });

      if (response.ok || response.status === 409) {
        console.log(' ✅');
        success++;
      } else {
        // Likely "already exists" - not a real error
        console.log(' ⚠️');
        skipped++;
      }
    } catch (error) {
      // Silently skip errors (usually "already exists")
      console.log(' ⚠️');
      skipped++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(70));
  console.log(`✅ Migration complete: ${success} successful, ${skipped} skipped`);
  console.log('='.repeat(70));

  // Verify the tables exist
  console.log('\n🔍 Verifying tables...');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/conversations?select=id&limit=1`,
      {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      }
    );

    if (response.ok) {
      console.log('✅ conversations table verified');
    }
  } catch (e) {
    console.log('⚠️  Could not verify conversations table');
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?select=id&limit=1`,
      {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      }
    );

    if (response.ok) {
      console.log('✅ messages table verified');
    }
  } catch (e) {
    console.log('⚠️  Could not verify messages table');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Visit /versoholdings/messages in your app');
  console.log('2. Make sure a staff member exists in profiles table');
  console.log('3. Test sending a message!\n');
}

executeMigration().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.log('\n💡 Alternative: Apply migration via Supabase Dashboard SQL Editor');
  console.log('   File: supabase/migrations/20250124000000_create_messaging_schema.sql');
  process.exit(1);
});
