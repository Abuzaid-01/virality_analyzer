from typing import Optional, Annotated
from langgraph.graph.message import add_messages
from pydantic import BaseModel
from request import ContentType, Platform
from response import (
    VisualAnalysis,
    TrendAnalysis,
    CaptionAnalysis,
    ImprovementPlan,
)


class AgentState(BaseModel):
    """
    Shared state flowing through the LangGraph multi-agent pipeline.
    Each agent reads what it needs and writes its output back.
    
    Note: frames field removed - Gemini API processes videos directly
    """
    # ── Input context ─────────────────────────────────────────────────────────
    upload_id: str
    user_id: str
    file_url: str
    storage_path: str
    content_type: ContentType
    mime_type: str
    duration_seconds: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    caption: Optional[str] = None
    platform: Platform = Platform.TIKTOK
    niche: Optional[str] = None
    competitor_urls: list[str] = []

    # ── REMOVED: frames field ──────────────────────────────────────────────────
    # No longer needed - Gemini processes video files directly from storage_path

    # ── Agent outputs (filled progressively) ─────────────────────────────────
    visual_analysis: Optional[VisualAnalysis] = None
    trend_analysis: Optional[TrendAnalysis] = None
    caption_analysis: Optional[CaptionAnalysis] = None
    improvement_plan: Optional[ImprovementPlan] = None

    # ── Final score (set by score agent) ─────────────────────────────────────
    virality_score: Optional[int] = None
    one_line_verdict: Optional[str] = None

    # ── Error tracking ────────────────────────────────────────────────────────
    errors: list[str] = []

    class Config:
        arbitrary_types_allowed = True
