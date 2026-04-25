import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getClienteContext, createClienteSupabase, clienteTieneDB } from '@/lib/cliente-db'
import { ConectarSupabaseForm, DesconectarButton } from '@/components/integraciones/conectar-supabase'
import { CheckCircle2, Database, ExternalLink, Lock, Shield, Zap } from 'lucide-react'

export const revalidate = 0

export default async function IntegracionesPage() {
  const cliente = await getClienteContext()
  if (!cliente) redirect('/login')

  const tieneDB = clienteTieneDB(cliente)
  const clienteDB = tieneDB ? createClienteSupabase(cliente) : null

  // Test rápido si hay DB conectada
  let dbStatus: 'connected' | 'error' | null = null
  let dbDetail: { totalLeads?: number; cuentasIG?: number } = {}
  let dbError: string | null = null

  if (clienteDB) {
    try {
      const { count: totalLeads, error: e1 } = await clienteDB
        .from('prospeccion_leads')
        .select('*', { count: 'exact', head: true })
      if (e1 && !e1.message.includes('does not exist')) throw e1

      const { count: cuentasIG } = await clienteDB
        .from('instagram_cuentas')
        .select('*', { count: 'exact', head: true })

      dbStatus = 'connected'
      dbDetail = { totalLeads: totalLeads ?? 0, cuentasIG: cuentasIG ?? 0 }
    } catch (e: any) {
      dbStatus = 'error'
      dbError = e?.message ?? 'Error desconocido'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Integraciones</h1>
        <p className="text-fg-muted mt-1">
          Conectá tu propia base de datos y los canales de prospección.
        </p>
      </div>

      {/* ═══════════════════════════════════════════
          BYODB: Supabase del cliente
      ═══════════════════════════════════════════ */}
      <div className="surface p-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold">Base de datos</h2>
              <p className="text-fg-muted text-sm mt-1">
                Tu Supabase donde viven leads, pipeline y conversaciones.
              </p>
            </div>
          </div>
          {tieneDB && dbStatus === 'connected' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Conectado</span>
            </div>
          )}
        </div>

        {/* Caso 1: NO conectado → form */}
        {!tieneDB && (
          <>
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <BeneficiCard icon={Lock} title="Tus datos, tuyos" desc="Toda la info vive en tu Supabase. Si te vas, te la llevás." />
              <BeneficiCard icon={Shield} title="Sin lock-in" desc="Podés desconectar cuando quieras. No hay letra chica." />
              <BeneficiCard icon={Zap} title="Setup en 2 minutos" desc="Solo URL + anon key. Te ayudamos con SQL si hace falta." />
            </div>

            <div className="border border-border rounded-lg p-5 bg-bg-overlay/50">
              <h3 className="font-medium mb-4">Pegá las credenciales de tu Supabase:</h3>
              <ConectarSupabaseForm />
              <p className="text-xs text-fg-subtle mt-4">
                ¿No tenés un Supabase?{' '}
                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-gold hover:underline">
                  Creá uno gratis acá <ExternalLink className="inline w-3 h-3" />
                </a>{' '}
                y volvés con las credenciales.
              </p>
            </div>
          </>
        )}

        {/* Caso 2: Conectado correctamente → datos + desconectar */}
        {tieneDB && dbStatus === 'connected' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <InfoRow label="Project ID" value={cliente.supabase_project_id ?? '—'} mono />
              <InfoRow label="Schema" value={cliente.schema_db} mono />
              <InfoRow label="URL" value={cliente.supabase_url ?? '—'} mono small />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoRow label="Total leads" value={dbDetail.totalLeads?.toLocaleString() ?? '0'} accent />
              <InfoRow label="Cuentas IG" value={String(dbDetail.cuentasIG ?? 0)} accent />
            </div>

            {!cliente.es_founder && (
              <div className="pt-4 border-t border-border">
                <DesconectarButton projectId={cliente.supabase_project_id} />
                <p className="text-xs text-fg-subtle mt-2">
                  Desconectar no borra tus datos en Supabase, solo el link con ACELERAME.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Caso 3: conectado pero error */}
        {tieneDB && dbStatus === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/30">
              <p className="font-medium text-danger mb-1">Tu Supabase está conectado pero no responde</p>
              <p className="text-sm text-fg-muted font-mono">{dbError}</p>
            </div>
            <DesconectarButton projectId={cliente.supabase_project_id} />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          Canales (placeholders por ahora)
      ═══════════════════════════════════════════ */}
      <div className="grid md:grid-cols-3 gap-4">
        <CanalCard
          name="Instagram"
          status={tieneDB ? 'pending' : 'locked'}
          desc="Conectá tu cuenta para enviar DMs personalizados con IA."
          cta="Próximamente"
        />
        <CanalCard
          name="Email"
          status="locked"
          desc="Cold email con dominios calentados y deliverability optimizado."
          cta="Próximamente"
        />
        <CanalCard
          name="WhatsApp Business"
          status="locked"
          desc="WhatsApp con calentamiento de números y respuestas con IA."
          cta="Próximamente"
        />
      </div>
    </div>
  )
}

function BeneficiCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-lg bg-bg-overlay/50 border border-border">
      <Icon className="w-5 h-5 text-gold mb-2" />
      <p className="font-medium text-sm mb-1">{title}</p>
      <p className="text-xs text-fg-muted">{desc}</p>
    </div>
  )
}

function InfoRow({
  label, value, mono = false, small = false, accent = false,
}: { label: string; value: string; mono?: boolean; small?: boolean; accent?: boolean }) {
  return (
    <div className="bg-bg-overlay/50 rounded-lg p-3">
      <p className="text-xs text-fg-subtle uppercase tracking-wider mb-1">{label}</p>
      <p className={`${mono ? 'font-mono' : 'font-serif'} ${small ? 'text-xs' : 'text-base'} ${accent ? 'text-gold font-bold text-xl' : ''} truncate`}>
        {value}
      </p>
    </div>
  )
}

function CanalCard({
  name, status, desc, cta,
}: { name: string; status: 'pending' | 'connected' | 'locked'; desc: string; cta: string }) {
  return (
    <div className="surface p-5 opacity-60">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{name}</h3>
        <span className="text-xs text-fg-subtle">
          {status === 'locked' ? '🔒' : status === 'pending' ? '⏳' : '✓'}
        </span>
      </div>
      <p className="text-sm text-fg-muted mb-3">{desc}</p>
      <span className="text-xs text-fg-subtle">{cta}</span>
    </div>
  )
}
