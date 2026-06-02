import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Database, ExternalLink } from 'lucide-react'
import type { TrustStatus } from '@/lib/trust'
import { cn } from '@/lib/utils'

interface DataTrustBannerProps {
  status: TrustStatus
  compact?: boolean
}

export function DataTrustBanner({ status, compact }: DataTrustBannerProps) {
  const isFallback = status.tier === 'fallback'
  const isLive = status.tier === 'live'

  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2.5 text-[11px] leading-relaxed',
        isFallback
          ? 'border-warning/40 bg-warning-dim/30 text-muted-foreground'
          : isLive
            ? 'border-success/30 bg-success-dim/20'
            : 'border-border/80 bg-card/50 text-muted-foreground'
      )}
      role="status"
    >
      <div className="flex items-start gap-2">
        {isFallback ? (
          <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <p>
            <span className="font-semibold text-foreground">
              {isFallback ? 'Données Arena en mode secours' : 'Données certifiées Arena AI'}
            </span>
            {!compact && <> — {status.message}</>}
          </p>
          {!compact && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span>
                Source : <code className="font-mono text-[10px]">{status.rankingSource}</code>
              </span>
              <span>
                MAJ :{' '}
                {new Date(status.rankingUpdatedAt).toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {!status.databaseConfigured && (
                <span className="flex items-center gap-1 text-warning">
                  <Database size={11} />
                  Persistance communauté : configurez DATABASE_URL
                </span>
              )}
            </p>
          )}
          <Link
            href={status.arenaLeaderboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
          >
            Vérifier sur Chatbot Arena <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    </div>
  )
}
