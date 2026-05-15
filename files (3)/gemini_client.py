"""Google Gemini API client initialization and configuration."""

import google.generativeai as genai
from config import settings
import structlog

logger = structlog.get_logger()

_gemini_client = None


def get_gemini():
    """Get or initialize the Google Gemini client."""
    global _gemini_client
    if _gemini_client is None:
        genai.configure(api_key=settings.gemini_api_key)
        logger.info("Gemini client initialized")
    return genai


# Model configuration
# Using gemini-2.0-flash which has 1500 requests/day free tier
# (gemini-2.5-flash-lite only has 20 requests/day!)
GEMINI_VISION_MODEL = "gemini-2.0-flash"
GEMINI_TEXT_MODEL = "gemini-2.0-flash"

# Context settings
MAX_TOKENS = 4096
TIMEOUT_SECONDS = 60

# Available models for different use cases
GEMINI_MODELS = {
    "vision": "gemini-2.0-flash",
    "text": "gemini-2.0-flash",
    "multimodal": "gemini-2.0-flash",
}
