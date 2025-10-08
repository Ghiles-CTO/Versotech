import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const bodySchema = z.object({
  legal_name: z.string().trim().min(1),
  contact_name: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  default_commission_bps: z.number().int().min(0).max(300).optional().nullable(),
  commission_cap_amount: z.number().min(0).optional().nullable(),
  payment_terms: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive", "suspended"]).optional().default("active"),
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
    const parsed = bodySchema.parse(json)

    const { error } = await supabase.from("introducers").insert({
      legal_name: parsed.legal_name,
      contact_name: parsed.contact_name ?? null,
      email: parsed.email ?? null,
      default_commission_bps: parsed.default_commission_bps ?? null,
      commission_cap_amount: parsed.commission_cap_amount ?? null,
      payment_terms: parsed.payment_terms ?? null,
      status: parsed.status,
      notes: parsed.notes ?? null,
    })

    if (error) {
      console.error("[Introducers API] Insert failed", error)
      return NextResponse.json({ error: "Failed to create introducer" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("[Introducers API] Unexpected error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
