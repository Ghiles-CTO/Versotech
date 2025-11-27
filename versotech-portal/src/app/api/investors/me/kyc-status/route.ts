import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Investors can only set these statuses - final statuses require staff action
const ALLOWED_INVESTOR_STATUSES = ['not_started', 'in_progress', 'submitted'] as const
const kycStatusSchema = z.object({
  status: z.enum(ALLOWED_INVESTOR_STATUSES, {
    message: 'Invalid status. Allowed: not_started, in_progress, submitted'
  })
})

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get investor profile and status
        const { data: investorUser } = await supabase
            .from('investor_users')
            .select('investor_id, investors(kyc_status)')
            .eq('user_id', user.id)
            .single()

        if (!investorUser || !investorUser.investors) {
            return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
        }

        // @ts-expect-error - Types might not be fully generated for the join
        const status = investorUser.investors.kyc_status || 'not_started'

        return NextResponse.json({ status })

    } catch (error) {
        console.error('KYC status GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: investorUser } = await supabase
            .from('investor_users')
            .select('investor_id')
            .eq('user_id', user.id)
            .single()

        if (!investorUser) {
            return NextResponse.json({ error: 'No investor profile found' }, { status: 404 })
        }

        const body = await request.json()

        // Validate input - investors cannot set final statuses like 'approved', 'rejected', 'expired'
        const validation = kycStatusSchema.safeParse(body)
        if (!validation.success) {
            const errorMessage = validation.error.issues[0]?.message || 'Invalid status'
            return NextResponse.json({
                error: errorMessage
            }, { status: 400 })
        }

        const { status } = validation.data

        // Update investor status
        const { error } = await supabase
            .from('investors')
            .update({ kyc_status: status })
            .eq('id', investorUser.investor_id)

        if (error) {
            console.error('Error updating KYC status:', error)
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, status })

    } catch (error) {
        console.error('KYC status POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
