import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isStaffUser } from "@/lib/api-auth"
import { z } from "zod"

const createSchema = z.object({
  introducer_id: z.string().min(36).max(36),
  prospect_email: z.string().email(),
  deal_id: z.string().min(36).max(36),
  commission_rate_override_bps: z.coerce.number().int().min(0).max(300).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
})

const updateSchema = z.object({
  status: z.enum(["invited", "joined", "allocated", "lost", "inactive"]).optional(),
  commission_rate_override_bps: z.coerce.number().int().min(0).max(300).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
})

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
    const result = createSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const parsed = result.data

    // Check if introducer has a valid signed agreement
    const today = new Date().toISOString().split('T')[0]
    const { data: validAgreement, error: agreementError } = await supabase
      .from("introducer_agreements")
      .select("id")
      .eq("introducer_id", parsed.introducer_id)
      .eq("status", "active")
      .not("signed_date", "is", null)
      .or(`expiry_date.is.null,expiry_date.gte.${today}`)
      .limit(1)

    if (agreementError || !validAgreement || validAgreement.length === 0) {
      return NextResponse.json(
        { error: "Introducer must have a valid signed agreement before making introductions" },
        { status: 403 }
      )
    }

    // Check if prospect already has an introduction for this deal
    const { data: existing } = await supabase
      .from("introductions")
      .select("id")
      .eq("prospect_email", parsed.prospect_email)
      .eq("deal_id", parsed.deal_id)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "This prospect already has an introduction for this deal" },
        { status: 400 }
      )
    }

    const { error } = await supabase.from("introductions").insert({
      introducer_id: parsed.introducer_id,
      prospect_email: parsed.prospect_email,
      deal_id: parsed.deal_id,
      commission_rate_override_bps: parsed.commission_rate_override_bps ?? null,
      notes: parsed.notes ?? null,
      status: "invited",
      created_by: user.id,
    })

    if (error) {
      return NextResponse.json({ error: "Failed to create introduction" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
