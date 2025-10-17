import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy commitments workflow has been retired. Approvals are no longer supported.'
    },
    { status: 410 }
  )
}
