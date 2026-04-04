import { cn } from '@/src/shared/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-pulse rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }

