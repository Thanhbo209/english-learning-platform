import httpx

from app.core.config import settings

BUCKET = "learning-content"


class StorageError(Exception):
    pass


def _object_url(path: str) -> str:
    return f"{settings.supabase_url}/storage/v1/object/{BUCKET}/{path}"


def upload_object(token: str, path: str, data: bytes, content_type: str) -> None:
    response = httpx.post(
        _object_url(path),
        headers={
            "apikey": settings.supabase_publishable_key,
            "Authorization": f"Bearer {token}",
            "Content-Type": content_type,
        },
        content=data,
        timeout=30.0,
    )
    if response.status_code >= 400:
        raise StorageError(f"Failed to upload file to storage: {response.status_code}")


def get_object(token: str, path: str) -> bytes:
    response = httpx.get(
        _object_url(path),
        headers={
            "apikey": settings.supabase_publishable_key,
            "Authorization": f"Bearer {token}",
        },
        timeout=30.0,
    )
    if response.status_code >= 400:
        raise StorageError(f"Failed to fetch file from storage: {response.status_code}")
    return response.content
