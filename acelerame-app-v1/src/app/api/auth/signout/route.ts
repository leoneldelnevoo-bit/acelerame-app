import { NextResponse } from 'next/server'
import { createMasterServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createMasterServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  )
}
