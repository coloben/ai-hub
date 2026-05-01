'use client'

import { useState } from 'react'
import { NewsItem } from '@/lib/types'
import { mockNews } from '@/lib/mock-data'

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const hours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60))
  
  if (hours < 1) return 'maintenant'
  if (hours === 1) return 'il y a 1h'
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'breaking':
      return 'text-amber'
    case 'release':
      return 'text-primary'
    case 'benchmark':
      return 'text-success'
    case 'industry':
      return 'text-text-muted'
    default:
      return 'text-text-muted'
  }
}

export function TickerTape() {
  const [isPaused, setIsPaused] = useState(false)
  
  const breakingNews = mockNews.filter(n => n.is_breaking || 
    (new Date().getTime() - new Date(n.published_at).getTime()) < 6 * 60 * 60 * 1000)
    .slice(0, 5)

  const tickerItems = [...breakingNews, ...breakingNews]

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-[32px] bg-[#05050a]/88 backdrop-blur-xl border-b border-white/10 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.24)]"
      role="region"
      aria-label="Breaking news ticker"
    >
      <div 
        className={`ticker-container h-full ${isPaused ? 'paused' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="ticker-content h-full flex items-center">
          {tickerItems.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="flex items-center gap-3 px-5 h-full border-r border-white/10 shrink-0"
            >
              <span className={`rounded-full bg-white/[0.045] px-2 py-0.5 text-2xs font-medium uppercase ${getCategoryColor(item.is_breaking ? 'breaking' : item.category)}`}>
                {item.is_breaking ? 'FLASH' : item.category === 'release' ? 'SORTIE' : item.category === 'benchmark' ? 'BENCHMARK' : item.category === 'research' ? 'RECHERCHE' : 'INDUSTRIE'}
              </span>
              <span className="text-xs text-text truncate max-w-[460px]">
                {item.title}
              </span>
              <span className="text-2xs font-mono text-text-faint">
                {formatTimeAgo(item.published_at)}
              </span>
              <span className="text-2xs font-mono text-text-faint">
                {item.source}
              </span>
              {item.hype_score > 80 && (
                <span className="text-2xs text-amber">🔥 {item.hype_score}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-black/30 px-1.5 py-0.5 text-text-faint hover:text-text transition-colors"
        aria-label={isPaused ? 'Reprendre le ticker' : 'Pause ticker'}
      >
        {isPaused ? '▶' : '⏸'}
      </button>
    </div>
  )
}
