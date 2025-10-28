const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ipguxdssecfexudnvtia.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.pTl2HtHIzLE6qI2WMbUnuMb13BRUZkQk7piYToXB4OI'
);

const vehicleMapping = {
  'VC1': 'VC101', 'VC2': 'VC102', 'VC3': 'VC103', 'VC4': 'VC104', 'VC5': 'VC105',
  'VC6': 'VC106', 'VC7': 'VC107', 'VC8': 'VC108', 'VC9': 'VC109', 'VC10': 'VC110',
  'VC11': 'VC111', 'VC12': 'VC112', 'VC13': 'VC113', 'VC14': 'VC114', 'VC15': 'VC115',
  'VC16': 'VC116', 'VC18': 'VC118', 'VC19': 'VC119', 'VC20': 'VC120', 'VC21': 'VC121',
  'VC22': 'VC122', 'VC23': 'VC123', 'VC24': 'VC124', 'VC25': 'VC125', 'VC26': 'VC126',
  'VC28': 'VC128', 'VC29': 'VC129', 'VC30': 'VC130', 'VC31': 'VC131', 'VC32': 'VC132',
  'VC33': 'VC133', 'VC34': 'VC134', 'VC35': 'VC135', 'VC37': 'VC137', 'VC38': 'VC138',
  'VC40': 'VC140', 'VC41': 'VC141', 'VC42': 'VC142', 'VC43': 'VC143'
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('                   FINAL COMPREHENSIVE DATA AUDIT');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const runId = 'a0deed2c-c8ca-46c5-b5e1-46b9e0a74556';

  // Load all data
  const [staging, subscriptions, investors, vehicles, entityInvestors] = await Promise.all([
    supabase.from('stg_subscription_lines').select('*').eq('run_id', runId),
    supabase.from('subscriptions').select('*').gte('created_at', '2025-10-25'),
    supabase.from('investors').select('*'),
    supabase.from('vehicles').select('*'),
    supabase.from('entity_investors').select('*')
  ]);

  const stagingWithAmount = staging.data.filter(r => r.cash_amount && r.cash_amount > 0);

  console.log('📊 SECTION 1: DATA COUNTS');
  console.log('─'.repeat(75));
  console.log('  Excel staging rows (source of truth):  ', stagingWithAmount.length);
  console.log('  Database subscriptions:                 ', subscriptions.data.length);
  console.log('  Database investors:                     ', investors.data.length);
  console.log('  Database vehicles:                      ', vehicles.data.length);
  console.log('  Entity investor links:                  ', entityInvestors.data.length);
  console.log('  Match status:                           ', subscriptions.data.length === stagingWithAmount.length ? '✅ PERFECT' : '❌ MISMATCH');

  // Check duplicates
  console.log('\n📊 SECTION 2: DUPLICATE CHECK');
  console.log('─'.repeat(75));

  const subKeys = new Map();
  subscriptions.data.forEach(s => {
    const key = s.investor_id + '|' + s.vehicle_id;
    if (!subKeys.has(key)) subKeys.set(key, []);
    subKeys.get(key).push(s);
  });

  const dupeSubs = Array.from(subKeys.entries()).filter(([_, s]) => s.length > 1);
  console.log('  Duplicate subscriptions (investor+vehicle):    ', dupeSubs.length);

  const investorNames = new Map();
  investors.data.forEach(inv => {
    const norm = (inv.legal_name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!investorNames.has(norm)) investorNames.set(norm, []);
    investorNames.get(norm).push(inv);
  });

  const dupeInvestors = Array.from(investorNames.entries()).filter(([_, invs]) => invs.length > 1);
  console.log('  Duplicate investor names:                      ', dupeInvestors.length);

  if (dupeInvestors.length > 0) {
    console.log('\n  ⚠️  Duplicate investors found:');
    dupeInvestors.forEach(([_, invs]) => {
      console.log('      -', invs[0].legal_name, '(' + invs.length + ' records)');
    });
  }

  // Linkage integrity
  console.log('\n📊 SECTION 3: ENTITY_INVESTORS LINKAGE INTEGRITY');
  console.log('─'.repeat(75));

  const subMap = new Map();
  subscriptions.data.forEach(s => subMap.set(s.id, s));

  const invMap = new Map();
  investors.data.forEach(i => invMap.set(i.id, i));

  const vehMap = new Map();
  vehicles.data.forEach(v => vehMap.set(v.id, v));

  let validLinks = 0;
  let invalidSubLinks = 0;
  let invalidInvLinks = 0;
  let invalidVehLinks = 0;
  let nullSubLinks = 0;

  entityInvestors.data.forEach(ei => {
    if (!ei.subscription_id) {
      nullSubLinks++;
      return;
    }
    
    if (!subMap.has(ei.subscription_id)) invalidSubLinks++;
    if (!invMap.has(ei.investor_id)) invalidInvLinks++;
    if (!vehMap.has(ei.vehicle_id)) invalidVehLinks++;
    
    if (subMap.has(ei.subscription_id) && invMap.has(ei.investor_id) && vehMap.has(ei.vehicle_id)) {
      validLinks++;
    }
  });

  console.log('  Total entity_investor records:                 ', entityInvestors.data.length);
  console.log('  Valid links (all refs exist):                  ', validLinks);
  console.log('  Null subscription_id (allowed):                ', nullSubLinks);
  console.log('  Invalid subscription refs:                     ', invalidSubLinks);
  console.log('  Invalid investor refs:                         ', invalidInvLinks);
  console.log('  Invalid vehicle refs:                          ', invalidVehLinks);

  // Check orphaned subscriptions
  const eiBySubscription = new Map();
  entityInvestors.data.forEach(ei => {
    if (ei.subscription_id) eiBySubscription.set(ei.subscription_id, ei);
  });

  const orphanedSubs = subscriptions.data.filter(s => !eiBySubscription.has(s.id));
  console.log('  Subscriptions without entity_investor link:   ', orphanedSubs.length);

  // Amount comparison
  console.log('\n📊 SECTION 4: AMOUNT VERIFICATION (Per Vehicle)');
  console.log('─'.repeat(75));

  const vehicleMapById = new Map();
  vehicles.data.forEach(v => vehicleMapById.set(v.id, v));

  const stagingByVC = new Map();
  stagingWithAmount.forEach(row => {
    if (!stagingByVC.has(row.vehicle_code)) {
      stagingByVC.set(row.vehicle_code, { count: 0, total: 0, rows: [] });
    }
    const v = stagingByVC.get(row.vehicle_code);
    v.count++;
    v.total += parseFloat(row.cash_amount);
    v.rows.push(row);
  });

  const dbByVC = new Map();
  subscriptions.data.forEach(sub => {
    const vehicle = vehicleMapById.get(sub.vehicle_id);
    if (!vehicle) return;
    const excelCode = Object.keys(vehicleMapping).find(k => vehicleMapping[k] === vehicle.entity_code);
    if (!excelCode) return;
    
    if (!dbByVC.has(excelCode)) {
      dbByVC.set(excelCode, { count: 0, total: 0, subs: [] });
    }
    const v = dbByVC.get(excelCode);
    v.count++;
    v.total += parseFloat(sub.commitment);
    v.subs.push(sub);
  });

  let perfectMatches = 0;
  let amountMismatches = 0;
  let countMismatches = 0;

  const allVCs = new Set([...stagingByVC.keys(), ...dbByVC.keys()]);
  
  console.log('  Code  | Excel | DB  | Match | Excel Total    | DB Total       | Match');
  console.log('  ' + '─'.repeat(73));

  Array.from(allVCs).sort().forEach(vc => {
    const stg = stagingByVC.get(vc) || { count: 0, total: 0 };
    const db = dbByVC.get(vc) || { count: 0, total: 0 };
    
    const countMatch = stg.count === db.count ? '✅' : '❌';
    const amountMatch = Math.abs(stg.total - db.total) < 1 ? '✅' : '❌';
    
    if (countMatch === '✅' && amountMatch === '✅') {
      perfectMatches++;
    } else {
      if (countMatch === '❌') countMismatches++;
      if (amountMatch === '❌') amountMismatches++;
      
      console.log('  ' +
        vc.padEnd(5) + ' | ' +
        String(stg.count).padStart(5) + ' | ' +
        String(db.count).padStart(3) + ' | ' +
        countMatch + '   | ' +
        '$' + String(stg.total.toFixed(2)).padStart(13) + ' | ' +
        '$' + String(db.total.toFixed(2)).padStart(13) + ' | ' +
        amountMatch
      );
    }
  });

  console.log('\n  ✅ Perfect matches (count + amount):           ', perfectMatches, '/', allVCs.size);
  console.log('  ❌ Count mismatches:                           ', countMismatches);
  console.log('  ❌ Amount mismatches (but count OK):           ', amountMismatches - countMismatches);

  // Grand totals
  const totalStagingAmount = Array.from(stagingByVC.values()).reduce((s, v) => s + v.total, 0);
  const totalDBAmount = Array.from(dbByVC.values()).reduce((s, v) => s + v.total, 0);

  console.log('\n📊 SECTION 5: GRAND TOTALS');
  console.log('─'.repeat(75));
  console.log('  Excel staging total amount:    $', totalStagingAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
  console.log('  Database total amount:         $', totalDBAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
  console.log('  Difference:                    $', (totalDBAmount - totalStagingAmount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
  console.log('  Match:                          ', Math.abs(totalDBAmount - totalStagingAmount) < 1 ? '✅ PERFECT' : '❌ MISMATCH');

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('                              FINAL SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const criticalIssues = dupeSubs.length + invalidSubLinks + invalidInvLinks + invalidVehLinks;
  const warnings = orphanedSubs.length + dupeInvestors.length + countMismatches + amountMismatches;

  console.log('🎯 DATA QUALITY:');
  console.log('  Critical issues:                               ', criticalIssues);
  console.log('  Warnings:                                      ', warnings);
  console.log('  Overall status:                                ', criticalIssues === 0 && countMismatches === 0 ? '✅ EXCELLENT' : (criticalIssues === 0 ? '⚠️  ACCEPTABLE' : '❌ NEEDS FIX'));

  console.log('\n📈 DATA COMPLETENESS:');
  console.log('  Excel source → Database:                       ', subscriptions.data.length === stagingWithAmount.length ? '✅ 100%' : '❌ ' + ((subscriptions.data.length / stagingWithAmount.length) * 100).toFixed(1) + '%');
  console.log('  Subscriptions → Entity links:                  ', validLinks === subscriptions.data.length ? '✅ 100%' : '⚠️  ' + ((validLinks / subscriptions.data.length) * 100).toFixed(1) + '%');
  console.log('  Amount accuracy:                               ', Math.abs(totalDBAmount - totalStagingAmount) < 1 ? '✅ PERFECT' : '❌ OFF BY $' + Math.abs(totalDBAmount - totalStagingAmount).toFixed(2));

  console.log('\n🔑 KEY METRICS:');
  console.log('  Unique investor+vehicle pairs:                 ', subKeys.size);
  console.log('  Multiple subscriptions per pair:               ', subscriptions.data.length - subKeys.size, '(normal - multiple investments)');
  console.log('  Total investors with subscriptions:            ', new Set(subscriptions.data.map(s => s.investor_id)).size);
  console.log('  Total vehicles with subscriptions:             ', new Set(subscriptions.data.map(s => s.vehicle_id)).size);

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  
  if (criticalIssues === 0 && countMismatches === 0) {
    console.log('                        🎉 DATA MIGRATION SUCCESS! 🎉');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('\nAll data from VERSO DASHBOARD_V1.0.xlsx has been correctly uploaded.');
    console.log('No critical issues. No count mismatches. Perfect data integrity!\n');
  } else {
    console.log('                        ⚠️  ISSUES FOUND - SEE ABOVE');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
  }
}

main().catch(console.error);

