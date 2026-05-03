import { Suspense } from 'react'
import type { Metadata } from 'next'
import CompareClient from './CompareClient'

export const metadata: Metadata = {
  title: 'Comparer les modèles IA',
  description: 'Decision engine et comparateur manuel — choisissez le meilleur LLM selon votre cas d\'usage.',
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-2 text-sm">Chargement…</div>
      </div>
    }>
      <CompareClient />
    </Suspense>
  )
}
