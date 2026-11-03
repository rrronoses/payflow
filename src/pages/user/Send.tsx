import { useState, useRef, useEffect } from 'react'
import { api, formatMoney } from '../../lib/api'
import type { User } from '../../types'

interface Props {
  user: User
  setUser: (u: User) => void
}

export default function Send({ user, setUser }: Props) {
  const [username, setUsername] = useState('')
  const [amount, setAmount] = useState('')
  const [suggestions, setSuggestions] = useState<{ id: string; username: string; name: string }[]>([])
  const [showSug, setShowSug] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setShowSug(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const onInput = async (val: string) => {
    setUsername(val)
    if (val.trim().length < 1) {
      setSuggestions([])
      setShowSug(false)
      return
    }
    const res = await api.searchUsers(val.trim())
    if (res.ok && res.data) {
      setSuggestions(res.data)
      setShowSug(true)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const res = await api.transfer(username, Number(amount))
      if (res.ok && res.data) {
        setUser({ ...user, balance: res.data.balance })
        setMsg({ type: 'ok', text: 'Money sent successfully!' })
        setUsername('')
        setAmount('')
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
        <h1 className="text-2xl font-bold">Send Money</h1>
        <p className="text-slate-500">Transfer to another PayFlow user</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
        {msg && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {msg.text}
          </div>
        )}
        <form onSubmit={submit} className="space-y-5">
          <div className="relative" ref={boxRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Username</label>
            <input
              type="text"
              value={username}
              onChange={e => onInput(e.target.value)}
              autoComplete="off"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Start typing username..."
            />
            {showSug && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map(s => (
                  <div
                    key={s.id}
                    className="px-4 py-2.5 cursor-pointer hover:bg-primary-50 flex items-center gap-2"
                    onClick={() => { setUsername(s.username); setShowSug(false) }}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {s.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">@{s.username}</div>
                      <div className="text-xs text-slate-400">{s.name || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="0.00"
            />
            <p className="text-xs text-slate-400 mt-1">Available: {formatMoney(user.balance)}</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition disabled:opacity-60"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-paper-plane mr-2"></i> Send Money</>}
          </button>
        </form>
      </div>
    </>
  )
}
