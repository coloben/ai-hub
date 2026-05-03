import type { Metadata } from 'next'
import './globals.css'
import { NavHeader } from '@/components/NavHeader'

export const metadata: Metadata = {
  title: 'AI Hub — Veille Intelligence Artificielle',
  description: 'Feed temps réel, classement et benchmarks des modèles IA. Suivez la course à l\'IA.',
}

export const revalidate = 60

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-bg text-text min-h-screen">
        <NavHeader />

        {children}

        {/* ── Ticker ── */}
        <footer className="ticker-bar fixed bottom-0 left-0 right-0 z-50 flex h-7 items-center overflow-hidden border-t border-border bg-bg">
          <span className="flex h-full shrink-0 items-center border-r border-border px-3 text-2xs font-semibold uppercase tracking-widest text-text-3">
            Live
          </span>
          <div className="ticker-container flex-1">
            <div className="ticker-content gap-10 px-6 text-xs text-text-3">
              {[
                ['GPT-5', 'Annonce officielle OpenAI — Q3 2025'],
                ['Gemini 2.5 Ultra', 'Contexte 2M tokens, bêta ouverte'],
                ['Mistral 3', 'Bêta fermée — +4.2% HumanEval vs GPT-4o'],
                ['Llama 4', 'Fuite benchmarks MMLU, dépasse Claude 3.5'],
                ['OpenAI', 'Levée série F 6.6 Mds$, valorisation 157 Mds$'],
                ['Claude 3.5', '94.2% MMLU — nouveau SOTA raisonnement'],
                ['GPT-5', 'Annonce officielle OpenAI — Q3 2025'],
                ['Gemini 2.5 Ultra', 'Contexte 2M tokens, bêta ouverte'],
                ['Mistral 3', 'Bêta fermée — +4.2% HumanEval vs GPT-4o'],
                ['Llama 4', 'Fuite benchmarks MMLU, dépasse Claude 3.5'],
                ['OpenAI', 'Levée série F 6.6 Mds$, valorisation 157 Mds$'],
                ['Claude 3.5', '94.2% MMLU — nouveau SOTA raisonnement'],
              ].map(([name, text], i) => (
                <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="text-border-2">·</span>
                  <strong className="font-medium text-text-2">{name}</strong>
                  <span>— {text}</span>
                </span>
              ))}
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
