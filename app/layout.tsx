import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

const BASE_URL = 'https://ai-hub-cnb3.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AI Hub — Veille IA',
    template: '%s | AI Hub',
  },
  description: 'Veille intelligence artificielle en temps réel. News, classements, benchmarks, comparateur de modèles.',
  keywords: ['IA','intelligence artificielle','LLM','GPT','Claude','Gemini','benchmark','classement IA'],
  authors: [{ name: 'AI Hub' }],
  creator: 'AI Hub',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'AI Hub',
    title: 'AI Hub — Veille IA',
    description: 'News, classements, benchmarks, comparateur de modèles IA.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'AI Hub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Hub',
    description: 'La communauté IA francophone.',
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
    ]
  }

  const doubled = [...tickerItems, ...tickerItems]

  return (
    <html lang="fr">
      <body className="antialiased bg-black text-white min-h-screen">
        <Sidebar />

        {/* Main — full width minus rail. Mobile: full width minus bottom bar */}
        <main className="md:ml-14 min-h-screen pb-14 md:pb-8">
          {children}
        </main>

        {/* Ticker — desktop only, above content */}
        <footer className="hidden md:flex fixed bottom-0 left-14 right-0 z-30 h-8 items-center overflow-hidden border-t border-white/10 bg-black">
          <div className="flex h-full shrink-0 items-center border-r border-white/10 px-3 gap-2">
            <span className="live-dot" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Live</span>
          </div>
          <div className="ticker-container flex-1">
            <div className="ticker-content gap-10 px-4 text-xs text-white/50">
              {doubled.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="text-white/30">·</span>
                  <strong className="font-medium text-white/70">{item.source}</strong>
                  <span className="text-white/40">— {item.title}</span>
                </span>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
