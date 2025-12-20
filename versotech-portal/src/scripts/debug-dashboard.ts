
import fs from 'fs'
import path from 'path'
import { createServiceClient } from '@/lib/supabase/server'

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

async function debugDashboard() {
    const supabase = createServiceClient()
    console.log('Starting debug...')

    try {
        // 1. Check Fee Events
        console.log('Checking fee_events...')
        const { data: fees, error: feeError } = await supabase
            .from('fee_events')
            .select('computed_amount, created_at, fee_type')
            .limit(1)

        if (feeError) {
            console.error('Fee Error:', feeError)
        } else {
            console.log('Fees found:', fees?.length)
            if (fees && fees.length > 0) {
                console.log('Sample fee:', fees[0])
            }
        }

        // 2. Check Subscriptions
        console.log('Checking subscriptions...')
        // Updated query to match the fix
        const { data: subs, error: subError } = await supabase
            .from('subscriptions')
            .select('commitment, created_at, status')
            .limit(1)

        if (subError) {
            console.error('Subscription Error:', subError)
        } else {
            console.log('Subscriptions found:', subs?.length)
            if (subs && subs.length > 0) {
                console.log('Sample sub:', JSON.stringify(subs[0], null, 2))
            }
        }

        // 3. Check Investors Status
        console.log('Checking investors status...')
        const { data: investors, error: invError } = await supabase
            .from('investors')
            .select('kyc_status')
            .limit(10)
        
        if (invError) {
            console.error('Investors Error:', invError)
        } else {
             const statuses = [...new Set(investors?.map(i => i.kyc_status))]
             console.log('Sample investor statuses:', statuses)
        }

        // 4. Check Tasks
        console.log('Checking tasks...')
        const { data: tasks, error: taskError } = await supabase
            .from('tasks')
            .select('kind, status, priority')
            .limit(10)
        
        if (taskError) {
            console.error('Tasks Error:', taskError)
        } else {
            console.log('Sample tasks:', tasks)
        }

    } catch (e) {
        console.error('CRITICAL FAILURE:', e)
    }
}

debugDashboard()
