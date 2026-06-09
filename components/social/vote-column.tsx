'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getVoterId, fmtScore } from '@/lib/social/client'
import { bumpLiveStats } from '@/lib/live/events'
import { cn } from '@/lib/utils'

const POST_VOTES_KEY = 'aihub_post_votes'

function loadPostVote(postId: string): 'up' | 'down' | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(POST_VOTES_KEY)
    const map = raw ? (JSON.parse(raw) as Record<string, 'up' | 'down'>) : {}
    return map[postId] ?? null
  } catch {
    return null
  }
}

function savePostVote(postId: string, direction: 'up' | 'down') {
  try {
    const raw = localStorage.getItem(POST_VOTES_KEY)
    const map = raw ? (JSON.parse(raw) as Record<string, 'up' | 'down'>) : {}
    map[postId] = direction
    localStorage.setItem(POST_VOTES_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

interface VoteColumnProps {
  postId: string
  kind: 'community' | 'curated'
  score: number
  compact?: boolean
}

export function VoteColumn({ postId, kind, score: initialScore, compact }: VoteColumnProps) {
  const [score, setScore] = useState(initialScore)
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setScore(initialScore)
  }, [initialScore])

  useEffect(() => {
    setVoted(loadPostVote(postId))
  }, [postId])

  async function vote(direction: 'up' | 'down') {
    if (busy || voted || kind !== 'community') return
    setBusy(true)
    try {
      const res = await fetch(`/api/v1/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, voterId: getVoterId() }),
      })
      const data = await res.json()
      if (data.post?.score != null) {
        setScore(data.post.score)
      } else if (!data.duplicate) {
        setScore((s) => s + (direction === 'up' ? 1 : -1))
      }
      if (!data.duplicate) {
        setVoted(direction)
        savePostVote(postId, direction)
        bumpLiveStats()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-0.5 shrink-0',
        compact ? 'min-w-[2rem]' : 'min-w-[2.25rem] pt-0.5'
      )}
    >
      <button
        type="button"
        onClick={() => vote('up')}
        disabled={busy || voted !== null}
        aria-label="Upvote"
        className={cn(
          'p-0.5 rounded hover:bg-accent-dim transition-colors disabled:opacity-40',
          voted === 'up' && 'text-accent'
        )}
      >
        <ChevronUp size={compact ? 18 : 20} strokeWidth={2.5} />
      </button>
      <span
        className={cn(
          'text-xs font-mono font-bold tabular-nums',
          score > 0 ? 'text-accent' : score < 0 ? 'text-destructive' : 'text-muted-foreground'
        )}
      >
        {fmtScore(score)}
      </span>
      <button
        type="button"
        onClick={() => vote('down')}
        disabled={busy || voted !== null}
        aria-label="Downvote"
        className={cn(
          'p-0.5 rounded hover:bg-destructive-dim transition-colors disabled:opacity-40',
          voted === 'down' && 'text-destructive'
        )}
      >
        <ChevronDown size={compact ? 18 : 20} strokeWidth={2.5} />
      </button>
    </div>
  )
}
