import Link from 'next/link'
import { Zap, ArrowLeft, CheckCircle } from 'lucide-react'

export const metadata = { title: 'Solicitar acceso · ACELERAME' }

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-6 py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-fg-muted hover:text-gold text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center shadow-gold">
            <Zap className="w-5 h-5 text-bg-base" />
          </div>
          <span className="font-serif text-2xl font-bold">
            ACELER<span className="text-gold">AME</span>
          </span>
        </div>

        <div className="surface p-8">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
            <CheckCircle className="w-6 h-6 text-gold" />
          </div>

          <h1 className="font-serif text-3xl font-bold mb-2">Acceso por invitación</h1>
          <p className="text-fg-muted mb-8">
            Actualmente estamos onboardeando clientes de forma personalizada para garantizar
            resultados desde el día 1.
          </p>

          <div className="space-y-3 mb-8">
            <Feature>Setup personalizado con tu base de leads</Feature>
            <Feature>Configuración de canales (IG, Email, WhatsApp)</Feature>
            <Feature>Prompts de IA calibrados a tu industria</Feature>
            <Feature>Tu propio Supabase — datos 100% tuyos</Feature>
          </div>

          <a
            href="mailto:leoneldelnevo@gmail.com?subject=Solicito acceso a ACELERAME&body=Hola, quiero conocer el sistema. Mi empresa es: ..."
            className="btn-primary w-full py-3"
          >
            Solicitar acceso
          </a>

          <p className="mt-4 text-center text-xs text-fg-subtle">
            Te respondemos en menos de 24 horas
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-fg-muted">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-gold hover:text-gold-hover font-medium">
            Ingresar
          </Link>
        </p>
      </div>
    </main>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <CheckCircle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
      <span className="text-sm text-fg">{children}</span>
    </div>
  )
}
