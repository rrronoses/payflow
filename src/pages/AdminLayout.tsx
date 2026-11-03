import { useState } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import type { User } from '../types'
import AdminDashboard from './admin/Dashboard'
import AdminUsers from './admin/Users'
import AdminWithdrawals from './admin/Withdrawals'

interface Props {
  user: User
  onLogout: () => void
}

export default function AdminLayout({ onLogout }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
        : 'text-slate-300 hover:bg-slate-800'
    }`

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="font-bold">PayFlow Admin</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-sm font-semibold">
          A
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-50
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <div className="font-bold">PayFlow Admin</div>
              <div className="text-xs text-slate-400">Control Panel</div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" onClick={closeSidebar}>
          <NavLink to="/admin" end className={linkClass}>
            <i className="fas fa-chart-pie w-5 text-center"></i> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            <i className="fas fa-users w-5 text-center"></i> Users
          </NavLink>
          <NavLink to="/admin/withdrawals" className={linkClass}>
            <i className="fas fa-money-bill-wave w-5 text-center"></i> Withdrawals
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full py-2.5 text-sm text-red-400 hover:bg-slate-800 rounded-xl transition flex items-center justify-center gap-2 font-medium"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
