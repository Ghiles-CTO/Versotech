const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ipguxdssecfexudnvtia.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.pTl2HtHIzLE6qI2WMbUnuMb13BRUZkQk7piYToXB4OI'
);

async function testRelationships() {
  console.log('=== Testing Capital Call -> Investor Link ===\n');
  
  const { data: ccItems, error: e1 } = await supabase
    .from('capital_call_items')
    .select('*, capital_calls(name), investors(company_name), subscriptions(commitment)')
    .limit(3);
  
  console.log('Capital Call Items (linking capital_calls to investors):');
  console.log(JSON.stringify(ccItems, null, 2));
  console.log('\n');

  console.log('=== Testing Distribution -> Investor Link ===\n');
  
  const { data: distItems, error: e2 } = await supabase
    .from('distribution_items')
    .select('*, distributions(name), investors(company_name), subscriptions(commitment)')
    .limit(3);
  
  console.log('Distribution Items (linking distributions to investors):');
  console.log(JSON.stringify(distItems, null, 2));
  console.log('\n');

  console.log('=== Testing Cashflows ===\n');
  
  const { data: cashflows, error: e3 } = await supabase
    .from('cashflows')
    .select('*, investors(company_name), vehicles(name)')
    .limit(5);
  
  console.log('Cashflows (direct investor link):');
  console.log(JSON.stringify(cashflows, null, 2));
  console.log('\n');

  console.log('=== Testing Report Requests ===\n');
  
  const { data: reports, error: e4 } = await supabase
    .from('report_requests')
    .select('*')
    .limit(3);
  
  console.log('Report Requests Schema:');
  console.log(JSON.stringify(reports, null, 2));
  console.log('\n');

  console.log('=== Testing Request Tickets ===\n');
  
  const { data: tickets, error: e5 } = await supabase
    .from('request_tickets')
    .select('*')
    .limit(3);
  
  console.log('Request Tickets Schema:');
  console.log(JSON.stringify(tickets, null, 2));
}

testRelationships().then(() => {
  console.log('\n=== Done ===');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
