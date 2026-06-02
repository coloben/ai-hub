import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'

interface ComingSoonPageProps {
  title: string
  description: string
  activeNav?: string
  children?: React.ReactNode
}

export function ComingSoonPage({ title, description, activeNav, children }: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-background grid-dots">
      <TopNav active={activeNav} />
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Bientôt disponible</p>
        <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{description}</p>
        {children}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Retour au feed</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/ranking">Voir le classement</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
