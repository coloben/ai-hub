import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SpotlightProvider } from './components/spotlight-provider'

const BASE_URL = 'https://ai-hub-cnb3.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'AI Hub — Communauté IA · Classement Arena certifié',
    template: '%s | AI Hub',
  },
  description:
    'Communauté IA francophone : feed, hubs, comparateur avec votes réels, classement ELO Arena vérifiable.',
  keywords: [
    'IA',
    'intelligence artificielle',
    'LLM',
    'GPT',
    'Claude',
    'Gemini',
    'benchmark',
    'classement IA',
    'veille techno',
  ],
  authors: [{ name: 'AI Hub', url: BASE_URL }],
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
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: { canonical: BASE_URL },
}

export const viewport: Viewport = {
  themeColor: '#06060a',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen">
        <a href="#main" className="skip-link">Passer au contenu principal</a>
        <SpotlightProvider>
          <main id="main">{children}</main>
        </SpotlightProvider>
      </body>
    </html>
  )
}
