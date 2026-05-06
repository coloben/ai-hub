'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#0B0B0F] text-white px-4">
        <div className="text-center">
          <h1 className="mb-4 text-[96px] font-bold leading-none tracking-tighter text-white/[0.06]">500</h1>
          <p className="mb-2 text-lg font-semibold text-white/90">Erreur critique</p>
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
      </body>
    </html>
  )
}
