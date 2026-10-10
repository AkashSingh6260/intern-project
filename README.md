# Store Rating Platform

A small app for managing stores and ratings. It has separate dashboards for admins, store owners, and users.

## Run locally

You need Node.js and MongoDB running.

1. Set up the backend:

   ```powershell
   cd backend
   npm install
   Copy-Item .env.example .env
   ```

   Update `MONGODB_URI` and `JWT_SECRET` in `.env`, then start the server:

   ```powershell
   npm run dev
   ```

2. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Open the local address printed by Vite, usually `http://localhost:5173`.