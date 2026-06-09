'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  pendingCount: number
  docsCount: number
  userEmail: string
}

const NavIcon = ({ d }: { d: string }) => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
  </svg>
)

const navLinks = [
  {
    href: '/admin',
    label: 'Tableau de bord',
    exact: true,
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    href: '/admin/reservations',
    label: 'Réservations',
    exact: false,
    badge: 'pending',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    href: '/admin/vehicules',
    label: 'Flotte',
    exact: false,
    icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l-2 1M13 16V6m0 10h5l2-1V8a1 1 0 00-.44-.82L18 6h-5v10z',
  },
  {
    href: '/admin/cautions',
    label: 'Cautions',
    exact: false,
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    href: '/admin/documents',
    label: 'Documents',
    exact: false,
    badge: 'docs',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/admin/clients',
    label: 'Clients',
    exact: false,
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

export default function AdminSidebar({ pendingCount, docsCount, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href) && href !== '/admin'
  }

  function getBadgeCount(badge: string | undefined) {
    if (badge === 'pending') return pendingCount
    if (badge === 'docs') return docsCount
    return 0
  }

  return (
    <aside className="w-60 shrink-0 min-h-screen bg-[#0D1B2A] flex flex-col border-r border-white/5">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#0D1B2A] font-black text-sm select-none">JJ</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">JJ AUTO 92</p>
            <p className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-widest mt-0.5">
              Administration
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-3 py-2">
          Menu
        </p>
        {navLinks.map(({ href, label, exact, badge, icon }) => {
          const active = isActive(href, exact)
          const count = badge ? getBadgeCount(badge) : 0

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <NavIcon d={icon} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="bg-[#C9A84C] text-[#0D1B2A] text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Shortcut: view site */}
      <div className="px-3 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:text-gray-400 hover:bg-white/5 text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Voir le site
        </a>
      </div>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
            <span className="text-[#C9A84C] text-xs font-bold">
              {userEmail[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{userEmail}</p>
            <p className="text-gray-500 text-[10px]">Administrateur</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
