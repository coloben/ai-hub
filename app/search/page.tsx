import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getRanking } from '@/lib/data/pipeline'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Recherche modèles IA',
  description: 'Trouvez un modèle dans le classement Arena AI Hub.',
  robots: { index: true, follow: true },
}

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const query = q.trim().toLowerCase()
  const ranking = await getRanking()

  const results = query
    ? ranking.models.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.organization.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query)
      )
    : ranking.models.slice(0, 20)

  return (
    <div id="main" className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopNav active="Classement" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-display font-bold mb-2">Recherche</h1>
        <form method="get" action="/search" className="mb-6">
          <label htmlFor="search-q" className="sr-only">
            Rechercher un modèle
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="GPT, Claude, Gemini…"
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground"
          />
        </form>
        <ul className="space-y-2" role="list">
          {results.map((m, i) => (
            <li key={m.id}>
              <Link
                href={`/model/${m.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border/80 hover:border-accent/30 transition-colors"
              >
                <span>
                  <span className="font-medium text-foreground">{m.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{m.organization}</span>
                </span>
                <span className="font-mono text-sm text-accent">#{i + 1} · {m.elo}</span>
              </Link>
            </li>
          ))}
        </ul>
        {query && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun résultat pour « {q} »</p>
        )}
      </div>
      <Footer />
      <MobileNav />
    </div>
  )
}
