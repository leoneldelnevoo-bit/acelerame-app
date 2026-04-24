import { redirect } from 'next/navigation'
import { createMasterServerClient } from '@/lib/supabase/server'
import { SaldoWidget } from '@/components/dashboard/saldo-widget'
import { formatNumber, timeAgo } from '@/lib/utils'
import { TrendingUp, MessageSquare, Zap, Target } from 'lucide-react'

export const revalidate = 0 // siempre fresh

export default async function DashboardPage() {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener info del cliente
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', user.email!)
    .maybeSingle()

  if (!cliente) {
    return (
      <div className="surface p-8 text-center">
        <h1 className="font-serif text-2xl font-bold mb-2">Cuenta no configurada</h1>
        <p className="text-fg-muted">
          Tu cuenta aún no está asociada a un proyecto. Contactá al administrador.
        </p>
      </div>
    )
  }

  // Saldo actual
  const { data: saldo } = await supabase
    .from('creditos_saldo')
    .select('*')
    .eq('cliente_id', cliente.id)
    .maybeSingle()

  // Consumo últimos 30 días (por tipo)
  const { data: consumo30d } = await supabase
    .from('creditos_consumo')
    .select('tipo_accion, cantidad_creditos')
    .eq('cliente_id', cliente.id)
    .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const consumoAgrupado = (consumo30d ?? []).reduce((acc, e) => {
    acc[e.tipo_accion] = (acc[e.tipo_accion] ?? 0) + parseFloat(String(e.cantidad_creditos))
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold">
            Hola, <span className="text-gold">{cliente.nombre_completo.split(' ')[0]}</span>
          </h1>
          <p className="text-fg-muted mt-1">
            Resumen de tu operación de prospección — {cliente.empresa}
          </p>
        </div>
        {saldo?.ultima_recarga_at && (
          <div className="text-right text-sm text-fg-muted">
            Última recarga: <br />
            <span className="text-fg">{timeAgo(saldo.ultima_recarga_at)}</span>
          </div>
        )}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget saldo (ocupa 1 columna en lg) */}
        <SaldoWidget
          saldo={parseFloat(saldo?.creditos_actuales ?? '0')}
          totalComprado={parseFloat(saldo?.creditos_comprados_total ?? '0')}
          totalGastado={parseFloat(saldo?.creditos_gastados_total ?? '0')}
          umbralAlerta={parseFloat(saldo?.umbral_alerta_bajo ?? '100')}
        />

        {/* Métricas rápidas */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <MetricCard
            icon={Target}
            label="DMs Instagram"
            value={formatNumber(consumoAgrupado['dm_ig'] ?? 0)}
            subtitle="últimos 30 días"
          />
          <MetricCard
            icon={MessageSquare}
            label="Emails enviados"
            value={formatNumber((consumoAgrupado['email'] ?? 0) / 0.3)}
            subtitle="últimos 30 días"
          />
          <MetricCard
            icon={Zap}
            label="Respuestas IA"
            value={formatNumber((consumoAgrupado['ia_mensaje_generado'] ?? 0) / 2)}
            subtitle="últimos 30 días"
          />
          <MetricCard
            icon={TrendingUp}
            label="Créditos gastados"
            value={formatNumber(Object.values(consumoAgrupado).reduce((a, b) => a + b, 0))}
            subtitle="últimos 30 días"
          />
        </div>
      </div>

      {/* Info placeholder — más adelante va a traer datos del Supabase del cliente (leads, pipeline) */}
      <div className="surface p-8">
        <h2 className="font-serif text-2xl font-bold mb-2">Pipeline de prospección</h2>
        <p className="text-fg-muted mb-6">
          Conectá tu Supabase en "Integraciones" para ver tus leads, pipeline y conversaciones acá.
        </p>
        <a href="/integraciones" className="btn-secondary text-sm">
          Configurar integración
        </a>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  subtitle?: string
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-fg-subtle uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gold" />
        </div>
      </div>
      <p className="font-serif text-3xl font-bold text-fg">{value}</p>
      {subtitle && <p className="text-xs text-fg-subtle mt-1">{subtitle}</p>}
    </div>
  )
}
