import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateSchema = z.object({
  legal_name: z.string().trim().min(1).optional(),
  contact_name: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  default_commission_bps: z.coerce.number().int().min(0).max(300).optional().nullable(),
  commission_cap_amount: z.coerce.number().min(0).optional().nullable(),
  payment_terms: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  notes: z.string().trim().optional().nullable(),
  agreement_expiry_date: z.string().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const result = updateSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const parsed = result.data

    const updateData: Record<string, any> = {}
    if (parsed.legal_name !== undefined) updateData.legal_name = parsed.legal_name
    if (parsed.contact_name !== undefined) updateData.contact_name = parsed.contact_name
    if (parsed.email !== undefined) updateData.email = parsed.email
    if (parsed.default_commission_bps !== undefined) updateData.default_commission_bps = parsed.default_commission_bps
    if (parsed.commission_cap_amount !== undefined) updateData.commission_cap_amount = parsed.commission_cap_amount
    if (parsed.payment_terms !== undefined) updateData.payment_terms = parsed.payment_terms
    if (parsed.status !== undefined) updateData.status = parsed.status
    if (parsed.notes !== undefined) updateData.notes = parsed.notes
    if (parsed.agreement_expiry_date !== undefined) updateData.agreement_expiry_date = parsed.agreement_expiry_date

    const { error } = await supabase
      .from("introducers")
      .update(updateData)
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update introducer" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { error } = await supabase
      .from("introducers")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: `Failed to delete introducer: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
