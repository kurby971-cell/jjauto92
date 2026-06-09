import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/schema'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: vehicles } = await db
    .from('vehicles')
    .select('id,slug,updated_at')
    .eq('is_active', true)

  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/vehicules`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/connexion`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/mentions-legales`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/politique-de-confidentialite`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/cgv`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  const vehiclePages: MetadataRoute.Sitemap = (vehicles ?? []).map(
    (v: { id: string; slug: string | null; updated_at: string }) => ({
      url: `${SITE_URL}/vehicules/${v.slug ?? v.id}`,
      lastModified: new Date(v.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })
  )

  return [...staticPages, ...vehiclePages]
}
