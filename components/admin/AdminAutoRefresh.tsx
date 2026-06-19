'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// Polling de secours : couvre les reconnexions WebSocket et le cas où
// la migration 003 (fix RLS) n'a pas encore été appliquée.
const FALLBACK_POLL_MS = 30_000

export default function AdminAutoRefresh() {
  const router = useRouter()
  const routerRef = useRef(router)
  useEffect(() => { routerRef.current = router }, [router])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Souscription Realtime : refresh instantané sur INSERT / UPDATE / DELETE
    // Requiert : migration 003 appliquée (RLS app_metadata + publication)
    const channel = supabase
      .channel('admin-reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => { routerRef.current.refresh() }
      )
      .subscribe()

    // Polling de secours toutes les 30 s
    const pollId = setInterval(() => routerRef.current.refresh(), FALLBACK_POLL_MS)

    // Refresh immédiat au retour sur l'onglet
    function onVisible() {
      if (document.visibilityState === 'visible') routerRef.current.refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return null
}
