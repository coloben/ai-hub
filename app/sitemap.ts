import { MetadataRoute } from 'next'
import { getRanking } from '@/lib/data/pipeline'

const BASE_URL = 'https://ai-hub-cnb3.vercel.app'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  const staticRoutes = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'hourly' as const, priority: 1.0 },
    { url: `${BASE_URL}/ranking`, lastModified: now, changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${BASE_URL}/compare`, lastModified: now, changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${BASE_URL}/community`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/docs/api`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/signup`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  const hubs = ['coding', 'creativity', 'reasoning', 'french', 'multimodal', 'open-source']
  const hubRoutes = hubs.map((hub) => ({
    url: `${BASE_URL}/hub/${hub}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const categories = ['global', 'coding', 'creativity', 'reasoning', 'french', 'multimodal']
  const compareRoutes = categories.map((cat) => ({
    url: `${BASE_URL}/compare?cat=${cat}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  let modelRoutes: MetadataRoute.Sitemap = []
  try {
    const ranking = await getRanking()
    const updated = ranking.updatedAt || now
    modelRoutes = ranking.models.map((m) => ({
      url: `${BASE_URL}/model/${m.id}`,
      lastModified: updated,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  } catch {
    // ranking unavailable at sitemap build time
  }

  return [...staticRoutes, ...hubRoutes, ...compareRoutes, ...modelRoutes]
}
