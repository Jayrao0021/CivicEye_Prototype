# CivicEye

Local-first civic issue reporting app (React + Vite frontend, Express backend, MySQL optional).

## Requirements

- Node.js (recommended: latest LTS)
- MySQL Server (optional but recommended for permanent storage)

## Run Locally

1. Install deps:
   - `npm.cmd install`
2. Start backend:
   - `npm.cmd run server`
3. Start frontend:
   - `npm.cmd run dev`
4. Open:
   - `http://localhost:5173`

## MySQL Setup (Permanent Storage)

1. Create tables:
   - Run `C:\Users\jay\civiceye\mysql-setup.sql` in MySQL Workbench (lightning bolt).
2. Set environment variables:
   - Copy `.env.example` to `.env` and fill in `MYSQL_PASSWORD`.
3. Restart backend.

In the UI, check the pill at the top:
- `Backend mode: mysql` means data is being stored permanently.
- `Backend mode: memory` means data is temporary (lost when server restarts).

## Environment Variables

Backend (used by `server/index.js`):
- `PORT` (default `5000`)
- `CORS_ORIGIN` (comma-separated, example: `http://localhost:5173,https://your-frontend-domain`)
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

Frontend:
- `VITE_API_BASE` (example: `http://localhost:5000` or your deployed backend URL)

## Notes

- Complaint media upload (photo/video) is stored in `server/uploads/` for local dev.
- For real deployments, don’t store uploads on the server filesystem; use an object store (S3/Cloudinary/Supabase Storage).
- Do not commit .env or server/uploads. Use .env.example to configure environment variables.
