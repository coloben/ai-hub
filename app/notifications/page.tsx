'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  url: string | null
  is_read: boolean
  created_at: string
}

function timeAgo(date: string): string {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (m < 2) return 'à l\'instant'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

const TYPE_ICON: Record<string, string> = {
  comment: '💬', vote: '⬆️', mention: '@', alert: '🔔',
  new_model: '🚀', achievement: '🏆',
}
const TYPE_LABEL: Record<string, string> = {
  comment: 'Commentaire', vote: 'Vote', mention: 'Mention', alert: 'Alerte',
  new_model: 'Nouveau modèle', achievement: 'Succès',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => {
        if (r.status === 401) { setLoggedIn(false); setLoading(false); return null }
        setLoggedIn(true)
        return r.json()
      })
      .then(d => {
        if (d) setNotifications(d.notifications ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function markAll() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markOne(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  if (loggedIn === false) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔔</p>
          <h2 className="text-xl font-bold text-text mb-2">Notifications</h2>
          <p className="text-sm text-text-2 mb-6">Connectez-vous pour voir vos notifications.</p>
          <Link href="/login?redirect=/notifications"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  const displayed = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-16 md:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-text-3 mt-0.5">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} className="text-xs text-primary hover:underline">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === f
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border text-text-3 hover:text-text-2'
            }`}
          >
            {f === 'all' ? 'Toutes' : `Non lues${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="text-4xl mb-3">🔕</p>
          <p className="text-sm font-semibold text-text">
            {filter === 'unread' ? 'Tout est lu ✓' : 'Aucune notification'}
          </p>
          <p className="text-xs text-text-3 mt-1">Les notifications apparaîtront ici</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Groupe par date */}
          {displayed.map(n => (
            <div
              key={n.id}
              onClick={() => { markOne(n.id); if (n.url) window.location.href = n.url }}
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all hover:border-border-2 ${
                !n.is_read
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-border bg-surface'
              }`}
            >
              {/* Icon */}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-lg">
                {TYPE_ICON[n.type] ?? '●'}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold leading-snug ${n.is_read ? 'text-text-2' : 'text-text'}`}>
                    {n.title}
                  </p>
                  <span className="shrink-0 text-2xs text-text-3">{timeAgo(n.created_at)}</span>
                </div>
                {n.body && <p className="mt-0.5 text-xs text-text-3 line-clamp-2">{n.body}</p>}
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded bg-surface-2 border border-border/50 px-1.5 py-0.5 text-2xs text-text-3">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                  {n.url && (
                    <span className="text-2xs text-primary">Voir →</span>
                  )}
                </div>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
