import logging
from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import InvalidTokenError, get_role, verify_token

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    try:
        return verify_token(credentials.credentials)
    except InvalidTokenError as exc:
        logger.warning("Token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def require_role(*roles: str) -> Callable[[dict], dict]:
    def check_role(user: dict = Depends(get_current_user)) -> dict:
        if get_role(user) not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return check_role
