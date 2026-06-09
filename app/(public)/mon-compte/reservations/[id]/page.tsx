import { redirect, notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCustomerByUser } from '@/lib/mon-compte/utils'
import DocumentUploadSection from '@/components/mon-compte/DocumentUploadSection'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Détail réservation — JJ AUTO 92' }

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysBetween(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente de confirmation',
  confirmed: 'Confirmée',
  active: 'Location en cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  no_show: 'Non présenté',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-600',
  no_show: 'bg-orange-100 text-orange-700',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-[#0D1B2A] text-right ml-4">{value}</span>
    </div>
  )
}

export default async function ReservationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion?next=/mon-compte/reservations')

  const customer = await getCustomerByUser(user.id, user.email ?? '')
  if (!customer) redirect('/mon-compte')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: r } = await db
    .from('reservations')
    .select(`
      id,reservation_number,start_date,end_date,
      pickup_location,return_location,pickup_time,return_time,
      base_amount,options_amount,total_amount,deposit_amount,
      total_days,status,notes,additional_km,km_rate,fuel_level_departure,fuel_level_return,
      vehicles(id,brand,model,year,license_plate,category,fuel_type,included_km,transmission,photos),
      customers(first_name,last_name,email,phone,driving_license_number,is_verified)
    `)
    .eq('id', params.id)
    .eq('customer_id', customer.id)
    .single()

  if (!r) notFound()

  const days = daysBetween(r.start_date, r.end_date)
  const showUpload = ['pending', 'confirmed'].includes(r.status)
  const showContract = ['confirmed', 'active', 'completed'].includes(r.status)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link href="/mon-compte/reservations" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0D1B2A] transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à mes réservations
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-extrabold text-[#0D1B2A]">
              {r.vehicles?.brand} {r.vehicles?.model}
            </h1>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABEL[r.status] ?? r.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Réf. {r.reservation_number}</p>
        </div>
        {showContract && (
          <Link
            href={`/mon-compte/reservations/${r.id}/contrat`}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer récapitulatif
          </Link>
        )}
      </div>

      {/* Vehicle photo */}
      {r.vehicles?.photos?.[0] && (
        <div className="rounded-2xl overflow-hidden h-52 bg-gray-100">
          <img
            src={r.vehicles.photos[0]}
            alt={`${r.vehicles.brand} ${r.vehicles.model}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dates */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Dates de location</h2>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Départ</p>
                <p className="text-sm font-bold text-[#0D1B2A]">{fmt(r.start_date)}</p>
                {r.pickup_location && <p className="text-xs text-gray-500 mt-0.5">{r.pickup_location}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Retour</p>
                <p className="text-sm font-bold text-[#0D1B2A]">{fmt(r.end_date)}</p>
                {r.return_location && <p className="text-xs text-gray-500 mt-0.5">{r.return_location}</p>}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-[#0D1B2A]">Durée : {days} jour{days > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tarification</h2>
          <Row label="Montant base" value={`${(r.base_amount ?? 0).toLocaleString('fr-FR')} €`} />
          {r.options_amount > 0 && (
            <Row label="Options" value={`${r.options_amount.toLocaleString('fr-FR')} €`} />
          )}
          <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-gray-200">
            <span className="text-sm font-extrabold text-[#0D1B2A]">Total</span>
            <span className="text-lg font-black text-[#0D1B2A]">{r.total_amount.toLocaleString('fr-FR')} €</span>
          </div>
          {r.deposit_amount > 0 && (
            <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
              Caution préautorisée : {r.deposit_amount.toLocaleString('fr-FR')} €
            </p>
          )}
        </div>
      </div>

      {/* Vehicle info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Véhicule</h2>
        <div>
          <Row label="Marque / Modèle" value={`${r.vehicles?.brand} ${r.vehicles?.model} ${r.vehicles?.year}`} />
          {r.vehicles?.license_plate && <Row label="Immatriculation" value={r.vehicles.license_plate} />}
          {r.vehicles?.category && <Row label="Catégorie" value={r.vehicles.category} />}
          {r.vehicles?.fuel_type && <Row label="Carburant" value={r.vehicles.fuel_type} />}
          {r.vehicles?.transmission && <Row label="Transmission" value={r.vehicles.transmission} />}
          {r.vehicles?.included_km > 0 && (
            <Row label="Km inclus/jour" value={`${r.vehicles.included_km} km`} />
          )}
        </div>
      </div>

      {/* Notes */}
      {r.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Note</h2>
          <p className="text-sm text-amber-800">{r.notes}</p>
        </div>
      )}

      {/* Document upload (only for pending/confirmed reservations) */}
      {showUpload && !r.customers?.is_verified && (
        <DocumentUploadSection customerId={customer.id} reservationId={r.id} />
      )}

      {showUpload && r.customers?.is_verified && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-emerald-700">Documents vérifiés</p>
            <p className="text-xs text-emerald-600 mt-0.5">Votre identité a été validée par notre équipe.</p>
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600">Une question sur votre réservation ?</p>
        <div className="flex gap-3 shrink-0">
          <a
            href="tel:+33761422192"
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-[#0D1B2A] text-white rounded-xl hover:bg-[#1a2d45] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            07 61 42 21 92
          </a>
        </div>
      </div>
    </div>
  )
}
