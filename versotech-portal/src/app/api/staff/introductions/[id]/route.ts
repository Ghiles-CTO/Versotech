import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum(["invited", "joined", "allocated", "lost", "inactive"]).optional(),
  commission_rate_override_bps: z.number().int().min(0).max(300).optional().nullable(),
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
    const parsed = updateSchema.parse(json)

    const updateData: Record<string, any> = {}
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
      console.error("[Introductions API] Update failed", error)
      return NextResponse.json({ error: "Failed to update introduction" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Introductions API] Unexpected error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
