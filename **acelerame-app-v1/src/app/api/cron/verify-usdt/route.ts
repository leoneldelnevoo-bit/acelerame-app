import { NextResponse } from 'next/server'
import { createMasterAdminClient } from '@/lib/supabase/server'
import { getRecentUSDTTransfers } from '@/lib/tron/client'

/**
 * CRON JOB — se llama cada 2-5 minutos (Vercel Cron o manual)
 * Revisa la wallet TRON, busca transfers USDT entrantes, y confirma órdenes pendientes.
 *
 * Protegido por CRON_SECRET en el header Authorization.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createMasterAdminClient()

  // 1. Obtener wallet destino
  const { data: config } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', 'wallet_tron_usdt')
    .maybeSingle()

  const wallet = config?.valor
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet no configurada' }, { status: 500 })
  }

  // 2. Obtener órdenes pendientes que aún no hayan expirado
  const { data: ordenes } = await supabase
    .from('pagos_usdt_pendientes')
    .select('id, cliente_id, monto_usd_esperado, created_at')
    .eq('status', 'waiting')
    .gte('expires_at', new Date().toISOString())

  if (!ordenes || ordenes.length === 0) {
    // Expirar las viejas de paso
    await supabase.rpc('expirar_ordenes_viejas')
    return NextResponse.json({ processed: 0, message: 'Sin órdenes pendientes' })
  }

  // 3. Buscar transfers USDT entrantes desde la orden más vieja
  const minTimestamp = Math.min(...ordenes.map(o => new Date(o.created_at).getTime()))
  const transfers = await getRecentUSDTTransfers(wallet, minTimestamp)

  if (transfers.length === 0) {
    return NextResponse.json({ processed: 0, message: 'Sin transfers nuevos', ordenes_pending: ordenes.length })
  }

  // 4. Matchear transfers con órdenes por monto
  // Estrategia simple: matchear por monto exacto + orden más vieja disponible
  let confirmadas = 0
  const details: Array<{ orden: string; tx: string; status: string }> = []

  for (const tx of transfers) {
    // Buscar orden disponible con este monto exacto (tolerancia 1%)
    const match = ordenes.find(o => {
      const expected = parseFloat(String(o.monto_usd_esperado))
      return Math.abs(tx.amountUSD - expected) / expected < 0.01
    })

    if (!match) {
      details.push({ orden: 'none', tx: tx.txHash, status: 'no_match' })
      continue
    }

    const { data: result } = await supabase.rpc('confirmar_pago_usdt', {
      p_orden_id: match.id,
      p_tron_tx_hash: tx.txHash,
      p_tron_from_address: tx.from,
      p_monto_recibido: tx.amountUSD,
    })

    if (result?.[0]?.success) {
      confirmadas++
      details.push({ orden: match.id, tx: tx.txHash, status: 'confirmed' })
      // Remover la orden de la lista local para no dupli-matchear
      ordenes.splice(ordenes.indexOf(match), 1)
    } else {
      details.push({ orden: match.id, tx: tx.txHash, status: result?.[0]?.mensaje ?? 'failed' })
    }
  }

  return NextResponse.json({
    processed: transfers.length,
    confirmadas,
    details,
    ordenes_remaining: ordenes.length,
  })
}
