# 🆓 FREE APIs Guide for Go Viral Clone

This guide shows how to replace **ALL PAID APIs** with **FREE alternatives** for the Go Viral project.

---

## 📊 CURRENT PAID APIs & FREE Replacements

### 1. **Claude AI (Paid) → FREE Alternatives**

#### Current Setup:
- **Anthropic Claude Sonnet 4** - ~$3 per 1M tokens (input), $15 per 1M tokens (output)
- **Cost**: ~$0.50-2 per video analysis

#### FREE Options:

| API | Free Tier | Tokens/Month | Model Quality | Vision Support |
|-----|-----------|--------------|---------------|---|
| **Ollama (Local)** | ✅ Completely Free | Unlimited | Good | ✅ Yes (llava, moondream) |
| **LLaMA 2 (Groq)** | ✅ Free | 10k/day | Great | ❌ No text only |
| **Mistral API** | ✅ Free tier | 10k req/month | Good | ❌ No |
| **HuggingFace Inference** | ✅ Free | 30k/month | Good | ✅ Yes |
| **OpenAI GPT-4 Vision** | ❌ Paid only | - | Best | ✅ Yes |

#### **RECOMMENDED: Ollama (Best for Vision + Free)**

```bash
# Install Ollama
brew install ollama

# Download a vision model
ollama pull llava:7b  # 4.7GB - Fast & good
# OR
ollama pull moondream:1.8b  # 1.8GB - Lightweight, fastest

# Start Ollama server
ollama serve  # Runs on localhost:11434
```

**Modify backend code:**

```python
# OLD: anthropic_client.py (PAID)
from anthropic import Anthropic
client = Anthropic(api_key=settings.anthropic_api_key)

# NEW: ollama_client.py (FREE)
import requests

def get_ollama() -> dict:
    """Call local Ollama server - completely free"""
    return {
        "base_url": "http://localhost:11434",
        "model": "llava:7b",  # or moondream:1.8b
    }

def analyze_frames_with_ollama(frames: list) -> str:
    """Vision analysis using free Ollama"""
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llava:7b",
            "prompt": "Analyze these video frames for virality...",
            "images": frames,
            "stream": False,
        }
    )
    return response.json()["response"]
```

---

### 2. **Tavily Web Search (Paid) → FREE Alternatives**

#### Current Setup:
- **Tavily** - $0.005 per search
- **Cost**: ~$0.02-0.05 per analysis

#### FREE Options:

| API | Free Tier | Requests/Month | Quality |
|-----|-----------|---|---|
| **Duckduckgo (Free)** | ✅ No key needed | Unlimited | Good |
| **Jina Reader** | ✅ Free | 100/month | Excellent |
| **Serper.dev** | ⚠️ Free tier | 100/month | Very Good |
| **SerpStack** | ⚠️ Free | 100/month | Good |
| **NewsAPI** | ✅ Free | 100/month | Good for news |

#### **RECOMMENDED: DuckDuckGo (No API key needed)**

```python
# OLD: trend_agent.py (PAID - Tavily)
from tavily import TavilyClient
client = TavilyClient(api_key=settings.tavily_api_key)
results = client.search(query)

# NEW: trend_agent.py (FREE - DuckDuckGo)
def _fetch_trends_with_duckduckgo(niche: str, platform: str) -> str:
    """Free web search using DuckDuckGo - no API key needed"""
    from duckduckgo_search import DDGS
    
    ddgs = DDGS()
    
    queries = [
        f"trending {niche} content {platform} 2025",
        f"viral {platform} {niche} hashtags trending now",
        f"best performing {niche} videos {platform}",
    ]
    
    results = []
    for query in queries:
        try:
            for result in ddgs.text(query, max_results=3):
                results.append(f"- {result['title']}: {result['body'][:300]}")
        except:
            pass
    
    return "\n".join(results) if results else _get_fallback_trends(niche, platform)
```

**Install DuckDuckGo search:**
```bash
pip install duckduckgo-search
```

---

### 3. **Supabase Storage (Free tier included) → Keep It**

Supabase has a **FREE tier** with 1GB storage:
- ✅ 1GB file storage
- ✅ Unlimited users
- ✅ PostgreSQL database
- ✅ Real-time

Keep Supabase as-is, it's already free!

---

### 4. **OpenCV + FFmpeg (Already Free)** ✅

Video processing is already using free libraries:
- ✅ OpenCV - Free, open-source
- ✅ FFmpeg - Free, open-source
- ✅ Pillow - Free, open-source

No changes needed! ✅

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Setup Local Ollama (Free Vision AI)

