import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy text-gray-400 print:hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center shrink-0">
                <span className="text-navy font-black text-base select-none">JJ</span>
              </div>
              <div>
                <p className="text-white font-extrabold text-lg leading-none tracking-widest uppercase">Auto 92</p>
                <p className="text-gold-400 text-[10px] tracking-[0.2em] uppercase">Nanterre</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Location de véhicules premium à Nanterre. Qualité, fiabilité et service irréprochable depuis 2019.
            </p>
            <div className="flex gap-3 mt-6">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-navy-700 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-navy-700 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.2em] mb-6">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/vehicules" className="hover:text-gold transition-colors">Nos véhicules</Link></li>
              <li><Link href="/reservation" className="hover:text-gold transition-colors">Faire une réservation</Link></li>
              <li><Link href="/connexion" className="hover:text-gold transition-colors">Se connecter</Link></li>
              <li><Link href="/inscription" className="hover:text-gold transition-colors">Créer un compte</Link></li>
              <li><Link href="/mon-compte/reservations" className="hover:text-gold transition-colors">Mes réservations</Link></li>
            </ul>
          </div>

          {/* Infos */}
          <div>
            <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.2em] mb-6">Infos pratiques</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/faq#documents" className="hover:text-gold transition-colors">Documents requis</Link></li>
              <li><Link href="/faq#conduite-assurance" className="hover:text-gold transition-colors">Assurances et cautions</Link></li>
              <li><Link href="/faq#retour-sinistres" className="hover:text-gold transition-colors">Politique de carburant</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.2em] mb-6">Contact</h3>
            <address className="not-italic text-sm space-y-4">
              <p className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>1 Allée de Lorraine<br />92000 Nanterre</span>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <a href="tel:+33761422192" className="hover:text-gold transition-colors">07 61 42 21 92</a>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:contact@jjautomobiles.fr" className="hover:text-gold transition-colors">contact@jjautomobiles.fr</a>
              </p>
              <p className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Lun–Sam : 8h–19h<br />Dimanche : 9h–14h</span>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {year} J&amp;J Automobiles. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="hover:text-gold transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-gold transition-colors">CGV</Link>
            <Link href="/politique-de-confidentialite" className="hover:text-gold transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
