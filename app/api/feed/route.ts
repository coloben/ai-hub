import { NextRequest, NextResponse } from 'next/server'
import { mockNews } from '@/lib/mock-data'
import { FeedResponse } from '@/lib/types'

export const revalidate = 300

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const source = searchParams.get('source') || 'all'
  const category = searchParams.get('category') || 'all'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const q = searchParams.get('q')?.toLowerCase()
  
  let items = [...mockNews]
  
  if (source !== 'all') {
    const sourceMap: Record<string, string[]> = {
      hf: ['HuggingFace'],
      arxiv: ['ArXiv'],
      news: ['The Verge', 'VentureBeat', 'MIT Tech Review'],
      blogs: ['OpenAI', 'Anthropic', 'Google', 'Meta'],
    }
    const allowedSources = sourceMap[source]
    if (allowedSources) {
      items = items.filter(item => allowedSources.includes(item.source))
    }
  }
  
  if (category !== 'all') {
    items = items.filter(item => item.category === category)
  }
  
  if (q) {
    items = items.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }
  
  const total = items.length
  items = items.slice(offset, offset + limit)
  
  const response: FeedResponse = {
    items,
    total,
    last_updated: new Date().toISOString(),
  }
  
  return NextResponse.json(response)
}
