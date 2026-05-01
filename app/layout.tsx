import type { Metadata } from 'next'
import './globals.css'
import { TickerTape } from '@/components/TickerTape'
import { Sidebar } from '@/components/Sidebar'
import { CommandPalette } from '@/components/CommandPalette'

export const metadata: Metadata = {
  title: 'IA Intelligence Hub',
  description: 'Fil d\'intelligence dense pour chercheurs et développeurs IA',
}

export const revalidate = 300

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased bg-bg text-text min-h-screen">
        <TickerTape />
        <div className="flex pt-[32px]">
          <Sidebar />
          <main className="flex-1 min-h-[calc(100vh-32px)]">
            {children}
          </main>
        </div>
        <CommandPalette />
      </body>
    </html>
  )
}
