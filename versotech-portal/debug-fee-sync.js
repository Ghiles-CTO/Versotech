const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ipguxdssecfexudnvtia.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.pTl2HtHIzLE6qI2WMbUnuMb13BRUZkQk7piYToXB4OI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function investigateAnthropic() {
  console.log('=== INVESTIGATING ANTHROPIC DEAL FEE SYNC ISSUE ===\n');

  // Step 1: Find Anthropic deal
  console.log('1. Searching for Anthropic deal...');
  const { data: deals, error: dealError } = await supabase
    .from('deals')
    .select('id, name')
    .ilike('name', '%anthropic%');

  if (dealError) {
    console.error('Error fetching deals:', dealError);
    return;
  }

  if (!deals || deals.length === 0) {
    console.log('No Anthropic deal found!');
    return;
  }

  console.log('Found deals:', deals);
  const dealId = deals[0].id;
  console.log(`\nUsing deal ID: ${dealId}\n`);

  // Step 2: Query term sheet
  console.log('2. Querying deal_fee_structures for Anthropic...');
  const { data: termSheets, error: tsError } = await supabase
    .from('deal_fee_structures')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });

  if (tsError) {
    console.error('Error fetching term sheets:', tsError);
    return;
  }

  if (!termSheets || termSheets.length === 0) {
    console.log('No term sheets found for this deal!');
    return;
  }

  console.log(`Found ${termSheets.length} term sheet(s):`);
  termSheets.forEach((ts, idx) => {
    console.log(`\n--- Term Sheet ${idx + 1} ---`);
    console.log(`ID: ${ts.id}`);
    console.log(`Status: ${ts.status}`);
    console.log(`Version: ${ts.version}`);
    console.log(`Subscription Fee %: ${ts.subscription_fee_percent}`);
    console.log(`Management Fee %: ${ts.management_fee_percent}`);
    console.log(`Carried Interest %: ${ts.carried_interest_percent}`);
    console.log(`Published At: ${ts.published_at}`);
    console.log(`Created At: ${ts.created_at}`);
  });

  const publishedTermSheet = termSheets.find(ts => ts.status === 'published');
  if (!publishedTermSheet) {
    console.log('\n❌ No published term sheet found!');
    return;
  }

  console.log('\n✓ Published term sheet found:', publishedTermSheet.id);

  // Step 3: Query fee_plans
  console.log('\n3. Querying fee_plans for Anthropic deal...');
  const { data: feePlans, error: fpError } = await supabase
    .from('fee_plans')
    .select(`
      id,
      deal_id,
      name,
      description,
      is_default,
      is_active,
      created_at,
      components:fee_components(
        id,
        kind,
        calc_method,
        frequency,
        payment_schedule,
        rate_bps,
        description
      )
    `)
    .eq('deal_id', dealId);

  if (fpError) {
    console.error('Error fetching fee plans:', fpError);
    return;
  }

  if (!feePlans || feePlans.length === 0) {
    console.log('❌ NO FEE PLANS FOUND! This is the problem.');
    console.log('\nExpected behavior: When term sheet is published, syncTermSheetToFeePlan should create a fee plan.');
  } else {
    console.log(`Found ${feePlans.length} fee plan(s):`);
    feePlans.forEach((fp, idx) => {
      console.log(`\n--- Fee Plan ${idx + 1} ---`);
      console.log(`ID: ${fp.id}`);
      console.log(`Name: ${fp.name}`);
      console.log(`Is Default: ${fp.is_default}`);
      console.log(`Is Active: ${fp.is_active}`);
      console.log(`Created At: ${fp.created_at}`);
      console.log(`Components (${fp.components?.length || 0}):`);
      fp.components?.forEach((comp, i) => {
        console.log(`  ${i + 1}. ${comp.kind}: ${comp.rate_bps} bps (${comp.rate_bps / 100}%)`);
        console.log(`     Method: ${comp.calc_method}, Freq: ${comp.frequency}`);
      });
    });
  }

  // Step 4: Check what the sync would do
  console.log('\n4. Analyzing what sync should do...');
  console.log('\nTerm Sheet Fee Data:');
  console.log(`  Subscription Fee: ${publishedTermSheet.subscription_fee_percent}%`);
  console.log(`  Management Fee: ${publishedTermSheet.management_fee_percent}%`);
  console.log(`  Carried Interest: ${publishedTermSheet.carried_interest_percent}%`);

  // Simulate the sync logic
  function percentToBps(percent) {
    if (percent === null || percent === undefined) return null;
    return Math.round(percent * 100);
  }

  console.log('\nConverted to BPS (what would be stored in fee_components):');
  if (publishedTermSheet.subscription_fee_percent !== null && publishedTermSheet.subscription_fee_percent !== undefined) {
    const bps = percentToBps(publishedTermSheet.subscription_fee_percent);
    console.log(`  Subscription: ${bps} bps (${publishedTermSheet.subscription_fee_percent}% * 100)`);
  } else {
    console.log(`  Subscription: null (would NOT create component)`);
  }

  if (publishedTermSheet.management_fee_percent !== null && publishedTermSheet.management_fee_percent !== undefined) {
    const bps = percentToBps(publishedTermSheet.management_fee_percent);
    console.log(`  Management: ${bps} bps (${publishedTermSheet.management_fee_percent}% * 100)`);
  } else {
    console.log(`  Management: null (would NOT create component)`);
  }

  if (publishedTermSheet.carried_interest_percent !== null && publishedTermSheet.carried_interest_percent !== undefined) {
    const bps = percentToBps(publishedTermSheet.carried_interest_percent);
    console.log(`  Carried Interest: ${bps} bps (${publishedTermSheet.carried_interest_percent}% * 100)`);
  } else {
    console.log(`  Carried Interest: null (would NOT create component)`);
  }

  // Step 5: Check database schema for fee_plans and fee_components
  console.log('\n5. Checking database schema constraints...');
  const { data: fpSchema, error: fpSchemaError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'fee_plans'
        ORDER BY ordinal_position;
      `
    });

  if (!fpSchemaError && fpSchema) {
    console.log('\nfee_plans table schema:');
    console.table(fpSchema);
  }

  const { data: fcSchema, error: fcSchemaError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'fee_components'
        ORDER BY ordinal_position;
      `
    });

  if (!fcSchemaError && fcSchema) {
    console.log('\nfee_components table schema:');
    console.table(fcSchema);
  }

  // Step 6: Try to manually trigger sync
  console.log('\n6. Attempting manual sync simulation...');
  console.log('Creating fee plan with data:');

  const feePlanData = {
    deal_id: dealId,
    name: 'Standard Fee Plan (from Term Sheet)',
    description: 'Auto-generated from published term sheet',
    is_default: true,
    is_active: true,
    created_by: publishedTermSheet.created_by
  };
  console.log(JSON.stringify(feePlanData, null, 2));

  const { data: newPlan, error: createError } = await supabase
    .from('fee_plans')
    .insert(feePlanData)
    .select()
    .single();

  if (createError) {
    console.error('\n❌ Error creating fee plan:', createError);
    console.error('Code:', createError.code);
    console.error('Details:', createError.details);
    console.error('Hint:', createError.hint);
    console.error('Message:', createError.message);
  } else {
    console.log('\n✓ Fee plan created successfully:', newPlan.id);

    // Create components
    const components = [];

    if (publishedTermSheet.subscription_fee_percent !== null && publishedTermSheet.subscription_fee_percent !== undefined) {
      components.push({
        fee_plan_id: newPlan.id,
        kind: 'subscription',
        calc_method: 'percent_of_investment',
        frequency: 'one_time',
        payment_schedule: 'upfront',
        rate_bps: percentToBps(publishedTermSheet.subscription_fee_percent),
        description: `${publishedTermSheet.subscription_fee_percent}% subscription fee from term sheet`
      });
    }

    if (publishedTermSheet.management_fee_percent !== null && publishedTermSheet.management_fee_percent !== undefined) {
      components.push({
        fee_plan_id: newPlan.id,
        kind: 'management',
        calc_method: 'percent_per_annum',
        frequency: 'quarterly',
        payment_schedule: 'recurring',
        rate_bps: percentToBps(publishedTermSheet.management_fee_percent),
        description: `${publishedTermSheet.management_fee_percent}% annual management fee from term sheet`
      });
    }

    if (publishedTermSheet.carried_interest_percent !== null && publishedTermSheet.carried_interest_percent !== undefined) {
      components.push({
        fee_plan_id: newPlan.id,
        kind: 'performance',
        calc_method: 'percent_of_profit',
        frequency: 'on_exit',
        payment_schedule: 'on_demand',
        rate_bps: percentToBps(publishedTermSheet.carried_interest_percent),
        description: `${publishedTermSheet.carried_interest_percent}% carried interest from term sheet`
      });
    }

    console.log(`\nCreating ${components.length} fee components...`);
    if (components.length > 0) {
      const { data: comps, error: compError } = await supabase
        .from('fee_components')
        .insert(components)
        .select();

      if (compError) {
        console.error('\n❌ Error creating fee components:', compError);
        console.error('Code:', compError.code);
        console.error('Details:', compError.details);
        console.error('Hint:', compError.hint);

        // Rollback
        console.log('Rolling back fee plan creation...');
        await supabase.from('fee_plans').delete().eq('id', newPlan.id);
      } else {
        console.log(`✓ Created ${comps.length} fee components successfully!`);
      }
    }
  }

  console.log('\n=== INVESTIGATION COMPLETE ===');
}

investigateAnthropic().catch(console.error);
