"""
Prom Matchmaking API
FastAPI + Supabase + pgvector
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
import logging
import sys
import time

from app.core.config import get_settings
from app.core.limiter import limiter
from app.api.endpoints import users, matches, questionnaire
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ─── Security Headers Middleware ─────────────────────────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        # Only send HSTS if we're behind HTTPS (Render handles TLS termination)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


# ─── Request Logging Middleware ───────────────────────────────────────────────

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        # Never log Authorization header values
        response = await call_next(request)
        duration_ms = round((time.time() - start) * 1000)
        ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
        logger.info(
            f"{request.method} {request.url.path} "
            f"status={response.status_code} ip={ip} duration={duration_ms}ms"
        )
        if response.status_code >= 400:
            logger.warning(
                f"Error response: {request.method} {request.url.path} "
                f"status={response.status_code} ip={ip}"
            )
        return response


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Prom Matchmaking API...")
    logger.info(f"Version: {settings.VERSION}")
    # Do NOT log secrets or full URLs at startup

    from app.services.database import DatabaseService
    from app.services.embeddings import EmbeddingsService

    try:
        db = DatabaseService()
        logger.info("Database service initialized")
        embeddings = EmbeddingsService()
        logger.info("Embeddings service initialized")

        if not settings.SUPABASE_JWT_SECRET:
            logger.warning(
                "SUPABASE_JWT_SECRET is not set — JWT signature verification is DISABLED. "
                "Set this variable in production immediately."
            )
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        raise

    yield
    logger.info("Shutting down Prom Matchmaking API...")


# ─── App ──────────────────────────────────────────────────────────────────────

# Disable interactive docs in production
_docs_url = "/docs" if settings.DEBUG else None
_redoc_url = "/redoc" if settings.DEBUG else None

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security & logging middleware (added first = outermost layer)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# CORS — only allow specific origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# ─── Global Exception Handler ─────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log full traceback server-side but never return it to the client
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "An unexpected error occurred"})


# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(matches.router, prefix="", tags=["Matching"])
app.include_router(questionnaire.router, prefix="", tags=["Questionnaire"])


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"name": settings.PROJECT_NAME, "version": settings.VERSION, "status": "healthy"}


@app.get("/health", tags=["Health"])
async def health_check():
    from app.services.database import DatabaseService
    try:
        db = DatabaseService()
        db.client.table("users").select("id").limit(1).execute()
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"  # Don't expose error details externally

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": settings.VERSION,
        "database": db_status,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
