import { Database, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface PersistenceBannerProps {
  persisted: boolean
  compact?: boolean
}

export function PersistenceBanner({ persisted, compact }: PersistenceBannerProps) {
  if (persisted) return null

  return (
    <div
      className="rounded-lg border border-warning/40 bg-warning-dim/25 px-3 py-2 text-[11px] text-muted-foreground flex items-start gap-2"
      role="status"
    >
      <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-foreground">Votes et posts non persistés</p>
        {!compact && (
          <p className="mt-0.5 leading-relaxed">
            Sans <code className="font-mono text-[10px]">DATABASE_URL</code> sur Vercel, les duels et
            publications peuvent être perdus entre redéploiements. Configurez le pooler Supabase (port
            6543).
          </p>
        )}
        <Link href="/about#persistance" className="text-accent hover:underline font-medium mt-1 inline-block">
          Méthodologie →
        </Link>
      </div>
      <Database size={14} className="text-warning shrink-0 ml-auto opacity-60" />
    </div>
  )
}
