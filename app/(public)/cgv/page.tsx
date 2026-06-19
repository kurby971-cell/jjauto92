import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | JJ AUTO 92',
  description: 'Conditions Générales de Vente (CGV) de JJ AUTO 92 — J & J Automobiles SAS.',
  robots: { index: true },
  alternates: { canonical: '/cgv' },
}

export default function CgvPage() {
  return (
    <>
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'CGV', url: `${SITE_URL}/cgv` },
      ])} />

      <div className="bg-navy">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-12 pb-14">
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-400">CGV</span>
          </nav>
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Conditions Générales</p>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-3">
            Conditions Générales de Location
          </h1>
          <p className="text-gray-500 text-sm">J &amp; J Automobiles SAS — SIREN 929 686 970 — Version en vigueur au 1er janvier 2025</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

            {/* Table des matières */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-28">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4 px-2">Sommaire</p>
                <nav className="space-y-0.5 text-xs">
                  {[
                    ['#art1', '1. Objet'],
                    ['#art2', '2. Définitions'],
                    ['#art3', '3. Conditions d\'accès'],
                    ['#art4', '4. Réservation'],
                    ['#art5', '5. Tarifs & paiement'],
                    ['#art6', '6. Caution'],
                    ['#art7', '7. Prise en charge'],
                    ['#art8', '8. Obligations du locataire'],
                    ['#art9', '9. Kilométrage & carburant'],
                    ['#art10', '10. Assurance'],
                    ['#art11', '11. Conducteurs suppl.'],
                    ['#art12', '12. Prolongation'],
                    ['#art13', '13. Restitution'],
                    ['#art14', '14. Retard'],
                    ['#art15', '15. Accidents & sinistres'],
                    ['#art16', '16. Annulation'],
                    ['#art17', '17. Données personnelles'],
                    ['#art18', '18. Droit applicable'],
                    ['#art19', '19. Modification'],
                    ['#art20', '20. Entrée en vigueur'],
                  ].map(([href, label]) => (
                    <a key={href} href={href} className="flex items-start gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-navy transition-colors">
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Contenu */}
            <div className="lg:col-span-3 space-y-6 text-sm text-gray-700 leading-relaxed">

              {/* Identification */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-4 pb-3 border-b border-gray-100">Identification du bailleur</h2>
                <div className="space-y-1.5">
                  <p><strong className="text-navy">Société :</strong> J &amp; J Automobiles</p>
                  <p><strong className="text-navy">Forme juridique :</strong> SAS (Société par Actions Simplifiée)</p>
                  <p><strong className="text-navy">SIREN :</strong> 929 686 970</p>
                  <p><strong className="text-navy">Siège social :</strong> 1 Allée de Lorraine, 92000 Nanterre</p>
                  <p><strong className="text-navy">Téléphone :</strong> <a href="tel:+33761422192" className="text-gold hover:underline">07 61 42 21 92</a></p>
                  <p><strong className="text-navy">Email :</strong> <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a></p>
                </div>
              </div>

              {/* Art. 1 */}
              <div id="art1" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 1 — Objet et champ d&apos;application</h2>
                <p>Les présentes Conditions Générales de Location (CGL) régissent l&apos;ensemble des relations contractuelles entre J &amp; J Automobiles SAS, ci-après le « Loueur », et toute personne physique ou morale, ci-après le « Locataire », souhaitant louer un véhicule automobile auprès de JJ AUTO 92.</p>
                <p className="mt-3">Ces CGL s&apos;appliquent à toute réservation effectuée via le site internet <strong>jjautomobiles.fr</strong>, par téléphone ou en personne à l&apos;agence. Toute réservation implique l&apos;acceptation pleine et entière des présentes conditions.</p>
              </div>

              {/* Art. 2 */}
              <div id="art2" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 2 — Définitions</h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Loueur :</strong> J &amp; J Automobiles SAS, propriétaire des véhicules mis à disposition.</li>
                  <li><strong>Locataire :</strong> toute personne ayant conclu un contrat de location avec le Loueur.</li>
                  <li><strong>Conducteur principal :</strong> le Locataire, signataire du contrat et titulaire du permis de conduire.</li>
                  <li><strong>Conducteur supplémentaire :</strong> toute personne additionnelle autorisée à conduire le véhicule, désignée au contrat.</li>
                  <li><strong>Véhicule :</strong> automobile mise à disposition par le Loueur selon les caractéristiques figurant au contrat.</li>
                  <li><strong>Contrat de location :</strong> accord formalisé entre le Loueur et le Locataire, constitué du devis, des présentes CGL et de l&apos;état des lieux.</li>
                  <li><strong>Caution :</strong> préautorisation bancaire bloquée sur la carte du Locataire en garantie des dommages ou surcoûts éventuels.</li>
                  <li><strong>Franchise :</strong> montant restant à la charge du Locataire en cas de sinistre.</li>
                </ul>
              </div>

              {/* Art. 3 */}
              <div id="art3" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 3 — Conditions d&apos;accès au service</h2>
                <p>Pour louer un véhicule auprès de JJ AUTO 92, le Locataire doit satisfaire cumulativement aux conditions suivantes :</p>
                <ul className="space-y-2 mt-3 list-disc list-inside">
                  <li>Être âgé d&apos;au moins <strong>21 ans</strong> révolus à la date de prise en charge du véhicule.</li>
                  <li>Être titulaire d&apos;un permis de conduire B valide depuis au minimum <strong>2 ans</strong>, en cours de validité, non suspendu ni annulé.</li>
                  <li>Présenter une <strong>pièce d&apos;identité valide</strong> (carte nationale d&apos;identité, passeport ou titre de séjour) lors de la prise en charge.</li>
                  <li>Disposer d&apos;une carte bancaire à son nom pour le règlement de la location et la préautorisation de la caution.</li>
                  <li>Ne pas figurer sur la liste noire interne du Loueur pour manquements antérieurs.</li>
                </ul>
                <p className="mt-3">Le Loueur se réserve le droit de refuser la remise des clés si l&apos;un de ces critères n&apos;est pas rempli le jour de la prise en charge, sans obligation de remboursement des frais d&apos;annulation le cas échéant.</p>
              </div>

              {/* Art. 4 */}
              <div id="art4" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 4 — Processus de réservation et conclusion du contrat</h2>
                <p><strong>4.1 Réservation en ligne.</strong> La réservation est effectuée via le formulaire disponible sur jjautomobiles.fr. Elle est considérée comme ferme et définitive à réception de la confirmation de paiement émise par notre système.</p>
                <p className="mt-3"><strong>4.2 Paiement anticipé.</strong> Le montant total de la location est encaissé au moment de la réservation. Aucune option de paiement différé n&apos;est proposée.</p>
                <p className="mt-3"><strong>4.3 Confirmation.</strong> Un email de confirmation récapitulant les modalités (véhicule, dates, tarif, lieu de prise en charge) est envoyé au Locataire dans les minutes suivant le paiement.</p>
                <p className="mt-3"><strong>4.4 Modification de réservation.</strong> Toute modification est soumise à disponibilité et aux conditions tarifaires en vigueur au moment de la demande. Les demandes de modification doivent être formulées au moins <strong>48 heures</strong> avant la date de prise en charge, par téléphone ou email.</p>
              </div>

              {/* Art. 5 */}
              <div id="art5" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 5 — Tarifs et modalités de paiement</h2>
                <p><strong>5.1 Tarifs.</strong> Les tarifs applicables sont ceux affichés sur le site au moment de la réservation. Ils s&apos;entendent toutes taxes comprises (TTC) et comprennent : la mise à disposition du véhicule, le kilométrage contractuellement inclus, et l&apos;assurance de base.</p>
                <p className="mt-3"><strong>5.2 Tarifs dégressifs.</strong> Des tarifs spéciaux peuvent s&apos;appliquer selon la durée de location :</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Tarif week-end :</strong> tarif forfaitaire pour une location de 2 à 3 jours débutant un vendredi ou samedi.</li>
                  <li><strong>Tarif hebdomadaire :</strong> tarif forfaitaire pour une location de 7 jours consécutifs ou plus.</li>
                  <li><strong>Tarif mensuel :</strong> tarif forfaitaire pour une location de 30 jours consécutifs ou plus.</li>
                </ul>
                <p className="mt-3"><strong>5.3 Suppléments.</strong> Les services optionnels (siège enfant, GPS, conducteur supplémentaire, etc.) font l&apos;objet d&apos;une facturation complémentaire selon le tarif en vigueur. Les suppléments pour kilométrage excédentaire, carburant manquant ou dommages sont facturés en fin de location.</p>
                <p className="mt-3"><strong>5.4 Paiement.</strong> Le paiement s&apos;effectue exclusivement par carte bancaire (Visa, Mastercard, American Express) via la plateforme sécurisée Stripe. Aucun paiement en espèces ni par chèque n&apos;est accepté pour le règlement de la location.</p>
              </div>

              {/* Art. 6 */}
              <div id="art6" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 6 — Caution et garanties</h2>
                <p><strong>6.1 Préautorisation.</strong> Lors de la prise en charge du véhicule, ou lors de la réservation en ligne, une <strong>préautorisation bancaire</strong> (caution) est effectuée sur la carte du Locataire. Son montant est précisé sur la fiche du véhicule loué. Il ne s&apos;agit pas d&apos;un débit mais d&apos;un blocage temporaire de la somme.</p>
                <p className="mt-3"><strong>6.2 Libération.</strong> La préautorisation est libérée sans délai à la restitution du véhicule, sous réserve de l&apos;absence de dommage, de kilométrage excédentaire, de carburant manquant, ou d&apos;amendes en cours. En l&apos;absence de litige, la somme est libérée dans un délai de 5 à 7 jours ouvrés selon les délais bancaires.</p>
                <p className="mt-3"><strong>6.3 Capture partielle ou totale.</strong> En cas de dommages, d&apos;excédent kilométrique, de carburant manquant ou de tout autre frais imputable au Locataire, le Loueur se réserve le droit de capturer tout ou partie de la caution à due concurrence des frais réels engagés, et ce sans préjudice d&apos;un recours complémentaire si les frais excèdent le montant de la caution.</p>
                <p className="mt-3"><strong>6.4 Validité.</strong> La préautorisation bancaire est valable 7 jours. Pour les locations d&apos;une durée supérieure, une nouvelle préautorisation pourra être demandée en cours de location.</p>
              </div>

              {/* Art. 7 */}
              <div id="art7" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 7 — Prise en charge du véhicule — État des lieux de départ</h2>
                <p><strong>7.1 Lieu et horaires.</strong> Le véhicule est mis à disposition au <strong>1 Allée de Lorraine, 92000 Nanterre</strong>, aux horaires convenus lors de la réservation (par défaut à partir de 9h00). Tout retard de plus de 2 heures sans notification préalable pourra entraîner l&apos;annulation de la réservation sans remboursement.</p>
                <p className="mt-3"><strong>7.2 Documents à présenter.</strong> Le Locataire doit présenter à la prise en charge : permis de conduire original en cours de validité, pièce d&apos;identité originale, et la carte bancaire utilisée pour le paiement.</p>
                <p className="mt-3"><strong>7.3 État des lieux.</strong> Un état des lieux contradictoire est établi au départ et à la restitution. Il consigne l&apos;état extérieur et intérieur du véhicule, le niveau de carburant, le kilométrage et les accessoires présents. Le Locataire est invité à signaler toute anomalie non mentionnée avant de signer.</p>
                <p className="mt-3"><strong>7.4 Refus de prise en charge.</strong> Si le Locataire refuse de signer l&apos;état des lieux de départ ou ne réunit pas les documents requis, le Loueur peut refuser la remise des clés. Les frais d&apos;annulation s&apos;appliquent selon l&apos;article 16.</p>
              </div>

              {/* Art. 8 */}
              <div id="art8" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 8 — Obligations du Locataire pendant la location</h2>
                <p>Pendant toute la durée de la location, le Locataire s&apos;engage à :</p>
                <ul className="mt-3 space-y-2 list-disc list-inside">
                  <li>Utiliser le véhicule en bon père de famille, conformément aux lois et règlements en vigueur.</li>
                  <li>Ne pas sous-louer le véhicule, ni le céder à titre onéreux ou gratuit à un tiers non désigné au contrat.</li>
                  <li>Ne pas conduire sous l&apos;emprise de l&apos;alcool (taux légal en vigueur) ou de substances psychoactives.</li>
                  <li>Ne pas utiliser le véhicule pour des courses automobiles, tests de vitesse, rallyes ou toute compétition.</li>
                  <li>Ne pas transporter de marchandises dangereuses, de matières inflammables ou illicites.</li>
                  <li>Ne pas circuler en dehors du territoire métropolitain français sans autorisation écrite préalable du Loueur.</li>
                  <li>Respecter les capacités de charge et de remorquage du véhicule.</li>
                  <li>Maintenir le véhicule en bon état de propreté et procéder aux vérifications de base (niveaux d&apos;huile, pression des pneus) lors d&apos;une location longue durée.</li>
                  <li>Signaler immédiatement au Loueur tout accident, vol, dommage ou panne, et ne jamais quitter les lieux d&apos;un accident sans avoir établi un constat amiable.</li>
                </ul>
                <p className="mt-3">Tout manquement à ces obligations engage la responsabilité exclusive du Locataire et peut entraîner la résiliation immédiate du contrat, la facturation des frais de rapatriement du véhicule, et la perte de toute couverture assurantielle.</p>
              </div>

              {/* Art. 9 */}
              <div id="art9" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 9 — Kilométrage et carburant</h2>
                <p><strong>9.1 Kilométrage inclus.</strong> Chaque véhicule dispose d&apos;un forfait kilométrique journalier contractuellement inclus, précisé sur la fiche du véhicule. Tout kilométrage parcouru au-delà du forfait est facturé au tarif indiqué (prix par kilomètre excédentaire affiché sur la fiche véhicule).</p>
                <p className="mt-3"><strong>9.2 Carburant.</strong> Le véhicule est remis avec un niveau de carburant précisé à l&apos;état des lieux de départ. Il doit être restitué avec le même niveau. En cas de niveau inférieur à la restitution, le coût du remplissage sera facturé au prix pompe du jour, majoré de <strong>10 €</strong> de frais de gestion.</p>
                <p className="mt-3"><strong>9.3 Type de carburant.</strong> Le Locataire est responsable de l&apos;utilisation du carburant correct indiqué sur le contrat et dans le véhicule. En cas de mauvais carburant, tous les frais de dépannage et de réparation sont intégralement à la charge du Locataire.</p>
              </div>

              {/* Art. 10 */}
              <div id="art10" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 10 — Assurance et responsabilité</h2>
                <p><strong>10.1 Couverture de base.</strong> Tous les véhicules bénéficient d&apos;une assurance responsabilité civile obligatoire conforme à la législation française, couvrant les dommages causés aux tiers.</p>
                <p className="mt-3"><strong>10.2 Franchise.</strong> En cas de sinistre impliquant le véhicule loué, une franchise reste à la charge du Locataire. Son montant est précisé sur la fiche du véhicule et/ou sur le contrat de location.</p>
                <p className="mt-3"><strong>10.3 Exclusions.</strong> Sont exclus de toute prise en charge par l&apos;assureur, et restent intégralement à la charge du Locataire :</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Les dommages survenus en cas d&apos;alcoolémie ou d&apos;emprise de stupéfiants.</li>
                  <li>Les dommages causés lors d&apos;une utilisation non autorisée (compétition, transport rémunéré illégal, etc.).</li>
                  <li>Les dommages aux pneumatiques, jantes, vitres et rétroviseurs (sauf garantie complémentaire souscrite).</li>
                  <li>Le vol du véhicule résultant d&apos;une négligence du Locataire (clés laissées sur le contact, véhicule non fermé).</li>
                  <li>Les dommages causés à l&apos;intérieur du véhicule.</li>
                </ul>
                <p className="mt-3"><strong>10.4 Dommages non accidentels.</strong> Les frais de nettoyage extraordinaire (vomissures, odeurs de tabac, etc.) et les dommages résultant d&apos;une mauvaise utilisation (passage en boîte automatique, freinage excessif) sont facturés intégralement au Locataire.</p>
              </div>

              {/* Art. 11 */}
              <div id="art11" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 11 — Conducteurs supplémentaires</h2>
                <p>Un ou plusieurs conducteurs supplémentaires peuvent être autorisés à conduire le véhicule, sous réserve de remplir les conditions de l&apos;article 3 (âge, permis de conduire valide depuis 2 ans). Chaque conducteur supplémentaire doit être désigné <strong>au moment de la prise en charge</strong> et présenter son permis de conduire original.</p>
                <p className="mt-3">La désignation d&apos;un conducteur supplémentaire peut faire l&apos;objet d&apos;un supplément tarifaire. Tout conducteur non désigné au contrat engage la responsabilité entière du Locataire signataire en cas de sinistre, et peut entraîner la perte de toute couverture d&apos;assurance.</p>
              </div>

              {/* Art. 12 */}
              <div id="art12" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 12 — Prolongation et restitution anticipée</h2>
                <p><strong>12.1 Prolongation.</strong> Toute prolongation de la durée de location doit être expressément autorisée par le Loueur avant la date de retour prévue. La prolongation sera facturée au tarif journalier standard en vigueur, sous réserve de disponibilité du véhicule. Une prolongation non autorisée constitue une rétention abusive du véhicule et engage la responsabilité civile et pénale du Locataire.</p>
                <p className="mt-3"><strong>12.2 Restitution anticipée.</strong> En cas de restitution avant la date prévue, aucun remboursement du montant déjà payé ne sera effectué. La durée de location facturée est celle initialement convenue.</p>
              </div>

              {/* Art. 13 */}
              <div id="art13" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 13 — Restitution du véhicule — État des lieux de retour</h2>
                <p><strong>13.1 Lieu et horaires.</strong> Le véhicule doit être restitué au <strong>1 Allée de Lorraine, 92000 Nanterre</strong>, à la date et heure convenues (par défaut avant 18h00). Tout retour en dehors de ces horaires doit faire l&apos;objet d&apos;un accord préalable.</p>
                <p className="mt-3"><strong>13.2 Conditions de restitution.</strong> Le véhicule doit être restitué dans l&apos;état dans lequel il a été remis : propre, avec le niveau de carburant contractuel, exempt de nouveaux dommages, accompagné de tous les accessoires fournis (clés, carte grise, etc.).</p>
                <p className="mt-3"><strong>13.3 État des lieux de retour.</strong> Un état des lieux contradictoire est établi à la restitution en présence des deux parties. Si le Locataire n&apos;est pas présent au moment de la restitution, l&apos;état des lieux est établi unilatéralement par le Loueur et sera opposable au Locataire, sauf contestation écrite dans les <strong>48 heures</strong> suivant la restitution.</p>
              </div>

              {/* Art. 14 */}
              <div id="art14" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 14 — Retard de restitution</h2>
                <p>En cas de retard de restitution non autorisé :</p>
                <ul className="mt-3 space-y-2 list-disc list-inside">
                  <li>Un supplément de <strong>50 % du tarif journalier</strong> est facturé par heure entière de retard au-delà d&apos;une franchise de <strong>30 minutes</strong>.</li>
                  <li>Au-delà de <strong>3 heures</strong> de retard, une journée supplémentaire complète est facturée.</li>
                  <li>Le Loueur se réserve le droit de facturer les frais liés au préjudice subi (location de substitution, perte d&apos;exploitation) si le retard compromet une autre réservation.</li>
                </ul>
              </div>

              {/* Art. 15 */}
              <div id="art15" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 15 — Accidents, vols et sinistres</h2>
                <p><strong>15.1 Obligations immédiates.</strong> En cas d&apos;accident, de vol ou de tout autre sinistre, le Locataire doit :</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Contacter immédiatement le Loueur au <a href="tel:+33761422192" className="text-gold hover:underline">07 61 42 21 92</a>.</li>
                  <li>En cas d&apos;accident impliquant un tiers, établir un constat amiable et ne jamais reconnaître sa responsabilité.</li>
                  <li>En cas de vol, déposer une plainte auprès des autorités compétentes dans les <strong>24 heures</strong> et en transmettre une copie au Loueur.</li>
                  <li>Ne pas faire procéder à des réparations sans accord préalable du Loueur.</li>
                </ul>
                <p className="mt-3"><strong>15.2 Responsabilité.</strong> Le Locataire est responsable des dommages causés au véhicule pendant toute la durée de la location, dans la limite de la franchise applicable, sauf à démontrer une cause exonératoire (force majeure, faute exclusive d&apos;un tiers identifié).</p>
                <p className="mt-3"><strong>15.3 Panne.</strong> En cas de panne mécanique non imputable au Locataire, le Loueur prend en charge les frais de dépannage et propose, dans la mesure du possible, un véhicule de substitution.</p>
              </div>

              {/* Art. 16 */}
              <div id="art16" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 16 — Politique d&apos;annulation et remboursement</h2>
                <p>En cas d&apos;annulation de la réservation par le Locataire, les frais suivants s&apos;appliquent :</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 border border-gray-200 font-semibold text-navy">Délai avant la prise en charge</th>
                        <th className="text-left p-3 border border-gray-200 font-semibold text-navy">Frais d&apos;annulation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border border-gray-200">Plus de 48 heures</td>
                        <td className="p-3 border border-gray-200 text-emerald-700 font-semibold">Gratuit — remboursement intégral</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-3 border border-gray-200">Entre 24 et 48 heures</td>
                        <td className="p-3 border border-gray-200 text-amber-700 font-semibold">20 % du montant total TTC</td>
                      </tr>
                      <tr>
                        <td className="p-3 border border-gray-200">Moins de 24 heures</td>
                        <td className="p-3 border border-gray-200 text-red-700 font-semibold">50 % du montant total TTC</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-3 border border-gray-200">Non-présentation (no-show)</td>
                        <td className="p-3 border border-gray-200 text-red-700 font-semibold">100 % du montant total TTC</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">Les remboursements sont effectués sur le moyen de paiement utilisé lors de la réservation, dans un délai de 5 à 10 jours ouvrés. Les annulations doivent être notifiées par écrit à <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a> ou par téléphone au <a href="tel:+33761422192" className="text-gold hover:underline">07 61 42 21 92</a>.</p>
                <p className="mt-3">En cas d&apos;annulation par le Loueur (indisponibilité imprévue du véhicule, force majeure), le Locataire est remboursé intégralement dans les 5 jours ouvrés. Le Loueur proposera, dans la mesure du possible, un véhicule de substitution de gamme équivalente ou supérieure.</p>
              </div>

              {/* Art. 17 */}
              <div id="art17" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 17 — Données personnelles</h2>
                <p>Les données personnelles collectées lors de la réservation (nom, prénom, adresse email, numéro de téléphone, permis de conduire) sont traitées par J &amp; J Automobiles SAS en qualité de responsable de traitement, aux fins d&apos;exécution du contrat de location, de gestion de la relation client, et de conformité aux obligations légales.</p>
                <p className="mt-3">Ces données sont conservées pour une durée de 5 ans à compter de la dernière interaction, conformément aux obligations comptables et légales. Elles ne sont pas cédées à des tiers à des fins commerciales.</p>
                <p className="mt-3">Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés, le Locataire dispose d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de portabilité et d&apos;opposition sur ses données personnelles, en contactant : <a href="mailto:contact@jjautomobiles.fr" className="text-gold hover:underline">contact@jjautomobiles.fr</a>.</p>
                <p className="mt-3">Pour plus d&apos;informations, consultez notre <Link href="/politique-de-confidentialite" className="text-gold hover:underline">Politique de confidentialité</Link>.</p>
              </div>

              {/* Art. 18 */}
              <div id="art18" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 18 — Droit applicable et résolution des litiges</h2>
                <p>Les présentes CGL sont régies par le droit français. En cas de litige relatif à l&apos;interprétation, la formation ou l&apos;exécution du contrat, les parties s&apos;engagent à rechercher une solution amiable avant tout recours judiciaire.</p>
                <p className="mt-3">À défaut d&apos;accord amiable, le Locataire peut recourir gratuitement à un médiateur de la consommation. Conformément à l&apos;article L.616-1 du Code de la consommation, JJ AUTO 92 propose le recours à la médiation via la plateforme européenne de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">ec.europa.eu/consumers/odr</a>.</p>
                <p className="mt-3">À défaut de résolution amiable, tout litige sera soumis à la juridiction compétente du ressort du siège social de J &amp; J Automobiles (Tribunal judiciaire de Nanterre).</p>
              </div>

              {/* Art. 19 */}
              <div id="art19" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 19 — Modification des CGL</h2>
                <p>J &amp; J Automobiles SAS se réserve le droit de modifier les présentes CGL à tout moment. Les nouvelles conditions entrent en vigueur à la date de leur publication sur le site. Les réservations déjà confirmées restent régies par les conditions en vigueur au moment de leur conclusion. Le Locataire est invité à consulter les CGL en vigueur avant toute nouvelle réservation.</p>
              </div>

              {/* Art. 20 */}
              <div id="art20" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-navy font-extrabold text-base mb-3">Art. 20 — Entrée en vigueur</h2>
                <p>Les présentes Conditions Générales de Location entrent en vigueur le <strong>1er janvier 2025</strong> et annulent et remplacent toute version antérieure.</p>
                <p className="mt-3 text-gray-500 text-xs">J &amp; J Automobiles SAS — SIREN 929 686 970 — 1 Allée de Lorraine, 92000 Nanterre</p>
              </div>

              {/* CTA */}
              <div className="bg-navy rounded-2xl p-6 text-center">
                <p className="text-white font-bold mb-2">Des questions sur nos conditions ?</p>
                <p className="text-gray-400 text-sm mb-5">Notre équipe répond du lundi au samedi de 8h à 19h.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="tel:+33761422192" className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-extrabold text-sm px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-gold/90 transition-colors">
                    07 61 42 21 92
                  </a>
                  <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-gray-600 text-gray-400 hover:text-white hover:border-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
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
