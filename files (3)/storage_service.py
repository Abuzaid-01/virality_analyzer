import uuid
import mimetypes
from pathlib import Path
from fastapi import UploadFile, HTTPException
from supabase_client import get_supabase
from config import settings
from request import ContentType, UploadCompleteSignal
from video_processor import VideoProcessor
import structlog
import aiofiles
import tempfile
import os

logger = structlog.get_logger()

BUCKET_NAME = "content-uploads"


class StorageService:
    def __init__(self):
        self.supabase = get_supabase()
        self.video_processor = VideoProcessor()
        self._ensure_bucket()

    def _ensure_bucket(self):
        """Create storage bucket if it doesn't exist."""
        try:
            buckets = self.supabase.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            if BUCKET_NAME not in bucket_names:
                self.supabase.storage.create_bucket(
                    BUCKET_NAME,
                    options={"public": True, "file_size_limit": settings.max_file_size_bytes},
                )
                logger.info("Created storage bucket", bucket=BUCKET_NAME)
        except Exception as e:
            logger.warning("Could not verify bucket", error=str(e))

    async def upload_file(self, file: UploadFile, user_id: str) -> UploadCompleteSignal:
        """
        1. Validate file type and size
        2. Save to temp disk
        3. Extract metadata (video) or dimensions (image)
        4. Upload to Supabase Storage
        5. Return UploadCompleteSignal
        """
        # ── Validate mime type ────────────────────────────────────────────────
        mime_type = file.content_type or "application/octet-stream"
        is_video = mime_type in settings.allowed_video_list
        is_image = mime_type in settings.allowed_image_list

        if not (is_video or is_image):
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type: {mime_type}. Allowed: video/mp4, image/jpeg, image/png, etc.",
            )

        content_type = ContentType.VIDEO if is_video else ContentType.IMAGE

        # ── Read & size check ─────────────────────────────────────────────────
        content = await file.read()
        if len(content) > settings.max_file_size_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max {settings.max_file_size_mb}MB allowed.",
            )

        # ── Save to temp file ─────────────────────────────────────────────────
        suffix = mimetypes.guess_extension(mime_type) or ".bin"
        upload_id = str(uuid.uuid4())

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            # ── Extract metadata ──────────────────────────────────────────────
            duration = None
            width = height = None

            if is_video:
                meta = self.video_processor.get_video_metadata(tmp_path)
                duration = meta.get("duration")
                width = meta.get("width")
                height = meta.get("height")
            else:
                from PIL import Image
                with Image.open(tmp_path) as img:
                    width, height = img.size

            # ── Upload to Supabase Storage ────────────────────────────────────
            storage_path = f"{user_id}/{upload_id}{suffix}"
            self.supabase.storage.from_(BUCKET_NAME).upload(
                path=storage_path,
                file=content,
                file_options={"content-type": mime_type},
            )

            file_url = self.supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)

            # ── Persist upload record to DB ───────────────────────────────────
            self.supabase.table("uploads").insert({
                "id": upload_id,
                "user_id": user_id,
                "file_url": file_url,
                "storage_path": storage_path,
                "content_type": content_type.value,
                "mime_type": mime_type,
                "file_size_bytes": len(content),
                "duration_seconds": duration,
                "width": width,
                "height": height,
            }).execute()

            logger.info(
                "File uploaded",
                upload_id=upload_id,
                content_type=content_type,
                size=len(content),
                duration=duration,
            )

            return UploadCompleteSignal(
                upload_id=upload_id,
                file_url=file_url,
                content_type=content_type,
                mime_type=mime_type,
                file_size_bytes=len(content),
                duration_seconds=duration,
                width=width,
                height=height,
            )

        finally:
            os.unlink(tmp_path)

    def get_upload_record(self, upload_id: str) -> dict:
        """Fetch upload metadata from DB."""
        result = (
            self.supabase.table("uploads")
            .select("*")
            .eq("id", upload_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Upload {upload_id} not found.")
        return result.data

    def download_file_bytes(self, storage_path: str) -> bytes:
        """Download file bytes from Supabase Storage for agent processing."""
        return self.supabase.storage.from_(BUCKET_NAME).download(storage_path)
