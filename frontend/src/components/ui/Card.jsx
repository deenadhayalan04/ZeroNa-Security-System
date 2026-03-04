import { cn } from '../../lib/cn'

export function Card({ className, ...props }) {
  return <div className={cn('glass rounded-2xl', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('px-5 pt-5', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-sm font-semibold text-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

