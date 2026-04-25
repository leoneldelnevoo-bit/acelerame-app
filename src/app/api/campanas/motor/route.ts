import { NextRequest, NextResponse } from 'next/server'
import { createMasterServerClient, createMasterAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/campanas/motor
 * Body: { activo: boolean }
 * Activa o pausa el motor de prospección para el cliente logueado.
 */
export async function POST(req: NextRequest) {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const { activo } = await req.json()

  const admin = createMasterAdminClient()

  // Verificar que tiene saldo y DB conectada antes de activar
  if (activo) {
    const { data: cliente } = await admin
      .from('clientes')
      .select('id, supabase_url, estado')
      .eq('email', user.email)
      .maybeSingle()

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    if (!cliente.supabase_url) {
      return NextResponse.json({ error: 'Conectá tu Supabase primero' }, { status: 400 })
    }
    if (cliente.estado !== 'activo') {
      return NextResponse.json({ error: 'Tu cuenta no está activa' }, { status: 400 })
    }

    const { data: saldo } = await admin
      .from('creditos_saldo')
      .select('creditos_actuales')
      .eq('cliente_id', cliente.id)
      .maybeSingle()

    if (!saldo || parseFloat(String(saldo.creditos_actuales)) <= 0) {
      return NextResponse.json({
        error: 'No tenés saldo. Recargá créditos antes de activar el motor.',
      }, { status: 400 })
    }
  }

  const { error } = await admin
    .from('clientes')
    .update({ motor_activo: !!activo })
    .eq('email', user.email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, motor_activo: !!activo })
}
