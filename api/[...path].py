"""Expose the FastAPI backend through Vercel's Python runtime."""

import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent.parent / "poweriq-backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app

