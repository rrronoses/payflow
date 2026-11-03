import { useEffect, useState } from 'react'
import { api, formatMoney, formatDate } from '../../lib/api'
import type { Withdrawal } from '../../types'

export default function AdminWithdrawals() {
  const [list, setList] = useState<Withdrawal[]>([])

  const load = () => api.adminWithdrawals().then(res => { if (res.ok && res.data) setList(res.data) })

  useEffect(() => { load() }, [])

  const process = async (id: string, approve: boolean) => {
    if (!confirm(approve ? 'Approve this withdrawal?' : 'Reject and refund the user?')) return
    await api.adminProcessWithdrawal(id, approve)
    load()
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Withdrawal Requests</h1>
        <p className="text-slate-500 text-sm sm:text-base">Approve or reject user cashouts</p>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400">No withdrawal requests</div>
        ) : (
          list.map(w => (
            <div key={w.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">@{w.username}</div>
                  <div className="text-xs text-slate-400 capitalize">{w.method}: {w.destination}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {w.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <div className="text-lg font-semibold text-primary-600">{formatMoney(w.amount)}</div>
                  <div className="text-xs text-slate-400">{formatDate(w.createdAt)}</div>
                </div>
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => process(w.id, true)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium">Approve</button>
                    <button onClick={() => process(w.id, false)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium">Reject</button>
                  </div>
                )}
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
                <th className="text-left px-5 py-3">Method / Destination</th>
                <th className="text-left px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Requested</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No withdrawal requests</td></tr>
              ) : list.map(w => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium">@{w.username}</td>
                  <td className="px-5 py-3">
                    <div className="capitalize">{w.method}</div>
                    <div className="text-xs text-slate-400">{w.destination}</div>
                  </td>
                  <td className="px-5 py-3 font-medium">{formatMoney(w.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(w.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    {w.status === 'pending' ? (
                      <>
                        <button onClick={() => process(w.id, true)} className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 mr-1">Approve</button>
                        <button onClick={() => process(w.id, false)} className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700">Reject</button>
                      </>
                    ) : (
                      <span className="text-slate-400 text-xs">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
