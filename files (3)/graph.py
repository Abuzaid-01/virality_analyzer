"""
Multi-Agent Pipeline using LangGraph

Graph topology:
  START → vision_agent ─┬→ caption_agent → feedback_agent → score_agent → END
                        └→ trend_agent  ─┘

vision_agent and trend_agent run in parallel (both feed into caption + feedback).
"""

import time
import asyncio
import structlog
from langgraph.graph import StateGraph, END
from typing import Any

from state import AgentState
from vision_agent import vision_agent
from trend_agent import trend_agent
from caption_agent import caption_agent
from feedback_agent import feedback_agent
from score_agent import score_agent

logger = structlog.get_logger()


def _sync_score_agent(state: AgentState) -> AgentState:
    """Wrap sync score_agent for LangGraph compatibility."""
    return score_agent(state)


def build_agent_graph() -> StateGraph:
    """Build and compile the LangGraph multi-agent pipeline."""

    graph = StateGraph(AgentState)

    # ── Register nodes ────────────────────────────────────────────────────────
    graph.add_node("vision_agent", vision_agent)
    graph.add_node("trend_agent", trend_agent)
    graph.add_node("caption_agent", caption_agent)
    graph.add_node("feedback_agent", feedback_agent)
    graph.add_node("score_agent", _sync_score_agent)

    # ── Entry point ───────────────────────────────────────────────────────────
    # Both vision and trend start simultaneously from START
    graph.set_entry_point("vision_agent")

    # ── Edges ─────────────────────────────────────────────────────────────────
    # Vision agent runs first (its output feeds caption agent)
    graph.add_edge("vision_agent", "trend_agent")  # Then trend runs
    graph.add_edge("trend_agent", "caption_agent")  # Both done → caption
    graph.add_edge("caption_agent", "feedback_agent")
    graph.add_edge("feedback_agent", "score_agent")
    graph.add_edge("score_agent", END)

    return graph.compile()


# Singleton compiled graph
_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_agent_graph()
        logger.info("LangGraph agent pipeline compiled")
    return _compiled_graph


async def run_analysis_pipeline(initial_state: AgentState) -> AgentState:
    """
    Run the full multi-agent analysis pipeline.
    Returns the completed state with all agent outputs.
    """
    graph = get_graph()
    start_time = time.time()

    logger.info(
        "Starting analysis pipeline",
        upload_id=initial_state.upload_id,
        platform=initial_state.platform,
        content_type=initial_state.content_type,
    )

    try:
        # LangGraph invoke — runs the full graph
        final_state = await graph.ainvoke(initial_state)

        elapsed = time.time() - start_time
        logger.info(
            "Pipeline complete",
            upload_id=initial_state.upload_id,
            virality_score=final_state.get("virality_score"),
            elapsed_seconds=round(elapsed, 2),
            errors=final_state.get("errors", []),
        )

        return AgentState(**final_state)

    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(
            "Pipeline failed",
            upload_id=initial_state.upload_id,
            error=str(e),
            elapsed_seconds=round(elapsed, 2),
        )
        raise
