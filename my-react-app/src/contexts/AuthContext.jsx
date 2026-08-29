import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import axios from 'axios'
import authService from '../api/authService'
import userService from '../api/userService'
import {
  setAccessToken,
  clearAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from '../api/tokenStorage'
import { API_BASE_URL } from '../config'

const AuthContext = createContext()

const initialUser = () => {
  try {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initAuth = async () => {
      const rt = getRefreshToken()
      if (!rt) {
        clearAccessToken()
        localStorage.removeItem('user')
        setUser(null)
        setInitializing(false)
        return
      }
      try {
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken: rt })
        const auth = res.data.data
        setAccessToken(auth.accessToken)
        if (auth.refreshToken) setRefreshToken(auth.refreshToken)
      } catch {
        clearAccessToken()
        clearRefreshToken()
        localStorage.removeItem('user')
        setUser(null)
        setInitializing(false)
        return
      }
      try {
        const profileRes = await userService.getProfile()
        const userData = profileRes.data.data
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } catch {
        clearAccessToken()
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setInitializing(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    clearAccessToken()
    clearRefreshToken()
    localStorage.removeItem('user')
    setUser(null)
    try {
      const res = await authService.login({ email, password })
      const auth = res.data.data
      setAccessToken(auth.accessToken)
      setRefreshToken(auth.refreshToken)

      const profileRes = await userService.getProfile()
      const userData = profileRes.data.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Đăng nhập thất bại' }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    clearAccessToken()
    clearRefreshToken()
    localStorage.removeItem('user')
    setUser(null)
    try {
      const res = await authService.register(data)
      const auth = res.data.data
      setAccessToken(auth.accessToken)
      setRefreshToken(auth.refreshToken)

      const profileRes = await userService.getProfile()
      const userData = profileRes.data.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Đăng ký thất bái' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    }
    clearAccessToken()
    clearRefreshToken()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    initializing,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  }), [user, setUser, loading, initializing, login, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
