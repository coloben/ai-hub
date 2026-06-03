'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import Fuse from 'fuse.js'

interface ModelHit {
  id: string
  name: string
  organization: string
  elo: number
}

export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [models, setModels] = useState<ModelHit[]>([])
  const [hits, setHits] = useState<ModelHit[]>([])
  const fuseRef = useRef<Fuse<ModelHit> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/v1/models')
      .then((r) => r.json())
      .then((d) => {
        const data: ModelHit[] = (d.data ?? []).map((m: ModelHit) => m)
        setModels(data)
        fuseRef.current = new Fuse(data, {
          keys: ['name', 'organization', 'id'],
          threshold: 0.35,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!q.trim()) {
      setHits([])
      return
    }
    const fuse = fuseRef.current
    if (!fuse) return
    setHits(fuse.search(q, { limit: 6 }).map((r) => r.item))
  }, [q])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setOpen(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    if (e.key === 'Escape') setOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-border/80 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border text-xs min-w-[140px]"
        aria-label="Rechercher un modèle"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Search size={13} aria-hidden />
        <span>Rechercher…</span>
        <kbd className="ml-auto text-[9px] opacity-50 font-mono hidden md:inline">⌘K</kbd>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Fermer la recherche"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-1 z-50 w-72 rounded-lg border border-border bg-card shadow-xl p-2"
            role="listbox"
            aria-label="Résultats de recherche"
          >
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Modèle ou organisation…"
              className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground"
              aria-label="Terme de recherche"
            />
            <ul className="mt-2 max-h-48 overflow-y-auto">
              {hits.length === 0 && q.trim() && (
                <li className="px-2 py-2 text-xs text-muted-foreground">Aucun modèle</li>
              )}
              {hits.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/model/${m.id}`}
                    className="block px-2 py-1.5 rounded hover:bg-muted text-sm"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-medium text-foreground">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ELO {m.elo}
                    </span>
                  </Link>
                </li>
              ))}
              {!q.trim() && models.length > 0 && (
                <li className="px-2 py-1 text-[10px] text-muted-foreground">
                  {models.length} modèles indexés
                </li>
              )}
            </ul>
            <Link
              href={`/search?q=${encodeURIComponent(q)}`}
              className="block mt-1 text-center text-[11px] text-accent hover:underline py-1"
              onClick={() => setOpen(false)}
            >
              Recherche avancée →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
