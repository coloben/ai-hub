'use client'

import { useState } from 'react'
import { glossary, searchGlossary, GlossaryEntry } from '@/lib/glossary'

const categoryLabels: Record<string, string> = {
  model: 'Modèle',
  benchmark: 'Benchmark',
  technique: 'Technique',
  metric: 'Métrique',
  concept: 'Concept',
}

const categoryColors: Record<string, string> = {
  model: 'bg-primary-dim text-primary',
  benchmark: 'bg-success-dim text-success',
  technique: 'bg-amber-dim text-amber',
  metric: 'bg-[#6366f1]/20 text-[#6366f1]',
  concept: 'bg-surface text-text-muted',
}

export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = query.trim()
    ? searchGlossary(query)
    : activeCategory
      ? glossary.filter(g => g.category === activeCategory)
      : glossary

  const categories = Array.from(new Set(glossary.map(g => g.category)))

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold mb-2">📖 Glossaire IA</h1>
        <p className="text-sm text-text-muted mb-6">
          Tout comprendre sur l&apos;intelligence artificielle — des termes de base aux concepts avancés. Chaque définition est écrite pour être accessible aux débutants tout en restant précise pour les pros.
        </p>

        {/* Recherche */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un terme..."
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-text placeholder:text-text-faint focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
          />
        </div>

        {/* Filtres catégorie */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveCategory(null); setQuery('') }}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${!activeCategory ? 'bg-primary-dim text-primary' : 'text-text-muted hover:text-text hover:bg-surface-2'}`}
          >
            Tout
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setQuery('') }}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${activeCategory === cat ? 'bg-primary-dim text-primary' : 'text-text-muted hover:text-text hover:bg-surface-2'}`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="space-y-4">
          {filtered.map((entry) => (
            <div key={entry.term} className="bg-surface-2 rounded-lg p-5 border border-border hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-primary">{entry.term}</h3>
                <span className={`px-2 py-0.5 rounded text-2xs font-medium uppercase ${categoryColors[entry.category]}`}>
                  {categoryLabels[entry.category] || entry.category}
                </span>
              </div>
              <p className="text-sm font-medium text-text mb-2">{entry.short}</p>
              <p className="text-sm text-text-muted leading-relaxed">{entry.definition}</p>
              {entry.example && (
                <div className="mt-3 pt-3 border-t border-divider">
                  <p className="text-xs text-text-faint italic">💡 {entry.example}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted">Aucun résultat pour &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
