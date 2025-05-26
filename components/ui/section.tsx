import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  background?: 'white' | 'gradient' | 'primary' | 'transparent'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

const backgroundVariants = {
  white: 'bg-white',
  gradient: 'bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100',
  primary: 'bg-gradient-to-r from-primary to-blue-600 text-white',
  transparent: 'bg-transparent',
}

const paddingVariants = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-20',
}

export default function Section({
  children,
  className,
  containerClassName,
  background = 'transparent',
  padding = 'lg',
}: SectionProps) {
  return (
    <section className={cn(
      backgroundVariants[background],
      paddingVariants[padding],
      className
    )}>
      <div className={cn('container mx-auto px-4', containerClassName)}>
        {children}
      </div>
    </section>
  )
} 