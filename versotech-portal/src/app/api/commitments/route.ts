import { NextResponse } from 'next/server'

const deprecated = NextResponse.json(
  {
    error: 'Legacy commitments workflow has been retired. Use the interest and subscription endpoints instead.'
  },
  { status: 410 }
)

export async function GET() {
  return deprecated
}

export async function POST() {
  return deprecated
}
