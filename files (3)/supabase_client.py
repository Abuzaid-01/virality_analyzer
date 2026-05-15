from supabase import create_client, Client
from config import settings
import structlog

logger = structlog.get_logger()

_supabase_client: Client | None = None


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,  # service role for server-side ops
        )
        logger.info("Supabase client initialized", url=settings.supabase_url)
    return _supabase_client
