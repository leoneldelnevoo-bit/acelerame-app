import { redirect } from 'next/navigation'
import { createMasterServerClient } from '@/lib/supabase/server'
import { formatNumber, formatUSD, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'

export const revalidate = 0

export default async function CreditosPage() {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', user.email!)
    .maybeSingle()

  if (!cliente) redirect('/dashboard')

  const { data: saldo } = await supabase
    .from('creditos_saldo')
    .select('*')
    .eq('cliente_id', cliente.id)
    .maybeSingle()

  // Últimos 30 consumos
  const { data: consumos } = await supabase
    .from('creditos_consumo')
    .select('*')
    .eq('cliente_id', cliente.id)
    .order('fecha', { ascending: false })
    .limit(30)

  // Historial de compras
  const { data: compras } = await supabase
    .from('creditos_compras')
    .select('*')
    .eq('cliente_id', cliente.id)
    .order('fecha', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold">Mi Saldo</h1>
        <p className="text-fg-muted mt-1">Historial de consumo y recargas</p>
      </div>

      {/* Saldo actual destacado */}
      <div className="card-gold">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-sm text-fg-muted mb-2">Saldo actual</p>
            <p className="metric text-6xl">{formatNumber(saldo?.creditos_actuales ?? 0)}</p>
            <p className="text-fg-muted mt-1">créditos disponibles</p>
          </div>
          <Link href="/recargar" className="btn-primary">
            Recargar saldo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-border">
          <StatInline label="Total comprado" value={formatNumber(saldo?.creditos_comprados_total ?? 0)} />
          <StatInline label="Total gastado" value={formatNumber(saldo?.creditos_gastados_total ?? 0)} />
          <StatInline label="De regalo" value={formatNumber(saldo?.creditos_regalados_total ?? 0)} />
        </div>
      </div>

      {/* Dos columnas: Consumo reciente + Compras */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Consumo reciente */}
        <div className="surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-danger" />
            <h2 className="font-serif text-xl font-bold">Consumo reciente</h2>
          </div>

          {(!consumos || consumos.length === 0) ? (
            <p className="text-fg-muted text-sm py-8 text-center">
              Aún no hay consumo registrado. El sistema empezará a consumir cuando active el motor.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {consumos.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-overlay transition-colors">
                  <div>
                    <p className="text-sm font-medium">{labelAccion(c.tipo_accion)}</p>
                    <p className="text-xs text-fg-subtle">
                      {c.referencia_handle ? `@${c.referencia_handle} · ` : ''}{timeAgo(c.fecha)}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-danger">
                    −{formatNumber(c.cantidad_creditos)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compras */}
        <div className="surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h2 className="font-serif text-xl font-bold">Recargas</h2>
          </div>

          {(!compras || compras.length === 0) ? (
            <p className="text-fg-muted text-sm py-8 text-center">
              Aún no hay recargas registradas.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {compras.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-overlay transition-colors">
                  <div>
                    <p className="text-sm font-medium">
                      {formatUSD(c.monto_usd)} — {labelMetodoPago(c.metodo_pago)}
                    </p>
                    <p className="text-xs text-fg-subtle">{timeAgo(c.fecha)}</p>
                  </div>
                  <span className="text-sm font-mono text-success">
                    +{formatNumber(c.creditos_agregados)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-fg-subtle uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-serif font-semibold text-fg">{value}</p>
    </div>
  )
}

function labelAccion(tipo: string): string {
  const labels: Record<string, string> = {
    'dm_ig': 'DM de Instagram',
    'dm_ig_followup': 'Follow-up IG',
    'check_responses': 'Chequeo respuestas',
    'email': 'Email enviado',
    'email_followup': 'Follow-up Email',
    'wa_enviado': 'WhatsApp',
    'ia_mensaje_generado': 'Mensaje IA',
    'ia_respuesta': 'Respuesta IA',
    'enriquecimiento_lead': 'Enriquecimiento lead',
    'scraping_perfil': 'Scrape perfil',
  }
  return labels[tipo] ?? tipo
}

function labelMetodoPago(metodo: string): string {
  const labels: Record<string, string> = {
    'usdt_tron': 'USDT/TRON',
    'stripe': 'Tarjeta',
    'transferencia': 'Transferencia',
    'regalo_founder': 'Regalo (Founder)',
    'manual': 'Manual',
  }
  return labels[metodo] ?? metodo
}
