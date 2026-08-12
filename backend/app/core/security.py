from functools import lru_cache

import jwt
from jwt import PyJWKClient

from app.core.config import settings


class InvalidTokenError(Exception):
    pass


@lru_cache
def get_jwks_client() -> PyJWKClient:
    return PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")


def verify_token(token: str) -> dict:
    try:
        signing_key = get_jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(str(exc)) from exc
