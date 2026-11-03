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
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
    }`

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <div className="font-bold">PayFlow Admin</div>
              <div className="text-xs text-slate-400">Control Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin" end className={linkClass}><i className="fas fa-chart-pie w-5 text-center"></i> Dashboard</NavLink>
          <NavLink to="/admin/users" className={linkClass}><i className="fas fa-users w-5 text-center"></i> Users</NavLink>
          <NavLink to="/admin/withdrawals" className={linkClass}><i className="fas fa-money-bill-wave w-5 text-center"></i> Withdrawals</NavLink>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={onLogout} className="w-full py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition flex items-center justify-center gap-2">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 md:p-8 bg-slate-50">
        <div className="max-w-6xl mx-auto fade-in">
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
