"""Common Pydantic models for AutoLearn."""

from __future__ import annotations

from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
    message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "autolearn-backend"

