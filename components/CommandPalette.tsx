'use client'

import { useState, useEffect, useCallback } from 'react'
import { mockNews, mockModels } from '@/lib/mock-data'

interface SearchResult {
  type: 'news' | 'model'
  id: string
  title: string
  excerpt: string
  url?: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const q = searchQuery.toLowerCase()
    const newsResults = mockNews
      .filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.summary.toLowerCase().includes(q)
      )
      .map(n => ({
        type: 'news' as const,
        id: n.id,
        title: n.title,
        excerpt: n.summary.slice(0, 100) + '...',
        url: n.url,
      }))
      .slice(0, 5)

    const modelResults = mockModels
      .filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.provider.toLowerCase().includes(q)
      )
      .map(m => ({
        type: 'model' as const,
        id: m.id,
        title: m.name,
        excerpt: `${m.provider} • ${m.type} • ELO: ${m.scores.arena_elo || '—'}`,
        url: m.changelog_url,
      }))
      .slice(0, 3)

    setResults([...newsResults, ...modelResults])
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query)
    }, 150)
    return () => clearTimeout(timeout)
  }, [query, performSearch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const result = results[selectedIndex]
      if (result.url) {
        window.open(result.url, '_blank')
      }
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  const newsCount = results.filter(r => r.type === 'news').length
  const modelCount = results.filter(r => r.type === 'model').length

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-2xl mx-4 bg-surface-2 rounded-lg shadow-md border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-divider">
          <span className="text-text-muted">⌘</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher actualités, modèles, sujets..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-faint outline-none"
            autoFocus
          />
          <span className="text-2xs font-mono text-text-faint px-1.5 py-0.5 bg-surface rounded">
            ESC
          </span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-text-muted mb-2">
                {query ? 'Aucun résultat' : 'Commencez à taper pour rechercher'}
              </p>
              {query && (
                <p className="text-2xs text-text-faint">
                  Essayez : GPT-5, Claude, Llama, Gemini, ou des sujets spécifiques
                </p>
              )}
            </div>
          ) : (
            <>
              {newsCount > 0 && (
                <div className="px-3 py-2 bg-surface text-2xs font-medium text-text-muted uppercase tracking-wider">
                  Actualités ({newsCount})
                </div>
              )}
              {results.filter(r => r.type === 'news').map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    if (result.url) window.open(result.url, '_blank')
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedIndex === index 
                      ? 'bg-primary-dim' 
                      : 'hover:bg-surface-offset'
                  }`}
                >
                  <div className="text-sm text-text mb-1">{result.title}</div>
                  <div className="text-2xs text-text-muted">{result.excerpt}</div>
                </button>
              ))}
              
              {modelCount > 0 && (
                <div className="px-3 py-2 bg-surface text-2xs font-medium text-text-muted uppercase tracking-wider">
                  Modèles ({modelCount})
                </div>
              )}
              {results.filter(r => r.type === 'model').map((result, index) => {
                const actualIndex = results.filter(r => r.type === 'news').length + index
                return (
                  <button
                    key={result.id}
                    onClick={() => {
                      if (result.url) window.open(result.url, '_blank')
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      selectedIndex === actualIndex 
                        ? 'bg-primary-dim' 
                        : 'hover:bg-surface-offset'
                    }`}
                  >
                    <div className="text-sm text-text mb-1">{result.title}</div>
                    <div className="text-2xs text-text-muted">{result.excerpt}</div>
                  </button>
                )
              })}
            </>
          )}
        </div>

        <div className="px-4 py-2 bg-surface border-t border-divider flex items-center gap-4 text-2xs text-text-faint">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>esc fermer</span>
        </div>
      </div>
    </div>
  )
}
