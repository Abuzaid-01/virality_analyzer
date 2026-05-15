import json
import structlog
from groq import Groq
from config import settings
from state import AgentState
from response import CaptionAnalysis

logger = structlog.get_logger()

# Use Groq with Llama 3.3 for superior text generation and instruction following
GROQ_MODEL = "llama-3.3-70b-versatile"

CAPTION_SYSTEM_PROMPT = """You are a viral copywriter who has written captions for content with 100M+ views.
You understand hooks, emotional triggers, CTAs, and platform-specific caption strategies deeply.

IMPORTANT SCORING RULES — you MUST follow this rubric exactly:

CAPTION SCORE RUBRIC (caption_score):
- 90-100: Has ALL of: killer hook (first line stops the scroll), emotional triggers, clear CTA, strategic hashtags, storytelling structure, perfect platform tone
- 75-89: Has MOST of the above. Strong hook, good emotion, has CTA. Minor improvements possible.
- 60-74: Has a decent hook OR emotional trigger, but missing CTA or hashtag strategy. Functional but forgettable.
- 45-59: Generic caption. No real hook, no CTA, no emotional pull. Would scroll past it.
- 30-44: Very weak. Just a statement or description. No engagement strategy at all.
- 0-29: Empty, irrelevant, or actively harmful to engagement.

HOOK TEXT SCORE RUBRIC (hook_text_score):
- 90-100: First sentence creates INSTANT curiosity, shock, or FOMO. Impossible to scroll past. Under 10 words.
- 75-89: Strong opening that grabs attention. Makes you want to read more.
- 60-74: Decent opening but doesn't stop the scroll. Could be stronger.
- 45-59: Weak opening. Starts with a generic statement.
- 30-44: No real hook. Just starts talking.
- 0-29: No opening hook at all.

A caption like "Two bowlers. One mission." with emojis and no CTA should score 45-55 MAX.
A caption with a killer hook, emotional storytelling, strategic hashtags, AND a clear CTA should score 80+.

Always respond with valid JSON only. No markdown, no preamble."""

CAPTION_PROMPT = """Analyze and optimize this social media caption for {platform}:

ORIGINAL CAPTION:
{caption}

DETAILED VISUAL CONTEXT (what the photo/video actually shows):
- Content type: {content_type}
- Scene description: {scene_descriptions}
- Emotions conveyed: {emotions}
- Text visible on screen: {on_screen_text}
- Visual quality notes: {visual_feedback}
- Trending hashtags available: {trending_hashtags}

STEP 1: Score the ORIGINAL caption using the rubric strictly.
Check each element:
- Does it have a scroll-stopping hook in the first line? (Y/N)
- Does it use emotional triggers? (Y/N, which ones?)
- Does it have a Call-to-Action? (Y/N, how strong?)
- Are hashtags strategic and platform-appropriate? (Y/N)
- Is the tone right for {platform}? (Y/N)

STEP 2: Generate an OPTIMIZED caption that fixes ALL weaknesses.
The optimized version MUST include:
- A completely rewritten first line that creates curiosity/shock/FOMO
- At least 2 emotional triggers (curiosity, FOMO, humor, shock, pride, belonging)
- A clear CTA at the end (ask a question, request a comment/share/save)
- Strategic use of line breaks for readability
- The creator's authentic voice (not robotic marketing speak)

Return a JSON object with EXACTLY this structure:
{{
  "caption_score": <0-100 int — score the ORIGINAL using the rubric above>,
  "hook_text_score": <0-100 int — score the ORIGINAL first line using rubric above>,
  "cta_present": <true/false — does the ORIGINAL have a CTA?>,
  "cta_strength": "<null if no CTA, or 'weak', 'moderate', 'strong'>",
  "emotion_triggers": ["<psychological triggers in the ORIGINAL: curiosity, FOMO, humor, shock, etc>"],
  "optimized_caption": "<COMPLETE rewritten caption — must score at least 80+ if re-analyzed>",
  "optimized_hook": "<just the first sentence rewritten — must score 85+ on hook rubric>",
  "hashtag_suggestions": ["<up to 30 hashtags ordered by relevance>"]
}}

For {platform}: {platform_hook_guidance}"""

