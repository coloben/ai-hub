import { getFeed } from '@/lib/data/pipeline'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Share2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { FeedPost } from '@/lib/data/schema'

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

export async function DataFeedStream() {
  const feed = await getFeed()

  return (
    <div className="divide-y divide-border/60">
      {feed.posts.map((post: FeedPost, i: number) => (
        <article
          key={post.id}
          className="py-2.5 px-3 hover:bg-card-hover/30 transition-colors animate-slide-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="flex gap-2.5">
            <div
              className="flex flex-col items-center gap-0.5 pt-1 min-w-[2rem] text-muted-foreground/70"
              title="Votes communautaires — bientôt disponible"
            >
              <span className="text-xs font-mono font-bold text-foreground">{fmt(post.votes)}</span>
              <span className="text-[9px] uppercase tracking-wide">score</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="text-sm font-semibold text-foreground">{post.author}</span>
                <span className="text-xs text-muted-foreground">@{post.handle}</span>
                <span className="text-xs text-muted-foreground">· {post.time}</span>
                {post.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 leading-4">
                    {post.badge}
                  </Badge>
                )}
                {post.sourceUrl && (
                  <Link
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent/70 hover:text-accent flex items-center gap-0.5 ml-auto"
                  >
                    source <ExternalLink size={10} />
                  </Link>
                )}
              </div>

              <h3 className="text-[13px] font-medium text-foreground leading-snug mb-1">{post.title}</h3>

              <p className="text-[13px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                {post.content}
              </p>

              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-2">
                {post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="text-[11px] text-accent/80 hover:underline"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 text-[11px] text-muted-foreground/80" aria-hidden="true">
                <span className="flex items-center gap-1" title="Commentaires — bientôt">
                  <MessageSquare size={13} />
                  <span className="font-mono">{fmt(post.comments)}</span>
                </span>
                <span className="flex items-center gap-1" title="Partages — bientôt">
                  <Share2 size={13} />
                  <span className="font-mono">{fmt(post.shares)}</span>
                </span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
