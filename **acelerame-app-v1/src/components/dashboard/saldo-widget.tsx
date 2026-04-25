import Link from 'next/link'
import { Wallet, ArrowRight, AlertTriangle } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface SaldoWidgetProps {
  saldo: number
  totalComprado: number
  totalGastado: number
  umbralAlerta: number
}

export function SaldoWidget({ saldo, totalComprado, totalGastado, umbralAlerta }: SaldoWidgetProps) {
  const porcentajeUsado = totalComprado > 0 ? (totalGastado / totalComprado) * 100 : 0
  const saldoBajo = saldo > 0 && saldo < umbralAlerta
  const saldoAgotado = saldo === 0

  // Estimación de duración basada en ritmo actual (placeholder — afinar con datos reales)
  // 1 crédito ≈ 1 DM ≈ gasto diario típico de cliente activo ~30 créditos/día
  const diasEstimados = saldo > 0 ? Math.round(saldo / 30) : 0

  return (
    <div className="card-gold relative overflow-hidden">
      {/* Efecto shimmer sutil */}
      <div className="shimmer absolute inset-0 opacity-20 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gold/20 border border-gold/40 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-gold" />
          </div>
          <h3 className="font-medium text-fg">Mi Saldo</h3>
        </div>

        {/* Número grande */}
        <div className="mb-4">
          <p className="metric leading-none">{formatNumber(saldo)}</p>
          <p className="text-sm text-fg-muted mt-1">créditos disponibles</p>
        </div>

        {/* Alert saldo bajo */}
        {(saldoBajo || saldoAgotado) && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 mb-4">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">
                {saldoAgotado ? 'Saldo agotado' : 'Saldo bajo'}
              </p>
              <p className="text-xs text-fg-muted">
                {saldoAgotado
                  ? 'El sistema está pausado. Recargá para reactivarlo.'
                  : `Te duran ~${diasEstimados} días al ritmo actual.`}
              </p>
            </div>
          </div>
        )}

        {/* Proyección (si saldo OK) */}
        {!saldoBajo && !saldoAgotado && diasEstimados > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-bg-overlay border border-border">
            <p className="text-xs text-fg-subtle mb-0.5">Proyección</p>
            <p className="text-sm text-fg">
              Te duran <span className="text-gold font-semibold">~{diasEstimados} días</span> al
              ritmo actual de consumo
            </p>
          </div>
        )}

        {/* Barra de uso */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-fg-muted mb-1.5">
            <span>Usado</span>
            <span>{formatNumber(totalGastado)} / {formatNumber(totalComprado)}</span>
          </div>
          <div className="h-2 rounded-full bg-bg-overlay overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-gold-hover transition-all duration-500"
              style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/recargar"
          className="btn-primary w-full py-2.5 text-sm"
        >
          Cargar saldo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
