# 🔧 FREE API Implementation - Step-by-Step Code Changes

## File Structure to Create/Modify

```
files (3)/
├── app/core/
│   ├── anthropic_client.py      ← KEEP (for now)
│   ├── ollama_client.py         ← CREATE (new - free vision)
│   ├── groq_client.py           ← CREATE (new - free text AI)
│   └── supabase_client.py       ← KEEP (already free)
│
├── app/agents/
│   ├── vision_agent.py          ← MODIFY (use Ollama instead of Claude)
│   ├── trend_agent.py           ← MODIFY (use DuckDuckGo instead of Tavily)
│   ├── caption_agent.py         ← MODIFY (use Groq instead of Claude)
│   ├── feedback_agent.py        ← MODIFY (use Groq instead of Claude)
│   └── score_agent.py           ← KEEP (no AI calls needed)
│
├── requirements.txt             ← MODIFY (remove anthropic, tavily, add free alternatives)
└── .env.example                 ← MODIFY (remove paid API keys, add free ones)
```

---

## 1️⃣ CREATE: `app/core/ollama_client.py` (FREE Vision AI)

This replaces Anthropic Claude for vision/image analysis.

**File**: `/Users/abuzaid/Desktop/final/8x/files (3)/app/core/ollama_client.py`

```python
"""
Ollama Client - FREE local vision AI
Replaces: anthropic Claude (paid)

Install: brew install ollama
Download: ollama pull llava:7b
Run: ollama serve
"""

import requests
import structlog
import time
from typing import Optional

logger = structlog.get_logger()

# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
VISION_MODEL = "llava:7b"  # Options: llava:7b, moondream:1.8b, neural-chat:7b
TEXT_MODEL = "neural-chat:7b"

# Context/Performance settings
OLLAMA_TIMEOUT = 300  # 5 minutes for vision
OLLAMA_STREAM = False
MAX_TOKENS = 4096


def is_ollama_available() -> bool:
    """Check if Ollama server is running"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False


def get_available_models() -> list[str]:
    """Get list of models installed in Ollama"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            return [m["name"] for m in models]
        return []
    except Exception as e:
        logger.error("Could not fetch Ollama models", error=str(e))
        return []


def analyze_frames_with_vision_model(
    frames: list[dict],
    prompt: str,
    max_tokens: int = MAX_TOKENS,
) -> str:
    """
    Analyze images/frames using Ollama vision model (FREE)
    
    Args:
        frames: List of frame dicts with:
            - "base64": base64 encoded image string
            - "media_type": "image/jpeg" or "image/png"
            - "label": frame identifier (e.g., "thumbnail", "hook_1s")
        prompt: Analysis prompt/instructions
        max_tokens: Maximum tokens in response
    
    Returns:
        Analysis text from Ollama
    
    Raises:
        ConnectionError: If Ollama server not running
        ValueError: If analysis fails
    """
    if not is_ollama_available():
        raise ConnectionError(
            "Ollama server is not running. Start it with: ollama serve"
        )
    
    try:
        # Extract base64 data from frames
        images = []
        frame_labels = []
        
        for i, frame in enumerate(frames):
            if "base64" in frame:
                images.append(frame["base64"])
                frame_labels.append(frame.get("label", f"frame_{i}"))
        
        if not images:
            raise ValueError("No base64 frames provided")
        
        # Build full prompt with frame context
        full_prompt = f"""You are a professional social media content analyst.
        
INSTRUCTIONS:
{prompt}

FRAMES PROVIDED: {len(images)}
Frame sequence: {", ".join(frame_labels)}

Analyze the frames and provide detailed JSON response."""
        
        logger.info(
            "Calling Ollama vision model",
            model=VISION_MODEL,
            frames=len(images),
            max_tokens=max_tokens,
        )
        
        start_time = time.time()
        
        # Call Ollama
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": VISION_MODEL,
                "prompt": full_prompt,
                "images": images,
                "stream": OLLAMA_STREAM,
                "num_predict": max_tokens,
            },
            timeout=OLLAMA_TIMEOUT,
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code != 200:
            logger.error(
                "Ollama request failed",
                status=response.status_code,
                response=response.text,
            )
            raise ValueError(f"Ollama error: {response.text}")
        
        result = response.json()
        analysis_text = result.get("response", "")
        
        logger.info(
            "Ollama analysis complete",
            elapsed=round(elapsed, 2),
            response_length=len(analysis_text),
        )
        
        return analysis_text
        
    except requests.exceptions.ConnectionError as e:
        logger.error("Cannot connect to Ollama server")
        raise ConnectionError(
            "Ollama server not responding. Make sure it's running: ollama serve"
        ) from e
    except requests.exceptions.Timeout:
        logger.error("Ollama request timeout")
        raise TimeoutError("Ollama vision analysis timed out (>5 min)")
    except Exception as e:
        logger.error("Ollama analysis error", error=str(e))
        raise


def analyze_text_with_ollama(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    max_tokens: int = MAX_TOKENS,
) -> str:
    """
    Text-only analysis using Ollama (for when vision not needed)
    
    Args:
        prompt: User prompt/question
        system_prompt: System instructions
        model: Which model to use (default: TEXT_MODEL)
        max_tokens: Max response length
    
    Returns:
        Response text
    """
    if not is_ollama_available():
        raise ConnectionError("Ollama server not running")
    
    model = model or TEXT_MODEL
    
    try:
        logger.info("Calling Ollama text model", model=model)
        
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": model,
                "prompt": full_prompt,
                "stream": OLLAMA_STREAM,
                "num_predict": max_tokens,
            },
            timeout=OLLAMA_TIMEOUT,
        )
        
        if response.status_code != 200:
            raise ValueError(f"Ollama error: {response.text}")
        
        return response.json().get("response", "")
        
    except Exception as e:
        logger.error("Ollama text analysis failed", error=str(e))
        raise
```

