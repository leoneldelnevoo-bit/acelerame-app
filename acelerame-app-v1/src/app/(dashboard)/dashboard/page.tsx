import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getClienteContext, createClienteSupabase, clienteTieneDB } from '@/lib/cliente-db'
import { SaldoWidget } from '@/components/dashboard/saldo-widget'
import { formatNumber, timeAgo } from '@/lib/utils'
import {
  TrendingUp, MessageSquare, Zap, Target, Users, Inbox,
  AlertCircle, CheckCircle2, Plug, ArrowRight,
} from 'lucide-react'

export const revalidate = 0

export default async function DashboardPage() {
  const cliente = await getClienteContext()
  if (!cliente) redirect('/login')

  // ─── Saldo (siempre disponible desde master) ───
  const saldo = cliente.saldo

  // ─── Estado de la DB del cliente ───
  const tieneDB = clienteTieneDB(cliente)
  const clienteDB = tieneDB ? createClienteSupabase(cliente) : null

  // ─── Métricas reales del Supabase del cliente ───
  let metricas: {
    totalLeads: number
    leadsNuevos: number
    leadsContactados: number
    leadsConvirtiendo: number
    leadsRespondieron: number
    leadsAgendados: number
    cuentasIG: number
  } | null = null

  let errorDB: string | null = null

  if (clienteDB) {
    try {
      // Total de leads
      const { count: totalLeads } = await clienteDB
        .from('prospeccion_leads')
        .select('*', { count: 'exact', head: true })

      // Etapa 0 = nuevos sin contactar
      const { count: leadsNuevos } = await clienteDB
        .from('prospeccion_leads')
        .select('*', { count: 'exact', head: true })
        .eq('etapa', 0)

      // Etapa >= 1 y < 12 = en proceso
      const { count: leadsContactados } = await clienteDB
        .from('prospeccion_leads')
        .select('*', { count: 'exact', head: true })
        .gte('etapa', 1)
        .lt('etapa', 12)

      // Etapas pares (2, 4, 6, 8, 10) = respondieron
      const { count: leadsRespondieron } = await clienteDB
        .from('prospeccion_leads')
        .select('*', { count: 'exact', head: true })
        .in('etapa', [2, 4, 6, 8, 10])

      // Etapa >= 6 = lead caliente / convirtiendo
      const { count: leadsConvirtiendo } = await clienteDB
        .from('prospeccion_leads')
        .select('*', { count: 'exact', head: true })
        .gte('etapa', 6)
        .lt('etapa', 12)

      // Etapa 12 = agendaron llamada
      const { count: leadsAgendados } = await clienteDB
        .from('prospeccion_leads')
        .select('*', { count: 'exact', head: true })
        .eq('etapa', 12)

      // Cuentas IG configuradas
      const { count: cuentasIG } = await clienteDB
        .from('instagram_cuentas')
        .select('*', { count: 'exact', head: true })

      metricas = {
        totalLeads: totalLeads ?? 0,
        leadsNuevos: leadsNuevos ?? 0,
        leadsContactados: leadsContactados ?? 0,
        leadsConvirtiendo: leadsConvirtiendo ?? 0,
        leadsRespondieron: leadsRespondieron ?? 0,
        leadsAgendados: leadsAgendados ?? 0,
        cuentasIG: cuentasIG ?? 0,
      }
    } catch (e: any) {
      errorDB = e?.message ?? 'Error desconocido al leer la DB'
    }
  }

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════
          Header con saludo + estado del motor
      ═══════════════════════════════════════════════ */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">
            Hola, <span className="text-gold">{cliente.nombre_completo.split(' ')[0]}</span>
          </h1>
          <p className="text-fg-muted mt-1">
            {cliente.empresa ?? 'Tu operación de prospección'}
            {cliente.es_founder && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/30">
                Founder
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cliente.motor_activo ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-success font-medium">Motor activo</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-overlay border border-border">
              <div className="w-2 h-2 rounded-full bg-fg-subtle" />
              <span className="text-sm text-fg-muted">Motor pausado</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Caso 1: No tiene DB conectada → wizard
      ═══════════════════════════════════════════════ */}
      {!tieneDB && (
        <div className="card-gold">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
              <Plug className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-bold mb-2">Conectá tu base de datos</h2>
              <p className="text-fg-muted mb-4">
                Para empezar a prospectar, necesitás conectar un proyecto de Supabase donde
                se guardarán tus leads, pipeline y conversaciones. Tus datos son tuyos —
                podés desconectar cuando quieras.
              </p>
              <Link href="/integraciones" className="btn-primary">
                Conectar Supabase
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Caso 2: Error leyendo DB
      ═══════════════════════════════════════════════ */}
      {tieneDB && errorDB && (
        <div className="surface p-6 border-danger/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-danger mb-1">No pudimos conectar con tu base</h3>
              <p className="text-fg-muted text-sm mb-3">{errorDB}</p>
              <Link href="/integraciones" className="btn-secondary text-sm">
                Revisar integración
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Grid principal: Saldo + Métricas
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SaldoWidget
          saldo={saldo?.creditos_actuales ?? 0}
          totalComprado={saldo?.creditos_comprados_total ?? 0}
          totalGastado={saldo?.creditos_gastados_total ?? 0}
          umbralAlerta={saldo?.umbral_alerta_bajo ?? 100}
        />

        {metricas && (
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <MetricCard
              icon={Users}
              label="Leads totales"
              value={formatNumber(metricas.totalLeads)}
              subtitle={`${formatNumber(metricas.leadsNuevos)} sin contactar`}
              gold
            />
            <MetricCard
              icon={Target}
              label="En proceso"
              value={formatNumber(metricas.leadsContactados)}
              subtitle="conversaciones activas"
            />
            <MetricCard
              icon={MessageSquare}
              label="Respondieron"
              value={formatNumber(metricas.leadsRespondieron)}
              subtitle="esperando reply"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Convirtiendo"
              value={formatNumber(metricas.leadsConvirtiendo)}
              subtitle="leads calientes"
              success
            />
          </div>
        )}

        {!metricas && tieneDB && !errorDB && (
          <div className="lg:col-span-2 surface p-8">
            <div className="shimmer h-32 rounded-lg" />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          Pipeline Visual (etapas)
      ═══════════════════════════════════════════════ */}
      {metricas && metricas.totalLeads > 0 && (
        <div className="surface p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold">Pipeline de prospección</h2>
              <p className="text-fg-muted text-sm mt-1">
                Distribución de tus {formatNumber(metricas.totalLeads)} leads por etapa
              </p>
            </div>
            <Link href="/leads" className="btn-secondary text-sm">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <PipelineFunnel metricas={metricas} />
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Estado de integraciones
      ═══════════════════════════════════════════════ */}
      {metricas && (
        <div className="grid md:grid-cols-2 gap-4">
          <IntegracionCard
            label="Cuentas Instagram"
            count={metricas.cuentasIG}
            cta={metricas.cuentasIG === 0 ? 'Conectar IG' : 'Gestionar'}
            ctaHref="/integraciones"
          />
          <IntegracionCard
            label="Llamadas agendadas"
            count={metricas.leadsAgendados}
            cta="Ver bandeja"
            ctaHref="/bandeja"
            success={metricas.leadsAgendados > 0}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Footer info: última recarga
      ═══════════════════════════════════════════════ */}
      {saldo?.ultima_recarga_at && (
        <p className="text-xs text-fg-subtle text-center pt-4">
          Última recarga: {timeAgo(saldo.ultima_recarga_at)}
        </p>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────
// Componentes
// ────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  gold = false,
  success = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subtitle?: string
  gold?: boolean
  success?: boolean
}) {
  const accent = gold ? 'gold' : success ? 'success' : 'fg-muted'
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-fg-subtle uppercase tracking-wider">{label}</p>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            gold
              ? 'bg-gold/10 border border-gold/20'
              : success
              ? 'bg-success/10 border border-success/30'
              : 'bg-bg-overlay border border-border'
          }`}
        >
          <Icon
            className={`w-4 h-4 ${
              gold ? 'text-gold' : success ? 'text-success' : 'text-fg-muted'
            }`}
          />
        </div>
      </div>
      <p
        className={`font-serif text-3xl font-bold ${
          gold ? 'text-gold' : success ? 'text-success' : 'text-fg'
        }`}
      >
        {value}
      </p>
      {subtitle && <p className="text-xs text-fg-subtle mt-1">{subtitle}</p>}
    </div>
  )
}

function PipelineFunnel({
  metricas,
}: {
  metricas: {
    totalLeads: number
    leadsNuevos: number
    leadsContactados: number
    leadsRespondieron: number
    leadsConvirtiendo: number
    leadsAgendados: number
  }
}) {
  const total = Math.max(metricas.totalLeads, 1)
  const stages = [
    { label: 'Sin contactar', value: metricas.leadsNuevos, color: 'bg-bg-overlay' },
    { label: 'Contactados', value: metricas.leadsContactados, color: 'bg-info' },
    { label: 'Respondieron', value: metricas.leadsRespondieron, color: 'bg-gold/60' },
    { label: 'Convirtiendo', value: metricas.leadsConvirtiendo, color: 'bg-gold' },
    { label: 'Agendados', value: metricas.leadsAgendados, color: 'bg-success' },
  ]

  return (
    <div className="space-y-3">
      {stages.map((s) => {
        const pct = (s.value / total) * 100
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="text-fg-muted">{s.label}</span>
              <span className="text-fg font-mono">
                {formatNumber(s.value)}{' '}
                <span className="text-fg-subtle text-xs">({pct.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-base overflow-hidden">
              <div
                className={`h-full ${s.color} transition-all duration-500`}
                style={{ width: `${Math.max(pct, 0.5)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function IntegracionCard({
  label, count, cta, ctaHref, success = false,
}: {
  label: string; count: number; cta: string; ctaHref: string; success?: boolean
}) {
  return (
    <div className="surface p-5 flex items-center justify-between">
      <div>
        <p className="text-xs text-fg-subtle uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-serif text-2xl font-bold ${success ? 'text-success' : 'text-fg'}`}>
          {formatNumber(count)}
        </p>
      </div>
      <Link href={ctaHref} className="btn-ghost text-sm">
        {cta}
      </Link>
    </div>
  )
}
