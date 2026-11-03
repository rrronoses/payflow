import { useEffect, useState } from 'react'
import { api, formatMoney, formatDate } from '../../lib/api'
import type { User, Withdrawal } from '../../types'

interface Props {
  user: User
  setUser: (u: User) => void
}

export default function Withdraw({ user, setUser }: Props) {
  const [method, setMethod] = useState<'paypal' | 'mpesa'>('paypal')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [list, setList] = useState<Withdrawal[]>([])
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => api.myWithdrawals().then(res => { if (res.ok && res.data) setList(res.data) })

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const res = await api.withdraw(method, destination, Number(amount))
      if (res.ok) {
        const me = await api.me()
        if (me.ok && me.data) setUser(me.data)
        setMsg({ type: 'ok', text: 'Withdrawal request submitted!' })
        setDestination('')
        setAmount('')
        load()
      } else {
        setMsg({ type: 'err', text: res.msg || 'Failed' })
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Withdraw</h1>
        <p className="text-slate-500">Cash out to PayPal or M-Pesa</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold mb-4">New Withdrawal Request</h2>
          {msg && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as 'paypal' | 'mpesa')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="paypal">PayPal Email</option>
                <option value="mpesa">M-Pesa Number</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{method === 'paypal' ? 'PayPal Email' : 'M-Pesa Number'}</label>
              <input
                type={method === 'paypal' ? 'email' : 'text'}
                value={destination}
                onChange={e => setDestination(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder={method === 'paypal' ? 'email@example.com' : '2547XXXXXXXX'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="5"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Available: {formatMoney(user.balance)} · Minimum: $5.00
              </p>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-60">
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Request Withdrawal'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 font-semibold">Your Requests</div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {list.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No withdrawals yet</div>
            ) : (
              list.map(w => (
                <div key={w.id} className="px-5 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{formatMoney(w.amount)}</div>
                      <div className="text-xs text-slate-400">{w.method === 'paypal' ? 'PayPal' : 'M-Pesa'}: {w.destination}</div>
                      <div className="text-xs text-slate-400">{formatDate(w.createdAt)}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
