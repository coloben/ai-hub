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
      {/* Vote column */}
      <div className="vote-col">
        <button
          onClick={() => handleVote('up')}
          className={`vote-up ${vote === 'up' ? 'active' : ''}`}
          aria-label="Upvote"
        >
          <ArrowUp size={18} />
        </button>
        <span className="score">{score}</span>
        <button
          onClick={() => handleVote('down')}
          className={`vote-down ${vote === 'down' ? 'active' : ''}`}
          aria-label="Downvote"
        >
          <ArrowDown size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {item.is_breaking && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.08] text-white/70 border border-white/[0.08]">
              BREAKING
            </span>
          )}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/25">
            {cat?.icon} {item.category}
          </span>
          <span className="text-xs text-white/40">{item.source}</span>
          <span className="text-white/10">·</span>
          <span className="text-xs text-white/25">{timeAgo(item.published_at)}</span>
        </div>

        {/* Title link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-block mb-2"
        >
          <h3 className="text-[15px] font-semibold text-white/90 leading-snug group-hover:text-white transition-colors">
            {item.title}
          </h3>
        </a>

        {/* Summary */}
        <p className="text-[14px] text-white/40 leading-relaxed line-clamp-2 mb-3">
          {item.summary}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] text-white/25 bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-md hover:text-white/45 hover:border-white/[0.10] hover:bg-white/[0.06] transition-all cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-[11px] text-white/20 flex items-center gap-1">
              <MessageSquare size={13} />
              {item.comment_count ?? 0}
            </span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-white/20 hover:text-white/40 flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={13} />
              Source
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
