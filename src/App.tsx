import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { api, getToken, setToken } from './lib/api'
import type { User } from './types'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserLayout from './pages/UserLayout'
import AdminLayout from './pages/AdminLayout'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api.me().then(res => {
      if (res.ok && res.data) setUser(res.data)
      else setToken(null)
    }).finally(() => setLoading(false))
  }, [])

  const handleLogin = (u: User, token: string) => {
    setToken(token)
    setUser(u)
    navigate(u.role === 'admin' ? '/admin' : '/dashboard')
  }

  const handleLogout = async () => {
    await api.logout().catch(() => {})
    setToken(null)
    setUser(null)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 flex items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-2xl text-primary-600"></i>
          <span>Loading PayFlow...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Landing />} />

      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login onLogin={handleLogin} />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />} />

      {/* User Panel */}
      <Route
        path="/dashboard/*"
        element={user && user.role === 'user' ? <UserLayout user={user} setUser={setUser} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />

      {/* Admin Panel */}
      <Route
        path="/admin/*"
        element={user && user.role === 'admin' ? <AdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
