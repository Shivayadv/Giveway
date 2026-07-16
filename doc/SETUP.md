# Phase 1 — Setup Guide

## Step 1: MongoDB Atlas

1. Go to cloud.mongodb.com → create a free M0 cluster
2. Create a database user (username + password)
3. Whitelist your IP (or use 0.0.0.0/0 for dev)
4. Copy the connection string

## Step 2: Configure Environment Variables

**Backend** — edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/giveway?retryWrites=true&w=majority
JWT_SECRET=pick_any_long_random_string_at_least_32_chars
```

**Frontend** — edit `.env.local`:
```
JWT_SECRET=same_value_as_backend
FASTAPI_URL=http://localhost:8000
```

> JWT_SECRET MUST be identical in both files — the frontend verifies the tokens the backend signs.

## Step 3: Seed the Admin

```bash
cd backend
venv\Scripts\python seed.py
```
Output: `Admin created: admin@giveway.com / Admin@1234`

## Step 4: Start the Backend

```bash
cd backend
venv\Scripts\uvicorn main:app --reload --port 8000
```
Open http://localhost:8000/docs to see the Swagger UI.

## Step 5: Start the Frontend

```bash
npm run dev
```
Open http://localhost:3000

## Test the Auth Flow

| Action | URL |
|--------|-----|
| Register as user | http://localhost:3000/register |
| Register as brand | http://localhost:3000/register (click Brand Partner) |
| Login | http://localhost:3000/login |
| Admin login | admin@giveway.com / Admin@1234 |
| User dashboard | redirected automatically after login |
| Logout | Logout button in navbar |
