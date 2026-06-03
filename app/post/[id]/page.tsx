import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { VoteColumn } from '@/components/social/vote-column'
import { CommentThread } from '@/components/social/comment-thread'
import { CuratedPostMeta } from '@/components/social/curated-post-meta'
import { getPostById, getHub, FLAIR_COLORS } from '@/lib/social'
import { getCuratedDisplayMeta } from '@/lib/social/import-meta'
import type { Flair } from '@/lib/social/hubs'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CertifiedBadge } from '@/components/trust/certified-badge'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { timeAgo } from '@/lib/social/format'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) return { title: 'Post introuvable' }
  return {
    title: post.title,
    description: post.content.slice(0, 160),
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) notFound()

  const hub = getHub(post.hub)
  const flairClass = FLAIR_COLORS[post.flair as Flair] ?? FLAIR_COLORS.Discussion
  const isCommunity = post.kind === 'community'
  const curatedMeta = !isCommunity ? getCuratedDisplayMeta(post.handle) : null

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav active="Feed" />

      <div className="max-w-[680px] mx-auto px-4 py-4">
        <Link
          href={post.hub ? `/?hub=${post.hub}` : '/'}
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} />
          Retour au feed
        </Link>

        <Card className="overflow-hidden">
          <article className="flex gap-3 p-4">
            {isCommunity ? (
              <VoteColumn postId={post.id} kind={post.kind} score={post.score} />
            ) : (
              <div className="min-w-[2.25rem] pt-1 text-center shrink-0">
                {post.arenaVotes != null && post.arenaVotes > 0 ? (
                  <>
                    <p className="text-xs font-mono font-bold text-accent-2">
                      {post.arenaVotes.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-[8px] text-muted-foreground">Arena</p>
                  </>
                ) : (
                  <p className="text-[9px] text-muted-foreground">—</p>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isCommunity ? (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-2">
                  {hub && <span className="font-semibold text-foreground">h/{post.hub}</span>}
                  <span>@{post.handle}</span>
                  <span>· {timeAgo(post.createdAt)}</span>
                  <Badge className={`text-[9px] border-0 ${flairClass}`}>{post.flair}</Badge>
                  <CertifiedBadge variant="community" />
                </div>
              ) : (
                <div className="mb-2">
                  <CuratedPostMeta
                    author={post.author}
                    handle={post.handle}
                    createdAt={post.createdAt}
                    hub={post.hub}
                    hubLink={false}
                  />
                </div>
              )}
              <h1 className="text-xl font-display font-bold leading-snug mb-3">{post.title}</h1>
              <p className="text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">
                {post.content}
              </p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${encodeURIComponent(tag)}`}
                      className="text-sm text-accent hover:underline"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
              {post.sourceUrl && curatedMeta && (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline font-medium"
                >
                  {curatedMeta.discussLabel} <ExternalLink size={14} />
                </a>
              )}
              {post.sourceUrl && isCommunity && (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  Source officielle <ExternalLink size={14} />
                </a>
              )}
            </div>
          </article>

          {isCommunity && (
            <CommentThread postId={post.id} initialCount={post.commentCount} />
          )}
        </Card>
      </div>

      <Footer />
      <MobileNav />
    </div>
  )
}
