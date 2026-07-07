import { useState } from 'react'
import type { FormEvent } from 'react'
import { FiLock } from 'react-icons/fi'
import { api, apiDisplayUrl, getApiErrorMessage } from '../api'
import type { AuthUser } from '../types'

type LoginResponse = {
  token?: string
  user?: AuthUser
  data?: {
    token?: string
    user?: AuthUser
  }
}

type LoginProps = {
  onLogin: (token: string, user: AuthUser) => void
}

function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data } = await api.post<LoginResponse>('/api/auth/login', loginForm)
      const token = data.data?.token ?? data.token
      const user = data.data?.user ?? data.user

      if (!token || !user) {
        setMessage('La API no devolvio una sesion valida.')
        return
      }

      if (user.role !== 'ADMIN') {
        setMessage('Este usuario no tiene permisos de administrador.')
        return
      }

      onLogin(token, user)
    } catch (error) {
      setMessage(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-background lg:grid lg:grid-cols-[minmax(0,1.15fr)_460px]">
      <section className="relative hidden overflow-hidden bg-primary text-on-primary lg:block">
        <img src="/src/assets/hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_40%),linear-gradient(135deg,rgba(20,27,43,0.1),rgba(20,27,43,0.35))]" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 bottom-14 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex h-full items-center px-12 py-14">
          <div className="max-w-2xl space-y-8">
            <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold tracking-wide">EcoPointsRD Admin</span>
            <h1 className="max-w-xl text-5xl font-bold leading-tight">Gobernanza clara para impacto ambiental medible.</h1>
            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Control centralizado</p>
                <p className="mt-1 text-sm text-white/75">Usuarios, permisos y más en un solo panel.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Acceso seguro</p>
                <p className="mt-1 text-sm text-white/75">Entrada restringida para administradores.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 lg:px-8">
        <form onSubmit={login} className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary shadow-soft">
              <FiLock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Inicio de sesion admin</h1>
            <p className="mt-2 text-sm text-on-surface-variant">API activa: {apiDisplayUrl}</p>
          </div>

          <label className="label">Email</label>
          <input className="input" type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} required />

          <label className="label mt-4">Contraseña</label>
          <input className="input" type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required />

          {message && <p className="mt-4 rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{message}</p>}

          <button className="button-primary mt-6 w-full" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar al panel'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
