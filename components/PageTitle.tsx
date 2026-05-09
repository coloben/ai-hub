'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/':                '/',
  '/news':            'Feed IA',
  '/feed':            'Mon Feed',
  '/leaderboard':     'Classement',
  '/benchmarks':      'Benchmarks',
  '/compare':         'Comparateur',
  '/alerts':          'Alertes',
  '/briefing':        'Briefing quotidien',
  '/cost-calculator': 'Calculateur de coûts',
  '/timeline':        'Timeline',
  '/glossary':        'Glossaire',
  '/submit':          'Soumettre une info',
  '/settings':        'Paramètres',
  '/notifications':   'Notifications',
  '/onboarding':      'Bienvenue',
  '/login':           'Connexion',
  '/terms':           'CGU',
  '/privacy':         'Confidentialité',
  '/profile':         'Profil',
}

export function PageTitle() {
  const pathname = usePathname()

  // Match exact, then base segment (e.g. /models/gpt-4o → /models)
  const base = '/' + (pathname.split('/')[1] ?? '')
  let label = PAGE_TITLES[pathname] ?? PAGE_TITLES[base]

  // Special cases
  if (base === '/models') label = 'Fiche modèle'
  if (base === '/profile' && pathname !== '/profile') label = 'Profil'

  // Dashboard: show site name instead
  if (pathname === '/') {
    return (
      <span className="flex items-center gap-2">
        <span className="text-sm font-bold text-white/80 tracking-tight">AI Hub</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/30">
          <span className="live-dot scale-75" />
          Live
        </span>
      </span>
    )
  }

  if (!label) return null

  return (
    <span className="text-sm font-semibold text-white/50 tracking-tight">
      {label}
    </span>
  )
}
