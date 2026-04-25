import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase MASTER para server components y server actions.
 * Usa cookies para sesión de auth.
 */
export async function createMasterServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_MASTER_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_MASTER_ANON_KEY!,
    {
      db: { schema: 'master' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component → se ignora silenciosamente
          }
        },
      },
    }
  )
}

/**
 * Cliente Supabase MASTER con SERVICE ROLE KEY.
 * Solo usar en API routes server-side — NUNCA exponer al browser.
 * Bypassea RLS. Usar para operaciones admin que requieren privilegios.
 */
export function createMasterAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_MASTER_URL!,
    process.env.SUPABASE_MASTER_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'master' },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
