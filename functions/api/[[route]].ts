import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/cloudflare-pages'
import type { User, Transaction, Withdrawal, Session } from '../../src/types'

type Bindings = {
  STORAGE: KVNamespace
}

type Variables = {
  userId: string
  role: 'user' | 'admin'
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().basePath('/api')

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ---------- Helpers ----------
function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

function token() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
}

async function getUserById(kv: KVNamespace, id: string): Promise<User | null> {
  const raw = await kv.get(`user:${id}`)
  return raw ? JSON.parse(raw) : null
}

async function getUserByUsername(kv: KVNamespace, username: string): Promise<User | null> {
  const id = await kv.get(`username:${username.toLowerCase()}`)
  if (!id) return null
  return getUserById(kv, id)
}

async function getUserByEmail(kv: KVNamespace, email: string): Promise<User | null> {
  const id = await kv.get(`email:${email.toLowerCase()}`)
  if (!id) return null
  return getUserById(kv, id)
}

async function saveUser(kv: KVNamespace, user: User) {
  await kv.put(`user:${user.id}`, JSON.stringify(user))
  await kv.put(`username:${user.username.toLowerCase()}`, user.id)
  await kv.put(`email:${user.email.toLowerCase()}`, user.id)
}

async function listUserIds(kv: KVNamespace): Promise<string[]> {
  const list = await kv.list({ prefix: 'user:' })
  return list.keys.map(k => k.name.replace('user:', ''))
}

async function authMiddleware(c: any, next: any) {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ ok: false, msg: 'Unauthorized' }, 401)
  }
  const tok = auth.slice(7)
  const raw = await c.env.STORAGE.get(`session:${tok}`)
  if (!raw) return c.json({ ok: false, msg: 'Invalid session' }, 401)
  const session: Session = JSON.parse(raw)
  if (session.expiresAt < Date.now()) {
    await c.env.STORAGE.delete(`session:${tok}`)
    return c.json({ ok: false, msg: 'Session expired' }, 401)
  }
  c.set('userId', session.userId)
  c.set('role', session.role)
  await next()
}

// ---------- Seed / update admin ----------
async function ensureAdmin(kv: KVNamespace) {
  const existingId = await kv.get('username:admin')
  if (existingId) {
    // Keep existing admin but force the correct password
    const raw = await kv.get(`user:${existingId}`)
    if (raw) {
      const admin: User = JSON.parse(raw)
      if (admin.password !== 'admin@##@123321') {
        admin.password = 'admin@##@123321'
        await saveUser(kv, admin)
      }
    }
    return
  }
  const admin: User = {
    id: 'admin',
    username: 'admin',
    email: 'admin@payflow.app',
    password: 'admin@##@123321',
    name: 'System Admin',
    balance: 0,
    role: 'admin',
    banned: false,
    createdAt: new Date().toISOString(),
  }
  await saveUser(kv, admin)
}

// ---------- Public routes ----------
app.get('/health', async (c) => {
  await ensureAdmin(c.env.STORAGE)
  return c.json({ ok: true, msg: 'PayFlow API running' })
})

