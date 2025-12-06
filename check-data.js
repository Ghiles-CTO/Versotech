const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ipguxdssecfexudnvtia.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.pTl2HtHIzLE6qI2WMbUnuMb13BRUZkQk7piYToXB4OI'
);

async function checkData() {
  console.log('=== Checking for data in tables ===\n');
  
  const { data: cci, error: e1, count: count1 } = await supabase
    .from('capital_call_items')
    .select('*', { count: 'exact', head: true });
  console.log(`Capital Call Items: ${count1} rows`);
  if (e1) console.log('Error:', e1);

  const { data: di, error: e2, count: count2 } = await supabase
    .from('distribution_items')
    .select('*', { count: 'exact', head: true });
  console.log(`Distribution Items: ${count2} rows`);
  if (e2) console.log('Error:', e2);

  const { data: cf, error: e3, count: count3 } = await supabase
    .from('cashflows')
    .select('*', { count: 'exact', head: true });
  console.log(`Cashflows: ${count3} rows`);
  if (e3) console.log('Error:', e3);

  console.log('\n=== Sample data from capital_call_items ===\n');
  const { data: cciData, error: e4 } = await supabase
    .from('capital_call_items')
    .select('*')
    .limit(2);
  console.log(JSON.stringify(cciData, null, 2));
  if (e4) console.log('Error:', e4);

  console.log('\n=== Sample data from distribution_items ===\n');
  const { data: diData, error: e5 } = await supabase
    .from('distribution_items')
    .select('*')
    .limit(2);
  console.log(JSON.stringify(diData, null, 2));
  if (e5) console.log('Error:', e5);

  console.log('\n=== Sample data from cashflows ===\n');
  const { data: cfData, error: e6 } = await supabase
    .from('cashflows')
    .select('*')
    .limit(2);
  console.log(JSON.stringify(cfData, null, 2));
  if (e6) console.log('Error:', e6);
}

checkData().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
