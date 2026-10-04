// Règles communes d'envoi de documents (permis, pièce d'identité, justificatif)
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
export const ALLOWED_DOC_TYPES = ['permis_recto', 'permis_verso', 'cni_recto', 'cni_verso', 'passeport', 'cni_passeport', 'justificatif_domicile']
export const MAX_SIZE = 10 * 1024 * 1024 // 10 Mo

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

// Extension déduite du type réel, jamais du nom de fichier fourni par le client
export function extensionFor(type: string): string {
  return EXT_BY_TYPE[type] ?? 'jpg'
}

// Vérifie que le contenu réel du fichier correspond au type annoncé
export function matchesSignature(type: string, b: Uint8Array): boolean {
  if (type === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  if (type === 'image/png') return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
  if (type === 'image/webp')
    return b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  if (type === 'application/pdf') return b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46
  return false
}
