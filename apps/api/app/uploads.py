import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_upload(file: UploadFile) -> tuple[bytes, str, str]:
    """Validates and saves an uploaded image. Returns (bytes, content_type, relative_path)."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{file.content_type}'. Use JPEG, PNG, or WebP.",
        )

    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large. Max size is {settings.max_upload_bytes // (1024 * 1024)}MB.",
        )
    if len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    extension = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[file.content_type]
    filename = f"{uuid.uuid4().hex}.{extension}"
    path = upload_dir() / filename
    path.write_bytes(content)

    return content, file.content_type, f"uploads/{filename}"
