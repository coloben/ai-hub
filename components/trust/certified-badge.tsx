import { BadgeCheck, Users, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'arena' | 'community' | 'editorial'

const STYLES: Record<Variant, string> = {
  arena: 'bg-accent-2/15 text-accent-2 border-accent-2/25',
  community: 'bg-accent-dim text-accent border-accent/25',
  editorial: 'bg-muted text-muted-foreground border-border',
}

const ICONS = { arena: BadgeCheck, community: Users, editorial: Newspaper }
const LABELS = {
  arena: 'Certifié Arena',
  community: 'Communauté AI Hub',
  editorial: 'Actualité vérifiée',
}

export function CertifiedBadge({
  variant,
  className,
}: {
  variant: Variant
  className?: string
}) {
  const Icon = ICONS[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide border',
        STYLES[variant],
        className
      )}
    >
      <Icon size={10} />
      {LABELS[variant]}
    </span>
  )
}
