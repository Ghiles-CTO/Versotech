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
    const investorIdx = header.findIndex(h => h.includes('investor_id') || h.includes('investor id'))
    const unitsIdx = header.findIndex(h => h.includes('units') || h.includes('num_shares'))
    const costIdx = header.findIndex(h => h.includes('cost_basis') || h.includes('cost'))
    const navIdx = header.findIndex(h => h.includes('last_nav') || h.includes('nav'))
    const dateIdx = header.findIndex(h => h.includes('as_of') || h.includes('date'))

    if (investorIdx === -1 || unitsIdx === -1) {
      return NextResponse.json({ error: 'CSV must include investor_id and units columns' }, { status: 400 })
    }

    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const investor_id = values[investorIdx]
      if (!investor_id) continue

      const units = parseFloat((values[unitsIdx] || '').replace(/[^0-9.-]/g, ''))
      if (!Number.isFinite(units) || units <= 0) continue

      const cost_basis = costIdx !== -1
        ? parseFloat((values[costIdx] || '').replace(/[^0-9.-]/g, ''))
        : undefined

      const last_nav = navIdx !== -1
        ? parseFloat((values[navIdx] || '').replace(/[^0-9.-]/g, ''))
        : undefined

      const as_of_date = dateIdx !== -1 ? values[dateIdx] : undefined

      rows.push({
        investor_id,
        vehicle_id: vehicleId,
        units,
        cost_basis: Number.isFinite(cost_basis) ? cost_basis : null,
        last_nav: Number.isFinite(last_nav) ? last_nav : null,
        as_of_date: as_of_date || null
      })
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid position rows found' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('positions')
      .upsert(rows, { onConflict: 'investor_id,vehicle_id' })
      .select('id')

    if (error) {
      console.error('Position import error:', error)
      return NextResponse.json({ error: 'Failed to import positions' }, { status: 500 })
    }

    await auditLogger.log({
      actor_user_id: staffCheck.user!.id,
      action: AuditActions.CREATE,
      entity: 'positions',
      entity_id: vehicleId,
      metadata: {
        import_method: 'csv_upload',
        row_count: rows.length
      }
    })

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      message: `Imported ${data?.length || 0} position(s)`
    })
  } catch (error: any) {
    console.error('Position import error:', error)
    return NextResponse.json({ error: error.message || 'Failed to import CSV' }, { status: 500 })
  }
}

