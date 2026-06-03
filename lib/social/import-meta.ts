export type ImportSource = 'arxiv' | 'huggingface' | 'fallback' | 'system'

export interface CuratedDisplayMeta {
  importSource: ImportSource
  viaLabel: string
  timePrefix: string
  discussLabel: string
}

const META: Record<ImportSource, Omit<CuratedDisplayMeta, 'importSource'>> = {
  arxiv: {
    viaLabel: 'via arXiv',
    timePrefix: 'Publié sur arXiv',
    discussLabel: 'Voir sur arXiv',
  },
  huggingface: {
    viaLabel: 'via Hugging Face',
    timePrefix: 'Publié sur Hugging Face',
    discussLabel: 'Voir sur Hugging Face',
  },
  fallback: {
    viaLabel: 'Mode secours',
    timePrefix: 'Synthèse Arena',
    discussLabel: 'Source',
  },
  system: {
    viaLabel: 'Système',
    timePrefix: 'Message',
    discussLabel: 'En savoir plus',
  },
}

export function handleToImportSource(handle: string): ImportSource {
  if (handle === 'arxiv') return 'arxiv'
  if (handle === 'huggingface') return 'huggingface'
  if (handle === 'system') return 'system'
  if (handle === 'arena_ai' || handle.endsWith('_fallback')) return 'fallback'
  return 'fallback'
}

export function getCuratedDisplayMeta(handle: string): CuratedDisplayMeta {
  const importSource = handleToImportSource(handle)
  return { importSource, ...META[importSource] }
}
