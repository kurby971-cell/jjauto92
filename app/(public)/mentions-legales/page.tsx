import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Mentions légales | JJ AUTO 92',
  description: "Mentions légales de JJ AUTO 92 — J & J Automobiles SAS, SIREN 929 686 970, 1 Allée de Lorraine 92000 Nanterre.",
  robots: { index: false },
  alternates: { canonical: '/mentions-legales' },
}

const sections = [
  {
    id: 'editeur',
    title: '1. Éditeur du site',
    content: (
      <div className="space-y-2 text-gray-600 text-sm leading-relaxed">
        <p><strong className="text-navy">Raison sociale :</strong> J &amp; J Automobiles</p>
        <p><strong className="text-navy">Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
        <p><strong className="text-navy">SIREN :</strong> 929 686 970</p>
        <p><strong className="text-navy">Siège social :</strong> 1 Allée de Lorraine, 92000 Nanterre, France</p>
        <p><strong className="text-navy">Email :</strong>{' '}
          <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a>
        </p>
        <p><strong className="text-navy">Téléphone :</strong>{' '}
          <a href="tel:+33761422192" className="text-gold hover:underline">07 61 42 21 92</a>
        </p>
      </div>
    ),
  },
  {
    id: 'directeur',
    title: '2. Directeur de la publication',
    content: (
      <p className="text-gray-600 text-sm leading-relaxed">
        Le directeur de la publication est le représentant légal de la société J &amp; J Automobiles SAS.
      </p>
    ),
  },
  {
    id: 'hebergeur',
    title: '3. Hébergeur',
    content: (
      <div className="space-y-2 text-gray-600 text-sm leading-relaxed">
        <p><strong className="text-navy">Société :</strong> Netlify, Inc.</p>
        <p><strong className="text-navy">Adresse :</strong> 512 2nd Street, Suite 20113, San Francisco, CA 94107, États-Unis</p>
        <p><strong className="text-navy">Site web :</strong>{' '}
          <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">www.netlify.com</a>
        </p>
      </div>
    ),
  },
  {
    id: 'propriete',
    title: '4. Propriété intellectuelle',
    content: (
      <p className="text-gray-600 text-sm leading-relaxed">
        L'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, sons, logiciels…) est la propriété exclusive de J &amp; J Automobiles SAS, à l'exception des marques, logos et contenus appartenant à d'autres sociétés partenaires ou auteurs. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de J &amp; J Automobiles SAS.
      </p>
    ),
  },
  {
    id: 'donnees',
    title: '5. Données personnelles',
    content: (
      <p className="text-gray-600 text-sm leading-relaxed">
        Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à la gestion des réservations et à la relation client. Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour exercer ces droits, contactez-nous à{' '}
        <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a>.
        Pour plus d'informations, consultez notre{' '}
        <Link href="/politique-de-confidentialite" className="text-gold hover:underline">Politique de confidentialité</Link>.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: '6. Cookies',
    content: (
      <p className="text-gray-600 text-sm leading-relaxed">
        Ce site utilise des cookies techniques strictement nécessaires au fonctionnement du site (gestion de session, préférences). Aucun cookie publicitaire ou de traçage n'est déposé sans votre consentement explicite. Vous pouvez configurer votre navigateur pour refuser les cookies, ce qui peut affecter certaines fonctionnalités du site.
      </p>
    ),
  },
  {
    id: 'liens',
    title: '7. Liens hypertextes',
    content: (
      <p className="text-gray-600 text-sm leading-relaxed">
        Ce site peut contenir des liens vers des sites tiers. J &amp; J Automobiles SAS n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou à leur politique de confidentialité. La création de liens vers ce site depuis un site tiers est soumise à l'accord préalable et écrit de J &amp; J Automobiles SAS.
      </p>
    ),
  },
  {
    id: 'droit',
    title: '8. Droit applicable et juridiction compétente',
    content: (
      <p className="text-gray-600 text-sm leading-relaxed">
        Les présentes mentions légales sont soumises au droit français. En cas de litige et après tentative de résolution amiable, les tribunaux du ressort du siège social de J &amp; J Automobiles SAS (Nanterre) seront seuls compétents.
      </p>
    ),
  },
  {
    id: 'contact-legal',
    title: '9. Contact',
    content: (
      <p className="text-gray-600 text-sm leading-relaxed">
        Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :{' '}
        <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a>
        {' '}— 07 61 42 21 92 — 1 Allée de Lorraine, 92000 Nanterre.
      </p>
    ),
  },
]

export default function MentionsLegalesPage() {
  const lastUpdate = '9 juin 2026'

  return (
    <>
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Mentions légales', url: `${SITE_URL}/mentions-legales` },
      ])} />
      {/* Hero */}
      <div className="bg-navy">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-12 pb-14">
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-400">Mentions légales</span>
          </nav>
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Informations légales</p>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-3">
            Mentions légales
          </h1>
          <p className="text-gray-500 text-sm">Dernière mise à jour : {lastUpdate}</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

            {/* TOC */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-28">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4 px-2">Sommaire</p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block px-3 py-2 text-xs text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-colors leading-snug"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3 space-y-8">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">{s.title}</h2>
                  {s.content}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
