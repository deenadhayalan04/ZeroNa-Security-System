import { cn } from '../../lib/cn'

const variants = {
  default: 'bg-secondary text-secondary-foreground border-border/60',
  outline: 'bg-transparent text-foreground border-border/70',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
}

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    />
  )
}

