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

  // Routes protégées : vérification d'authentification uniquement.
  // La vérification du rôle admin est déléguée au layout et aux API routes
  // qui disposent d'un fallback base de données (Admin API) pour fiabilité maximale.
  if (request.nextUrl.pathname.startsWith('/mon-compte') && !user) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    const next = encodeURIComponent(request.nextUrl.pathname)
    return NextResponse.redirect(new URL(`/connexion?next=${next}`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/mon-compte/:path*', '/admin/:path*'],
}
