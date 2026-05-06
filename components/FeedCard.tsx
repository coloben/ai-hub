'use client'

import { useState } from 'react'
import { NewsItem } from '@/lib/types'
import { timeAgo, CATEGORY_CONFIG } from '@/lib/constants'
import { ArrowUp, ArrowDown, MessageSquare, ExternalLink } from 'lucide-react'

interface FeedCardProps {
  item: NewsItem
  index: number
}

export function FeedCard({ item, index }: FeedCardProps) {
  const [score, setScore] = useState(item.hype_score)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)

  const handleVote = (direction: 'up' | 'down') => {
    if (vote === direction) {
      setVote(null)
      setScore(item.hype_score)
    } else {
      setVote(direction)
      setScore(direction === 'up' ? item.hype_score + 1 : item.hype_score - 1)
    }
  }

  const cat = CATEGORY_CONFIG[item.category]

  return (
    <div className="line-item animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
      {/* Vote column — separate from link */}
      <div className="vote-col pt-0.5">
        <button
          onClick={() => handleVote('up')}
          className={`vote-up ${vote === 'up' ? 'active' : ''}`}
          aria-label="Upvote"
        >
          <ArrowUp size={16} />
        </button>
        <span className="score">{score}</span>
        <button
          onClick={() => handleVote('down')}
          className={`vote-down ${vote === 'down' ? 'active' : ''}`}
          aria-label="Downvote"
        >
          <ArrowDown size={16} />
        </button>
      </div>

      {/* Content — link wraps title only, not buttons */}
      <div className="flex-1 min-w-0">
        {/* Meta line */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {item.is_breaking && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/80">BREAKING</span>
          )}
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
            {cat?.icon} {item.category}
          </span>
          <span className="text-xs text-white/45">{item.source}</span>
          <span className="text-white/15">·</span>
          <span className="text-xs text-white/30">{timeAgo(item.published_at)}</span>
        </div>

        {/* Title — the actual link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-block"
        >
          <h3 className="text-sm font-semibold text-white/90 leading-snug group-hover:text-white transition-colors">
            {item.title}
          </h3>
        </a>

        {/* Summary */}
        <p className="text-sm text-white/45 mt-1 line-clamp-2 leading-relaxed">
          {item.summary}
        </p>

        {/* Tags + hover actions */}
        <div className="flex items-center gap-3 mt-2.5">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] text-white/30 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded hover:text-white/50 hover:border-white/10 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-[11px] text-white/25 flex items-center gap-1">
              <MessageSquare size={12} />
              {index % 4 + 1}
            </span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-white/25 hover:text-white/50 flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={12} />
              Source
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
