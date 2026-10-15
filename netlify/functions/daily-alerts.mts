// Fonction planifiée Netlify : déclenche chaque matin le résumé d'alertes admin (07:00 UTC = 08:00/09:00 à Paris).
export default async () => {
  const base = process.env.URL ?? 'https://jjautomobiles.fr'
  const key = process.env.MAKE_WEBHOOK_API_KEY
  if (!key) return
  const res = await fetch(`${base}/api/cron/daily-alerts`, { headers: { 'x-cron-key': key } })
  console.log('[daily-alerts]', res.status, await res.text())
}

export const config = { schedule: '0 7 * * *' }
