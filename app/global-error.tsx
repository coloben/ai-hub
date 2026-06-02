'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: '#0a0a0f', color: 'rgba(255,255,255,0.88)', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 400, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>AI Hub — erreur critique</h1>
            <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
              Une erreur inattendue s&apos;est produite. Réessayez ou revenez à l&apos;accueil.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#e8b86d', color: '#0a0a0f', cursor: 'pointer', fontWeight: 600 }}
              >
                Réessayer
              </button>
              <Link href="/" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', textDecoration: 'none' }}>
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
