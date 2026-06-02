'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-display font-bold text-foreground">Erreur temporaire</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Le chargement a échoué. Les données Arena ou la base peuvent être momentanément indisponibles.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-muted-foreground">Réf. {error.digest}</p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()}>Réessayer</Button>
          <Button variant="outline" asChild>
            <Link href="/">Accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
