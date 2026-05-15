import anthropic
from config import settings
import structlog

logger = structlog.get_logger()

_anthropic_client: anthropic.Anthropic | None = None


def get_anthropic() -> anthropic.Anthropic:
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        logger.info("Anthropic client initialized")
    return _anthropic_client


# Model constant — always Sonnet for best vision + reasoning balance
CLAUDE_MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096
