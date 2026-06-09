import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

type GuardOk = { error: null; user: User }
type GuardFail = { error: Response; user: null }

export async function requireAdmin(): Promise<GuardOk | GuardFail> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) as unknown as Response,
      user: null,
    }
  }

  if (user.app_metadata?.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) as unknown as Response,
      user: null,
    }
  }

  return { error: null, user }
}
