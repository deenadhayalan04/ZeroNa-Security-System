import { cn } from '../../lib/cn'

export function Progress({ value = 0, className }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-border/60', className)}>
      <div
        className="h-full w-full rounded-full bg-primary transition-transform"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </div>
  )
}

