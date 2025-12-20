import { createClient, createServiceClient } from '@/lib/supabase/server'
import { auditLogger, AuditActions } from '@/lib/audit'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function requireStaff() {
  const authSupabase = await createClient()
  const { data: { user }, error: authError } = await authSupabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await authSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Staff access required' }, { status: 403 }) }
  }

  return { user }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const staffCheck = await requireStaff()
  if (staffCheck.error) return staffCheck.error

  try {
    const { vehicleId } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
    const dateIdx = header.findIndex(h => h.includes('as_of') || h.includes('date'))
    const totalIdx = header.findIndex(h => h.includes('nav_total') || h.includes('total'))
    const perUnitIdx = header.findIndex(h => h.includes('nav_per_unit') || h.includes('per_unit') || h.includes('per unit'))

    if (dateIdx === -1) {
      return NextResponse.json({ error: 'CSV must include an as_of_date column' }, { status: 400 })
    }

    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const as_of_date = values[dateIdx]
      if (!as_of_date) continue

      const nav_total = totalIdx !== -1
        ? parseFloat((values[totalIdx] || '').replace(/[^0-9.-]/g, ''))
        : undefined

      const nav_per_unit = perUnitIdx !== -1
        ? parseFloat((values[perUnitIdx] || '').replace(/[^0-9.-]/g, ''))
        : undefined

      rows.push({
        vehicle_id: vehicleId,
        as_of_date,
        nav_total: Number.isFinite(nav_total) ? nav_total : null,
        nav_per_unit: Number.isFinite(nav_per_unit) ? nav_per_unit : null
      })
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid valuation rows found' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('valuations')
      .upsert(rows, { onConflict: 'vehicle_id,as_of_date' })
      .select('id')

    if (error) {
      console.error('Valuation import error:', error)
      return NextResponse.json({ error: 'Failed to import valuations' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: staffCheck.user!.id,
      action: AuditActions.CREATE,
      entity: 'valuations',
      entity_id: vehicleId,
      metadata: {
        import_method: 'csv_upload',
        row_count: rows.length
      }
    })

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      message: `Imported ${data?.length || 0} valuation(s)`
    })
  } catch (error: any) {
    console.error('Valuation import error:', error)
    return NextResponse.json({ error: error.message || 'Failed to import CSV' }, { status: 500 })
  }
}

