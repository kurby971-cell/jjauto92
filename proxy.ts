import { createServerClient } from '@supabase/ssr'
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

  const { data: { user } } = await supabase.auth.getUser()

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

    // Fallback: lecture directe dans auth.users via l'Admin REST API (service_role)
    // — contourne tout cache JWT si le token n'a pas encore été rafraîchi
    if (!isAdmin) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            },
          }
        )
        if (res.ok) {
          const dbUser = await res.json()
          isAdmin = dbUser?.app_metadata?.role === 'admin'
        }
      } catch {
        // fallback silencieux — accès refusé si les deux méthodes échouent
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