---

## 2️⃣ CREATE: `app/core/groq_client.py` (FREE Text AI)

This replaces Anthropic Claude for text-only analysis.

**File**: `/Users/abuzaid/Desktop/final/8x/files (3)/app/core/groq_client.py`

```python
"""
Groq Client - FREE text AI (mixtral-8x7b)
Replaces: Anthropic Claude (paid)

Sign up: https://console.groq.com
Get API key: https://console.groq.com/keys
Free tier: 10k requests/day
"""

import os
import structlog
import json
from typing import Optional

logger = structlog.get_logger()

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("Groq not installed. Install with: pip install groq")


def get_groq_client() -> Optional[Groq]:
    """Initialize Groq client using API key from environment"""
    if not GROQ_AVAILABLE:
        raise ImportError("Groq library not installed. Run: pip install groq")
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    return Groq(api_key=api_key)


def analyze_with_groq(
    system_prompt: str,
    user_prompt: str,
    model: str = "mixtral-8x7b-32768",
    max_tokens: int = 2048,
    temperature: float = 0.7,
    json_mode: bool = False,
) -> str:
    """
    Call Groq API for text analysis (completely FREE)
    
    Args:
        system_prompt: System instructions
        user_prompt: User's question/prompt
        model: Model to use (default: mixtral-8x7b - free tier)
        max_tokens: Max response length
        temperature: Creativity (0-1)
        json_mode: If True, returns JSON response
    
    Returns:
        Response text
    
    Available free models:
        - mixtral-8x7b-32768 (32k context) - BEST
        - llama-3.1-70b-versatile
        - llama-3.1-8b-instant (fastest)
    """
    try:
        client = get_groq_client()
        
        logger.info(
            "Calling Groq",
            model=model,
            max_tokens=max_tokens,
            json_mode=json_mode,
        )
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9,
        )
        
        result_text = response.choices[0].message.content
        
        logger.info("Groq response received", length=len(result_text))
        
        return result_text
        
    except Exception as e:
        logger.error("Groq API error", error=str(e))
        raise


def analyze_json_with_groq(
    system_prompt: str,
    user_prompt: str,
    model: str = "mixtral-8x7b-32768",
    max_tokens: int = 2048,
) -> dict:
    """
    Call Groq API and parse JSON response
    
    Args:
        system_prompt: Must tell model to return JSON
        user_prompt: Prompt (usually includes expected JSON structure)
        model: Model to use
        max_tokens: Max response length
    
    Returns:
        Parsed JSON dict
    
    Example:
        system = "You are a JSON analyzer. Always respond with valid JSON only."
        user = "Analyze this: ... Return JSON with keys: x, y, z"
        result = analyze_json_with_groq(system, user)
        # Returns dict with keys x, y, z
    """
    try:
        response_text = analyze_with_groq(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            max_tokens=max_tokens,
        )
        
        # Clean up markdown fences if present
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]  # Remove ```json
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]  # Remove ```
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]  # Remove trailing ```
        
        cleaned = cleaned.strip()
        
        # Parse JSON
        result = json.loads(cleaned)
        
        logger.info("Groq JSON parsed successfully")
        
        return result
        
    except json.JSONDecodeError as e:
        logger.error("Failed to parse JSON from Groq", error=str(e), response=response_text)
        raise ValueError(f"Invalid JSON from Groq: {response_text}")
    except Exception as e:
        logger.error("Groq JSON analysis failed", error=str(e))
        raise


