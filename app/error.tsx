'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-[64px] font-bold leading-none tracking-tighter text-white/[0.06]">Erreur</h1>
        <p className="mb-2 text-lg font-semibold text-white/90">Quelque chose s'est mal passé</p>
        <p className="mb-8 max-w-md text-sm text-white/40">
          {error.message || 'Une erreur inattendue est survenue.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
