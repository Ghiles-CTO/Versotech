const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ipguxdssecfexudnvtia.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.pTl2HtHIzLE6qI2WMbUnuMb13BRUZkQk7piYToXB4OI'
);

async function runQueries() {
  // Query 1: Cashflows table schema
  console.log('=== 1. Cashflows Table Schema ===');
  const query1 = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'cashflows' AND table_schema = 'public' ORDER BY ordinal_position";
  
  const { data: d1, error: e1 } = await supabase.rpc('exec_sql', { sql: query1 });
  console.log(e1 ? JSON.stringify(e1) : JSON.stringify(d1, null, 2));

  // Query 2: Capital calls foreign keys
  console.log('\n=== 2. Capital Calls Foreign Keys ===');
  const query2 = `SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'capital_calls'`;

  const { data: d2, error: e2 } = await supabase.rpc('exec_sql', { sql: query2 });
  console.log(e2 ? JSON.stringify(e2) : JSON.stringify(d2, null, 2));

  // Query 3: Distributions foreign keys
  console.log('\n=== 3. Distributions Foreign Keys ===');
  const query3 = `SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'distributions'`;

  const { data: d3, error: e3 } = await supabase.rpc('exec_sql', { sql: query3 });
  console.log(e3 ? JSON.stringify(e3) : JSON.stringify(d3, null, 2));

  // Query 4: Views and functions related to capital calls
  console.log('\n=== 4. Capital Call Related Views/Functions ===');
  const query4 = "SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_schema = 'public' AND (routine_name LIKE '%capital%' OR routine_name LIKE '%investor%kpi%')";

  const { data: d4, error: e4 } = await supabase.rpc('exec_sql', { sql: query4 });
  console.log(e4 ? JSON.stringify(e4) : JSON.stringify(d4, null, 2));

  // Query 5: Report requests schema
  console.log('\n=== 5. Report Requests Table Schema ===');
  const query5 = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'report_requests' AND table_schema = 'public' ORDER BY ordinal_position";

  const { data: d5, error: e5 } = await supabase.rpc('exec_sql', { sql: query5 });
  console.log(e5 ? JSON.stringify(e5) : JSON.stringify(d5, null, 2));

  // Query 6: Request tickets schema
  console.log('\n=== 6. Request Tickets Table Schema ===');
  const query6 = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'request_tickets' AND table_schema = 'public' ORDER BY ordinal_position";

  const { data: d6, error: e6 } = await supabase.rpc('exec_sql', { sql: query6 });
  console.log(e6 ? JSON.stringify(e6) : JSON.stringify(d6, null, 2));

  // Query 7: Sample capital call with vehicle
  console.log('\n=== 7. Sample Capital Call with Vehicle ===');
  const { data: d7, error: e7 } = await supabase
    .from('capital_calls')
    .select('*, vehicles(name)')
    .limit(2);

  console.log(e7 ? JSON.stringify(e7) : JSON.stringify(d7, null, 2));

  // Query 8: Capital calls linked to investors via subscriptions
  console.log('\n=== 8. Capital Calls Linked to Investors via Subscriptions ===');
  const query8 = "SELECT cc.id as capital_call_id, cc.vehicle_id, cc.name as capital_call_name, s.investor_id, s.commitment FROM capital_calls cc JOIN subscriptions s ON s.vehicle_id = cc.vehicle_id LIMIT 5";

  const { data: d8, error: e8 } = await supabase.rpc('exec_sql', { sql: query8 });
  console.log(e8 ? JSON.stringify(e8) : JSON.stringify(d8, null, 2));

  // Additional query: Check capital_calls table structure
  console.log('\n=== 9. Capital Calls Table Schema ===');
  const query9 = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'capital_calls' AND table_schema = 'public' ORDER BY ordinal_position";

  const { data: d9, error: e9 } = await supabase.rpc('exec_sql', { sql: query9 });
  console.log(e9 ? JSON.stringify(e9) : JSON.stringify(d9, null, 2));

  // Additional query: Check distributions table structure
  console.log('\n=== 10. Distributions Table Schema ===');
  const query10 = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'distributions' AND table_schema = 'public' ORDER BY ordinal_position";

  const { data: d10, error: e10 } = await supabase.rpc('exec_sql', { sql: query10 });
  console.log(e10 ? JSON.stringify(e10) : JSON.stringify(d10, null, 2));
}

runQueries().then(() => {
  console.log('\n=== Query execution complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
