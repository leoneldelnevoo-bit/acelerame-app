import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createMasterServerClient } from '@/lib/supabase/server'

/**
 * Información completa del cliente logueado.
 */
export interface ClienteContext {
  id: string
  slug: string
  nombre_completo: string
  email: string
  empresa: string | null
  es_founder: boolean
  estado: string
  motor_activo: boolean
  supabase_project_id: string | null
  supabase_url: string | null
  supabase_anon_key: string | null
  schema_db: string
  saldo: {
    creditos_actuales: number
    creditos_comprados_total: number
    creditos_gastados_total: number
    umbral_alerta_bajo: number
    ultima_recarga_at: string | null
  } | null
}

/**
 * Obtiene el contexto completo del cliente logueado.
 * Devuelve null si no hay user autenticado o si el cliente no existe.
 */
export async function getClienteContext(): Promise<ClienteContext | null> {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const { data: cliente } = await supabase
    .from('clientes')
    .select(`
      id, slug, nombre_completo, email, empresa, es_founder, estado, motor_activo,
      supabase_project_id, supabase_url, supabase_anon_key, schema_db
    `)
    .eq('email', user.email)
    .maybeSingle()

  if (!cliente) return null

  const { data: saldo } = await supabase
    .from('creditos_saldo')
    .select('*')
    .eq('cliente_id', cliente.id)
    .maybeSingle()

  return {
    ...cliente,
    saldo: saldo
      ? {
          creditos_actuales: parseFloat(String(saldo.creditos_actuales)),
          creditos_comprados_total: parseFloat(String(saldo.creditos_comprados_total)),
          creditos_gastados_total: parseFloat(String(saldo.creditos_gastados_total)),
          umbral_alerta_bajo: parseFloat(String(saldo.umbral_alerta_bajo)),
          ultima_recarga_at: saldo.ultima_recarga_at,
        }
      : null,
  }
}

/**
 * Crea un cliente Supabase apuntando al proyecto del CLIENTE logueado.
 *
 * BYODB: si el cliente conectó su propio Supabase, lee de allí.
 * Si todavía no conectó nada, devuelve null (la página debe pedirle conectar).
 *
 * Para Leo (founder), apunta al schema 'public' del proyecto master usando
 * la anon key pública. Para Poncho y otros, apunta al Supabase del cliente.
 */
export function createClienteSupabase(cliente: ClienteContext) {
  if (!cliente.supabase_url) return null

  // Para Leo, usamos la misma anon key del master (estamos en el mismo proyecto)
  // Para clientes BYODB, usamos su propia anon_key guardada
  const anonKey =
    cliente.supabase_anon_key ?? process.env.NEXT_PUBLIC_SUPABASE_MASTER_ANON_KEY!

  return createSupabaseClient(cliente.supabase_url, anonKey, {
    db: { schema: cliente.schema_db || 'public' },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Verifica si el cliente tiene su Supabase conectado y operativo.
 */
export function clienteTieneDB(cliente: ClienteContext): boolean {
  return !!cliente.supabase_url && !!cliente.supabase_project_id
}
