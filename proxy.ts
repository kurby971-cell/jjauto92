import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        // Le proxy PEUT écrire dans les cookies de réponse (contrairement aux Server Components)
        // → c'est ici que le refresh de token JWT Supabase est persisté
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    console.error('[proxy] supabase.auth.getUser() failed:', err instanceof Error ? err.message : err)
  }

  if (request.nextUrl.pathname.startsWith('/mon-compte') && !user) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const next = encodeURIComponent(request.nextUrl.pathname)
      return NextResponse.redirect(new URL(`/connexion?next=${next}`, request.url))
    }

    // Primary: rôle lu depuis l'objet user retourné par getUser() (appel réseau Supabase Auth)
    let isAdmin = user.app_metadata?.role === 'admin'

    // Fallback: lecture directe dans auth.users via le client service_role
    // — contourne tout cache JWT si le token n'a pas encore été rafraîchi
    if (!isAdmin) {
      try {
        const adminClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
        const { data: { user: dbUser }, error } = await adminClient.auth.admin.getUserById(user.id)
        if (error) {
          console.error('[proxy] admin.getUserById error:', error.message)
        } else if (dbUser) {
          isAdmin = dbUser.app_metadata?.role === 'admin'
        }
      } catch (err) {
        console.error('[proxy] service-role fallback failed:', err instanceof Error ? err.message : err)
      }
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/mon-compte/:path*', '/admin/:path*'],
}
