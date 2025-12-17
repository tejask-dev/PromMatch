"""
Prom Matchmaking API - Enterprise Edition
Built with FastAPI + Supabase + pgvector

Features:
- AI-powered matching using sentence transformers
- Vector similarity search at database level
- Super Like system
- Gender & Grade preferences
- Rate limiting & security
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys

from app.core.config import get_settings
from app.api.endpoints import users, matches, questionnaire
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

settings = get_settings()

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    logger.info("🚀 Starting Prom Matchmaking API...")
    logger.info(f"📦 Version: {settings.VERSION}")
    logger.info(f"🔗 Supabase URL: {settings.SUPABASE_URL}")
    logger.info(f"🌐 CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    
    # Initialize services on startup
    from app.services.database import DatabaseService
    from app.services.embeddings import EmbeddingsService
    
    try:
        db = DatabaseService()
        logger.info("✅ Database service initialized")
        
        embeddings = EmbeddingsService()
        logger.info("✅ Embeddings service initialized")
    except Exception as e:
        logger.error(f"❌ Service initialization failed: {e}")
        raise
    
    yield
    
    logger.info("👋 Shutting down Prom Matchmaking API...")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Prom Matchmaking API with AI-powered matching",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )

# Include routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(matches.router, prefix="", tags=["Matching"])
app.include_router(questionnaire.router, prefix="", tags=["Questionnaire"])

# Health check endpoints
@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    from app.services.database import DatabaseService
    
    try:
        db = DatabaseService()
        # Simple query to verify DB connection
        result = db.client.table("users").select("id").limit(1).execute()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": settings.VERSION,
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )