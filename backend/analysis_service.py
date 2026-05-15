import uuid
import time
from datetime import datetime, timezone
import structlog

from supabase_client import get_supabase
from storage_service import StorageService
from video_processor import VideoProcessor
from graph import run_analysis_pipeline
from state import AgentState
from request import AnalyzeRequest, ContentType
from response import ViralityAnalysis, score_to_level

logger = structlog.get_logger()


class AnalysisService:
    def __init__(self):
        self.supabase = get_supabase()
        self.storage = StorageService()
        self.video_processor = VideoProcessor()

    async def run_analysis(
        self,
        request: AnalyzeRequest,
        user_id: str,
    ) -> ViralityAnalysis:
        """
        Full pipeline:
        1. Load upload record from DB
        2. Get metadata from Supabase
        3. Build initial AgentState (no frame extraction - Gemini processes videos directly)
        4. Run LangGraph multi-agent pipeline
        5. Persist results to DB
        6. Return ViralityAnalysis
        """
        start_time = time.time()
        analysis_id = str(uuid.uuid4())

        # ── 1. Load upload record ─────────────────────────────────────────────
        upload = self.storage.get_upload_record(request.upload_id)
        logger.info("Starting analysis", analysis_id=analysis_id, upload_id=request.upload_id)

        # ── 2. Parse content type ─────────────────────────────────────────────
        content_type = ContentType(upload["content_type"])

        # ── 3. Build initial state ────────────────────────────────────────────
        # NOTE: No frame extraction needed - Gemini API processes videos directly
        initial_state = AgentState(
            upload_id=request.upload_id,
            user_id=user_id,
            file_url=upload["file_url"],
            storage_path=upload["storage_path"],
            content_type=content_type,
            mime_type=upload["mime_type"],
            duration_seconds=upload.get("duration_seconds"),
            width=upload.get("width"),
            height=upload.get("height"),
            caption=request.caption,
            platform=request.platform,
            niche=request.niche,
            competitor_urls=request.competitor_urls or [],
        )

        # ── 4. Run multi-agent pipeline ───────────────────────────────────────
        try:
            final_state = await run_analysis_pipeline(initial_state)
            logger.info("Analysis pipeline complete", analysis_id=analysis_id)
        except Exception as e:
            logger.error("Analysis pipeline failed", analysis_id=analysis_id, error=str(e))
            raise

        # ── 5. Persist to DB ──────────────────────────────────────────────────
        processing_time = round(time.time() - start_time, 2)

        analysis_record = {
            "id": analysis_id,
            "user_id": user_id,
            "upload_id": request.upload_id,
            "platform": request.platform.value,
            "niche": request.niche,
            "caption": request.caption,
            "virality_score": final_state.virality_score,
            "one_line_verdict": final_state.one_line_verdict,
            "visual_analysis": final_state.visual_analysis.model_dump() if final_state.visual_analysis else None,
            "trend_analysis": final_state.trend_analysis.model_dump() if final_state.trend_analysis else None,
            "caption_analysis": final_state.caption_analysis.model_dump() if final_state.caption_analysis else None,
            "improvement_plan": final_state.improvement_plan.model_dump() if final_state.improvement_plan else None,
            "processing_time_seconds": processing_time,
            "errors": final_state.errors,
        }

        self.supabase.table("analyses").insert(analysis_record).execute()

        logger.info(
            "Analysis persisted",
            analysis_id=analysis_id,
            score=final_state.virality_score,
            time=processing_time,
        )

        # ── 6. Build and return response ──────────────────────────────────────
        return ViralityAnalysis(
            analysis_id=analysis_id,
            upload_id=request.upload_id,
            created_at=datetime.now(timezone.utc),
            virality_score=final_state.virality_score or 50,
            virality_level=score_to_level(final_state.virality_score or 50),
            one_line_verdict=final_state.one_line_verdict or "Analysis complete.",
            visual=final_state.visual_analysis,
            trend=final_state.trend_analysis,
            caption=final_state.caption_analysis,
            improvements=final_state.improvement_plan,
            platform=request.platform.value,
            content_type=content_type.value,
            processing_time_seconds=processing_time,
        )

    def get_analysis(self, analysis_id: str, user_id: str) -> dict:
        """Retrieve a past analysis from DB."""
        result = (
            self.supabase.table("analyses")
            .select("*")
            .eq("id", analysis_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not result.data:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Analysis not found.")
        return result.data

    def list_analyses(self, user_id: str, limit: int = 20) -> list:
        """List user's recent analyses."""
        result = (
            self.supabase.table("analyses")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []
