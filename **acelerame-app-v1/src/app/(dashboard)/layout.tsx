import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, LayoutDashboard, Users, Send, Inbox, Wallet, CreditCard, Settings, Plug, Shield, LogOut } from 'lucide-react'
import { createMasterServerClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createMasterServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Buscar el cliente asociado al email del user autenticado
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, slug, nombre_completo, empresa, es_founder, estado')
    .eq('email', user.email!)
    .maybeSingle()

  // Detectar si es admin por email
  const isAdmin = user.email === 'leoneldelnevo@gmail.com'

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* ═══════════════════════════════════════════════
          Sidebar
      ═══════════════════════════════════════════════ */}
      <aside className="w-64 bg-bg-elevated border-r border-border flex flex-col">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center gap-2 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center shadow-gold">
            <Zap className="w-4 h-4 text-bg-base" />
          </div>
          <span className="font-serif text-lg font-bold">
            ACELER<span className="text-gold">AME</span>
          </span>
        </div>

        {/* Info cliente */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs text-fg-subtle uppercase tracking-wider mb-1">Proyecto</p>
          <p className="font-semibold text-fg">{cliente?.empresa ?? 'Sin asignar'}</p>
          <p className="text-sm text-fg-muted">
            {cliente?.nombre_completo}
            {cliente?.es_founder && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/30">
                Founder
              </span>
            )}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem href="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
          <NavItem href="/leads" icon={Users}>Leads</NavItem>
          <NavItem href="/campanas" icon={Send}>Campañas</NavItem>
          <NavItem href="/bandeja" icon={Inbox}>Bandeja</NavItem>

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs text-fg-subtle uppercase tracking-wider">Facturación</p>
          </div>
          <NavItem href="/creditos" icon={Wallet}>Mi Saldo</NavItem>
          <NavItem href="/recargar" icon={CreditCard}>Recargar</NavItem>

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs text-fg-subtle uppercase tracking-wider">Configuración</p>
          </div>
          <NavItem href="/integraciones" icon={Plug}>Integraciones</NavItem>
          <NavItem href="/configuracion" icon={Settings}>Configuración</NavItem>

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs text-gold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </p>
              </div>
              <NavItem href="/admin/clientes" icon={Users} gold>Clientes</NavItem>
              <NavItem href="/admin/ingresos" icon={Wallet} gold>Ingresos</NavItem>
            </>
          )}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-border">
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-overlay transition-colors text-sm">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════
          Contenido
      ═══════════════════════════════════════════════ */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}

function NavItem({
  href,
  icon: Icon,
  children,
  gold = false,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  gold?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm ${
        gold
          ? 'text-gold/80 hover:text-gold hover:bg-gold/5'
          : 'text-fg-muted hover:text-fg hover:bg-bg-overlay'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  )
}
