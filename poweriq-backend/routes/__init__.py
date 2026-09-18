from .machines import router as machines_router
from .power import router as power_router
from .calendar import router as calendar_router
from .generator import router as generator_router
from .alerts import router as alerts_router
from .supervisor import router as supervisor_router

__all__ = [
    "machines_router",
    "power_router",
    "calendar_router",
    "generator_router",
    "alerts_router",
    "supervisor_router",
]
