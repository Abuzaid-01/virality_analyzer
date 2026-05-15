from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class ScoreLevel(str, Enum):
    POOR = "poor"          # 0-39
    AVERAGE = "average"    # 40-59
    GOOD = "good"          # 60-79
    VIRAL = "viral"        # 80-100


def score_to_level(score: int) -> ScoreLevel:
    if score < 40:
        return ScoreLevel.POOR
    if score < 60:
        return ScoreLevel.AVERAGE
    if score < 80:
        return ScoreLevel.GOOD
    return ScoreLevel.VIRAL


# ── Individual agent outputs ──────────────────────────────────────────────────

class VisualAnalysis(BaseModel):
    """Vision Agent output — analyzes frames/thumbnail."""
    thumbnail_score: int = Field(..., ge=0, le=100)
    thumbnail_feedback: str
    hook_score: int = Field(..., ge=0, le=100, description="First 3 seconds score")
    hook_feedback: str
    visual_quality_score: int = Field(..., ge=0, le=100)
    visual_quality_feedback: str
    pacing_score: int = Field(..., ge=0, le=100, description="Video pacing (N/A for images = 50)")
    pacing_feedback: str
    detected_text_on_screen: Optional[list[str]] = Field(default_factory=list)
    detected_emotions: Optional[list[str]] = Field(default_factory=list)
    scene_descriptions: list[str] = Field(default_factory=list, description="Frame-by-frame scene notes")


class TrendAnalysis(BaseModel):
    """Trend Agent output — web-searched current trends."""
    trend_alignment_score: int = Field(..., ge=0, le=100)
    trend_summary: str
    trending_hashtags: list[str] = Field(default_factory=list, max_length=15)
    trending_audio_suggestions: list[str] = Field(default_factory=list, max_length=5)
    competitor_insights: Optional[str] = None
    best_posting_times: list[str] = Field(default_factory=list)
    platform_specific_tips: list[str] = Field(default_factory=list)


class CaptionAnalysis(BaseModel):
    """Caption/Hook text analysis."""
    caption_score: int = Field(..., ge=0, le=100)
    hook_text_score: int = Field(..., ge=0, le=100, description="First line / hook sentence")
    cta_present: bool
    cta_strength: Optional[str] = None
    emotion_triggers: list[str] = Field(default_factory=list)
    optimized_caption: str = Field(..., description="AI-rewritten improved caption")
    optimized_hook: str = Field(..., description="Improved first sentence/hook")
    hashtag_suggestions: list[str] = Field(default_factory=list, max_length=30)


class ImprovementPlan(BaseModel):
    """Feedback Agent output — actionable improvements."""
    priority_fixes: list[str] = Field(..., description="Top 3 things to fix NOW", max_length=3)
    quick_wins: list[str] = Field(default_factory=list, description="Easy changes for +5-10 score")
    deep_improvements: list[str] = Field(default_factory=list, description="Bigger structural changes")
    what_works: list[str] = Field(default_factory=list, description="Existing strengths to keep")
    predicted_score_after_fixes: int = Field(..., ge=0, le=100)


# ── Master analysis response ───────────────────────────────────────────────────

class ViralityAnalysis(BaseModel):
    """Full analysis result — returned to client after all agents complete."""
    analysis_id: str
    upload_id: str
    created_at: datetime

    # Overall
    virality_score: int = Field(..., ge=0, le=100)
    virality_level: ScoreLevel
    one_line_verdict: str = Field(..., description="e.g. 'Strong hook, weak caption — fix CTA'")

    # Agent outputs
    visual: VisualAnalysis
    trend: TrendAnalysis
    caption: CaptionAnalysis
    improvements: ImprovementPlan

    # Meta
    platform: str
    content_type: str
    processing_time_seconds: float


# ── Upload response ────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    upload_id: str
    file_url: str
    content_type: str
    duration_seconds: Optional[float] = None
    message: str = "Upload successful. Call /analyze with this upload_id."


# ── API error response ─────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
