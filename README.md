# ✦ MemoryMap — Travel Journal

> Log your travels, pin your memories, and share the world you've explored.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ (Standalone), NgRx, Angular Material, Tailwind |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM + PostGIS |
| Cache | Redis |
| Auth | Google OAuth 2.0 + JWT (access + refresh tokens) |
| Media | Cloudinary (photos + CDN) |
| Maps | Leaflet.js / Mapbox GL |

---

## Project Structure

```
memorymap/
├── backend/                   # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma      # Full DB schema
│   └── src/
│       ├── config/            # Env config + Passport strategies
│       ├── controllers/       # Route handlers
│       ├── middleware/        # Auth, validation, error handling
│       ├── models/            # (Types via Prisma)
│       ├── routes/            # Express routers
│       ├── services/          # Business logic
│       └── utils/             # Logger, JWT, Prisma client, ApiError
│
└── frontend/                  # Angular 17+ app
    └── src/app/
        ├── core/
        │   ├── guards/        # authGuard, guestGuard
        │   ├── interceptors/  # JWT attach + 401 refresh
        │   └── services/      # AuthService
        ├── features/
        │   ├── auth/          # Login, Register, OAuth callback
        │   ├── dashboard/     # Home screen + stats
        │   ├── trips/         # Trip CRUD (Phase 2)
        │   ├── map/           # Interactive world map (Phase 3)
        │   ├── timeline/      # Memory timeline (Phase 4)
        │   └── share/         # Public journal links (Phase 5)
        ├── shared/            # Reusable components, pipes, directives
        └── store/             # NgRx: auth state
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- A Google Cloud project (for OAuth)
- A Cloudinary account (free tier works)

---

### 1. Clone & install

```bash
git clone https://github.com/yourname/memorymap.git
cd memorymap

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2. Set up the database

```bash
# Create a PostgreSQL database
createdb memorymap_db

# Enable PostGIS extension (run in psql)
psql memorymap_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

---

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
# Edit .env with your values (DB URL, Google OAuth keys, Cloudinary, JWT secrets)
```

**Required values to fill in:**

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your local PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Generate: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Generate: `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `CLOUDINARY_*` | [Cloudinary Dashboard](https://cloudinary.com/console) |

**Google OAuth setup:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add Authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`

---

### 4. Run Prisma migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

---

### 5. Start development servers

```bash
# Terminal 1 — Backend (runs on :3000)
cd backend && npm run dev

# Terminal 2 — Frontend (runs on :4200)
cd frontend && npm start
```

Open **http://localhost:4200** in your browser.

---

## API Reference (Phase 1)

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register with email + password |
| `POST` | `/api/v1/auth/login` | Login with email + password |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Invalidate session |
| `GET`  | `/api/v1/auth/google` | Redirect to Google OAuth |
| `GET`  | `/api/v1/auth/google/callback` | Google OAuth callback |
| `GET`  | `/api/v1/auth/me` | Get current user (🔒 auth required) |
| `GET`  | `/health` | Health check |

---

## Roadmap

- **Phase 1** ✅ — Project scaffold, auth (Google OAuth + JWT), Angular shell + dashboard
- **Phase 2** — Trip CRUD, rich text editor (Tiptap), photo upload pipeline
- **Phase 3** — Leaflet/Mapbox interactive world map, location pinning
- **Phase 4** — Stats dashboard, memory timeline, countries heatmap
- **Phase 5** — Public sharing, OG image generation, privacy controls

---

## License

MIT
