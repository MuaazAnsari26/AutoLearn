"""Application configuration."""

from __future__ import annotations

import os
from typing import List


class Settings:
    PROJECT_NAME: str = "AutoLearn API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # CORS origins
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()

