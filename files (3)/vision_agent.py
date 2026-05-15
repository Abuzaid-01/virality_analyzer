"""
Vision Agent using Google Gemini API
- Analyzes video files directly (no frame extraction needed)
- Evaluates: hook, thumbnail, pacing, visual quality
- Returns VisualAnalysis with detailed scores and feedback
"""

import json
import httpx
import structlog
import google.generativeai as genai
from config import settings
from gemini_client import GEMINI_VISION_MODEL
from state import AgentState
from response import VisualAnalysis

logger = structlog.get_logger()

VISION_SYSTEM_PROMPT = """You are an elite social media content analyst with 10+ years of experience at top agencies.
You analyze content with extreme detail — every visual element matters for virality.

Your job is TWO-FOLD:
1. SCORE the content honestly on visual metrics (thumbnail, hook, quality, pacing)
2. DESCRIBE the content in extreme detail so that a copywriter who CANNOT see the image/video can write a perfect caption based solely on your description.

Your descriptions must be so vivid and detailed that someone reading them can picture exactly what's in the content.
Always respond with valid JSON only. No markdown, no preamble."""

VISION_PROMPT = """Analyze this {content_type} post for {platform} virality potential.

Content niche: {niche}
Duration: {duration}

You MUST return a JSON object with EXACTLY this structure. Be extremely detailed in ALL text fields — a copywriter will use your descriptions to write captions WITHOUT seeing the image/video:

{{
  "thumbnail_score": <0-100 int>,
  "thumbnail_feedback": "<2-3 sentences: What makes this thumbnail strong or weak? Is there a clear focal point? Would you click on this in a feed of 100 posts? What specific element catches or fails to catch the eye?>",
  
  "hook_score": <0-100 int>,
  "hook_feedback": "<2-3 sentences: For images — does the composition create instant curiosity? For videos — do the first 3 seconds demand attention? What emotion does it trigger immediately?>",
  
  "visual_quality_score": <0-100 int>,
  "visual_quality_feedback": "<2-3 sentences: Assess lighting (natural/artificial/harsh/soft), sharpness, color grading, composition (rule of thirds?), any text overlays and their readability>",
  
  "pacing_score": <0-100 int>,
  "pacing_feedback": "<For videos: assess cut timing, transitions, speed. For images: assess visual flow, how the eye moves across the image. If image, score based on visual composition flow>",
  
  "detected_text_on_screen": ["<LIST EVERY piece of text visible — watermarks, captions, logos, team names, scores, brand names, overlay text, etc. Be exhaustive>"],
  
  "detected_emotions": ["<ALL emotions conveyed by the subjects and overall mood: determined, fierce, joyful, confident, vulnerable, excited, focused, etc. List at least 3-5>"],
  
  "scene_descriptions": [
    "<DETAILED description of what you see: WHO is in the content (number of people, their appearance, clothing, gear, expressions), WHAT they are doing (action, pose, activity), WHERE they are (setting, environment, background), any props or objects visible. Write 2-4 sentences per scene. For videos, describe each distinct scene/moment separately.>"
  ]
}}

SCORING GUIDELINES (be consistent):
- 90-100: Would stop ANY scroller. Professional lighting, perfect composition, emotionally compelling. Think: Nike ad quality.
- 75-89: Strong content. Good lighting, clear subject, emotional pull. Minor tweaks possible. Most successful creators post at this level.
- 60-74: Decent. Serviceable quality but won't stand out. Average lighting, basic composition.
- 45-59: Below average. Poor lighting, cluttered composition, or no emotional hook.
- 0-44: Poor. Blurry, dark, confusing, or visually unappealing.

CRITICAL: Your scene_descriptions and detected_emotions are the MOST important fields. A copywriter will use ONLY these to write viral captions. If you write vague descriptions like "two people in a photo", the caption will be generic and bad. Instead write: "Two cricket bowlers in white jerseys standing back-to-back with arms crossed, intense stares directed at the camera, dramatic stadium lighting creating silhouettes, crowd blurred in background — radiating pure dominance and brotherhood."

Be brutally honest with scores. Be extremely vivid with descriptions."""


