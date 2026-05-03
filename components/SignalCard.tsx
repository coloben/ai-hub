'use client'

import { NewsItem } from '@/lib/types'
import { enrichNews } from '@/lib/intelligence'
import { verifyNewsItem } from '@/lib/verification'
import { factCheckNewsItem, getReliabilityBadge } from '@/lib/fact-checker'
import { mockNews } from '@/lib/mock-data'
import Link from 'next/link'

interface SignalCardProps {
  news: NewsItem
  featured?: boolean
  compact?: boolean
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const minutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60))
  
  if (minutes < 5) return 'à l\'instant'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

function isNew(date: string): boolean {
  const now = new Date()
  const then = new Date(date)
  return (now.getTime() - then.getTime()) < 30 * 60 * 1000 // 30 min
}

function isHot(date: string): boolean {
  const now = new Date()
  const then = new Date(date)
  return (now.getTime() - then.getTime()) < 2 * 60 * 60 * 1000 // 2 hours
}

const categoryConfig: Record<string, { icon: string; color: string; bg: string }> = {
  release: { icon: '🚀', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  research: { icon: '🔬', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  benchmark: { icon: '📊', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  industry: { icon: '🏢', color: 'text-amber', bg: 'bg-amber/10 border-amber/20' },
  pricing: { icon: '💰', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  security: { icon: '🔒', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  community: { icon: '👥', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
}

const verificationConfig = {
  confirmed: { label: 'Confirmé', icon: '✓', color: 'text-success bg-success/10 border-success/20' },
  watch: { label: 'À surveiller', icon: '⚑', color: 'text-amber bg-amber/10 border-amber/20' },
  unverified: { label: 'À vérifier', icon: '?', color: 'text-text-muted bg-white/5 border-white/10' },
  contradicted: { label: 'Contradiction', icon: '⚠', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

export function SignalCard({ news, featured = false, compact = false }: SignalCardProps) {
  const intelligence = enrichNews(news)
  const verification = verifyNewsItem(news, mockNews)
  const factCheck = factCheckNewsItem(news)
  const reliabilityBadge = getReliabilityBadge(news)
  const category = categoryConfig[news.category] || categoryConfig.industry

  if (compact) {
    return (
      <a 
        href={news.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm">
          {category.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-medium text-text transition-colors group-hover:text-primary">
            {news.title}
          </h4>
          <div className="mt-0.5 flex items-center gap-2 text-2xs text-text-faint">
            <span>{news.source}</span>
            <span>·</span>
            <span>{formatTimeAgo(news.published_at)}</span>
            <span>·</span>
            <span className={intelligence.severity === 'critical' ? 'text-red-400' : 'text-text-muted'}>
              Impact {intelligence.impact}
            </span>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-2xs ${verificationConfig[verification.status].color}`}>
          {verificationConfig[verification.status].icon}
        </span>
      </a>
    )
  }

  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6">
        {/* Background glow */}
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${category.bg} opacity-30 blur-3xl`}></div>
        
        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-2xs font-medium uppercase tracking-wider ${category.bg} ${category.color}`}>
              {category.icon} {news.category}
            </span>
            
            {isNew(news.published_at) && (
              <span className="animate-pulse rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-medium text-primary">
                NOUVEAU
              </span>
            )}
            
            {news.is_breaking && (
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-2xs font-medium text-red-400">
                🔴 FLASH
              </span>
            )}
            
            <span className="ml-auto flex items-center gap-1 text-2xs text-text-faint">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTimeAgo(news.published_at)}
            </span>
          </div>

          {/* Title */}
          <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-text transition-colors hover:text-primary">
            <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {news.title}
            </a>
          </h2>

          {/* Summary */}
          <p className="mb-4 text-sm leading-relaxed text-text-muted line-clamp-3">
            {news.summary}
          </p>

          {/* Intelligence Panel */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-2xs font-medium ${verificationConfig[verification.status].color}`}>
                {verificationConfig[verification.status].icon} {verificationConfig[verification.status].label}
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-2xs font-medium ${reliabilityBadge.color}`} title={reliabilityBadge.tooltip}>
                {reliabilityBadge.icon} {reliabilityBadge.text}
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-2xs text-text-muted">
                Confiance {intelligence.confidence}/100
              </span>
              <span className={`rounded-full px-2.5 py-1 text-2xs font-medium ${
                intelligence.impact >= 80 ? 'bg-red-500/10 text-red-400' :
                intelligence.impact >= 60 ? 'bg-amber/10 text-amber' :
                'bg-white/5 text-text-muted'
              }`}>
                Impact {intelligence.impact}/100
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">→</span>
                <p className="text-text-muted">{intelligence.whyItMatters}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <p className="text-text-faint">{intelligence.action}</p>
              </div>
            </div>
            
            {/* Fact-checking transparency */}
            {factCheck.issues.length > 0 && (
              <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-2">
                <p className="mb-1 text-2xs uppercase tracking-wider text-text-faint">Vérification</p>
                <ul className="space-y-1">
                  {factCheck.issues.slice(0, 2).map((issue, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-2xs text-amber">
                      <span>⚠</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-muted">{news.source}</span>
              <div className="flex gap-1">
                {news.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-2xs text-text-faint">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link 
                href={`/compare?model=${encodeURIComponent(news.title.slice(0, 30))}`}
                className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                Comparer
              </Link>
              <a 
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-white/10"
              >
                Source →
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard card
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]">
      {/* Subtle hover glow */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${category.bg} opacity-0 blur-2xl transition-opacity group-hover:opacity-50`}></div>
      
      <div className="relative">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${category.bg}`}>
            {category.icon}
          </span>
          
          <span className="text-2xs font-medium uppercase tracking-wider text-text-faint">
            {news.source}
          </span>
          
          <span className="ml-auto flex items-center gap-1 text-2xs text-text-faint">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTimeAgo(news.published_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-sm font-semibold leading-snug text-text transition-colors group-hover:text-primary line-clamp-2">
          <a href={news.url} target="_blank" rel="noopener noreferrer">
            {news.title}
          </a>
        </h3>

        {/* Summary */}
        <p className="mb-3 text-xs leading-relaxed text-text-muted line-clamp-2">
          {news.summary}
        </p>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-2xs ${verificationConfig[verification.status].color}`}>
            {verificationConfig[verification.status].icon}
          </span>
          
          {isHot(news.published_at) && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-2xs text-red-400">
              🔥 Hot
            </span>
          )}
          
          {news.hype_score > 70 && (
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-2xs text-amber">
              ⚡ {news.hype_score}
            </span>
          )}
          
          <span className={`ml-auto rounded-full px-2 py-0.5 text-2xs font-mono ${
            intelligence.impact >= 70 ? 'text-primary' : 'text-text-faint'
          }`}>
            {intelligence.impact} IMP
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {news.tags.slice(0, 2).map(tag => (
            <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-2xs text-text-faint">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
