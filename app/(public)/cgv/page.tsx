import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | JJ AUTO 92',
  description: 'Conditions Générales de Vente (CGV) de JJ AUTO 92 — J & J Automobiles SAS.',
  robots: { index: false },
  alternates: { canonical: '/cgv' },
}

const planSections = [
  "Objet et champ d'application",
  'Définitions',
  "Conditions d'accès au service",
  'Processus de réservation et conclusion du contrat',
  'Tarifs et modalités de paiement',
  'Caution et garanties',
  'Prise en charge du véhicule — état des lieux de départ',
  'Obligations du locataire pendant la location',
  'Kilométrage et carburant',
  'Assurance et responsabilité',
  'Conducteurs supplémentaires',
  'Prolongation et restitution anticipée',
  'Restitution du véhicule — état des lieux de retour',
  'Retard de restitution',
  'Accidents, vols et sinistres',
  "Politique d'annulation et remboursement",
  'Données personnelles',
  'Droit applicable et résolution des litiges',
  'Modification des CGV',
  'Entrée en vigueur',
]

export default function CgvPage() {
  return (
    <>
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'CGV', url: `${SITE_URL}/cgv` },
      ])} />
      {/* Hero */}
      <div className="bg-navy">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-12 pb-14">
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-400">CGV</span>
          </nav>
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Conditions Générales</p>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-3">
            Conditions Générales de Vente
          </h1>
          <p className="text-gray-500 text-sm">J &amp; J Automobiles SAS — SIREN 929 686 970</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-8">

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="font-bold text-amber-800 text-sm mb-1">Document en cours de finalisation</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                Les Conditions Générales de Vente de J &amp; J Automobiles sont en cours de rédaction et de validation par notre conseil juridique. Elles seront publiées dans leur version définitive avant le lancement commercial du service.
              </p>
              <p className="text-amber-600 text-sm mt-3">
                Pour toute question, contactez-nous :{' '}
                <a href="mailto:contact@jjautomobiles.fr" className="underline hover:text-amber-800">contact@jjautomobiles.fr</a>
                {' '}ou{' '}
                <a href="tel:+33761422192" className="underline hover:text-amber-800">07 61 42 21 92</a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

            {/* TOC */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-28">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4 px-2">Plan des CGV</p>
                <nav className="space-y-0.5">
                  {planSections.map((section, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-1.5 rounded-lg">
                      <span className="text-gold font-bold text-[10px] shrink-0 mt-0.5">{(i + 1).toString().padStart(2, '0')}</span>
                      <span className="text-gray-500 text-xs leading-snug">{section}</span>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-5">

              {/* Identity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">Identification du bailleur</h2>
                <div className="space-y-1.5 text-gray-600 text-sm">
                  <p><strong className="text-navy">Société :</strong> J &amp; J Automobiles</p>
                  <p><strong className="text-navy">Forme juridique :</strong> SAS (Société par Actions Simplifiée)</p>
                  <p><strong className="text-navy">SIREN :</strong> 929 686 970</p>
                  <p><strong className="text-navy">Siège social :</strong> 1 Allée de Lorraine, 92000 Nanterre</p>
                  <p>
                    <strong className="text-navy">Contact :</strong>{' '}
                    <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a>
                    {' '}— <a href="tel:+33761422192" className="text-gold hover:underline">07 61 42 21 92</a>
                  </p>
                </div>
              </div>

              {/* Sections placeholder */}
              {planSections.map((section, i) => (
                <div key={i} className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 opacity-60">
                  <h2 className="text-gray-400 font-bold text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-[10px] flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    {section}
                  </h2>
                  <p className="text-gray-300 text-xs mt-2">En attente de rédaction et validation juridique.</p>
                </div>
              ))}

              {/* CTA */}
              <div className="bg-navy rounded-2xl p-6 text-center">
                <p className="text-white font-bold mb-2">Des questions sur nos conditions ?</p>
                <p className="text-gray-400 text-sm mb-5">Notre équipe peut vous répondre par téléphone ou email.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="tel:+33761422192"
                    className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-extrabold text-sm px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-gold/90 transition-colors"
                  >
                    07 61 42 21 92
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 border border-gray-600 text-gray-400 hover:text-white hover:border-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                  >
                    Formulaire de contact
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
