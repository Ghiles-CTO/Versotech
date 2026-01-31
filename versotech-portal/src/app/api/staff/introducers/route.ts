import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, isStaffUser } from "@/lib/api-auth"
import { z } from "zod"

const bodySchema = z.object({
  // Type field for individual vs entity
  type: z.enum(["individual", "entity"]).optional().default("entity"),
  // Individual fields
  first_name: z.string().trim().optional().nullable(),
  middle_name: z.string().trim().optional().nullable(),
  last_name: z.string().trim().optional().nullable(),
  // Entity fields
  legal_name: z.string().trim().min(1),
  display_name: z.string().trim().optional().nullable(),
  country_of_incorporation: z.string().trim().optional().nullable(),
  // Common fields
  contact_name: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  country: z.string().trim().optional().nullable(),
  default_commission_bps: z.coerce.number().int().min(0).max(300).optional().nullable(),
  commission_cap_amount: z.coerce.number().min(0).optional().nullable(),
  payment_terms: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive", "suspended"]).optional().default("active"),
  notes: z.string().trim().optional().nullable(),
})

/**
 * GET /api/staff/introducers?search=...
 * Lightweight list endpoint for staff selectors.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: "Staff access required" }, { status: 403 })
    }

    const serviceClient = createServiceClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limitParam = parseInt(searchParams.get("limit") || "500", 10)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 2000) : 500

    let query = serviceClient
      .from("introducers")
      .select("id, display_name, legal_name, email, status, type")
      .order("display_name", { ascending: true })

    if (search && search.trim().length > 0) {
      query = query.or(
        `display_name.ilike.%${search}%,legal_name.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data: introducers, error } = await query.limit(limit)

    if (error) {
      console.error("Error fetching introducers:", error)
      return NextResponse.json({ error: "Failed to fetch introducers" }, { status: 500 })
    }

    return NextResponse.json({ introducers: introducers || [] })
  } catch (error) {
    console.error("Introducers API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify staff role using database profile (not JWT metadata)
    const isStaff = await isStaffUser(supabase, user)
    if (!isStaff) {
      return NextResponse.json({ error: "Staff access required" }, { status: 403 })
    }

    const json = await request.json()
    const result = bodySchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const parsed = result.data

    const insertData = {
      type: parsed.type,
      first_name: parsed.first_name ?? null,
      middle_name: parsed.middle_name ?? null,
      last_name: parsed.last_name ?? null,
      legal_name: parsed.legal_name,
      display_name: parsed.display_name ?? null,
      country_of_incorporation: parsed.country_of_incorporation ?? null,
      contact_name: parsed.contact_name ?? null,
      email: parsed.email || null,
      country: parsed.country ?? null,
      default_commission_bps: parsed.default_commission_bps ?? null,
      commission_cap_amount: parsed.commission_cap_amount ?? null,
      payment_terms: parsed.payment_terms ?? null,
      status: parsed.status,
      notes: parsed.notes ?? null,
    }

    // Use service client to bypass RLS (we've already verified staff access above)
    const serviceSupabase = createServiceClient()
    const { error, data } = await serviceSupabase.from("introducers").insert(insertData).select()

    if (error) {
      return NextResponse.json({ error: `Failed to create introducer: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
