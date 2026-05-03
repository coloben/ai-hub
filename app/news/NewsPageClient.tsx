import type { Metadata } from 'next'
import Link from 'next/link'
import { mockNews } from '@/lib/mock-data'
import { getLiveNews } from '@/lib/feed'
import { NewsCategory } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Feed IA — Actualités en temps réel',
  description: 'Toutes les actualités IA : releases, benchmarks, recherche, prix. OpenAI, Anthropic, Google, Meta, Mistral en direct.',
}

export const revalidate = 900

function timeAgo(date: string): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 5)  return 'à l\'instant'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

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
  const sorted  = allNews  // getLiveNews() trie déjà par date décroissante
  const sources = Array.from(new Set(allNews.map(n => n.source)))

  return (
    <div
      className="mx-auto grid max-w-[1440px] px-6"
      style={{ height: 'calc(100vh - 48px - 28px)', gridTemplateColumns: '1fr 280px' }}
    >

      {/* ── FEED ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col overflow-hidden border-r border-border">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text">Feed IA</span>
            <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
            <span className="text-xs text-text-3">temps réel</span>
          </div>
          <span className="text-xs text-text-3">{sorted.length} publications</span>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto">
          {sorted.map(item => (
            <div key={item.id} className="border-b border-border">

              {/* Post principal — cliquable vers source */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-4 transition-colors hover:bg-surface"
              >
                {/* En-tête post */}
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-xs font-bold text-text-2">
                    {initials(item.source)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold leading-none text-text">{item.source}</span>
                    <span className="text-xs text-text-3">@{item.source.toLowerCase().replace(/\s+/g, '')}</span>
                  </div>
                  <span className="shrink-0 text-xs text-text-3">{timeAgo(item.published_at)}</span>
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-text-3">
                    {categoryLabel[item.category]}
                  </span>
                  {item.is_breaking && (
                    <span className="shrink-0 text-2xs font-bold text-error">● Breaking</span>
                  )}
                </div>

                {/* Corps */}
                <p className="mb-1.5 text-sm font-semibold leading-snug text-text">{item.title}</p>
                <p className="text-sm leading-relaxed text-text-2">{item.summary}</p>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs text-text-3">#{tag}</span>
                    ))}
                  </div>
                )}
              </a>

              {/* Barre d'actions */}
              <div className="flex items-center gap-0 border-t border-border/50 px-6">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 pr-5 text-xs text-text-3 transition-colors hover:text-text-2"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 1 1.242 7.244" />
                  </svg>
                  Lire la source
                </a>
                <span className="mx-3 text-border-2">·</span>
                <span className="flex items-center gap-2 py-2 text-xs text-text-3">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48z" />
                  </svg>
                  Signal {item.hype_score}/100
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — FILTRES + SOURCES ──────────────────────────── */}
      <aside className="flex flex-col overflow-y-auto py-6 pl-6">

        <p className="mb-3 text-2xs font-semibold uppercase tracking-widest text-text-3">Catégories</p>
        <div className="mb-7 flex flex-col gap-0.5">
          {(Object.entries(categoryLabel) as [NewsCategory, string][]).map(([cat, label]) => {
            const count = allNews.filter(n => n.category === cat).length
            if (count === 0) return null
            return (
              <div
                key={cat}
                className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm text-text-2 hover:bg-surface cursor-pointer transition-colors"
              >
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
                <span className="flex-1 text-sm text-text-2">{source}</span>
                <span className="text-xs tabular-nums text-text-3">{count}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-auto pt-8">
          <Link href="/" className="text-xs text-text-3 transition-colors hover:text-text-2">
            ← Dashboard
          </Link>
        </div>

      </aside>

    </div>
  )
}
