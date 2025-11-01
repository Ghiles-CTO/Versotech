import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createSchema = z.object({
  introducer_id: z.string().uuid(),
  prospect_email: z.string().email(),
  deal_id: z.string().uuid(),
  commission_rate_override_bps: z.number().int().min(0).max(300).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
})

const updateSchema = z.object({
  status: z.enum(["invited", "joined", "allocated", "lost", "inactive"]).optional(),
  commission_rate_override_bps: z.number().int().min(0).max(300).optional().nullable(),
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

    const role = user.user_metadata?.role || user.role
    if (!role || !role.startsWith("staff_")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const json = await request.json()
    const parsed = createSchema.parse(json)

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
      console.error("[Introductions API] Insert failed", error)
      return NextResponse.json({ error: "Failed to create introduction" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("[Introductions API] Unexpected error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