def is_groq_available() -> bool:
    """Check if Groq API is configured and available"""
    if not GROQ_AVAILABLE:
        return False
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return False
    
    try:
        client = get_groq_client()
        # Try a minimal request to verify API key works
        client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "test"}],
            max_tokens=10,
        )
        return True
    except:
        return False


# Model configurations for different use cases
GROQ_MODELS = {
    "best": "mixtral-8x7b-32768",  # Best quality, 32k context
    "fast": "llama-3.1-8b-instant",  # Fastest, smallest context
    "balanced": "llama-3.1-70b-versatile",  # Good balance
}
```

---

## 3️⃣ UPDATE: `requirements.txt`

Replace paid APIs with free alternatives.

**Changes**:
- Remove: `anthropic`, `tavily-python`
- Add: `groq`, `duckduckgo-search`, `requests`

```bash
# Create backup
cp requirements.txt requirements.txt.backup

# Replace
cat > requirements.txt << 'EOF'
fastapi==0.115.5
uvicorn[standard]==0.32.1
python-multipart==0.0.12
pydantic==2.10.3
pydantic-settings==2.6.1

# FREE: Groq (text AI - 10k/day free)
groq==0.13.0

# FREE: DuckDuckGo search (no API key needed)
duckduckgo-search==3.9.11

# Supabase (FREE tier available)
supabase==2.10.0

# Video processing (already free, open-source)
opencv-python-headless==4.10.0.84
ffmpeg-python==0.2.0
Pillow==11.0.0

# LangGraph multi-agent
langgraph==0.2.53
langchain==0.3.9
langchain-anthropic==0.3.0
langchain-community==0.3.9

# HTTP
httpx==0.27.2
requests==2.32.3

# Async
anyio==4.7.0
aiofiles==24.1.0

# Utils
python-dotenv==1.0.1
structlog==24.4.0
numpy==1.26.4
EOF
```

---

## 4️⃣ UPDATE: `.env.example`

Remove paid API keys, add free ones.

```bash
# OLD (PAID) - REMOVE THESE:
# ANTHROPIC_API_KEY=sk-...
# TAVILY_API_KEY=tvly-...

# NEW (FREE) - ADD THESE:

# ────────────────────────────────────────────────
# FREE: Ollama (Local Vision AI)
# Install: brew install ollama
# Download: ollama pull llava:7b
# Run: ollama serve
# ────────────────────────────────────────────────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llava:7b
USE_OLLAMA=true

# ────────────────────────────────────────────────
# FREE: Groq API (Text AI - 10k/day)
# Sign up: https://console.groq.com
# Get key: https://console.groq.com/keys
# ────────────────────────────────────────────────
GROQ_API_KEY=gsk_...your_groq_key_here...

# ────────────────────────────────────────────────
# FREE: Supabase (1GB storage + PostgreSQL)
# Already configured below
# ────────────────────────────────────────────────

# Supabase
supabase_url=http://127.0.0.1:54321
supabase_publishable_key=eyJ...
supabase_service_role_key=eyJ...

# App
app_env=development
app_port=8000
max_file_size_mb=100
allowed_video_types=video/mp4,video/quicktime,video/webm,video/x-msvideo
allowed_image_types=image/jpeg,image/png,image/webp,image/gif
cors_origins=http://localhost:3000
```

---

## 5️⃣ MODIFY: `app/agents/vision_agent.py`

Replace Anthropic Claude with Ollama.

**Changes needed**:
- Remove: `from app.core.anthropic_client import ...`
- Add: `from app.core.ollama_client import analyze_frames_with_vision_model`
- Replace API call

```python
# Line ~1-20: Update imports
import json
import structlog
from app.core.ollama_client import analyze_frames_with_vision_model  # NEW
# Remove: from app.core.anthropic_client import get_anthropic, CLAUDE_MODEL, MAX_TOKENS
from app.agents.state import AgentState
from app.models.response import VisualAnalysis

logger = structlog.get_logger()

# ... VISION_SYSTEM_PROMPT and VISION_PROMPT stay the same ...

