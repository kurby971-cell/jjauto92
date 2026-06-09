'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/reservations', label: 'Réservations' },
  { href: '/admin/vehicules', label: 'Véhicules' },
  { href: '/admin/clients', label: 'Clients' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col py-6 px-3">
      <div className="font-bold text-lg mb-8 px-3">Admin JJAUTO92</div>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded text-sm ${pathname === href ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
