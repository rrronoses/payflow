import { useState } from 'react'
import { api } from '../../lib/api'
import type { User } from '../../types'

interface Props {
  user: User
  setUser: (u: User) => void
}

export default function Profile({ user, setUser }: Props) {
  const [name, setName] = useState(user.name || '')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await api.updateProfile(name)
    if (res.ok && res.data) {
      setUser(res.data)
      setMsg('Profile updated')
    } else {
      setMsg(res.msg || 'Failed')
    }
    setLoading(false)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-slate-500">Manage your public profile</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
        {msg && <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm">{msg}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input type="text" value={`@${user.username}`} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="text" value={user.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-60">
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Save Profile'}
          </button>
        </form>
      </div>
    </>
  )
}
