import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const makeUrl = process.env.MAKE_WEBHOOK_URL_RESERVATION

  if (!makeUrl) {
    return NextResponse.json({ skipped: true, reason: 'MAKE_WEBHOOK_URL_RESERVATION not configured' })
  }

  let payload: object
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const response = await fetch(makeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'reservation.created', ...payload }),
    })

    return NextResponse.json({
      forwarded: true,
      makeStatus: response.status,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Make unreachable', detail: String(err) }, { status: 502 })
  }
}
