from fastapi import APIRouter
from app.api.endpoints import auth, workflows, executions, datasets, health

api_router = APIRouter()

# auth.router already declares prefix="/auth" itself; including it with an
# extra prefix= here would double it up to /auth/auth/... (that was
# happening alongside this correct registration until it was removed).
api_router.include_router(auth.router)
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(executions.router, prefix="/executions", tags=["executions"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
