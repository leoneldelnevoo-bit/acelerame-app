import { redirect } from 'next/navigation'
import { createMasterServerClient } from '@/lib/supabase/server'
import { formatNumber, formatUSD } from '@/lib/utils'
import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

export default async function RecargarPage() {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('email', user.email!)
    .maybeSingle()

  if (!cliente) redirect('/dashboard')

  // Cargar paquetes activos
  const { data: paquetes } = await supabase
    .from('paquetes_credito')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold">Recargar saldo</h1>
        <p className="text-fg-muted mt-1">
          Elegí el paquete que mejor te sirva. Pagás con USDT/TRON y tu saldo se acredita automáticamente.
        </p>
      </div>

      {/* Grid de paquetes */}
      <div className="grid md:grid-cols-3 gap-6">
        {(paquetes ?? []).map((p) => (
          <PaqueteCard key={p.slug} paquete={p} clienteId={cliente.id} />
        ))}
      </div>

      {/* Info sobre el cobro */}
      <div className="surface p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold mb-2">¿Cómo funciona?</h3>
            <ul className="space-y-1.5 text-sm text-fg-muted">
              <li>• Elegís un paquete arriba y se abre una orden de pago</li>
              <li>• Te mostramos una dirección TRON única y un QR con el monto exacto</li>
              <li>• Pagás desde tu wallet (TronLink, Trust Wallet, Binance, etc.)</li>
              <li>• Tu saldo se acredita automáticamente al detectarse la transacción (~2-5 min)</li>
              <li>• Recibís confirmación por email</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-fg-subtle">
        ¿Necesitás un paquete distinto o pagar con otro método?{' '}
        <a href="mailto:leoneldelnevo@gmail.com" className="text-gold hover:text-gold-hover">
          Contactanos
        </a>
      </p>
    </div>
  )
}

function PaqueteCard({
  paquete,
  clienteId,
}: {
  paquete: {
    slug: string
    nombre: string
    precio_usd: number
    creditos: number
    descripcion: string
    destacado: boolean
  }
  clienteId: string
}) {
  const precioPorCredito = paquete.precio_usd / paquete.creditos

  return (
    <div
      className={`relative surface p-6 flex flex-col ${
        paquete.destacado ? 'border-gold shadow-gold' : ''
      }`}
    >
      {paquete.destacado && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold text-bg-base text-xs font-bold">
          RECOMENDADO
        </div>
      )}

      <h3 className="font-serif text-2xl font-bold">{paquete.nombre}</h3>
      <p className="text-fg-muted text-sm mt-1 mb-6">{paquete.descripcion}</p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-5xl font-bold text-gold">{formatUSD(paquete.precio_usd).replace('.00', '')}</span>
        </div>
        <p className="text-fg-muted text-sm mt-1">
          {formatNumber(paquete.creditos)} créditos
        </p>
        <p className="text-fg-subtle text-xs mt-0.5">
          ${precioPorCredito.toFixed(3)} por crédito
        </p>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        <Benefit>{formatNumber(paquete.creditos)} DMs Instagram</Benefit>
        <Benefit>{formatNumber(Math.round(paquete.creditos / 0.3))} emails enviados</Benefit>
        <Benefit>{formatNumber(Math.round(paquete.creditos / 2))} respuestas IA</Benefit>
        {paquete.slug === 'growth' && <Benefit gold>Mejor precio por crédito</Benefit>}
        {paquete.slug === 'pro' && <Benefit gold>Ideal para escalar</Benefit>}
      </ul>

      <Link
        href={`/recargar/${paquete.slug}`}
        className={paquete.destacado ? 'btn-primary w-full' : 'btn-secondary w-full'}
      >
        Elegir {paquete.nombre}
      </Link>
    </div>
  )
}

function Benefit({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${gold ? 'text-gold' : 'text-success'}`} />
      <span className={gold ? 'text-gold' : 'text-fg'}>{children}</span>
    </li>
  )
}
