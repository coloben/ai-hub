import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { RightSidebar } from '@/components/RightSidebar'

const BASE_URL = 'https://ai-hub-cnb3.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AI Hub — Le réseau social de l\'IA',
    template: '%s | AI Hub',
  },
  description: 'Le réseau social dédié à l\'intelligence artificielle. News, classements, benchmarks, comparateur de modèles.',
  keywords: ['IA','intelligence artificielle','LLM','GPT','Claude','Gemini','benchmark','classement IA'],
  authors: [{ name: 'AI Hub' }],
  creator: 'AI Hub',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'AI Hub',
    title: 'AI Hub — Le réseau social de l\'IA',
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
      <body className="antialiased bg-bg text-text min-h-screen">
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Right Sidebar - Rankings */}
        <RightSidebar />

        {/* Main Content Area */}
        <main className="ml-[200px] mr-[340px] min-h-screen pb-12">
          {children}
        </main>

        {/* Live Ticker Footer */}
        <footer className="fixed bottom-0 left-[200px] right-[340px] z-50 h-8 flex items-center overflow-hidden border-t border-border bg-void-950/95 backdrop-blur-sm">
          <div className="flex h-full shrink-0 items-center border-r border-border px-4">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-2xs font-semibold uppercase tracking-widest text-accent">Live</span>
            </div>
          </div>
          <div className="ticker-container flex-1">
            <div className="ticker-content gap-12 px-6 text-xs text-text-secondary">
              {doubled.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="text-accent">·</span>
                  <strong className="font-medium text-text-primary">{item.source}</strong>
                  <span className="text-text-tertiary">— {item.title}</span>
                </span>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
