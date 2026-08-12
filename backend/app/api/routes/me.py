from fastapi import APIRouter, Depends

from app.api.deps import get_current_user

router = APIRouter(tags=["auth"])


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)) -> dict:
    return {"id": user["sub"], "email": user.get("email")}
