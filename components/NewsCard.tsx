'use client'

import { NewsItem } from '@/lib/types'
import { enrichNews } from '@/lib/intelligence'
import { verifyNewsItem } from '@/lib/verification'
import { factCheckNewsItem, getReliabilityBadge } from '@/lib/fact-checker'
import { mockNews } from '@/lib/mock-data'
import { CATEGORY_CONFIG, VERIFICATION_CONFIG, timeAgo, isNew, isHot } from '@/lib/constants'
import Link from 'next/link'

interface NewsCardProps {
  news: NewsItem
  variant?: 'compact' | 'standard' | 'featured'
}

export function NewsCard({ news, variant = 'standard' }: NewsCardProps) {
  const intelligence = enrichNews(news)
  const verification = verifyNewsItem(news, mockNews)
  const factCheck = factCheckNewsItem(news)
  const reliabilityBadge = getReliabilityBadge(news)
  const category = CATEGORY_CONFIG[news.category] ?? CATEGORY_CONFIG.industry
  const verif = VERIFICATION_CONFIG[verification.status]

  if (variant === 'compact') {
    return (
      <a href={news.url} target="_blank" rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-xl border border-divider bg-surface p-3 transition-all hover:border-border-hover hover:bg-surface-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-sm">{category.icon}</span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-medium text-text transition-colors group-hover:text-primary">{news.title}</h4>
          <div className="mt-0.5 flex items-center gap-2 text-2xs text-text-3">
            <span>{news.source}</span><span>·</span><span>{timeAgo(news.published_at)}</span><span>·</span>
            <span className={intelligence.severity === 'critical' ? 'text-error' : 'text-text-2'}>Impact {intelligence.impact}</span>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-2xs ${verif.color}`}>{verif.icon}</span>
      </a>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6">
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${category.bg} opacity-30 blur-3xl`} />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-2xs font-medium uppercase tracking-wider ${category.bg} ${category.color}`}>
              {category.icon} {news.category}
            </span>
            {isNew(news.published_at) && <span className="animate-pulse rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-medium text-primary">NOUVEAU</span>}
            {news.is_breaking && <span className="rounded-full bg-error-dim px-2 py-0.5 text-2xs font-medium text-error">🔴 FLASH</span>}
            <span className="ml-auto flex items-center gap-1 text-2xs text-text-3">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {timeAgo(news.published_at)}
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-text transition-colors hover:text-primary">
            <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{news.title}</a>
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-text-2 line-clamp-3">{news.summary}</p>
          <div className="mb-4 rounded-xl border border-border bg-surface-2 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-2xs font-medium ${verif.color}`}>{verif.icon} {verif.label}</span>
              <span className={`rounded-full border px-2.5 py-1 text-2xs font-medium ${reliabilityBadge.color}`} title={reliabilityBadge.tooltip}>{reliabilityBadge.icon} {reliabilityBadge.text}</span>
              <span className="rounded-full bg-surface-3 px-2.5 py-1 text-2xs text-text-2">Confiance {intelligence.confidence}/100</span>
              <span className={`rounded-full px-2.5 py-1 text-2xs font-medium ${intelligence.impact >= 80 ? 'bg-error-dim text-error' : intelligence.impact >= 60 ? 'bg-warn-dim text-warn' : 'bg-surface-3 text-text-2'}`}>
                Impact {intelligence.impact}/100
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2"><span className="mt-0.5 text-primary">→</span><p className="text-text-2">{intelligence.whyItMatters}</p></div>
              <div className="flex items-start gap-2"><span className="mt-0.5 text-success">✓</span><p className="text-text-3">{intelligence.action}</p></div>
            </div>
            {factCheck.issues.length > 0 && (
              <div className="mt-3 rounded-lg border border-divider bg-surface p-2">
                <p className="mb-1 text-2xs uppercase tracking-wider text-text-3">Vérification</p>
                <ul className="space-y-1">{factCheck.issues.slice(0, 2).map((issue, i) => <li key={i} className="flex items-start gap-1.5 text-2xs text-warn"><span>⚠</span><span>{issue}</span></li>)}</ul>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-2">{news.source}</span>
              <div className="flex gap-1">{news.tags.slice(0, 3).map(tag => <span key={tag} className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs text-text-3">#{tag}</span>)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/compare?model=${encodeURIComponent(news.title.slice(0, 30))}`} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">Comparer</Link>
              <a href={news.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-3">Source →</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 transition-all hover:border-border-hover hover:bg-surface-2">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${category.bg} opacity-0 blur-2xl transition-opacity group-hover:opacity-50`} />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${category.bg}`}>{category.icon}</span>
          <span className="text-2xs font-medium uppercase tracking-wider text-text-3">{news.source}</span>
          <span className="ml-auto flex items-center gap-1 text-2xs text-text-3">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {timeAgo(news.published_at)}
          </span>
        </div>
        <h3 className="mb-2 text-sm font-semibold leading-snug text-text transition-colors group-hover:text-primary line-clamp-2">
          <a href={news.url} target="_blank" rel="noopener noreferrer">{news.title}</a>
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-text-2 line-clamp-2">{news.summary}</p>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-2xs ${verif.color}`}>{verif.icon}</span>
          {isHot(news.published_at) && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-2xs text-red-400">🔥 Hot</span>}
          {news.hype_score > 70 && <span className="rounded-full bg-amber/10 px-2 py-0.5 text-2xs text-amber">⚡ {news.hype_score}</span>}
          <span className={`ml-auto rounded-full px-2 py-0.5 text-2xs font-mono ${intelligence.impact >= 70 ? 'text-primary' : 'text-text-3'}`}>{intelligence.impact} IMP</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {news.tags.slice(0, 2).map(tag => <span key={tag} className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs text-text-3">#{tag}</span>)}
        </div>
      </div>
    </div>
  )
}
