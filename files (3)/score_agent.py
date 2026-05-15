import structlog
from state import AgentState

logger = structlog.get_logger()

# Weights for IMAGE content — caption matters more since there's no pacing/motion
IMAGE_WEIGHTS = {
    "hook": 0.20,           # Visual hook (thumbnail IS the hook for images)
    "trend": 0.15,          # Trend alignment
    "caption": 0.30,        # Caption is CRITICAL for images — it's the main engagement driver
    "hook_text": 0.15,      # Text hook (first line of caption)
    "thumbnail": 0.10,      # Thumbnail = the image itself
    "visual_quality": 0.10, # Production quality
}

# Weights for VIDEO content — hook and pacing matter more
VIDEO_WEIGHTS = {
    "hook": 0.25,           # Visual hook (first 3 seconds)
    "trend": 0.15,          # Trend alignment
    "caption": 0.15,        # Caption still matters
    "hook_text": 0.10,      # Text hook
    "thumbnail": 0.15,      # Thumbnail click-through
    "visual_quality": 0.10, # Production quality
    "pacing": 0.10,         # Pacing (video only)
}

VERDICT_TEMPLATES = {
    (90, 100): "🔥 Ready to go viral — this is exceptional content",
    (80, 89): "🚀 Strong viral potential — minor tweaks will push it over",
    (70, 79): "✅ Good content — apply the suggested fixes and it could blow up",
    (60, 69): "⚡ Above average — needs work on the weakest areas",
    (50, 59): "⚠️ Average — significant improvements needed before posting",
    (40, 49): "👎 Below average — major rework needed",
    (0, 39): "❌ Not ready — rebuild from scratch",
}


def score_agent(state: AgentState) -> AgentState:
    """
    Agent 5: Score Agent (synchronous — math + verdict generation)
    
    Uses DIFFERENT weight formulas for images vs videos.
    For images: caption and text hook get much higher weight (since pacing is irrelevant).
    For videos: visual hook and pacing get higher weight.
    """
    v = state.visual_analysis
    t = state.trend_analysis
    c = state.caption_analysis

    # Gather component scores
    hook_score = v.hook_score if v else 50
    thumbnail_score = v.thumbnail_score if v else 50
    visual_quality_score = v.visual_quality_score if v else 50
    pacing_score = v.pacing_score if v else 50
    trend_score = t.trend_alignment_score if t else 50
    caption_score = c.caption_score if c else 50
    hook_text_score = c.hook_text_score if c else 50

    # Choose weights based on content type
    is_image = state.content_type.value == "image"
    
    if is_image:
        weights = IMAGE_WEIGHTS
        final = (
            hook_score * weights["hook"] +
            trend_score * weights["trend"] +
            caption_score * weights["caption"] +
            hook_text_score * weights["hook_text"] +
            thumbnail_score * weights["thumbnail"] +
            visual_quality_score * weights["visual_quality"]
        )
    else:
        weights = VIDEO_WEIGHTS
        final = (
            hook_score * weights["hook"] +
            trend_score * weights["trend"] +
            caption_score * weights["caption"] +
            hook_text_score * weights["hook_text"] +
            thumbnail_score * weights["thumbnail"] +
            visual_quality_score * weights["visual_quality"] +
            pacing_score * weights["pacing"]
        )

    # Clamp to 0-100
    state.virality_score = max(0, min(100, round(final)))

    # Generate verdict
    state.one_line_verdict = _get_verdict(state)

    logger.info(
        "Score agent complete",
        content_type=state.content_type.value,
        weight_mode="IMAGE" if is_image else "VIDEO",
        virality_score=state.virality_score,
        verdict=state.one_line_verdict,
        component_scores={
            "hook_visual": hook_score,
            "hook_text": hook_text_score,
            "trend": trend_score,
            "caption": caption_score,
            "thumbnail": thumbnail_score,
            "visual_quality": visual_quality_score,
            "pacing": pacing_score if not is_image else "N/A",
        }
    )

    return state


def _get_verdict(state: AgentState) -> str:
    """Generate a specific one-line verdict based on the score and weakest areas."""
    score = state.virality_score
    v = state.visual_analysis
    c = state.caption_analysis
    t = state.trend_analysis

    # Find the weakest and strongest area for targeted verdict
    scores = {}
    if v:
        scores["hook visuals"] = v.hook_score
        scores["thumbnail"] = v.thumbnail_score
        scores["visual quality"] = v.visual_quality_score
        if state.content_type.value != "image":
            scores["pacing"] = v.pacing_score
    if c:
        scores["caption"] = c.caption_score
        scores["hook text"] = c.hook_text_score
    if t:
        scores["trend alignment"] = t.trend_alignment_score

    if scores:
        weakest = min(scores, key=scores.get)
        weakest_score = scores[weakest]
        strongest = max(scores, key=scores.get)
        strongest_score = scores[strongest]
    else:
        weakest = "overall"
        weakest_score = score
        strongest = "overall"
        strongest_score = score

    # Score bracket template
    for (low, high), template in VERDICT_TEMPLATES.items():
        if low <= score <= high:
            if score < 70 and weakest_score < 55:
                return f"{template} — focus on: {weakest} ({weakest_score}/100)"
            elif score >= 80:
                return f"{template} — strongest: {strongest} ({strongest_score}/100)"
            return template

    return f"Score: {score}/100"
