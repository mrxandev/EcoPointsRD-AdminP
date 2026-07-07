import { useState } from 'react'
import type { FormEvent } from 'react'
import { FiLock } from 'react-icons/fi'
import { api, apiBaseUrl, getApiErrorMessage } from '../api'
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
  const environment = getEnvironmentBadge(apiBaseUrl)

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
      <section className="relative hidden overflow-hidden bg-[#1d1d1f] text-white lg:block">
        <div className="login-ambient-bg" aria-hidden="true" />
        <div className="relative flex h-full items-center px-12 py-14">
          <div className="max-w-2xl space-y-8">
            <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-normal">EcoPointsRD Admin</span>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight">Gobernanza clara para impacto ambiental medible.</h1>
            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Control centralizado</p>
                <p className="mt-1 text-sm text-white/75">Usuarios, permisos y más en un solo panel.</p>
              </div>
              <div className="rounded-[18px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Acceso seguro</p>
                <p className="mt-1 text-sm text-white/75">Entrada restringida para administradores.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 lg:px-8">
        <form onSubmit={login} className="w-full max-w-md rounded-[18px] border border-outline-variant bg-surface-container-lowest p-6 shadow-soft sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-soft">
              <FiLock size={24} />
            </div>
            <h1 className="text-3xl font-semibold text-on-surface">Inicio de sesion admin</h1>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">API en uso</span>
              <span className={`environment-badge environment-badge-${environment.tone}`}>{environment.label}</span>
            </div>
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

function getEnvironmentBadge(baseUrl: string) {
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    return { label: 'Local', tone: 'local' }
  }

  if (baseUrl.includes('onrender.com')) {
    return { label: 'Produccion', tone: 'prod' }
  }

  return { label: 'Dev', tone: 'dev' }
}

export default Login