# Line ~85-130: Update vision_agent function
async def vision_agent(state: AgentState) -> AgentState:
    """
    Agent 1: Vision Agent (using FREE Ollama instead of Claude)
    - Receives extracted video frames
    - Calls Ollama Vision to analyze visual quality, hook, thumbnail, pacing
    - Writes VisualAnalysis to state
    """
    logger.info("Vision agent starting", upload_id=state.upload_id, frames=len(state.frames))

    if not state.frames:
        state.errors.append("vision_agent: no frames available")
        logger.warning("Vision agent skipped — no frames", upload_id=state.upload_id)
        state.visual_analysis = VisualAnalysis(
            thumbnail_score=50,
            thumbnail_feedback="Could not extract frames for analysis.",
            hook_score=50,
            hook_feedback="Could not extract frames for analysis.",
            visual_quality_score=50,
            visual_quality_feedback="Could not extract frames for analysis.",
            pacing_score=50,
            pacing_feedback="Could not extract frames for analysis.",
        )
        return state

    try:
        # Build the analysis prompt (same as before)
        frame_descriptions = "\n".join([
            f"  - Frame {i+1}: {f['label']} at {f['timestamp']}s"
            for i, f in enumerate(state.frames)
        ])

        prompt = VISION_PROMPT.format(
            frame_count=len(state.frames),
            content_type=state.content_type.value,
            platform=state.platform.value,
            niche=state.niche or "general",
            duration=f"{state.duration_seconds:.1f}s" if state.duration_seconds else "N/A (image)",
            frame_descriptions=frame_descriptions,
        )

        # Call FREE Ollama instead of paid Claude
        raw = await analyze_frames_with_vision_model(
            frames=state.frames,
            prompt=prompt,
        )

        # Parse response (same as before)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]

        data = json.loads(cleaned)
        state.visual_analysis = VisualAnalysis(**data)

        logger.info(
            "Vision agent complete",
            thumbnail_score=state.visual_analysis.thumbnail_score,
            hook_score=state.visual_analysis.hook_score,
        )

    except Exception as e:
        logger.error("Vision agent error", error=str(e))
        state.errors.append(f"vision_agent: {str(e)}")
        state.visual_analysis = VisualAnalysis(
            thumbnail_score=50, thumbnail_feedback="Analysis error.",
            hook_score=50, hook_feedback="Analysis error.",
            visual_quality_score=50, visual_quality_feedback="Analysis error.",
            pacing_score=50, pacing_feedback="Analysis error.",
        )

    return state
```

---

## 6️⃣ MODIFY: `app/agents/trend_agent.py`

Replace Tavily with DuckDuckGo.

```python
# Line ~1-15: Update imports
import json
import structlog
from app.core.groq_client import analyze_json_with_groq  # NEW
from app.core.config import settings
from app.agents.state import AgentState
from app.models.response import TrendAnalysis

logger = structlog.get_logger()

# ... TREND_SYSTEM_PROMPT and TREND_PROMPT stay the same ...

# Line ~30-70: Replace _fetch_trends_with_tavily with _fetch_trends_with_duckduckgo
async def _fetch_trends_with_duckduckgo(niche: str, platform: str) -> str:
    """Use DuckDuckGo for free web search - no API key needed"""
    try:
        from duckduckgo_search import DDGS
        
        ddgs = DDGS(timeout=10)
        
        queries = [
            f"trending {niche} content {platform} 2025",
            f"viral {platform} {niche} hashtags trending",
            f"best performing {niche} videos {platform} this week",
        ]
        
        results = []
        for query in queries:
            try:
                for result in ddgs.text(query, max_results=3):
                    title = result.get("title", "")
                    body = result.get("body", "")[:200]
                    if title:
                        results.append(f"- {title}: {body}")
            except Exception as e:
                logger.debug(f"DuckDuckGo query failed: {e}")
                continue
        
        if results:
            return "\n".join(results)
        else:
            return _get_fallback_trends(niche, platform)
            
    except ImportError:
        logger.warning("duckduckgo-search not installed")
        return _get_fallback_trends(niche, platform)
    except Exception as e:
        logger.warning("DuckDuckGo search failed", error=str(e))
        return _get_fallback_trends(niche, platform)


