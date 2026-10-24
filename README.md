# FixOps AI

FixOps AI is a maintenance operations dashboard for equipment, work orders, alerts, sensor readings, and AI-assisted diagnostics.

## Requirements

- Node.js 22 or later
- MongoDB running locally, or a MongoDB connection string
- A Gemini API key for live AI diagnostics

## Run locally

Install the frontend dependencies from the project root:

```powershell
npm install
```

Configure and start the backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Set `GEMINI_API_KEY` in `backend/.env` to a key created in Google AI Studio. Keep this file private; it is excluded from Git. Then start the backend:

```powershell
npm run dev
```

In a second terminal, from the project root, start the frontend:

```powershell
npm run dev
```

Open <http://localhost:5173>. The backend health endpoint is <http://localhost:5000/api/health>.

The backend uses the local MongoDB database `fixops` by default. Set `MONGODB_URI` in `backend/.env` to use another database. If `GEMINI_API_KEY` is not configured, AI diagnostics run in demo mode.

## Security

- Never commit `.env` files or put API keys in frontend code.
- The seeded demo accounts are for local development only. Configure real authentication and credentials before deploying this application.
- Set a persistent, unique `JWT_SECRET` for deployments. Without one, the backend generates a temporary secret on startup.
