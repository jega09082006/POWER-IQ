"""Run the PowerIQ FastAPI backend from the repository root."""

import runpy
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).parent / "poweriq-backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

runpy.run_path(str(BACKEND_DIR / "main.py"), run_name="__main__")
