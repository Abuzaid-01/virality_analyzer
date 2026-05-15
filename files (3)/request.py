from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ContentType(str, Enum):
    VIDEO = "video"
    IMAGE = "image"


class Platform(str, Enum):
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    YOUTUBE_SHORTS = "youtube_shorts"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"


class AnalyzeRequest(BaseModel):
    """Sent by client after uploading a file to trigger full AI analysis."""
    upload_id: str = Field(..., description="UUID returned by /upload endpoint")
    caption: Optional[str] = Field(None, max_length=2200, description="Post caption text")
    platform: Platform = Field(Platform.TIKTOK, description="Target platform")
    niche: Optional[str] = Field(None, max_length=100, description="Content niche, e.g. 'fitness', 'cooking'")
    competitor_urls: Optional[list[str]] = Field(
        default_factory=list,
        max_length=3,
        description="Up to 3 competitor post URLs for comparison"
    )


class UploadCompleteSignal(BaseModel):
    """Internal use — what storage service returns after upload."""
    upload_id: str
    file_url: str
    content_type: ContentType
    mime_type: str
    file_size_bytes: int
    duration_seconds: Optional[float] = None  # video only
    width: Optional[int] = None
    height: Optional[int] = None
