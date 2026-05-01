'use client'

import { NewsItem } from '@/lib/types'
import { enrichNews } from '@/lib/intelligence'
import { verifyNewsItem, VerificationStatus } from '@/lib/verification'
import { mockNews } from '@/lib/mock-data'

interface NewsCardProps {
  news: NewsItem
  featured?: boolean
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const minutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60))
  
  if (minutes < 5) return 'maintenant'
  if (minutes < 60) return `il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

function isNew(date: string): boolean {
  const now = new Date()
  const then = new Date(date)
  return (now.getTime() - then.getTime()) < 30 * 60 * 1000
}

const badgeConfig: Record<VerificationStatus, { label: string; cls: string }> = {
  confirmed:    { label: '✓ Confirmé',              cls: 'bg-success/10 text-success border-success/20' },
  watch:        { label: '⚑ À surveiller',          cls: 'bg-amber/10 text-amber border-amber/20' },
  unverified:   { label: '? À vérifier',             cls: 'bg-white/[0.05] text-text-muted border-white/10' },
  contradicted: { label: '⚠ Contradiction détectée', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

function VerificationBadge({ status, score }: { status: VerificationStatus; score: number }) {
  const { label, cls } = badgeConfig[status]
  return (
    <span className={`rounded-full border px-2 py-0.5 text-2xs font-medium ${cls}`} title={`Consensus ${score}/100`}>
      {label}
    </span>
  )
}

export function NewsCard({ news, featured = false }: NewsCardProps) {
  const intelligence = enrichNews(news)
  const verification = verifyNewsItem(news, mockNews)

  if (featured) {
    return (
      <div className="intel-card intel-card-hover relative overflow-hidden rounded-[24px] p-6 cursor-pointer group col-span-full">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl"></div>
        <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-white/[0.045] px-2 py-0.5 text-2xs font-mono text-text-faint uppercase tracking-[0.16em]">
            {news.source}
          </span>
          <span className="text-2xs font-mono text-primary">
            {formatTimeAgo(news.published_at)}
          </span>
          {news.is_breaking && (
            <span className="px-2 py-0.5 bg-amber/10 text-amber text-2xs font-medium rounded-full border border-amber/20">
              FLASH
            </span>
          )}
          {isNew(news.published_at) && (
            <span className="px-2 py-0.5 bg-primary/15 text-primary text-2xs font-medium rounded-full animate-pulse">
              NOUV.
            </span>
          )}
          <VerificationBadge status={verification.status} score={verification.consensusScore} />
        </div>
        <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors tracking-[-0.04em] leading-tight">
          {news.title}
        </h3>
        <p className="text-sm text-text-muted leading-relaxed">
          {news.summary}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {news.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-white/[0.05] text-2xs text-text-muted rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
          {news.hype_score > 70 && (
            <span className="ml-auto rounded-full bg-amber/10 px-2.5 py-1 text-2xs text-amber">🔥 {news.hype_score}</span>
          )}
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-2xs text-primary">
            Impact {intelligence.impact}/100
          </span>
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-2xs font-medium uppercase tracking-[0.18em] text-text-faint">Analyse</span>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-2xs text-text-muted">
              Confiance {intelligence.confidence}/100
            </span>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-2xs text-text-muted">
              Consensus {verification.consensusScore}/100
            </span>
          </div>
          <p className="text-2xs leading-5 text-text-muted">{intelligence.whyItMatters}</p>
          <p className="mt-1 text-2xs leading-5 text-text-faint">{verification.rationale}</p>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="intel-card intel-card-hover relative overflow-hidden rounded-2xl p-4 cursor-pointer group">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"></div>
      <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-2xs font-mono text-text-faint uppercase tracking-[0.14em]">
          {news.source}
        </span>
        <span className="text-2xs font-mono text-primary">
          {formatTimeAgo(news.published_at)}
        </span>
        {news.is_breaking && (
          <span className="px-2 py-0.5 bg-amber/10 text-amber text-2xs font-medium rounded-full">
            FLASH
          </span>
        )}
        {isNew(news.published_at) && (
          <span className="ml-auto px-2 py-0.5 bg-primary/15 text-primary text-2xs font-medium rounded-full animate-pulse">
            NOUV.
          </span>
        )}
        <VerificationBadge status={verification.status} score={verification.consensusScore} />
      </div>
      <h3 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-5">
        {news.title}
      </h3>
      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
        {news.summary}
      </p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-wrap gap-1">
          {news.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-white/[0.045] text-2xs text-text-faint rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        {news.hype_score > 70 && (
          <span className="text-2xs text-amber">🔥 {news.hype_score}</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
        <span className="text-2xs text-text-faint">Impact</span>
        <span className="font-mono text-2xs text-primary">{intelligence.impact}/100</span>
      </div>
      </div>
    </div>
  )
}
