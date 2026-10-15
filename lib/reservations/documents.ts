import { ALLOWED_DOC_TYPES } from '@/lib/uploads'

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf',
}

// Documents déposés pendant la réservation : stockés d'abord dans temp/<uuid>/<type>.<ext>
// (le client n'a pas encore de dossier). Une fois la réservation créée, on les déplace dans
// <customerId>/<type>.<ext> et on enregistre une ligne `documents` : c'est ce dossier que
// l'admin consulte pour valider le conducteur. Échec non bloquant pour la réservation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function persistReservationDocuments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  customerId: string,
  reservationId: string,
  urls: Array<string | null | undefined>,
): Promise<number> {
  let saved = 0
  for (const url of urls) {
    if (!url) continue
    try {
      const pathname = decodeURIComponent(new URL(url).pathname)
      const m = pathname.match(/\/documents\/(temp\/[0-9a-f-]{36}\/([a-z_]+)\.(jpg|png|webp|pdf))$/)
      if (!m) continue
      const [, from, docType, ext] = m
      if (!ALLOWED_DOC_TYPES.includes(docType)) continue

      const to = `${customerId}/${docType}.${ext}`
      await db.storage.from('documents').remove([to])
      const { error: mvErr } = await db.storage.from('documents').move(from, to)
      if (mvErr) {
        console.error('[documents] move:', mvErr.message)
        continue
      }

      // L'enum document_type ne connaît pas « cni_passeport » : on le range en « passeport »
      const dbType = docType === 'cni_passeport' ? 'passeport' : docType
      await db.from('documents').insert({
        customer_id: customerId,
        reservation_id: reservationId,
        type: dbType,
        file_path: to,
        file_name: `${docType}.${ext}`,
        mime_type: MIME_BY_EXT[ext],
        uploaded_by: 'customer',
        is_verified: false,
      })
      saved++
    } catch (err) {
      console.error('[documents] persist:', err)
    }
  }
  return saved
}
