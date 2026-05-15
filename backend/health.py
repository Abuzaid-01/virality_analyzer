from fastapi import APIRouter
from config import settings
from supabase_client import get_supabase
from gemini_client import get_gemini
import structlog

router = APIRouter(prefix="/health", tags=["health"])
logger = structlog.get_logger()


@router.get("")
async def health_check():
    """System health check — verifies all dependencies."""
    status = {
        "status": "ok",
        "env": settings.app_env,
        "services": {}
    }

    # Check Supabase
    try:
        supabase = get_supabase()
        supabase.table("uploads").select("id").limit(1).execute()
        status["services"]["supabase"] = "ok"
    except Exception as e:
        status["services"]["supabase"] = f"error: {str(e)}"
        status["status"] = "degraded"

    # Check Gemini
    try:
        model = get_gemini()
        # Minimal ping - just check if API is configured
        status["services"]["gemini"] = "ok" if model else "error"
    except Exception as e:
        status["services"]["gemini"] = f"error: {str(e)}"
        status["status"] = "degraded"

    # Check Tavily
    status["services"]["tavily"] = "configured" if settings.tavily_api_key else "not configured (optional)"

    return status
