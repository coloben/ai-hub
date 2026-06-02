'use client'

import { useCallback, useEffect, useState } from 'react'
import { PostCard } from './post-card'
import { PostComposer } from './post-composer'
import { FeedTabs } from './feed-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import type { SocialPost, FeedSort } from '@/lib/social/schema'
import type { HubId } from '@/lib/social/hubs'

interface SocialFeedProps {
  initialPosts: SocialPost[]
  initialSort?: FeedSort
  hub?: HubId | 'all'
}

export function SocialFeed({ initialPosts, initialSort = 'hot', hub = 'all' }: SocialFeedProps) {
  const [sort, setSort] = useState<FeedSort>(initialSort)
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ sort })
      if (hub !== 'all') q.set('hub', hub)
      const res = await fetch(`/api/v1/posts?${q}`)
      const data = await res.json()
      if (Array.isArray(data.posts)) setPosts(data.posts)
    } finally {
      setLoading(false)
    }
  }, [sort, hub])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <>
      <PostComposer defaultHub={hub === 'all' ? 'general' : hub} onPosted={() => void refresh()} />
      <FeedTabs active={sort} onChange={setSort} />
      {loading && posts.length === 0 ? (
        <FeedSkeleton />
      ) : (
        <div className={loading ? 'opacity-60 pointer-events-none' : ''}>
          {posts.map((post) => (
            <PostCard key={`${post.id}-${post.score}`} post={post} />
          ))}
          {posts.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun post dans ce hub. Soyez le premier à publier.
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
