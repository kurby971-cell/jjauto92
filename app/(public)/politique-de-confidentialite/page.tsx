import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | JJ AUTO 92',
  description: 'Politique de confidentialité et protection des données personnelles (RGPD) de JJ AUTO 92 — J & J Automobiles SAS.',
  robots: { index: false },
  alternates: { canonical: '/politique-de-confidentialite' },
}

export default function PolitiqueConfidentialitePage() {
  const lastUpdate = '9 juin 2026'

  return (
    <>
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Politique de confidentialité', url: `${SITE_URL}/politique-de-confidentialite` },
      ])} />
      {/* Hero */}
      <div className="bg-navy">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-12 pb-14">
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-400">Politique de confidentialité</span>
          </nav>
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Protection des données</p>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-gray-500 text-sm">Dernière mise à jour : {lastUpdate} · Conforme au RGPD (UE 2016/679)</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

            {/* TOC */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-28">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4 px-2">Sommaire</p>
                <nav className="space-y-0.5 text-xs">
                  {[
                    ['responsable', '1. Responsable du traitement'],
                    ['donnees', '2. Données collectées'],
                    ['finalites', '3. Finalités & bases légales'],
                    ['destinataires', '4. Destinataires'],
                    ['conservation', '5. Durée de conservation'],
                    ['droits', '6. Vos droits'],
                    ['cookies', '7. Cookies'],
                    ['sous-traitants', '8. Sous-traitants'],
                    ['cnil', '9. Réclamation CNIL'],
                  ].map(([id, label]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="block px-3 py-2 text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-colors leading-snug"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">

              <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5">
                <p className="text-navy text-sm font-medium leading-relaxed">
                  Chez J &amp; J Automobiles, la protection de vos données personnelles est une priorité.
                  Cette politique décrit comment nous collectons, utilisons et protégeons vos informations
                  conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
                  française « Informatique et Libertés ».
                </p>
              </div>

              {/* Section 1 */}
              <section id="responsable" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  1. Responsable du traitement
                </h2>
                <div className="space-y-1.5 text-gray-600 text-sm">
                  <p><strong className="text-navy">J &amp; J Automobiles</strong> — SAS</p>
                  <p>1 Allée de Lorraine, 92000 Nanterre, France</p>
                  <p>SIREN : 929 686 970</p>
                  <p>
                    Contact :{' '}
                    <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a>
                    {' '}— <a href="tel:+33761422192" className="text-gold hover:underline">07 61 42 21 92</a>
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="donnees" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  2. Données collectées
                </h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-navy mb-1">Données d'identité</p>
                    <p>Nom, prénom, date de naissance, numéro de permis de conduire, pièce d'identité (CNI ou passeport), nationalité.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy mb-1">Données de contact</p>
                    <p>Adresse email, numéro de téléphone.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy mb-1">Données de réservation</p>
                    <p>Dates de location, véhicule sélectionné, options choisies, montants réglés, numéro de réservation.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy mb-1">Données de paiement</p>
                    <p>Les données bancaires sont traitées directement et exclusivement par Stripe. Nous ne stockons aucun numéro de carte bancaire.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy mb-1">Données de navigation</p>
                    <p>Adresse IP, type de navigateur, pages visitées — collectées via cookies techniques uniquement.</p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="finalites" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  3. Finalités et bases légales
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-navy font-bold text-xs">Finalité</th>
                        <th className="text-left py-2 text-navy font-bold text-xs">Base légale (RGPD art. 6)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y divide-gray-50">
                      {[
                        ['Gestion des réservations et contrats de location', 'Exécution du contrat'],
                        ['Traitement des paiements', 'Exécution du contrat'],
                        ['Vérification des documents conducteur', 'Obligation légale'],
                        ['Gestion des sinistres et litiges', 'Intérêt légitime / Obligation légale'],
                        ["Envoi d'emails de confirmation et de rappel", 'Exécution du contrat'],
                        ['Communications commerciales (newsletter)', 'Consentement'],
                        ["Amélioration du service et analyse d'audience", 'Intérêt légitime'],
                      ].map(([f, b]) => (
                        <tr key={f}>
                          <td className="py-2.5 pr-4 leading-snug">{f}</td>
                          <td className="py-2.5">
                            <span className="inline-block bg-navy/5 text-navy text-[11px] font-semibold px-2 py-0.5 rounded-full">{b}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 4 */}
              <section id="destinataires" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  4. Destinataires des données
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Vos données sont accessibles aux membres habilités de notre équipe dans le cadre strict de leurs missions.
                  Elles peuvent également être transmises aux sous-traitants suivants :
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Stripe, Inc.', role: 'Traitement des paiements', location: 'États-Unis (SCC)', url: 'https://stripe.com/fr/privacy' },
                    { name: 'Supabase, Inc.', role: 'Base de données et stockage des documents', location: 'États-Unis (SCC)', url: 'https://supabase.com/privacy' },
                    { name: 'Netlify, Inc.', role: 'Hébergement du site web', location: 'États-Unis (SCC)', url: 'https://www.netlify.com/privacy/' },
                  ].map((st) => (
                    <div key={st.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                      <div>
                        <p className="text-navy font-semibold text-sm">{st.name}</p>
                        <p className="text-gray-500 text-xs">{st.role} · {st.location}</p>
                        <a href={st.url} target="_blank" rel="noopener noreferrer" className="text-gold text-xs hover:underline">
                          Politique de confidentialité →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 5 */}
              <section id="conservation" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  5. Durée de conservation
                </h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <strong className="text-navy">Données clients et contrats de location :</strong> 5 ans à compter de la fin de la relation commerciale (obligation comptable).</p>
                  <p>• <strong className="text-navy">Documents d'identité (permis, CNI) :</strong> Supprimés dans les 30 jours suivant la fin de la location.</p>
                  <p>• <strong className="text-navy">Données de navigation :</strong> 13 mois maximum.</p>
                  <p>• <strong className="text-navy">Données de prospection commerciale :</strong> 3 ans à compter du dernier contact, ou jusqu'au retrait du consentement.</p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="droits" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  6. Vos droits
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { right: 'Droit d\'accès', desc: 'Obtenir une copie de vos données' },
                    { right: 'Droit de rectification', desc: 'Corriger des données inexactes' },
                    { right: 'Droit à l\'effacement', desc: 'Supprimer vos données (sous conditions)' },
                    { right: 'Droit à la portabilité', desc: 'Recevoir vos données en format structuré' },
                    { right: 'Droit d\'opposition', desc: 'S\'opposer au traitement pour intérêt légitime' },
                    { right: 'Droit à la limitation', desc: 'Suspendre le traitement de vos données' },
                  ].map(({ right, desc }) => (
                    <div key={right} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-navy font-semibold text-sm">{right}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  Pour exercer ces droits, contactez-nous à{' '}
                  <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a>.
                  Nous répondons dans un délai d'un mois.
                </p>
              </section>

              {/* Section 7 */}
              <section id="cookies" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  7. Cookies
                </h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Nous utilisons uniquement des cookies <strong className="text-navy">strictement nécessaires</strong> au fonctionnement du site (gestion de session, sécurité, préférences). Aucun cookie publicitaire ou de tracking n'est déposé.</p>
                  <p>Vous pouvez configurer votre navigateur pour refuser les cookies. Cela peut affecter certaines fonctionnalités, notamment la connexion à votre espace client.</p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="sous-traitants" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  8. Transferts hors UE
                </h2>
                <p className="text-gray-600 text-sm">
                  Certains de nos sous-traitants (Stripe, Supabase, Netlify) sont basés aux États-Unis. Ces transferts sont encadrés par des Clauses Contractuelles Types (CCT) approuvées par la Commission européenne, conformément à l'article 46 du RGPD, garantissant un niveau de protection adéquat pour vos données.
                </p>
              </section>

              {/* Section 9 */}
              <section id="cnil" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">
                  9. Réclamation auprès de la CNIL
                </h2>
                <p className="text-gray-600 text-sm">
                  Si vous estimez que le traitement de vos données personnelles n'est pas conforme au RGPD, vous avez le droit de déposer une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :{' '}
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">www.cnil.fr</a>
                  {' '}— 3 Place de Fontenoy, 75007 Paris.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
