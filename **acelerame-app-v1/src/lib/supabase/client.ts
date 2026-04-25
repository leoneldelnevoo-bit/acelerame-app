import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase MASTER para el browser.
 * Usa la anon key pública. La DB master vive en el proyecto "Acelerame" (schema `master`).
 */
export function createMasterClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_MASTER_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_MASTER_ANON_KEY!,
    {
      db: { schema: 'master' },
    }
  )
}

/**
 * Cliente Supabase del CLIENTE (su propia DB) — para leer sus leads, pipeline, etc.
 * Se construye dinámicamente con las credenciales que el cliente configura.
 */
export function createClientSupabase(url: string, anonKey: string) {
  return createBrowserClient(url, anonKey)
}
