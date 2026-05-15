import json
import structlog
from groq import Groq
from config import settings
from state import AgentState
from response import TrendAnalysis

logger = structlog.get_logger()

GROQ_MODEL = "llama-3.3-70b-versatile"

TREND_SYSTEM_PROMPT = """You are a viral content trend analyst who knows what's trending on every major social platform.
You combine real-time trend data with deep platform algorithm knowledge to predict virality.
Always respond with valid JSON only. No markdown, no preamble."""

TREND_PROMPT = """Based on current trends data below, analyze viral potential for this content:

Platform: {platform}
Niche: {niche}
Content Type: {content_type}
Caption preview: {caption_preview}
Visual themes detected: {visual_themes}

CURRENT TRENDS DATA:
{trends_data}

Return a JSON object with EXACTLY this structure:
{{
  "trend_alignment_score": <0-100 int>,
  "trend_summary": "<2-3 sentences: how well does this align with current trends>",
  "trending_hashtags": ["<15 most relevant hashtags for {platform} right now>"],
  "trending_audio_suggestions": ["<5 trending audio/sounds that fit this content>"],
  "competitor_insights": "<what top performing content in this niche does differently>",
  "best_posting_times": ["<3 best times to post, e.g. 'Tuesday 7-9 PM EST'>"],
  "platform_specific_tips": ["<3-5 tips specific to {platform} algorithm right now>"]
}}

Focus on actionable, specific, current recommendations. Not generic advice."""


async def _fetch_trends_with_tavily(niche: str, platform: str) -> str:
    """Use Tavily to search for current trends if API key available."""
    if not settings.tavily_api_key:
        return _get_fallback_trends(niche, platform)

    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=settings.tavily_api_key)

        queries = [
            f"trending {niche} content {platform} 2025",
            f"viral {platform} {niche} hashtags trending now",
            f"best performing {niche} videos {platform} this week",
        ]

        results = []
        for query in queries:
            response = client.search(
                query=query,
                search_depth="basic",
                max_results=3,
            )
            for r in response.get("results", []):
                results.append(f"- {r.get('title', '')}: {r.get('content', '')[:300]}")

        return "\n".join(results) if results else _get_fallback_trends(niche, platform)

    except Exception as e:
        logger.warning("Tavily search failed, using fallback", error=str(e))
        return _get_fallback_trends(niche, platform)


def _get_fallback_trends(niche: str, platform: str) -> str:
    """Static fallback trends data when Tavily not available."""
    return f"""
Current platform trends for {platform} in {niche} niche (knowledge base):
- Short-form videos under 30s are getting 3x more reach
- POV-style content and 'day in my life' formats trending strongly
- Trending sounds change weekly — use songs in top 50 charts
- Text overlays in first 2 seconds dramatically increase watch time
- Controversial or surprising hooks get 40% more shares
- Raw, authentic content outperforms highly produced content
- Duet/stitch formats increase reach via algorithm push
- Posting between 6-9 PM local time shows highest engagement
- Educational quick-tips ('3 things I wish I knew') performing very well
- Comment-bait endings ('comment X if you want part 2') boosts engagement
"""


async def trend_agent(state: AgentState) -> AgentState:
    """
    Agent 2: Trend Agent (using Groq / Llama 3 + Tavily)
    
    - Searches web for current trending content in the niche/platform using Tavily
    - Asks Groq to match content against trends
    - Suggests hashtags, audio, posting times
    - Writes TrendAnalysis to state
    """
    logger.info("Trend agent starting (Groq/Llama)", platform=state.platform, niche=state.niche)

    # Initialize Groq
    client = Groq(api_key=settings.groq_api_key)

    # Extract visual themes from vision analysis if available
    visual_themes = []
    if state.visual_analysis:
        visual_themes = state.visual_analysis.detected_emotions or []
        visual_themes += state.visual_analysis.detected_text_on_screen or []

    # Fetch live trend data using Tavily
    trends_data = await _fetch_trends_with_tavily(
        niche=state.niche or "general",
        platform=state.platform.value,
    )

    try:
        prompt_content = TREND_PROMPT.format(
            platform=state.platform.value,
            niche=state.niche or "general",
            content_type=state.content_type.value,
            caption_preview=(state.caption or "")[:200],
            visual_themes=", ".join(visual_themes) if visual_themes else "not analyzed yet",
            trends_data=trends_data,
        )

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": TREND_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt_content
                }
            ],
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        raw = chat_completion.choices[0].message.content.strip()

        data = json.loads(raw)
        state.trend_analysis = TrendAnalysis(**data)

        logger.info(
            "Trend agent complete",
            platform=state.platform.value,
            trend_score=state.trend_analysis.trend_alignment_score,
            hashtags=len(state.trend_analysis.trending_hashtags),
        )

    except Exception as e:
        logger.error("Trend agent error", error=str(e))
        state.errors.append(f"trend_agent: {str(e)}")
        state.trend_analysis = TrendAnalysis(
            trend_alignment_score=50,
            trend_summary="Could not fetch trend data.",
            trending_hashtags=[f"#{state.niche or 'viral'}", "#trending", "#fyp"],
            trending_audio_suggestions=["trending_sound_1", "trending_sound_2"],
            competitor_insights="Unable to analyze at this time.",
            best_posting_times=["Wednesday 7-9 PM", "Friday 6-8 PM", "Sunday 8-10 AM"],
            platform_specific_tips=["Add captions", "Use trending sounds", "Keep under 30 seconds"],
        )

    return state
