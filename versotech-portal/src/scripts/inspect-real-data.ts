
import { createServiceClient } from '@/lib/supabase/server'

async function inspectData() {
    const supabase = createServiceClient()

    console.log('--- FEE EVENTS ---')
    const { data: fees, error: feeError } = await supabase.from('fee_events').select('*').limit(5)
    if (feeError) console.log('Error fetching fee_events:', feeError.message)
    else console.log('Fee Events Sample:', JSON.stringify(fees, null, 2))

    console.log('\n--- AUDIT LOG ---')
    const { data: audit, error: auditError } = await supabase.from('audit_log').select('*').order('ts', { ascending: false }).limit(5)
    if (auditError) console.log('Error fetching audit_log:', auditError.message)
    else console.log('Audit Log Sample:', JSON.stringify(audit, null, 2))

    console.log('\n--- SUBSCRIPTIONS (for volume) ---')
    const { data: subs, error: subError } = await supabase.from('subscriptions').select('amount, created_at, status').limit(5)
    if (subError) console.log('Error fetching subscriptions:', subError.message)
    else console.log('Subscriptions Sample:', JSON.stringify(subs, null, 2))
}

inspectData()
