import type { Metadata } from 'next'
import './globals.css'
import { NavHeader } from '@/components/NavHeader'

const BASE_URL = 'https://ai-hub-cnb3.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AI Hub — Veille IA en temps réel',
    template: '%s | AI Hub',
  },
  description: 'Classements, benchmarks, alertes et feed RSS des modèles IA. GPT-4o, Claude, Gemini, Llama — suivez la course à l\'IA en direct.',
  keywords: ['intelligence artificielle', 'LLM', 'GPT', 'Claude', 'Gemini', 'benchmark', 'classement IA', 'veille IA'],
  authors: [{ name: 'AI Hub' }],
  creator: 'AI Hub',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'AI Hub',
    title: 'AI Hub — Veille IA en temps réel',
    description: 'Classements, benchmarks, alertes et feed RSS des modèles IA. Suivez la course à l\'IA.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'AI Hub — Veille IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Hub — Veille IA en temps réel',
    description: 'Classements, benchmarks, alertes et feed RSS des modèles IA.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: BASE_URL },
}

export const revalidate = 60

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let tickerItems: { source: string; title: string }[] = []
  try {
    const { getLiveNews } = await import('@/lib/feed')
    const news = await getLiveNews(3)
    tickerItems = news.slice(0, 12).map(n => ({ source: n.source, title: n.title }))
  } catch {}

  if (tickerItems.length === 0) {
    tickerItems = [
      { source: 'OpenAI',    title: 'GPT-4o : nouveau record Arena ELO — 1310' },
      { source: 'Anthropic', title: 'Claude 4 disponible en API — contexte 200k' },
      { source: 'Google',    title: 'Gemini 2.5 Flash — prix réduit de 50%' },
      { source: 'Meta',      title: 'Llama 4 Scout — 17B actifs, open-source' },
      { source: 'DeepSeek',  title: 'DeepSeek-V3 — 10x moins cher que GPT-4o' },
      { source: 'LMSYS',     title: 'Arena ELO mis à jour — classement mai 2025' },
    ]
  }

  const doubled = [...tickerItems, ...tickerItems]

  return (
    <html lang="fr">
      <body className="antialiased bg-bg text-text min-h-screen">
        <NavHeader />

        {children}

        {/* ── Ticker live ── */}
        <footer className="ticker-bar fixed bottom-0 left-0 right-0 z-50 flex h-7 items-center overflow-hidden border-t border-border bg-bg">
          <span className="flex h-full shrink-0 items-center border-r border-border px-3 text-2xs font-semibold uppercase tracking-widest text-text-3">
            Live
          </span>
          <div className="ticker-container flex-1">
            <div className="ticker-content gap-10 px-6 text-xs text-text-3">
              {doubled.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="text-border-2">·</span>
                  <strong className="font-medium text-text-2">{item.source}</strong>
                  <span>— {item.title}</span>
                </span>
              ))}
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
