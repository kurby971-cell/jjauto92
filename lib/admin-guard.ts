import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

type GuardOk = { error: null; user: User }
type GuardFail = { error: Response; user: null }

async function checkAdminFromDb(userId: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data: { user }, error } = await admin.auth.admin.getUserById(userId)
    if (error || !user) return false
    return user.app_metadata?.role === 'admin'
  } catch {
    return false
  }
}

export async function requireAdmin(): Promise<GuardOk | GuardFail> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) as unknown as Response,
      user: null,
    }
  }

  // Primary: app_metadata lu depuis le JWT via l'API Supabase côté serveur (toujours à jour)
  if (user.app_metadata?.role === 'admin') {
    return { error: null, user }
  }

  // Fallback: lecture directe en base via l'Admin API (contourne tout cache JWT)
  if (await checkAdminFromDb(user.id)) {
    return { error: null, user }
  }

  return {
    error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) as unknown as Response,
    user: null,
  }
}
