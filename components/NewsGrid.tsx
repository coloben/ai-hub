'use client'

import { NewsItem } from '@/lib/types'
import { NewsCard } from './NewsCard'

interface NewsGridProps {
  news: NewsItem[]
}

export function NewsGrid({ news }: NewsGridProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-text-muted mb-4 uppercase tracking-wider">
        Latest Intelligence
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </div>
  )
}
