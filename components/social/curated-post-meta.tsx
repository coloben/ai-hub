import Link from 'next/link'
import { timeAgo } from '@/lib/social/format'
import { getCuratedDisplayMeta } from '@/lib/social/import-meta'
import { CertifiedBadge } from '@/components/trust/certified-badge'

interface CuratedPostMetaProps {
  author: string
  handle: string
  createdAt: string
  hub?: string
  hubLink?: boolean
}

export function CuratedPostMeta({ author, handle, createdAt, hub, hubLink = true }: CuratedPostMetaProps) {
  const meta = getCuratedDisplayMeta(handle)
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground mb-0.5">
      {hub && (
        <>
          {hubLink ? (
            <Link
              href={`/hubs?hub=${hub}`}
              className="font-semibold text-foreground hover:text-accent transition-colors"
            >
              h/{hub}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">h/{hub}</span>
          )}
          <span>·</span>
        </>
      )}
      <span className="text-foreground/90 font-medium">{author}</span>
      <span className="text-accent/90 font-semibold">{meta.viaLabel}</span>
      <span>·</span>
      <span title={createdAt}>
        {meta.timePrefix} · {timeAgo(createdAt)}
      </span>
      <CertifiedBadge variant="editorial" />
    </div>
  )
}
