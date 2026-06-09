import { redirect, notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCustomerByUser } from '@/lib/mon-compte/utils'
import type { Metadata } from 'next'
import PrintButton from '@/components/mon-compte/PrintButton'

export const metadata: Metadata = { title: 'Récapitulatif — JJ AUTO 92' }

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function daysBetween(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  active: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

export default async function ContratPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const customer = await getCustomerByUser(user.id, user.email ?? '')
  if (!customer) redirect('/mon-compte')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const { data: r } = await db
    .from('reservations')
    .select(`
      id,reservation_number,start_date,end_date,
      pickup_location,return_location,
      base_amount,options_amount,total_amount,deposit_amount,
      total_days,status,notes,
      vehicles(brand,model,year,license_plate,category,fuel_type,transmission,included_km),
      customers(first_name,last_name,email,phone,driving_license_number,address_line1,address_city,address_postal_code)
    `)
    .eq('id', params.id)
    .eq('customer_id', customer.id)
    .single()

  if (!r) notFound()

  const days = daysBetween(r.start_date, r.end_date)
  const issueDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Print button – hidden when printing */}
      <div className="print:hidden mb-6 flex items-center gap-4">
        <a href={`/mon-compte/reservations/${params.id}`} className="text-sm text-gray-500 hover:text-[#0D1B2A] flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </a>
        <PrintButton />
      </div>

      {/* Contract content */}
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden print:shadow-none print:border-0 print:rounded-none print:max-w-full">

        {/* Header */}
        <div className="bg-[#0D1B2A] px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C9A84C] rounded-lg flex items-center justify-center">
                <span className="text-[#0D1B2A] font-black text-base">JJ</span>
              </div>
              <div>
                <p className="font-extrabold text-lg">JJ AUTO 92</p>
                <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase">Location de véhicules</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Récapitulatif de réservation</p>
              <p className="font-bold text-[#C9A84C] text-lg mt-0.5">{r.reservation_number}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Status + issue date */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Émis le {issueDate}</span>
            <span className="font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {STATUS_LABEL[r.status] ?? r.status}
            </span>
          </div>

          {/* Bailleur / Conducteur */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Bailleur</p>
              <p className="font-bold text-[#0D1B2A]">J &amp; J Automobiles SAS</p>
              <p className="text-gray-600">SIREN : 929 686 970</p>
              <p className="text-gray-600">1 Allée de Lorraine</p>
              <p className="text-gray-600">92000 Nanterre</p>
              <p className="text-gray-600 mt-1">07 61 42 21 92</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Conducteur</p>
              <p className="font-bold text-[#0D1B2A]">{r.customers?.first_name} {r.customers?.last_name}</p>
              <p className="text-gray-600">{r.customers?.email}</p>
              <p className="text-gray-600">{r.customers?.phone}</p>
              {r.customers?.address_line1 && <p className="text-gray-600 mt-1">{r.customers.address_line1}</p>}
              {r.customers?.address_city && (
                <p className="text-gray-600">{r.customers.address_postal_code} {r.customers.address_city}</p>
              )}
              {r.customers?.driving_license_number && (
                <p className="text-gray-500 text-xs mt-1">Permis n° {r.customers.driving_license_number}</p>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Vehicle */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Véhicule</p>
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <span className="text-gray-500">Marque / Modèle</span>
                <p className="font-semibold text-[#0D1B2A]">{r.vehicles?.brand} {r.vehicles?.model} {r.vehicles?.year}</p>
              </div>
              {r.vehicles?.license_plate && (
                <div>
                  <span className="text-gray-500">Immatriculation</span>
                  <p className="font-semibold text-[#0D1B2A]">{r.vehicles.license_plate}</p>
                </div>
              )}
              {r.vehicles?.category && (
                <div>
                  <span className="text-gray-500">Catégorie</span>
                  <p className="font-semibold text-[#0D1B2A]">{r.vehicles.category}</p>
                </div>
              )}
              {r.vehicles?.fuel_type && (
                <div>
                  <span className="text-gray-500">Carburant</span>
                  <p className="font-semibold text-[#0D1B2A]">{r.vehicles.fuel_type}</p>
                </div>
              )}
              {r.vehicles?.included_km > 0 && (
                <div>
                  <span className="text-gray-500">Km inclus/jour</span>
                  <p className="font-semibold text-[#0D1B2A]">{r.vehicles.included_km} km</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Détails de la location</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Départ</span>
                <span className="font-semibold text-[#0D1B2A]">{fmt(r.start_date)}{r.pickup_location ? ` — ${r.pickup_location}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Retour</span>
                <span className="font-semibold text-[#0D1B2A]">{fmt(r.end_date)}{r.return_location ? ` — ${r.return_location}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Durée</span>
                <span className="font-semibold text-[#0D1B2A]">{days} jour{days > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tarification</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Montant de base</span>
                <span className="font-semibold">{(r.base_amount ?? 0).toLocaleString('fr-FR')} €</span>
              </div>
              {r.options_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Options</span>
                  <span className="font-semibold">{r.options_amount.toLocaleString('fr-FR')} €</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-extrabold text-[#0D1B2A]">TOTAL TTC</span>
                <span className="font-extrabold text-[#0D1B2A] text-xl">{r.total_amount.toLocaleString('fr-FR')} €</span>
              </div>
              {r.deposit_amount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Caution préautorisée</span>
                  <span>{r.deposit_amount.toLocaleString('fr-FR')} €</span>
                </div>
              )}
            </div>
          </div>

          {r.notes && (
            <>
              <hr className="border-gray-100" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Notes</p>
                <p className="text-sm text-gray-600">{r.notes}</p>
              </div>
            </>
          )}

          <hr className="border-gray-100" />

          {/* Footer */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>Ce document est un récapitulatif de réservation, non un contrat de location officiel.</p>
            <p>Pour toute question : contact@jjautomobiles.fr · 07 61 42 21 92</p>
            <p>J &amp; J Automobiles SAS · SIREN 929 686 970 · 1 Allée de Lorraine, 92000 Nanterre</p>
          </div>
        </div>
      </div>

      {/* Print button at bottom */}
      <div className="print:hidden mt-6 text-center">
        <PrintButton variant="ghost" />
      </div>
    </>
  )
}
