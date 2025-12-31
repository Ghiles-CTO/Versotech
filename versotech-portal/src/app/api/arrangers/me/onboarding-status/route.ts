/**
 * Arranger Onboarding Status API
 * GET /api/arrangers/me/onboarding-status
 *
 * Returns the completion status of all onboarding steps for the arranger.
 * Implements User Story 2.1.9: Onboarding/Check-in
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Required document types for KYC (mirrors kyc-submission/route.ts)
const REQUIRED_DOCUMENT_TYPES = [
  'company_registration',
  'proof_of_address',
  'director_id',
]

// Required profile fields
const REQUIRED_PROFILE_FIELDS = [
  'legal_name',
  'registration_number',
  'regulator',
  'license_number',
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get arranger entity for this user
    const { data: arrangerUser, error: arrangerUserError } = await supabase
      .from('arranger_users')
      .select('arranger_id, role')
      .eq('user_id', user.id)
      .single()

    if (arrangerUserError || !arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger user' }, { status: 403 })
    }

    const arrangerId = arrangerUser.arranger_id

    // Get arranger entity details
    const { data: arranger, error: arrangerError } = await serviceSupabase
      .from('arranger_entities')
      .select(`
        id,
        legal_name,
        registration_number,
        regulator,
        license_number,
        tax_id,
        primary_email,
        primary_phone,
        address_line1,
        city,
        country,
        status,
        kyc_status,
        kyc_submitted_at,
        kyc_approved_at
      `)
      .eq('id', arrangerId)
      .single()

    if (arrangerError || !arranger) {
      return NextResponse.json({ error: 'Arranger entity not found' }, { status: 404 })
    }

    // Check profile completion
    const profileFields = {
      legal_name: !!arranger.legal_name,
      registration_number: !!arranger.registration_number,
      regulator: !!arranger.regulator,
      license_number: !!arranger.license_number,
    }
    const profileComplete = Object.values(profileFields).every(Boolean)
    const profileFilledCount = Object.values(profileFields).filter(Boolean).length

    // Check KYC documents
    const { data: documents, error: docsError } = await serviceSupabase
      .from('arranger_documents')
      .select('document_type')
      .eq('arranger_id', arrangerId)
      .eq('status', 'active')

    const uploadedTypes = new Set((documents || []).map(d => d.document_type))
    const documentsStatus = {
      company_registration: uploadedTypes.has('company_registration'),
      proof_of_address: uploadedTypes.has('proof_of_address'),
      director_id: uploadedTypes.has('director_id'),
    }
    const documentsComplete = Object.values(documentsStatus).every(Boolean)
    const documentsFilledCount = Object.values(documentsStatus).filter(Boolean).length

    // Check signature specimen
    const { data: signatureDoc } = await serviceSupabase
      .from('arranger_documents')
      .select('id')
      .eq('arranger_id', arrangerId)
      .eq('document_type', 'signature_specimen')
      .eq('status', 'active')
      .maybeSingle()

    const signatureComplete = !!signatureDoc

    // Calculate overall progress
    const steps = [
      { id: 'profile', complete: profileComplete },
      { id: 'documents', complete: documentsComplete },
      { id: 'signature', complete: signatureComplete },
      { id: 'submitted', complete: arranger.kyc_status === 'pending' || arranger.kyc_status === 'approved' },
      { id: 'approved', complete: arranger.kyc_status === 'approved' },
    ]

    const completedSteps = steps.filter(s => s.complete).length
    const progressPercent = Math.round((completedSteps / steps.length) * 100)

    // Determine next action
    let nextAction: { step: string; label: string; href: string } | null = null

    if (!profileComplete) {
      nextAction = {
        step: 'profile',
        label: 'Complete your profile',
        href: '/versotech_main/arranger-profile?tab=entity',
      }
    } else if (!documentsComplete) {
      nextAction = {
        step: 'documents',
        label: 'Upload required documents',
        href: '/versotech_main/arranger-profile?tab=documents',
      }
    } else if (!signatureComplete) {
      nextAction = {
        step: 'signature',
        label: 'Add your signature specimen',
        href: '/versotech_main/arranger-profile?tab=signature',
      }
    } else if (arranger.kyc_status !== 'pending' && arranger.kyc_status !== 'approved') {
      nextAction = {
        step: 'submit',
        label: 'Submit for approval',
        href: '/versotech_main/arranger-profile?tab=documents',
      }
    } else if (arranger.kyc_status === 'pending') {
      nextAction = {
        step: 'pending',
        label: 'Awaiting review',
        href: '/versotech_main/arranger-profile',
      }
    }

    return NextResponse.json({
      arranger_id: arrangerId,
      status: arranger.status,
      kyc_status: arranger.kyc_status,
      kyc_submitted_at: arranger.kyc_submitted_at,
      kyc_approved_at: arranger.kyc_approved_at,
      onboarding: {
        progress_percent: progressPercent,
        completed_steps: completedSteps,
        total_steps: steps.length,
        is_complete: arranger.kyc_status === 'approved',
        next_action: nextAction,
        steps: {
          profile: {
            complete: profileComplete,
            progress: `${profileFilledCount}/${Object.keys(profileFields).length}`,
            details: profileFields,
          },
          documents: {
            complete: documentsComplete,
            progress: `${documentsFilledCount}/${Object.keys(documentsStatus).length}`,
            details: documentsStatus,
          },
          signature: {
            complete: signatureComplete,
          },
          submitted: {
            complete: arranger.kyc_status === 'pending' || arranger.kyc_status === 'approved',
            submitted_at: arranger.kyc_submitted_at,
          },
          approved: {
            complete: arranger.kyc_status === 'approved',
            approved_at: arranger.kyc_approved_at,
          },
        },
      },
    })
  } catch (error) {
    console.error('Onboarding status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
