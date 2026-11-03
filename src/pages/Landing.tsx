import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg">
            <i className="fas fa-exchange-alt text-lg"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">PayFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-500 transition shadow-lg shadow-primary-600/30"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm text-blue-200 mb-8 border border-white/10">
          <i className="fas fa-bolt text-yellow-400"></i>
          Instant peer-to-peer transfers
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Send & Receive Money
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Instantly
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
          Transfer money to anyone using just their username.  
          Withdraw to PayPal or M-Pesa. Simple, fast and secure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 font-semibold text-lg shadow-xl shadow-primary-600/40 transition flex items-center justify-center gap-2"
          >
            <i className="fas fa-user-plus"></i>
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 font-semibold text-lg transition flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-in-alt"></i>
            Login to Account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-4">
              <i className="fas fa-paper-plane"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Send Money</h3>
            <p className="text-slate-400 text-sm">
              Type a username, select from suggestions and transfer instantly.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl mb-4">
              <i className="fas fa-qrcode"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Receive with QR</h3>
            <p className="text-slate-400 text-sm">
              Share your username or QR code so others can pay you easily.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4">
              <i className="fas fa-wallet"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Withdraw</h3>
            <p className="text-slate-400 text-sm">
              Cash out to PayPal email or M-Pesa number. Admin approved.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} PayFlow. All rights reserved.
      </footer>
    </div>
  )
}
