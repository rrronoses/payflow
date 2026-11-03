import { useEffect, useState } from 'react'
import { api, formatMoney, formatDate } from '../../lib/api'
import type { Withdrawal } from '../../types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, pendingWithdrawals: 0, totalTransactions: 0 })
  const [wds, setWds] = useState<Withdrawal[]>([])

  useEffect(() => {
    api.adminStats().then(res => { if (res.ok && res.data) setStats(res.data) })
    api.adminWithdrawals().then(res => { if (res.ok && res.data) setWds(res.data.slice(0, 8)) })
  }, [])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500">Overview of the platform</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm">Total Users</div>
          <div className="text-2xl font-bold mt-1">{stats.totalUsers}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm">Total User Balance</div>
          <div className="text-2xl font-bold mt-1 text-primary-600">{formatMoney(stats.totalBalance)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm">Pending Withdrawals</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{stats.pendingWithdrawals}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm">Total Transactions</div>
          <div className="text-2xl font-bold mt-1">{stats.totalTransactions}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold">Recent Withdrawals</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-6 py-3">Method</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {wds.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No withdrawals yet</td></tr>
              ) : wds.map(w => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">@{w.username}</td>
                  <td className="px-6 py-3 capitalize">{w.method}</td>
                  <td className="px-6 py-3">{formatMoney(w.amount)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400">{formatDate(w.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
