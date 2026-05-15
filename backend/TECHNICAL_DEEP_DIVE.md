# Go Viral AI — Complete Technical Deep Dive

> **Purpose:** This document explains every layer of the Go Viral AI system so you can confidently present it to anyone — interviewers, professors, or collaborators.

---

## 1. What Does This Project Do?

Go Viral AI is a **multi-agent AI system** that analyzes social media content (photos & videos) and predicts how likely it is to go viral. It gives creators:

- A **Virality Score** out of 100
- An **optimized caption** rewritten for maximum engagement
- **Trending hashtags** based on live internet data
- **Specific, actionable feedback** on what to fix before posting
- **Best posting times** for their platform

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│                   Next.js 16 Frontend (React)                    │
│              localhost:3000 / Vercel deployment                   │
└──────────────┬───────────────────────────────────┬───────────────┘
               │ POST /upload (multipart file)     │ POST /analyze (JSON)
               ▼                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND (Python)                     │
│                        localhost:8000                             │
│                                                                  │
│  ┌─────────┐   ┌──────────────┐   ┌───────────────────────────┐ │
│  │ upload  │──▶│StorageService│──▶│  Supabase Storage (S3)    │ │
│  │ .py     │   │   .py        │   │  (content-uploads bucket) │ │
│  └─────────┘   └──────────────┘   └───────────────────────────┘ │
│                                                                  │
│  ┌─────────┐   ┌──────────────┐   ┌───────────────────────────┐ │
│  │analyze  │──▶│AnalysisServ. │──▶│  LangGraph Agent Pipeline │ │
│  │ .py     │   │   .py        │   │  (5 specialized agents)   │ │
│  └─────────┘   └──────────────┘   └───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ Google Gemini│ │  Groq Cloud  │ │    Tavily    │
     │  (Vision AI) │ │ (Llama 3.3)  │ │ (Web Search) │
     │  sees photos │ │writes captions│ │finds trends  │
     └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 3. Tech Stack

| Layer | Technology | Why We Chose It |
|-------|-----------|-----------------|
| **Frontend** | Next.js 16 + React + TypeScript | Server-side rendering, fast dev experience |
| **UI Library** | shadcn/ui + Tailwind CSS | Premium, accessible UI components |
| **Backend API** | FastAPI (Python) | Async-native, auto-generates API docs at `/docs` |
| **Agent Orchestration** | LangGraph | Manages multi-agent state machine with directed graph |
| **Vision AI** | Google Gemini 2.5 Flash Lite | Natively multimodal — processes raw image/video bytes |
| **Text AI** | Groq Cloud (Llama 3.3 70B) | Ultra-fast inference (~200ms), excellent copywriting |
| **Web Search** | Tavily API | AI-optimized search engine for real-time trend data |
| **Database** | Supabase (PostgreSQL) | Managed Postgres + Auth + Storage in one platform |
| **File Storage** | Supabase Storage (S3-compatible) | Stores uploaded photos/videos in `content-uploads` bucket |
| **Auth** | Supabase Auth (JWT) | Handles signup/login, generates JWT access tokens |
| **Config** | Pydantic Settings | Type-safe `.env` loading with validation |
| **Logging** | structlog | Structured JSON logging for debugging |

---

## 4. Database Schema (Supabase PostgreSQL)

### Table: `uploads`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique upload identifier |
| `user_id` | UUID (FK) | Links to `auth.users` |
| `file_url` | TEXT | Public URL of file in Supabase Storage |
| `storage_path` | TEXT | Internal path: `{user_id}/{upload_id}.jpg` |
| `content_type` | TEXT | `"image"` or `"video"` |
| `mime_type` | TEXT | e.g. `image/jpeg`, `video/mp4` |
| `file_size_bytes` | INT | File size |
| `duration_seconds` | FLOAT | Video duration (null for images) |
| `width` / `height` | INT | Dimensions in pixels |
| `created_at` | TIMESTAMP | Auto-set on insert |

### Table: `analyses`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique analysis identifier |
| `user_id` | UUID (FK) | Who requested it |
| `upload_id` | UUID (FK) | Which upload was analyzed |
| `platform` | TEXT | Target platform (tiktok, instagram, etc.) |
| `virality_score` | INT | Final weighted score 0-100 |
| `one_line_verdict` | TEXT | e.g. "🚀 Strong viral potential" |
| `visual_analysis` | JSONB | Full Vision Agent output |
| `trend_analysis` | JSONB | Full Trend Agent output |
| `caption_analysis` | JSONB | Full Caption Agent output |
| `improvement_plan` | JSONB | Full Feedback Agent output |
| `processing_time_seconds` | FLOAT | Total pipeline time |
| `errors` | JSONB | Any agent errors |

