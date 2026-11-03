import { useEffect, useState } from 'react'
import { api, formatMoney, formatDate } from '../../lib/api'
import type { User } from '../../types'

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [modal, setModal] = useState<{ type: 'view' | 'bal'; user: User } | null>(null)
  const [balAmount, setBalAmount] = useState('')
  const [balAction, setBalAction] = useState<'add' | 'sub'>('add')
  const [loading, setLoading] = useState(false)

  const load = () => api.adminUsers().then(res => { if (res.ok && res.data) setUsers(res.data) })

  useEffect(() => { load() }, [])

  const doBalance = async () => {
    if (!modal) return
    setLoading(true)
    const res = await api.adminBalance(modal.user.id, Number(balAmount), balAction)
    if (res.ok) {
      setModal(null)
      setBalAmount('')
      load()
    } else {
      alert(res.msg || 'Failed')
    }
    setLoading(false)
  }

  const toggleBan = async (u: User) => {
    if (!confirm(`${u.banned ? 'Unban' : 'Ban'} @${u.username}?`)) return
    await api.adminBan(u.id, !u.banned)
    load()
  }

  const remove = async (u: User) => {
    if (!confirm(`Permanently remove @${u.username}?`)) return
    await api.adminRemoveUser(u.id)
    load()
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm sm:text-base">{users.length} registered users</p>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400">No users yet</div>
        ) : (
          users.map(u => (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                    {(u.name || u.username).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{u.name || '—'}</div>
                    <div className="text-xs text-slate-400">@{u.username}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {u.banned ? 'Banned' : 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <div className="text-slate-400 text-xs">Email</div>
                  <div className="truncate">{u.email}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Balance</div>
                  <div className="font-medium text-primary-600">{formatMoney(u.balance)}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setModal({ type: 'view', user: u })} className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium">View</button>
                <button onClick={() => { setModal({ type: 'bal', user: u }); setBalAction('add') }} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium">+Bal</button>
                <button onClick={() => { setModal({ type: 'bal', user: u }); setBalAction('sub') }} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">-Bal</button>
                <button onClick={() => toggleBan(u)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${u.banned ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {u.banned ? 'Unban' : 'Ban'}
                </button>
                <button onClick={() => remove(u)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Balance</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Joined</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No users yet</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="font-medium">{u.name || '—'}</div>
                    <div className="text-xs text-slate-400">@{u.username}</div>
                  </td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3 font-medium">{formatMoney(u.balance)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <button onClick={() => setModal({ type: 'view', user: u })} className="px-2 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs">View</button>
                    <button onClick={() => { setModal({ type: 'bal', user: u }); setBalAction('add') }} className="px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs">+Bal</button>
                    <button onClick={() => { setModal({ type: 'bal', user: u }); setBalAction('sub') }} className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs">-Bal</button>
                    <button onClick={() => toggleBan(u)} className={`px-2 py-1 rounded-lg text-xs ${u.banned ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {u.banned ? 'Unban' : 'Ban'}
                    </button>
                    <button onClick={() => remove(u)} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {modal.type === 'view' ? (
              <>
                <h3 className="text-lg font-bold mb-4">User Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-500">Name:</span> <strong>{modal.user.name || '—'}</strong></p>
                  <p><span className="text-slate-500">Username:</span> <strong>@{modal.user.username}</strong></p>
                  <p><span className="text-slate-500">Email:</span> <strong>{modal.user.email}</strong></p>
                  <p><span className="text-slate-500">Balance:</span> <strong>{formatMoney(modal.user.balance)}</strong></p>
                  <p><span className="text-slate-500">Status:</span> <strong>{modal.user.banned ? 'Banned' : 'Active'}</strong></p>
                  <p><span className="text-slate-500">Joined:</span> {formatDate(modal.user.createdAt)}</p>
                </div>
                <button onClick={() => setModal(null)} className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium">Close</button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">{balAction === 'add' ? 'Add' : 'Subtract'} Balance</h3>
                <p className="text-sm text-slate-500 mb-3">User: @{modal.user.username} (current: {formatMoney(modal.user.balance)})</p>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={balAmount}
                  onChange={e => setBalAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border mb-4"
                  placeholder="Amount"
                />
                <div className="flex gap-2">
                  <button onClick={doBalance} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium disabled:opacity-60">
                    {loading ? '...' : balAction === 'add' ? 'Add' : 'Subtract'}
                  </button>
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 font-medium">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