```bash
# Install Ollama
brew install ollama

# Download vision model (choose one)
ollama pull llava:7b              # Best balance (4.7GB)
ollama pull moondream:1.8b        # Lightweight (1.8GB)
ollama pull neural-chat:7b        # Text-only fallback (4.1GB)

# Start Ollama (keeps running in background)
ollama serve
```

### Step 2: Update Backend Requirements

```bash
# Remove paid dependencies
pip uninstall anthropic tavily-python -y

# Install free alternatives
pip install duckduckgo-search requests httpx
```

### Step 3: Update `.env.local`

```bash
# Remove these paid API keys:
# ANTHROPIC_API_KEY=...
# TAVILY_API_KEY=...

# Add these (all free/local):
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llava:7b
USE_LOCAL_OLLAMA=true
DUCKDUCKGO_ENABLED=true
```

### Step 4: Modify Backend Code

Create new file: `app/core/ollama_client.py`

```python
import requests
import base64
import structlog
from typing import Optional

logger = structlog.get_logger()

OLLAMA_BASE_URL = "http://localhost:11434"
VISION_MODEL = "llava:7b"  # or moondream:1.8b

def get_ollama_client():
    """Get local Ollama client - completely FREE"""
    return {
        "base_url": OLLAMA_BASE_URL,
        "model": VISION_MODEL,
    }

def analyze_frames_with_ollama(
    frames: list[dict],
    prompt: str,
    max_tokens: int = 4096,
) -> str:
    """
    Analyze frames using local Ollama (free)
    
    Args:
        frames: List of {"base64": str, "media_type": str}
        prompt: Analysis prompt
        max_tokens: Max response length
    
    Returns:
        Analysis text from Ollama
    """
    try:
        # Convert frames to base64 if needed
        images = []
        for frame in frames:
            if "base64" in frame:
                images.append(frame["base64"])
        
        # Call local Ollama
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": VISION_MODEL,
                "prompt": prompt,
                "images": images if images else None,
                "stream": False,
                "num_predict": max_tokens,
            },
            timeout=120,  # Vision takes time
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info("Ollama analysis complete", tokens=len(result.get("response", "")))
            return result.get("response", "")
        else:
            logger.error("Ollama error", status=response.status_code)
            return ""
            
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Ollama. Make sure to run: ollama serve")
        raise Exception("Ollama server not running. Start with: ollama serve")
    except Exception as e:
        logger.error("Ollama analysis failed", error=str(e))
        raise
```

### Step 5: Update `vision_agent.py` to use Ollama

Replace Anthropic calls with Ollama:

```python
# OLD
from app.core.anthropic_client import get_anthropic, CLAUDE_MODEL

# NEW
from app.core.ollama_client import analyze_frames_with_ollama

async def vision_agent(state: AgentState) -> AgentState:
    """Vision Agent using FREE Ollama instead of paid Claude"""
    logger.info("Vision agent starting", upload_id=state.upload_id)

    if not state.frames:
        # fallback...
        return state

    try:
        # Build prompt (same as before)
        prompt = VISION_PROMPT.format(...)
        
        # Use FREE Ollama instead of Claude
        response_text = analyze_frames_with_ollama(
            frames=state.frames,
            prompt=prompt,
            max_tokens=4096,
        )
        
        # Parse JSON response (same as before)
        data = json.loads(response_text)
        state.visual_analysis = VisualAnalysis(**data)
        
    except Exception as e:
        logger.error("Vision agent error", error=str(e))
        state.errors.append(f"vision_agent: {str(e)}")
        # fallback response
        
    return state
```

### Step 6: Update `trend_agent.py` to use DuckDuckGo

```python
# OLD
from tavily import TavilyClient

# NEW  
def _fetch_trends_with_duckduckgo(niche: str, platform: str) -> str:
    """Free web search using DuckDuckGo - no API key needed"""
    from duckduckgo_search import DDGS
    
    ddgs = DDGS()
    queries = [
        f"trending {niche} content {platform} 2025",
        f"viral {platform} {niche} hashtags",
        f"best {niche} videos {platform}",
    ]
    
    results = []
    for query in queries:
        try:
            for result in ddgs.text(query, max_results=3):
                results.append(f"- {result['title']}: {result['body'][:300]}")
        except Exception as e:
            logger.warning(f"DuckDuckGo search failed: {e}")
            continue
    
    return "\n".join(results) if results else _get_fallback_trends(niche, platform)

async def trend_agent(state: AgentState) -> AgentState:
    """Trend Agent using FREE DuckDuckGo"""
    logger.info("Trend agent starting")
    
    # Use free DuckDuckGo instead of Tavily
    trends_data = await _fetch_trends_with_duckduckgo(
        niche=state.niche or "general",
        platform=state.platform.value,
    )
    
    # Rest of the agent stays the same...
    # Use Ollama for Claude calls if needed, or keep text-only
```

