import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createMasterServerClient, createMasterAdminClient } from '@/lib/supabase/server'
import { formatNumber, formatUSD, timeAgo } from '@/lib/utils'
import { Users, ArrowRight, CheckCircle2, Pause } from 'lucide-react'

export const revalidate = 0

export default async function AdminClientesPage() {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'leoneldelnevo@gmail.com') redirect('/dashboard')

  const admin = createMasterAdminClient()

  const { data: clientes } = await admin
    .from('clientes')
    .select(`
      id, slug, nombre_completo, email, empresa, estado, es_founder,
      motor_activo, fecha_alta, supabase_project_id, supabase_url
    `)
    .order('fecha_alta', { ascending: false })

  // Obtener saldos de todos
  const { data: saldos } = await admin
    .from('creditos_saldo')
    .select('cliente_id, creditos_actuales, creditos_comprados_total, creditos_gastados_total')

  const saldoMap = new Map((saldos ?? []).map((s: any) => [s.cliente_id, s]))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Clientes</h1>
        <p className="text-fg-muted mt-1">
          {clientes?.length ?? 0} clientes registrados en la plataforma
        </p>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-overlay border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-fg-muted">Cliente</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Empresa</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Estado</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Motor</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Saldo</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Comprado</th>
                <th className="px-4 py-3 font-medium text-fg-muted">DB</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Alta</th>
              </tr>
            </thead>
            <tbody>
              {(clientes ?? []).map((c: any) => {
                const saldo: any = saldoMap.get(c.id)
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-bg-overlay/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.nombre_completo}</p>
                      <p className="text-xs text-fg-subtle">{c.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {c.empresa ?? '—'}
                      {c.es_founder && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/30">
                          Founder
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={c.estado} />
                    </td>
                    <td className="px-4 py-3">
                      {c.motor_activo ? (
                        <span className="text-success text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="text-fg-subtle text-xs flex items-center gap-1">
                          <Pause className="w-3 h-3" /> Pausado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {saldo ? formatNumber(saldo.creditos_actuales) : '0'}
                    </td>
                    <td className="px-4 py-3 font-mono text-fg-muted">
                      {saldo ? formatNumber(saldo.creditos_comprados_total) : '0'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {c.supabase_project_id ? (
                        <span className="text-success">{c.supabase_project_id.substring(0, 12)}…</span>
                      ) : (
                        <span className="text-fg-subtle">No conectado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-fg-subtle">
                      {c.fecha_alta ? timeAgo(c.fecha_alta) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; color: string }> = {
    activo: { label: 'Activo', color: 'bg-success/10 text-success border-success/30' },
    pausado: { label: 'Pausado', color: 'bg-warning/10 text-warning border-warning/30' },
    suspendido: { label: 'Suspendido', color: 'bg-danger/10 text-danger border-danger/30' },
    trial_pendiente: { label: 'Trial pendiente', color: 'bg-info/10 text-info border-info/30' },
  }
  const info = map[estado] ?? { label: estado, color: 'bg-bg-overlay text-fg-muted border-border' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${info.color}`}>
      {info.label}
    </span>
  )
}
