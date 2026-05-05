'use client'

import { useState } from 'react'
import { NewsItem } from '@/lib/types'
import { timeAgo, CATEGORY_CONFIG } from '@/lib/constants'

interface FeedCardProps {
  item: NewsItem
  index: number
}

export function FeedCard({ item, index }: FeedCardProps) {
  const [score, setScore] = useState(item.hype_score)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)

  const handleVote = (direction: 'up' | 'down', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (vote === direction) {
      setVote(null)
      setScore(item.hype_score)
    } else {
      setVote(direction)
      setScore(direction === 'up' ? item.hype_score + 1 : item.hype_score - 1)
    }
  }

  const category = CATEGORY_CONFIG[item.category]

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-feed block group animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <button
            onClick={(e) => handleVote('up', e)}
            className={`vote-btn up ${vote === 'up' ? 'active up' : ''}`}
            aria-label="Upvote"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 15 7-7 7 7" />
            </svg>
          </button>
          <span className="data-value text-sm text-text-secondary tabular-nums">{score}</span>
          <button
            onClick={(e) => handleVote('down', e)}
            className={`vote-btn down ${vote === 'down' ? 'active down' : ''}`}
            aria-label="Downvote"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-2">
            {item.is_breaking && (
              <span className="badge-error">BREAKING</span>
            )}
            <span className={`badge ${category?.bg || 'bg-void-700'}`}>
              {category?.icon} {item.category}
            </span>
            <span className="text-xs font-medium text-text-secondary">{item.source}</span>
            <span className="text-text-quaternary">·</span>
            <span className="text-xs text-text-tertiary">{timeAgo(item.published_at)}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors mb-2">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {item.summary}
          </p>

          {/* Tags & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs text-text-tertiary hover:text-text-secondary flex items-center gap-1 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
                {index % 5 + 2}
              </button>
              <button className="text-xs text-text-tertiary hover:text-text-secondary flex items-center gap-1 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}
