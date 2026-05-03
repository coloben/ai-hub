'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NewsItemInteractive } from '@/components/NewsItemInteractive'
import { mockModels, mockNews } from '@/lib/mock-data'
import type { NewsItem } from '@/lib/types'

interface Profile {
  username: string
  interests: string[]
  followed_models: string[]
  karma: number
  level: string
}

const INTEREST_CATEGORIES: Record<string, string[]> = {
  code:      ['release', 'benchmark'],
  research:  ['research', 'benchmark'],
  industry:  ['industry', 'pricing'],
  pricing:   ['pricing', 'industry'],
  reasoning: ['research', 'benchmark', 'release'],
  vision:    ['release', 'research'],
}

export default function FeedClient() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'trending'>('for-you')

  useEffect(() => {
    // Charger le profil
    fetch('/api/me')
      .then(r => {
        if (r.status === 401) { setLoggedIn(false); setLoading(false); return null }
        setLoggedIn(true)
        return r.json()
      })
      .then(d => {
        if (d?.profile) setProfile(d.profile)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Charger les news
    fetch('/api/models')
      .then(() => {})
      .catch(() => {})

    setNews(mockNews)
  }, [])

  if (loggedIn === false) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="text-5xl mb-4">✨</p>
          <h2 className="text-2xl font-bold text-text mb-2">Feed personnalisé</h2>
          <p className="text-sm text-text-2 mb-6">
            Connectez-vous pour voir les news filtrées selon vos intérêts et modèles favoris.
          </p>
          <Link href="/login?redirect=/feed"
            className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Se connecter
          </Link>
          <div className="mt-6">
            <Link href="/news" className="text-sm text-primary hover:underline">
              Voir le feed public →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Filtres selon onglet
  const filteredNews = (() => {
    if (!profile) return news.slice(0, 20)

    if (activeTab === 'trending') {
      return [...news].sort((a, b) => b.hype_score - a.hype_score).slice(0, 20)
    }

    if (activeTab === 'following') {
      const followed = profile.followed_models
      return news.filter(n =>
        n.tags.some(tag => followed.some(m => {
          const model = mockModels.find(x => x.id === m)
          return model && (
            tag.toLowerCase().includes(model.name.toLowerCase().split(' ')[0].toLowerCase()) ||
            tag.toLowerCase().includes(model.provider.toLowerCase())
          )
        }))
      ).slice(0, 30)
    }

    // for-you : selon intérêts
    const intCategories = profile.interests.flatMap(i => INTEREST_CATEGORIES[i] ?? [])
    const scored = news.map(n => ({
      item: n,
      score: (intCategories.includes(n.category) ? 30 : 0) + n.hype_score,
    }))
    return scored.sort((a, b) => b.score - a.score).map(x => x.item).slice(0, 30)
  })()

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-16">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">
            {loading ? 'Mon Feed' : profile ? `Bonjour, @${profile.username}` : 'Mon Feed'}
          </h1>
          <p className="text-xs text-text-3 mt-0.5">Personnalisé selon vos intérêts</p>
        </div>
        <Link href="/settings" className="text-xs text-text-3 hover:text-text-2 transition-colors">
          Personnaliser →
        </Link>
      </div>

      {/* Karma card */}
      {profile && (
        <div className="mb-5 flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text">@{profile.username}</p>
            <p className="text-xs text-text-3">{profile.level} · {profile.karma} karma</p>
          </div>
          <div className="flex gap-3 text-center">
            <div>
              <p className="text-sm font-bold tabular-nums text-text">{profile.followed_models.length}</p>
              <p className="text-2xs text-text-3">suivis</p>
            </div>
            <div>
              <p className="text-sm font-bold tabular-nums text-text">{profile.interests.length}</p>
              <p className="text-2xs text-text-3">intérêts</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface p-1">
        {([
          { id: 'for-you',   label: '✨ Pour vous' },
          { id: 'following', label: '⭐ Suivis' },
          { id: 'trending',  label: '🔥 Trending' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary'
                : 'text-text-3 hover:text-text-2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modèles suivis (si onglet "following" vide) */}
      {activeTab === 'following' && filteredNews.length === 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-sm font-semibold text-text">Aucune news pour vos modèles suivis</p>
          <p className="text-xs text-text-3 mt-1">Suivez plus de modèles pour un feed enrichi</p>
          <Link href="/leaderboard" className="mt-3 inline-block text-xs text-primary hover:underline">
            Explorer les modèles →
          </Link>
        </div>
      )}

      {/* News */}
      {loading ? (
        <div className="flex flex-col gap-0">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border-b border-border py-4 px-2 animate-pulse">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-surface-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-surface-2" />
                  <div className="h-4 w-full rounded bg-surface-2" />
                  <div className="h-3 w-3/4 rounded bg-surface-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {filteredNews.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm font-semibold text-text">Aucune news correspondante</p>
              <p className="text-xs text-text-3 mt-1">
                <Link href="/onboarding" className="text-primary hover:underline">Modifiez vos intérêts</Link>
              </p>
            </div>
          ) : (
            filteredNews.map(item => (
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
            ))
          )}
        </div>
      )}
    </div>
  )
}
