import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { Card } from '@/components/ui/card'
import { PostCard } from '@/components/social/post-card'
import { getUnifiedFeed } from '@/lib/social'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const label = decodeURIComponent(tag)
  return {
    title: `#${label} — Tag | AI Hub`,
    description: `Posts et actualités IA tagués #${label}.`,
  }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const label = decodeURIComponent(tag).toLowerCase()
  const { posts } = await getUnifiedFeed({ sort: 'new' })
  const filtered = posts.filter(
    (p) =>
      p.tags.some((t) => t.toLowerCase() === label) ||
      p.title.toLowerCase().includes(label) ||
      p.content.toLowerCase().includes(label)
  )

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav />
      <main className="max-w-[680px] mx-auto px-4 py-6">
        <h1 className="text-xl font-display font-bold">
          #{label}{' '}
          <span className="text-sm font-normal text-muted-foreground">({filtered.length} résultats)</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Filtrage réel sur titres, contenus et hashtags — pas de résultats inventés.
        </p>
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Aucun post pour ce tag.{' '}
              <Link href="/" className="text-accent hover:underline">
                Retour au feed
              </Link>
            </p>
          ) : (
            filtered.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </Card>
      </main>
      <Footer />
    </div>
  )
}
