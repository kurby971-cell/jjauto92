// Documents d'un client pour l'admin : fichiers du dossier <customerId>/ du bucket privé
// « documents » (déposés à la réservation ou depuis l'espace client), avec liens signés 1 h.
export interface CustomerDoc {
  name: string
  label: string
  url: string
  isImage: boolean
  updatedAt: string | null
}

const LABELS: Record<string, string> = {
  permis_recto: 'Permis — recto',
  permis_verso: 'Permis — verso',
  cni_recto: 'Pièce d’identité — recto',
  cni_verso: 'Pièce d’identité — verso',
  passeport: 'Passeport',
  cni_passeport: 'Pièce d’identité / passeport',
  justificatif_domicile: 'Justificatif de domicile',
}

export async function listCustomerDocuments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  customerId: string,
): Promise<CustomerDoc[]> {
  const bucket = db.storage.from('documents')
  const { data: files } = await bucket.list(customerId, { limit: 50 })
  const entries: Array<{ name: string; updated_at?: string | null }> = (files ?? []).filter(
    (f: { name: string }) => /\.(jpg|png|webp|pdf)$/.test(f.name),
  )
  if (entries.length === 0) return []

  const paths = entries.map((f) => `${customerId}/${f.name}`)
  const { data: signed } = await bucket.createSignedUrls(paths, 60 * 60)
  const urlByPath = new Map<string, string>()
  for (const s of signed ?? []) if (s.signedUrl && s.path) urlByPath.set(s.path, s.signedUrl)

  return entries
    .map((f) => {
      const base = f.name.replace(/\.[a-z]+$/, '')
      return {
        name: f.name,
        label: LABELS[base] ?? base.replace(/_/g, ' '),
        url: urlByPath.get(`${customerId}/${f.name}`) ?? '',
        isImage: !f.name.endsWith('.pdf'),
        updatedAt: f.updated_at ?? null,
      }
    })
    .filter((d) => d.url)
}
