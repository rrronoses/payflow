import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { User } from '../types'

interface Props {
  onLogin: (user: User, token: string) => void
}

export default function Login({ onLogin }: Props) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(identifier, password)
      if (res.ok && res.data) {
        onLogin(res.data.user, res.data.token)
      } else {
        setError(res.msg || 'Login failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-2xl mb-4 shadow-lg">
            <i className="fas fa-exchange-alt"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">PayFlow</h1>
          <p className="text-slate-500 mt-1">Send & receive money instantly</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username or Email</label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="username or email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-md disabled:opacity-60"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
