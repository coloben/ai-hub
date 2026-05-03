'use client'

import { useState, useMemo } from 'react'
import { mockNews } from '@/lib/mock-data'
import { SignalCard } from '@/components/SignalCard'
import { InfoTooltip } from '@/components/InfoTooltip'

type TimeFilter = '1h' | '24h' | '7d' | 'all'
type CategoryFilter = 'all' | 'release' | 'research' | 'benchmark' | 'industry' | 'pricing' | 'security'

const timeFilters: { id: TimeFilter; label: string; icon: string }[] = [
  { id: '1h', label: '1h', icon: '⚡' },
  { id: '24h', label: '24h', icon: '📅' },
  { id: '7d', label: '7j', icon: '📊' },
  { id: 'all', label: 'Tout', icon: '∞' },
]

const categoryFilters: { id: CategoryFilter; label: string; color: string }[] = [
  { id: 'all', label: 'Tous', color: 'bg-white/10' },
  { id: 'release', label: 'Releases', color: 'bg-primary/20' },
  { id: 'research', label: 'Recherche', color: 'bg-cyan-500/20' },
  { id: 'benchmark', label: 'Benchmarks', color: 'bg-success/20' },
  { id: 'industry', label: 'Industrie', color: 'bg-amber/20' },
  { id: 'pricing', label: 'Prix', color: 'bg-emerald-500/20' },
  { id: 'security', label: 'Sécurité', color: 'bg-red-500/20' },
]

export default function LivePage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sortBy, setSortBy] = useState<'time' | 'impact' | 'confidence'>('time')

  const filteredNews = useMemo(() => {
    let filtered = [...mockNews]

    // Time filter
    const now = new Date()
    if (timeFilter !== 'all') {
      const hours = timeFilter === '1h' ? 1 : timeFilter === '24h' ? 24 : 24 * 7
      const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000)
      filtered = filtered.filter(n => new Date(n.published_at) >= cutoff)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(n => n.category === categoryFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      }
      // For impact and confidence, we'd need to enrich (mocked here)
      if (sortBy === 'impact') {
        return (b.hype_score || 0) - (a.hype_score || 0)
      }
      return 0
    })

    return filtered
  }, [timeFilter, categoryFilter, sortBy])

  const breakingNews = filteredNews.filter(n => n.is_breaking).slice(0, 3)
  const regularNews = filteredNews.filter(n => !n.is_breaking)

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      {/* Background effects */}
      <span className="mesh-orb right-[5%] top-[5%] h-72 w-72 bg-primary/20"></span>
      <span className="mesh-orb left-[10%] top-[20%] h-64 w-64 bg-cyan-500/10"></span>
      <span className="mesh-orb right-[20%] top-[40%] h-56 w-56 bg-success/10"></span>

      <div className="relative px-6 py-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-success">Live Feed</span>
            </div>
            
            <h1 className="text-3xl font-semibold tracking-tight text-text mb-2">
              Signaux IA en temps réel
            </h1>
            <p className="text-text-muted max-w-2xl">
              Surveillance continue des sources officielles, benchmarks et communautés. 
              Mis à jour toutes les 15 minutes pour les sources critiques.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Sources actives', value: '15+', color: 'text-success' },
              { label: 'Dernier signal', value: '< 15min', color: 'text-primary' },
              { label: 'Signaux 24h', value: filteredNews.length.toString(), color: 'text-amber' },
              { label: 'Confiance moyenne', value: '94%', color: 'text-cyan-400' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-2xs uppercase tracking-wider text-text-faint mb-1">{stat.label}</div>
                <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3">
            {/* Time filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-faint mr-2">Temps:</span>
              {timeFilters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setTimeFilter(f.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    timeFilter === f.id
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text border border-transparent'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-faint mr-2">Catégorie:</span>
              {categoryFilters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    categoryFilter === f.id
                      ? `${f.color} text-text border border-white/20`
                      : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text border border-transparent'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-faint">Trier par:</span>
              {[
                { id: 'time', label: 'Date' },
                { id: 'impact', label: 'Impact' },
                { id: 'confidence', label: 'Confiance' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`text-xs transition-colors ${
                    sortBy === s.id ? 'text-primary font-medium' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <InfoTooltip term="Classement intelligent" />
            </div>
          </div>

          {/* Breaking News Section */}
          {breakingNews.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                <h2 className="text-sm font-medium uppercase tracking-wider text-red-400">Breaking News</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {breakingNews.map(news => (
                  <SignalCard key={news.id} news={news} featured />
                ))}
              </div>
            </div>
          )}

          {/* Main Feed */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-text-muted">
                Tous les signaux ({regularNews.length})
              </h2>
              <span className="text-2xs text-text-faint">
                Mise à jour automatique
              </span>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {regularNews.map(news => (
                <SignalCard key={news.id} news={news} />
              ))}
            </div>

            {regularNews.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-white/5 p-4">
                  <svg className="h-8 w-8 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-text-muted">Aucun signal pour ces filtres</p>
                <button 
                  onClick={() => { setTimeFilter('all'); setCategoryFilter('all') }}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
