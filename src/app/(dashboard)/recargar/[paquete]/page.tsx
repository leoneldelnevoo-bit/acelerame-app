import { redirect, notFound } from 'next/navigation'
import { createMasterServerClient } from '@/lib/supabase/server'
import { formatUSD, formatNumber } from '@/lib/utils'
import { QRPaymentDisplay } from '@/components/dashboard/qr-payment-display'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'

export const revalidate = 0

export default async function PaquetePagoPage({
  params,
}: {
  params: Promise<{ paquete: string }>
}) {
  const { paquete: paqueteSlug } = await params
  const supabase = await createMasterServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nombre_completo')
    .eq('email', user.email!)
    .maybeSingle()

  if (!cliente) redirect('/dashboard')

  // Validar paquete
  const { data: paquete } = await supabase
    .from('paquetes_credito')
    .select('*')
    .eq('slug', paqueteSlug)
    .eq('activo', true)
    .maybeSingle()

  if (!paquete) notFound()

  // Crear orden de pago USDT
  const { data: ordenArr, error: ordenError } = await supabase.rpc('crear_orden_pago_usdt', {
    p_cliente_id: cliente.id,
    p_paquete_slug: paqueteSlug,
  })

  if (ordenError || !ordenArr || ordenArr.length === 0) {
    return (
      <div className="surface p-8 max-w-2xl mx-auto text-center">
        <h1 className="font-serif text-2xl font-bold mb-2">Error al crear orden</h1>
        <p className="text-fg-muted mb-4">
          {ordenError?.message ?? 'No se pudo generar la orden de pago.'}
        </p>
        <Link href="/recargar" className="btn-secondary">Volver</Link>
      </div>
    )
  }

  const orden = ordenArr[0]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/recargar"
        className="inline-flex items-center gap-2 text-fg-muted hover:text-gold text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a paquetes
      </Link>

      <div>
        <h1 className="font-serif text-4xl font-bold">
          Pago de <span className="text-gold">{paquete.nombre}</span>
        </h1>
        <p className="text-fg-muted mt-1">
          {formatUSD(paquete.precio_usd)} · {formatNumber(paquete.creditos)} créditos
        </p>
      </div>

      <QRPaymentDisplay
        ordenId={orden.orden_id}
        walletDestino={orden.wallet_destino}
        montoUSD={parseFloat(orden.monto_usd)}
        memo={orden.memo_identificador}
        expiresAt={orden.expires_at}
        qrData={orden.qr_data}
        creditos={parseFloat(orden.creditos_a_agregar)}
      />

      <div className="surface p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-2">Instrucciones</p>
            <ol className="space-y-1.5 text-fg-muted list-decimal list-inside">
              <li>Copiá la dirección TRON y enviá <strong className="text-gold">exactamente {formatUSD(paquete.precio_usd)}</strong> en USDT (TRC20)</li>
              <li>Usá una wallet compatible con TRON: TronLink, Trust Wallet, Binance, OKX</li>
              <li><strong>IMPORTANTE:</strong> asegurate de usar la red <span className="text-gold">TRC20</span>, NO ERC20 o BEP20</li>
              <li>Tu saldo se acredita automáticamente al detectarse la transferencia (2-5 minutos)</li>
              <li>La orden expira en 2 horas. Si no pagás antes, deberás crear una nueva.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
