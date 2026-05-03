'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  targetId: string
  targetType: 'post' | 'comment' | 'benchmark'
  initialScore: number
  initialVote?: 1 | -1 | 0
  size?: 'sm' | 'md'
}

export function VoteButton({ targetId, targetType, initialScore, initialVote = 0, size = 'md' }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [score, setScore] = useState(initialScore)
  const [vote, setVote] = useState<1 | -1 | 0>(initialVote)
  const [loading, setLoading] = useState(false)

  async function handleVote(value: 1 | -1) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setLoading(true)
    const prev = vote
    const newVote = prev === value ? 0 : value
    const delta = newVote - prev
    setVote(newVote as 1 | -1 | 0)
    setScore(s => s + delta)

    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_id: targetId, target_type: targetType, value }),
    })
    if (!res.ok) {
      setVote(prev)
      setScore(s => s - delta)
    }
    setLoading(false)
  }

  const btnBase = size === 'sm'
    ? 'flex items-center justify-center rounded p-0.5 transition-colors disabled:opacity-50'
    : 'flex items-center justify-center rounded-md p-1 transition-colors disabled:opacity-50'

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`${btnBase} ${vote === 1 ? 'text-primary' : 'text-text-3 hover:text-primary'}`}
        aria-label="Upvote"
      >
        <svg className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} viewBox="0 0 24 24" fill={vote === 1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <span className={`tabular-nums font-bold leading-none ${
        size === 'sm' ? 'text-2xs' : 'text-xs'
      } ${vote === 1 ? 'text-primary' : vote === -1 ? 'text-error' : 'text-text-2'}`}>
        {score > 0 ? `+${score}` : score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`${btnBase} ${vote === -1 ? 'text-error' : 'text-text-3 hover:text-error'}`}
        aria-label="Downvote"
      >
        <svg className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} viewBox="0 0 24 24" fill={vote === -1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  )
}
