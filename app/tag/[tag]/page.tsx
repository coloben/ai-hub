import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const label = decodeURIComponent(tag)
  return {
    title: `#${label} — Tag | AI Hub`,
    description: `Contenus et modèles liés au tag ${label} sur AI Hub.`,
  }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const label = decodeURIComponent(tag)

  return (
    <div className="min-h-screen bg-background grid-dots">
      <TopNav />
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Tag</p>
        <h1 className="text-2xl font-display font-bold text-foreground">#{label}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Le filtrage du feed par hashtag n&apos;est pas encore actif. Consultez le classement et le comparateur
          pour explorer les modèles liés à ce sujet.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/ranking">Classement</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/compare">Comparer</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Feed</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
