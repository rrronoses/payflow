# PayFlow – Send & Receive Money Platform

A modern, beautiful peer-to-peer money transfer web application with full **User Panel** and **Admin Panel**.

## Features

### User
- Sign up with username, email & password
- Login with **username or email** + password
- Dashboard with balance and recent activity
- **Send Money** – type username → live suggestions → transfer
- **Receive Money** – copy username + QR code barcode
- **Withdraw** – PayPal email or M-Pesa number (pending admin approval)
- Profile – set display name
- Settings – change email (requires current password) / change password (requires current password)
- Logout

### Admin
- Secure admin login
- Dashboard with key stats (users, total balance, pending withdrawals, transactions)
- Full User List:
  - View detailed profile
  - Add / Subtract balance
  - Ban / Unban
  - Remove user
- Withdrawal management – Approve or Reject (rejection auto-refunds the user)

## Tech
- Pure HTML + Tailwind CSS (CDN) + Vanilla JS
- localStorage for data (perfect for Cloudflare Pages static hosting)
- QR code generation for receive

> **Note**: This is a fully functional demo. Data lives in the browser’s localStorage. For real multi-user production use, connect a backend (Cloudflare D1 + Workers recommended).

## Demo Credentials
- **Admin**: `admin` / `admin123`
- Create your own user accounts via Sign Up

## Deploy to Cloudflare Pages

1. Push this repository to GitHub
2. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/?to=/:account/pages)
3. Create a new project → Connect to Git → select this repo
4. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/` (or leave default)
5. Deploy!

Every push to `main` will automatically redeploy.

## Local Preview
Just open `index.html` in any modern browser, or serve with any static server:

```bash
npx serve .
```

---

Built with ❤️ for instant money transfers.
