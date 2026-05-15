"""
Vision Agent using Google Gemini API
- Analyzes video files directly (no frame extraction needed)
- Evaluates: hook, thumbnail, pacing, visual quality
- Returns VisualAnalysis with detailed scores and feedback
"""

import json
import structlog
import google.generativeai as genai
from config import settings
from gemini_client import GEMINI_VISION_MODEL
from state import AgentState
from response import VisualAnalysis

logger = structlog.get_logger()

VISION_SYSTEM_PROMPT = """You are a professional social media content analyst specializing in viral video analysis.
You analyze videos with surgical precision, looking for what makes content go viral.
Your scores are honest and calibrated — 70+ means genuinely good, 90+ means exceptional.

Analyze the video for:
1. Thumbnail/first frame quality (0-100)
2. Hook strength in first 3 seconds (0-100)
3. Overall visual quality including lighting, sharpness, composition (0-100)
4. Pacing and editing rhythm (0-100)

Always respond with valid JSON only. No markdown, no preamble."""

VISION_PROMPT = """Analyze this {content_type} post for {platform} virality potential.

Content niche: {niche}
Duration: {duration}

Evaluate and return a JSON object with EXACTLY this structure:
{{
  "thumbnail_score": <0-100 int>,
  "thumbnail_feedback": "<specific feedback on the thumbnail/first frame>",
  "hook_score": <0-100 int>,
  "hook_feedback": "<feedback on first 3 seconds visual hook>",
  "visual_quality_score": <0-100 int>,
  "visual_quality_feedback": "<lighting, sharpness, composition, text overlay quality>",
  "pacing_score": <0-100 int>,
  "pacing_feedback": "<are cuts well-timed? too slow/fast? editing quality>",
  "detected_text_on_screen": ["<any text visible in the video>"],
  "detected_emotions": ["<emotions conveyed: excited, curious, shocked, etc>"],
  "scene_descriptions": ["<brief description of key scenes in order>"]
}}

Be brutally honest. If the thumbnail is weak, say why specifically.
For hook_score: does the first 3 seconds make you want to keep watching?
Analyze motion, transitions, and pacing throughout the video."""


async def vision_agent(state: AgentState) -> AgentState:
    """
    Agent 1: Vision Agent (using Gemini API)
    
    - Analyzes video file directly from storage
    - No frame extraction needed - Gemini processes full video
    - Evaluates: hook, thumbnail, pacing, visual quality
    - Writes VisualAnalysis to state
    """
    logger.info("Vision agent starting (Gemini)", upload_id=state.upload_id)

    # Initialize Gemini
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(GEMINI_VISION_MODEL)

    try:
        # For images: use file_url directly (Gemini can process URLs)
        # For videos: need to use local file path or upload to Gemini
        
        if state.content_type.value == "image":
            # Image analysis - use URL directly
            logger.info("Analyzing image", upload_id=state.upload_id)
            
            prompt = VISION_PROMPT.format(
                content_type="image",
                platform=state.platform.value,
                niche=state.niche or "general",
                duration="N/A (image)",
            )
            
            response = model.generate_content([
                prompt,
                state.file_url  # Direct URL for image
            ])
            
        else:  # VIDEO
            # Video analysis - upload to Gemini (requires local file)
            logger.info("Analyzing video", upload_id=state.upload_id, duration=state.duration_seconds)
            
            # Note: In production, download video from Supabase first
            # For now, using file_url with video_metadata
            prompt = VISION_PROMPT.format(
                content_type="video",
                platform=state.platform.value,
                niche=state.niche or "general",
                duration=f"{state.duration_seconds:.1f}s" if state.duration_seconds else "unknown",
            )
            
            # Gemini can process video URLs or uploaded files
            # Here we use the file URL - Gemini will analyze it directly
            response = model.generate_content([
                prompt,
                state.file_url  # Gemini processes video from URL
            ])

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
