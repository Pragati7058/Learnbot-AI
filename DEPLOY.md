# LearnBot — Production Deployment

## Stack

| Part | Host | URL |
|------|------|-----|
| Frontend (Vite/React) | [Vercel](https://vercel.com) | `https://learnbot-ai.vercel.app` (your project) |
| Backend (Express) | [Render](https://render.com) | `https://learnbot-ai-mc1y.onrender.com` |
| Database | MongoDB Atlas | connection string in `MONGO_URI` |

## 1. Backend (Render)

1. Create a **Web Service** from this repo; set **Root Directory** to `server`.
2. **Build command:** `npm install`
3. **Start command:** `npm start`
4. Set environment variables:

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas URI |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | `https://learnbot-ai.vercel.app,http://localhost:5173` |
| `MAIL_USER` / `MAIL_PASS` | optional (reminders) |
| `CRON_SECRET` | random string |

`CLIENT_URL` must include your exact Vercel URL (no trailing slash). All `*.vercel.app` origins are allowed automatically.

Health check: `GET /api/health`

## 2. Frontend (Vercel)

1. Import the repo; set **Root Directory** to `client`.
2. Framework: **Vite** (or use existing `vercel.json`).
3. Environment variable:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://learnbot-ai-mc1y.onrender.com` |

4. Deploy. Do **not** commit real API keys in `.env.production`; set them in the Vercel dashboard.

## 3. Local development

```bash
# Terminal 1 — API
cd server
cp .env.example .env   # fill in values
npm install
npm run dev

# Terminal 2 — UI
cd client
cp .env.example .env.local
# VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Vite proxies `/api` to port 5000 in dev (`vite.config.js`).

## 4. CORS troubleshooting

If the browser shows a CORS error:

1. Confirm `VITE_API_URL` has **no trailing slash**.
2. On Render, set `CLIENT_URL` to your live Vercel URL.
3. Redeploy the API after changing env vars.
4. Check Render logs for `[CORS] Blocked origin:` lines.

## 5. Theme

The app uses a **black & white** monochrome theme with **white glow** effects (`client/src/utils/theme.js`). Dark/light mode is in **Theme** panel.
