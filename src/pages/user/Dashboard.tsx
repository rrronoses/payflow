import { useEffect, useState } from 'react'
import { api, formatMoney, formatDate } from '../../lib/api'
import type { User, Transaction } from '../../types'

export default function Dashboard({ user }: { user: User }) {
  const [txs, setTxs] = useState<Transaction[]>([])

  useEffect(() => {
    api.transactions().then(res => {
      if (res.ok && res.data) setTxs(res.data)
    })
  }, [])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back{user.name ? `, ${user.name}` : ''} 👋</h1>
        <p className="text-slate-500">Here's your money overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-primary-100 text-sm font-medium mb-1">Available Balance</div>
          <div className="text-3xl font-bold">{formatMoney(user.balance)}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Account Status</div>
          <div className="text-xl font-semibold text-green-600"><i className="fas fa-check-circle mr-1"></i> Active</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Username</div>
          <div className="text-xl font-semibold">@{user.username}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 font-semibold">Recent Activity</div>
        <div className="divide-y divide-slate-50">
          {txs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <i className="fas fa-inbox text-3xl mb-2"></i>
              <p>No transactions yet. Send or receive money to get started!</p>
            </div>
          ) : (
            txs.map(t => {
              const isOut = t.fromId === user.id
              return (
                <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOut ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      <i className={`fas ${isOut ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                    </div>
                    <div>
                      <div className="font-medium">{isOut ? `Sent to @${t.toUsername}` : `Received from @${t.fromUsername}`}</div>
                      <div className="text-xs text-slate-400">{formatDate(t.createdAt)}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${isOut ? 'text-red-600' : 'text-green-600'}`}>
                    {isOut ? '-' : '+'}{formatMoney(t.amount)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
