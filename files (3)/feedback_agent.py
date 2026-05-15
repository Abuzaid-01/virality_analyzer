import json
import structlog
from groq import Groq
from config import settings
from state import AgentState
from response import ImprovementPlan

logger = structlog.get_logger()

GROQ_MODEL = "llama-3.3-70b-versatile"

FEEDBACK_SYSTEM_PROMPT = """You are a brutal but constructive content coach who has helped 1000+ creators grow to 1M+ followers.
You give specific, actionable feedback — never vague platitudes.
'Improve your hook' is bad feedback. 'Start with your most shocking result in the first frame' is good feedback.
Always respond with valid JSON only."""

FEEDBACK_PROMPT = """Synthesize all analysis into a prioritized improvement plan.

FULL ANALYSIS SUMMARY:
Visual Analysis:
- Thumbnail score: {thumbnail_score}/100 — {thumbnail_feedback}
- Hook score: {hook_score}/100 — {hook_feedback}  
- Visual quality: {visual_quality_score}/100 — {visual_quality_feedback}
- Pacing: {pacing_score}/100 — {pacing_feedback}

Trend Alignment:
- Trend score: {trend_score}/100 — {trend_summary}
- Platform tips: {platform_tips}

Caption Analysis:
- Caption score: {caption_score}/100
- Hook text score: {hook_text_score}/100
- CTA present: {cta_present}
- Detected emotions: {emotions}

Platform: {platform}
Content type: {content_type}
Niche: {niche}

Return a JSON object with EXACTLY this structure:
{{
  "priority_fixes": [
    "<Fix #1: The single most impactful change — be VERY specific, e.g.: 'Replace your thumbnail with a close-up of your shocked face — static product shots get 60% less clicks'>",
    "<Fix #2: Second most impactful — specific action>",
    "<Fix #3: Third most impactful — specific action>"
  ],
  "quick_wins": [
    "<Change that takes under 5 minutes and boosts score — e.g.: 'Add 3 trending hashtags from the list above'>",
    "<Another quick win>",
    "<Another quick win>"
  ],
  "deep_improvements": [
    "<Structural change needed — e.g.: 'Re-edit the first 2 seconds: cut straight to the most dramatic moment, not the intro'>",
    "<Another deep improvement>"
  ],
  "what_works": [
    "<What's already strong — be specific: 'Your lighting is professional quality, keep it'>",
    "<Another strength>"
  ],
  "predicted_score_after_fixes": <0-100 int — realistic score if priority_fixes are applied>
}}

Priority fixes must be specific enough that a creator knows EXACTLY what to do.
what_works must identify real strengths to keep confidence up while improving."""


async def feedback_agent(state: AgentState) -> AgentState:
    """
    Agent 4: Feedback Agent (using Groq / Llama 3)
    
    - Reads all previous agent outputs
    - Synthesizes into prioritized, specific improvement plan
    - Predicts score after fixes
    - Writes ImprovementPlan to state
    """
    logger.info("Feedback agent starting (Groq/Llama)", upload_id=state.upload_id)

    # Initialize Groq
    client = Groq(api_key=settings.groq_api_key)

    # Gather all outputs from prior agents
    v = state.visual_analysis
    t = state.trend_analysis
    c = state.caption_analysis

    try:
        prompt_content = FEEDBACK_PROMPT.format(
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
            emotions=", ".join(c.emotion_triggers) if c else "none detected",
            platform=state.platform.value,
            content_type=state.content_type.value,
            niche=state.niche or "general",
        )

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": FEEDBACK_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt_content
                }
            ],
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        raw = chat_completion.choices[0].message.content.strip()

        data = json.loads(raw)
        state.improvement_plan = ImprovementPlan(**data)

        logger.info(
            "Feedback agent complete",
            upload_id=state.upload_id,
            predicted_score=state.improvement_plan.predicted_score_after_fixes,
            priority_fixes=len(state.improvement_plan.priority_fixes),
        )

    except Exception as e:
        logger.error("Feedback agent error", error=str(e))
        state.errors.append(f"feedback_agent: {str(e)}")
        state.improvement_plan = ImprovementPlan(
            priority_fixes=["Improve visual hook", "Optimize caption", "Add trending hashtags"],
            quick_wins=["Add hashtags from trend suggestions"],
            deep_improvements=["Re-edit opening 3 seconds for stronger hook"],
            what_works=["Content has potential"],
            predicted_score_after_fixes=65,
        )

    return state
