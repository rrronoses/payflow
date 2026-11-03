import type { User, Transaction, Withdrawal, ApiResponse } from '../types'

const TOKEN_KEY = 'payflow_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { ...options, headers })
  const data = await res.json()
  return data as ApiResponse<T>
}

export const api = {
  health: () => request('/health'),

  signup: (username: string, email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (identifier: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request<User>('/me'),

  searchUsers: (q: string) =>
    request<{ id: string; username: string; name: string }[]>(`/users/search?q=${encodeURIComponent(q)}`),

  transfer: (toUsername: string, amount: number) =>
    request<{ balance: number }>('/transfer', {
      method: 'POST',
      body: JSON.stringify({ toUsername, amount }),
    }),

  transactions: () => request<Transaction[]>('/transactions'),

  withdraw: (method: 'paypal' | 'mpesa', destination: string, amount: number) =>
    request('/withdraw', {
      method: 'POST',
      body: JSON.stringify({ method, destination, amount }),
    }),

  myWithdrawals: () => request<Withdrawal[]>('/withdrawals/me'),

  updateProfile: (name: string) =>
    request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  changeEmail: (currentPassword: string, newEmail: string) =>
    request('/settings/email', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newEmail }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Admin
  adminStats: () =>
    request<{ totalUsers: number; totalBalance: number; pendingWithdrawals: number; totalTransactions: number }>('/admin/stats'),

  adminUsers: () => request<User[]>('/admin/users'),

  adminBalance: (userId: string, amount: number, action: 'add' | 'sub') =>
    request<{ balance: number }>('/admin/balance', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, action }),
    }),

  adminBan: (userId: string, ban: boolean) =>
    request('/admin/ban', {
      method: 'POST',
      body: JSON.stringify({ userId, ban }),
    }),

  adminRemoveUser: (userId: string) =>
    request(`/admin/users/${userId}`, { method: 'DELETE' }),

  adminWithdrawals: () => request<Withdrawal[]>('/admin/withdrawals'),

  adminProcessWithdrawal: (id: string, approve: boolean) =>
    request(`/admin/withdrawals/${id}`, {
      method: 'POST',
      body: JSON.stringify({ approve }),
    }),
}

export function formatMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}
