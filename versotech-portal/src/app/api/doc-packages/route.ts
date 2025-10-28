import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions, AuditEntities } from '@/lib/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating document packages
const createDocPackageSchema = z.object({
  deal_id: z.string().uuid('Invalid deal ID'),
  investor_id: z.string().uuid('Invalid investor ID'),
  kind: z.enum(['term_sheet', 'subscription_pack', 'nda']),
  template_keys: z.array(z.string()).min(1, 'At least one template key is required'),
  merge_data: z.record(z.string(), z.any()).optional(),
  auto_send: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is staff (only staff can create document packages)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Staff access required to create document packages' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = createDocPackageSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (validation.error as any).errors },
        { status: 400 }
      )
    }

    const { deal_id, investor_id, kind, template_keys, merge_data, auto_send } = validation.data

    // Verify deal exists
    const { data: deal } = await supabase
      .from('deals')
      .select('id, name, status')
      .eq('id', deal_id)
      .single()

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Verify investor exists
    const { data: investor } = await supabase
      .from('investors')
      .select('id, legal_name')
      .eq('id', investor_id)
      .single()

    if (!investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      )
    }

    // Verify all templates exist
    const { data: templates, error: templateError } = await supabase
      .from('doc_templates')
      .select('id, key, name, provider')
      .in('key', template_keys)

    if (templateError || !templates || templates.length !== template_keys.length) {
      return NextResponse.json(
        { error: 'One or more templates not found' },
        { status: 400 }
      )
    }

    // Create document package
    const { data: docPackage, error: packageError } = await serviceSupabase
      .from('doc_packages')
      .insert({
        deal_id,
        investor_id,
        kind,
        status: 'draft',
        created_by: user.id
      })
      .select('id')
      .single()

    if (packageError) {
      console.error('Document package creation error:', packageError)
      return NextResponse.json(
        { error: 'Failed to create document package' },
        { status: 500 }
      )
    }

    // Create package items for each template
    const packageItems = templates.map((template, index) => ({
      package_id: docPackage.id,
      template_id: template.id,
      merge_data: merge_data || {},
      sort_order: index + 1
    }))

    const { error: itemsError } = await serviceSupabase
      .from('doc_package_items')
      .insert(packageItems)

    if (itemsError) {
      console.error('Document package items creation error:', itemsError)
      return NextResponse.json(
        { error: 'Failed to create document package items' },
        { status: 500 }
      )
    }

    // TODO: Trigger n8n workflow to generate documents
    // This would call an n8n webhook to:
    // 1. Generate PDFs from templates with merge data
    // 2. Create e-sign envelope (Dropbox Sign/DocuSign)
    // 3. Send for signature
    // 4. Return signing URL

    let signingUrl = null
    if (auto_send) {
      // Placeholder for e-sign integration
      // In production, this would trigger the document generation workflow
      signingUrl = `https://sign.dropboxapi.com/placeholder/${docPackage.id}`
      
      // Update package status to sent
      await serviceSupabase
        .from('doc_packages')
        .update({ 
          status: 'sent',
          esign_envelope_id: `placeholder_${docPackage.id}` 
        })
        .eq('id', docPackage.id)
    }

    // Get the complete package with all details
    const { data: completePackage } = await supabase
      .from('doc_packages')
      .select(`
        *,
        deals (
          name
        ),
        investors (
          legal_name
        ),
        doc_package_items (
          sort_order,
          merge_data,
          doc_templates (
            key,
            name,
            provider
          )
        )
      `)
      .eq('id', docPackage.id)
      .single()

    // Log the document package creation
    await auditLogger.log({
      actor_user_id: user.id,
      action: AuditActions.CREATE,
      entity: AuditEntities.DOCUMENTS,
      entity_id: docPackage.id,
      metadata: {
        package_id: docPackage.id,
        deal_id,
        investor_id,
        kind,
        template_count: template_keys.length,
        auto_send,
        created_by: profile.display_name
      }
    })

    return NextResponse.json({
      success: true,
      package_id: docPackage.id,
      signing_url: signingUrl,
      package: completePackage,
      message: `Successfully created ${kind} package for ${investor.legal_name}${auto_send ? ' and sent for signature' : ''}`
    })

  } catch (error) {
    console.error('Document package API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to view document packages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const dealId = searchParams.get('deal_id')
    const investorId = searchParams.get('investor_id')
    const kind = searchParams.get('kind')
    const status = searchParams.get('status')

    // Build query (RLS will handle access control)
    let query = supabase
      .from('doc_packages')
      .select(`
        *,
        deals (
          name
        ),
        investors (
          legal_name
        ),
        doc_package_items (
          sort_order,
          merge_data,
          doc_templates (
            key,
            name,
            provider
          )
        ),
        created_by_profile:created_by (
          display_name
        )
      `)

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }
    if (investorId) {
      query = query.eq('investor_id', investorId)
    }
    if (kind) {
      query = query.eq('kind', kind)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: packages, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching document packages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch document packages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      packages: packages || []
    })

  } catch (error) {
    console.error('Document packages GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
