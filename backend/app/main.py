import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import init_db, engine
from app.models import College
from app.services.badges import ensure_badges_seeded
from app.routers import registration, colleges, users, game, referral, projects, badges, analytics, events

app = FastAPI(
    title="CampusAI: The Placement Bug — API",
    description="Backend powering the gamified growth platform for the NxtWave AI Workshop challenge.",
    version="1.0.0",
)

origins = os.environ.get("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if origins == "*" else origins.split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    with Session(engine) as session:
        ensure_badges_seeded(session)
        has_colleges = session.exec(select(College)).first()
        if not has_colleges:
            from seed.seed_data import run_seed
            run_seed(session)


@app.get("/")
def root():
    return {
        "service": "CampusAI: The Placement Bug API",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(registration.router, prefix="/api")
app.include_router(colleges.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(game.router, prefix="/api")
app.include_router(referral.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(badges.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(events.router, prefix="/api")