---

## 5. Complete Request Lifecycle (Step-by-Step)

### Phase 1: User Opens the App
1. Browser loads `localhost:3000/analyze` → Next.js renders the upload form
2. `AuthContext` checks Supabase for an active session (JWT token)
3. User selects a file, types a caption, picks a platform (e.g., Instagram), and optionally enters a niche (e.g., "cricket")

### Phase 2: File Upload (`POST /upload`)
4. Frontend calls `uploadContent(file)` in `api.ts`
5. `getAuthHeaders()` races `supabase.auth.getSession()` against a 3-second timeout
6. Frontend sends `multipart/form-data` POST to `http://localhost:8000/upload`
7. **Backend `upload.py`** receives the file:
   - `get_user_id()` extracts user UUID from the JWT Bearer token
   - Creates a `StorageService` instance
8. **`StorageService.upload_file()`** executes:
   - Validates MIME type against allowed list (jpeg, png, mp4, etc.)
   - Reads file bytes, checks size limit (50MB max)
   - Saves to a temp file on disk
   - If **image**: uses `Pillow` to extract width × height
   - If **video**: uses `VideoProcessor` to extract duration, dimensions
   - Uploads bytes to Supabase Storage bucket `content-uploads` at path `{user_id}/{upload_id}.jpg`
   - Gets public URL from Supabase
   - Inserts a record into the `uploads` database table
   - Returns `UploadCompleteSignal` with `upload_id` and `file_url`
9. Backend responds with JSON: `{ upload_id: "abc-123", file_url: "https://...", content_type: "image" }`

### Phase 3: AI Analysis (`POST /analyze`)
10. Frontend receives `upload_id`, immediately calls `analyzeContent({ upload_id, caption, platform, niche })`
11. **Backend `analyze.py`** receives the request:
    - Validates user via `get_user_id()`
    - Creates `AnalysisService` instance
12. **`AnalysisService.run_analysis()`** orchestrates the full pipeline:
    - Fetches the upload record from the `uploads` table
    - Builds an `AgentState` object (the shared state that flows through all agents)
    - Calls `run_analysis_pipeline(initial_state)` → this invokes the LangGraph graph

### Phase 4: LangGraph Multi-Agent Pipeline
13. The compiled LangGraph state machine executes agents in sequence:

```
START → Vision Agent → Trend Agent → Caption Agent → Feedback Agent → Score Agent → END
```

Each agent reads from `AgentState`, does its work, writes results back to `AgentState`, and passes it to the next agent.

### Phase 5: Results
14. `AnalysisService` receives the completed `AgentState`
15. Persists the full analysis to the `analyses` database table
16. Returns `ViralityAnalysis` JSON response to the frontend
17. Frontend transitions from "Analyzing..." animation to the Results screen

---

## 6. The 5 AI Agents — Deep Technical Breakdown

### Agent 1: Vision Agent 👁️
- **File:** `vision_agent.py`
- **AI Model:** Google Gemini 2.5 Flash Lite
- **What it does:** Actually "sees" the uploaded content
- **Technical flow:**
  1. Downloads the image/video bytes from Supabase Storage URL using `httpx`
  2. Constructs a multimodal prompt with scoring instructions
  3. Sends `[text_prompt, { mime_type, data: raw_bytes }]` to Gemini
  4. Gemini returns JSON with 4 scores + feedback
- **Outputs written to state:**
  - `thumbnail_score` (0-100) + feedback
  - `hook_score` (0-100) — would you keep watching?
  - `visual_quality_score` (0-100) — lighting, sharpness, composition
  - `pacing_score` (0-100) — editing rhythm (video only)
  - `detected_text_on_screen` — any text overlays found
  - `detected_emotions` — emotions conveyed (excited, curious, etc.)
  - `scene_descriptions` — what's happening in the content

### Agent 2: Trend Agent 📈
- **File:** `trend_agent.py`
- **AI Models:** Tavily (search) + Groq Llama 3.3 70B (synthesis)
- **What it does:** Searches the live internet for current trends
- **Technical flow:**
  1. Constructs 3 search queries (e.g., "trending cricket content instagram 2025")
  2. Sends queries to Tavily API (`search_depth="basic"`, 3 results each)
  3. Collects ~9 real search results with titles and content
  4. Sends all results + content context to Groq/Llama for synthesis
  5. Llama analyzes how well the content aligns with what's trending RIGHT NOW
