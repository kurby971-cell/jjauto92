import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Contact — JJ AUTO 92',
  description: 'Contactez JJ AUTO 92 pour toute question sur la location de véhicules en Île-de-France. Appelez le 07 61 42 21 92 ou utilisez notre formulaire en ligne.',
  alternates: { canonical: '/contact' },
}

// Remplacez VOTRE_FORM_ID par votre identifiant de formulaire Tally (ex: wMeKJ7)
const TALLY_FORM_ID = process.env.NEXT_PUBLIC_TALLY_FORM_ID ?? ''

const infos = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Téléphone',
    value: '07 61 42 21 92',
    href: 'tel:+33761422192',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'contact@jjautomobiles.fr',
    href: 'mailto:contact@jjautomobiles.fr',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Adresse',
    value: '1 Allée de Lorraine\n92000 Nanterre',
    href: 'https://maps.google.com/?q=1+Allée+de+Lorraine+92000+Nanterre',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Horaires',
    value: 'Lun – Sam : 8h – 19h\nDimanche : 9h – 14h',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Contact', url: `${SITE_URL}/contact` },
      ])} />
      {/* Hero */}
      <div className="bg-navy">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-12 pb-14">
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-400">Contact</span>
          </nav>
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Nous contacter</p>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-4">
            Une question ? On est là.
          </h1>
          <p className="text-gray-400 text-base max-w-xl">
            Notre équipe répond du lundi au samedi de 8h à 19h. Pour les urgences, appelez directement.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Left: info + map */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact cards */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Coordonnées</p>
                {infos.map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <span className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center text-navy shrink-0">
                      {info.icon}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          target={info.href.startsWith('http') ? '_blank' : undefined}
                          rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-navy font-semibold text-sm hover:text-gold transition-colors whitespace-pre-line"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-navy font-semibold text-sm whitespace-pre-line">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA phone */}
              <a
                href="tel:+33761422192"
                className="flex items-center justify-center gap-3 bg-gold text-navy font-extrabold text-sm px-6 py-4 rounded-xl uppercase tracking-widest hover:bg-gold/90 transition-colors w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Appeler : 07 61 42 21 92
              </a>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <iframe
                  title="Localisation JJ AUTO 92 — 1 Allée de Lorraine, Nanterre"
                  src="https://maps.google.com/maps?q=1+All%C3%A9e+de+Lorraine+92000+Nanterre+France&t=m&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="240"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                  <a
                    href="https://maps.google.com/?q=1+Allée+de+Lorraine+92000+Nanterre+France"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-navy font-semibold hover:text-gold transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Voir sur Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Tally form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">Formulaire de contact</p>
                  <p className="text-navy font-extrabold text-lg">Envoyez-nous un message</p>
                  <p className="text-gray-500 text-sm mt-1">Réponse sous 24h les jours ouvrés.</p>
                </div>

                {TALLY_FORM_ID ? (
                  <iframe
                    src={`https://tally.so/r/${TALLY_FORM_ID}?transparentBackground=1`}
                    width="100%"
                    height="600"
                    style={{ border: 0, display: 'block' }}
                    title="Formulaire de contact JJ AUTO 92"
                    loading="lazy"
                  />
                ) : (
                  /* Fallback when NEXT_PUBLIC_TALLY_FORM_ID is not set */
                  <div className="p-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-navy font-bold text-base">Formulaire en cours de configuration</p>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      En attendant, contactez-nous directement par téléphone ou par email.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <a
                        href="tel:+33761422192"
                        className="inline-flex items-center justify-center gap-2 bg-navy text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-navy/90 transition-colors"
                      >
                        07 61 42 21 92
                      </a>
                      <a
                        href="mailto:contact@jjautomobiles.fr"
                        className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:text-navy hover:border-navy font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
                      >
                        contact@jjautomobiles.fr
                      </a>
                    </div>
                    <p className="text-[11px] text-gray-400 pt-2">
                      Pour activer le formulaire : définissez{' '}
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_TALLY_FORM_ID</code>
                      {' '}dans votre fichier <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">.env.local</code>
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
