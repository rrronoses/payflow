import { useState } from 'react'
import { api } from '../../lib/api'
import type { User } from '../../types'

interface Props {
  user: User
  setUser: (u: User) => void
}

export default function Settings({ user, setUser }: Props) {
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' })
  const [emailMsg, setEmailMsg] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [loadingE, setLoadingE] = useState(false)
  const [loadingP, setLoadingP] = useState(false)

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingE(true)
    setEmailMsg('')
    const res = await api.changeEmail(emailForm.currentPassword, emailForm.newEmail)
    if (res.ok) {
      setEmailMsg('Email updated successfully')
      const me = await api.me()
      if (me.ok && me.data) setUser(me.data)
      setEmailForm({ newEmail: '', currentPassword: '' })
    } else {
      setEmailMsg(res.msg || 'Failed')
    }
    setLoadingE(false)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingP(true)
    setPassMsg('')
    const res = await api.changePassword(passForm.currentPassword, passForm.newPassword)
    if (res.ok) {
      setPassMsg('Password updated successfully')
      setPassForm({ currentPassword: '', newPassword: '' })
    } else {
      setPassMsg(res.msg || 'Failed')
    }
    setLoadingP(false)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500">Security & account settings</p>
      </div>
      <div className="space-y-6 max-w-lg">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold mb-4">Change Email</h2>
          {emailMsg && <div className="mb-3 p-2 rounded-lg bg-slate-50 text-sm">{emailMsg}</div>}
          <form onSubmit={changeEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Email</label>
              <input type="email" required value={emailForm.newEmail} onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" required value={emailForm.currentPassword} onChange={e => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <button type="submit" disabled={loadingE} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium disabled:opacity-60">
              {loadingE ? '...' : 'Update Email'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold mb-4">Change Password</h2>
          {passMsg && <div className="mb-3 p-2 rounded-lg bg-slate-50 text-sm">{passMsg}</div>}
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" required value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" required minLength={6} value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <button type="submit" disabled={loadingP} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium disabled:opacity-60">
              {loadingP ? '...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
