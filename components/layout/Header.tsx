'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/vehicules', label: 'Nos véhicules' },
  { href: '/reservation', label: 'Réservation' },
  { href: '/#confiance', label: 'Pourquoi nous' },
  { href: '/#avis', label: 'Avis clients' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-navy shadow-lg print:hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-navy font-black text-base leading-none select-none">JJ</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-extrabold text-lg leading-none tracking-widest uppercase">Auto 92</p>
              <p className="text-gold-400 text-[10px] tracking-[0.2em] uppercase">Île-de-France</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-gray-300 hover:text-gold transition-colors text-xs font-semibold tracking-widest uppercase"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+33761422192"
              className="hidden lg:flex items-center gap-1.5 text-gray-300 hover:text-gold transition-colors text-xs font-semibold tracking-widest"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              07 61 42 21 92
            </a>
            <Link
              href="/mon-compte"
              className="hidden lg:flex items-center gap-1.5 text-gray-400 hover:text-gold transition-colors text-xs font-semibold tracking-widest uppercase"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Mon compte
            </Link>
            <Link
              href="/vehicules"
              className="hidden sm:flex items-center gap-2 bg-gold hover:bg-gold-400 active:bg-gold-600 text-navy font-extrabold text-xs px-5 py-3 rounded-lg transition-colors tracking-widest uppercase"
            >
              Réserver
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-white"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              <div className="w-6 flex flex-col gap-[5px]">
                <span className={`block h-0.5 bg-current rounded transition-all duration-200 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 bg-current rounded transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-0.5 bg-current rounded transition-all duration-200 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}
        aria-hidden={!mobileOpen}
      >
        <div className="bg-navy-800 border-t border-navy-700 px-4 py-6 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block text-gray-300 hover:text-gold py-3 text-sm font-semibold tracking-widest uppercase border-b border-navy-700 last:border-0 transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/mon-compte"
            onClick={() => setMobileOpen(false)}
            className="block text-gray-400 hover:text-gold py-3 text-sm font-semibold tracking-widest uppercase transition-colors"
          >
            Mon compte
          </Link>
          <a
            href="tel:+33761422192"
            className="flex items-center gap-2 text-gray-300 hover:text-gold py-3 text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4 shrink-0 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            07 61 42 21 92
          </a>
          <div className="pt-4">
            <Link
              href="/vehicules"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center bg-gold hover:bg-gold-400 text-navy font-extrabold text-sm py-3.5 rounded-lg uppercase tracking-widest transition-colors"
            >
              Réserver maintenant
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
