'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PostCard } from './post-card'
import { PostComposer } from './post-composer'
import { FeedTabs } from './feed-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { sortPosts } from '@/lib/social/scoring'
import type { SocialPost, FeedSort } from '@/lib/social/schema'
import type { HubId } from '@/lib/social/hubs'

interface SocialFeedProps {
  initialPosts: SocialPost[]
  initialSort?: FeedSort
  hub?: HubId | 'all'
}

export function SocialFeed({ initialPosts, initialSort = 'hot', hub = 'all' }: SocialFeedProps) {
  const [sort, setSort] = useState<FeedSort>(initialSort)
  const [allPosts, setAllPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setAllPosts(initialPosts)
    setSort(initialSort)
  }, [initialPosts, initialSort])

  const posts = useMemo(() => sortPosts(allPosts, sort), [allPosts, sort])

  const communityPosts = posts.filter((p) => p.kind === 'community')
  const curatedPosts = posts.filter((p) => p.kind === 'curated')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ sort: 'new' })
      if (hub !== 'all') q.set('hub', hub)
      const res = await fetch(`/api/v1/posts?${q}`, { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data.posts)) setAllPosts(data.posts)
    } finally {
      setLoading(false)
    }
  }, [hub])

  function changeSort(next: FeedSort) {
    setSort(next)
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    params.set('sort', next)
    if (hub !== 'all') params.set('hub', hub)
    else params.delete('hub')
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `/?${qs}` : '/')
  }

  return (
    <>
      <div className="border-b border-border/60 bg-muted/20 px-3 py-2">
        <p className="text-[11px] font-semibold text-foreground">Publier sur AI Hub</p>
        <p className="text-[10px] text-muted-foreground">Posts communauté — votes et commentaires réels</p>
      </div>
      <PostComposer defaultHub={hub === 'all' ? 'general' : hub} onPosted={() => void refresh()} />
      <FeedTabs active={sort} onChange={changeSort} />

      {loading && allPosts.length === 0 ? (
        <FeedSkeleton />
      ) : (
        <div aria-busy={loading}>
          {loading && (
            <p className="text-center text-[10px] text-muted-foreground py-1">Actualisation…</p>
          )}
          {communityPosts.length > 0 && (
            <section aria-label="Posts communauté">
              {communityPosts.map((post) => (
                <PostCard key={`${post.id}-${post.score}`} post={post} />
              ))}
            </section>
          )}

          {curatedPosts.length > 0 && (
            <section aria-label="Actualités importées">
              <div className="px-3 py-2 border-b border-border/50 bg-card/40">
                <p className="text-[11px] font-semibold text-foreground">Actualités importées</p>
                <p className="text-[10px] text-muted-foreground">
                  arXiv cs.AI & Hugging Face — pas publiées par des membres @arxiv
                </p>
              </div>
              {curatedPosts.map((post) => (
                <PostCard key={`${post.id}-curated`} post={post} />
              ))}
            </section>
          )}

          {communityPosts.length === 0 && curatedPosts.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {hub === 'all'
                ? 'Aucun contenu pour le moment.'
                : `Aucun post dans h/${hub}. Les actualités arXiv sont dans h/research.`}
            </p>
          )}

          {communityPosts.length === 0 && curatedPosts.length > 0 && hub !== 'all' && hub !== 'research' && (
            <p className="py-6 text-center text-[12px] text-muted-foreground border-t border-border/40">
              Aucun post communauté dans ce hub — seulement des imports ci-dessus ou dans h/research.
            </p>
          )}
        </div>
      )}
    </>
  )
}

function FeedSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 flex gap-3">
          <Skeleton className="h-12 w-8" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}
