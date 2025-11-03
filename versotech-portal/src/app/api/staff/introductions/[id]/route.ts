import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateSchema = z.object({
  introducer_id: z.string().min(36).max(36).optional(),
  prospect_email: z.string().email().optional(),
  deal_id: z.string().min(36).max(36).optional(),
  status: z.enum(["invited", "joined", "allocated", "lost", "inactive"]).optional(),
  commission_rate_override_bps: z.coerce.number().int().min(0).max(300).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
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
    if (parsed.introducer_id !== undefined) updateData.introducer_id = parsed.introducer_id
    if (parsed.prospect_email !== undefined) updateData.prospect_email = parsed.prospect_email
    if (parsed.deal_id !== undefined) updateData.deal_id = parsed.deal_id
    if (parsed.status !== undefined) updateData.status = parsed.status
    if (parsed.commission_rate_override_bps !== undefined) {
      updateData.commission_rate_override_bps = parsed.commission_rate_override_bps
    }
    if (parsed.notes !== undefined) updateData.notes = parsed.notes

    const { error } = await supabase
      .from("introductions")
      .update(updateData)
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update introduction" }, { status: 500 })
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

    // Check if introduction has associated commissions
    const { data: commissions } = await supabase
      .from("introducer_commissions")
      .select("id, status")
      .eq("introduction_id", id)
      .limit(1)

    if (commissions && commissions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete introduction with associated commissions" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("introductions")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete introduction" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
