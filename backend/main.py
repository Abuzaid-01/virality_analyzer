from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from config import settings
import upload
import analyze
import health
from graph import get_graph  # Pre-warm the graph at startup

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown logic."""
    # Pre-warm LangGraph pipeline so first request isn't slow
    get_graph()
    logger.info("Go Viral API started", env=settings.app_env, port=settings.app_port)
    yield
    logger.info("Go Viral API shutting down")


app = FastAPI(
    title="Go Viral — AI Virality Analyzer API",
    description="Multi-agent AI system that scores viral potential of videos and images.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(upload.router)
app.include_router(analyze.router)


@app.get("/")
async def root():
    return {
        "name": "Go Viral API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
