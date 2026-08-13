from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.security import get_full_name, get_role

router = APIRouter(tags=["auth"])


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)) -> dict:
    return {
        "id": user["sub"],
        "email": user.get("email"),
        "role": get_role(user),
        "full_name": get_full_name(user),
    }
