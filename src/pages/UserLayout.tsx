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
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive ? 'active' : 'text-slate-600 hover:bg-slate-50'
    }`

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <div>
              <div className="font-bold text-slate-900">PayFlow</div>
              <div className="text-xs text-slate-500">User Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/dashboard" end className={linkClass}><i className="fas fa-home w-5 text-center"></i> Dashboard</NavLink>
          <NavLink to="/dashboard/send" className={linkClass}><i className="fas fa-paper-plane w-5 text-center"></i> Send Money</NavLink>
          <NavLink to="/dashboard/receive" className={linkClass}><i className="fas fa-qrcode w-5 text-center"></i> Receive</NavLink>
          <NavLink to="/dashboard/withdraw" className={linkClass}><i className="fas fa-wallet w-5 text-center"></i> Withdraw</NavLink>
          <NavLink to="/dashboard/profile" className={linkClass}><i className="fas fa-user w-5 text-center"></i> Profile</NavLink>
          <NavLink to="/dashboard/settings" className={linkClass}><i className="fas fa-cog w-5 text-center"></i> Settings</NavLink>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name || user.username}</div>
              <div className="text-xs text-slate-500 truncate">@{user.username}</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 md:p-8">
        <div className="max-w-5xl mx-auto fade-in">
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
