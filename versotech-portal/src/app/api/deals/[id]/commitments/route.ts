import { NextResponse } from 'next/server'

const deprecatedResponse = NextResponse.json(
  {
    error: 'Legacy commitments workflow has been retired. Use investor_deal_interest and deal_subscription_submissions instead.'
  },
  { status: 410 }
)

export async function GET() {
  return deprecatedResponse
}

export async function POST() {
  return deprecatedResponse
}
