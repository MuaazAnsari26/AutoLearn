"""Dataset Pydantic schemas for AutoLearn."""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DatasetSample(BaseModel):
    id: str
    string: str
    label: int = Field(..., ge=0, le=1)
    true_label: Optional[int] = Field(None, ge=0, le=1)
    source: str = "generated"
    is_noisy: bool = False


class GenerateDatasetRequest(BaseModel):
    language_id: str = Field(default="contains_01")
    sample_count: int = Field(default=100, ge=1, le=5000)
    min_length: int = Field(default=0, ge=0, le=50)
    max_length: int = Field(default=10, ge=0, le=50)
    positive_ratio: float = Field(default=0.5, ge=0.0, le=1.0)
    noise_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    seed: Optional[int] = None


class ValidateDatasetRequest(BaseModel):
    samples: List[DatasetSample]
    alphabet: Optional[List[str]] = Field(default_factory=lambda: ["0", "1"])


class LanguageInfo(BaseModel):
    id: str
    name: str
    description: str
    alphabet: List[str]
    reference_state_count: int

