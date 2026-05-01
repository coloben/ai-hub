import { NextRequest, NextResponse } from 'next/server'
import { mockNews, mockModels } from '@/lib/mock-data'
import { SearchResult } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const q = searchParams.get('q')?.toLowerCase() || ''
  const limit = parseInt(searchParams.get('limit') || '10')
  
  if (!q) {
    return NextResponse.json({ results: [] })
  }
  
  const newsResults = mockNews
    .filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.summary.toLowerCase().includes(q)
    )
    .map(n => ({
      type: 'news' as const,
      id: n.id,
      title: n.title,
      excerpt: n.summary.slice(0, 150) + '...',
      url: n.url,
    }))
    .slice(0, limit)
  
  const modelResults = mockModels
    .filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.provider.toLowerCase().includes(q)
    )
    .map(m => ({
      type: 'model' as const,
      id: m.id,
      title: m.name,
      excerpt: `${m.provider} • ${m.type} • Arena ELO: ${m.scores.arena_elo ?? '—'}`,
      url: m.changelog_url,
    }))
    .slice(0, limit)
  
  const results = [...newsResults, ...modelResults]
  
  return NextResponse.json({ results })
}