async def vision_agent(state: AgentState) -> AgentState:
    """
    Agent 1: Vision Agent (using Gemini API)
    
    - Downloads the actual image/video bytes from storage
    - Sends real image data to Gemini for analysis
    - Evaluates: hook, thumbnail, pacing, visual quality
    - Writes VisualAnalysis to state
    """
    logger.info("Vision agent starting (Gemini)", upload_id=state.upload_id)

    # Initialize Gemini
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(GEMINI_VISION_MODEL)

    try:
        prompt = VISION_PROMPT.format(
            content_type=state.content_type.value,
            platform=state.platform.value,
            niche=state.niche or "general",
            duration=f"{state.duration_seconds:.1f}s" if state.duration_seconds else "N/A (image)",
        )

        # Download the media bytes first
        if state.content_type.value == "image":
            logger.info("Downloading image for analysis", upload_id=state.upload_id, url=state.file_url[:80])
            async with httpx.AsyncClient(timeout=30.0) as client:
                img_response = await client.get(state.file_url)
                img_response.raise_for_status()
                media_bytes = img_response.content
                mime = img_response.headers.get("content-type", state.mime_type or "image/jpeg")
            logger.info("Image downloaded", size_bytes=len(media_bytes), mime=mime)
        else:  # VIDEO
            logger.info("Downloading video for analysis", upload_id=state.upload_id)
            async with httpx.AsyncClient(timeout=120.0) as client:
                vid_response = await client.get(state.file_url)
                vid_response.raise_for_status()
                media_bytes = vid_response.content
                mime = vid_response.headers.get("content-type", state.mime_type or "video/mp4")
            logger.info("Video downloaded", size_bytes=len(media_bytes), mime=mime)

        media_part = {"mime_type": mime, "data": media_bytes}

        # Retry up to 3 times — switch to fallback API key on rate limit
        response = None
        for attempt in range(3):
            try:
                response = model.generate_content([prompt, media_part])
                break  # Success — exit retry loop
            except Exception as retry_err:
                err_str = str(retry_err)
                if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                    # Switch to fallback API key if available
                    if settings.gemini_api_key_fallback and attempt == 0:
                        logger.warning("Primary Gemini key rate-limited, switching to fallback key")
                        genai.configure(api_key=settings.gemini_api_key_fallback)
                        model = genai.GenerativeModel(GEMINI_VISION_MODEL)
                    else:
                        wait_time = 2 * (attempt + 1)
                        logger.warning(f"Gemini rate limited, retrying in {wait_time}s (attempt {attempt+1}/3)")
                        import asyncio
                        await asyncio.sleep(wait_time)
                else:
                    raise  # Non-rate-limit error — don't retry

        if response is None:
            raise Exception("Gemini rate limit exceeded after 3 retries (both keys exhausted)")

        raw = response.text.strip()

        # Clean up markdown if accidentally included
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        # Parse JSON response
        data = json.loads(raw)
        state.visual_analysis = VisualAnalysis(**data)

        logger.info(
            "Vision agent complete",
            upload_id=state.upload_id,
            thumbnail_score=state.visual_analysis.thumbnail_score,
            hook_score=state.visual_analysis.hook_score,
            visual_quality_score=state.visual_analysis.visual_quality_score,
            pacing_score=state.visual_analysis.pacing_score,
        )

    except Exception as e:
        logger.error("Vision agent error", error=str(e), upload_id=state.upload_id)
        state.errors.append(f"vision_agent: {str(e)}")
        
        # Return fallback analysis
        state.visual_analysis = VisualAnalysis(
            thumbnail_score=50,
            thumbnail_feedback="Analysis error occurred. Please try again.",
            hook_score=50,
            hook_feedback="Analysis error occurred. Please try again.",
            visual_quality_score=50,
            visual_quality_feedback="Analysis error occurred. Please try again.",
            pacing_score=50,
            pacing_feedback="Analysis error occurred. Please try again.",
        )

    return state
