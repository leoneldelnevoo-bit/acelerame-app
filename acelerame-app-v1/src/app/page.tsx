import Link from 'next/link'
import { ArrowRight, Zap, Target, Shield, TrendingUp, Sparkles, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-base overflow-x-hidden">
      {/* ═══════════════════════════════════════════════
          Header
      ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg-base/80 border-b border-border">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center shadow-gold">
              <Zap className="w-4 h-4 text-bg-base" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">
              ACELER<span className="text-gold">AME</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">
              Ingresar
            </Link>
            <Link href="/registro" className="btn-primary">
              Empezar ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════════
          Hero
      ═══════════════════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Glow dorado de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Motor de prospección B2B con IA
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 animate-slide-up">
            Automatizá tu prospección.
            <br />
            <span className="text-gradient-gold">Escalá tu facturación.</span>
          </h1>

          <p className="text-lg md:text-xl text-fg-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Un sistema que trabaja 24/7 enviando mensajes personalizados por Instagram, Email
            y WhatsApp. Tu equipo de ventas digital que nunca duerme.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/registro" className="btn-primary text-base px-8 py-3.5">
              Acceder al panel
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#como-funciona" className="btn-secondary text-base px-8 py-3.5">
              Ver cómo funciona
            </Link>
          </div>

          <p className="mt-8 text-sm text-fg-subtle">
            Sin suscripciones. Pagás solo por el uso real. ₮RON/USDT aceptado.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Beneficios
      ═══════════════════════════════════════════════ */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-6 py-24 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Tu operación de ventas, <span className="text-gradient-gold">en piloto automático</span>
          </h2>
          <p className="text-fg-muted text-lg max-w-2xl mx-auto">
            Tres canales sincronizados, IA que personaliza cada mensaje, y métricas en tiempo real.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <BeneficioCard
            icon={Target}
            titulo="Multi-canal"
            descripcion="Instagram DM + Email corporativo + WhatsApp Business. Si un lead no responde por un canal, el sistema lo contacta por el siguiente."
          />
          <BeneficioCard
            icon={Sparkles}
            titulo="IA personalizada"
            descripcion="Cada mensaje generado por Claude con contexto del lead: empresa, rubro, ubicación, historial. Nada de plantillas genéricas."
          />
          <BeneficioCard
            icon={Shield}
            titulo="Tus datos, tu control"
            descripcion="Supabase propio. Si algún día te vas, te llevás toda la base. Sin lock-in, sin letra chica."
          />
          <BeneficioCard
            icon={TrendingUp}
            titulo="Métricas en vivo"
            descripcion="Dashboard que te muestra saldo, pipeline, leads calientes y conversaciones activas. Actualización cada 30 segundos."
          />
          <BeneficioCard
            icon={Zap}
            titulo="Pay-per-use"
            descripcion="Cargás saldo cuando lo necesitás. Sin cuota mensual. Sabés exactamente qué cuesta cada DM, cada email, cada respuesta."
          />
          <BeneficioCard
            icon={Check}
            titulo="Setup guiado"
            descripcion="En 48 horas tu sistema está corriendo. Nosotros configuramos integraciones, prompts y enriquecimiento de leads."
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA Final
      ═══════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="card-gold text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            El próximo cliente grande <span className="text-gold">ya está en tu base</span>.
          </h3>
          <p className="text-fg-muted text-lg mb-8 max-w-xl mx-auto">
            Solo hay que encontrarlo, contactarlo al momento justo, con el mensaje correcto. Eso hacemos.
          </p>
          <Link href="/registro" className="btn-primary text-base px-8 py-3.5 inline-flex">
            Solicitar acceso
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Footer
      ═══════════════════════════════════════════════ */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center">
              <Zap className="w-3 h-3 text-bg-base" />
            </div>
            <span className="font-serif text-sm font-bold">
              ACELER<span className="text-gold">AME</span>
            </span>
          </div>
          <p className="text-fg-subtle text-sm">
            © 2026 ACELERAME · Construido con visión
          </p>
          <div className="flex gap-6 text-sm text-fg-subtle">
            <Link href="/login" className="hover:text-gold transition-colors">Ingresar</Link>
            <a href="mailto:leoneldelnevo@gmail.com" className="hover:text-gold transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

function BeneficioCard({
  icon: Icon,
  titulo,
  descripcion,
}: {
  icon: React.ComponentType<{ className?: string }>
  titulo: string
  descripcion: string
}) {
  return (
    <div className="surface-hover p-6 group">
      <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <h3 className="font-serif text-xl font-semibold mb-2">{titulo}</h3>
      <p className="text-fg-muted text-sm leading-relaxed">{descripcion}</p>
    </div>
  )
}
