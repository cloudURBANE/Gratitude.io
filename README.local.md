# Local Development Setup

This project bundles an Express + Vite (React) app with Drizzle ORM and Postgres. Use this guide to run everything locally, independent from Vercel/Railway.

## Prerequisites
- Node.js 20+
- Docker + Docker Compose

## 1) Configure environment
Copy the example env and adjust if needed:

```bash
cp .env.example .env
```

The default `DATABASE_URL` points to the Postgres container started in the next step.

## 2) Start Postgres locally
```bash
docker compose up -d db
```
Optional DB UI at `http://localhost:8081`:
```bash
docker compose up -d pgweb
```

## 3) Install dependencies
```bash
npm install
```

## 4) Create schema (Drizzle)
```bash
npx drizzle-kit push
```

## 5) Run the app (dev)
```bash
npm run dev
```
- Backend + Vite dev server are served together on `http://localhost:5000`
- API base path: `/api/*`

## 6) Build and run (prod-like)
```bash
npm run build
npm start
```
This builds the client to `dist/public` and runs the bundled server from `dist`.

## Notes
- Third-party integrations (Stripe, OpenAI, Google Cloud) are optional for local dev. Leave keys empty or set sandbox keys in `.env`.
- If you change DB creds/port, update `DATABASE_URL` in `.env` and re-run migrations.
- Replit/Vercel-specific plugins are ignored in local dev.