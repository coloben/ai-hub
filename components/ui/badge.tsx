import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-accent text-accent-foreground hover:bg-accent/80',
        secondary:
          'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline:
          'text-foreground border-border hover:border-border-hover',
        success:
          'border-transparent bg-[rgba(74,222,128,0.12)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.18)]',
        warning:
          'border-transparent bg-[rgba(251,191,36,0.12)] text-[#fbbf24] hover:bg-[rgba(251,191,36,0.18)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
