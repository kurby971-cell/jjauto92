import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/server'
import CautionPayment from '@/components/reservation/CautionPayment'

export const metadata: Metadata = {
  title: 'Caution — JJ AUTO 92',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-sm text-center">
        <h1 className="text-navy font-extrabold text-xl mb-2">{title}</h1>
        <p className="text-gray-500 text-sm">{text}</p>
      </div>
    </div>
  )
}

export default async function CautionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) return <Message title="Lien invalide" text="Ce lien de caution n'est pas valide." />

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const { data: dep } = await db
    .from('deposits')
    .select('id, status, amount, stripe_payment_intent_id, reservations(reservation_number)')
    .eq('id', id)
    .single()

  if (!dep) return <Message title="Lien invalide" text="Ce lien de caution n'est pas valide." />
  if (dep.status !== 'pending') {
    return <Message title="Caution déjà enregistrée" text="Votre caution est déjà pré-autorisée. Vous n'avez rien d'autre à faire." />
  }

  let clientSecret: string | null = null
  let intentStatus = ''
  let failed = false
  try {
    const intent = await getStripe().paymentIntents.retrieve(dep.stripe_payment_intent_id)
    intentStatus = intent.status
    clientSecret = intent.client_secret
  } catch {
    failed = true
  }

  if (failed || !clientSecret) {
    return <Message title="Erreur" text="Impossible de charger la caution. Réessayez ou contactez-nous au 07 61 42 21 92." />
  }
  if (intentStatus === 'requires_capture') {
    return <Message title="Caution déjà enregistrée" text="Votre caution est déjà pré-autorisée. Vous n'avez rien d'autre à faire." />
  }
  if (intentStatus === 'canceled') {
    return <Message title="Lien expiré" text="Ce lien n'est plus valable. Demandez-en un nouveau à notre équipe." />
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-md mx-auto">
        <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
          Réservation {dep.reservations?.reservation_number ?? ''}
        </p>
        <h1 className="text-navy font-extrabold text-2xl mb-6">Caution du véhicule</h1>
        <CautionPayment clientSecret={clientSecret} amount={Number(dep.amount)} depositId={dep.id} />
      </div>
    </div>
  )
}
