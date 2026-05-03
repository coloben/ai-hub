import { NextRequest, NextResponse } from 'next/server'
import { getLiveNews } from '@/lib/feed'
import { FeedResponse } from '@/lib/types'

export const revalidate = 900

// Minimal in-memory rate limiter — 60 req/min par IP
const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 60
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: { 'Retry-After': '60' } })
  }

  const { searchParams } = new URL(request.url)
  
  const source = searchParams.get('source') || 'all'
  const category = searchParams.get('category') || 'all'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const q = searchParams.get('q')?.toLowerCase()
  
  let items = await getLiveNews()
  
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
