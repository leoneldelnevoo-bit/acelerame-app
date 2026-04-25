'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, Plug, Trash2 } from 'lucide-react'

export function ConectarSupabaseForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Auto-detectar project_id desde URL al pegar
  const handleUrlChange = (v: string) => {
    setUrl(v)
    const match = v.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)
    if (match && !projectId) setProjectId(match[1])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('testing')
    setErrorMsg('')

    try {
      const res = await fetch('/api/integraciones/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          anon_key: anonKey.trim(),
          project_id: projectId.trim() || null,
          schema: 'public',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Error desconocido')
      } else {
        setStatus('ok')
        setTimeout(() => router.refresh(), 1000)
      }
    } catch (e: any) {
      setStatus('error')
      setErrorMsg(e?.message ?? 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="url">URL del proyecto Supabase</label>
        <input
          id="url"
          type="url"
          required
          placeholder="https://xxxxx.supabase.co"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="input font-mono text-sm"
        />
        <p className="text-xs text-fg-subtle mt-1">
          La encontrás en Supabase → Settings → API → Project URL
        </p>
      </div>

      <div>
        <label className="label" htmlFor="anon_key">Anon Public Key</label>
        <input
          id="anon_key"
          type="text"
          required
          placeholder="eyJhbGc... (empieza con eyJ)"
          value={anonKey}
          onChange={(e) => setAnonKey(e.target.value)}
          className="input font-mono text-xs"
        />
        <p className="text-xs text-fg-subtle mt-1">
          Settings → API → anon public (NO la service_role)
        </p>
      </div>

      {projectId && (
        <p className="text-xs text-fg-subtle">
          Project ID detectado: <span className="font-mono text-gold">{projectId}</span>
        </p>
      )}

      {status === 'error' && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{errorMsg}</p>
        </div>
      )}

      {status === 'ok' && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <p className="text-sm text-success">¡Conectado! Recargando…</p>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
        {loading ? 'Probando conexión…' : 'Conectar Supabase'}
      </button>
    </form>
  )
}

export function DesconectarButton({ projectId }: { projectId: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handle = async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/integraciones/supabase', { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <button onClick={handle} disabled={loading} className="btn-ghost text-sm text-danger hover:text-danger">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      {confirming ? '¿Confirmás? Click otra vez' : 'Desconectar Supabase'}
    </button>
  )
}
