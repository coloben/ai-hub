import { NextResponse } from 'next/server'
import { getRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ranking = await getRanking()
    const date = new Date().toISOString().slice(0, 10)
    const dataset = {
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
      license: 'CC-BY-4.0',
      source: ranking.source,
      description: 'Classement temps réel des modèles IA. Mis à jour quotidiennement.',
      data: ranking.models.map((m, i) => ({
        rank: i + 1,
        model: m.name,
        organization: m.organization,
        elo: m.elo,
        eloDelta: m.eloDelta,
        votes: m.samples ?? 0,
        category: m.category ?? 'proprietary',
      })),
    }

    return NextResponse.json(dataset, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'Content-Disposition': `attachment; filename="ai-hub-leaderboard-${date}.json"`,
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to generate dataset' }, { status: 500 })
  }
}
