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

function initials(source: string): string {
  // Supporte les domaines HN (openai.com, arxiv.org) et Reddit (Reddit r/LocalLLaMA)
  const clean = source.replace(/^www\./, '')
  if (clean.startsWith('Reddit')) return 'RD'
  if (clean.includes('ycombinator')) return 'HN'
  const parts = clean.split(/[.\s]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

export default async function NewsPageClient() {
  const allNews = await getLiveNews()
  const sources = Array.from(new Set(allNews.map(n => n.source)))

  return (
    <div
      className="mx-auto grid max-w-[1440px] px-4 md:px-6 gap-6"
      style={{ gridTemplateColumns: 'minmax(0,1fr) 260px' }}
    >
      {/* ── FEED ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col border-r border-white/[0.06] min-h-[calc(100vh-76px)]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white/90">Feed IA</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] live-dot" />
            <span className="text-xs text-white/30">temps réel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">{allNews.length} publications</span>
            <Link
              href="/submit"
              className="rounded-lg border border-[#00d4aa]/40 bg-[#00d4aa]/10 px-3 py-1.5 text-xs font-semibold text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-colors"
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
              commentCount={item.comment_count}
            />
          ))}
        </div>
      </div>

      {/* ── SIDEBAR — FILTRES + SOURCES ────────────────────────── */}
      <aside className="hidden md:flex flex-col py-6 pl-6">

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/30">Catégories</p>
        <div className="mb-7 flex flex-col gap-0.5">
          {(Object.entries(categoryLabel) as [NewsCategory, string][]).map(([cat, label]) => {
            const count = allNews.filter(n => n.category === cat).length
            if (count === 0) return null
            return (
              <div key={cat} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-white/55 hover:bg-white/[0.04] cursor-pointer transition-colors">
                <span>{label}</span>
                <span className="text-xs tabular-nums text-white/30">{count}</span>
              </div>
            )
          })}
        </div>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/30">Sources</p>
        <div className="flex flex-col gap-2">
          {sources.map(source => {
            const count = allNews.filter(n => n.source === source).length
            return (
              <div key={source} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-[11px] font-bold text-white/30">
                  {initials(source)}
                </span>
                <span className="flex-1 text-sm text-white/55 truncate">{source}</span>
                <span className="text-xs tabular-nums text-white/30">{count}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-auto pt-8">
          <Link href="/" className="text-xs text-white/30 transition-colors hover:text-white/55">← Dashboard</Link>
        </div>
      </aside>
    </div>
  )
}
