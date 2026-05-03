import type { Metadata } from 'next'
import Link from 'next/link'
import { getLiveNews } from '@/lib/feed'
import { NewsCategory } from '@/lib/types'
import { NewsItemInteractive } from '@/components/NewsItemInteractive'

export const metadata: Metadata = {
  title: 'Feed IA — Actualités en temps réel',
  description: 'Toutes les actualités IA : releases, benchmarks, recherche, prix. OpenAI, Anthropic, Google, Meta, Mistral en direct.',
}

export const revalidate = 900

const categoryLabel: Record<NewsCategory, string> = {
  release:   'Release',
  benchmark: 'Benchmark',
  research:  'Recherche',
  industry:  'Industrie',
  pricing:   'Tarifs',
  security:  'Sécurité',
  community: 'Communauté',
}

const avatarMap: Record<string, string> = {
  Anthropic: 'AN', OpenAI: 'OA', Google: 'GG', Meta: 'MA',
  Mistral: 'MI', LMSYS: 'LM', ArXiv: 'AX', Microsoft: 'MS',
  xAI: 'XA', DeepSeek: 'DS',
}
function initials(source: string): string {
  return avatarMap[source] ?? source.slice(0, 2).toUpperCase()
}

export default async function NewsPageClient() {
  const allNews = await getLiveNews()
  const sources = Array.from(new Set(allNews.map(n => n.source)))

  return (
    <div
      className="mx-auto grid max-w-[1440px] px-4 md:px-6"
      style={{ gridTemplateColumns: 'minmax(0,1fr) 260px' }}
    >
      {/* ── FEED ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col border-r border-border min-h-[calc(100vh-76px)]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text">Feed IA</span>
            <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
            <span className="text-xs text-text-3">temps réel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-3">{allNews.length} publications</span>
            <Link
              href="/submit"
              className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              + Soumettre
            </Link>
          </div>
        </div>

        {/* Posts — chaque item est un Client Component interactif */}
        <div className="flex-1">
          {allNews.map(item => (
            <NewsItemInteractive
              key={item.id}
              id={item.id}
              title={item.title}
              summary={item.summary}
              source={item.source}
              url={item.url}
              published_at={item.published_at}
              category={item.category}
              tags={item.tags}
              is_breaking={item.is_breaking}
              hype_score={item.hype_score}
            />
          ))}
        </div>
      </div>

      {/* ── SIDEBAR — FILTRES + SOURCES ────────────────────────── */}
      <aside className="hidden md:flex flex-col py-6 pl-6">

        <p className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">Catégories</p>
        <div className="mb-7 flex flex-col gap-0.5">
          {(Object.entries(categoryLabel) as [NewsCategory, string][]).map(([cat, label]) => {
            const count = allNews.filter(n => n.category === cat).length
            if (count === 0) return null
            return (
              <div key={cat} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-text-2 hover:bg-surface cursor-pointer transition-colors">
                <span>{label}</span>
                <span className="text-xs tabular-nums text-text-3">{count}</span>
              </div>
            )
          })}
        </div>

        <p className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">Sources</p>
        <div className="flex flex-col gap-2">
          {sources.map(source => {
            const count = allNews.filter(n => n.source === source).length
            return (
              <div key={source} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-2xs font-bold text-text-3">
                  {initials(source)}
                </span>
                <span className="flex-1 text-sm text-text-2 truncate">{source}</span>
                <span className="text-xs tabular-nums text-text-3">{count}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-auto pt-8">
          <Link href="/" className="text-xs text-text-3 transition-colors hover:text-text-2">← Dashboard</Link>
        </div>
      </aside>
    </div>
  )
}
