import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SpotlightProvider } from './components/spotlight-provider'
import { WebSiteSchema, OrganizationSchema } from './components/json-ld'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-hub-cnb3.vercel.app'

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Hub',
    description: 'La communauté IA francophone.',
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
  manifest: '/manifest.webmanifest',
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
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrains.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased min-h-screen font-sans">
        <OrganizationSchema />
        <WebSiteSchema />
        <a href="#main" className="skip-link">
          Passer au contenu principal
        </a>
        <SpotlightProvider>
          {children}
        </SpotlightProvider>
      </body>
    </html>
  )
}
