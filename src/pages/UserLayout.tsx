import { useState } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import type { User } from '../types'
import Dashboard from './user/Dashboard'
import Send from './user/Send'
import Receive from './user/Receive'
import Withdraw from './user/Withdraw'
import Profile from './user/Profile'
import Settings from './user/Settings'

interface Props {
  user: User
  setUser: (u: User) => void
  onLogout: () => void
}

export default function UserLayout({ user, setUser, onLogout }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
        : 'text-slate-600 hover:bg-slate-100'
    }`

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="font-bold text-slate-900">PayFlow</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
          {(user.name || user.username).charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <div>
              <div className="font-bold text-slate-900">PayFlow</div>
              <div className="text-xs text-slate-500">User Panel</div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" onClick={closeSidebar}>
          <NavLink to="/dashboard" end className={linkClass}>
            <i className="fas fa-home w-5 text-center"></i> Dashboard
          </NavLink>
          <NavLink to="/dashboard/send" className={linkClass}>
            <i className="fas fa-paper-plane w-5 text-center"></i> Send Money
          </NavLink>
          <NavLink to="/dashboard/receive" className={linkClass}>
            <i className="fas fa-qrcode w-5 text-center"></i> Receive
          </NavLink>
          <NavLink to="/dashboard/withdraw" className={linkClass}>
            <i className="fas fa-wallet w-5 text-center"></i> Withdraw
          </NavLink>
          <NavLink to="/dashboard/profile" className={linkClass}>
            <i className="fas fa-user w-5 text-center"></i> Profile
          </NavLink>
          <NavLink to="/dashboard/settings" className={linkClass}>
            <i className="fas fa-cog w-5 text-center"></i> Settings
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name || user.username}</div>
              <div className="text-xs text-slate-500 truncate">@{user.username}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-2 font-medium"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
          <Routes>
            <Route index element={<Dashboard user={user} />} />
            <Route path="send" element={<Send user={user} setUser={setUser} />} />
            <Route path="receive" element={<Receive user={user} />} />
            <Route path="withdraw" element={<Withdraw user={user} setUser={setUser} />} />
            <Route path="profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="settings" element={<Settings user={user} setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
