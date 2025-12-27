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
  } catch (e) {}
}

loadEnv(path.join(__dirname, '..', '..', '.env'));
loadEnv(path.join(__dirname, '..', '.env.local'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking for staff members in profiles table...\n');

async function checkStaff() {
  // Get all profiles and filter client-side
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,email,display_name,role`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.error('Response status:', response.status);
    const text = await response.text();
    console.error('Response:', text.substring(0, 200));
    throw new Error(`HTTP ${response.status}`);
  }

  let allProfiles = await response.json();

  // Filter for staff members
  const staff = allProfiles.filter(p => p.role && p.role.startsWith('staff_'));

  console.log(`📊 Total profiles: ${allProfiles.length}`);
  console.log(`👥 Staff members: ${staff.length}\n`);

  if (staff && staff.length > 0) {
    console.log(`✅ Found ${staff.length} staff member(s):\n`);
    staff.forEach(s => {
      console.log(`   👤 ${s.display_name || 'No name'}`);
      console.log(`      📧 ${s.email}`);
      console.log(`      🎭 ${s.role}`);
      console.log(`      🆔 ${s.id}\n`);
    });
    console.log('✅ Messaging should work!\n');
  } else {
    console.log('⚠️  No staff members found!\n');
    console.log('📋 To fix this, run this SQL in Supabase Dashboard:\n');
    console.log('```sql');
    console.log('-- First, find your user ID:');
    console.log('SELECT id, email FROM auth.users;');
    console.log('');
    console.log('-- Then create/update staff profile (replace YOUR_USER_ID):');
    console.log('INSERT INTO profiles (id, email, display_name, role)');
    console.log('VALUES (');
    console.log("  'YOUR_USER_ID',  -- from query above");
    console.log("  'julien@versotech.com',");
    console.log("  'Julien Machot',");
    console.log("  'staff_admin'");
    console.log(')');
    console.log('ON CONFLICT (id) DO UPDATE');
    console.log('SET role = EXCLUDED.role, display_name = EXCLUDED.display_name;');
    console.log('```\n');
  }
}

checkStaff().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