# Line ~110-180: Update trend_agent function
async def trend_agent(state: AgentState) -> AgentState:
    """
    Agent 2: Trend Agent (using FREE DuckDuckGo + Groq instead of Tavily + Claude)
    - Searches web for current trending content
    - Analyzes trend alignment
    - Suggests hashtags, audio, posting times
    """
    logger.info("Trend agent starting", platform=state.platform, niche=state.niche)

    # Extract visual themes from vision analysis
    visual_themes = []
    if state.visual_analysis:
        visual_themes = state.visual_analysis.detected_emotions or []
        visual_themes += state.visual_analysis.detected_text_on_screen or []

    # Fetch live trend data using FREE DuckDuckGo
    trends_data = await _fetch_trends_with_duckduckgo(
        niche=state.niche or "general",
        platform=state.platform.value,
    )

    try:
        prompt = TREND_PROMPT.format(
            platform=state.platform.value,
            niche=state.niche or "general",
            content_type=state.content_type.value,
            caption_preview=(state.caption or "")[:200],
            visual_themes=", ".join(visual_themes) if visual_themes else "not analyzed yet",
            trends_data=trends_data,
        )

        # Use FREE Groq instead of paid Claude
        response_text = await analyze_json_with_groq(
            system_prompt=TREND_SYSTEM_PROMPT,
            user_prompt=prompt,
        )

        state.trend_analysis = TrendAnalysis(**response_text)

        logger.info(
            "Trend agent complete",
            trend_score=state.trend_analysis.trend_alignment_score,
        )

    except Exception as e:
        logger.error("Trend agent error", error=str(e))
        state.errors.append(f"trend_agent: {str(e)}")
        state.trend_analysis = TrendAnalysis(
            trend_alignment_score=50,
            trend_summary="Could not fetch trend data.",
            trending_hashtags=["#trending", "#viral", f"#{state.niche or 'fyp'}"],
        )

    return state
```

---

## 7️⃣ MODIFY: `app/agents/caption_agent.py`

Replace Anthropic Claude with Groq.

```python
# Line ~1-15: Update imports
import json
import structlog
from app.core.groq_client import analyze_json_with_groq  # NEW
# Remove: from app.core.anthropic_client import get_anthropic, CLAUDE_MODEL, MAX_TOKENS
from app.agents.state import AgentState
from app.models.response import CaptionAnalysis

logger = structlog.get_logger()

# ... CAPTION_SYSTEM_PROMPT, CAPTION_PROMPT, etc stay the same ...

# Line ~100-200: Update caption_agent function
async def caption_agent(state: AgentState) -> AgentState:
    """
    Agent 3: Caption Agent (using FREE Groq instead of Claude)
    """
    logger.info("Caption agent starting", has_caption=bool(state.caption))

    # Gather context from previous agents (same as before)
    emotions = []
    on_screen_text = []
    trending_hashtags = []

    if state.visual_analysis:
        emotions = state.visual_analysis.detected_emotions or []
        on_screen_text = state.visual_analysis.detected_text_on_screen or []

    if state.trend_analysis:
        trending_hashtags = state.trend_analysis.trending_hashtags[:10]

    platform_guidance = PLATFORM_GUIDANCE.get(state.platform.value, "Create engaging content.")

    try:
        if state.caption:
            prompt = CAPTION_PROMPT.format(
                platform=state.platform.value,
                caption=state.caption,
                content_type=state.content_type.value,
                emotions=", ".join(emotions) if emotions else "not detected",
                on_screen_text=", ".join(on_screen_text) if on_screen_text else "none",
                trending_hashtags=", ".join(trending_hashtags) if trending_hashtags else "see trends",
                platform_hook_guidance=platform_guidance,
            )
        else:
            prompt = NO_CAPTION_PROMPT.format(
                platform=state.platform.value,
                content_type=state.content_type.value,
                emotions=", ".join(emotions) if emotions else "not detected",
                on_screen_text=", ".join(on_screen_text) if on_screen_text else "none",
                niche=state.niche or "general",
            )

        # Use FREE Groq instead of paid Claude
        response_data = await analyze_json_with_groq(
            system_prompt=CAPTION_SYSTEM_PROMPT,
            user_prompt=prompt,
        )

        state.caption_analysis = CaptionAnalysis(**response_data)

        logger.info("Caption agent complete", caption_score=state.caption_analysis.caption_score)

    except Exception as e:
        logger.error("Caption agent error", error=str(e))
        state.errors.append(f"caption_agent: {str(e)}")
        state.caption_analysis = CaptionAnalysis(
            caption_score=50,
            hook_text_score=50,
            cta_present=False,
            emotion_triggers=[],
            optimized_caption=state.caption or "Add a caption.",
            optimized_hook="Hook could not be generated.",
            hashtag_suggestions=["#trending", "#viral"],
        )

    return state
