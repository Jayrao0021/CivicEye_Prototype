Notes: Do not commit .env or server/uploads. Use .env.example to configure environment variables.
# CivicEye

Crowdsourced civic issue reporting app.

- Frontend: React + Vite
- Backend: Express
- Database: MySQL (recommended) or in-memory fallback
- Media: photo/video uploads in local dev (`server/uploads/`)

## Requirements

- Node.js (latest LTS recommended)
- (Optional) MySQL Server + MySQL Workbench for permanent storage

## Quick Start (Local)

1. Install dependencies:
   - `npm install`
2. Start backend (Terminal 1):
   - `npm run server`
3. Start frontend (Terminal 2):
   - `npm run dev`
4. Open:
   - `http://localhost:5173`

If MySQL is not configured, the backend runs in `memory` mode (data resets on backend restart).

## MySQL Setup (Permanent Storage)

1. In MySQL Workbench, run `mysql-setup.sql` (lightning bolt).
2. Create a `.env` file in the project root (same folder as `package.json`) and fill in your credentials.
   - You can start by copying `.env.example` to `.env`.
3. Restart the backend.

In the UI, check the pill at the top:
- `Backend mode: mysql` means data is stored permanently.
- `Backend mode: memory` means data is temporary.

## Environment Variables

Backend (`server/index.js`):
- `PORT` (default `5000`)
- `CORS_ORIGIN` (comma-separated)
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

Frontend:
- `VITE_API_BASE` (default `http://localhost:5000`)

## Deployment (Public Link)

Making the GitHub repo public shares the code, but does not create a public website.

To give other devices a link, deploy:
- Frontend: Vercel / Netlify
- Backend: Railway / Render
- MySQL: a cloud MySQL database

Set:
- Frontend `VITE_API_BASE=https://<your-backend-domain>`
- Backend `CORS_ORIGIN=https://<your-frontend-domain>`

## Notes

- Local uploads are saved to `server/uploads/` in dev.
- For public deployments, store uploads in Cloudinary/S3 and save only URLs in MySQL.
