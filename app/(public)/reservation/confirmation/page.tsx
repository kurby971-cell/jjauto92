import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

interface Props {
  searchParams: Promise<{
    reservation?: string
    ref?: string
    redirect_status?: string
    payment_intent?: string
  }>
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { reservation: reservationId, ref, redirect_status } = await searchParams

  const success = redirect_status === 'succeeded' || (!redirect_status && !!reservationId)

  // Fetch reservation data (admin client bypasses RLS)
  let data: {
    reservation_number: string
    start_date: string
    end_date: string
    total_amount: number
    total_days: number
    vehicles: { brand: string; model: string; year: number } | null
    customers: { first_name: string; last_name: string; email: string } | null
  } | null = null

  if (reservationId) {
    const supabase = createAdminClient()
    const { data: row } = await supabase
      .from('reservations')
      .select('reservation_number, start_date, end_date, total_amount, total_days, vehicles(brand, model, year), customers(first_name, last_name, email)')
      .eq('id', reservationId)
      .single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = row as any
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (!success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 className="text-navy font-extrabold text-2xl mb-2">Paiement non abouti</h1>
          <p className="text-gray-500 mb-6">
            Votre paiement n'a pas pu être traité. Aucun montant n'a été débité.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/vehicules" className="bg-navy text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-navy/90 transition-colors">
              Retour au catalogue
            </Link>
            <a href="tel:+33761422192" className="bg-gold text-navy font-bold text-sm px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors">
              07 61 42 21 92
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <div className="bg-navy py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Checkmark */}
          <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl mb-3">
            Réservation confirmée !
          </h1>
          {data?.reservation_number && (
            <p className="text-gold font-mono text-lg">{data.reservation_number}</p>
          )}
          {data?.customers && (
            <p className="text-gray-400 mt-2 text-sm">
              Un email de confirmation a été envoyé à{' '}
              <span className="text-white">{data.customers.email}</span>
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {data && (
          <>
            {/* Booking details card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-5">Détails de votre location</h2>
              <div className="space-y-3">
                {data.vehicles && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Véhicule</span>
                    <span className="text-navy font-semibold">{data.vehicles.brand} {data.vehicles.model} {data.vehicles.year}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Départ</span>
                  <span className="text-navy font-semibold">{fmtDate(data.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Retour</span>
                  <span className="text-navy font-semibold">{fmtDate(data.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Durée</span>
                  <span className="text-navy font-semibold">{data.total_days} jour{data.total_days > 1 ? 's' : ''}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-navy">Total payé</span>
                  <span className="font-extrabold text-navy text-xl">
                    {Number(data.total_amount).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                  </span>
                </div>
              </div>
            </div>

            {/* What's next */}
            <div className="bg-navy rounded-2xl p-6">
              <h2 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">Prochaines étapes</h2>
              <ul className="space-y-3">
                {[
                  'Vous recevrez un email de confirmation avec tous les détails.',
                  `Présentez-vous le ${fmtDate(data.start_date)} à partir de 9h au 1 Allée de Lorraine, 92000 Nanterre.`,
                  'Apportez votre permis de conduire et votre pièce d\'identité (la caution est déjà pré-autorisée).',
                  'Notre équipe vous remettra les clés et vous fera signer l\'état des lieux.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Contact + actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">Contact</h2>
          <p className="text-gray-500 text-sm mb-4">
            Une question sur votre réservation ? Notre équipe est disponible du lundi au samedi de 8h à 19h.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+33761422192"
              className="flex items-center justify-center gap-2 bg-navy text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-navy/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              07 61 42 21 92
            </a>
            <Link
              href="/vehicules"
              className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:text-navy hover:border-navy font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
            >
              Retour au catalogue
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
