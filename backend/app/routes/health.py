"""Health check endpoint."""

from __future__ import annotations

from fastapi import APIRouter
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return health status of AutoLearn backend."""
    return HealthResponse(status="ok", service="autolearn-backend")