### Step 7: Other Agents (Caption, Feedback, Score)

For text-only tasks (no vision), use **Groq API** (FREE):

```bash
pip install groq
```

Get FREE API key: https://console.groq.com

```python
# groq_client.py (FREE - 10k req/day)
from groq import Groq

def get_groq() -> Groq:
    """Get FREE Groq client"""
    return Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_with_groq(system_prompt: str, user_prompt: str) -> str:
    """Use free Groq for text analysis"""
    client = get_groq()
    response = client.chat.completions.create(
        model="mixtral-8x7b-32768",  # FREE model
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=2048,
    )
    return response.choices[0].message.content
```

Update agents:
```python
# caption_agent.py
from app.core.groq_client import analyze_with_groq

async def caption_agent(state: AgentState) -> AgentState:
    """Use FREE Groq API for caption analysis"""
    response_text = analyze_with_groq(
        system_prompt=CAPTION_SYSTEM_PROMPT,
        user_prompt=prompt,
    )
    # ... rest same
```

---

## 💰 COST COMPARISON

### Original (PAID):
```
Claude Vision:      $0.50-2.00 per analysis
Tavily Search:      $0.02-0.05 per analysis
────────────────────────────────────────
TOTAL PER ANALYSIS: $0.52-2.05
Monthly (100 analyses): $52-205
Yearly:             $624-2,460
```

### NEW (FREE):
```
Ollama (Local):     $0.00 (your computer)
DuckDuckGo:         $0.00 (no API key)
Groq:               $0.00 (10k/day free)
Supabase Free:      $0.00
────────────────────────────────────────
TOTAL PER ANALYSIS: $0.00
Monthly (100 analyses): $0.00
Yearly:             $0.00 ✅
```

### **You save: $624-2,460/year!** 🎉

---

## ⚡ LIMITATIONS OF FREE TIER

| Service | Limitation | Workaround |
|---------|-----------|-----------|
| **Ollama** | Slower than Claude (30-60s vs 5-10s) | Run on GPU machine, use smaller model |
| **Groq** | 10k requests/day limit | Cache results, batch requests |
| **DuckDuckGo** | Rate limited if too fast | Add delays between requests |
| **Supabase Free** | 1GB storage only | Compress videos before upload |

---

## 🛠️ SETUP CHECKLIST

- [ ] Install Ollama: `brew install ollama`
- [ ] Download vision model: `ollama pull llava:7b`
- [ ] Start Ollama: `ollama serve`
- [ ] Get Groq API key: https://console.groq.com
- [ ] Install new deps: `pip install duckduckgo-search groq`
- [ ] Create `ollama_client.py`
- [ ] Create `groq_client.py`
- [ ] Update `.env` files
- [ ] Update `vision_agent.py` (use Ollama)
- [ ] Update `trend_agent.py` (use DuckDuckGo)
- [ ] Update `caption_agent.py` (use Groq)
- [ ] Update `feedback_agent.py` (use Groq)
- [ ] Test full pipeline
- [ ] Remove old Anthropic/Tavily code

---

## 🚀 QUICK START

```bash
# 1. Install Ollama
brew install ollama

# 2. Download model
ollama pull llava:7b

# 3. Start Ollama (keep running)
ollama serve

# 4. Get Groq key
# Visit: https://console.groq.com
# Create API key

# 5. In new terminal - install deps
pip install duckduckgo-search groq requests

# 6. Update .env
echo "GROQ_API_KEY=your_groq_key" >> .env

# 7. Copy code snippets from this guide into your backend

# 8. Test!
python -m pytest tests/
```

---

## 📚 References

- **Ollama**: https://ollama.ai
- **LLaVA Vision Model**: https://llama.meta.com/docs/guides/vision
- **Groq API**: https://console.groq.com
- **DuckDuckGo Search**: https://github.com/debangshu/duckduckgo-search
- **Supabase Free**: https://supabase.com/pricing

---

## ❓ FAQ

**Q: Will results be as good as Claude?**  
A: ~85-90% as good. LLaVA is very capable for content analysis.

**Q: How much slower is Ollama?**  
A: ~3-6x slower than Claude on GPU, but still < 60s per analysis.

**Q: Can I scale this?**  
A: Yes! Use Groq Pro tier or add more Ollama servers.

**Q: What if Ollama breaks?**  
A: Fallback to Claude (paid) or use only Groq for text.

**Q: Can I use this on cloud?**  
A: Yes! Deploy Ollama on AWS, GCP, or Azure GPU instances.

---

**NOW YOU HAVE A COMPLETELY FREE STACK!** 🎉🚀
