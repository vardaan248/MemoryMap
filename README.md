# MemoryMap

MemoryMap is a travel journal app with:

- Angular frontend in `frontend/`
- Node.js + Express + TypeScript backend in `backend/`
- PostgreSQL database managed through Prisma

This README is focused on helping developers run both backend and frontend locally.

## Stack

- Frontend: Angular 17, NgRx, Angular Material, Leaflet, Tiptap
- Backend: Express, TypeScript, Prisma, Passport (Google OAuth), JWT
- Database: PostgreSQL
- Media: Cloudinary

## Project Structure

```txt
memorymap/
    backend/
        prisma/
            schema.prisma
            migrations/
        src/
    frontend/
        src/
```

## Prerequisites

Install these before starting:

1. Node.js 20+
2. npm 10+
3. PostgreSQL 14+
4. Google OAuth credentials (for Google login)
5. Cloudinary credentials (required by backend config)

Notes:

- Redis is listed in dependencies, but there is no active Redis runtime usage in current backend code.
- SendGrid is optional right now (`SENDGRID_API_KEY` is not required at startup).

## Local Development Setup

### 1. Clone and install dependencies

From the repo root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Create local PostgreSQL database

Create a database named `memorymap_db` (or use any name you prefer).

Example with psql:

```bash
createdb memorymap_db
```

You do not need PostGIS for the current schema/migrations.

### 3. Configure backend environment variables

In `backend/`:

```bash
cp .env.example .env
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update `backend/.env`.

Required variables for backend startup:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Recommended local values:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
DATABASE_URL="postgresql://memorymap_user:your_password@localhost:5432/memorymap_db?schema=public"
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
CLIENT_URL=http://localhost:4200
CLIENT_AUTH_CALLBACK_URL=http://localhost:4200/auth/callback
```

Generate JWT secrets (example commands):

```bash
openssl rand -hex 32
openssl rand -hex 32
```

### 4. Run Prisma migrations

In `backend/`:

```bash
npx prisma migrate dev
npx prisma generate
```

Optional:

```bash
npx prisma studio
```

### 5. Start backend

In `backend/`:

```bash
npm run dev
```

Backend default URL:

- API base: `http://localhost:3000/api/v1`
- Health check: `http://localhost:3000/health`

### 6. Start frontend

In a second terminal, from `frontend/`:

```bash
npm start
```

Frontend default URL:

- App: `http://localhost:4200`

The frontend dev environment is configured to call backend at `http://localhost:3000/api/v1`.

## Google OAuth Local Setup

In Google Cloud Console, configure OAuth client with:

1. Authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`
2. Authorized JavaScript origin: `http://localhost:4200`

Use the generated client ID/secret in `backend/.env`.

## Common Commands

### Backend (`backend/package.json`)

- `npm run dev` - Start backend in watch mode with `ts-node` and `nodemon`
- `npm run build` - Compile TypeScript to `dist/`
- `npm start` - Run compiled backend from `dist/server.js`
- `npm run prisma:migrate` - Run Prisma migration in dev mode
- `npm run prisma:generate` - Regenerate Prisma client
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Lint backend TypeScript files

### Frontend (`frontend/package.json`)

- `npm start` - Start Angular dev server on port 4200
- `npm run build:dev` - Development build
- `npm run build` - Production build
- `npm run test` - Run unit tests
- `npm run lint` - Run linting

## Expected Local Ports

- Frontend: `4200`
- Backend: `3000`
- PostgreSQL: `5432` (default)

## Troubleshooting

### Backend exits immediately with missing env error

Cause: required variables are missing in `backend/.env`.

Fix: fill every required key listed above before running `npm run dev`.

### Prisma migration fails to connect to DB

Cause: invalid `DATABASE_URL` or PostgreSQL not running.

Fix:

1. Ensure PostgreSQL service is running
2. Verify DB exists (`memorymap_db` or your chosen DB)
3. Verify user/password in `DATABASE_URL`

### Frontend cannot call backend (CORS or network error)

Cause: backend not running or `CLIENT_URL` mismatch.

Fix:

1. Ensure backend is running on port 3000
2. Ensure `CLIENT_URL=http://localhost:4200` in backend `.env`
3. Restart backend after env changes

### Google login redirects to failure

Cause: OAuth callback URL mismatch between Google Console and backend env.

Fix: ensure both are exactly:

- `http://localhost:3000/api/v1/auth/google/callback`

## API Quick Check

After backend starts, verify health:

```bash
curl http://localhost:3000/health
```

Expected response includes:

- `status: "ok"`
- current `env`
- `timestamp`

## License

MIT
