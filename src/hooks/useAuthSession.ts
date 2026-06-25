import { useEffect, useState } from 'react'
import { setAuthToken } from '../api'
import type { AuthUser } from '../types'

const TOKEN_KEY = 'ecopointsrd_admin_token'
const USER_KEY = 'ecopointsrd_admin_user'

export function useAuthSession() {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    setAuthToken(storedToken)
    return storedToken
  })
  const [admin, setAdmin] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as AuthUser) : null
  })

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const persistSession = (nextToken: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setAuthToken(nextToken)
    setToken(nextToken)
    setAdmin(user)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    setToken(null)
    setAdmin(null)
  }

  return {
    admin,
    isLoggedIn: Boolean(token && admin?.role === 'ADMIN'),
    logout,
    persistSession,
  }
}