app.post('/auth/signup', async (c) => {
  await ensureAdmin(c.env.STORAGE)
  const body = await c.req.json<{ username: string; email: string; password: string }>()
  const username = (body.username || '').trim().toLowerCase()
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  if (!username || !email || !password) return c.json({ ok: false, msg: 'All fields required' }, 400)
  if (username.length < 3) return c.json({ ok: false, msg: 'Username min 3 chars' }, 400)
  if (password.length < 6) return c.json({ ok: false, msg: 'Password min 6 chars' }, 400)
  if (await getUserByUsername(c.env.STORAGE, username)) return c.json({ ok: false, msg: 'Username taken' }, 400)
  if (await getUserByEmail(c.env.STORAGE, email)) return c.json({ ok: false, msg: 'Email already registered' }, 400)

  const user: User = {
    id: uid('u'),
    username,
    email,
    password,
    name: '',
    balance: 0,
    role: 'user',
    banned: false,
    createdAt: new Date().toISOString(),
  }
  await saveUser(c.env.STORAGE, user)

  const tok = token()
  const session: Session = { userId: user.id, role: user.role, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  await c.env.STORAGE.put(`session:${tok}`, JSON.stringify(session), { expirationTtl: 7 * 24 * 60 * 60 })

  const { password: _, ...safe } = user
  return c.json({ ok: true, data: { user: safe, token: tok } })
})

app.post('/auth/login', async (c) => {
  await ensureAdmin(c.env.STORAGE)
  const body = await c.req.json<{ identifier: string; password: string }>()
  const identifier = (body.identifier || '').trim().toLowerCase()
  const password = body.password || ''

  let user = await getUserByUsername(c.env.STORAGE, identifier)
  if (!user) user = await getUserByEmail(c.env.STORAGE, identifier)

  if (!user || user.password !== password) return c.json({ ok: false, msg: 'Invalid credentials' }, 401)
  if (user.banned) return c.json({ ok: false, msg: 'Account banned' }, 403)

  const tok = token()
  const session: Session = { userId: user.id, role: user.role, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  await c.env.STORAGE.put(`session:${tok}`, JSON.stringify(session), { expirationTtl: 7 * 24 * 60 * 60 })

  const { password: _, ...safe } = user
  return c.json({ ok: true, data: { user: safe, token: tok } })
})

app.post('/auth/logout', authMiddleware, async (c) => {
  const auth = c.req.header('Authorization')!
  const tok = auth.slice(7)
  await c.env.STORAGE.delete(`session:${tok}`)
  return c.json({ ok: true })
})

// ---------- Authenticated routes ----------
app.get('/me', authMiddleware, async (c) => {
  const user = await getUserById(c.env.STORAGE, c.get('userId'))
  if (!user) return c.json({ ok: false, msg: 'User not found' }, 404)
  const { password: _, ...safe } = user
  return c.json({ ok: true, data: safe })
})

app.get('/users/search', authMiddleware, async (c) => {
  const q = (c.req.query('q') || '').toLowerCase().trim()
  if (q.length < 1) return c.json({ ok: true, data: [] })

  const ids = await listUserIds(c.env.STORAGE)
  const results: { username: string; name: string; id: string }[] = []
  for (const id of ids) {
    const u = await getUserById(c.env.STORAGE, id)
    if (u && u.role === 'user' && !u.banned && u.username.includes(q) && u.id !== c.get('userId')) {
      results.push({ id: u.id, username: u.username, name: u.name })
      if (results.length >= 8) break
    }
  }
  return c.json({ ok: true, data: results })
})

app.post('/transfer', authMiddleware, async (c) => {
  const body = await c.req.json<{ toUsername: string; amount: number }>()
  const amount = Number(body.amount)
  const toUsername = (body.toUsername || '').trim().toLowerCase()

  if (!toUsername || isNaN(amount) || amount <= 0) return c.json({ ok: false, msg: 'Invalid input' }, 400)

  const from = await getUserById(c.env.STORAGE, c.get('userId'))
  const to = await getUserByUsername(c.env.STORAGE, toUsername)

  if (!from || !to) return c.json({ ok: false, msg: 'User not found' }, 404)
  if (from.id === to.id) return c.json({ ok: false, msg: 'Cannot send to yourself' }, 400)
  if (to.banned) return c.json({ ok: false, msg: 'Recipient is banned' }, 400)
  if (from.balance < amount) return c.json({ ok: false, msg: 'Insufficient balance' }, 400)

  from.balance = +(from.balance - amount).toFixed(2)
  to.balance = +(to.balance + amount).toFixed(2)
  await saveUser(c.env.STORAGE, from)
  await saveUser(c.env.STORAGE, to)

  const tx: Transaction = {
    id: uid('tx'),
    fromId: from.id,
    toId: to.id,
    fromUsername: from.username,
    toUsername: to.username,
    amount,
    type: 'transfer',
    createdAt: new Date().toISOString(),
  }
  await c.env.STORAGE.put(`tx:${tx.id}`, JSON.stringify(tx))
  const recentRaw = await c.env.STORAGE.get('tx:recent') || '[]'
  const recent: string[] = JSON.parse(recentRaw)
  recent.unshift(tx.id)
  await c.env.STORAGE.put('tx:recent', JSON.stringify(recent.slice(0, 200)))

  return c.json({ ok: true, data: { balance: from.balance } })
})

app.get('/transactions', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const recentRaw = await c.env.STORAGE.get('tx:recent') || '[]'
  const ids: string[] = JSON.parse(recentRaw)
  const txs: Transaction[] = []
  for (const id of ids) {
    const raw = await c.env.STORAGE.get(`tx:${id}`)
    if (!raw) continue
    const tx: Transaction = JSON.parse(raw)
    if (tx.fromId === userId || tx.toId === userId) {
      txs.push(tx)
      if (txs.length >= 30) break
    }
  }
  return c.json({ ok: true, data: txs })
})

app.post('/withdraw', authMiddleware, async (c) => {
  const body = await c.req.json<{ method: 'paypal' | 'mpesa'; destination: string; amount: number }>()
  const amount = Number(body.amount)
  const method = body.method
  const destination = (body.destination || '').trim()

  if (!['paypal', 'mpesa'].includes(method) || !destination || isNaN(amount) || amount <= 0) {
    return c.json({ ok: false, msg: 'Invalid input' }, 400)
  }

  const user = await getUserById(c.env.STORAGE, c.get('userId'))
  if (!user) return c.json({ ok: false, msg: 'User not found' }, 404)
  if (user.balance < amount) return c.json({ ok: false, msg: 'Insufficient balance' }, 400)

  user.balance = +(user.balance - amount).toFixed(2)
  await saveUser(c.env.STORAGE, user)

  const wd: Withdrawal = {
    id: uid('wd'),
    userId: user.id,
    username: user.username,
    method,
    destination,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    processedAt: null,
  }
  await c.env.STORAGE.put(`wd:${wd.id}`, JSON.stringify(wd))
  const listRaw = await c.env.STORAGE.get('wd:list') || '[]'
  const list: string[] = JSON.parse(listRaw)
  list.unshift(wd.id)
  await c.env.STORAGE.put('wd:list', JSON.stringify(list.slice(0, 500)))

  return c.json({ ok: true })
})

app.get('/withdrawals/me', authMiddleware, async (c) => {
  const listRaw = await c.env.STORAGE.get('wd:list') || '[]'
  const ids: string[] = JSON.parse(listRaw)
  const result: Withdrawal[] = []
  for (const id of ids) {
    const raw = await c.env.STORAGE.get(`wd:${id}`)
    if (!raw) continue
    const wd: Withdrawal = JSON.parse(raw)
    if (wd.userId === c.get('userId')) {
      result.push(wd)
      if (result.length >= 20) break
    }
  }
  return c.json({ ok: true, data: result })
})

app.put('/profile', authMiddleware, async (c) => {
  const body = await c.req.json<{ name: string }>()
  const user = await getUserById(c.env.STORAGE, c.get('userId'))
  if (!user) return c.json({ ok: false, msg: 'User not found' }, 404)
  user.name = (body.name || '').trim()
  await saveUser(c.env.STORAGE, user)
  const { password: _, ...safe } = user
  return c.json({ ok: true, data: safe })
})

app.put('/settings/email', authMiddleware, async (c) => {
  const body = await c.req.json<{ currentPassword: string; newEmail: string }>()
  const user = await getUserById(c.env.STORAGE, c.get('userId'))
  if (!user || user.password !== body.currentPassword) return c.json({ ok: false, msg: 'Current password incorrect' }, 400)
  const newEmail = (body.newEmail || '').trim().toLowerCase()
  if (!newEmail) return c.json({ ok: false, msg: 'Invalid email' }, 400)
  if (await getUserByEmail(c.env.STORAGE, newEmail)) return c.json({ ok: false, msg: 'Email already in use' }, 400)

  await c.env.STORAGE.delete(`email:${user.email}`)
  user.email = newEmail
  await saveUser(c.env.STORAGE, user)
  return c.json({ ok: true })
})

app.put('/settings/password', authMiddleware, async (c) => {
  const body = await c.req.json<{ currentPassword: string; newPassword: string }>()
  const user = await getUserById(c.env.STORAGE, c.get('userId'))
  if (!user || user.password !== body.currentPassword) return c.json({ ok: false, msg: 'Current password incorrect' }, 400)
  if (!body.newPassword || body.newPassword.length < 6) return c.json({ ok: false, msg: 'New password min 6 chars' }, 400)
  user.password = body.newPassword
  await saveUser(c.env.STORAGE, user)
  return c.json({ ok: true })
})

// ---------- Admin routes ----------
app.get('/admin/stats', authMiddleware, async (c) => {
  if (c.get('role') !== 'admin') return c.json({ ok: false, msg: 'Forbidden' }, 403)
  const ids = await listUserIds(c.env.STORAGE)
  let totalUsers = 0
  let totalBalance = 0
  for (const id of ids) {
    const u = await getUserById(c.env.STORAGE, id)
    if (u && u.role === 'user') {
      totalUsers++
      totalBalance += u.balance
    }
  }
  const listRaw = await c.env.STORAGE.get('wd:list') || '[]'
  const wdIds: string[] = JSON.parse(listRaw)
  let pending = 0
  for (const id of wdIds.slice(0, 100)) {
    const raw = await c.env.STORAGE.get(`wd:${id}`)
    if (raw && JSON.parse(raw).status === 'pending') pending++
  }
  const txRaw = await c.env.STORAGE.get('tx:recent') || '[]'
  return c.json({
    ok: true,
    data: {
      totalUsers,
      totalBalance: +totalBalance.toFixed(2),
      pendingWithdrawals: pending,
      totalTransactions: JSON.parse(txRaw).length,
    },
  })
})

app.get('/admin/users', authMiddleware, async (c) => {
  if (c.get('role') !== 'admin') return c.json({ ok: false, msg: 'Forbidden' }, 403)
  const ids = await listUserIds(c.env.STORAGE)
  const users: Omit<User, 'password'>[] = []
  for (const id of ids) {
    const u = await getUserById(c.env.STORAGE, id)
    if (u && u.role === 'user') {
      const { password: _, ...safe } = u
      users.push(safe)
    }
  }
  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return c.json({ ok: true, data: users })
})

app.post('/admin/balance', authMiddleware, async (c) => {
  if (c.get('role') !== 'admin') return c.json({ ok: false, msg: 'Forbidden' }, 403)
  const body = await c.req.json<{ userId: string; amount: number; action: 'add' | 'sub' }>()
  const amount = Number(body.amount)
  if (!body.userId || isNaN(amount) || amount <= 0) return c.json({ ok: false, msg: 'Invalid input' }, 400)

  const user = await getUserById(c.env.STORAGE, body.userId)
  if (!user || user.role === 'admin') return c.json({ ok: false, msg: 'User not found' }, 404)

  if (body.action === 'add') {
    user.balance = +(user.balance + amount).toFixed(2)
  } else {
    if (user.balance < amount) return c.json({ ok: false, msg: 'Insufficient user balance' }, 400)
    user.balance = +(user.balance - amount).toFixed(2)
  }
  await saveUser(c.env.STORAGE, user)

  const tx: Transaction = {
    id: uid('tx'),
    fromId: body.action === 'add' ? 'admin' : user.id,
    toId: body.action === 'add' ? user.id : 'admin',
    fromUsername: body.action === 'add' ? 'admin' : user.username,
    toUsername: body.action === 'add' ? user.username : 'admin',
    amount,
    type: body.action === 'add' ? 'admin_credit' : 'admin_debit',
    createdAt: new Date().toISOString(),
  }
  await c.env.STORAGE.put(`tx:${tx.id}`, JSON.stringify(tx))
  return c.json({ ok: true, data: { balance: user.balance } })
})

app.post('/admin/ban', authMiddleware, async (c) => {
  if (c.get('role') !== 'admin') return c.json({ ok: false, msg: 'Forbidden' }, 403)
  const body = await c.req.json<{ userId: string; ban: boolean }>()
  const user = await getUserById(c.env.STORAGE, body.userId)
  if (!user || user.role === 'admin') return c.json({ ok: false, msg: 'User not found' }, 404)
  user.banned = !!body.ban
  await saveUser(c.env.STORAGE, user)
  return c.json({ ok: true })
})

app.delete('/admin/users/:id', authMiddleware, async (c) => {
  if (c.get('role') !== 'admin') return c.json({ ok: false, msg: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const user = await getUserById(c.env.STORAGE, id)
  if (!user || user.role === 'admin') return c.json({ ok: false, msg: 'Cannot remove' }, 400)
  await c.env.STORAGE.delete(`user:${id}`)
  await c.env.STORAGE.delete(`username:${user.username}`)
  await c.env.STORAGE.delete(`email:${user.email}`)
  return c.json({ ok: true })
})

app.get('/admin/withdrawals', authMiddleware, async (c) => {
  if (c.get('role') !== 'admin') return c.json({ ok: false, msg: 'Forbidden' }, 403)
  const listRaw = await c.env.STORAGE.get('wd:list') || '[]'
  const ids: string[] = JSON.parse(listRaw)
  const result: Withdrawal[] = []
  for (const id of ids) {
    const raw = await c.env.STORAGE.get(`wd:${id}`)
    if (raw) result.push(JSON.parse(raw))
  }
  return c.json({ ok: true, data: result })
})

app.post('/admin/withdrawals/:id', authMiddleware, async (c) => {
  if (c.get('role') !== 'admin') return c.json({ ok: false, msg: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const body = await c.req.json<{ approve: boolean }>()
  const raw = await c.env.STORAGE.get(`wd:${id}`)
  if (!raw) return c.json({ ok: false, msg: 'Not found' }, 404)
  const wd: Withdrawal = JSON.parse(raw)
  if (wd.status !== 'pending') return c.json({ ok: false, msg: 'Already processed' }, 400)

  if (body.approve) {
    wd.status = 'approved'
  } else {
    const user = await getUserById(c.env.STORAGE, wd.userId)
    if (user) {
      user.balance = +(user.balance + wd.amount).toFixed(2)
      await saveUser(c.env.STORAGE, user)
    }
    wd.status = 'rejected'
  }
  wd.processedAt = new Date().toISOString()
  await c.env.STORAGE.put(`wd:${id}`, JSON.stringify(wd))
  return c.json({ ok: true })
})

export const onRequest = handle(app)
