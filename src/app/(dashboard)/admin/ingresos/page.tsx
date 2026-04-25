import { redirect } from 'next/navigation'
import { createMasterServerClient, createMasterAdminClient } from '@/lib/supabase/server'
import { formatUSD, formatNumber, timeAgo } from '@/lib/utils'
import { TrendingUp, DollarSign, Users, Wallet } from 'lucide-react'

export const revalidate = 0

export default async function AdminIngresosPage() {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'leoneldelnevo@gmail.com') redirect('/dashboard')

  const admin = createMasterAdminClient()

  const { data: compras } = await admin
    .from('creditos_compras')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50)

  const totalUSD = (compras ?? []).reduce((sum: number, c: any) => sum + parseFloat(String(c.monto_usd ?? 0)), 0)
  const totalCreditos = (compras ?? []).reduce((sum: number, c: any) => sum + parseFloat(String(c.creditos_agregados ?? 0)), 0)

  // Get cliente names
  const { data: clientes } = await admin.from('clientes').select('id, nombre_completo, empresa')
  const clienteMap = new Map((clientes ?? []).map((c: any) => [c.id, c]))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Ingresos</h1>
        <p className="text-fg-muted mt-1">Compras de créditos confirmadas</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <KPICard label="Total facturado" value={formatUSD(totalUSD)} icon={DollarSign} gold />
        <KPICard label="Créditos vendidos" value={formatNumber(totalCreditos)} icon={Wallet} />
        <KPICard label="Compras totales" value={formatNumber(compras?.length ?? 0)} icon={TrendingUp} />
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-overlay border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-fg-muted">Cliente</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Monto</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Créditos</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Método</th>
                <th className="px-4 py-3 font-medium text-fg-muted">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(compras ?? []).map((c: any) => {
                const cliente: any = clienteMap.get(c.cliente_id)
                return (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{cliente?.nombre_completo ?? '—'}</p>
                      <p className="text-xs text-fg-subtle">{cliente?.empresa}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-gold font-bold">
                      {formatUSD(parseFloat(String(c.monto_usd ?? 0)))}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatNumber(c.creditos_agregados ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-fg-muted">
                      {c.metodo_pago ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-fg-subtle">
                      {c.created_at ? timeAgo(c.created_at) : '—'}
                    </td>
                  </tr>
                )
              })}
              {(!compras || compras.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-fg-muted">
                    No hay compras registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, icon: Icon, gold = false }: any) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-fg-subtle uppercase tracking-wider">{label}</p>
        <Icon className={`w-4 h-4 ${gold ? 'text-gold' : 'text-fg-muted'}`} />
      </div>
      <p className={`font-serif text-2xl font-bold ${gold ? 'text-gold' : ''}`}>{value}</p>
    </div>
  )
}
