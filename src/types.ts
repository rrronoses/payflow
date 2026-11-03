export interface User {
  id: string
  username: string
  email: string
  password: string // hashed in real app; plain for demo simplicity with KV
  name: string
  balance: number
  role: 'user' | 'admin'
  banned: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  fromId: string
  toId: string
  fromUsername: string
  toUsername: string
  amount: number
  type: 'transfer' | 'admin_credit' | 'admin_debit' | 'withdraw_hold' | 'withdraw_refund'
  createdAt: string
}

export interface Withdrawal {
  id: string
  userId: string
  username: string
  method: 'paypal' | 'mpesa'
  destination: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  processedAt: string | null
}

export interface Session {
  userId: string
  role: 'user' | 'admin'
  expiresAt: number
}

export type ApiResponse<T = unknown> = {
  ok: boolean
  msg?: string
  data?: T
}
