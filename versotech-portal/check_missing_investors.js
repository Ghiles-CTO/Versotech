const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ipguxdssecfexudnvtia.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.pTl2HtHIzLE6qI2WMbUnuMb13BRUZkQk7piYToXB4OI'
);

async function main() {
  const runId = 'a0deed2c-c8ca-46c5-b5e1-46b9e0a74556';
  
  const staging = await supabase.from('stg_subscription_lines').select('investor_display_name, investor_entity, cash_amount').eq('run_id', runId);
  const investors = await supabase.from('investors').select('legal_name, display_name');
  
  function normalize(name) {
    return name ? name.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  }
  
  const dbInvestors = new Set();
  investors.data.forEach(i => {
    dbInvestors.add(normalize(i.legal_name));
    if (i.display_name) dbInvestors.add(normalize(i.display_name));
  });
  
  const missing = new Map();
  
  staging.data.forEach(row => {
    if (!row.cash_amount || row.cash_amount <= 0) return;
    
    const name = row.investor_display_name || row.investor_entity;
    if (!name) return;
    
    const norm = normalize(name);
    if (!dbInvestors.has(norm)) {
      if (!missing.has(name)) {
        missing.set(name, 0);
      }
      missing.set(name, missing.get(name) + row.cash_amount);
    }
  });
  
  console.log('Missing investors (name | total amount):');
  console.log('='.repeat(70));
  
  const sorted = Array.from(missing.entries()).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, amount]) => {
    console.log(`${name.padEnd(50)} | $${amount.toLocaleString()}`);
  });
  
  console.log('='.repeat(70));
  console.log(`Total missing: ${missing.size} investors`);
  console.log(`Total amount: $${sorted.reduce((sum, [_, amt]) => sum + amt, 0).toLocaleString()}`);
}

main().catch(console.error);
