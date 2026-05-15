import cv2
import tempfile
import os
from pathlib import Path
from typing import Optional
import structlog
import numpy as np

logger = structlog.get_logger()


class VideoProcessor:
    """
    Handles video metadata extraction only.
    Frame extraction NO LONGER NEEDED - Gemini API processes videos directly.
    """

    def get_video_metadata(self, video_path: str) -> dict:
        """Extract duration, fps, resolution from video file."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = frame_count / fps if fps > 0 else 0

        cap.release()

        return {
            "fps": fps,
            "frame_count": frame_count,
            "width": width,
            "height": height,
            "duration": round(duration, 2),
        }

    # ── REMOVED: extract_frames_for_analysis() ───────────────────────────────
    # Gemini API now processes videos directly - no frame extraction needed!
    
    # ── REMOVED: extract_frames_from_bytes() ──────────────────────────────────
    # No longer needed - Gemini handles video uploads natively
    
    # ── REMOVED: image_to_base64() ────────────────────────────────────────────
    # Gemini doesn't require base64 encoding for video files
    
    # ── REMOVED: _get_strategic_timestamps() ───────────────────────────────────
    # Strategic frame sampling no longer needed
    
    # ── REMOVED: _resize_frame() ──────────────────────────────────────────────
    # Gemini handles video resizing automatically

