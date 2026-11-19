# FloraVerse — Explore the World of Plants

A botanical encyclopedia with species profiles, an AI-powered plant identification and
health-assessment tool, plant comparison, a personal "My Garden" tracker, a conservation
action guide, a community blog, and an NGO directory with outreach.

## Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS, in `apps/web`.
- **Backend**: FastAPI (Python) + SQLModel + PostgreSQL, in `apps/api`.
- **AI identification/health**: integrates with [Plant.id (Kindwise)](https://platform.plant.id/) —
  the one provider that does both plant ID *and* disease/health assessment from a photo.
  **Requires your own API key** (`PLANT_ID_API_KEY`). Without it, `/api/v1/ai/*` endpoints
  return a clear `503` explaining AI features aren't configured — they never fabricate a
  result. See `apps/api/app/ai_client.py` for the integration and its honesty note: it was
  written against Plant.id's documented v3 API shape without a live docs fetch or a real
  key to test end-to-end, so verify the actual response shape against a real key before
  relying on it in production.

## Local setup

```bash
# 1. Database
docker compose -f infra/docker/docker-compose.dev.yml up -d   # Postgres on :5433

# 2. Backend
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in values, see below
python -m app.seed      # creates tables + seeds 29 plants, 10 articles
uvicorn app.main:app --reload --port 8000

# 3. Frontend (separate terminal)
cd apps/web
pnpm install
pnpm dev                # http://localhost:5173
```

## Environment variables

**Backend** (`apps/api/.env`):
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql+psycopg://user:pass@host:port/db` |
| `JWT_SECRET` | Yes | Generate with `openssl rand -hex 32` for production |
| `APP_ORIGIN` | Yes | Frontend origin, for CORS |
| `PLANT_ID_API_KEY` | No | Omit to run everything except AI identify/health |

**Frontend** (`apps/web/.env`):
| Variable | Required | Notes |
|---|---|---|
| `VITE_API_ORIGIN` | Yes | Backend API origin |

## Tests

```bash
cd apps/api && source .venv/bin/activate && python -m pytest -q   # 57 tests
cd apps/web && pnpm exec tsc --noEmit -p tsconfig.app.json && pnpm build
```

## What's genuinely done vs. known limitations

**Done and tested**: full REST API (auth, plant encyclopedia with search/filter/pagination,
comparison, My Garden with watering/growth logs, Learn Botany articles, contact form,
community blog with garden-progress posts linkable to a specific plant, an NGO directory
with registration/opportunities/outreach messaging), 29 real curated plant profiles
spanning all 19 required categories, 10 original educational articles, a 4-wave
Conservation Guide, all required pages, JWT auth, and the AI endpoints' honest
not-configured behavior — all verified both via automated tests (57 passing) and a live
click-through in a browser, including a full write → read NGO outreach loop (register an
NGO, post an opportunity, send a message as another visitor, confirm it lands in the NGO's
inbox).

**Known limitations**:
- The plant catalog is a curated starter set (29 species), not "thousands" — the schema is
  built to extend indefinitely (`apps/api/app/seed_data.py`), but seeding thousands of
  species with verified-accurate data wasn't attempted, since fabricating facts for
  species not carefully researched would violate the project's own "no invented facts"
  requirement.
- No real images — `image_url` is `null` for all seeded plants (no image hosting/CDN was
  set up); the UI shows an honest category-tinted placeholder rather than a fake photo.
- The AI integration is implemented correctly against Plant.id's documented API shape but
  was never exercised against a real key end-to-end (no key was available in this
  environment) — the parsing logic is unit-tested against representative mock responses,
  but confirm the real response shape matches before production use.
- Contact form messages are stored in the database, not emailed — no email provider is
  configured.
