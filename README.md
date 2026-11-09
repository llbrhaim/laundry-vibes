# Laundry Vibes – Website + Backend

One app, one server: **Express** serves the API (`/api/...`) and your built **React** site.
Data lives in **MongoDB**. Hosting = one service + one database.

```
laundry-vibes/
├── frontend/   your React + Vite site (only vite.config.js was changed: dev proxy)
├── backend/    Express API + serves frontend/dist
└── package.json  (root scripts: build / start)
```

## 1. Free MongoDB (Atlas) – 5 minutes

1. Sign up at https://www.mongodb.com/atlas and create a **free (M0)** cluster.
2. **Database Access** → Add a database user (username + password). Save them.
3. **Network Access** → Add IP address → **Allow access from anywhere (0.0.0.0/0)**.
   (Required for most hosting platforms, which use changing IPs.)
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/laundryvibes?retryWrites=true&w=majority`
   Put your password in it, and keep `/laundryvibes` before the `?` (that's the database name).

## 2. Run on your computer

```bash
# backend settings
cd backend
cp .env.example .env        # then open .env and fill in the values
cd ..

# install everything + build the website
npm run build

# start (site + API) at http://localhost:4000
npm start
```

While **editing the frontend**, run two terminals instead:
`npm run dev:api` (backend on 4000) and `npm run dev:web` (Vite, with `/api` proxied to the backend).

WhatsApp button: create `frontend/.env` (copy `frontend/.env.example`) and set
`VITE_BUSINESS_WHATSAPP=91XXXXXXXXXX`, then run `npm run build` again.

## 3. Host it (Render – simplest)

1. Push this whole folder to a GitHub repository (`.env` is git-ignored, good).
2. On https://render.com → **New → Web Service** → pick your repo.
3. Fill in:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. **Environment Variables** (Add these):

| Name | Value |
|---|---|
| `MONGODB_URI` | your Atlas connection string |
| `SESSION_SECRET` | long random text (see below) |
| `ADMIN_USERNAME` | your admin username |
| `ADMIN_PASSWORD` | a strong password (10+ characters) |
| `NODE_VERSION` | `22` |
| `VITE_BUSINESS_WHATSAPP` | e.g. `919876543210` |

   Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

5. Deploy. Your site and admin panel are both at the URL Render gives you.
   Connect your own domain later in Render → Settings → Custom Domains.

> Railway, Fly.io, or any VPS work the same way: build with `npm run build`, start with `npm start`, set the same variables.
> Free Render services go to sleep after inactivity, so the first visit can take ~30 seconds. A paid plan removes that.

## 4. Using the admin panel

Click **Admin** on the site, sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
Add your services (name, category, price, unit) and offers. The public site updates immediately.
To change the admin password: change `ADMIN_PASSWORD` in your settings and restart/redeploy.

## API reference

Public: `GET /api/services` (active only), `GET /api/offers` (active and currently running only), `GET /api/health`

Admin (needs login cookie; all non-GET calls also need the `X-CSRF-Token` header, which the frontend already sends):

| Method | Path |
|---|---|
| POST | `/api/admin/login` · `/api/admin/logout` |
| GET | `/api/admin/me` · `/api/admin/services` · `/api/admin/offers` |
| POST | `/api/admin/services` · `/api/admin/offers` |
| PATCH | `/api/admin/services/:id` · `/api/admin/services/:id/price` · `/api/admin/services/:id/status` · `/api/admin/offers/:id` |
| DELETE | `/api/admin/services/:id` · `/api/admin/offers/:id` |

## Security built in

- Admin login compared in constant time; 10 attempts per 15 minutes per IP, then blocked
- HttpOnly, SameSite cookies (Secure automatically on HTTPS); sessions stored in MongoDB, expire after 8 hours
- CSRF token required on every write
- Only known fields are accepted; prices, URLs, icons and dates are validated
- `helmet` security headers and request rate limiting

## Troubleshooting

- **"Missing environment variables"** → fill in `backend/.env` (or the hosting dashboard).
- **"Failed to start: ... ECONNREFUSED / Server selection timed out"** → wrong `MONGODB_URI`, or Atlas Network Access doesn't allow your host (step 1.3).
- **Site shows "Live prices and offers will appear when the database is configured"** → the API isn't reachable; check the server logs.
- **Can't stay logged in locally** → open the site via `http://localhost:4000` (not a different host name).

## Tests (optional)

`npm --prefix backend test` runs a 21-step end-to-end check against a throw-away database
(set `TEST_MONGODB_URI` if your MongoDB is not on `127.0.0.1:27017`).