PLATFORM_GUIDANCE = {
    "tiktok": "TikTok hooks must be conversational and punchy. Use 'POV:', 'No one talks about', 'The reason I...', or questions that demand answers.",
    "instagram": "Instagram captions can be longer. Lead with emotion, story, or bold statement. Use line breaks. End with clear CTA.",
    "youtube_shorts": "YouTube Shorts hooks should tease the payoff immediately. 'Watch till the end' still works. Create a 'knowledge gap'.",
    "twitter": "Twitter is about hot takes and thread hooks. Be controversial or counterintuitive. Under 280 chars core message.",
    "linkedin": "LinkedIn hooks should challenge professional assumptions. 'I was wrong about X' or '5 years ago I...' style works well.",
}

NO_CAPTION_PROMPT = """No caption was provided. Generate an optimal caption for this content:

Platform: {platform}
Content type: {content_type}
Visual context:
- Detected emotions: {emotions}
- On-screen text: {on_screen_text}
- Content niche: {niche}

Since no caption exists, set caption_score to 0 and hook_text_score to 0.
Generate an amazing original caption and hook that would score 85+ on the rubric.
Return the same JSON structure."""


async def caption_agent(state: AgentState) -> AgentState:
    """
    Agent 3: Caption Agent (using Groq / Llama 3.3)
    
    - Analyzes caption effectiveness with strict scoring rubric
    - Scores hook strength, CTA, emotion triggers
    - Rewrites caption for maximum virality
    - Writes CaptionAnalysis to state
    """
    logger.info("Caption agent starting (Groq/Llama)", has_caption=bool(state.caption))

    # Initialize Groq
    client = Groq(api_key=settings.groq_api_key)

    # Gather rich context from previous agents
    emotions = []
    on_screen_text = []
    scene_descriptions = []
    visual_feedback = ""
    trending_hashtags = []

    if state.visual_analysis:
        emotions = state.visual_analysis.detected_emotions or []
        on_screen_text = state.visual_analysis.detected_text_on_screen or []
        scene_descriptions = state.visual_analysis.scene_descriptions or []
        visual_feedback = state.visual_analysis.thumbnail_feedback or ""

    if state.trend_analysis:
        trending_hashtags = state.trend_analysis.trending_hashtags[:10]

    platform_guidance = PLATFORM_GUIDANCE.get(state.platform.value, "Create engaging, platform-appropriate content.")

    try:
        if state.caption:
            prompt_content = CAPTION_PROMPT.format(
                platform=state.platform.value,
                caption=state.caption,
                content_type=state.content_type.value,
                scene_descriptions=" | ".join(scene_descriptions) if scene_descriptions else "not available",
                emotions=", ".join(emotions) if emotions else "not detected",
                on_screen_text=", ".join(on_screen_text) if on_screen_text else "none",
                visual_feedback=visual_feedback or "not available",
                trending_hashtags=", ".join(trending_hashtags) if trending_hashtags else "see trend analysis",
                platform_hook_guidance=platform_guidance,
            )
        else:
            prompt_content = NO_CAPTION_PROMPT.format(
                platform=state.platform.value,
                content_type=state.content_type.value,
                emotions=", ".join(emotions) if emotions else "not detected",
                on_screen_text=", ".join(on_screen_text) if on_screen_text else "none",
                niche=state.niche or "general",
            )

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": CAPTION_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt_content
                }
            ],
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.5,  # Lower temperature = more consistent scoring
        )

        raw = chat_completion.choices[0].message.content.strip()

        data = json.loads(raw)
        state.caption_analysis = CaptionAnalysis(**data)

        logger.info(
            "Caption agent complete",
            caption_score=state.caption_analysis.caption_score,
            hook_score=state.caption_analysis.hook_text_score,
            cta=state.caption_analysis.cta_present,
        )

    except Exception as e:
        logger.error("Caption agent error", error=str(e))
        state.errors.append(f"caption_agent: {str(e)}")
        state.caption_analysis = CaptionAnalysis(
            caption_score=50,
            hook_text_score=50,
            cta_present=False,
            emotion_triggers=[],
            optimized_caption=state.caption or "Add a compelling caption here.",
            optimized_hook="Hook text could not be generated.",
            hashtag_suggestions=["#fyp", "#viral", f"#{state.niche or 'trending'}"],
        )

    return state
