'use client'

import { useState } from 'react'
import { VoteButton } from '@/components/VoteButton'
import { CommentDrawer } from '@/components/CommentDrawer'
import { CATEGORY_CONFIG, timeAgo } from '@/lib/constants'

interface NewsItemProps {
  id: string
  title: string
  summary: string
  source: string
  url: string
  published_at: string
  category: string
  tags: string[]
  is_breaking: boolean
  hype_score: number
  // score communauté (si post Supabase existant)
  communityScore?: number
  communityPostId?: string
  commentCount?: number
}

function initials(source: string) {
  // Supporte les domaines HN (openai.com, arxiv.org) et Reddit (Reddit r/LocalLLaMA)
  const clean = source.replace(/^www\./, '')
  if (clean.startsWith('Reddit')) return 'RD'
  if (clean.includes('ycombinator')) return 'HN'
  const parts = clean.split(/[.\s]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

export function NewsItemInteractive(props: NewsItemProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [localCommentCount, setLocalCommentCount] = useState(props.commentCount ?? 0)

  // postId pour les commentaires — uuid si post supabase, sinon hash de l'URL
  const postId = props.communityPostId ?? props.id

  return (
    <div className="border-b border-white/[0.06] group">

      {/* Contenu principal */}
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-6 py-4 transition-colors hover:bg-white/[0.04]"
      >
        <div className="mb-2.5 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-xs font-bold text-white/55">
            {initials(props.source)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold leading-none text-white/90">{props.source}</span>
            <span className="text-xs text-white/30">@{props.source.toLowerCase().replace(/\s+/g, '')}</span>
          </div>
          <span className="shrink-0 text-xs text-white/30">{timeAgo(props.published_at)}</span>
          <span className="shrink-0 rounded border border-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
            {(CATEGORY_CONFIG as Record<string, {icon:string}>)[props.category]?.icon ?? ''} {props.category}
          </span>
          {props.is_breaking && (
            <span className="shrink-0 text-[11px] font-bold text-[#ef4444]">● Breaking</span>
          )}
        </div>
        <p className="mb-1.5 text-sm font-semibold leading-snug text-white/90">{props.title}</p>
        <p className="text-sm leading-relaxed text-white/55">{props.summary}</p>
        {props.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {props.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs text-white/30">#{tag}</span>
            ))}
          </div>
        )}
      </a>

      {/* Barre d'actions */}
      <div className="flex items-center gap-0 border-t border-white/[0.04] px-4 py-1">

        {/* Vote */}
        <div className="flex items-center gap-1 pr-4">
          <VoteButton
            targetId={postId}
            targetType="post"
            initialScore={props.communityScore ?? 0}
            size="sm"
          />
        </div>

        <span className="text-white/[0.06] mx-1">·</span>

        {/* Commentaires */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/30 transition-colors hover:text-white/55"
          aria-label={`Commenter : ${props.title}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          {localCommentCount > 0 ? localCommentCount : 'Commenter'}
        </button>

        <span className="text-white/[0.06] mx-1">·</span>

        {/* Lire source */}
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/30 transition-colors hover:text-white/55"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 1 1.242 7.244" />
          </svg>
          Source
        </a>

        {/* Signal score */}
        <span className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-white/30">
          <span className={`h-1.5 w-1.5 rounded-full ${props.hype_score >= 88 ? 'bg-[#ef4444]' : props.hype_score >= 70 ? 'bg-[#f59e0b]' : 'bg-white/30'}`} />
          {props.hype_score}/100
        </span>

      </div>

      {/* Comment Drawer */}
      <CommentDrawer
        postId={postId}
        postTitle={props.title}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
