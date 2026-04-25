import { Construction } from 'lucide-react'
import Link from 'next/link'

interface PlaceholderProps {
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export function PagePlaceholder({ title, description, ctaLabel, ctaHref }: PlaceholderProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold">{title}</h1>
        <p className="text-fg-muted mt-1">{description}</p>
      </div>

      <div className="surface p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-gold" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Próximamente</h2>
        <p className="text-fg-muted max-w-md mx-auto mb-6">
          Esta sección está en construcción. Estamos trabajando para habilitarla pronto.
        </p>
        {ctaLabel && ctaHref && (
          <Link href={ctaHref} className="btn-secondary">{ctaLabel}</Link>
        )}
      </div>
    </div>
  )
}
