
import { createServiceClient } from '@/lib/supabase/server'

async function inspectData() {
    const supabase = createServiceClient()

    console.log('--- DEALS STATUS CHECK ---')
    // Check all available statuses to see why 'open' might be returning 0
    const { data: allDeals } = await supabase.from('deals').select('status, name').limit(10)
    console.log('Sample Deals:', JSON.stringify(allDeals, null, 2))

    const { data: dealStatuses } = await supabase.from('deals').select('status')
    const counts = (dealStatuses || []).reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
    }, {})
    console.log('Deal Status Counts:', counts)

    console.log('\n--- AUDIT LOGS ---')
    // Guessing table name 'audit_logs' or 'activity_logs'
    const { data: audits, error: auditError } = await supabase.from('audit_logs').select('*').limit(3)
    if (auditError) {
        console.log('audit_logs error:', auditError.message)
        // Try 'activity_feed' if audit_logs fails, though user specifically said audit logs
        const { data: activity } = await supabase.from('activity_feed').select('*').limit(3)
        console.log('Fallback to activity_feed:', JSON.stringify(activity, null, 2))
    } else {
        console.log(JSON.stringify(audits, null, 2))
    }

    console.log('\n--- ENTITIES ---')
    // Guessing 'entities' or 'legal_entities'
    const { data: entities, error: entityError } = await supabase.from('entities').select('*').limit(3)
    if (entityError) console.log('entities table error:', entityError.message)
    else console.log(JSON.stringify(entities, null, 2))

    console.log('\n--- REQUESTS ---')
    // Guessing 'requests' or 'tasks' (user mentioned requests)
    const { data: requests, error: reqError } = await supabase.from('requests').select('*').limit(3)
    if (reqError) console.log('requests table error:', reqError.message)
    else console.log(JSON.stringify(requests, null, 2))

    console.log('\n--- FEE EVENTS ---')
    const { data: feeEvents, error: feeError } = await supabase.from('fee_events').select('*').limit(3)
    if (feeError) console.log('fee_events error:', feeError.message)
    else console.log(JSON.stringify(feeEvents, null, 2))
}

inspectData()
