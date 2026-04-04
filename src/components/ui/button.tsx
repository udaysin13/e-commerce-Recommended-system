import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/src/shared/utils'

const buttonVariants = cva(
  "premium-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold shadow-[0_12px_32px_rgba(2,6,23,0.18)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-indigo-400 hover:shadow-[0_18px_42px_rgba(99,102,241,0.35)]',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 hover:shadow-[0_18px_42px_rgba(239,68,68,0.28)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-white/10 bg-white/[0.04] text-slate-100 shadow-none hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_18px_42px_rgba(15,23,42,0.32)]',
        ghost:
          'shadow-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 gap-1.5 px-3.5 text-xs has-[>svg]:px-3',
        lg: 'h-12 px-6 text-sm has-[>svg]:px-5',
        icon: 'size-11',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

