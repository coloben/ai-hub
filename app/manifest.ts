import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Hub — Veille IA en temps réel',
    short_name: 'AI Hub',
    description: 'Classements, benchmarks et alertes des modèles IA en temps réel',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d12',
    theme_color: '#0d0d12',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Classement', url: '/leaderboard', description: 'Ranking des modèles IA' },
      { name: 'Feed IA',    url: '/news',        description: 'Actualités en temps réel' },
      { name: 'Benchmarks', url: '/benchmarks',  description: 'Scores comparatifs' },
    ],
  }
}