- **Outputs:**
  - `trend_alignment_score` (0-100)
  - `trending_hashtags` — 15 platform-specific hashtags
  - `trending_audio_suggestions` — 5 sounds that fit
  - `competitor_insights` — what top creators do differently
  - `best_posting_times` — e.g., "Tuesday 7-9 PM EST"
  - `platform_specific_tips` — algorithm tips

### Agent 3: Caption Agent ✍️
- **File:** `caption_agent.py`
- **AI Model:** Groq Cloud (Llama 3.3 70B Versatile)
- **What it does:** Scores the original caption and rewrites it for maximum virality
- **Technical flow:**
  1. Reads emotions + on-screen text from Vision Agent
  2. Reads trending hashtags from Trend Agent
  3. Builds a prompt with a **strict scoring rubric** (specific criteria for each score band)
  4. Sends to Groq with `response_format={"type": "json_object"}` for guaranteed valid JSON
  5. `temperature=0.5` for consistent, reproducible scoring
- **Scoring Rubric (enforced in prompt):**
  - 90-100: Killer hook + emotional triggers + CTA + strategic hashtags + storytelling
  - 75-89: Most elements present. Strong hook, good emotion, has CTA.
  - 60-74: Decent hook OR emotion, but missing CTA/hashtag strategy.
  - 45-59: Generic. No real hook, no CTA, no emotional pull.
  - 30-44: Very weak. Just a description.
- **Outputs:**
  - `caption_score` (0-100) — original caption quality
  - `hook_text_score` (0-100) — first line effectiveness
  - `cta_present` — boolean
  - `emotion_triggers` — what psychological triggers are used
  - `optimized_caption` — complete rewrite (must score 80+ on the rubric)
  - `optimized_hook` — just the first sentence, rewritten
  - `hashtag_suggestions` — up to 30 hashtags

### Agent 4: Feedback Agent 🎯
- **File:** `feedback_agent.py`
- **AI Model:** Groq Cloud (Llama 3.3 70B Versatile)
- **What it does:** Reads ALL previous agent outputs and creates a specific action plan
- **Technical flow:**
  1. Gathers every score and piece of feedback from Agents 1-3
  2. Sends a synthesis prompt asking for brutally specific advice
  3. "Improve your hook" = BAD feedback. "Start with your most shocking result in the first frame" = GOOD feedback.
- **Outputs:**
  - `priority_fixes` — Top 3 most impactful changes
  - `quick_wins` — Changes that take under 5 minutes
  - `deep_improvements` — Structural changes for long-term growth
  - `what_works` — Existing strengths to keep
  - `predicted_score_after_fixes` — realistic score if fixes are applied

### Agent 5: Score Agent 🧮
- **File:** `score_agent.py`
- **AI Model:** None — pure math
- **What it does:** Calculates the final weighted virality score
- **Key innovation:** Uses **different weight formulas** for images vs. videos

