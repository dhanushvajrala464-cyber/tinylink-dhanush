# TinyLink - URL Shortener (Next.js + Postgres)

Small URL shortener built for Aganitha take-home exercise.

## Features
- Create short links (optional custom code 6-8 alphanumeric)
- Redirect `/[code]` via 302 and increment click count
- List links and view link stats (`/code/[code]`)
- Delete links (DELETE /api/links/:code)
- Health check: `/api/healthz`

## Run locally
1. Create Postgres and set `DATABASE_URL`.
2. Run SQL migration to create table.
3. Install deps: `npm install`
4. Start dev server: `npm run dev`

## Deployment (Vercel + Neon)
Follow the instructions in the assignment conversation.
