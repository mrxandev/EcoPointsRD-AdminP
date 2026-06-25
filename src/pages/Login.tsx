import { useState } from 'react'
import type { FormEvent } from 'react'
import { FiLock } from 'react-icons/fi'
import { api, apiDisplayUrl, getApiErrorMessage } from '../api'
import type { AuthUser } from '../types'

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
      const { data } = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', loginForm)

      if (data.user.role !== 'ADMIN') {
        setMessage('Este usuario no tiene permisos de administrador.')
        return
      }

      onLogin(data.token, data.user)
    } catch (error) {
      setMessage(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-background lg:grid lg:grid-cols-[1fr_460px]">
      <section className="relative hidden overflow-hidden bg-primary text-on-primary lg:block">
        <img src="/src/assets/hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <span className="mb-4 w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">EcoPoints RD Admin</span>
          <h1 className="max-w-xl text-5xl font-bold leading-tight">Gobernanza clara para impacto ambiental medible.</h1>
          <p className="mt-5 max-w-lg text-lg text-white/85">Gestiona usuarios, roles, estados y auditorias con una experiencia institucional, rapida y segura.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <form onSubmit={login} className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary">
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