**Image Weights** (caption matters more since there's no pacing/motion):
| Component | Weight |
|-----------|--------|
| Visual Hook | 20% |
| Caption Score | **30%** |
| Hook Text Score | **15%** |
| Trend Alignment | 15% |
| Thumbnail | 10% |
| Visual Quality | 10% |

**Video Weights** (visual hook and pacing matter more):
| Component | Weight |
|-----------|--------|
| Visual Hook | 25% |
| Caption Score | 15% |
| Hook Text Score | 10% |
| Trend Alignment | 15% |
| Thumbnail | 15% |
| Visual Quality | 10% |
| Pacing | 10% |

**Formula:** `final_score = Σ(component_score × weight)` clamped to 0-100.

---

## 7. The Multi-Model Architecture

This project uses a **specialized multi-model architecture** — different AI models handle different tasks based on their strengths:

```
┌─────────────────────────────────────────────────────┐
│              WHO DOES WHAT?                          │
├──────────────────┬──────────────────────────────────┤
│ Google Gemini    │ The "Eyes" — sees photos/videos  │
│ (Vision Agent)   │ Only model that can process raw  │
│                  │ image/video bytes natively        │
├──────────────────┼──────────────────────────────────┤
│ Groq / Llama 3.3 │ The "Brain & Voice" — writes     │
│ (Caption, Trend, │ captions, synthesizes trends,    │
│  Feedback Agents)│ creates coaching feedback        │
│                  │ Ultra-fast: ~200ms inference     │
├──────────────────┼──────────────────────────────────┤
│ Tavily           │ The "Researcher" — searches the  │
│ (Trend Agent)    │ live internet for current trends  │
├──────────────────┼──────────────────────────────────┤
│ Score Agent      │ Pure math — no AI model needed   │
└──────────────────┴──────────────────────────────────┘
```

**Why not use one model for everything?**
1. **Rate Limits:** Splitting across providers prevents hitting any single API's rate limit
2. **Specialization:** Gemini is best at vision. Llama 3.3 is best at writing. Use the right tool for the job.
3. **Redundancy:** If Google goes down, only the Vision Agent fails. Text agents keep working.
4. **Cost:** Groq's free tier is extremely fast and generous.

---

## 8. LangGraph — How the Agent Pipeline Works

LangGraph (by LangChain) is a framework for building **stateful, multi-agent workflows** as directed graphs.

### Key Concepts:
- **StateGraph:** A directed graph where nodes are agents and edges define execution order
- **AgentState:** A Pydantic model that acts as shared memory — each agent reads and writes to it
- **Compile:** The graph is compiled once at startup into an optimized execution plan

### Our Graph Topology (from `graph.py`):
```python
graph = StateGraph(AgentState)

# Register 5 agent nodes
graph.add_node("vision_agent", vision_agent)
graph.add_node("trend_agent", trend_agent)
graph.add_node("caption_agent", caption_agent)
graph.add_node("feedback_agent", feedback_agent)
graph.add_node("score_agent", score_agent)

# Define execution order
graph.set_entry_point("vision_agent")
graph.add_edge("vision_agent", "trend_agent")
graph.add_edge("trend_agent", "caption_agent")
graph.add_edge("caption_agent", "feedback_agent")
graph.add_edge("feedback_agent", "score_agent")
graph.add_edge("score_agent", END)
```

### Execution:
```python
final_state = await graph.ainvoke(initial_state)
# Returns completed AgentState with all fields filled
```

---

## 9. Key Files Reference

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS config, route registration, startup lifecycle |
| `config.py` | Pydantic Settings — loads all API keys from `.env` |
| `upload.py` | `POST /upload` endpoint + JWT auth extraction |
| `analyze.py` | `POST /analyze` endpoint |
| `storage_service.py` | File upload to Supabase Storage + DB persistence |
| `analysis_service.py` | Orchestrates: load upload → build state → run pipeline → persist results |
| `graph.py` | LangGraph pipeline definition and compilation |
| `state.py` | `AgentState` Pydantic model (shared memory between agents) |
| `vision_agent.py` | Agent 1: Gemini vision analysis |
| `trend_agent.py` | Agent 2: Tavily search + Groq trend synthesis |
| `caption_agent.py` | Agent 3: Groq caption scoring and optimization |
| `feedback_agent.py` | Agent 4: Groq feedback synthesis |
| `score_agent.py` | Agent 5: Mathematical score calculation |
| `response.py` | All Pydantic response models (`ViralityAnalysis`, etc.) |
| `request.py` | Request models (`AnalyzeRequest`, `Platform`, `ContentType`) |
| `supabase_client.py` | Singleton Supabase client initialization |
| `gemini_client.py` | Gemini model constants and initialization |

---

## 10. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Service health check (Supabase, Gemini, Tavily status) |
| `POST` | `/upload` | Upload image/video, returns `upload_id` |
| `POST` | `/analyze` | Trigger full 5-agent analysis pipeline |
| `GET` | `/analyze/{id}` | Retrieve a past analysis by ID |
| `GET` | `/analyze` | List user's recent analyses |

---

## 11. Environment Variables

| Variable | Service | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google AI Studio | Yes |
| `GROQ_API_KEY` | Groq Cloud | Yes |
| `SUPABASE_URL` | Supabase Dashboard | Yes |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Yes |
| `TAVILY_API_KEY` | Tavily | Optional (falls back to static data) |
| `CORS_ORIGINS` | N/A | `http://localhost:3000` |
| `MAX_FILE_SIZE_MB` | N/A | Default: 50 |

---

*Document generated for Go Viral AI — Multi-Agent Content Virality Analyzer*
