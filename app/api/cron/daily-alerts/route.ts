import { createAdminClient } from '@/lib/supabase/server'
import { buildDailyAlerts } from '@/lib/admin/daily-alerts'
import { notifyMakeAdminDigest } from '@/lib/make/notify'
import { NextResponse } from 'next/server'

// Appelée chaque matin par la fonction planifiée Netlify (netlify/functions/daily-alerts.mts).
// Protégée par la clé partagée MAKE_WEBHOOK_API_KEY (jamais ouverte si la clé n'est pas configurée).
async function handle(request: Request) {
  const key = process.env.MAKE_WEBHOOK_API_KEY
  if (!key) return NextResponse.json({ error: 'Non configuré' }, { status: 503 })
  if (request.headers.get('x-cron-key') !== key) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const digest = await buildDailyAlerts(db)
  if (!digest.html) return NextResponse.json({ sent: false, reason: 'Rien à signaler' })

  const sent = await notifyMakeAdminDigest({ subject: digest.subject, html: digest.html, total: digest.total })
  return NextResponse.json({ sent, total: digest.total })
}

export const GET = handle
export const POST = handle
