import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export type UnifiedUser = {
  id: string
  entityId: string
  entityType: 'investor' | 'lawyer' | 'partner' | 'commercial_partner' | 'introducer' | 'arranger'
  entityName: string
  userName: string
  userEmail: string
  userRole: string
  isPrimary: boolean
  canSign: boolean
  status: 'active' | 'inactive' | 'pending'
  kycStatus: string | null
  country: string | null
  createdAt: string
}

export type UnifiedUsersResponse = {
  success: boolean
  data?: UnifiedUser[]
  stats?: {
    total: number
    investors: number
    lawyers: number
    partners: number
    commercialPartners: number
    introducers: number
    arrangers: number
    active: number
    pending: number
  }
  error?: string
}

export async function GET(): Promise<NextResponse<UnifiedUsersResponse>> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role?.startsWith('staff')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Use service client to bypass RLS for comprehensive data fetch
    const serviceClient = createServiceClient()
    const allUsers: UnifiedUser[] = []

    // 1. Fetch Investors (simple query first, then fetch users separately if needed)
    const { data: investors, error: investorsError } = await serviceClient
      .from('investors')
      .select('id, legal_name, type, kyc_status, country, status, created_at')
      .order('created_at', { ascending: false })

    // Separately fetch investor_users with profiles for those that have users
    const { data: investorUsersData } = await serviceClient
      .from('investor_users')
      .select(`
        investor_id,
        user_id,
        role,
        is_primary,
        can_sign,
        profiles:profiles!investor_users_user_id_fkey (
          id,
          display_name,
          email
        )
      `)

    // Build a map of investor_id -> users for quick lookup
    const investorUsersMap = new Map<string, Array<{
      user_id: string
      role: string | null
      is_primary: boolean
      can_sign: boolean
      profiles: { id: string; display_name: string | null; email: string | null } | null
    }>>()

    if (investorUsersData) {
      for (const iu of investorUsersData) {
        const existing = investorUsersMap.get(iu.investor_id) || []
        existing.push({
          user_id: iu.user_id,
          role: iu.role,
          is_primary: iu.is_primary || false,
          can_sign: iu.can_sign || false,
          profiles: Array.isArray(iu.profiles) ? iu.profiles[0] : iu.profiles
        })
        investorUsersMap.set(iu.investor_id, existing)
      }
    }

    console.log('[unified-users] Investors query result:', {
      hasError: !!investorsError,
      errorDetails: investorsError ? JSON.stringify(investorsError) : null,
      dataLength: investors?.length ?? 'null',
      firstItem: investors?.[0] ? JSON.stringify(investors[0]).substring(0, 200) : 'null'
    })

    if (investorsError) {
      console.error('[unified-users] Investors error:', JSON.stringify(investorsError))
    } else if (investors) {
      for (const inv of investors) {
        const users = investorUsersMap.get(inv.id) || []
        if (users.length === 0) {
          allUsers.push({
            id: `investor-${inv.id}-entity`,
            entityId: inv.id,
            entityType: 'investor',
            entityName: inv.legal_name || 'Unnamed Investor',
            userName: 'No users assigned',
            userEmail: '-',
            userRole: inv.type || 'investor',
            isPrimary: false,
            canSign: false,
            status: inv.status === 'active' ? 'active' : 'inactive',
            kycStatus: inv.kyc_status,
            country: inv.country,
            createdAt: inv.created_at
          })
        } else {
          for (const iu of users) {
            allUsers.push({
              id: `investor-${inv.id}-${iu.user_id}`,
              entityId: inv.id,
              entityType: 'investor',
              entityName: inv.legal_name || 'Unnamed Investor',
              userName: iu.profiles?.display_name || 'Unknown User',
              userEmail: iu.profiles?.email || '-',
              userRole: iu.role || 'member',
              isPrimary: iu.is_primary || false,
              canSign: iu.can_sign || false,
              status: inv.status === 'active' ? 'active' : 'inactive',
              kycStatus: inv.kyc_status,
              country: inv.country,
              createdAt: inv.created_at
            })
          }
        }
      }
    }

    // 2. Fetch Lawyers (simple query without nested joins)
    const { data: lawyers, error: lawyersError } = await serviceClient
      .from('lawyers')
      .select('id, firm_name, display_name, kyc_status, country, is_active, created_at')
      .order('created_at', { ascending: false })

    // Fetch lawyer_users separately
    const { data: lawyerUsersData } = await serviceClient
      .from('lawyer_users')
      .select(`
        lawyer_id,
        user_id,
        role,
        is_primary,
        can_sign,
        profiles:profiles!lawyer_users_user_fk (id, display_name, email)
      `)

    const lawyerUsersMap = new Map<string, any[]>()
    if (lawyerUsersData) {
      for (const lu of lawyerUsersData) {
        const existing = lawyerUsersMap.get(lu.lawyer_id) || []
        existing.push({
          user_id: lu.user_id,
          role: lu.role,
          is_primary: lu.is_primary || false,
          can_sign: lu.can_sign || false,
          profiles: Array.isArray(lu.profiles) ? lu.profiles[0] : lu.profiles
        })
        lawyerUsersMap.set(lu.lawyer_id, existing)
      }
    }

    console.log('[unified-users] Lawyers query result:', {
      hasError: !!lawyersError,
      errorDetails: lawyersError ? JSON.stringify(lawyersError) : null,
      dataLength: lawyers?.length ?? 'null'
    })

    if (lawyersError) {
      console.error('[unified-users] Lawyers error:', JSON.stringify(lawyersError))
    } else if (lawyers) {
      for (const law of lawyers) {
        const users = lawyerUsersMap.get(law.id) || []
        if (users.length === 0) {
          allUsers.push({
            id: `lawyer-${law.id}-entity`,
            entityId: law.id,
            entityType: 'lawyer',
            entityName: law.firm_name || law.display_name || 'Unnamed Firm',
            userName: 'No users assigned',
            userEmail: '-',
            userRole: 'lawyer',
            isPrimary: false,
            canSign: false,
            status: law.is_active ? 'active' : 'inactive',
            kycStatus: law.kyc_status,
            country: law.country,
            createdAt: law.created_at
          })
        } else {
          for (const lu of users) {
            allUsers.push({
              id: `lawyer-${law.id}-${lu.user_id}`,
              entityId: law.id,
              entityType: 'lawyer',
              entityName: law.firm_name || law.display_name || 'Unnamed Firm',
              userName: lu.profiles?.display_name || 'Unknown User',
              userEmail: lu.profiles?.email || '-',
              userRole: lu.role || 'member',
              isPrimary: lu.is_primary || false,
              canSign: lu.can_sign || false,
              status: law.is_active ? 'active' : 'inactive',
              kycStatus: law.kyc_status,
              country: law.country,
              createdAt: law.created_at
            })
          }
        }
      }
    }

    // 3. Fetch Partners (simple query without nested joins)
    const { data: partners, error: partnersError } = await serviceClient
      .from('partners')
      .select('id, name, legal_name, kyc_status, country, status, created_at')
      .order('created_at', { ascending: false })

    // Fetch partner_users separately
    const { data: partnerUsersData } = await serviceClient
      .from('partner_users')
      .select(`
        partner_id,
        user_id,
        role,
        is_primary,
        can_sign,
        profiles:profiles!partner_users_user_fk (id, display_name, email)
      `)

    const partnerUsersMap = new Map<string, any[]>()
    if (partnerUsersData) {
      for (const pu of partnerUsersData) {
        const existing = partnerUsersMap.get(pu.partner_id) || []
        existing.push({
          user_id: pu.user_id,
          role: pu.role,
          is_primary: pu.is_primary || false,
          can_sign: pu.can_sign || false,
          profiles: Array.isArray(pu.profiles) ? pu.profiles[0] : pu.profiles
        })
        partnerUsersMap.set(pu.partner_id, existing)
      }
    }

    console.log('[unified-users] Partners query result:', {
      hasError: !!partnersError,
      errorDetails: partnersError ? JSON.stringify(partnersError) : null,
      dataLength: partners?.length ?? 'null'
    })

    if (partnersError) {
      console.error('[unified-users] Partners error:', JSON.stringify(partnersError))
    } else if (partners) {
      for (const p of partners) {
        const users = partnerUsersMap.get(p.id) || []
        if (users.length === 0) {
          allUsers.push({
            id: `partner-${p.id}-entity`,
            entityId: p.id,
            entityType: 'partner',
            entityName: p.name || p.legal_name || 'Unnamed Partner',
            userName: 'No users assigned',
            userEmail: '-',
            userRole: 'partner',
            isPrimary: false,
            canSign: false,
            status: p.status === 'active' ? 'active' : 'inactive',
            kycStatus: p.kyc_status,
            country: p.country,
            createdAt: p.created_at
          })
        } else {
          for (const pu of users) {
            allUsers.push({
              id: `partner-${p.id}-${pu.user_id}`,
              entityId: p.id,
              entityType: 'partner',
              entityName: p.name || p.legal_name || 'Unnamed Partner',
              userName: pu.profiles?.display_name || 'Unknown User',
              userEmail: pu.profiles?.email || '-',
              userRole: pu.role || 'member',
              isPrimary: pu.is_primary || false,
              canSign: pu.can_sign || false,
              status: p.status === 'active' ? 'active' : 'inactive',
              kycStatus: p.kyc_status,
              country: p.country,
              createdAt: p.created_at
            })
          }
        }
      }
    }

    // 4. Fetch Commercial Partners (simple query without nested joins)
    const { data: commercialPartners, error: cpError } = await serviceClient
      .from('commercial_partners')
      .select('id, name, legal_name, kyc_status, country, status, created_at')
      .order('created_at', { ascending: false })

    // Fetch commercial_partner_users separately
    const { data: cpUsersData } = await serviceClient
      .from('commercial_partner_users')
      .select(`
        commercial_partner_id,
        user_id,
        role,
        is_primary,
        can_sign,
        profiles:profiles!commercial_partner_users_user_fk (id, display_name, email)
      `)

    const cpUsersMap = new Map<string, any[]>()
    if (cpUsersData) {
      for (const cpu of cpUsersData) {
        const existing = cpUsersMap.get(cpu.commercial_partner_id) || []
        existing.push({
          user_id: cpu.user_id,
          role: cpu.role,
          is_primary: cpu.is_primary || false,
          can_sign: cpu.can_sign || false,
          profiles: Array.isArray(cpu.profiles) ? cpu.profiles[0] : cpu.profiles
        })
        cpUsersMap.set(cpu.commercial_partner_id, existing)
      }
    }

    console.log('[unified-users] Commercial Partners query result:', {
      hasError: !!cpError,
      errorDetails: cpError ? JSON.stringify(cpError) : null,
      dataLength: commercialPartners?.length ?? 'null'
    })

    if (cpError) {
      console.error('[unified-users] Commercial Partners error:', JSON.stringify(cpError))
    } else if (commercialPartners) {
      for (const cp of commercialPartners) {
        const users = cpUsersMap.get(cp.id) || []
        if (users.length === 0) {
          allUsers.push({
            id: `commercial_partner-${cp.id}-entity`,
            entityId: cp.id,
            entityType: 'commercial_partner',
            entityName: cp.name || cp.legal_name || 'Unnamed Commercial Partner',
            userName: 'No users assigned',
            userEmail: '-',
            userRole: 'commercial_partner',
            isPrimary: false,
            canSign: false,
            status: cp.status === 'active' ? 'active' : 'inactive',
            kycStatus: cp.kyc_status,
            country: cp.country,
            createdAt: cp.created_at
          })
        } else {
          for (const cpu of users) {
            allUsers.push({
              id: `commercial_partner-${cp.id}-${cpu.user_id}`,
              entityId: cp.id,
              entityType: 'commercial_partner',
              entityName: cp.name || cp.legal_name || 'Unnamed Commercial Partner',
              userName: cpu.profiles?.display_name || 'Unknown User',
              userEmail: cpu.profiles?.email || '-',
              userRole: cpu.role || 'member',
              isPrimary: cpu.is_primary || false,
              canSign: cpu.can_sign || false,
              status: cp.status === 'active' ? 'active' : 'inactive',
              kycStatus: cp.kyc_status,
              country: cp.country,
              createdAt: cp.created_at
            })
          }
        }
      }
    }

    // 5. Fetch Introducers
    // Columns: legal_name, email, contact_name, status (no country, no type)
    const { data: introducers, error: introducersError } = await serviceClient
      .from('introducers')
      .select(`
        id,
        legal_name,
        email,
        contact_name,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (introducersError) {
      console.error('[unified-users] Introducers error:', JSON.stringify(introducersError))
    } else if (introducers) {
      for (const intro of introducers) {
        allUsers.push({
          id: `introducer-${intro.id}-entity`,
          entityId: intro.id,
          entityType: 'introducer',
          entityName: intro.legal_name || 'Unnamed Introducer',
          userName: intro.contact_name || 'No contact',
          userEmail: intro.email || '-',
          userRole: 'introducer',
          isPrimary: true,
          canSign: false,
          status: intro.status === 'active' ? 'active' : 'inactive',
          kycStatus: null,
          country: null,
          createdAt: intro.created_at
        })
      }
    }

    // 6. Fetch Arrangers
    // Columns: legal_name, email, status, kyc_status (no contact_name, no country, no type)
    const { data: arrangers, error: arrangersError } = await serviceClient
      .from('arranger_entities')
      .select(`
        id,
        legal_name,
        email,
        status,
        kyc_status,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (arrangersError) {
      console.error('[unified-users] Arrangers error:', JSON.stringify(arrangersError))
    } else if (arrangers) {
      for (const arr of arrangers) {
        allUsers.push({
          id: `arranger-${arr.id}-entity`,
          entityId: arr.id,
          entityType: 'arranger',
          entityName: arr.legal_name || 'Unnamed Arranger',
          userName: 'Entity Contact',
          userEmail: arr.email || '-',
          userRole: 'arranger',
          isPrimary: true,
          canSign: false,
          status: arr.status === 'active' ? 'active' : 'inactive',
          kycStatus: arr.kyc_status,
          country: null,
          createdAt: arr.created_at
        })
      }
    }

    // Final log before stats
    console.log('[unified-users] Final allUsers summary:', {
      total: allUsers.length,
      byType: {
        investor: allUsers.filter(u => u.entityType === 'investor').length,
        lawyer: allUsers.filter(u => u.entityType === 'lawyer').length,
        partner: allUsers.filter(u => u.entityType === 'partner').length,
        commercial_partner: allUsers.filter(u => u.entityType === 'commercial_partner').length,
        introducer: allUsers.filter(u => u.entityType === 'introducer').length,
        arranger: allUsers.filter(u => u.entityType === 'arranger').length,
      }
    })

    // Calculate stats
    const stats = {
      total: allUsers.length,
      investors: allUsers.filter(u => u.entityType === 'investor').length,
      lawyers: allUsers.filter(u => u.entityType === 'lawyer').length,
      partners: allUsers.filter(u => u.entityType === 'partner').length,
      commercialPartners: allUsers.filter(u => u.entityType === 'commercial_partner').length,
      introducers: allUsers.filter(u => u.entityType === 'introducer').length,
      arrangers: allUsers.filter(u => u.entityType === 'arranger').length,
      active: allUsers.filter(u => u.status === 'active').length,
      pending: allUsers.filter(u => u.status === 'pending' || u.kycStatus === 'pending').length
    }

    return NextResponse.json({
      success: true,
      data: allUsers,
      stats
    })

  } catch (error: any) {
    console.error('[unified-users] Error:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code
    })
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
