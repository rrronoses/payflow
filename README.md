# PayFlow – Send & Receive Money (TypeScript + Cloudflare KV)

Modern full-stack money transfer platform built with:

- **Frontend**: React + TypeScript (TSX) + Tailwind CSS + Vite
- **Backend**: Hono on Cloudflare Pages Functions
- **Storage**: Cloudflare **KV** (all users, sessions, transactions, withdrawals)

## Features

### User Panel
- Sign up (username + email + password)
- Login with **username or email** + password
- Dashboard with live balance & recent activity
- **Send Money** with live username suggestions
- **Receive Money** – copy username + QR code
- **Withdraw** to PayPal email or M-Pesa number (pending admin approval)
- Profile – set display name
- Settings – change email / password (requires current password)
- Logout

### Admin Panel
- Dashboard with real-time stats
- User list: view, add/subtract balance, ban/unban, remove
- Withdrawal management: Approve / Reject (reject auto-refunds)

## Demo Credentials
- **Admin**: `admin` / `admin123`
- Create regular users via Sign Up

## Setup & Deploy

### 1. Create KV Namespace
```bash
npx wrangler login
npx wrangler kv namespace create STORAGE
npx wrangler kv namespace create STORAGE --preview
```
Copy the IDs into `wrangler.toml`.

### 2. Install & Build
```bash
npm install
npm run build
```

### 3. Deploy to Cloudflare Pages
```bash
npx wrangler pages deploy dist
```

Or connect the GitHub repo in Cloudflare Dashboard → Pages → Create project.

**Important**: In the Pages project settings, bind the KV namespace:
- Variable name: `STORAGE`
- KV namespace: the one you created

### Local Development
```bash
# Terminal 1 – frontend
npm run dev

# Terminal 2 – functions (with KV)
npx wrangler pages dev dist --kv=STORAGE
```

## Project Structure
```
├── functions/api/[[route]].ts   # Hono API + KV logic
├── src/
│   ├── pages/                   # React TSX pages
│   ├── lib/api.ts               # API client
│   └── types.ts
├── wrangler.toml                # KV binding
└── package.json
```

All data is persisted in Cloudflare KV under keys like:
- `user:{id}`, `username:{name}`, `email:{email}`
- `session:{token}`
- `tx:{id}`, `wd:{id}`
- Index lists: `tx:recent`, `wd:list`

---

Built for Cloudflare Pages + KV.
