'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { mockModels, mockNews } from '@/lib/mock-data'

const navItems = [
  { href: '/',            label: 'Dashboard' },
  { href: '/news',        label: 'Feed IA' },
  { href: '/leaderboard', label: 'Classement' },
  { href: '/benchmarks',  label: 'Benchmarks' },
  { href: '/compare',     label: 'Comparer' },
  { href: '/alerts',      label: 'Alertes' },
]

type Result = { type: 'model' | 'news' | 'page'; label: string; sub: string; href: string }

const pageIndex: Result[] = [
  { type: 'page', label: 'Dashboard',         sub: 'Vue d\'ensemble',              href: '/' },
  { type: 'page', label: 'Feed IA',            sub: 'Actualités en temps réel',     href: '/news' },
  { type: 'page', label: 'Classement',         sub: 'Ranking des modèles IA',       href: '/leaderboard' },
  { type: 'page', label: 'Benchmarks',         sub: 'Comparaison multi-métriques',  href: '/benchmarks' },
  { type: 'page', label: 'Comparer',           sub: 'Decision engine',              href: '/compare' },
  { type: 'page', label: 'Alertes',            sub: 'Surveillance & watchlist',     href: '/alerts' },
  { type: 'page', label: 'Briefing',           sub: 'Synthèse quotidienne',         href: '/briefing' },
  { type: 'page', label: 'Calculateur coûts',  sub: 'Estimation budget API',        href: '/cost-calculator' },
  { type: 'page', label: 'Timeline',           sub: 'Historique des sorties',       href: '/timeline' },
  { type: 'page', label: 'Glossaire',          sub: 'Définitions IA',               href: '/glossary' },
]

export function NavHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const results: Result[] = query.trim().length < 2 ? [] : [
    ...mockModels
      .filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.provider.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(m => ({ type: 'model' as const, label: m.name, sub: m.provider, href: `/leaderboard` })),
    ...mockNews
      .filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(n => ({ type: 'news' as const, label: n.title, sub: n.source, href: n.url })),
    ...pageIndex
      .filter(p => p.label.toLowerCase().includes(query.toLowerCase()) || p.sub.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3),
  ]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSelect(r: Result) {
    setOpen(false)
    setQuery('')
    if (r.type === 'news') window.open(r.href, '_blank')
    else router.push(r.href)
  }

  return (
    <header className="sticky top-0 z-40 h-12 border-b border-border bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1440px] items-center px-6 gap-4">
        <Link href="/" className="mr-4 text-sm font-bold tracking-tight text-text shrink-0">
          AI Hub
        </Link>

        <nav className="flex items-center">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-12 items-center border-b-2 px-3 text-xs font-medium transition-colors
                  ${isActive
                    ? 'border-text text-text'
                    : 'border-transparent text-text-2 hover:text-text'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Search */}
        <div ref={containerRef} className="relative ml-auto">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-1.5 w-48 focus-within:border-text-3 transition-colors">
            <svg className="h-3 w-3 text-text-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder="Rechercher…"
              className="flex-1 bg-transparent text-xs text-text placeholder:text-text-3 outline-none min-w-0"
            />
            <kbd className="hidden sm:inline-flex text-2xs text-text-3 font-mono bg-surface px-1 rounded">⌘K</kbd>
          </div>

          {open && results.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-border bg-surface shadow-xl overflow-hidden z-50">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-2 transition-colors"
                >
                  <span className={`text-2xs px-1.5 py-0.5 rounded shrink-0 ${
                    r.type === 'model' ? 'bg-primary/10 text-primary' :
                    r.type === 'news'  ? 'bg-amber/10 text-amber' :
                    'bg-surface-3 text-text-2'
                  }`}>
                    {r.type === 'model' ? 'modèle' : r.type === 'news' ? 'actu' : 'page'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-text truncate">{r.label}</div>
                    <div className="text-2xs text-text-2 truncate">{r.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
          <span className="text-xs text-text-2 tracking-wide">Live</span>
        </div>
      </div>
    </header>
  )
}
