from fastapi import APIRouter, Depends, HTTPException
from upload import get_user_id
from analysis_service import AnalysisService
from request import AnalyzeRequest
from response import ViralityAnalysis, ErrorResponse
import structlog

router = APIRouter(prefix="/analyze", tags=["analyze"])
logger = structlog.get_logger()


@router.post("", response_model=ViralityAnalysis)
async def analyze_content(
    request: AnalyzeRequest,
    user_id: str = Depends(get_user_id),
):
    """
    Trigger full multi-agent virality analysis.

    Steps internally:
    1. Load uploaded file from storage
    2. Extract frames (video) or prepare image
    3. Run Vision Agent → Trend Agent → Caption Agent → Feedback Agent → Score Agent
    4. Return complete ViralityAnalysis

    Takes 15-45 seconds depending on video length.
    """
    logger.info("Analyze request", upload_id=request.upload_id, user=user_id)

    try:
        service = AnalysisService()
        result = await service.run_analysis(request, user_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Analysis failed", error=str(e), upload_id=request.upload_id)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/{analysis_id}", response_model=dict)
async def get_analysis(
    analysis_id: str,
    user_id: str = Depends(get_user_id),
):
    """Retrieve a previously completed analysis."""
    service = AnalysisService()
    return service.get_analysis(analysis_id, user_id)


@router.get("", response_model=list)
async def list_analyses(
    user_id: str = Depends(get_user_id),
    limit: int = 20,
):
    """List user's recent analyses."""
    service = AnalysisService()
    return service.list_analyses(user_id, limit)
