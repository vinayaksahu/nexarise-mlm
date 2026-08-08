import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient'
  hover?: boolean
}

export function Card({ className = '', variant = 'default', hover = true, children, ...props }: CardProps) {
  const variants = {
    default: 'card-premium',
    glass: 'glass rounded-2xl',
    gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-2xl border border-primary/20',
  }
  
  return (
    <div
      className={`p-6 ${variants[variant]} ${hover ? '' : '!transform-none !shadow-none'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props}>{children}</h3>
}

export function CardDescription({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-muted ${className}`} {...props}>{children}</p>
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>
}
