'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { mockModels, mockNews } from '@/lib/mock-data'
import { AuthButton } from '@/components/AuthButton'
import { NotificationBell } from '@/components/NotificationBell'

const navItems = [
  { href: '/',            label: 'Dashboard' },
  { href: '/feed',        label: 'Mon Feed' },
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
    <>
      <header className="sticky top-0 z-40 h-12 border-b border-white/[0.07] bg-[#07070f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1440px] items-center px-4 md:px-6 gap-3">

          {/* Logo */}
          <Link href="/" className="shrink-0 text-sm font-bold tracking-tight">
            <span className="text-gradient">AI</span>
            <span className="text-text"> Hub</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center flex-1 min-w-0">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-12 items-center px-3 text-xs font-medium transition-colors duration-150 whitespace-nowrap
                    ${isActive ? 'text-text' : 'text-text-2 hover:text-text'}`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-primary to-violet" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Droite : search + live + notif + auth */}
          <div className="ml-auto flex items-center gap-2 shrink-0">

            {/* Search desktop */}
            <div ref={containerRef} className="relative hidden sm:block">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 w-40 lg:w-44 focus-within:border-primary/30 focus-within:bg-white/[0.06] transition-all duration-150">
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
                <kbd className="hidden lg:inline-flex text-2xs text-text-3 font-mono bg-surface px-1 rounded">⌘K</kbd>
              </div>
              {open && results.length > 0 && (
                <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-white/[0.08] bg-[#0d0d1a]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                  {results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(r)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors duration-100"
                    >
                      <span className={`text-2xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
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

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
              <span className="text-xs text-text-2">Live</span>
            </div>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Auth — toujours visible */}
            <AuthButton />

          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden flex flex-col justify-center gap-1.5 p-2 text-text-2 hover:text-text transition-colors"
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-current transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-12 z-30 bg-[#07070f]/97 backdrop-blur-xl md:hidden animate-fade-in">
          <nav className="flex flex-col px-4 pt-4 pb-8 gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-text border-l-2 border-primary'
                      : 'text-text-2 hover:bg-white/[0.05] hover:text-text border-l-2 border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="mt-4 px-4">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
                <svg className="h-3.5 w-3.5 text-text-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher modèles, actus…"
                  className="flex-1 bg-transparent text-sm text-text placeholder:text-text-3 outline-none"
                />
              </div>
              {query.trim().length >= 2 && results.length > 0 && (
                <div className="mt-2 rounded-lg border border-border bg-surface overflow-hidden">
                  {results.map((r, i) => (
                    <button key={i} onClick={() => handleSelect(r)} className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-surface-2 transition-colors">
                      <span className={`text-2xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                        r.type === 'model' ? 'bg-primary/10 text-primary' :
                        r.type === 'news'  ? 'bg-amber/10 text-amber' :
                        'bg-surface-3 text-text-2'
                      }`}>{r.type === 'model' ? 'modèle' : r.type === 'news' ? 'actu' : 'page'}</span>
                      <div className="min-w-0">
                        <div className="text-sm text-text truncate">{r.label}</div>
                        <div className="text-xs text-text-2 truncate">{r.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 px-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success live-pulse" />
              <span className="text-xs text-text-2">Live — données en temps réel</span>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
