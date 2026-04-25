import { NextRequest, NextResponse } from 'next/server'
import { createMasterServerClient, createMasterAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/integraciones/supabase
 * Conecta el Supabase del cliente.
 * Body: { url, anon_key, project_id?, schema?: 'public' }
 *
 * También testea la conexión antes de guardar.
 */
export async function POST(req: NextRequest) {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const body = await req.json()
  const { url, anon_key, project_id, schema = 'public' } = body

  if (!url || !anon_key) {
    return NextResponse.json({ error: 'url y anon_key son requeridos' }, { status: 400 })
  }

  // Test de conexión real
  try {
    const testClient = createClient(url, anon_key, {
      db: { schema },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Probar una query simple — si la tabla no existe está OK, lo que importa es que la conexión funcione
    const { error: testError } = await testClient
      .from('prospeccion_leads')
      .select('handle', { count: 'exact', head: true })

    if (testError && !testError.message.toLowerCase().includes('does not exist')) {
      return NextResponse.json({
        error: `No pudimos conectar: ${testError.message}`,
        detail: testError,
      }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({
      error: `Error de conexión: ${e?.message ?? 'Desconocido'}`,
    }, { status: 400 })
  }

  // Guardar en master con admin client (bypass RLS)
  const admin = createMasterAdminClient()
  const { error: saveError } = await admin
    .from('clientes')
    .update({
      supabase_url: url,
      supabase_anon_key: anon_key,
      supabase_project_id: project_id ?? null,
      schema_db: schema,
      supabase_test_status: 'ok',
      supabase_test_at: new Date().toISOString(),
      supabase_managed_by_us: false,
    })
    .eq('email', user.email)

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/integraciones/supabase
 * Desconecta el Supabase del cliente (no borra datos, solo el link).
 */
export async function DELETE(_req: NextRequest) {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const admin = createMasterAdminClient()
  const { error } = await admin
    .from('clientes')
    .update({
      supabase_url: null,
      supabase_anon_key: null,
      supabase_project_id: null,
      supabase_test_status: null,
      supabase_test_at: null,
      motor_activo: false,
    })
    .eq('email', user.email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
