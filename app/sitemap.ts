import { MetadataRoute } from 'next'

const BASE_URL = 'https://ai-hub-cnb3.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: BASE_URL,                          priority: 1.0,  changeFrequency: 'hourly'  as const },
    { url: `${BASE_URL}/news`,                priority: 0.9,  changeFrequency: 'hourly'  as const },
    { url: `${BASE_URL}/leaderboard`,         priority: 0.9,  changeFrequency: 'daily'   as const },
    { url: `${BASE_URL}/benchmarks`,          priority: 0.85, changeFrequency: 'daily'   as const },
    { url: `${BASE_URL}/compare`,             priority: 0.8,  changeFrequency: 'weekly'  as const },
    { url: `${BASE_URL}/alerts`,              priority: 0.8,  changeFrequency: 'hourly'  as const },
    { url: `${BASE_URL}/briefing`,            priority: 0.75, changeFrequency: 'daily'   as const },
    { url: `${BASE_URL}/timeline`,            priority: 0.7,  changeFrequency: 'weekly'  as const },
    { url: `${BASE_URL}/cost-calculator`,     priority: 0.65, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/glossary`,            priority: 0.6,  changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/live`,                priority: 0.7,  changeFrequency: 'hourly'  as const },
  ]

  return staticRoutes.map(r => ({
    url: r.url,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
