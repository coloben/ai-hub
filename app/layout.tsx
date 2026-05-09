import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import UserNav from '@/components/auth/user-nav'
import { PageTitle } from '@/components/PageTitle'

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
    const news = await getLiveNews(8)
    tickerItems = news.slice(0, 12).map(n => ({ source: n.source, title: n.title }))
  } catch {}

  if (tickerItems.length === 0) {
    tickerItems = [
      { source: 'Hacker News', title: 'Recherche active sur les derniers modèles IA' },
      { source: 'Reddit',    title: 'Discussions en cours sur r/LocalLLaMA' },
      { source: 'Veille IA',  title: 'Le marché des LLM évolue rapidement' },
      { source: 'Benchmarks', title: 'Nouveaux scores Arena publiés cette semaine' },
      { source: 'Releases',   title: 'Plusieurs modèles open-source annoncés' },
      { source: 'Tarifs',     title: 'Guerre des prix sur les APIs IA' },
    ]
  }

  const doubled = [...tickerItems, ...tickerItems]

  return (
    <html lang="fr">
      <body className="antialiased text-white min-h-screen" style={{ backgroundColor: '#0B0B0F' }}>
        <Sidebar />

        {/* Main — full width minus rail. Mobile: full width minus bottom bar */}
        <main className="md:ml-14 min-h-screen pb-14 md:pb-8">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 backdrop-blur-md" style={{ backgroundColor: 'rgba(11,11,15,0.8)' }}>
            <PageTitle />
            <UserNav />
          </header>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>

        {/* Ticker — desktop only, above content */}
        <footer className="hidden md:flex fixed bottom-0 left-14 right-0 z-30 h-8 items-center overflow-hidden border-t border-white/10" style={{ backgroundColor: '#0B0B0F' }}>
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
