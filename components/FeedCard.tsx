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
    <div
      className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors duration-100"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Vote */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <button
          onClick={() => handleVote('up')}
          className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all duration-150 ${
            vote === 'up'
              ? 'border-up/40 bg-up/10 text-up'
              : 'border-white/[0.08] text-white/25 hover:border-white/[0.15] hover:text-white/55 hover:bg-white/[0.04]'
          }`}
          aria-label="Upvote"
        >
          <ArrowUp size={13} />
        </button>
        <span className="text-[11px] font-mono font-bold text-white/35 tabular-nums leading-none py-0.5">
          {score}
        </span>
        <button
          onClick={() => handleVote('down')}
          className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all duration-150 ${
            vote === 'down'
              ? 'border-down/40 bg-down/10 text-down'
              : 'border-white/[0.08] text-white/25 hover:border-white/[0.15] hover:text-white/55 hover:bg-white/[0.04]'
          }`}
          aria-label="Downvote"
        >
          <ArrowDown size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {item.is_breaking && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-down/10 text-down border border-down/20">
              BREAKING
            </span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
            {cat?.icon} {item.category}
          </span>
          <span className="text-white/[0.12]">·</span>
          <span className="text-[11px] font-medium text-white/45">{item.source}</span>
          <span className="text-white/[0.12]">·</span>
          <span className="text-[11px] text-white/25">{timeAgo(item.published_at)}</span>
        </div>

        {/* Title */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block mb-1.5"
        >
          <h3 className="text-[14px] font-semibold text-white/85 leading-snug group-hover:text-white transition-colors">
            {item.title}
          </h3>
        </a>

        {/* Summary */}
        <p className="text-[12px] text-white/35 leading-relaxed line-clamp-2 mb-2.5">
          {item.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] text-white/25 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded hover:text-white/45 hover:border-white/[0.10] hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3 text-white/25 hover:text-white/50 transition-colors">
            <span className="text-[10px] flex items-center gap-1">
              <MessageSquare size={11} />
              {item.comment_count ?? 0}
            </span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] flex items-center gap-1 hover:text-white/55 transition-colors"
            >
              <ExternalLink size={11} />
              Source
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
