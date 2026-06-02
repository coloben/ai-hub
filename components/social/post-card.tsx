'use client'

import Link from 'next/link'
import { MessageSquare, Share2, ExternalLink, Bookmark } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VoteColumn } from './vote-column'
import { fmtScore, timeAgo } from '@/lib/social/client'
import { FLAIR_COLORS } from '@/lib/social/hubs'
import type { SocialPost } from '@/lib/social/schema'
import type { Flair } from '@/lib/social/hubs'
import { getHub } from '@/lib/social/hubs'

interface PostCardProps {
  post: SocialPost
}

export function PostCard({ post }: PostCardProps) {
  const hub = getHub(post.hub)
  const flairClass = FLAIR_COLORS[post.flair as Flair] ?? FLAIR_COLORS.Discussion

  return (
    <article className="group flex gap-2 px-3 py-3 hover:bg-card-hover/40 transition-colors border-b border-border/50 last:border-0">
      <VoteColumn postId={post.id} kind={post.kind} score={post.score} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground mb-0.5">
          {hub && (
            <Link
              href={`/hubs?hub=${post.hub}`}
              className="font-semibold text-foreground hover:text-accent transition-colors"
            >
              h/{post.hub}
            </Link>
          )}
          <span>·</span>
          <Link href={`/post/${post.id}`} className="hover:underline">
            <span className="text-foreground/90">{post.author}</span>
            <span className="ml-1 opacity-70">@{post.handle}</span>
          </Link>
          <span>· {timeAgo(post.createdAt)}</span>
          <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 ${flairClass}`}>
            {post.flair}
          </Badge>
          {post.kind === 'curated' && (
            <span className="text-[9px] uppercase tracking-wide text-accent-2/80">Arena</span>
          )}
        </div>

        <Link href={`/post/${post.id}`} className="block">
          <h2 className="text-[15px] font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
            {post.title}
          </h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 mb-2">
            {post.content}
          </p>
        </Link>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {post.tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="text-[11px] text-accent/90 hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-muted hover:text-foreground transition-colors"
          >
            <MessageSquare size={14} />
            <span className="font-mono">{fmtScore(post.commentCount)}</span>
          </Link>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ title: post.title, url: `${window.location.origin}/post/${post.id}` })
              } else {
                void navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
              }
            }}
          >
            <Share2 size={14} />
            <span>Partager</span>
          </button>
          {post.sourceUrl && (
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-muted hover:text-accent transition-colors ml-auto"
            >
              Source <ExternalLink size={12} />
            </a>
          )}
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Signet"
            title="Signets — bientôt"
          >
            <Bookmark size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}
