'use client'

import { useState } from 'react'
import { glossary, searchGlossary } from '@/lib/glossary'
import { Search } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  model:     'Modèle',
  benchmark: 'Benchmark',
  technique: 'Technique',
  metric:    'Métrique',
  concept:   'Concept',
}

const categoryAccent: Record<string, string> = {
  model:     'text-data border-data/30 bg-data/10',
  benchmark: 'text-up border-up/30 bg-up/10',
  technique: 'text-warn border-warn/30 bg-warn/10',
  metric:    'text-[#818cf8] border-[#818cf8]/30 bg-[#818cf8]/10',
  concept:   'text-white/50 border-white/[0.10] bg-white/[0.04]',
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
    <div className="max-w-4xl mx-auto px-5 py-6 pb-16">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight text-white mb-1">Glossaire IA</h1>
        <p className="text-[13px] text-white/40">
          {glossary.length} termes — des bases aux concepts avancés.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un terme…"
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/[0.20] focus:bg-white/[0.05] transition-all"
        />
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6">
        <button
          onClick={() => { setActiveCategory(null); setQuery('') }}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
            !activeCategory ? 'bg-white text-black' : 'text-white/45 hover:text-white/70 hover:bg-white/[0.06]'
          }`}
        >
          Tout ({glossary.length})
        </button>
        {categories.map(cat => {
          const count = glossary.filter(g => g.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setQuery('') }}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                activeCategory === cat ? 'bg-white text-black' : 'text-white/45 hover:text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              {categoryLabels[cat]} ({count})
            </button>
          )
        })}
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[14px] text-white/30">Aucun résultat pour <span className="text-white/50">"{query}"</span></p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <div
              key={entry.term}
              className="border border-white/[0.07] rounded-lg p-5 hover:border-white/[0.13] hover:bg-white/[0.02] transition-all"
            >
              <div className="flex items-start gap-3 mb-2">
                <h3 className="text-[15px] font-semibold text-white flex-1">{entry.term}</h3>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${categoryAccent[entry.category] ?? 'text-white/40 border-white/10 bg-white/[0.04]'} shrink-0`}>
                  {categoryLabels[entry.category] ?? entry.category}
                </span>
              </div>
              <p className="text-[13px] font-medium text-white/70 mb-1.5">{entry.short}</p>
              <p className="text-[12px] text-white/40 leading-relaxed">{entry.definition}</p>
              {entry.example && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <p className="text-[11px] text-white/30 italic">💡 {entry.example}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
