import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import StatusBadge from '@/components/admin/StatusBadge'

export const metadata: Metadata = { title: 'Détail réservation — Admin JJ AUTO 92' }

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

const fmtMoney = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminReservationDetailPage({ params }: Props) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: r } = await db
    .from('reservations')
    .select(`
      id, reservation_number, status, source, created_at,
      start_date, end_date, pickup_time, return_time, total_days,
      pickup_location, return_location,
      daily_rate_snapshot, base_amount, options_amount, discount_amount,
      total_amount, deposit_amount, options,
      mileage_start, mileage_end, fuel_level_start, fuel_level_end,
      notes, admin_notes, cancellation_reason,
      vehicles(id, brand, model, year, license_plate, category, fuel_type, transmission),
      customers(id, first_name, last_name, email, phone, is_verified, is_blacklisted, driving_license_number),
      payments(id, stripe_payment_intent_id, amount, status, type, created_at),
      deposits(id, stripe_payment_intent_id, amount, status, authorized_at, captured_amount, released_at)
    `)
    .eq('id', id)
    .single()

  if (!r) notFound()

  const FUEL_LABELS: Record<string, string> = {
    vide: 'Vide', quart: '1/4', demi: '1/2', trois_quarts: '3/4', plein: 'Plein',
  }
  const SOURCE_LABELS: Record<string, string> = {
    web: 'Web', telephone: 'Téléphone', admin: 'Admin', partenaire: 'Partenaire',
  }

  const payments: Array<{ id: string; stripe_payment_intent_id: string; amount: number; status: string; type: string; created_at: string }> = r.payments ?? []
  const deposits: Array<{ id: string; stripe_payment_intent_id: string; amount: number; status: string; authorized_at: string | null; captured_amount: number | null; released_at: string | null }> = r.deposits ?? []

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-baseline py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0 mr-4">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value ?? '—'}</span>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/reservations"
          className="text-sm text-gray-500 hover:text-[#0D1B2A] flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Réservations
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-mono text-sm font-bold text-[#0D1B2A]">{r.reservation_number}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">{r.reservation_number}</h1>
        <StatusBadge status={r.status} type="reservation" />
        <span className="text-xs text-gray-400">Source : {SOURCE_LABELS[r.source] ?? r.source}</span>
        <span className="text-xs text-gray-400">Créée le {fmtDateTime(r.created_at)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Dates & lieux */}
        <Section title="Location">
          <Row label="Départ" value={`${fmtDate(r.start_date)} à ${r.pickup_time}`} />
          <Row label="Retour" value={`${fmtDate(r.end_date)} à ${r.return_time}`} />
          <Row label="Durée" value={`${r.total_days ?? '?'} jour${(r.total_days ?? 0) > 1 ? 's' : ''}`} />
          <Row label="Lieu de départ" value={r.pickup_location} />
          <Row label="Lieu de retour" value={r.return_location} />
        </Section>

        {/* Véhicule */}
        <Section title="Véhicule">
          {r.vehicles ? (
            <>
              <Row label="Modèle" value={`${r.vehicles.brand} ${r.vehicles.model} ${r.vehicles.year}`} />
              <Row label="Immatriculation" value={<span className="font-mono">{r.vehicles.license_plate}</span>} />
              <Row label="Catégorie" value={r.vehicles.category} />
              <Row label="Carburant" value={r.vehicles.fuel_type} />
              <Row label="Transmission" value={r.vehicles.transmission} />
            </>
          ) : <p className="text-sm text-gray-400">Véhicule supprimé</p>}
        </Section>

        {/* Client */}
        <Section title="Client">
          {r.customers ? (
            <>
              <Row
                label="Nom"
                value={
                  <Link href={`/admin/clients/${r.customers.id}`} className="text-[#C9A84C] hover:underline font-semibold">
                    {r.customers.first_name} {r.customers.last_name}
                  </Link>
                }
              />
              <Row label="Email" value={r.customers.email} />
              <Row label="Téléphone" value={r.customers.phone} />
              <Row label="Permis n°" value={r.customers.driving_license_number} />
              <Row
                label="Statut"
                value={
                  <StatusBadge
                    status={r.customers.is_blacklisted ? 'blacklisted' : r.customers.is_verified ? 'verified' : 'unverified'}
                    type="customer"
                  />
                }
              />
            </>
          ) : <p className="text-sm text-gray-400">Client inconnu</p>}
        </Section>

        {/* Tarification */}
        <Section title="Tarification">
          <Row label="Tarif jour" value={fmtMoney(r.daily_rate_snapshot ?? 0)} />
          <Row label="Base" value={fmtMoney(r.base_amount ?? 0)} />
          {(r.options_amount ?? 0) > 0 && <Row label="Options" value={fmtMoney(r.options_amount)} />}
          {(r.discount_amount ?? 0) > 0 && <Row label="Remise" value={`-${fmtMoney(r.discount_amount)}`} />}
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-gray-200">
            <span className="text-sm font-bold text-[#0D1B2A]">Total TTC</span>
            <span className="text-xl font-extrabold text-[#0D1B2A]">{fmtMoney(r.total_amount ?? 0)}</span>
          </div>
          {(r.deposit_amount ?? 0) > 0 && (
            <p className="text-xs text-gray-400 mt-2">Caution : {fmtMoney(r.deposit_amount)}</p>
          )}
        </Section>

        {/* Paiements */}
        {payments.length > 0 && (
          <Section title="Paiements">
            {payments.map((p) => (
              <div key={p.id} className="py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{fmtMoney(p.amount)}</span>
                  <StatusBadge status={p.status} type="reservation" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.stripe_payment_intent_id}</p>
                <p className="text-xs text-gray-400">{fmtDateTime(p.created_at)}</p>
              </div>
            ))}
          </Section>
        )}

        {/* Cautions */}
        {deposits.length > 0 && (
          <Section title="Cautions">
            {deposits.map((d) => (
              <div key={d.id} className="py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{fmtMoney(d.amount)}</span>
                  <StatusBadge status={d.status} type="deposit" />
                </div>
                {d.captured_amount != null && (
                  <p className="text-xs text-gray-500 mt-0.5">Capturée : {fmtMoney(d.captured_amount)}</p>
                )}
                <p className="text-xs text-gray-400 font-mono">{d.stripe_payment_intent_id}</p>
              </div>
            ))}
          </Section>
        )}

        {/* État physique */}
        {(r.mileage_start != null || r.mileage_end != null) && (
          <Section title="État physique">
            <Row label="Km départ" value={r.mileage_start != null ? `${r.mileage_start.toLocaleString('fr-FR')} km` : null} />
            <Row label="Km retour" value={r.mileage_end != null ? `${r.mileage_end.toLocaleString('fr-FR')} km` : null} />
            {r.mileage_start != null && r.mileage_end != null && (
              <Row label="Parcourus" value={`${(r.mileage_end - r.mileage_start).toLocaleString('fr-FR')} km`} />
            )}
            <Row label="Carburant départ" value={r.fuel_level_start ? FUEL_LABELS[r.fuel_level_start] : null} />
            <Row label="Carburant retour" value={r.fuel_level_end ? FUEL_LABELS[r.fuel_level_end] : null} />
          </Section>
        )}

        {/* Notes */}
        {(r.notes || r.admin_notes || r.cancellation_reason) && (
          <Section title="Notes">
            {r.notes && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                <p className="text-sm text-gray-700">{r.notes}</p>
              </div>
            )}
            {r.admin_notes && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Admin</p>
                <p className="text-sm text-gray-700">{r.admin_notes}</p>
              </div>
            )}
            {r.cancellation_reason && (
              <div>
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Motif d'annulation</p>
                <p className="text-sm text-red-700">{r.cancellation_reason}</p>
              </div>
            )}
          </Section>
        )}

      </div>
    </div>
  )
}
