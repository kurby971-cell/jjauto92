import type { Metadata } from 'next'
import Link from 'next/link'
import FaqAccordion, { type FaqCategory } from '@/components/faq/FaqAccordion'
import JsonLd from '@/components/JsonLd'
import { breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes | JJ AUTO 92',
  description: 'Réponses à toutes vos questions sur la location de véhicules JJ AUTO 92 : réservation, paiement, caution, documents, assurance et retour.',
  alternates: { canonical: '/faq' },
}

const categories: FaqCategory[] = [
  {
    id: 'reservation',
    title: 'Réservation',
    icon: '📅',
    questions: [
      {
        q: 'Comment réserver un véhicule ?',
        a: "Choisissez votre véhicule dans notre catalogue, sélectionnez vos dates et suivez les 3 étapes de réservation en ligne : récapitulatif du prix, informations conducteur et paiement sécurisé. Vous pouvez aussi nous appeler au 07 61 42 21 92 du lundi au samedi de 8h à 19h.",
      },
      {
        q: 'Puis-je modifier ou annuler ma réservation ?',
        a: "Oui, toute annulation est gratuite jusqu'à 48 heures avant le début de la location. Au-delà de ce délai, des frais d'annulation peuvent s'appliquer selon les conditions de votre contrat. Contactez-nous au 07 61 42 21 92 pour toute demande.",
      },
      {
        q: 'Quelle est la durée minimale de location ?',
        a: "La durée minimale est de 24 heures (1 journée). Des tarifs dégressifs s'appliquent à partir de 3 jours, 7 jours (semaine) et 30 jours (mois). Ces tarifs sont visibles sur la fiche de chaque véhicule.",
      },
      {
        q: 'Puis-je prolonger ma location en cours ?',
        a: "Oui, sous réserve de disponibilité du véhicule. Contactez-nous avant l'heure prévue de retour au 07 61 42 21 92 pour vérifier la disponibilité et régulariser les jours supplémentaires.",
      },
    ],
  },
  {
    id: 'paiement-caution',
    title: 'Paiement & Caution',
    icon: '💳',
    questions: [
      {
        q: 'Quels moyens de paiement sont acceptés ?',
        a: "Nous acceptons les cartes Visa, Mastercard et American Express via Stripe, 100 % sécurisé. Les paiements en espèces ne sont pas acceptés pour des raisons de traçabilité.",
      },
      {
        q: 'À quoi sert la caution et quand est-elle restituée ?',
        a: "La caution est une préautorisation bancaire (non débitée) qui couvre d'éventuels dommages ou retards. En l'absence d'incident, elle est libérée dans un délai de 5 à 10 jours ouvrés après le retour du véhicule.",
      },
      {
        q: 'Le montant de la caution varie-t-il selon le véhicule ?',
        a: "Oui, chaque véhicule a un montant de caution affiché sur sa fiche. Il varie entre 500 € et 2 000 € selon la catégorie et la valeur du véhicule. Ce montant est communiqué clairement avant confirmation de la réservation.",
      },
      {
        q: 'Y a-t-il des frais cachés ?',
        a: "Non. Le prix affiché inclut l'assurance de base, le kilométrage journalier et toutes les taxes. Vous ne payez que ce qui est affiché, plus les options que vous choisissez librement lors de la réservation.",
      },
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: '📋',
    questions: [
      {
        q: 'Quels documents faut-il fournir pour louer ?',
        a: "Le conducteur principal doit présenter : un permis de conduire valide (obtenu depuis au moins 2 ans), une pièce d'identité en cours de validité (CNI ou passeport) et la carte bancaire utilisée pour la réservation, au nom du conducteur.",
      },
      {
        q: 'Mon permis de conduire étranger est-il accepté ?',
        a: "Les permis délivrés dans un pays de l'UE ou de l'EEE sont acceptés sans traduction. Pour les permis hors UE/EEE, un permis international reconnu par la France est obligatoire.",
      },
      {
        q: "Quel est l'âge minimum pour louer un véhicule ?",
        a: "Le conducteur principal doit avoir au moins 21 ans et être titulaire du permis depuis au minimum 2 ans. Pour certains véhicules de catégorie supérieure, l'âge minimum est porté à 25 ans — précisé sur la fiche véhicule.",
      },
      {
        q: 'Puis-je ajouter un conducteur supplémentaire ?',
        a: "Oui, moyennant un supplément journalier. Le conducteur additionnel doit présenter les mêmes documents et être présent lors de la prise en charge pour signer le contrat.",
      },
    ],
  },
  {
    id: 'conduite-assurance',
    title: 'Conduite & Assurance',
    icon: '🛡️',
    questions: [
      {
        q: "Quelle assurance est incluse dans la location ?",
        a: "Une assurance responsabilité civile (RC) est incluse dans chaque location — elle couvre les dommages causés à des tiers. Des options complémentaires sont disponibles : réduction de franchise, protection conducteur, assistance étendue.",
      },
      {
        q: "Que faire en cas d'accident ?",
        a: "Sécurisez la zone, appelez le 15 (SAMU) ou le 17 (Police) si nécessaire, établissez un constat amiable, prenez des photos et contactez-nous immédiatement au 07 61 42 21 92. N'engagez aucune réparation sans notre accord écrit préalable.",
      },
      {
        q: "Puis-je utiliser le véhicule à l'étranger ?",
        a: "Les déplacements en France métropolitaine et dans les pays de l'UE sont autorisés. Tout voyage hors UE nécessite une autorisation écrite de notre part, demandée au minimum 48h avant le départ.",
      },
      {
        q: "Que se passe-t-il en cas de panne mécanique ?",
        a: "En cas de panne non imputable au conducteur, contactez-nous en priorité au 07 61 42 21 92 (lun–sam 8h–19h). Une assistance et, dans la mesure du possible, un véhicule de remplacement seront organisés.",
      },
    ],
  },
  {
    id: 'retour-sinistres',
    title: 'Retour & Sinistres',
    icon: '🔑',
    questions: [
      {
        q: 'Comment se déroule le retour du véhicule ?',
        a: "Le véhicule est restitué au 1 Allée de Lorraine, 92000 Nanterre, à l'heure prévue au contrat. Un état des lieux contradictoire est réalisé en présence du client. Le véhicule doit être rendu propre et avec le niveau de carburant du départ.",
      },
      {
        q: 'Que se passe-t-il si je rends le véhicule en retard ?',
        a: "Une tolérance de 30 minutes est accordée. Au-delà, une heure supplémentaire est facturée au tarif en vigueur. Plus de 3 heures de retard entraînent la facturation d'une journée entière. Prévenez-nous dès que possible au 07 61 42 21 92.",
      },
      {
        q: 'Quelle est la politique concernant le carburant ?',
        a: 'Principe "plein départ / plein retour". Le véhicule vous est remis avec un plein complet et doit être restitué dans le même état. En cas de retour avec un niveau inférieur, le carburant manquant est facturé au prix du marché majoré de 15 € de frais de gestion.',
      },
      {
        q: 'Que faire si je constate un dommage lors de la prise en charge ?',
        a: "Tout dommage préexistant doit être signalé et inscrit sur l'état des lieux de départ avant de prendre le volant. Aucun dommage non répertorié ne pourra être contesté ultérieurement. Ne partez jamais sans état des lieux signé contradictoirement.",
      },
    ],
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: categories.flatMap((cat) =>
    cat.questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
  ),
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'FAQ', url: `${SITE_URL}/faq` },
      ])} />

      {/* Hero */}
      <div className="bg-navy">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-12 pb-14">
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-400">FAQ</span>
          </nav>
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Questions fréquentes</p>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-4">
            Tout ce que vous devez savoir
          </h1>
          <p className="text-gray-400 text-base max-w-xl">
            {categories.reduce((s, c) => s + c.questions.length, 0)} réponses réparties en{' '}
            {categories.length} catégories. Une question non couverte ?{' '}
            <a href="tel:+33761422192" className="text-gold hover:underline">Appelez-nous.</a>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
          <FaqAccordion categories={categories} />
        </div>

        {/* Bottom CTA */}
        <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-16">
          <div className="bg-navy rounded-2xl p-8 text-center">
            <p className="text-white font-bold text-lg mb-2">Votre question n'est pas listée ?</p>
            <p className="text-gray-400 text-sm mb-6">Notre équipe répond du lundi au samedi de 8h à 19h.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+33761422192"
                className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-extrabold text-sm px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-gold/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
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
    </>
  )
}