```

---

## 8️⃣ MODIFY: `app/agents/feedback_agent.py`

Replace Anthropic Claude with Groq.

```python
# Line ~1-15: Update imports
import json
import structlog
from app.core.groq_client import analyze_json_with_groq  # NEW
# Remove: from app.core.anthropic_client import get_anthropic, CLAUDE_MODEL, MAX_TOKENS
from app.agents.state import AgentState
from app.models.response import ImprovementPlan

logger = structlog.get_logger()

# ... FEEDBACK_SYSTEM_PROMPT, FEEDBACK_PROMPT stay the same ...

# Line ~100-180: Update feedback_agent function
async def feedback_agent(state: AgentState) -> AgentState:
    """
    Agent 4: Feedback Agent (using FREE Groq instead of Claude)
    """
    logger.info("Feedback agent starting", upload_id=state.upload_id)

    # Gather all outputs from prior agents (same as before)
    v = state.visual_analysis
    t = state.trend_analysis
    c = state.caption_analysis

    try:
        prompt = FEEDBACK_PROMPT.format(
            thumbnail_score=v.thumbnail_score if v else 50,
            thumbnail_feedback=v.thumbnail_feedback if v else "N/A",
            hook_score=v.hook_score if v else 50,
            hook_feedback=v.hook_feedback if v else "N/A",
            visual_quality_score=v.visual_quality_score if v else 50,
            visual_quality_feedback=v.visual_quality_feedback if v else "N/A",
            pacing_score=v.pacing_score if v else 50,
            pacing_feedback=v.pacing_feedback if v else "N/A",
            trend_score=t.trend_alignment_score if t else 50,
            trend_summary=t.trend_summary if t else "N/A",
            platform_tips="; ".join(t.platform_specific_tips[:3]) if t else "N/A",
            caption_score=c.caption_score if c else 50,
            hook_text_score=c.hook_text_score if c else 50,
            cta_present=str(c.cta_present) if c else "unknown",
            emotions=", ".join(c.emotion_triggers) if c else "none",
            platform=state.platform.value,
            content_type=state.content_type.value,
            niche=state.niche or "general",
        )

        # Use FREE Groq instead of paid Claude
        response_data = await analyze_json_with_groq(
            system_prompt=FEEDBACK_SYSTEM_PROMPT,
            user_prompt=prompt,
        )

        state.improvement_plan = ImprovementPlan(**response_data)

        logger.info("Feedback agent complete")

    except Exception as e:
        logger.error("Feedback agent error", error=str(e))
        state.errors.append(f"feedback_agent: {str(e)}")
        state.improvement_plan = ImprovementPlan(
            priority_fixes=["Improve visual hook", "Optimize caption"],
            quick_wins=["Add trending hashtags"],
            deep_improvements=["Re-edit first 3 seconds"],
            what_works=["Content has potential"],
            predicted_score_after_fixes=65,
        )

    return state
```

---

## ✅ SUMMARY OF CHANGES

| File | Changes |
|------|---------|
| `requirements.txt` | Remove `anthropic`, `tavily-python` → Add `groq`, `duckduckgo-search` |
| `.env.example` | Remove paid keys → Add `GROQ_API_KEY`, `OLLAMA_BASE_URL` |
| `app/core/ollama_client.py` | CREATE new file for free vision AI |
| `app/core/groq_client.py` | CREATE new file for free text AI |
| `app/agents/vision_agent.py` | Replace Anthropic → Ollama |
| `app/agents/trend_agent.py` | Replace Tavily + Anthropic → DuckDuckGo + Groq |
| `app/agents/caption_agent.py` | Replace Anthropic → Groq |
| `app/agents/feedback_agent.py` | Replace Anthropic → Groq |

---

## 🚀 QUICK SETUP

```bash
# 1. Install Ollama
brew install ollama

# 2. Download vision model
ollama pull llava:7b

# 3. Start Ollama (in background)
ollama serve &

# 4. Install new dependencies
pip install groq duckduckgo-search requests -U

# 5. Get Groq API key
# Visit: https://console.groq.com
# Create account → Create API key

# 6. Update .env
echo "GROQ_API_KEY=gsk_your_key_here" >> .env

# 7. Install/update requirements
pip install -r requirements.txt

# 8. Test
python -c "from app.core.ollama_client import is_ollama_available; print(is_ollama_available())"
python -c "from app.core.groq_client import is_groq_available; print(is_groq_available())"

# 9. Run backend
uvicorn app.main:app --reload
```

Done! 🎉 All paid APIs replaced with FREE alternatives!
