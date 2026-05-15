# Go Viral AI 🚀

Go Viral AI is a full-stack, multi-agent artificial intelligence platform that predicts the virality of social media content before you post it. It acts as an elite social media manager, copywriter, and data analyst in one.

## 🌟 Features

- **Multimodal Visual Analysis:** Natively processes raw image and video bytes (no frame-extraction required) to analyze thumbnails, pacing, visual hooks, and lighting.
- **Real-Time Trend Matching:** Scours the live internet (via Tavily) to align your content with what's currently trending in your specific niche.
- **AI Copywriting:** Rewrites your captions and hooks using advanced psychological triggers (FOMO, curiosity, shock) to maximize scroll-stopping potential.
- **Actionable Feedback:** Generates a specific, prioritized improvement plan (e.g., "Re-edit the first 2 seconds to show the final result").
- **Multi-Model Architecture:** Uses Google Gemini for vision tasks and Groq (Llama 3.3) for high-speed, high-quality copywriting and logic.

## 🏗️ Tech Stack

### Frontend
- Next.js 16 (App Router)
- React & TypeScript
- Tailwind CSS & shadcn/ui
- Supabase Auth

### Backend
- Python 3.12 & FastAPI
- LangGraph (Agentic workflow orchestration)
- Supabase PostgreSQL (Storage & DB)

### AI & APIs
- **Google Gemini 2.0 Flash:** Vision Agent (watching videos/seeing images)
- **Groq Cloud (Llama-3.3-70b):** Text Agents (Copywriting, Feedback, Trend synthesis)
- **Tavily:** Live internet search for trend data

## 📁 Project Structure

```
.
├── template-webapp/    # Next.js Frontend
│   ├── app/            # App router pages (upload, analyze, auth)
│   ├── components/     # Reusable UI components
│   └── lib/            # API clients and utilities
│
└── backend/          # FastAPI Python Backend
    ├── main.py         # App entry point
    ├── graph.py        # LangGraph agent orchestration
    ├── *_agent.py      # Individual AI agents (vision, caption, trend, feedback, score)
    └── storage_service.py # Supabase integration
```

## ⚙️ Quick Start

### 1. Prerequisites
You will need API keys for the following free services:
- [Google AI Studio (Gemini)](https://aistudio.google.com/)
- [Groq Cloud](https://console.groq.com/)
- [Supabase](https://supabase.com/)
- [Tavily](https://tavily.com/)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with your keys:
   ```env
   GEMINI_API_KEY="your_gemini_key"
   GEMINI_API_KEY_FALLBACK="your_fallback_gemini_key"
   GROQ_API_KEY="your_groq_key"
   TAVILY_API_KEY="your_tavily_key"
   SUPABASE_URL="your_supabase_project_url"
   SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
   ```
5. Start the backend:
   ```bash
   fastapi dev main.py --port 8000
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd template-webapp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

## 📖 How the AI Pipeline Works

When you upload a video, it passes through 5 specialized agents via **LangGraph**:

1. **Vision Agent (Gemini):** Watches the video, scores the lighting/pacing, and writes a vivid text description of every scene and emotion.
2. **Trend Agent (Tavily + Groq):** Searches the live web for trending topics in your niche and matches them against your video.
3. **Caption Agent (Groq):** Reads the Vision Agent's scene descriptions and rewrites your caption using a strict 0-100 viral copywriting rubric.
4. **Feedback Agent (Groq):** Synthesizes all data into a 3-step prioritized action plan (e.g., "Priority Fix: Cut the first 1.5 seconds").
5. **Score Agent:** Uses mathematical weights (differentiating between images vs. videos) to calculate your final `0-100` Virality Score.

## 📜 License
MIT License
