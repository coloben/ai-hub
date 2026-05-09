'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { mockModels } from '@/lib/mock-data'
import { Search, X, Zap, Trophy, BarChart3, GitCompare } from 'lucide-react'

interface Result {
  type: 'model' | 'page'
  label: string
  sub?: string
  href: string
  icon?: string
}

const STATIC_PAGES: Result[] = [
  { type: 'page', label: 'Classement',          sub: 'Arena ELO',          href: '/leaderboard', icon: '🏆' },
  { type: 'page', label: 'Benchmarks',           sub: 'Comparaison scores', href: '/benchmarks',  icon: '📊' },
  { type: 'page', label: 'Comparer',             sub: '2 modèles côte à côte', href: '/compare',  icon: '⚖️' },
  { type: 'page', label: 'Briefing quotidien',   sub: 'Synthèse du jour',   href: '/briefing',    icon: '📋' },
  { type: 'page', label: 'Calculateur de coûts', sub: 'API pricing',        href: '/cost-calculator', icon: '🧮' },
  { type: 'page', label: 'Timeline',             sub: 'Historique sorties', href: '/timeline',    icon: '🗓️' },
  { type: 'page', label: 'Glossaire IA',         sub: 'Définitions',        href: '/glossary',    icon: '📖' },
  { type: 'page', label: 'Alertes',              sub: 'Surveillance modèles', href: '/alerts',    icon: '🔔' },
]

function search(query: string): Result[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()

  const models: Result[] = mockModels
    .filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map(m => ({
      type: 'model',
      label: m.name,
      sub: `${m.provider} · ELO ${m.scores.arena_elo ?? '—'}`,
      href: `/models/${m.id}`,
    }))

  const pages: Result[] = STATIC_PAGES.filter(p =>
    p.label.toLowerCase().includes(q) ||
    (p.sub ?? '').toLowerCase().includes(q)
  )

  return [...models, ...pages].slice(0, 8)
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [focused, setFocused] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    setResults(search(query))
    setFocused(0)
  }, [query])

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)) }
    if (e.key === 'Enter' && results[focused]) navigate(results[focused].href)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 h-8 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/35 hover:text-white/60 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all text-[12px]"
      >
        <Search size={13} />
        <span className="hidden sm:inline">Rechercher</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono opacity-50 ml-1">
          <span>⌘K</span>
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Search panel */}
          <div className="relative w-full max-w-lg rounded-xl border border-white/[0.10] shadow-2xl shadow-black/60 overflow-hidden" style={{ backgroundColor: '#111115' }}>
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
              <Search size={16} className="text-white/35 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Rechercher un modèle, une page…"
                className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60">
                  <X size={14} />
                </button>
              )}
              <kbd className="text-[10px] font-mono text-white/20 border border-white/[0.08] rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <div className="py-1.5 max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <button
                    key={r.href}
                    onClick={() => navigate(r.href)}
                    onMouseEnter={() => setFocused(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === focused ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: r.type === 'model' ? 'rgba(0,212,170,0.10)' : 'rgba(255,255,255,0.05)' }}>
                      {r.type === 'model' ? <Zap size={13} className="text-data" /> : <span className="text-[13px]">{r.icon}</span>}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white/85 truncate">{r.label}</p>
                      {r.sub && <p className="text-[11px] text-white/35 truncate">{r.sub}</p>}
                    </div>
                    <span className="ml-auto text-[10px] font-mono text-white/20 shrink-0">
                      {r.type === 'model' ? 'Modèle' : 'Page'}
                    </span>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-white/30">Aucun résultat pour <span className="text-white/50">"{query}"</span></p>
              </div>
            ) : (
              <div className="py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/20 px-4 mb-2">Accès rapide</p>
                {STATIC_PAGES.slice(0, 5).map((p, i) => (
                  <button
                    key={p.href}
                    onClick={() => navigate(p.href)}
                    onMouseEnter={() => setFocused(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === focused ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center text-[13px] shrink-0">{p.icon}</span>
                    <div>
                      <p className="text-[13px] font-medium text-white/70">{p.label}</p>
                      <p className="text-[11px] text-white/30">{p.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Footer hint */}
            <div className="flex items-center gap-3 px-4 py-2 border-t border-white/[0.06] text-[10px] text-white/20">
              <span><kbd className="font-mono">↑↓</kbd> naviguer</span>
              <span><kbd className="font-mono">↵</kbd> ouvrir</span>
              <span><kbd className="font-mono">ESC</kbd> fermer</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
