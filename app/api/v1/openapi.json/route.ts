import { NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-hub-cnb3.vercel.app'

export const dynamic = 'force-dynamic'

export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'AI Hub API',
      version: '1.0.0',
      description: 'API publique lecture + votes/posts communauté',
    },
    servers: [{ url: `${BASE}/api/v1` }],
    paths: {
      '/models': { get: { summary: 'Liste des modèles Arena' } },
      '/leaderboard': { get: { summary: 'Classement ELO' } },
      '/stats': { get: { summary: 'Stats communauté + confiance' } },
      '/posts': {
        get: { summary: 'Feed unifié' },
        post: { summary: 'Créer un post communauté' },
      },
      '/votes': { post: { summary: 'Vote duel A vs B' } },
      '/papers': { get: { summary: 'Papers agrégés' } },
      '/dataset/leaderboard.json': { get: { summary: 'Export JSON open data' } },
    },
  }
  return NextResponse.json(spec, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
