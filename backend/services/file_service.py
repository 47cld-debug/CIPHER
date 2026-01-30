import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.config import settings

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


class FileService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.max_size_mb = settings.MAX_FILE_SIZE_MB

    async def save_certificate(self, file: UploadFile) -> Optional[str]:
        """Save certificate file and return file URL"""
        # Validate file type
        allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            raise ValueError(f"File type not allowed. Allowed: {allowed_extensions}")

        # Validate file size
        contents = await file.read()
        file_size_mb = len(contents) / (1024 * 1024)
        if file_size_mb > self.max_size_mb:
            raise ValueError(f"File size exceeds {self.max_size_mb}MB limit")

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = self.upload_dir / unique_filename

        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)

        # Return relative URL path
        return f"/uploads/certificates/{unique_filename}"

    def delete_file(self, file_url: str) -> bool:
        """Delete file by URL"""
        try:
            filename = Path(file_url).name
            file_path = self.upload_dir / filename
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception:
            return False


file_service = FileService()
