'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Clock, CheckCircle2, ExternalLink } from 'lucide-react'
import { createMasterClient } from '@/lib/supabase/client'
import { formatUSD, formatNumber } from '@/lib/utils'
import QRCode from 'qrcode'

interface QRPaymentDisplayProps {
  ordenId: string
  walletDestino: string
  montoUSD: number
  memo: string
  expiresAt: string
  qrData: string
  creditos: number
}

export function QRPaymentDisplay({
  ordenId,
  walletDestino,
  montoUSD,
  memo,
  expiresAt,
  creditos,
}: QRPaymentDisplayProps) {
  const router = useRouter()
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'expired'>('waiting')

  // Generar QR code (data URL base64)
  useEffect(() => {
    // Para TRON, el QR más universal es solo la dirección.
    // Las wallets como TronLink interpretan tron:ADDRESS?amount=X
    QRCode.toDataURL(walletDestino, {
      width: 260,
      margin: 1,
      color: { dark: '#FFD700', light: '#0F0F0F' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl)
  }, [walletDestino])

  // Countdown al expiry
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expirada')
        setStatus('expired')
        return
      }
      const mins = Math.floor(diff / 60_000)
      const secs = Math.floor((diff % 60_000) / 1000)
      setTimeLeft(`${mins}m ${secs.toString().padStart(2, '0')}s`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  // Polling de estado de la orden cada 10s
  useEffect(() => {
    if (status !== 'waiting') return
    const supabase = createMasterClient()

    const check = async () => {
      const { data } = await supabase
        .from('pagos_usdt_pendientes')
        .select('status')
        .eq('id', ordenId)
        .maybeSingle()
      if (data?.status === 'confirmed') {
        setStatus('confirmed')
        setTimeout(() => router.push('/creditos'), 3000)
      }
    }

    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [ordenId, status, router])

  async function copy(value: string, field: string) {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Estado confirmado
  if (status === 'confirmed') {
    return (
      <div className="card-gold text-center py-12">
        <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-4 animate-fade-in">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">¡Pago confirmado!</h2>
        <p className="text-fg-muted mb-6">
          Se acreditaron {formatNumber(creditos)} créditos a tu cuenta.
        </p>
        <p className="text-sm text-fg-subtle">Redirigiendo...</p>
      </div>
    )
  }

  // Estado expirado
  if (status === 'expired') {
    return (
      <div className="surface p-8 text-center">
        <h2 className="font-serif text-2xl font-bold mb-2">Orden expirada</h2>
        <p className="text-fg-muted mb-6">
          Esta orden ya no es válida. Podés crear una nueva.
        </p>
        <button
          onClick={() => router.push('/recargar')}
          className="btn-primary"
        >
          Crear nueva orden
        </button>
      </div>
    )
  }

  return (
    <div className="card-gold">
      <div className="grid md:grid-cols-[auto,1fr] gap-8">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-xl bg-bg-base border border-border">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR code de pago" className="w-64 h-64" />
            ) : (
              <div className="w-64 h-64 animate-pulse bg-bg-overlay rounded" />
            )}
          </div>
          <p className="text-xs text-fg-subtle mt-3">Escaneá con tu wallet TRON</p>
        </div>

        {/* Datos de pago */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-fg-muted mb-1">Enviar exactamente</p>
            <p className="metric text-4xl">{formatUSD(montoUSD)}</p>
            <p className="text-sm text-gold-dim mt-1">USDT · Red TRC20</p>
          </div>

          <CopyField
            label="Dirección TRON"
            value={walletDestino}
            onCopy={() => copy(walletDestino, 'wallet')}
            copied={copiedField === 'wallet'}
            mono
          />

          <CopyField
            label="Identificador de orden"
            value={memo}
            onCopy={() => copy(memo, 'memo')}
            copied={copiedField === 'memo'}
          />

          {/* Countdown */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-overlay border border-border">
            <Clock className="w-4 h-4 text-warning" />
            <div className="text-sm">
              <span className="text-fg-muted">Expira en</span>{' '}
              <span className="font-mono font-semibold text-gold">{timeLeft}</span>
            </div>
          </div>

          {/* Status esperando */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-info/5 border border-info/20">
            <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
            <p className="text-sm text-fg">
              Esperando confirmación en la blockchain...
            </p>
          </div>

          {/* Link a Tronscan */}
          <a
            href={`https://tronscan.org/#/address/${walletDestino}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-hover"
          >
            Ver wallet en Tronscan
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

function CopyField({
  label,
  value,
  onCopy,
  copied,
  mono = false,
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-fg-subtle uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-stretch gap-2">
        <div
          className={`flex-1 px-3 py-2 rounded-lg bg-bg-overlay border border-border text-sm ${
            mono ? 'font-mono' : ''
          } break-all`}
        >
          {value}
        </div>
        <button
          onClick={onCopy}
          className="px-3 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
          title="Copiar"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
