import { useEffect, useState } from 'react'
import { api } from './apiClient'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      try {
        const res = await api.me()
        if (active) setUser(res.user || null)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [])

  const login = async (credentials) => {
    setError(null)
    const res = await api.login(credentials)
    setUser(res.user)
    return res.user
  }

  const register = async (payload) => {
    setError(null)
    const res = await api.register(payload)
    setUser(res.user)
    return res.user
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
