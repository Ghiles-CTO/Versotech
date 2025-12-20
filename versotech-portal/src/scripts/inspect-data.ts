
import { createServiceClient } from '@/lib/supabase/server'

async function inspectData() {
    const supabase = createServiceClient()

    console.log('--- DEALS ---')
    const { data: deals } = await supabase.from('deals').select('*').limit(3)
    console.log(JSON.stringify(deals, null, 2))

    console.log('\n--- SUBSCRIPTIONS ---')
    const { data: subs } = await supabase.from('subscriptions').select('*, vehicle:vehicles(name)').limit(3)
    console.log(JSON.stringify(subs, null, 2))

    console.log('\n--- INVESTORS ---')
    const { data: investors } = await supabase.from('investors').select('*').limit(3)
    console.log(JSON.stringify(investors, null, 2))

    console.log('\n--- FEES ---')
    // Assuming 'fees' table exists, or checking 'transactions' with type 'fee'
    // Based on file structure 'versotech/staff/fees', there might be a fees table or similar.
    // I'll try 'fees' first, if not I'll check 'invoices' or 'bank_transactions'
    const { data: fees, error: feesError } = await supabase.from('fees').select('*').limit(3)
    if (feesError) console.log('Fees table error (might not exist):', feesError.message)
    else console.log(JSON.stringify(fees, null, 2))

    console.log('\n--- BANK TRANSACTIONS (Reconciliation) ---')
    const { data: txs } = await supabase.from('bank_transactions').select('*').limit(3)
    console.log(JSON.stringify(txs, null, 2))

    console.log('\n--- INTRODUCERS ---')
    // Based on 'versotech/staff/introducers', checking for 'introducers' table
    const { data: introducers, error: introError } = await supabase.from('introducers').select('*').limit(3)
    if (introError) console.log('Introducers table error:', introError.message)
    else console.log(JSON.stringify(introducers, null, 2))

    console.log('\n--- CAPITAL CALLS ---')
    const { data: calls } = await supabase.from('capital_calls').select('*').limit(3)
    console.log(JSON.stringify(calls, null, 2))
}

inspectData()
