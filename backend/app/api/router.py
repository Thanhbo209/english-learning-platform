from fastapi import APIRouter

from app.api.routes.assignments import router as assignments_router
from app.api.routes.classrooms import router as classrooms_router
from app.api.routes.health import router as health_router
from app.api.routes.learning_content import router as learning_content_router
from app.api.routes.me import router as me_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(me_router)
api_router.include_router(classrooms_router)
api_router.include_router(learning_content_router)
api_router.include_router(assignments_router)
