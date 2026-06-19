import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import StatusBadge from '@/components/admin/StatusBadge'

export const metadata: Metadata = { title: 'Détail client — Admin JJ AUTO 92' }

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

const fmtMoney = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminClientDetailPage({ params }: Props) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const [{ data: c }, { data: reservations }, { data: documents }] = await Promise.all([
    db.from('customers')
      .select('id,first_name,last_name,email,phone,date_of_birth,address_street,address_city,address_postal_code,address_country,driving_license_number,driving_license_expiry,is_verified,verified_at,is_blacklisted,blacklist_reason,total_reservations,total_spent,admin_notes,created_at,auth_user_id')
      .eq('id', id)
      .single(),
    db.from('reservations')
      .select('id,reservation_number,status,start_date,end_date,total_days,total_amount,created_at,vehicles(brand,model)')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    db.from('documents')
      .select('id,type,file_url,uploaded_at,is_verified')
      .eq('customer_id', id)
      .order('uploaded_at', { ascending: false }),
  ])

  if (!c) notFound()

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

  const STATUS_LABELS: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', active: 'En cours',
    completed: 'Terminée', cancelled: 'Annulée', no_show: 'No-show',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/clients"
          className="text-sm text-gray-500 hover:text-[#0D1B2A] flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Clients
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-sm text-[#0D1B2A]">{c.first_name} {c.last_name}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">{c.first_name} {c.last_name}</h1>
        <StatusBadge
          status={c.is_blacklisted ? 'blacklisted' : c.is_verified ? 'verified' : 'unverified'}
          type="customer"
        />
        <span className="text-xs text-gray-400">Inscrit le {fmtDateTime(c.created_at)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Coordonnées */}
        <Section title="Coordonnées">
          <Row label="Email" value={<a href={`mailto:${c.email}`} className="text-[#C9A84C] hover:underline">{c.email}</a>} />
          <Row label="Téléphone" value={<a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>} />
          <Row label="Date de naissance" value={c.date_of_birth ? fmtDate(c.date_of_birth) : null} />
          <Row label="Adresse" value={c.address_street} />
          <Row label="Ville" value={c.address_city ? `${c.address_postal_code ?? ''} ${c.address_city}`.trim() : null} />
          <Row label="Pays" value={c.address_country} />
        </Section>

        {/* Permis & identité */}
        <Section title="Permis & identité">
          <Row label="N° permis" value={c.driving_license_number} />
          <Row label="Expiration permis" value={c.driving_license_expiry ? fmtDate(c.driving_license_expiry) : null} />
          <Row
            label="Vérification"
            value={
              c.is_verified
                ? `Vérifié le ${fmtDateTime(c.verified_at)}`
                : 'Non vérifié'
            }
          />
          {c.is_blacklisted && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Blacklisté</p>
              <p className="text-sm text-red-700">{c.blacklist_reason ?? 'Aucun motif renseigné'}</p>
            </div>
          )}
        </Section>

        {/* Stats */}
        <Section title="Statistiques">
          <Row label="Réservations" value={c.total_reservations} />
          <Row label="Total dépensé" value={fmtMoney(c.total_spent ?? 0)} />
          {c.auth_user_id && <Row label="Compte en ligne" value="Oui" />}
        </Section>

        {/* Notes admin */}
        <Section title="Notes internes">
          {c.admin_notes
            ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.admin_notes}</p>
            : <p className="text-sm text-gray-400">Aucune note</p>
          }
        </Section>

        {/* Documents */}
        {documents && documents.length > 0 && (
          <div className="lg:col-span-2">
            <Section title={`Documents (${documents.length})`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documents.map((doc: { id: string; type: string; file_url: string | null; uploaded_at: string; is_verified: boolean }) => (
                  <div key={doc.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-[#0D1B2A] capitalize">{doc.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(doc.uploaded_at)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <StatusBadge status={doc.is_verified ? 'verified' : 'unverified'} type="customer" />
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-[#C9A84C] hover:underline">
                          Voir
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Historique réservations */}
        <div className="lg:col-span-2">
          <Section title={`Réservations (${(reservations ?? []).length})`}>
            {(!reservations || reservations.length === 0) ? (
              <p className="text-sm text-gray-400">Aucune réservation</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Réf', 'Véhicule', 'Dates', 'Durée', 'Montant', 'Statut'].map(h => (
                        <th key={h} className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservations.map((res: {
                      id: string; reservation_number: string; status: string;
                      start_date: string; end_date: string; total_days: number; total_amount: number;
                      vehicles: { brand: string; model: string } | null;
                    }) => (
                      <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2">
                          <Link href={`/admin/reservations/${res.id}`} className="font-mono text-xs font-bold text-[#C9A84C] hover:underline">
                            {res.reservation_number}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {res.vehicles ? `${res.vehicles.brand} ${res.vehicles.model}` : '—'}
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-xs">
                          {new Date(res.start_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {' → '}
                          {new Date(res.end_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{res.total_days}j</td>
                        <td className="px-3 py-2 font-bold text-gray-800">{fmtMoney(res.total_amount)}</td>
                        <td className="px-3 py-2"><StatusBadge status={res.status} type="reservation" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

      </div>
    </div>
  )
}
