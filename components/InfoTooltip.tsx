'use client'

import { useState, useRef, useEffect } from 'react'
import { getGlossaryTerm, GlossaryEntry } from '@/lib/glossary'

interface InfoTooltipProps {
  term: string
  size?: 'sm' | 'md'
}

export function InfoTooltip({ term, size = 'sm' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const ref = useRef<HTMLDivElement>(null)
  const entry: GlossaryEntry | undefined = getGlossaryTerm(term)

  useEffect(() => {
    if (!isOpen || !ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    
    setPosition(spaceBelow < 300 && spaceAbove > spaceBelow ? 'top' : 'bottom')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!entry) return null

  const sizeClass = size === 'sm' ? 'w-4 h-4 text-2xs' : 'w-5 h-5 text-xs'

  return (
    <div className="inline-flex items-center" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        onMouseEnter={() => setIsOpen(true)}
        className={`${sizeClass} inline-flex items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-primary hover:bg-primary-dim transition-colors border border-border font-mono`}
        aria-label={`Qu'est-ce que ${term} ?`}
      >
        ?
      </button>
      
      {isOpen && (
        <div 
          className={`absolute z-[200] w-[320px] bg-surface-2 border border-border rounded-lg shadow-xl p-4 ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary">{entry.term}</span>
            <span className={`px-1.5 py-0.5 rounded text-2xs font-medium uppercase ${
              entry.category === 'model' ? 'bg-primary-dim text-primary' :
              entry.category === 'benchmark' ? 'bg-success-dim text-success' :
              entry.category === 'technique' ? 'bg-amber-dim text-amber' :
              entry.category === 'metric' ? 'bg-[#6366f1]/20 text-[#6366f1]' :
              'bg-surface text-text-muted'
            }`}>
              {entry.category === 'model' ? 'Modèle' :
               entry.category === 'benchmark' ? 'Benchmark' :
               entry.category === 'technique' ? 'Technique' :
               entry.category === 'metric' ? 'Métrique' : 'Concept'}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-1 font-medium">
            {entry.short}
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            {entry.definition}
          </p>
          {entry.example && (
            <div className="mt-2 pt-2 border-t border-divider">
              <p className="text-2xs text-text-faint italic">
                💡 {entry.example}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
