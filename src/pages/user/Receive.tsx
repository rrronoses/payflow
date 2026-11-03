import { QRCodeSVG } from 'qrcode.react'
import type { User } from '../../types'

export default function Receive({ user }: { user: User }) {
  const copy = () => {
    navigator.clipboard.writeText(user.username)
    alert('Username copied!')
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Receive Money</h1>
        <p className="text-slate-500">Share your username or QR code</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md text-center">
        <div className="mb-4">
          <div className="text-sm text-slate-500 mb-1">Your username</div>
          <div className="flex items-center justify-center gap-2">
            <code className="text-2xl font-bold text-primary-700 bg-primary-50 px-4 py-2 rounded-xl">@{user.username}</code>
            <button onClick={copy} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition" title="Copy">
              <i className="fas fa-copy text-slate-600"></i>
            </button>
          </div>
        </div>
        <div className="my-6 flex justify-center">
          <div className="p-3 bg-white rounded-xl border border-slate-100 inline-block">
            <QRCodeSVG value={`payflow:${user.username}`} size={180} fgColor="#1e40af" />
          </div>
        </div>
        <p className="text-sm text-slate-500">Scan this QR or share your username to receive payments</p>
      </div>
    </>
  )
}
