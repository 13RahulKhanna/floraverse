from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import init_db
from app.routers import ai, auth, blog, contact, garden, learn, ngos, opportunities, outreach, plants
from app.uploads import upload_dir


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        init_db()
    except Exception as exc:  # pragma: no cover - only hit when Postgres is unreachable
        # Don't hard-crash app startup (e.g. under pytest with a stubbed session dependency,
        # or any environment where the real DB isn't reachable yet) — routes that actually
        # need the DB will fail clearly on their own when called.
        print(f"Warning: init_db() failed at startup: {exc}")
    upload_dir()  # ensure the uploads directory exists
    yield


app = FastAPI(title="FloraVerse API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(upload_dir())), name="uploads")

app.include_router(auth.router)
app.include_router(plants.router)
app.include_router(garden.router)
app.include_router(ai.router)
app.include_router(learn.router)
app.include_router(contact.router)
app.include_router(blog.router)
app.include_router(ngos.router)
app.include_router(opportunities.router)
app.include_router(outreach.router)


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok"}


@app.get("/api/v1/config")
def public_config() -> dict:
    return {
        "appName": "FloraVerse",
        "aiFeaturesEnabled": bool(settings.plant_id_api_key),
    }
