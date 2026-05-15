# Go Viral — AI Virality Analyzer Backend

## Stack
- **FastAPI** — API layer
- **Claude claude-sonnet-4-20250514** — Vision + text AI
- **Supabase** — Storage + PostgreSQL
- **OpenCV / ffmpeg** — Video frame extraction
- **LangGraph** — Multi-agent orchestration (agents layer)

## Folder Structure
```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── upload.py       # File upload → Supabase Storage
│   │       ├── analyze.py      # Trigger full analysis pipeline
│   │       └── health.py       # Health check
│   ├── core/
│   │   ├── config.py           # Env vars, settings
│   │   ├── supabase_client.py  # Supabase init
│   │   └── anthropic_client.py # Claude client init
│   ├── models/
│   │   ├── request.py          # Pydantic input schemas
│   │   └── response.py         # Pydantic output schemas
│   ├── services/
│   │   ├── storage_service.py  # Upload/retrieve from Supabase
│   │   ├── video_processor.py  # Extract frames, metadata
│   │   └── analysis_service.py # Calls agents pipeline
│   ├── agents/                 # LangGraph multi-agent system
│   │   ├── graph.py            # Agent graph orchestration
│   │   ├── vision_agent.py     # Sees video/image frames
│   │   ├── trend_agent.py      # Web search trend analysis
│   │   ├── feedback_agent.py   # Actionable improvement agent
│   │   ├── score_agent.py      # Final virality scorer
│   │   └── state.py            # Shared LangGraph state
│   └── main.py                 # FastAPI app entry point
├── requirements.txt
├── .env.example
└── supabase_migrations/
    └── 001_analyses.sql
```

## Setup
```bash
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
