import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/schema'

const INDEXABLE = process.env.SITE_INDEXABLE === 'true'

export default function robots(): MetadataRoute.Robots {
  // Phase fermée : on laisse Google lire les pages pour qu'il voie le noindex
  // (un Disallow l'empêcherait de le lire et de désindexer). Pas de sitemap.
  if (!INDEXABLE) {
    return { rules: [{ userAgent: '*', allow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/mon-compte', '/mon-compte/', '/api/', '/reservation/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
